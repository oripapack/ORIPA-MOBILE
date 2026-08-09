# PullHub RN UI calibration — T9

Status: approved implementation baseline for P-1 and C-7 on Expo / React Native.
The source design rules remain `docs/design-system-n2.md`; this file only converts them into RN values.

## Typography

| Role | Family | Size / line height | Letter spacing | Notes |
|---|---|---:|---:|---|
| Hero | Fraunces 500 | 36 / 40 | -0.6 | Sentence case; one editorial focal heading |
| Title | Fraunces 500 | 26 / 30 | -0.35 | No forced uppercase |
| Section | Schibsted Grotesk 700 | 21 / 26 | -0.15 | Functional hierarchy |
| Body | Schibsted Grotesk 400 | 15 / 24 | 0 | Default UI copy |
| Body emphasis | Schibsted Grotesk 700 | 15 / 22 | 0 | Buttons and short labels |
| Caption | Schibsted Grotesk 500 | 13 / 18 | 0 | Supporting information |
| Operational label | Schibsted Grotesk 500 | 11 / 16 | 0.1 | Natural-language status and eyebrow copy |
| Data | Spline Sans Mono 500 | 14 / 20 | 0 | Points, odds, counts and record numbers; tabular numerals |

- Use `allowFontScaling` defaults. Prefer `minHeight` over fixed control heights so Dynamic Type can grow.
- Do not use the data face for product names, dates, navigation or button labels. Reserve it for IDs, odds, Points, counts and true machine statuses.
- Large type uses tighter leading and tracking; body copy stays open and neutral.

## Shape and spacing

- Panel radius: 13.
- Button and input radius: 10.
- Tag radius: 6.
- Pill radius: 999 only for a true capsule such as a segmented filter.
- Minimum touch target: 44 × 44; primary actions target 52–54 points.
- Layout spacing uses `sg.space`: 4 / 8 / 16 / 24 / 32 / 48 / 64.
- Prefer surface changes and spacing to nested outlines. Use a 1-point line only where it communicates a boundary.

## Press and spring physics

| Interaction | RN / Reanimated baseline |
|---|---|
| Tap feedback | Update on pointer-down with scale 0.985; restore on release/cancel |
| Default UI settle | `withSpring(target, { mass: 1, stiffness: 300, damping: 35, overshootClamping: true })` |
| Sheet / momentum settle | `withSpring(target, { mass: 1, stiffness: 420, damping: 34 })`; pass gesture velocity |
| Gesture threshold | 10 points before directional commitment |
| Reduced motion | No scale/slide/spring; 180 ms opacity cross-fade or immediate state change |

- A touched object follows the finger 1:1 and keeps the original grab offset.
- A sheet can be interrupted while moving. New motion begins at its current presentation value.
- Commit or cancel from release velocity direction, then position; never from position alone.
- Apply progressive rubber-band resistance beyond bounds instead of a hard stop.

## Material and depth

- Functional tab bars and sheets may use one translucent layer over content.
- Reduced-transparency mode uses an opaque `surface` background without blur.
- Use `shadowHero` on one focal object per screen. Lists and nested cards stay flat.
- Press feedback, sound and haptics fire from the same causal event. No decorative haptics.
