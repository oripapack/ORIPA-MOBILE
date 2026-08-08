import { Linking } from 'react-native';
import { invokeEdgeFunction } from '../../shared/api/invokeEdgeFunction';
import type { SupabaseFunctionsClient } from '../../shared/api/types';
import { isSupabaseConfigured, supabase } from './supabase';
import { PUBLIC_WEB_ORIGIN } from '../config/app';
import { isLiveStripeCreditCheckoutEnabled } from '../config/payments';

export type CreditCheckoutRequest = {
  bundleId: string;
  bundleLabel: string;
  credits: number;
  amountCents: number;
};

function parseUsdPriceToCents(priceUsd: string): number {
  const n = Number(String(priceUsd).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

export function creditBundleAmountCents(priceUsd: string): number {
  return parseUsdPriceToCents(priceUsd);
}

/**
 * Creates a Stripe Checkout Session via edge function and opens the hosted URL.
 * Credits are granted by `stripe-webhook` → `credit_top_up_stripe` after payment.
 */
export async function startStripeCreditCheckout(
  input: CreditCheckoutRequest,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  if (!isLiveStripeCreditCheckoutEnabled()) {
    return {
      ok: false,
      code: 'CHECKOUT_DISABLED',
      message: 'Purchases aren’t available right now. Please try again later.',
    };
  }
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Purchases aren’t available right now. Please try again later.',
    };
  }
  if (input.amountCents < 50 || input.credits <= 0) {
    return {
      ok: false,
      code: 'INVALID_BUNDLE',
      message: 'Invalid credit bundle',
    };
  }

  const origin = PUBLIC_WEB_ORIGIN.replace(/\/$/, '');
  const result = await invokeEdgeFunction<{
    checkout_url?: string;
    session_id?: string;
  }>(supabase as unknown as SupabaseFunctionsClient, 'create-credit-checkout', {
    credits: input.credits,
    amount_cents: input.amountCents,
    bundle_id: input.bundleId,
    bundle_label: input.bundleLabel,
    success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/credits/cancel`,
  });

  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  const url = result.data.checkout_url?.trim();
  if (!url) {
    return {
      ok: false,
      code: 'CHECKOUT_URL_MISSING',
      message: 'No checkout URL returned',
    };
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return {
      ok: false,
      code: 'CANNOT_OPEN_URL',
      message: 'Cannot open Stripe Checkout on this device',
    };
  }

  await Linking.openURL(url);
  return { ok: true };
}
