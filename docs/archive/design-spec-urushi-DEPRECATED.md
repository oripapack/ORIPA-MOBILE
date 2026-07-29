> **このドキュメントは廃止されました。**
> 唯一の正は docs/design-system-n2.md です。
> このファイルは履歴のために残しているだけで、参照してはいけません。

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

### Color tokens — palette revision "Urushi Archive" (2026-07-14)

| Token | Value | Notes |
|---|---|---|
| sumi/0 (Stage) | `#090A0A` | UI frame around the 3D scene (scene owns its own black) |
| sumi/1 (Showroom bg) | `#111313` | 2–4% lightness steps across the sumi layers |
| sumi/2 (surface) | `#171918` | satin cards |
| sumi/3 (raised) | `#1D201F` | |
| text/on-dark | `#E8E5DE` | pure white `#FFF` is banned as a rule |
| text/on-dark-muted | `#9A968D` | derived (not on the approved sheet) |
| washi/bg (Gallery) | `#F2EFE8` | |
| washi/surface | `#F8F6F1` | |
| ink | `#201F1C` | |
| ink-muted | `#6E6960` | derived |
| shu 朱 | `#A63B32` | CTA ONLY, one per screen; NEVER flat — semi-gloss (top 7% white gradient + inset top highlight + dark shadow) |
| shu/hover | `#AF4036` | |
| brass 真鍮 | `#A88B58` | replaces gold. NEVER on buttons — rarity, decorative lines, details only |
| jade | `#33705C` | demoted from buttons: text/status only (trade-in complete, value confirmed). On dark: `#4E8F76` (derived) |

### Typography (3 voices, role-restricted)

| Role | Face | Usage limits |
|---|---|---|
| Display | Fraunces 500/600 | brand statements, pack names, revealed card names ONLY. Nav / section headings / CTA use the body face |
| Body | Schibsted Grotesk 400/500/700 | UI text, nav, section headings, CTA labels, product names, dates |
| Data | Spline Sans Mono 500/600 | prices, odds, stock, coin amounts, hashes ONLY — never product names or dates |

### Material & lighting (Urushi Archive)

- Showroom background: ONE warm spotlight from top-center (`radial-gradient`, `rgba(255,250,238,0.085)`-class) + vertical darkening toward the bottom. All components obey this single light; self-illumination is prohibited (LIVE indicators are the sanctioned exception).
- Material differentiation: background matte / UI cards satin (top-edge inset highlight ONLY — full 1px borders on every element are prohibited) / product card imagery gloss (layered shadows + ONE fixed diagonal reflection, never animated) / CTA semi-gloss.
- ~1.8% monochrome noise (soft-light) across all dark surfaces.
- Radius roles: control 8px / card 12px / panel 16px / image 7px. Pill shapes for status chips only.
- Spacing: 8pt system — 4 / 8 / 16 / 24 / 32 / 48 / 64
- Shadows: real shadows in Gallery only (`0 8px 24px rgba(32,31,28,0.08)`).

### Trust information architecture

- Pack detail order: pack name → set/year → price → key cards → slots remaining → odds → draw method → trade-in policy → ships from Tokyo.
- Odds: a one-line summary (e.g. "Top hit odds: 1.2%") is ALWAYS visible; only the detail table collapses (fully hiding odds is a legal no-go).
- Slots remaining: hairline bar + monospaced numbers, neutral color. No red, no blinking.
- Fairness record block (4 rows): Server commitment (hash prefix) / Client seed / Opening # / Verify →.

### Execution rules

- 朱 (shu): max one element per screen, CTA only, always semi-gloss (never flat).
- brass: rarity display, decorative lines, details. Never buttons.
- jade: text/status only (trade-in complete, value confirmed). Not a button color.
- **Japanese motifs (wave / torii / sakura): PARKED — flagged off, not deleted (`sg.flags.japaneseMotifs`). "Japan-origin + premium" must stand without motifs first; they return one at a time for comparison. Sakura particle spec preserved for Phase E: none ≤ Rare / Legendary 3–7 petals · low saturation · 1.4s / Mythic full celebration (low saturation, depth rules).**
- **Kanji stamp expression: REJECTED (2026-07-14). No kanji co-labels (OPEN 開 etc.), no seal stamps on UI.**
- **Glow rule: neon-tube / neon-grid urban expressions prohibited. Glow ONLY for (a) Stage-layer opening effects and (b) LIVE indicators (brass pulsing dot). `prefers-reduced-motion` disables the pulse.**
- Numbers always in Spline Sans Mono with a unit label (Coins / listed value / % / slots).
- Legal copy rails: no "100% return rate" / "cash back" / "money back" / "risk free"; coin amounts always labeled "listed value"; no expiry-pressure UI; odds summary always visible; 18+ and non-affiliation disclaimer in footer.

### Signature element

The semi-gloss vermillion CTA under a single warm spotlight on lacquer black, brass only in the details — restraint as identity.