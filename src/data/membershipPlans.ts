/**
 * 実データ待ち。外部に見せないこと。
 * Pull Hub membership preview only: prices, Points grants, tier gates, and
 * benefits are MOCK product assumptions until billing and entitlement data exist.
 */

export type MembershipTierId = 'silver' | 'gold' | 'black';

/** Silver < Gold < Black — used for pack access gates. */
export const MEMBERSHIP_TIER_RANK: Record<MembershipTierId, number> = {
  silver: 0,
  gold: 1,
  black: 2,
};

export function membershipMeetsRequired(
  active: MembershipTierId | null | undefined,
  required: MembershipTierId,
): boolean {
  if (!active) return false;
  return MEMBERSHIP_TIER_RANK[active] >= MEMBERSHIP_TIER_RANK[required];
}

export interface MembershipPlan {
  id: MembershipTierId;
  /** Monthly price in USD (display only until IAP is wired). */
  priceUsd: number;
  monthlyPoints: number;
  /** Ordered benefit ids — must exist under `membership.benefits` in locales. */
  benefitIds: string[];
  /** Gold tier is the recommended plan in product. */
  isPopular: boolean;
  /** Card stack order (e.g. Silver → Gold → Black). */
  sortOrder: number;
}

const MOCK_MEMBERSHIP_PLANS_UNSORTED: MembershipPlan[] = [
  {
    id: 'silver',
    priceUsd: 9.99,
    monthlyPoints: 1200,
    benefitIds: ['silver_packs', 'early_drops', 'silver_badge'],
    isPopular: false,
    sortOrder: 0,
  },
  {
    id: 'gold',
    priceUsd: 29.99,
    monthlyPoints: 4000,
    benefitIds: ['gold_packs', 'earlier_drops', 'premium_drops', 'gold_badge'],
    isPopular: true,
    sortOrder: 1,
  },
  {
    id: 'black',
    priceUsd: 99.99,
    monthlyPoints: 15000,
    benefitIds: ['black_packs', 'earliest_drops', 'ultra_drops', 'vip_support', 'black_badge'],
    isPopular: false,
    sortOrder: 2,
  },
];

export const MOCK_MEMBERSHIP_PLANS = [...MOCK_MEMBERSHIP_PLANS_UNSORTED].sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

export function getMembershipPlan(id: MembershipTierId): MembershipPlan | undefined {
  return MOCK_MEMBERSHIP_PLANS.find((p) => p.id === id);
}
