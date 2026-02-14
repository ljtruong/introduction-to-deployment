# Introduction to Deployment

A small chat app: a **backend** (FastAPI, Python) and a **frontend** (Vite, React) that talk over HTTP. The backend handles sessions and streaming chat (mock or Gemini); the frontend is a single-page chat UI.

## How to start the backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

API: **http://localhost:8000** — docs at http://localhost:8000/docs  

Set `GOOGLE_API_KEY` for real LLM responses; without it, chat uses mock responses.

## How to start the frontend

With the backend already running:

```bash
cd frontend
pnpm install
pnpm dev
```

Open **http://localhost:5173**. The dev server proxies `/sessions` and `/chat` to the backend.

For more (Docker, env vars, tests), see `backend/README.md` and `frontend/README.md`.
