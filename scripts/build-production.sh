#!/usr/bin/env bash
# Fail-safe iOS release build. This script never submits a build unless local
# release gates and production environment validation both pass.

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

PRODUCTION_ENV_FILE="$RELEASE_ROOT/.env.production"

if [[ ! -f "$PRODUCTION_ENV_FILE" ]]; then
  echo "error: missing .env.production"
  echo "Copy .env.production.example to .env.production and replace every placeholder."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$PRODUCTION_ENV_FILE"
set +a

require_public_value() {
  local variable_name="$1"
  local variable_value="${!variable_name-}"
  if [[ -z "$variable_value" ]]; then
    echo "error: $variable_name is empty"
    exit 1
  fi
  case "$variable_value" in
    *your-project*|*your-production*|*example.com*)
      echo "error: $variable_name still contains a placeholder"
      exit 1
      ;;
  esac
}

require_public_value EXPO_PUBLIC_SUPABASE_URL
require_public_value EXPO_PUBLIC_SUPABASE_ANON_KEY
require_public_value EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
require_public_value EXPO_PUBLIC_PACK_RING_WEB_URL

if [[ "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" != pk_live_* ]]; then
  echo "error: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be a Clerk production key"
  exit 1
fi

echo "==> Running local release gates"
npm run check:release
node scripts/check-app-store-readiness.mjs

EAS=(npx --yes eas-cli)

echo "==> Verifying Expo authentication"
"${EAS[@]}" whoami

echo "==> Uploading public client configuration to the EAS production environment"
"${EAS[@]}" env:push production --path "$PRODUCTION_ENV_FILE" --force

echo "==> Starting iOS production build"
"${EAS[@]}" build --platform ios --profile production

echo "Build created. Run 'npx eas-cli submit --platform ios --profile production' only after TestFlight QA."
