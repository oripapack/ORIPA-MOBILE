import type { PackCategory, Pack } from './mockPacks';
import { N2_TIERS, type N2Tier } from '../lib/n2Rarity';

/**
 * MOCK ODDS — 実データ待ち。表示・共有しないこと。
 * Every probability below is a PLACEHOLDER, not a real drop rate: the
 * card↔tier assignment does not exist yet (KNOWN_ISSUES #4). Do not share
 * screenshots of this table outside the team.
 *
 * §6: the odds table uses the same six steps and names as the tier system,
 * and every tier shown on screen must have a disclosed probability.
 */

export type OddsTier = N2Tier;

export type TierOddsRow = {
  tier: OddsTier;
  chance: string;
  examples: string[];
};

export type PackOdds = {
  rows: TierOddsRow[];
  note: string;
};

/** Safe empty placeholder when pack is unresolved (hooks run before screen guard). */
export const EMPTY_PACK_ODDS: PackOdds = { rows: [], note: '' };

const NOTE = 'Demo probabilities. Final rates may change before launch.';

/** MOCK probabilities — sum is exactly 100%. Awaiting real pack_versions data. */
const MOCK_TIER_CHANCES: Record<N2Tier, string> = {
  mythic: '0.5%',
  legendary: '2%',
  epic: '5.5%',
  rare: '12%',
  uncommon: '30%',
  common: '50%',
};

/** Existing demo reward copy redistributed across the six tiers (no new claims invented). */
const MOCK_TIER_EXAMPLES: Record<PackCategory, Record<N2Tier, string[]>> = {
  onboarding: {
    mythic: ['3× coin bonus'],
    legendary: ['Welcome surprise card'],
    epic: ['2× coin bonus'],
    rare: ['Holographic promo'],
    uncommon: ['Rare card', '1.5× coin return'],
    common: ['Standard card', '1× coin return'],
  },
  micro: {
    mythic: ['Nintendo Switch', 'PS5', 'iPhone 16'],
    legendary: ['Gift coupon (¥5,000)'],
    epic: ['Ultra rare card'],
    rare: ['Rare card'],
    uncommon: ['Coin bonus ×2'],
    common: ['Standard card', 'Small coin return'],
  },
  premium: {
    mythic: ['PSA 10 Trophy Card', '1/1 holy grail'],
    legendary: ['Chase-grade slab'],
    epic: ['PSA 9+ vintage holo'],
    rare: ['Graded card hit'],
    uncommon: ['Premium rare'],
    common: ['High-value standard', 'Base chase card'],
  },
};

export function getMockPackOdds(pack: Pack): PackOdds {
  const examples = MOCK_TIER_EXAMPLES[pack.category] ?? MOCK_TIER_EXAMPLES.onboarding;
  return {
    rows: N2_TIERS.map((tier) => ({ tier, chance: MOCK_TIER_CHANCES[tier], examples: examples[tier] })),
    note: NOTE,
  };
}
