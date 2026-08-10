#!/usr/bin/env bash
# Fail-safe iOS release build. Syncs production env to EAS, then builds.
# Usage (from repo root):
#   npx eas-cli login
#   bash scripts/build-production.sh

set -euo pipefail

RELEASE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RELEASE_ROOT"

PRODUCTION_ENV_FILE="$RELEASE_ROOT/.env.production"
EAS=(npx --yes eas-cli)

if [[ ! -f "$PRODUCTION_ENV_FILE" ]]; then
  echo "error: missing .env.production"
  echo "Copy .env.production.example to .env.production and replace every placeholder."
  exit 1
fi

echo "==> Checking Expo / EAS login..."
if ! "${EAS[@]}" whoami >/dev/null 2>&1; then
  echo "error: not logged in to Expo."
  echo "Run: npx eas-cli login"
  exit 1
fi
ACCOUNT="$("${EAS[@]}" whoami 2>/dev/null | head -1)"
echo "    logged in as: $ACCOUNT"

if ! node -e "const a=require('./app.json'); process.exit(a?.expo?.extra?.eas?.projectId?0:1)" 2>/dev/null; then
  echo "==> EAS project not linked — running eas init --account ${ACCOUNT}..."
  "${EAS[@]}" init --account "$ACCOUNT" --non-interactive
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
    *your-project*|*your-production*|*your-proj*|*your-anon-key*|*pk_live_your*|*your-hosted-web-domain*|*example.com*|*Your\ Legal\ Entity\ Name*)
      echo "error: $variable_name still contains a placeholder"
      exit 1
      ;;
  esac
}

require_public_value EXPO_PUBLIC_SUPABASE_URL
require_public_value EXPO_PUBLIC_SUPABASE_ANON_KEY
require_public_value EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# Pack ring origin is optional until a hosted HTTPS scene is ready.
EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL-}"
if [[ -n "$EXPO_PUBLIC_PACK_RING_WEB_URL" ]]; then
  case "$EXPO_PUBLIC_PACK_RING_WEB_URL" in
    *your-hosted-web-domain*|*your-project*)
      echo "error: EXPO_PUBLIC_PACK_RING_WEB_URL still contains a placeholder"
      exit 1
      ;;
  esac
  EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL%/opening-3d.html}"
  EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL%/}"
else
  echo "warn: EXPO_PUBLIC_PACK_RING_WEB_URL empty — 3D opening will use TerminalOpeningFallback"
fi

# Legal / App Store public identity (required by release-prep gates when present in example).
if [[ -n "${EXPO_PUBLIC_LEGAL_ENTITY_NAME-}" ]]; then
  require_public_value EXPO_PUBLIC_LEGAL_ENTITY_NAME
  require_public_value EXPO_PUBLIC_LEGAL_CONTACT_EMAIL
  require_public_value EXPO_PUBLIC_PRIVACY_POLICY_URL
  require_public_value EXPO_PUBLIC_SUPPORT_URL

  if [[ "$EXPO_PUBLIC_PRIVACY_POLICY_URL" != https://* ]]; then
    echo "error: EXPO_PUBLIC_PRIVACY_POLICY_URL must be a public HTTPS URL"
    exit 1
  fi
  if [[ "$EXPO_PUBLIC_SUPPORT_URL" != https://* ]]; then
    echo "error: EXPO_PUBLIC_SUPPORT_URL must be a public HTTPS URL"
    exit 1
  fi
fi

if [[ "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" != pk_live_* && "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" != pk_test_* ]]; then
  echo "error: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be a Clerk publishable key"
  exit 1
fi

if [[ "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" != pk_live_* ]]; then
  echo "warn: Clerk key is not pk_live_* — App Store release should use a production Clerk key"
fi

if command -v npm >/dev/null 2>&1 && npm run | grep -q "check:release"; then
  echo "==> Running local release gates"
  npm run check:release
fi
if [[ -f scripts/check-app-store-readiness.mjs ]]; then
  node scripts/check-app-store-readiness.mjs
fi

echo "==> Uploading public client configuration to the EAS production environment"
"${EAS[@]}" env:push production --path "$PRODUCTION_ENV_FILE" --force

echo "==> Starting iOS production build"
"${EAS[@]}" build --platform ios --profile production

echo "Build created. Record the EAS build ID before TestFlight QA:"
echo "npm run record:app-store-build -- <EAS_BUILD_ID>"
echo "Then run 'npm run prepare:testflight-upload' before uploading this exact build to TestFlight."
