# Pull Hub — app overview (for documentation & AI context)

Use this file as **shared context** when onboarding engineers or pasting into AI tools. It describes the **current codebase** (not a future roadmap unless noted).

---

## Product name & positioning

- **Display name:** **Pull Hub** (`src/config/app.ts` → `APP_DISPLAY_NAME`, `app.json` → `expo.name`).
- **Package / slug:** npm name `tcg-mystery-pack`, Expo slug `tcg-mystery-pack`, URL scheme `pullhub`.
- **Genre:** Mobile app for **TCG (trading card game) “mystery pack” / gacha-style** experiences: users spend **in-app credits** to open **digital packs** with randomized outcomes, track **pull history** and **loyalty tiers**, browse a **marketplace** of physical listings, and use **social / friend** features (IDs, QR).

### Business idea (high level)

1. **Digital packs (“oripa” / loot-box style)**  
   Users use **credits** to open packs; outcomes are **randomized** with tier/rarity; the app surfaces **probability / loot-box disclosure** copy for compliance-style transparency (see `LootBoxDisclosure`, legal modules).

2. **Dual economy (digital + physical)**  
   - **Credits:** In-app currency for **opening packs** on the Home flow.  
   - **Marketplace:** Separate surface for **physical** cards/products from partner-style listings; checkout is framed as **future / Stripe server** (not fully live in preview — see `PaymentPortalScreen`, `MarketplaceCheckoutSection`).

3. **Retention & monetization hooks (product intent)**  
   - **Member tier / XP** ladder (Starter → Gold in mock data) with placeholder **tier benefits**.  
   - **Hot drops** (limited pack releases) vs **promos** (marketing/coupon-style incentives) — explained in dedicated info screens.  
   - **Friends** (member ID, QR add) for social growth and future features.

4. **Trust & compliance orientation**  
   In-app **Terms, Privacy, Promotional rules, Payment disclosures** (`src/legal/inAppLegalCopy.ts`), demo banners, and honest copy when credits are simulated (`CREDITS_ARE_MOCK`).

---

## Current build status (important)

This is a **preview / MVP-style client**. Many flows are **simulated**:

| Area | Reality in repo |
|------|------------------|
| Credits & pack opens | **Local Zustand state** + mock packs (`mockPacks`, `mockUser`); `CREDITS_ARE_MOCK` flags simulated purchases. |
| Marketplace checkout | **Listings-first / demo**; not full production payment. |
| Backend | **`backend/`** exists (e.g. Supabase-related); mobile app is **not** fully driven by live APIs for all features — treat as partial / future wiring. |
| Auth | **Clerk** when `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set; optional **guest browse** without signing in (limited actions). |

Top-of-app **demo banner** (`DemoBanner`, `SHOW_DEMO_BANNER`) reminds users credits/rewards are simulated.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Expo SDK ~54**, **React Native 0.81**, **React 19** |
| Navigation | **React Navigation** — bottom tabs + stack (`RootNavigator.tsx`) |
| State | **Zustand** (`useAppStore`, `guestBrowseStore`) |
| Auth | **Clerk** (`@clerk/clerk-expo`) — Google, Apple, email flows; phone verification & profile onboarding screens |
| i18n | **i18next** — many locales under `src/i18n/locales/`; English is the most complete source of truth for new strings |
| Payments (physical) | **Stripe-related** wiring under `src/payments/` (e.g. `PhysicalGoodsPaymentRoot`) — integration surface for marketplace |

---

## Navigation structure

### Bottom tabs (`RootTabParamList`)

1. **Marketplace** — Browse physical listings (mock `src/data/marketplace.ts`), partner-style copy.  
2. **Home** — Pack catalog: categories, filters, sort, hero/banners; entry to **pack opening** modals.  
3. **Friends** — Friend list, add by ID, QR modals (`AddFriendModal`, `MyQrModal`, `QrScannerModal`).  
4. **Account** — Tier card, member ID, shortcuts (notifications, hot drops info, recent pulls, promos info), recent pulls + full history links, account rows (shipping, payout, identity, linked accounts), support (help center, contact mailto, FAQ), settings, **logout** (Clerk when signed in).

### Stack screens (`RootStackParamList`) — selected

- `Settings`, `PaymentPortal` (credits vs marketplace tabs; params for initial tab / listing context)  
- Account-adjacent: `HelpCenter`, `ShippingAddress`, `TierBenefits`, `Notifications`, `HotDropsInfo`, `PromosInfo`, `RecentPulls`, `PullHistory`, `LinkedAccounts`, `IdentityVerification`, `PayoutMethod`

### Auth flow (when Clerk enabled)

1. Not signed in → **AuthScreen** (or **guest browse** if enabled and not forced to auth wall).  
2. Signed in → **LinkPhoneScreen** until phone verified (`lib/clerkPhone`).  
3. Then **ProfileOnboardingScreen** until profile complete (`lib/clerkProfile`).  
4. Then main app (`RootStack` + tabs).  
5. `ClerkSessionBridge` syncs session into `guestBrowseStore.clerkSignedIn` for `useRequireAuth`.

---

## Core client state (`useAppStore`)

- **`user`:** `UserState` — credits, XP, tier, `pullHistory`, `memberId`, verification flags (`mockUser` default).  
- **Packs:** `selectedCategory`, `sortOrder`, `selectedPack`.  
- **Modals:** `insufficientCredits`, `packOpening`, `wonPrizes`, etc.  
- **Pack open pipeline:** `openPack` → deduct credits / open modal → `applyPackOpenResult` → **WonPrizes** flow → `finalizePullFulfillment` (convert to credits vs ship).  
- **Friends:** local `friends` list + `addFriend` (MVP).  
- **Clerk profile sync:** `setUserFromClerkProfile` updates local user display fields.

**Important implementation note:** Selectors that **derive new arrays/objects** every call from Zustand can break React 18 `useSyncExternalStore` (infinite loops). Derived lists (e.g. sorted pull history) should use **stable store slices + `useMemo`**, not return fresh arrays from the selector inline.

---

## Guest browse (`guestBrowseStore`)

- Persisted: guest browse flag, welcome promo seen.  
- `clerkSignedIn` mirrored from Clerk for `useRequireAuth` — protected actions call `forceAuthWall()` to require sign-in.  
- On sign-out, guest flags are cleared appropriately.

---

## Key UX modules (paths)

| Concern | Location |
|---------|----------|
| Global pack modals | `src/components/pack/GlobalPackModals.tsx` |
| Pack open animation / reveal | `PackOpeningModal.tsx` |
| Post-open ship vs convert | `WonPrizesModal.tsx` |
| Header, credits pill | `AppHeader.tsx`, `CreditsPill.tsx` |
| Legal modals | `LegalDocumentModal` + `src/legal/inAppLegalCopy.ts` |
| Marketplace cards | `src/components/marketplace/ListingCard.tsx` |
| Tier benefits (sample data) | `src/data/tierBenefits.ts` |
| Shipping address persistence (device) | AsyncStorage in `ShippingAddressScreen` |

---

## Configuration & environment

- **Clerk:** `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env` — if empty, `isClerkEnabled` is false and the app runs **without** Clerk gate (dev convenience).  
- **App constants:** `src/config/app.ts` — `APP_DISPLAY_NAME`, demo flags, `SUPPORT_EMAIL`, `CREDITS_ARE_MOCK`.  
- **Publish checklist:** `docs/MVP_PUBLISH_ORDER.md`.

---

## Internationalization

- Strings live in `src/i18n/locales/*.json`; pack titles may use `src/i18n/packCopy.ts` helpers.  
- Adding a feature: prefer new keys in **`en.json`**, then mirror other locales as needed.

---

## Monorepo / backend note

- **`backend/`** — separate Node/Supabase-oriented pieces; the Expo app does not assume every feature is backed by it yet.  
- Treat **mobile** and **backend** as **partially integrated** unless you verify API usage in code.

---

## Development commands (reference)

- `npm start` / `npx expo start` — dev server.  
- `npm run start:tunnel` — when LAN is blocked (e.g. public Wi‑Fi); requires `@expo/ngrok` in devDependencies.  
- Native builds: `npm run ios` / `npm run android` (Expo prebuild/run).

---

## How to use this doc with AI models

Paste **this file** (or the repo) and ask for changes **inside these boundaries**:

- Respect **mock vs production** — do not assume real payments or server sync unless wired.  
- Preserve **Clerk + guest** behavior when touching auth-gated UI.  
- New UI strings → **i18n** (`en.json` at minimum).  
- Zustand: avoid **unstable selectors** returning new objects/arrays every render.

---

*Last aligned to repo layout: Expo 54, React Navigation stack + tabs, Zustand stores as described above. Update this file when product scope or architecture changes materially.*
