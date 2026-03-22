import React from 'react';

type Props = { children: React.ReactNode };

/**
 * Placeholder root for future Stripe React Native integration.
 * Physical-goods checkout must use **server-created PaymentIntents** only — no hardcoded secret keys,
 * no client-side digital goods checkout through Stripe on iOS (use IAP for credits).
 *
 * When you add `@stripe/stripe-react-native`, wrap children with `StripeProvider` here using
 * `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` from EAS, and keep PaymentIntent creation on your server.
 */
export function PhysicalGoodsPaymentRoot({ children }: Props) {
  return <>{children}</>;
}
