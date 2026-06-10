# Shared contracts (Pull Hub)

Single source of truth for data and design tokens used by:

- **Expo app** (`src/`) — shipped product
- **Next.js UI lab** (`apps/pack-opening-web/`) — fast visual iteration

## Edit here

| Path | Purpose |
|------|---------|
| `types/pack.ts` | Pack catalog types, rarity, TCG categories |
| `tokens/ph.ts` | Phygitals design tokens (`ph-*` colors) |
| `mock/catalog.ts` | 12-pack mock catalog |
| `mock/recentPulls.ts` | Live activity feed mock |

## Import paths

```ts
// Expo
import { CATALOG_PACKS } from '../../shared/mock/catalog';
import { ph } from '../../shared/tokens/ph';

// Next.js lab
import { CATALOG_PACKS } from '../../../shared/mock/catalog';
// or via apps/pack-opening-web/data/catalog.ts
```

When the backend is ready, add `shared/api/` clients — UI components should not change.
