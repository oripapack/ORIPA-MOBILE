#!/usr/bin/env bash
# Push production EXPO_PUBLIC_* secrets to EAS, then build + auto-submit iOS.
# Usage (from repo root):
#   bash scripts/build-production.sh
#
# Requires:
#   - filled `.env.production` (not placeholder values)
#   - `eas` CLI logged in (`npx eas-cli whoami`)
#   - Apple submit fields set in `eas.json` (or ASC interactive prompts)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ROOT}/.env.production"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE"
  echo "Copy .env.production.example → .env.production and fill real production values."
  exit 1
fi

echo "==> Loading $ENV_FILE..."
# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

require_var() {
  local name="$1"
  local value="${!name-}"
  if [[ -z "$value" ]]; then
    echo "error: $name is empty in .env.production"
    exit 1
  fi
  case "$value" in
    *your-proj*|*your-anon-key*|*pk_live_your_key*|*your-hosted-web-domain*|*your_key*|*example.com*)
      echo "error: $name still looks like a placeholder ($value)"
      echo "Fill real credentials in .env.production before running this script."
      exit 1
      ;;
  esac
}

require_var EXPO_PUBLIC_SUPABASE_URL
require_var EXPO_PUBLIC_SUPABASE_ANON_KEY
require_var EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# Pack ring origin is optional: empty → TerminalOpeningFallback in release.
EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL-}"
if [[ -n "$EXPO_PUBLIC_PACK_RING_WEB_URL" ]]; then
  case "$EXPO_PUBLIC_PACK_RING_WEB_URL" in
    *your-hosted-web-domain*)
      echo "error: EXPO_PUBLIC_PACK_RING_WEB_URL still looks like a placeholder"
      exit 1
      ;;
  esac
  # Origin only — strip accidental /opening-3d.html suffix.
  EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL%/opening-3d.html}"
  EXPO_PUBLIC_PACK_RING_WEB_URL="${EXPO_PUBLIC_PACK_RING_WEB_URL%/}"
else
  echo "warn: EXPO_PUBLIC_PACK_RING_WEB_URL empty — 3D opening will use TerminalOpeningFallback"
fi

EAS=(npx --yes eas-cli)

echo "==> Setting EAS secrets from .env.production..."
"${EAS[@]}" secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "$EXPO_PUBLIC_SUPABASE_URL" --force --non-interactive
"${EAS[@]}" secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "$EXPO_PUBLIC_SUPABASE_ANON_KEY" --force --non-interactive
"${EAS[@]}" secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" --force --non-interactive
if [[ -n "$EXPO_PUBLIC_PACK_RING_WEB_URL" ]]; then
  "${EAS[@]}" secret:create --scope project --name EXPO_PUBLIC_PACK_RING_WEB_URL --value "$EXPO_PUBLIC_PACK_RING_WEB_URL" --force --non-interactive
fi

echo "==> Triggering EAS production build with auto-submit..."
"${EAS[@]}" build --platform ios --profile production --auto-submit --non-interactive

echo "==> Done. Monitor the build in Expo dashboard / EAS CLI output."
