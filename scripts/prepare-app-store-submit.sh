#!/usr/bin/env bash
# Validation-only handoff. This script never uploads or submits a build.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

npm run check:release
node scripts/check-app-store-readiness.mjs
node scripts/check-app-store-metadata.mjs --submission
node scripts/check-app-store-submission.mjs

echo "Submission gates passed. Submit only the exact TestFlight build that completed QA."
echo "Command after explicit approval: npx eas-cli submit --platform ios --profile production"
