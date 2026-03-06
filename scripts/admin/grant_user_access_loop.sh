#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SECRETS_FILE="$SCRIPT_DIR/.secrets"
if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "Missing $SECRETS_FILE (one user per line: email or \"Name <email>\")"
  exit 1
fi
USERS=()
while IFS= read -r line; do
  USERS+=( "$line" )
done < "$SECRETS_FILE"

for USER in "${USERS[@]}"; do
  [[ -z "${USER// }" ]] && continue
  # Extract email from "Name <email>" or use whole string if no angle brackets
  if [[ "$USER" =~ \<([^>]+)\> ]]; then
    EMAIL="${BASH_REMATCH[1]}"
  else
    EMAIL="$USER"
  fi
  echo "Granting access to $EMAIL"
  bash "$SCRIPT_DIR/grant_user_access.sh" "$EMAIL" "monash-deployment-intro"
done

echo "All users granted access"
