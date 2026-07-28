import type { Pack } from './mockPacks';
import { N2_TIERS, type N2Tier } from '../lib/n2Rarity';

/**
 * MOCK ODDS — 実データ待ち。表示・共有しないこと。
 * Every probability below is a PLACEHOLDER, not a real drop rate: the
 * card↔tier assignment does not exist yet (KNOWN_ISSUES #4). Do not share
 * screenshots of this table outside the team.
 *
 * §6 (v2.3): the odds table uses the same four steps and names as the tier
 * system, and every tier shown on screen must have a disclosed probability.
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

const NOTE = 'Demo probabilities and tier descriptions. Final rates may change before launch.';

/** MOCK probabilities — sum is exactly 100%. Awaiting real pack_versions data. */
const MOCK_TIER_CHANCES: Record<N2Tier, string> = {
  mythic: '0.5%',
  legendary: '2%',
  epic: '5.5%',
  base: '92%',
};

/**
 * MOCK tier descriptions — placeholders exactly like the probabilities above.
 * Until the real card↔tier pool exists (KNOWN_ISSUES #4, and grading status
 * unconfirmed — #6), the copy may state NO concrete contents: no grading
 * companies or grades, no card names, no rarity counts, no prize claims.
 * Only the tier's relative position. Intentionally identical for every
 * category — per-pack flavor returns when real pool data is wired.
 */
const MOCK_TIER_EXAMPLES: Record<N2Tier, string[]> = {
  mythic: ['Highest tier'],
  legendary: ['Second-highest tier'],
  epic: ['Mid tier'],
  base: ['Standard outcome'],
};

export function getMockPackOdds(_pack: Pack): PackOdds {
  return {
    rows: N2_TIERS.map((tier) => ({ tier, chance: MOCK_TIER_CHANCES[tier], examples: MOCK_TIER_EXAMPLES[tier] })),
    note: NOTE,
  };
}
