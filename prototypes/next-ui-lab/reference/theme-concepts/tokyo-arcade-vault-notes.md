# Tokyo Arcade Vault

Lab-only skin study. External release prohibited. Displayed balance, price, stock, tier odds, card names, grades, and listed values are mock data waiting for production sources.

## Route

`/redesign?theme=tokyo-arcade-vault`

The default `/redesign` route is unchanged. The skin is implemented only through the `data-theme="tokyo-arcade-vault"` scope.

## Design synthesis

- Base: Tokyo Arcade Vault — game-machine density and a luminous acrylic pack-opening chamber.
- Information structure: Japan Transit Precision — `SELECT / OPEN / REVEAL / VAULT` journey and compact data bands.
- Moment accent: Matsuri Pop Arena — pink is limited to the tear line, MYTHIC, and LIVE moments.
- Japan-origin signature: `TOKYO NODE`, `トウキョウ・パック`, direct-from-Tokyo copy, and Japan-curated labeling.

## Token roles

| Role | Value | Use |
| --- | --- | --- |
| Ground | `#000000` | N2 trust chassis and page ground |
| Light chrome | `#F0EEE8` | Header, instrument panels, and acrylic-chamber backing |
| Machine blue | `#2058D5` | Node labels and navigation state; never the value CTA |
| Machine mint | `#2ECDB2` | Pack-origin instrument label |
| Line | `#30343B` | Dark machine frames and information dividers |
| Value | `#D4AF37` | Points, prices, and the single primary CTA |
| Moment | `#FF4A38` | Tear line, MYTHIC, and LIVE only |
| Text | `#F0EEE8` | Primary copy; pure white is not used |

## Typography

- Display: Chakra Petch 500/600/700 — visibly squared industrial signage.
- Body: Schibsted Grotesk — controls and explanatory copy.
- Data: Spline Sans Mono — Points, stock, odds, hashes, and node codes.

## Contrast checks

- Ink `#08090B` on light chrome `#F0EEE8`: `17.17:1`.
- Machine blue `#2058D5` on light chrome `#F0EEE8`: `5.30:1`.
- Ink `#08090B` on machine mint `#2ECDB2`: `9.95:1`.
- Neon moment `#FF4A38` on ink `#08090B`: `5.97:1`; MYTHIC data uses this dark backing.
- Ink `#000000` on value gold `#D4AF37`: `9.99:1`.

## Original material asset

`public/assets/tokyo-arcade-vault/acrylic-chamber-v1.png` is an original generated empty display chamber. It contains no logo, product, card, or text. The pack, labels, tiers, odds, Points, and CTA remain HTML/CSS so they can be connected to real data later.

## Guardrails retained

- `Points`, `Trade in`, `listed value`, and `Vault` terminology.
- Tier names are only `MYTHIC / LEGENDARY / EPIC / BASE`.
- Gold remains the value and CTA color; pink and cyan do not replace it.
- No competitor logo, company name, or card photograph is included.
- Placeholder slabs remain bordered dummy assets until owned inventory photography is supplied.
