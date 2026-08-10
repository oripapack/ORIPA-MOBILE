#!/usr/bin/env bash
# External mutation: uploads one exact verified EAS build to App Store Connect.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

npm run prepare:testflight-upload

EAS_BUILD_ID="$(node -p "require('./app-store/release/provenance.local.json').easBuildId")"
read -r -p "Type UPLOAD TESTFLIGHT to upload EAS build $EAS_BUILD_ID: " CONFIRMATION
if [[ "$CONFIRMATION" != "UPLOAD TESTFLIGHT" ]]; then
  echo "Upload canceled."
  exit 1
fi

npx --yes eas-cli submit \
  --platform ios \
  --profile production \
  --id "$EAS_BUILD_ID" \
  --wait

echo "Binary upload finished. Wait for App Store Connect processing before TestFlight QA."
