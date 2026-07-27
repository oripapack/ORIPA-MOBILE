/**
 * N2 §6 rarity ranks — CHASE / HIT / BASE.
 *
 * The display ranks MUST stay aligned with the tiers we disclose in the odds
 * table (mockPackOdds: 'Top hit' | 'Ultra' | 'Rare' | 'Common', 4 tiers) —
 * showing more color tiers than disclosed odds tiers risks misleading rarity
 * presentation. Collapse rule (per design decision): top tier → CHASE,
 * second → HIT, everything else → BASE.
 */

export type N2Rank = 'chase' | 'hit' | 'base';

/** Odds-table rows are ordered top-down; index 0 = 'Top hit'. */
export function rankFromOddsIndex(index: number): N2Rank {
  if (index === 0) return 'chase';
  if (index === 1) return 'hit';
  return 'base';
}

/**
 * Card-side rarity labels (RarityTier 'mythic'|'legendary'|'epic'|'rare'|
 * 'common', also seen capitalized in mock data) collapsed by the same
 * top-1 / next-1 / rest rule. Unknown labels fall to BASE — never gold.
 */
export function rankFromRarityLabel(label: string | undefined | null): N2Rank {
  switch ((label ?? '').toLowerCase()) {
    case 'mythic':
      return 'chase';
    case 'legendary':
      return 'hit';
    default:
      return 'base';
  }
}
