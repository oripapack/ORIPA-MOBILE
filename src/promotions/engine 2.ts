import { MOCK_PROMO_CODES, MOCK_REFERRAL_PROGRAM, MOCK_SIGNUP_PROMOTION } from '../data/promotions.mock';
import type { PromotionGrant, RedeemPromoResult } from './types';

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeReferralUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
}

export function lookupPromoCode(code: string): { label: string; grant: PromotionGrant } | null {
  const c = normalizePromoCode(code);
  const row = MOCK_PROMO_CODES.find((p) => p.code === c);
  if (!row) return null;
  return { label: row.label, grant: { ...row.grant } };
}

export function redeemPromoCode(
  raw: string,
  alreadyRedeemed: Set<string>,
): RedeemPromoResult {
  const code = normalizePromoCode(raw);
  if (!code) return { ok: false, reason: 'invalid' };

  const found = lookupPromoCode(code);
  if (!found) return { ok: false, reason: 'invalid' };
  if (alreadyRedeemed.has(code)) return { ok: false, reason: 'already_redeemed' };

  return { ok: true, code, grant: found.grant, label: found.label };
}

export function getSignupPromotion(): { enabled: boolean; grant: PromotionGrant } {
  return {
    enabled: MOCK_SIGNUP_PROMOTION.enabled,
    grant: { ...MOCK_SIGNUP_PROMOTION.grant },
  };
}

export function getReferralGrants(): { newUser: PromotionGrant; referrer: PromotionGrant } {
  return {
    newUser: { ...MOCK_REFERRAL_PROGRAM.newUser },
    referrer: { ...MOCK_REFERRAL_PROGRAM.referrer },
  };
}
