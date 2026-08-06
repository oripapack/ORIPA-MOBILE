# Pull Hub app quality unification — visual audit

Branch: `codex/app-quality-unification`

Viewport: 440×956

Locale: English

Status: all listed UI routes rendered without a visible error boundary.

This directory is an internal visual-audit artifact. Mock values and preview-only states must not be published as live product data.

## Primary experience

- [Home](./home-440x956.png)
- [Marketplace](./marketplace-440x956.png)
- [Vault](./vault-440x956.png)
- [Friends](./friends-440x956.png)
- [Player / account](./account-440x956.png)
- [Pack details](./pack-details-440x956.png)
- [Pack result](./result-440x956.png)
- [Payment portal](./payment-portal-440x956.png)

## Account and onboarding

- [Authentication](./auth-440x956.png)
- [Authentication bottom sheet](./auth-bottom-sheet-440x956.png)
- [Phone linking](./phone-linking-440x956.png)
- [Profile onboarding](./profile-onboarding-440x956.png)
- [Settings](./settings-440x956.png)
- [Linked accounts](./linked-accounts-440x956.png)
- [Wallet linking](./wallet-linking-440x956.png)
- [Identity verification](./identity-verification-440x956.png)
- [Payout method](./payout-method-440x956.png)
- [Shipping address](./shipping-address-440x956.png)
- [Help center](./help-center-440x956.png)

## Retention and social

- [Friend profile](./friend-profile-440x956.png)
- [Friends leaderboard](./friends-leaderboard-440x956.png)
- [Offers](./offers-440x956.png)
- [Messages](./messages-440x956.png)
- [Notifications](./notifications-440x956.png)
- [Membership](./membership-440x956.png)
- [Level progress](./level-progress-440x956.png)
- [Collector quests](./collector-quests-440x956.png)
- [Promotions](./promotions-440x956.png)
- [Promos info](./promos-info-440x956.png)
- [Hot drops info](./hot-drops-info-440x956.png)
- [Pull history](./pull-history-440x956.png)

## Visual contract checked

- Black trust chassis, restrained gold for value and primary actions, and neon reserved for moments.
- Fraunces display headings, Schibsted Grotesk interface copy, and monospace numeric/data labels.
- Shared 8/12/16/24 px spacing rhythm and consistent panel/button radii.
- Points, Trade in, listed value, Tier, and Vault terminology.
- Tokyo/Japan provenance expressed through flat wayfinding motifs and editorial copy, not traditional-luxury decoration.

## Asset-blocked list

The following media deliberately remains a neutral outlined placeholder; it is not imitated with gradients or invented card art:

- Pack cover artwork.
- Pack detail top-hit inventory media.
- Result hero and supporting-card media.
- Marketplace listing/product media.
- Social and friend-Vault card media.

Replacement assets must be owned or rights-cleared, use a transparent or neutral background, be crop-safe at a 0.72 card aspect ratio, and be at least 1600 px on the long edge. Record the inventory ID and rights source with each asset.

## Preview harness

The query-based route harness is compiled only when `EXPO_PUBLIC_UI_PREVIEW=1`. It renders production screen components for visual review but does not submit authentication, billing, or profile mutations.
