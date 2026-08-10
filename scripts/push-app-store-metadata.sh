#!/usr/bin/env bash
# Explicit external mutation: sync approved metadata to App Store Connect.
# Never stores the App Review password on disk or in shell history.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

npm run prepare:app-store-submit

read -r -s -p "App Review account password (not stored): " APP_STORE_REVIEW_PASSWORD
echo
if [[ -z "$APP_STORE_REVIEW_PASSWORD" ]]; then
  echo "error: App Review password is required for metadata sync"
  exit 1
fi
export APP_STORE_REVIEW_PASSWORD
trap 'unset APP_STORE_REVIEW_PASSWORD' EXIT

npx --yes eas-cli metadata:lint --profile production
npx --yes eas-cli metadata:push --profile production

echo "Metadata synced. Verify every field, screenshot, age-rating answer, and credential in App Store Connect."
