#!/usr/bin/env bash
# Validation-only handoff. This script never uploads or submits a build.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

npm run check:release
node scripts/check-app-store-readiness.mjs
node scripts/check-app-store-metadata.mjs --submission
node scripts/app-store-provenance.mjs
node scripts/app-store-review-notes.mjs
node scripts/check-app-store-submission.mjs
npx --yes eas-cli metadata:lint --profile production

APP_BUILD_VERSION="$(node -p "require('./app-store/release/provenance.local.json').appBuildVersion")"

echo "Final App Store review gates passed for TestFlight build $APP_BUILD_VERSION."
echo "In App Store Connect, select this exact build, verify every field, then use Add for Review and Submit for Review only after explicit approval."
