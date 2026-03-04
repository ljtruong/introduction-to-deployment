# Introduction to Deployment

A small chat app: a **backend** (FastAPI, Python) and a **frontend** (Vite, React) that talk over HTTP. The backend handles sessions and streaming chat (mock or Gemini); the frontend is a single-page chat UI.

**Contents**

- [Requires](#requires)
- [Deployment (GCP Cloud Run)](#deployment-gcp-cloud-run)
- [Local development](#local-development)

## Requires

- **[uv](https://docs.astral.sh/uv/)** — Python package manager and runner for the backend
- **Node.js** (LTS) — for the frontend build and dev server. [install](https://nodejs.org/en/download)
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate` or install from [pnpm.io](https://pnpm.io)
- **Docker** (optional) — for building and running backend/frontend images; see `backend/README.md` and `frontend/README.md`
- **gcp cli** `brew install --cask gcloud-cli`


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

## Google MCP setup (optional)

Install google MCP
```bash
claude mcp add gcloud-mcp -- npx -y @google-cloud/gcloud-mcp
```

## Local development

See **`backend/README.md`** and **`frontend/README.md`** for running the backend and frontend locally (including Docker, env vars, and tests).
