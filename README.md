# Introduction to Deployment

A small chat app: a **backend** (FastAPI, Python) and a **frontend** (Vite, React) that talk over HTTP. The backend handles sessions and streaming chat (mock or Gemini); the frontend is a single-page chat UI.

**Contents**

- [Requires](#requires)
- [How to start the backend](#how-to-start-the-backend)
- [How to start the frontend](#how-to-start-the-frontend)
- [Deployment (GCP Cloud Run)](#deployment-gcp-cloud-run)

## Requires

- **[uv](https://docs.astral.sh/uv/)** — Python package manager and runner for the backend
- **Node.js** (LTS) — for the frontend build and dev server. [install](https://nodejs.org/en/download)
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate` or install from [pnpm.io](https://pnpm.io)
- **Docker** (optional) — for building and running backend/frontend images; see `backend/README.md` and `frontend/README.md`
- **gcp cli** `brew install --cask gcloud-cli`

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


## Deployment (GCP Cloud Run)

Authenticate and set the project:

```bash
gcloud auth login
gcloud config set project monash-deployment-intro
```

Build and deploy the backend, then note the Cloud Run URL:

```bash
./scripts/build.sh <your-name> backend push
./scripts/deploy.sh <your-name> backend
```

Build the frontend with that backend URL, then deploy:

```bash
./scripts/build.sh <your-name> frontend push <backend-url>
./scripts/deploy.sh <your-name> frontend
```

Open the frontend URL from the deploy output to use the app.
