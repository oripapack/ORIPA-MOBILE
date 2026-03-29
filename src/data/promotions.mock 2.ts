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

/**
 * First signup reward — switch to `{ points: 100 }` or `{ freePacks: 1 }` as needed.
 */
export const MOCK_SIGNUP_PROMOTION: SignupPromotionConfig = {
  enabled: true,
  grant: { freePacks: 1 },
};
