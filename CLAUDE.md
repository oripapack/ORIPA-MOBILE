# Pull Hub — agent context

## Architecture

- **Frontend:** `src/` only (Expo 54, React Native). Ships iOS, Android, and web via `react-native-web`.
- **Shared logic:** `shared/` — types, `shared/api/` (execute-pull, credits), mocks, tokens.
- **Backend:** `backend/supabase/` — migrations, seed, Edge Functions.
- **Do not treat `prototypes/` or `marketing/` as product code.**

## Commands

- `npm start` — mobile
- `npm run web` — Expo web (production web target)
- `npm run prototype:web` — Next.js lab in `prototypes/next-ui-lab/`

## Env

Root `.env` with `EXPO_PUBLIC_*` keys. Prototype uses `prototypes/next-ui-lab/.env.local`.
