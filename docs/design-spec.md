# Pull Hub Design Specification

## Reference Direction

For the current UI redesign, use only the following two references:

1. Phygitals
   - Main reference for visual tone, premium feeling, dark UI, product presentation, spacing, trust, and collectible ownership.

2. Nihon Toreca Center
   - Main reference for oripa business structure, pack detail information, prize pool, remaining quantity, coin/point flow, demo pull, confirmation modal, result screen, and repeat usage flow.

Do not use Clove as a primary reference in this phase.

## Final Design Goal

Pull Hub should feel like a premium US-facing trading card mystery pack platform.

The UI should be:
- premium
- dark
- clean
- collectible-focused
- transparent
- trustworthy
- mobile-first
- exciting but not casino-like
- structured like an oripa product, but visually closer to a premium collectible marketplace

## Reference Files

Read these files before designing:

- `docs/references/phygitals/notes.md`
- `docs/references/nihon-toreca-center/notes.md`

Also inspect all screenshots inside:

- `docs/references/phygitals/`
- `docs/references/nihon-toreca-center/`

---

## Approved Visual Direction — "Stage & Gallery" (approved 2026-07-14)

Luminance encodes meaning: open in a dark theater, own in a bright gallery.
Live mock: `prototypes/next-ui-lab/app/redesign/page.tsx` (route `/redesign`).

### Luminance layers

| Layer | Role | Screens |
|---|---|---|
| **Stage** | 開封劇場 (darkest) | ring select, opening, reveal |
| **Showroom** | 商品展示 (charcoal) | home, pack detail |
| **Gallery** | 取引・所有 (bright neutral) | result card view, collection, shipping, charge, odds/verify |

### Color tokens

| Token | Value | Notes |
|---|---|---|
| stage/bg | `#0B0B0E` | UI frame around the 3D scene (scene owns its own black) |
| showroom/bg | `#141518` | |
| showroom/surface | `#1B1C21` | |
| showroom/raised | `#222329` | |
| showroom/line | `#2E2F36` | hairlines, borders |
| text/on-dark | `#F2F0EB` | warm white |
| text/on-dark-muted | `#A7A49C` | |
| gallery/bg | `#F5F3EF` | |
| gallery/surface | `#FFFFFF` | |
| gallery/line | `#E4E0D8` | |
| gallery/ink | `#1A1918` | |
| gallery/ink-muted | `#6E6A62` | |
| shu 朱 | `#C73E3A` | accent — max ONE element per screen (CTA or Japan signal) |
| shu/pressed | `#A93330` | |
| gold | `#C9A96E` | champagne — same value as 3D scene `packBorder` |
| gold/deep | `#8F7442` | metal gradient: 160deg `#E3C98F → #C9A96E → #8F7442` |
| jade | `#3D8B6E` | financial-positive ONLY (trade-in, listed value). On dark: `#5FB08F` |

### Typography (3 voices)

| Role | Face | Usage |
|---|---|---|
| Display | Fraunces 500/600 | headlines, pack names |
| Body | Schibsted Grotesk 400/500/700 | UI text |
| Data | Spline Sans Mono 500/600 | ALL numbers: prices, odds, slots, values |

### Spacing / radius / elevation

- Spacing: 8pt system — 4 / 8 / 16 / 24 / 32 / 48 / 64
- Radius: chip 999 · button 12 · card 16 · slab 6
- Shadows: real shadows in Gallery only (`0 8px 24px rgba(26,25,24,0.08)`); dark layers use surface-value steps + hairlines, no shadows

### Execution rules

- 朱 (shu): max one element per screen. Home = the CTA only.
- Japanese motif: max one per screen, environmental only (behind product, never on CTA/product). Ukiyo-e line-art style original SVG, low saturation, stroke-based. Home = wave only.
- **Kanji stamp expression: REJECTED (2026-07-14). No kanji co-labels (OPEN 開 etc.), no seal stamps on UI.**
- **Glow rule (revised 2026-07-14): neon-tube / neon-grid urban expressions prohibited. Glow is allowed ONLY for (a) Stage-layer opening effects and (b) LIVE indicators (e.g. gold pulsing dot on Just Pulled). `prefers-reduced-motion` disables the pulse.**
- Numbers always in Spline Sans Mono with a unit label (Coins / listed value / % / slots).
- Legal copy rails: no "100% return rate" / "cash back" / "money back" / "risk free"; coin amounts always labeled "listed value"; no expiry-pressure UI; odds prominent; 18+ and non-affiliation disclaimer in footer.

### Signature element

The vermillion CTA against charcoal, framed by champagne metal and one environmental motif — restraint as identity.