#!/bin/bash

set -euo pipefail

USER_EMAIL=${1:-""}
PROJECT_ID=${2:-"monash-deployment-intro"}

if [[ -z "$USER_EMAIL" ]]; then
  echo "USER_EMAIL is required"
  exit 1
fi

# grant user access to write to docker registry
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/artifactregistry.writer"

# grant user access to deploy to and manage Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/run.admin"

# grant user access to access secret manager
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# grant user access to read from secret manager
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/run.admin"

# grant user access to view logs (e.g. gcloud logging read, Cloud Console Logs)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:$USER_EMAIL" \
  --role="roles/logging.viewer"

# grant user access to use developer role for cloud run
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="user:$USER_EMAIL" \
  --role="roles/iam.serviceAccountUser"
