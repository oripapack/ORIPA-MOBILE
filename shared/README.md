# Shared contracts (Pull Hub)

Single source of truth consumed by **`src/`** (Expo app).  
The Next.js lab in `prototypes/next-ui-lab/` may import from here for experiments.

## Layout

| Path | Purpose |
|------|---------|
| `types/pack.ts` | Pack catalog types, rarity, TCG categories |
| `tokens/ph.ts` | Phygitals design tokens |
| `mock/catalog.ts` | 12-pack mock catalog |
| `mock/recentPulls.ts` | Live activity feed mock |
| `api/env.ts` | Supabase / Clerk env helpers |
| `api/executePull.ts` | `execute-pull` client |
| `api/userCredits.ts` | Credit balance fetch |
| `api/catalogLive.ts` | Pack id → live `pack_version_id` |

## Import paths

```ts
// From src/
import { CATALOG_PACKS } from '../../shared/mock/catalog';
import { ph } from '../../shared/tokens/ph';
import { executePullLive } from '../../shared/api/executePull'; // via src/lib re-exports
```

When the backend grows, add under `shared/api/` — keep UI in `src/`.
