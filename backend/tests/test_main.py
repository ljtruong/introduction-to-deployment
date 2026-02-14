"""Unit tests for app.main."""

from unittest.mock import patch

from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, AIMessageChunk

from app.main import app

client = TestClient(app)


def _mock_invoke(*args, **kwargs):
    return {"messages": [AIMessage(content="Mocked reply")]}


async def _mock_astream(*args, **kwargs):
    yield (AIMessageChunk(content="Mocked stream"), {})


def test_root_returns_greeting() -> None:
    """GET / returns a JSON greeting."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from backend!"}


def test_health_returns_ok() -> None:
    """GET /health returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_session_returns_session_id() -> None:
    """POST /sessions creates a new session and returns a session_id."""
    response = client.post("/sessions")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["session_id"]) == 36


@patch("app.main._use_mock_chat", return_value=False)
@patch("app.main.chat_graph")
def test_chat_appends_to_session_and_returns_reply(mock_graph, _mock_use_mock) -> None:
    """POST /chat with session_id appends message and returns assistant reply."""
    mock_graph.invoke = _mock_invoke
    create = client.post("/sessions")
    session_id = create.json()["session_id"]
    response = client.post(
        "/chat", json={"session_id": session_id, "message": "Hello"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Mocked reply"


@patch("app.main._use_mock_chat", return_value=False)
@patch("app.main.chat_graph")
def test_sessions_are_isolated(mock_graph, _mock_use_mock) -> None:
    """Messages in one session do not appear in another."""
    mock_graph.invoke = _mock_invoke
    a = client.post("/sessions").json()["session_id"]
    b = client.post("/sessions").json()["session_id"]
    client.post("/chat", json={"session_id": a, "message": "Only in A"})
    messages_b = client.get(f"/sessions/{b}/messages").json()
    assert len(messages_b) == 0
    messages_a = client.get(f"/sessions/{a}/messages").json()
    assert len(messages_a) == 2
    assert messages_a[0]["role"] == "user" and messages_a[0]["content"] == "Only in A"
    assert messages_a[1]["role"] == "assistant"


def test_get_messages_returns_404_for_unknown_session() -> None:
    """GET /sessions/{session_id}/messages returns 404 when session does not exist."""
    response = client.get("/sessions/00000000-0000-0000-0000-000000000000/messages")
    assert response.status_code == 404


@patch("app.main._use_mock_chat", return_value=False)
@patch("app.main.chat_graph")
def test_chat_stream_returns_plain_text_stream(mock_graph, _mock_use_mock) -> None:
    """POST /chat/stream with session_id and messages streams assistant reply as plain text."""
    mock_graph.astream = _mock_astream
    create = client.post("/sessions")
    session_id = create.json()["session_id"]
    body = {
        "session_id": session_id,
        "messages": [
            {"id": "1", "role": "user", "parts": [{"type": "text", "text": "Hi"}]},
        ],
    }
    response = client.post("/chat/stream", json=body)
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")
    assert "Mocked stream" in response.text
