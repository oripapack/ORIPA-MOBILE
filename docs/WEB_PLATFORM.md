# Web platform strategy

## One UI, two platforms

Pull Hub ships **one frontend** (`src/`) on:

| Platform | Command | Code |
|----------|---------|------|
| **iOS / Android** | `npm start` | `src/` |
| **Web (production)** | `npm run web` | `src/` (via `react-native-web`) |
| **Static web export** | `npm run web:export` | `dist/` |

Update `src/` once — mobile and web both change.

## `prototypes/next-ui-lab/` (Next.js experiment)

Archived coworker UI lab — **not** the production web app.

- Run: `npm run prototype:web` → http://localhost:3000
- Use as a **design reference** when porting ideas into `src/`
- Do not maintain feature parity here

### Port into `src/` (priority)

1. Pack detail transparency — `prototypes/next-ui-lab/app/pack-detail/page.tsx` → `PackDetailsScreen.tsx`
2. Pack card stats — return rate, floor value on `PhPackCard`
3. Browse filters — price-range chips on `HomeScreen`
4. Opening carousel — `src/components/pack/openingPrototype/` if needed

## Environment

| Target | Env file |
|--------|----------|
| Mobile + Expo web | Root `.env` (`EXPO_PUBLIC_*`) |
| Next prototype only | `prototypes/next-ui-lab/.env.local` |

## Backend

One Supabase project (`backend/supabase/`). Shared clients in `shared/api/`.
