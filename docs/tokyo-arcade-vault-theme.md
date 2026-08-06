# Tokyo Arcade Vault — app theme handoff

Status: active visual direction on `codex/tokyo-arcade-vault-app`.

## Decision and design-system conflict

The product owner asked for the complete app to move from the current N2 black/gold presentation to the Tokyo Arcade Vault direction. This is an explicit visual-skin override of the CORE invariants in `docs/design-system-n2.md` that prescribe black/gold and Fraunces. Product language, trust surfaces, accessibility requirements, routes, business logic, and the C-13 terminology remain in force.

This branch therefore changes presentation only. It does not change Points, Trade in, listed value, pack odds, inventory behavior, authentication, checkout, or shipping logic.

## Theme signature

Tokyo Arcade Vault combines a bright Japanese arcade machine chassis with the restraint of a collector vault:

- porcelain ground and warm acrylic surfaces;
- black product bays that make the pack the focal object;
- cobalt controls, teal status signals, and signal-red moment accents;
- thin aluminum keylines, corner registration marks, and short transport rails;
- flat Tokyo transit/arcade references rather than traditional craft textures;
- neutral media placeholders until approved product photography exists.

## Tokens

| Role | Value | Use |
| --- | --- | --- |
| Porcelain | `#F5F2EA` | screen ground |
| Acrylic | `#FCFBF7` | cards and controls |
| Cool acrylic | `#E8ECF2` | secondary panels |
| Aluminum line | `#C6CBD3` | dividers and frames |
| Ink | `#0A0C10` | primary text and product bay |
| Graphite | `#5F6670` | secondary text |
| Cobalt | `#165DFF` | primary action and selected state |
| Teal | `#22BFAE` | status/transport accent |
| Signal red | `#FF5148` | drops, sales, and moment accents |

The `sg.gold` compatibility key resolves to cobalt on this branch so existing value and primary-action call sites adopt the new skin without business-logic rewrites. New component code should describe the role as `accent` or `primary`, not as gold.

## Typography

- Display, buttons, navigation, and compact labels: Chakra Petch 700.
- Paragraphs and supporting UI: Schibsted Grotesk 400/500.
- Prices, balances, odds, stock, certification numbers, and dates: Spline Sans Mono 400/500 with tabular numerals.

The visual hierarchy comes from face choice, size, and spacing—not from simulated outlines, text shadows, or image-baked text.

## Accessibility check

WCAG contrast ratios for the core pairings:

- Ink / porcelain: 17.49:1.
- Ink / acrylic: 18.90:1.
- Graphite / acrylic: 5.60:1.
- Porcelain / cobalt CTA: 4.64:1.
- Verification teal / acrylic: 4.95:1.
- Error red / acrylic: 5.09:1.

## Asset policy

The user-supplied acrylic chamber image is approved for the Home and pack-detail hero covers and is stored at `assets/home/tokyo-arcade-vault-chamber.png`. Third-party card photos, grading labels, logos, and package art are not recreated. The app keeps the black generic package and labeled neutral media frames (`PACK ART PENDING`, `LISTING MEDIA PENDING`) until licensed assets are supplied. CSS gradients must not imitate missing photography.
