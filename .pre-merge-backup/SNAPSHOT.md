# Pre-merge snapshot — 2026-07-09

**Purpose:** Rollback reference before merging `origin/ui-update` into `main`.

## Safe restore point (main)

| Field | Value |
|-------|-------|
| Branch | `main` |
| Commit | `4d1a3ffa029e7f02125cbb592a369d9bd14b7731` |
| Message | `database changes and migrations` |
| Date | 2026-07-08 18:15:39 +0900 |
| Synced with `origin/main` | Yes (same SHA) |

### Restore main to this exact state

```bash
git checkout main
git reset --hard 4d1a3ffa029e7f02125cbb592a369d9bd14b7731
```

## Incoming branch (`ui-update`)

| Field | Value |
|-------|-------|
| Tip | `8373e324178a258e03b6d0314239e5a4164840c5` |
| Message | `test push` |
| Commits ahead of main | 4 (`78c4363`, `b3d3363`, `009ddcc`, `8373e32`) |

### What ui-update touches (16 files, +2898 / -1468 lines)

- **Prototype only** — no changes under `src/` (mobile app untouched by branch)
- `prototypes/next-ui-lab/app/sandbox/pack-opening/PackRingScene.tsx` (+372 lines vs main)
- New: `prototypes/next-ui-lab/app/lp/page.tsx`, `app/vault/page.tsx`
- Rewrites: `prototypes/next-ui-lab/app/page.tsx`, `packs/page.tsx`, `pack-detail/page.tsx`
- `.claude/` skills + settings, `HANDOFF.md` (Japanese handoff doc)
- `prototypes/next-ui-lab/package-lock.json` (dependency churn)

### PackRingScene line counts

- **main:** 1075 lines
- **ui-update:** ~1447 lines (estimated from diff)

### Coworker handoff warnings (from `HANDOFF.md` on ui-update)

- Phase A/B animation WIP was **stashed** due to broken mobile layout
- Working tree on ui-update is "clean baseline" at `009ddcc`; advanced work may be in their **git stash**, not in the branch
- Known issues documented: flap parking, floor light band, incomplete phases C–F

## Uncommitted local work (NOT on main commit — saved in this folder)

### Modified files

- `src/components/coach/CoachSpotlight.tsx`
- `src/screens/AccountScreen.tsx` (login/sign-out card wiring)
- `src/screens/SettingsScreen.tsx` (admin tools section)
- `src/store/useAppStore.ts` (`setCredits` for admin)

### New untracked files (copied here)

- `src/components/account/AccountAuthCard.tsx`
- `src/components/account/AdminToolsSection.tsx`
- `src/config/admin.ts`

### Re-apply after rollback

```bash
git apply .pre-merge-backup/local-changes.patch
cp .pre-merge-backup/AccountAuthCard.tsx src/components/account/
cp .pre-merge-backup/AdminToolsSection.tsx src/components/account/
cp .pre-merge-backup/admin.ts src/config/admin.ts
```

## Mobile app pack opening (main — unchanged by ui-update)

Production animation lives in `src/components/pack/opening/` and `PackOpeningModal.tsx`.
Prototype sandbox: `prototypes/next-ui-lab/app/sandbox/pack-opening/`.

## Env (unchanged by merge)

Root `.env` has Clerk + Supabase keys (`EXPO_PUBLIC_*`).
Prototype uses `prototypes/next-ui-lab/.env.local` (`NEXT_PUBLIC_*`).
