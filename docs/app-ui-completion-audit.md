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

- [x] Pack details — 440×956 verified
- [x] Opening pre/post chrome — ring connection verified; opening engine remains opening-team owned
- [x] Result — 440×956 direct-review route and Trade in confirmation verified
- [x] Payment portal — Points and physical-order preview states verified
- [x] Shipping address — 440×956 verified
- [x] Pull history — 440×956 verified

### Account and onboarding

- [ ] Authentication
- [ ] Phone linking
- [ ] Profile onboarding
- [x] Settings — 440×956 verified
- [x] Linked accounts — configuration-empty state verified
- [x] Identity verification — configuration-empty state verified
- [x] Wallet linking — disabled-provider state verified; Clerk hook boundary fixed
- [x] Payout method — configuration-empty state verified

### Retention and social

- [x] Notifications — 440×956 verified; local-only preview state is explicit
- [x] Promotions — 440×956 verified
- [x] Promos info — Help Center route restored; 440×956 verified
- [x] Hot drops info — Help Center route restored; 440×956 verified
- [x] Membership — 440×956 preview state verified; billing blocked by `KNOWN_ISSUES` #8
- [x] Level progress (former Tier benefits) — 440×956 verified; unsupported benefit claims removed
- [x] Collector quests — 440×956 verified
- [ ] Friend profile
- [ ] Friends leaderboard

### Support and missing product surfaces

- [x] Help center — 440×956 verified; preview support limitation is explicit
- [x] Offers — routed N2 connection-empty state; service blocked by `KNOWN_ISSUES` #9
- [x] Messages — routed N2 connection-empty state; service blocked by `KNOWN_ISSUES` #9

## Shared foundation

- [x] Default unstyled text moved from Outfit to Schibsted Grotesk.
- [x] Header balance component changed from Credits/Coin UI to Points UI.
- [x] Stack headers use one shared visual configuration.
- [x] Visible legacy currency/action wording normalized to Points and Trade in across all 17 locale files; locale structure validated.
- [ ] Legacy spacing/type imports removed from active user-facing code.
- [x] Legacy secondary-button compatibility path renders the N2 line button.
- [ ] Screen-level screenshot matrix exists for every route.

## Asset-blocked inventory media

Until owned, rights-cleared inventory media is connected, these surfaces deliberately render the neutral `AssetBlockedCard` frame and dummy label instead of a photograph or CSS imitation:

- Pack details — top-hit media
- Pack cards — top-hit thumbnail
- Result — hero and supporting-card media
- Marketplace — product/listing thumbnails

Required replacement asset: transparent or neutral-background product photograph, no third-party storefront/logo treatment, crop-safe at 0.72 card aspect ratio, minimum 1600 px on the long edge, with inventory ID and rights source recorded alongside the asset. The canonical capture and delivery requirements live in `docs/asset-spec.md`.

## Startup and overlays

- [x] App splash — Tokyo-wayfinding ticket motif, N2 type, and flat black chassis; production web export verified.
- [x] Authentication bottom sheet — N2 surface, line, handle, and button grammar.
- [x] Signup prompt — N2 type and CTA hierarchy.
- [x] Insufficient Points and simulation disclosures — N2 value and action treatment.

## Verification limitation

- Authentication, phone linking, and profile onboarding source were brought onto the N2 type/surface system, but their signed-in visual pass is still unchecked: browser automation was rejected after the temporary Clerk-enabled URL changed policy context. No alternate browser/CDP path was used.

## Release blockers outside visual scope

- Odds are mock and not linked to actual inventory tiers (`KNOWN_ISSUES` #4).
- Card rarity/tier data is unresolved (`KNOWN_ISSUES` #5).
- Graded-card assumptions are not confirmed (`KNOWN_ISSUES` #6).
- Result navigation is not connected from the owned opening flow.
- Membership billing and server entitlements are not connected (`KNOWN_ISSUES` #8).
- Physical checkout, Offers, and Messages service layers are not connected (`KNOWN_ISSUES` #9).
