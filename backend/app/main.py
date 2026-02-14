"""FastAPI application entry point."""

import asyncio
import logging
import os
import time
import uuid
from collections.abc import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.chat_graph import chat_graph, last_message_content, session_to_messages
from app.schemas import ChatRequest, ChatResponse, ChatStreamRequest, MessageOut, SessionResponse

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Backend",
    version="0.1.0",
    description="Python backend service",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Origin", "Content-Type"],
)

# In-memory session store: session_id -> list of {role, content}. Isolated per user/session.
_sessions: dict[str, list[dict[str, str]]] = {}

MAX_SESSION_MESSAGES = 50


def _get_or_create_messages(session_id: str) -> list[dict[str, str]]:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def _trim_messages(session_id: str) -> None:
    """Keep only the last MAX_SESSION_MESSAGES to avoid unbounded memory use."""
    messages = _sessions.get(session_id)
    if messages and len(messages) > MAX_SESSION_MESSAGES:
        _sessions[session_id] = messages[-MAX_SESSION_MESSAGES:]


def _use_mock_chat() -> bool:
    """Use mock chat responses when API key is missing or MOCK_CHAT is set."""
    if not os.environ.get("GOOGLE_API_KEY", "").strip():
        return True
    return os.environ.get("MOCK_CHAT", "").lower() in ("1", "true", "yes")


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Hello from backend!"}


@app.get("/health")
def health() -> dict[str, str]:
    """Health check for orchestration and load balancers."""
    return {"status": "ok"}


@app.post("/sessions", response_model=SessionResponse)
def create_session() -> SessionResponse:
    """Create a new conversation session. Each user/tab should call this on load."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = []
    return SessionResponse(session_id=session_id)


@app.get("/sessions/{session_id}/messages", response_model=list[MessageOut])
def get_session_messages(session_id: str) -> list[MessageOut]:
    """Return the message history for a session (last 50 only). 404 if session does not exist."""
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = _sessions[session_id][-MAX_SESSION_MESSAGES:]
    return [MessageOut(role=m["role"], content=m["content"]) for m in messages]


def _get_mock_response_text(user_text: str) -> str:
    """Return a larger block of mock text for testing layout and scrolling."""
    return f"""You asked: "{user_text}"

Here is a longer mock response so you can test scrolling and layout.

**First paragraph.** Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

**Second paragraph.** Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

**Third paragraph.** This block includes:
- A bullet list item one
- A bullet list item two
- A bullet list item three

And a final sentence to make the mock response substantial enough for scroll testing. You can verify that the chat history scrolls correctly and that the loading state and text area behave as expected."""


def _extract_user_text(req: ChatStreamRequest) -> str:
    """Get the latest user message text (supports message or messages from AI SDK with parts)."""
    if req.message:
        return req.message
    if req.messages:
        last = req.messages[-1]
        if isinstance(last.get("content"), str):
            return last["content"]
        for part in last.get("parts") or []:
            if part.get("type") == "text" and "text" in part:
                return part["text"]
        return ""
    return ""


async def _stream_mock(
    session_id: str, user_text: str
) -> AsyncGenerator[bytes, None]:
    """Yield a mock assistant reply in chunks and append it to the session."""
    await asyncio.sleep(1.5)  # Simulate response delay
    content = _get_mock_response_text(user_text)
    # Stream in line-sized chunks to simulate real streaming
    for line in content.splitlines(keepends=True):
        yield line.encode("utf-8")
        await asyncio.sleep(0.05)  # Small delay between chunks
    _get_or_create_messages(session_id).append(
        {"role": "assistant", "content": content}
    )
    _trim_messages(session_id)


def _chat_with_graph(session_id: str, langchain_messages: list) -> str:
    """Invoke chat graph and return last message content. Raises on missing key or LLM errors."""
    state = chat_graph.invoke({"messages": langchain_messages})
    return last_message_content(state)


async def _stream_chat(
    session_id: str, langchain_messages: list
) -> AsyncGenerator[bytes, None]:
    """Stream assistant reply from graph; collect full content and append to session when done."""
    full_content: list[str] = []
    try:
        async for message_chunk, _metadata in chat_graph.astream(
            {"messages": langchain_messages}, stream_mode="messages"
        ):
            content = getattr(message_chunk, "content", None) or ""
            if content:
                full_content.append(content)
                yield content.encode("utf-8")
        # Append assistant reply to session after stream completes.
        if full_content:
            _get_or_create_messages(session_id).append(
                {"role": "assistant", "content": "".join(full_content)}
            )
            _trim_messages(session_id)
    except Exception as e:
        logger.exception("Chat stream error")
        yield "Error: Service unavailable.\n".encode("utf-8")


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    """Append user message to the session and return an assistant reply. Session is created if missing."""
    messages = _get_or_create_messages(request.session_id)
    messages.append({"role": "user", "content": request.message})
    if _use_mock_chat():
        time.sleep(1.5)  # Simulate response delay
        assistant_content = _get_mock_response_text(request.message)
        messages.append({"role": "assistant", "content": assistant_content})
        _trim_messages(request.session_id)
        return ChatResponse(message=assistant_content)
    langchain_messages = session_to_messages(messages)
    try:
        assistant_content = _chat_with_graph(request.session_id, langchain_messages)
    except Exception as e:
        logger.exception("Chat error")
        raise HTTPException(status_code=503, detail="Service unavailable") from e
    messages.append({"role": "assistant", "content": assistant_content})
    _trim_messages(request.session_id)
    return ChatResponse(message=assistant_content)


@app.post("/chat/stream")
async def chat_stream(request: ChatStreamRequest) -> StreamingResponse:
    """Stream assistant reply as plain text. Accepts session_id + message or session_id + messages (AI SDK)."""
    user_text = _extract_user_text(request)
    messages = _get_or_create_messages(request.session_id)
    messages.append({"role": "user", "content": user_text})
    if _use_mock_chat():
        return StreamingResponse(
            _stream_mock(request.session_id, user_text),
            media_type="text/plain; charset=utf-8",
        )
    langchain_messages = session_to_messages(messages)
    try:
        return StreamingResponse(
            _stream_chat(request.session_id, langchain_messages),
            media_type="text/plain; charset=utf-8",
        )
    except Exception as e:
        logger.exception("Chat stream setup error")
        raise HTTPException(status_code=503, detail="Service unavailable") from e
