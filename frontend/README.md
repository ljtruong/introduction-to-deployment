# Frontend (Chat UI)

Vite + React + TypeScript chat UI. Uses pnpm, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com) components, and the [Vercel AI SDK](https://ai-sdk.dev) (`useChat` with `TextStreamChatTransport`) for streaming chat. Talks to the backend for sessions and chat.

## Setup

```bash
cd frontend
pnpm install
```

## Run

### Running with the backend

Start the backend first (from repo root or `backend/`):

```bash
cd backend && uv run uvicorn app.main:app --reload
```

Backend runs on **http://localhost:8000**. Then start the frontend:

```bash
pnpm dev
```

Open **http://localhost:5173**. In dev, the Vite proxy forwards `/sessions`, `/chat`, and `/chat/stream` to the backend. If the backend has no `GOOGLE_API_KEY` set, it uses **mock** chat responses so integration works without an API key.

To point at a different backend (e.g. without the proxy), set `VITE_API_BASE_URL` (e.g. `VITE_API_BASE_URL=http://localhost:8000`).

## Docker

Build and run the frontend as a static site served by nginx:

```bash
cd frontend
docker build -t frontend .
docker run -p 5173:80 frontend
```

Open **http://localhost:5173**. The app uses relative URLs by default; to point at a backend when running in Docker, build with a build arg: `docker build --build-arg VITE_API_BASE_URL=http://your-backend:8000 -t frontend .`

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `pnpm dev`    | Start dev server         |
| `pnpm build`  | Production build         |
| `pnpm preview`| Preview production build |
| `pnpm test`   | Run tests (watch)        |
| `pnpm test:run` | Run tests once        |

## Tests

Unit tests use Vitest and React Testing Library. Run with `pnpm test` or `pnpm test:run`.
