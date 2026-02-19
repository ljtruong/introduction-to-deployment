#!/bin/bash -xv

set -euo pipefail

TAG=${1:-""}
APP=${2:-""}
PUSH=${3:-""}
BFF_URL=${4:-""}

if [[ -z "$BFF_URL" && "$APP" == "frontend" ]]; then
    echo "BFF_URL is required for frontend builds"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -z "$TAG" ]]; then
    echo "TAG is required. Should be your name"
    exit 1
fi

REGION=australia-southeast1
PROJECT_ID=monash-deployment-intro
REPOSITORY=${REGION}-docker.pkg.dev/${PROJECT_ID}/${PROJECT_ID}-containers

if [[ "$APP" == "backend" ]]; then
    DOCKERFILE="$REPO_ROOT/backend/Dockerfile"
elif [[ "$APP" == "frontend" ]]; then
    DOCKERFILE="$REPO_ROOT/frontend/Dockerfile"
else
    echo "Usage: $0 <tag> <backend|frontend> [push] [BFF_URL]"
    exit 1
fi

FRONTEND_BUILD_ARGS=()
if [[ "$APP" == "frontend" ]]; then
    FRONTEND_BUILD_ARGS=(--build-arg "VITE_API_BACKEND_URL=$BFF_URL")
fi

docker buildx build \
    --platform linux/amd64 \
    --provenance=false \
    --sbom=false \
    --load \
    -f "$DOCKERFILE" "$REPO_ROOT/$APP" \
    ${FRONTEND_BUILD_ARGS[@]+"${FRONTEND_BUILD_ARGS[@]}"} \
    -t ${REPOSITORY}/${APP}-${TAG}:latest

if [[ "$PUSH" == "push" ]]; then
    gcloud auth configure-docker ${REGION}-docker.pkg.dev
    docker push ${REPOSITORY}/${APP}-${TAG}:latest
else 
    echo "Not pushing image to repository"
    echo "To push, run: ./scripts/build.sh ${TAG} ${APP} push"
fi
