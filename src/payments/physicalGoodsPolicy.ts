/**
 * Payment routing policy (no secrets in the app).
 *
 * - **Digital credits / coins** (consumable in-app currency): must use Apple In-App Purchase /
 *   Google Play Billing on mobile — not Stripe in the client for those items.
 * - **Marketplace — physical goods** (singles, sealed shipped to the user): use **server-created**
 *   Stripe PaymentIntents (or platform checkout). Apple Pay / Google Pay can be surfaced via Stripe
 *   when checkout is for **physical fulfillment**, not digital IAP inventory.
 *
 * This repo does not ship `@stripe/stripe-react-native` until you add a backend that creates
 * PaymentIntents. Do not embed publishable keys for “live” server modes in source control; use
 * `EXPO_PUBLIC_*` from EAS env at build time.
 */
export const PAYMENT_ROUTING = {
  digitalCredits: 'store_iap' as const,
  physicalMarketplace: 'stripe_server_payment_intent' as const,
};
