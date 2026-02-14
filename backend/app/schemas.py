"""Request/response schemas for the API."""

from typing import Any

from pydantic import BaseModel


class SessionResponse(BaseModel):
    """Response after creating a new session."""

    session_id: str


class MessageOut(BaseModel):
    """A single message in conversation history."""

    role: str
    content: str


class ChatRequest(BaseModel):
    """Request body for sending a chat message."""

    session_id: str
    message: str


class ChatStreamRequest(BaseModel):
    """Request body for streaming chat (AI SDK sends session_id + messages, id, trigger, messageId)."""

    session_id: str
    message: str | None = None
    messages: list[dict[str, Any]] | None = None
    id: str | None = None
    trigger: str | None = None
    messageId: str | None = None


class ChatResponse(BaseModel):
    """Response with the assistant's reply."""

    message: str
