/**
 * Unified promotion model: promo codes, referral pairs, and configurable signup bonus.
 * Server-backed promos can mirror this shape later.
 */

/** Aggregate grant (may include points + free packs). */
export interface PromotionGrant {
  points?: number;
  freePacks?: number;
}

/** Typed promo code entry (mock / future API). */
export interface PromoCodeDefinition {
  /** Uppercase normalized code */
  code: string;
  label: string;
  grant: PromotionGrant;
}

/** Referral: rewards for invitee and referrer when `?r=` signup completes. */
export interface ReferralProgramDefinition {
  id: string;
  newUser: PromotionGrant;
  referrer: PromotionGrant;
}

/** First-time signup automation (toggle + reward). */
export interface SignupPromotionConfig {
  enabled: boolean;
  grant: PromotionGrant;
}

export type RedeemPromoResult =
  | { ok: true; code: string; grant: PromotionGrant; label: string }
  | { ok: false; reason: 'invalid' | 'already_redeemed' | 'inactive' };
