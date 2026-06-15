# Next.js UI prototype (reference only)

> **Production web = Expo** (`npm run web` from repo root → same UI as mobile in `src/`).

Coworker UI experiment. Mine ideas from here; implement in `src/`.

## Routes

| Route | Notes |
|-------|-------|
| `/` | Marketing lobby + pack grid |
| `/packs` | Catalog filters |
| `/pack-detail` | **Port transparency → `PackDetailsScreen.tsx`** |
| `/opening` | Phygitals 4-stage reveal |
| `/sandbox/pack-opening` | 3D / reel R&D |

## Run

```bash
npm run prototype:web
```

Env: `prototypes/next-ui-lab/.env.local` (see `.env.example`).

See `docs/WEB_PLATFORM.md` and repo root `README.md`.
