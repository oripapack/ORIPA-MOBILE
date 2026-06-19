# Pull Hub — development state (source of truth)

This file reflects **what exists in this repository today** (code + SQL). Items not found in the repo are labeled **Planned** or **Not in codebase**.

---

## Project vision

**Pull Hub** (see `docs/APP_OVERVIEW.md` and `src/config/app.ts`) is positioned as a **mobile-first TCG mystery-pack / gacha-style** experience: in-app **credits** open **digital packs** with randomized outcomes, plus a **marketplace** surface for **physical** listings and a **Vault** for collection / fulfillment-style flows.

**Asset-light luxury marketplace (product framing):** The codebase emphasizes **listings-first / demo** marketplace checkout, simulated credits where configured (`CREDITS_ARE_MOCK`), and partner-style inventory — consistent with operating **without** holding full retail inventory in-app logic. The exact phrase “asset-light luxury marketplace” does **not** appear verbatim in code; it summarizes the direction implied by docs and mock flows.

**Physical-backed tokens (PBT) on Base:** **Planned / partial.** The backend models a **Digital Twin** per successful pull (`digital_twins`, default `chain_id` **8453** = Base) with metadata tying to `pull_results.digest_hex` and a **serial number**. There is **no** implementation in this repo of a **PBT chip** standard, **transferable physical custody** contract, or **automatic** legal title workflow beyond storing chain metadata — those remain **product + legal** layers on top of the current schema and mint helpers.

---

## Technical stack (verified in repo)

| Area | What is present |
|------|-----------------|
| Mobile app | **Expo ~54**, **React Native 0.81**, **React 19** (`package.json`) |
| Web (production) | **Expo web** — same `src/` as mobile (`npm run web`) |
| Web (prototype) | Next.js lab in `prototypes/next-ui-lab/` (reference only) |
| Navigation / UI | **React Navigation**, **NativeWind** / Tailwind, **Zustand** |
| Auth (client) | **Clerk** (`@clerk/clerk-expo`) when `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set |
| Backend host | **Supabase** project under `backend/` — **Postgres** migrations, **Edge Functions** (Deno 2 per `backend/supabase/config.toml`) |
| Supabase client (app) | **`@supabase/supabase-js`** when `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set (`src/lib/supabase.ts`) |
| Edge runtime deps | **`npm:@supabase/supabase-js@2`** and **`npm:viem`** inside functions |
| Blockchain vendor | **Native Base transactions via `viem`** (`backend/supabase/functions/_shared/blockchain.ts`); no Thirdweb Engine HTTP path |
| Queue / Bull | **Not in codebase** — mint retry is a second Edge Function + DB status, not Redis/Bull |

---

## Database schema (migrations in `backend/supabase/migrations/`)

### `public.profiles` (`20260322120000` + `20260511120000`)

- **Columns (effective):** `id` (PK, FK → `auth.users`), `display_name`, `member_id`, `locale`, `created_at`, `updated_at`, **`wallet_address`** (nullable, added in `20260511120000`).
- **RLS:** Enabled. Policies: **`profiles_select_own`**, **`profiles_update_own`** (`authenticated`, `auth.uid() = id`). **No** `INSERT`/`DELETE` policies for `authenticated` — profile row creation is via trigger on `auth.users` (`handle_new_user`).

### `public.partner_stores` (`20260322120000`)

- **Columns:** `id`, `slug`, `name`, `created_at`.
- **RLS:** `partner_stores_select_authenticated` (authenticated, `using (true)`), `partner_stores_select_anon` (anon, `using (true)`).

### `public.pull_results` (`20260511120000` + FK in `20260511140000`)

- **Columns:** `id`, `user_id` → `auth.users`, **`pack_version_id`** (nullable, FK → `pack_versions` after `20260511140000`), **`seed_pair_id`** (nullable, **no** `seed_pairs` table in repo), `client_seed`, `nonce`, `hashed_server_seed`, `revealed_server_seed`, `digest_hex`, `roll_value`, `won_item_id`, `card_name`, `serial_number` (unique), `provenance_at`, `mint_status` (`mint_pending` \| `mint_completed` \| `mint_skipped_no_wallet` \| `mint_failed`), `mint_last_error`, `mint_attempts`, `created_at`.
- **RLS:** `pull_results_select_own` (`authenticated`, `auth.uid() = user_id`). **No** client insert/update policies — writes are intended for **service role** / Edge Functions.

### `public.digital_twins` (`20260511120000`)

- **Columns:** `id`, `pull_id` (FK → `pull_results`, **unique**), `chain_id` (default **8453**), `contract_address`, `token_id`, `tx_hash`, `owner_wallet`, `block_number`, `block_timestamp`, `metadata_snapshot`, `mint_provider`, `created_at`.
- **RLS:** `digital_twins_select_own` — user may select if a related `pull_results` row exists with `user_id = auth.uid()`. **No** client insert/update policies.

### `public.pack_definitions`, `public.pack_versions`, `public.pack_pool_items` (`20260511140000`)

- **Purpose:** Versioned pack catalog + **integer weights** per line item.
- **RLS:** Public **SELECT** for `anon` and `authenticated` on all three tables. **No** insert/update/delete policies for clients — catalog writes are **Planned** (service/admin path only today).

---

## Provably fair logic (implemented)

**Location:** `backend/supabase/functions/execute-pull/index.ts`, `backend/supabase/functions/_shared/crypto.ts`, `backend/supabase/functions/_shared/weightedRoll.ts`.

| Piece | Behavior |
|-------|----------|
| Server secret | **32-byte** random hex (`crypto.getRandomValues`), stored as **`revealed_server_seed`** on the same request (no separate commit/reveal table). |
| Public commitment | **`hashed_server_seed`** = **SHA-256** (UTF-8) of the server seed hex (`sha256HexUtf8`). |
| Canonical message | `v1\|${clientSeed}\|${nonce}\|${packVersionId}\|${user.id}` |
| Fairness digest | **`digest_hex`** = **HMAC-SHA256** where **key** = raw bytes of `server_seed_hex`, **message** = canonical string (`hmacSha256HexUtf8`). |
| Weighted outcome | **`rollWeightedPool`**: **rejection sampling** on **uint32** space (no modulo bias); extension stream uses `canonicalMessage + "\|rollStream\|" + blockIndex` for additional HMAC blocks when needed. |
| Pool binding | Loads **`pack_versions`** (must be **`is_active`**) and **`pack_pool_items`** for `pack_version_id`. **`pack_version_id`** required unless **`DEFAULT_PACK_VERSION_ID`** Edge secret is set. |
| `seed_pairs` table | **Not in codebase** — `pull_results.seed_pair_id` exists but is unused (`null` on insert). |

---

## Blockchain integration

| Topic | Status |
|-------|--------|
| **Chain** | **Base** (`chain_id = 8453`) through `viem/chains`. |
| **Mint path** | High-value pulls are created as **`mint_deferred`**. **`request-shipment`** moves them to **`mint_pending`** and schedules **`processMintForPullId`** only after a physical shipping request. |
| **Mint API** | **`mintCardNFT`** simulates and submits `mintTo(address,string)` directly from the backend minter wallet using `viem`. |
| **Retry worker** | **`mint-retry`** Edge Function: requires **`MINT_CRON_SECRET`** header/bearer; processes pending pulls with bounded **`mint_attempts`** (shared constant in `processMint.ts`). |
| **Tiered minting** | **`pack_pool_items.should_mint`**. Low tier → **`mint_skipped_low_tier`**. High tier → **`mint_deferred`** until shipment request, then native Base mint. |
| **Receipt / block time enrichment** | `block_number` is populated from the Base receipt. `token_id` is parsed from the ERC-721 `Transfer` event when available, with the transaction hash as a duplicate-mint-safe fallback. |

---

## Current roadmap (implemented vs draft)

### Fully present in repo (code/SQL)

- Supabase **migrations** for profiles, partner stores, pull results, digital twins, pack catalog + FK from `pull_results` to `pack_versions`.
- **Seed** mock pack (1% / 99% weights) in `backend/supabase/seed.sql` with stable UUIDs (see comments in file).
- Edge Functions: **`execute-pull`**, **`mint-retry`**, shared **`_shared/`** modules (`crypto`, `weightedRoll`, `minting`, `processMint`).
- Mobile **Supabase client** wiring when env vars exist; **no** `invoke('execute-pull')` (or similar) usage under `src/` **per current scan**.

### Draft / partial / not wired

- **Clerk vs Supabase Auth:** Migrations and Edge Function auth assume **Supabase JWT** (`userClient.auth.getUser()`). The app primarily documents **Clerk**; a **single sign-on bridge** from Clerk → Supabase session for Edge calls is **not present** in scanned `src/` — treat as **integration gap** until implemented or auth strategy is unified.
- **`seed_pairs` / pre-commit reveal** — **Planned** (column stub only).
- **Vault / credits / pack open** — still largely **local Zustand** per `docs/APP_OVERVIEW.md`; not replaced by `execute-pull` in the mobile UI.
- **Contract deploy / minter funding** — off-repo. The backend expects a deployed Base ERC-721 contract with `mintTo(address,string)` and a funded admin minter wallet.

---

## Known blockers & operational checklist

### Environment variables (mobile — `src/lib/supabase.ts`)

- **`EXPO_PUBLIC_SUPABASE_URL`**, **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** — both required for `isSupabaseConfigured` / non-null `supabase` client.

### Environment variables / secrets (Edge — from scanned function code)

| Name | Used by |
|------|---------|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `execute-pull`, `mint-retry`, `processMint` |
| `PRIVATE_MINTER_KEY`, `DIGITAL_TWIN_CONTRACT_ADDRESS` | `mintCardNFT` native Base mints |
| `BASE_RPC_URL` (optional) | Dedicated Base RPC transport for `viem`; defaults to chain transport |
| `DEFAULT_PACK_VERSION_ID` (optional dev convenience) | `execute-pull` |
| `MINT_CRON_SECRET` | `mint-retry` |

### Migrations / local Supabase

- Migrations **exist as files** only until you run **`supabase db push`** / **`db reset`** on your machine/project — the repo **does not** record whether remote DBs have applied them.
- Adding **`pull_results_pack_version_id_fkey`** can fail if existing `pull_results.pack_version_id` values do not match any `pack_versions.id` (data hygiene before push).

---

## How to keep this file honest

When you add features, update **Database schema**, **Provably fair**, **Blockchain**, and **Roadmap** sections in the same PR, or this document will drift.
