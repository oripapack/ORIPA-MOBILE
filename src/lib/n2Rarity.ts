import type { OddsTier } from '../data/mockPackOdds';

/**
 * N2 §6 rarity ranks — CHASE / HIT / BASE.
 *
 * SINGLE mapping path: card rarity → odds tier → N2 rank. Display ranks must
 * come from the tiers we disclose in the odds table (mockPackOdds:
 * 'Top hit' | 'Ultra' | 'Rare' | 'Common') — deriving ranks from card labels
 * directly created contradictory colors for the same card and risks
 * misleading rarity presentation.
 *
 * Card → odds-tier membership is DATA, not a client-side guess:
 * - PackTopHit.isChase (mockTopHits) is currently the only such link
 *   (true → 'Top hit'). Anything without a defined tier membership renders
 *   as BASE until the pool mapping exists — never gold.
 */

export type N2Rank = 'chase' | 'hit' | 'base';

/**
 * BASE means "judged, and it is a lower tier" — it must never absorb
 * "cannot judge, no tier data". Cards without a defined odds-tier membership
 * are UNKNOWN and render with NO rank chrome at all (no color, no badge;
 * the label itself shows in the default text color).
 */
export type N2RankState = N2Rank | 'unknown';

/** The one public mapping: odds tier → N2 rank (top → CHASE, second → HIT, rest → BASE). */
export function rankFromOddsTier(tier: OddsTier): N2Rank {
  switch (tier) {
    case 'Top hit':
      return 'chase';
    case 'Ultra':
      return 'hit';
    default:
      return 'base';
  }
}
