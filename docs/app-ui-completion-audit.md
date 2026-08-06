# App UI completion audit

Branch: `codex/app-quality-unification`

Goal: upgrade and unify every user-facing screen at 440×956 in English without changing existing business logic, authentication, payment behavior, data structures, or the owned pack-opening implementation boundary.

## Visual contract

- Screen ground, navigation, typography, numeric formatting, value color, tier grammar, and component radii follow `docs/design-system-n2.md` CORE.
- The Tokyo Arcade Vault study contributes material direction only: a luminous acrylic hero may appear as product media, while the trust chassis remains black with gold value/CTA.
- Product copy uses Points, Trade in, listed value, Tier, and Vault.
- Real card/slab photography stays asset-blocked until owned inventory media exists.

## Route inventory

### Primary tabs

- [x] Home — 440×956 verified
- [x] Marketplace — N2 type and icon pass; 440×956 verified
- [x] Vault — N2 display/data type and icon pass; 440×956 verified
- [x] Friends — shared header, display type, no emoji avatars; 440×956 verified
- [x] Account — shared header, display/data type, no emoji avatar; 440×956 verified

### Pack and fulfillment flow

- [ ] Pack details
- [ ] Opening pre/post chrome (opening engine itself is owned by the opening team)
- [ ] Result
- [ ] Payment portal
- [ ] Shipping address
- [ ] Pull history

### Account and onboarding

- [ ] Authentication
- [ ] Phone linking
- [ ] Profile onboarding
- [ ] Settings
- [ ] Linked accounts
- [ ] Identity verification
- [ ] Wallet linking
- [ ] Payout method

### Retention and social

- [ ] Notifications
- [ ] Promotions
- [ ] Promos info
- [ ] Hot drops info
- [ ] Membership
- [ ] Tier benefits
- [ ] Collector quests
- [ ] Friend profile
- [ ] Friends leaderboard

### Support and missing product surfaces

- [ ] Help center
- [ ] Offers — no routed screen exists; product/data scope required
- [ ] Messages — no routed screen exists; product/data scope required

## Shared foundation

- [x] Default unstyled text moved from Outfit to Schibsted Grotesk.
- [x] Header balance component changed from Credits/Coin UI to Points UI.
- [x] Stack headers use one shared visual configuration.
- [ ] Legacy spacing/type imports removed from active user-facing code.
- [x] Legacy secondary-button compatibility path renders the N2 line button.
- [ ] Screen-level screenshot matrix exists for every route.

## Release blockers outside visual scope

- Odds are mock and not linked to actual inventory tiers (`KNOWN_ISSUES` #4).
- Card rarity/tier data is unresolved (`KNOWN_ISSUES` #5).
- Graded-card assumptions are not confirmed (`KNOWN_ISSUES` #6).
- Result navigation is not connected from the owned opening flow.
