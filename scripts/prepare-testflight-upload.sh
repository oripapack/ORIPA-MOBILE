#!/usr/bin/env bash
# Validation-only handoff. This script never uploads a binary.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

npm run check:release
node scripts/check-app-store-readiness.mjs --testflight
node scripts/app-store-provenance.mjs

EAS_BUILD_ID="$(node -p "require('./app-store/release/provenance.local.json').easBuildId")"
APP_BUILD_VERSION="$(node -p "require('./app-store/release/provenance.local.json').appBuildVersion")"

echo "TestFlight upload gates passed for EAS build $EAS_BUILD_ID (iOS build $APP_BUILD_VERSION)."
echo "Exact upload command after explicit approval:"
echo "npx --yes eas-cli submit --platform ios --profile production --id $EAS_BUILD_ID --wait"
