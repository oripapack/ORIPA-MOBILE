/**
 * Commerce capability flags — keep client purchases honest.
 * Digital credits on iOS/Android should eventually use IAP; Stripe Checkout is
 * available when publishable key + create-credit-checkout edge function are live.
 */
import { Platform } from 'react-native';
import { CREDITS_ARE_MOCK } from './app';
import { isSupabaseConfigured } from '../lib/supabase';

const stripePublishableKey = (
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
).trim();

/** Stripe publishable key present in the Expo env. */
export function isStripePublishableConfigured(): boolean {
  return stripePublishableKey.length > 0;
}

/**
 * Demo / preview grants via `addCredits` — only when CREDITS_ARE_MOCK.
 * Never silently grant credits in “live” mode without a PSP.
 */
export function allowDemoCreditGrants(): boolean {
  return CREDITS_ARE_MOCK;
}

/**
 * Live Stripe Checkout Session path for credit bundles.
 * Requires Supabase + publishable key; edge function uses STRIPE_SECRET_KEY server-side.
 */
export function isLiveStripeCreditCheckoutEnabled(): boolean {
  if (CREDITS_ARE_MOCK) return false;
  if (!isSupabaseConfigured) return false;
  if (!isStripePublishableConfigured()) return false;
  return true;
}

/**
 * Membership / IAP is not wired — always simulated until store billing ships.
 * Even when CREDITS_ARE_MOCK is false, label tiers as preview.
 */
export function isMembershipBillingLive(): boolean {
  return false;
}

/** Marketplace / Vault Exchange card checkout — not live until PaymentIntent flow ships. */
export function isMarketplaceCheckoutLive(): boolean {
  return false;
}

export function creditCheckoutUnavailableReason():
  | 'demo'
  | 'stripe_coming_soon'
  | 'iap_native'
  | null {
  if (allowDemoCreditGrants()) return 'demo';
  if (isLiveStripeCreditCheckoutEnabled()) {
    // Native store builds should prefer IAP; Stripe Checkout still opens via browser when enabled.
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const allowNativeStripe =
        (process.env.EXPO_PUBLIC_ALLOW_NATIVE_STRIPE_CREDITS ?? '').trim() === '1';
      if (!allowNativeStripe) return 'iap_native';
    }
    return null;
  }
  return 'stripe_coming_soon';
}

export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;
