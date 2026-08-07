/**
 * 実データ待ち。外部に見せないこと。
 * Development-only promotion fixtures.
 */
import type {
  PromoCodeDefinition,
  ReferralProgramDefinition,
  SignupPromotionConfig,
} from '../promotions/types';

/** Mock catalog — replace with API / remote config. */
export const MOCK_PROMO_CODES: PromoCodeDefinition[] = [
  { code: 'WELCOME', label: 'Welcome bonus', grant: { points: 100 } },
  { code: 'FREEPACK', label: 'Free pack', grant: { freePacks: 1 } },
  { code: 'LAUNCH', label: 'Launch week', grant: { points: 50, freePacks: 1 } },
];

/**
 * Referral program: both sides receive the same mock reward (1 free pack each).
 * Matches product copy “REFERRAL → both get pack”.
 */
export const MOCK_REFERRAL_PROGRAM: ReferralProgramDefinition = {
  id: 'ref_v1',
  newUser: { freePacks: 1 },
  referrer: { freePacks: 1 },
};

/** Demo mapping for “$5 in credits” promo copy and grants — tune against real shop pricing later. */
export const SIGNUP_PROMO_CREDITS_PER_USD = 100;
export const SIGNUP_PROMO_BONUS_USD = 5;
export const SIGNUP_PROMO_BONUS_CREDITS = SIGNUP_PROMO_BONUS_USD * SIGNUP_PROMO_CREDITS_PER_USD;

/**
 * First signup reward — applied once per user id in `promotionStore.syncSessionRewards`.
 */
export const MOCK_SIGNUP_PROMOTION: SignupPromotionConfig = {
  enabled: __DEV__,
  grant: { freePacks: 1 },
};
