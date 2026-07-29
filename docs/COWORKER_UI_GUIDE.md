# UI guide for designers & non-coders

**Read this first.** This explains where the app lives, how the UI works, and exactly which files to change when you use Claude to update the look and feel.

---

## The short answer: where do I edit?

| Question | Answer |
|----------|--------|
| Is there an `apps/` folder? | **No.** It was removed. Do not look for it. |
| Where is the real app? | **`src/`** — this is the only product UI. |
| Where do I edit for mobile + web? | **`src/`** — same code runs on phone and browser. |
| Can I use the Next.js prototype? | Only as **inspiration**. Real changes go in **`src/`**. |

**Tell Claude:** *"Edit the Expo app in `src/`. Do not edit `backend/`, `prototypes/`, or `marketing/` unless I ask."*

---

## How the UI works (simple version)

```
You change a file in src/
        ↓
Save the file
        ↓
The app reloads automatically (hot reload)
        ↓
You see the change on web or phone
```

There is **one app**, not two. Mobile (iOS/Android) and web use the **same screens and components** in `src/`.

- **Web preview:** run `npm run web` in the project folder → opens in your browser
- **Phone preview:** run `npm start` → scan QR code with Expo Go, or use a simulator

You do **not** need to maintain a separate web app.

---

## Repo map (what each folder is)

```
ORIPA-MOBILE/
│
├── src/                    ← ⭐ EDIT HERE (the product UI)
│   ├── screens/            ← Full pages (Home, Pack Detail, Vault, etc.)
│   ├── components/         ← Reusable UI pieces (cards, buttons, modals)
│   ├── tokens/             ← Colors, spacing, fonts (design system)
│   ├── data/               ← Mock pack/card data (safe to tweak labels/images)
│   └── navigation/         ← Which screen opens when (usually leave alone)
│
├── shared/                 ← Shared types & API helpers (ask before editing)
├── assets/                 ← Images and sounds
├── backend/                ← Database & server (do not touch for UI work)
├── prototypes/next-ui-lab/ ← Old Next.js experiment (reference only)
└── marketing/landing/      ← Static marketing HTML (not the app)
```

---

## Screen → file cheat sheet

Each **screen** is one main file under `src/screens/`. If you want to change how a page looks, start here.

| What you see in the app | File to edit |
|-------------------------|--------------|
| Home / pack browse | `src/screens/HomeScreen.tsx` |
| Pack detail (tap a pack) | `src/screens/PackDetailsScreen.tsx` |
| Pack opening animation | `src/components/pack/PackOpeningModal.tsx` + `src/components/pack/opening/` |
| Vault (your cards) | `src/screens/VaultScreen.tsx` |
| Marketplace | `src/screens/MarketplaceScreen.tsx` |
| Friends / social | `src/screens/FriendsScreen.tsx` |
| Account / profile | `src/screens/AccountScreen.tsx` |
| Settings | `src/screens/SettingsScreen.tsx` |
| Buy credits | `src/screens/PaymentPortalScreen.tsx` |
| Sign in | `src/screens/AuthScreen.tsx` |

**Bottom tab bar** (Home, Friends, Vault, etc.) is wired in `src/navigation/RootNavigator.tsx` — only change this if you need to add/remove tabs.

---

## Component folders (smaller UI pieces)

Use these when Claude should change a **widget** used on multiple screens, not a whole page.

| Folder | What's inside |
|--------|----------------|
| `src/components/ui/` | N2 primitives: `SgButton`, `SgCard`, `SgData`, `SgScreen`, `SgSectionHeader`, `SgTierTag` |
| `src/components/home/sg/` | Home shelf UI (banner, featured pack, shelf tiles, recent pulls) |
| `src/components/pack/sg/` | Pack detail N2 pieces (e.g. fairness record) |
| `src/components/shared/` | Header, credits pill, primary buttons, list rows |
| `src/components/pack/` | Pack cards, odds modal, opening flow helpers |
| `src/components/vault/` | Vault cards, list-for-sale modals |
| `src/components/marketplace/` | Marketplace listing rows |
| `src/components/account/` | Account section, sign out |
| `src/components/ph/` | Legacy pack visual helpers still in use (`PackVisual`, badges) |
| `src/components/_archive/` | Unused pre-N2 home/lobby UI — do not wire back without migrating |

**Examples:**
- Change how a pack looks on the home shelf → `src/components/home/sg/SgShelfPackTile.tsx` / `SgFeaturedPackCard.tsx`
- Change the top header → `src/components/shared/AppHeader.tsx`
- Change home banner carousel → `src/components/home/sg/SgBannerCarousel.tsx`

---

## Design system (colors & spacing)

**Do not invent random hex colors.** Use N2 tokens so everything stays consistent.

| Token file | Use for |
|------------|---------|
| `src/tokens/sg.ts` | **Primary** N2 "Neon Torii" colors, fonts, radii (`import { sg } from '../tokens/sg'`) |
| `src/tokens/sgVault.ts` | Vault / buyback FINTECH skin only (`sgVault`) |
| `docs/design-system-n2.md` | Full N2 handoff (roles, ban list, skins) |
| `src/tokens/spacing.ts` | Legacy spacing helpers (prefer `sg.space` for new UI) |
| `src/tokens/colors.ts` | Deprecated Phygitals palette — do not use for new work |

**Example** (inside a screen):

```ts
import { sg } from '../tokens/sg';
import { SgScreen, SgButton } from '../components/ui';

// background: sg.bg
// primary CTA: sg.gold with sg.onGold label
// muted text: sg.muted
```

Fonts are **Fraunces / Schibsted Grotesk / Spline Sans Mono** (loaded in root `App.tsx`). Prefer `sg.font.*`. Do not add new font families without checking with the team.

---

## The Next.js prototype (`prototypes/next-ui-lab/`)

This is **not** the live app. It was a separate experiment (formerly under `apps/web`).

| | Prototype | Real app |
|---|-----------|----------|
| Folder | `prototypes/next-ui-lab/` | `src/` |
| Run command | `npm run prototype:web` | `npm run web` |
| Tech | Next.js + Tailwind | Expo + React Native |
| Ship to users? | **No** | **Yes** |

**Workflow we want:**

1. You (or Claude) can **look at** the prototype for layout ideas — e.g. `prototypes/next-ui-lab/app/pack-detail/page.tsx` has a nice transparency / odds layout.
2. **Copy the design** into the matching `src/` screen — e.g. `src/screens/PackDetailsScreen.tsx`.
3. Do **not** keep building only in the prototype. It will not show up on mobile or production web.

---

## What NOT to edit (unless you know what you're doing)

| Path | Why leave it alone |
|------|-------------------|
| `backend/` | Database, payments, pull logic — backend dev territory |
| `shared/api/` | How the app talks to Supabase |
| `src/lib/` | Auth, credits, API wrappers |
| `src/store/` | App state logic (credits, modals, navigation triggers) |
| `package.json` | Dependencies — easy to break the build |
| `.env` | Secret keys — never commit or paste in chat |

**UI-only rule:** Change layout, colors, text, images, spacing in `src/screens/` and `src/components/`. If something needs real data or auth, ask the main dev.

---

## How to preview your changes

### Web (easiest)

```bash
cd ORIPA-MOBILE          # project root
npm install              # first time only
npm run web              # opens browser
```

Leave the terminal running. When you save a file in `src/`, the page updates.

### Phone

```bash
npm start
```

Use Expo Go on your phone or press `i` (iOS simulator) / `a` (Android emulator) in the terminal.

---

## Using Claude effectively (copy-paste prompts)

### Prompt template for changing a screen

```
I'm working on Pull Hub (Expo app). Edit ONLY visual/layout in:

  src/screens/PackDetailsScreen.tsx

Goal: [describe what you want — e.g. "add a prize pool grid like the prototype"]

Rules:
- Use N2 tokens from src/tokens/sg.ts (sg.bg, sg.gold, sg.text, etc.)
- Use React Native components: View, Text, TouchableOpacity, ScrollView
- Do NOT edit backend/, src/lib/, or src/store/
- Do NOT use HTML, div, or Tailwind — this is React Native
- Keep existing navigation and open-pack behavior working

Reference (layout only): prototypes/next-ui-lab/app/pack-detail/page.tsx
```

### Prompt for a small component

```
Update src/components/home/sg/SgShelfPackTile.tsx only.

Add a "return rate" and "floor value" row under the pack title, matching
the style in prototypes/next-ui-lab/components/pack/PackCard.tsx.

Use sg tokens. React Native only. No logic changes to openPack.
```

### Prompt to see what file to edit

```
I want to change [describe feature — e.g. "the friends leaderboard"].
Which file in src/ should I edit? List the file path and one sentence why.
Do not change any files yet.
```

---

## Common tasks → where to go

| I want to… | Start here |
|------------|------------|
| Change home page layout | `src/screens/HomeScreen.tsx` |
| Change pack card on home | `src/components/home/sg/SgShelfPackTile.tsx` |
| Change pack detail page | `src/screens/PackDetailsScreen.tsx` |
| Add filters on browse | `src/screens/HomeScreen.tsx` (search for sort/niche state) |
| Change opening animation look | `src/components/pack/opening/` |
| Change vault card layout | `src/components/vault/PortfolioCard.tsx` |
| Change tab bar icons/labels | `src/navigation/RootNavigator.tsx` |
| Change mock pack names/images | `src/data/mockPacks.ts` |
| Change global colors | `src/tokens/sg.ts` + `docs/design-system-n2.md` |

---

## Priority UI work (team backlog)

These prototype designs should be **ported into `src/`**, not left only in `prototypes/`:

1. **Pack detail transparency** — prize pool, odds table, buyback explainer  
   - From: `prototypes/next-ui-lab/app/pack-detail/page.tsx`  
   - To: `src/screens/PackDetailsScreen.tsx`

2. **Pack card stats** — return rate, floor value on cards  
   - From: `prototypes/next-ui-lab/components/pack/PackCard.tsx`  
   - To: `src/components/home/sg/SgShelfPackTile.tsx` / `SgFeaturedPackCard.tsx`

3. **Browse filters** — price range chips  
   - From: `prototypes/next-ui-lab/app/packs/page.tsx`  
   - To: `src/screens/HomeScreen.tsx`

---

## React Native vs web HTML (important for Claude)

This app uses **React Native**, not normal HTML.

| ✅ Use | ❌ Do not use |
|--------|----------------|
| `<View>` | `<div>` |
| `<Text>` | `<span>`, `<p>` |
| `<TouchableOpacity>` or `<Pressable>` | `<button>` |
| `StyleSheet.create({ ... })` or inline `style={{}}` | Tailwind `className` |
| `expo-image` `<Image>` | `<img>` |

Claude sometimes defaults to Next.js/HTML — always remind it: **Expo React Native in `src/`**.

---

## If something breaks

1. **Red error screen** — read the first line; it often names the file. Undo your last change or ask Claude to fix that file only.
2. **Blank screen** — check the terminal for errors; run `npm run web` again.
3. **Change didn't show** — make sure you edited `src/`, not `prototypes/`. Save the file. Hard refresh the browser.
4. **Still stuck** — send the main dev: screenshot + which file you changed.

---

## One-page summary

```
┌─────────────────────────────────────────────────────────┐
│  THE APP = src/                                         │
│  Edit screens + components there                        │
│  Preview with: npm run web                              │
├─────────────────────────────────────────────────────────┤
│  prototypes/next-ui-lab/ = old apps/web, ideas only   │
│  marketing/ = landing page, not the app               │
│  backend/ = server, not UI                              │
│  NO apps/ folder anymore                                 │
└─────────────────────────────────────────────────────────┘
```

**Golden rule:** If users should see it on their phone or on the real website, it must live in **`src/`**.
