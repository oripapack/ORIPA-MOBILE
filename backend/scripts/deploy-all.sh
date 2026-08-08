#!/usr/bin/env bash
# Phase 5 production release: migrations → seed → edge functions → smoke.
# Run from backend/:  npm run deploy:all
# Requires: linked Supabase project (npx supabase link) and unpaused host.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 1/4 db push (migrations)"
npx supabase db push --yes

echo "==> 2/4 seed catalog"
npx supabase db query --linked -f supabase/seed.sql

echo "==> 3/4 deploy edge functions"
npx supabase functions deploy execute-pull
npx supabase functions deploy request-shipment
npx supabase functions deploy stripe-webhook
npx supabase functions deploy create-credit-checkout
npx supabase functions deploy mint-retry

echo "==> 4/4 smoke live health checks"
node ../scripts/smoke-live-packs.mjs

echo ""
echo "deploy:all complete."
