#!/bin/bash

set -euo pipefail

TAG=${1:-}
APP=${2:-}

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

CMD="gcloud run deploy $APP-$TAG \
  --region $REGION \
  --image $REPOSITORY/$APP-$TAG:latest \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --min-instances 1 \
  --concurrency 1"

eval $CMD

echo "Deployed $APP-$TAG to $REGION"
