"""LangGraph chat graph backed by Gemini."""

import operator
from typing import Annotated, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, START, StateGraph
from app.config import config
# State: messages list with reducer so the node can append the assistant reply.
class State(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]


def _create_model() -> ChatGoogleGenerativeAI:
    """Create Gemini chat model. Uses GOOGLE_API_KEY from environment."""

    google_api_key = config.google_api_key
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=google_api_key,
    )


def _chat_node(state: State) -> dict[str, list[BaseMessage]]:
    """Node: invoke LLM on conversation history and return new assistant message."""
    model = _create_model()
    response = model.invoke(state["messages"])
    return {"messages": [response]}


def _build_graph():
    graph = StateGraph(State)
    graph.add_node("chat", _chat_node)
    graph.add_edge(START, "chat")
    graph.add_edge("chat", END)
    return graph.compile()


# Compiled graph for sync invoke and async astream.
chat_graph = _build_graph()


def session_to_messages(session: list[dict[str, str]]) -> list[BaseMessage]:
    """Convert session list of {role, content} to LangChain HumanMessage/AIMessage."""
    out: list[BaseMessage] = []
    for m in session:
        role, content = m.get("role", "user"), m.get("content", "")
        if role == "user":
            out.append(HumanMessage(content=content))
        else:
            out.append(AIMessage(content=content))
    return out


def last_message_content(state: dict) -> str:
    """Get the last message's content from graph state (assistant reply)."""
    messages = state.get("messages") or []
    if not messages:
        return ""
    last = messages[-1]
    return getattr(last, "content", "") or ""
