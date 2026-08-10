#!/usr/bin/env bash
# Push production EXPO_PUBLIC_* env vars to EAS, then build + auto-submit iOS.
# Usage (from repo root):
#   npx eas-cli login          # one-time / when session expired
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
EAS=(npx --yes eas-cli)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE"
  echo "Copy .env.production.example → .env.production and fill real production values."
  exit 1
fi

echo "==> Checking Expo / EAS login..."
if ! "${EAS[@]}" whoami >/dev/null 2>&1; then
  echo "error: not logged in to Expo."
  echo "Run this once in your terminal, then re-run this script:"
  echo "  npx eas-cli login"
  echo "Or set EXPO_TOKEN for CI."
  exit 1
fi
ACCOUNT="$("${EAS[@]}" whoami 2>/dev/null | head -1)"
echo "    logged in as: $ACCOUNT"

# Link / create EAS project if app.json has no extra.eas.projectId yet.
if ! node -e "const a=require('./app.json'); process.exit(a?.expo?.extra?.eas?.projectId?0:1)" 2>/dev/null; then
  echo "==> EAS project not linked — running eas init --account ${ACCOUNT}..."
  "${EAS[@]}" init --account "$ACCOUNT" --non-interactive
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

# EXPO_PUBLIC_* must be available to the production build environment (not legacy secrets).
set_eas_env() {
  local name="$1"
  local value="$2"
  echo "    set $name"
  "${EAS[@]}" env:set production \
    --name "$name" \
    --value "$value" \
    --type string \
    --visibility sensitive \
    --scope project \
    --non-interactive
}

echo "==> Syncing EAS production env from .env.production..."
set_eas_env EXPO_PUBLIC_SUPABASE_URL "$EXPO_PUBLIC_SUPABASE_URL"
set_eas_env EXPO_PUBLIC_SUPABASE_ANON_KEY "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
set_eas_env EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY "$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
if [[ -n "$EXPO_PUBLIC_PACK_RING_WEB_URL" ]]; then
  set_eas_env EXPO_PUBLIC_PACK_RING_WEB_URL "$EXPO_PUBLIC_PACK_RING_WEB_URL"
fi

echo "==> Triggering EAS production build with auto-submit..."
"${EAS[@]}" build --platform ios --profile production --auto-submit --non-interactive

echo "==> Done. Monitor the build in Expo dashboard / EAS CLI output."
