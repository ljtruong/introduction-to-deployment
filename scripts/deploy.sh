#!/bin/bash

set -euo pipefail

TAG=${1:-}
APP=${2:-}
USE_GEMINI=${3:-}

if [[ -z "$TAG" ]]; then
    echo "TAG is required. Should be your name"
    exit 1
fi

if [[ -z "$APP" ]]; then
    echo "APP is required. Should be backend or frontend"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ID=monash-deployment-intro
REGION=australia-southeast1
REPOSITORY=${REGION}-docker.pkg.dev/${PROJECT_ID}/${PROJECT_ID}-containers

SECRETS_ARGS=""
if [[ "$USE_GEMINI" == "true" && "$APP" == "backend" ]]; then
  SECRETS_ARGS="--set-secrets=GOOGLE_API_KEY=GOOGLE_API_KEY:latest"
fi

CMD="gcloud run deploy $APP-$TAG \
  --region $REGION \
  --image $REPOSITORY/$APP-$TAG:latest \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --min-instances 1 \
  --concurrency 1 \
  $SECRETS_ARGS"

eval $CMD

echo "Deployed $APP-$TAG to $REGION"
