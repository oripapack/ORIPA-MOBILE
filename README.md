# Pull Hub

TCG mystery-pack platform — **one app**, mobile + web, shared backend.

## Repository layout

```
├── src/                 # Frontend app (Expo) — iOS, Android, and web
├── shared/              # Shared types, API clients, mocks, design tokens
├── backend/             # Supabase (Postgres, Edge Functions, migrations)
├── marketing/           # Static marketing site (not the product app)
├── prototypes/          # Archived UI experiments (not production)
├── assets/              # Images, sounds (Expo)
├── docs/                # Product and engineering docs
└── scripts/             # i18n, tooling
```

**There is only one product frontend: `src/`.**  
Web is not a separate app — it is the same `src/` running in the browser via Expo (`react-native-web`).

## Quick start

```bash
npm install
cp .env.example .env          # add Clerk + Supabase keys

npm start                     # mobile (Expo Go / simulator)
npm run dev                   # same as npm start
npm run web                   # web (same UI as mobile)
npm run web:export            # static web build → dist/
```

## Environment

Root `.env` (gitignored):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## What is NOT the main app

| Path | Purpose |
|------|---------|
| `prototypes/next-ui-lab/` | Next.js UI experiment — reference only (`npm run prototype:web`) |
| `marketing/landing/` | Static HTML landing page |
| `docs/references/` | Design screenshots |

See [docs/WEB_PLATFORM.md](docs/WEB_PLATFORM.md) for platform strategy.

**Designers / UI collaborators:** read [docs/COWORKER_UI_GUIDE.md](docs/COWORKER_UI_GUIDE.md) — where to edit, how to preview, Claude prompts.

## Backend

```bash
cd backend && npm install
# Local Supabase: see backend/.env.example
```

Hosted Supabase project + Clerk integration power both mobile and web.
