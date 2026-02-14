# Backend (Python service)

FastAPI backend managed with [uv](https://docs.astral.sh/uv/) and packageable as a Docker image.

## Setup

```bash
cd backend
uv sync
```

**Chat (Gemini):** Set `GOOGLE_API_KEY` for real LLM responses. If it is not set, chat uses **mock** responses (no API key needed). Set `MOCK_CHAT=1` to force mock mode even when a key is present.

## Run locally

```bash
uv run uvicorn app.main:app --reload
```

API: http://127.0.0.1:8000 — docs at http://127.0.0.1:8000/docs

## Docker

```bash
docker build -t backend .
docker run -p 8000:8000 backend
```

## Commands

| Command | Description |
|--------|-------------|
| `uv run uvicorn app.main:app --reload` | Run the API (dev) |
| `uv sync` | Install/sync dependencies from `pyproject.toml` and `uv.lock` |
| `uv add <package>` | Add a runtime dependency |
| `uv add --dev <package>` | Add a dev dependency |
| `uv lock` | Refresh lockfile after editing `pyproject.toml` |
| `uv run pytest` | Run unit tests |
| `uv run ruff check .` | Lint |

Commit `uv.lock` so everyone gets the same dependency versions.
