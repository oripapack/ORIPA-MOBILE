# Tokyo Night Terminal — UI skin handoff

Branch: `codex/tokyo-night-terminal-app`

## Product idea

Tokyo Night Terminal combines a late-night Tokyo transit console with a modern
collectibles interface. The visual language is Japanese through flat wayfinding,
compact station codes, bilingual micro-labels, terminal rails, and a restrained
signal palette—not through traditional craft textures or ornamental pastiche.

The skin intentionally replaces the N2 black/gold presentation on this branch.
N2 interaction hierarchy, trust language, terminology, and business behavior
remain unchanged.

## Visual system

| Role | Value |
| --- | --- |
| App background | `#080D18` midnight |
| Primary panel | `#121A2A` navy |
| Raised panel | `#182338` / `#21304A` |
| Primary action | `#275DDB` cobalt |
| Active/highlight | `#3E72F0` cobalt light |
| Positive status | `#38BFA8` mint |
| Moment signal | `#FF5A47` vermilion |
| Text | `#F4EFE3` warm ivory |
| Supporting text | `#A7B0BC` aluminum |

- Display: Outfit 900
- Body: Schibsted Grotesk 400/500/700
- Data and labels: Spline Sans Mono 400/500
- Panel radius: 6 px
- Primary control radius: 4 px
- Spacing scale: 4 / 8 / 16 / 24 / 32 / 48 / 64 px

The implementation follows primitive → semantic → component tokens in
`src/tokens/sg.ts`. Product UI consumes those aliases instead of choosing
screen-local accent colors.

## Rebuilt surfaces

- Global header, Points readout, search control, and five-tab navigation dock.
  Every primary tab now keeps this same top chrome so switching between Packs,
  Shop, Vault, Friends, and Player feels like one continuous terminal.
- Packs home: terminal dispatch board, featured pack bay, inventory readouts,
  pack shelf, recent pulls, and trust strip
- Pack details: full-height pack bay, status rail, pack data, quantity selection,
  odds access, and open CTA
- Result: record header, card panel, listed-value summary, Trade in confirmation,
  and Vault action
- Opening: interactive 3D `TOKYO PACK 01`, code-native safety fallback, skip,
  reveal record, and direct Result handoff
- Shop, Vault, Friends, Player, auth, membership, Help Center, legal documents,
  locale selection, and supporting sheets inherit the same palette, typography,
  panel geometry, and action hierarchy

## Asset and behavior boundaries

- The black `TOKYO PACK 01` foil image was supplied and approved by the user.
- Existing real-card and marketplace demo data were not rewritten.
- Existing routes, auth, checkout, store shape, and mock business logic were
  preserved.
- The user explicitly expanded this branch to the complete product UI, including
  opening. The active 3D scene was re-skinned in `pack-ring-server/`; the
  interaction physics and draw result remain unchanged.
- If the 3D helper is unavailable, the app now uses a code-native terminal
  opening instead of showing a browser connection error or blank screen.
- Real card art and grading data are still asset/data-blocked. Result and safety
  opening screens use explicit neutral placeholders rather than fabricated card
  photography or grade claims.
- User-facing English uses Points, Trade in, listed value, and TIER terminology.
  Legacy locale parity is tracked separately by KNOWN_ISSUES T1.

## Visual verification

Reference viewport: 440 × 956, English locale.

Saved captures:

- `docs/screenshots/tokyo-night-terminal/home-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/pack-detail-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/shop-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/vault-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/friends-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/player-440x956.jpg`
- `docs/screenshots/tokyo-night-terminal/flow-home-440x956.png`
- `docs/screenshots/tokyo-night-terminal/flow-opening-440x956.png`
- `docs/screenshots/tokyo-night-terminal/flow-result-440x956.png`
