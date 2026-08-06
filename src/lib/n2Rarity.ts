/**
 * N2 §6 (v2.3) tiers — MYTHIC / LEGENDARY / EPIC / BASE.
 *
 * A tier describes the pull ("引きの良さ") and belongs to the PACK side — it
 * is NOT a card attribute. Printed card rarity (SR / SAR / Secret Rare /
 * Alt Art …) is a separate vocabulary and must render in its own field,
 * never in the tier slot. The UI label is "TIER", not "RARITY".
 *
 * Context rule (§6): the same tier renders differently by placement —
 * disclosure (odds table) shows all four steps equally readable; card
 * badges show only the top three (BASE renders nothing).
 *
 * SINGLE mapping path: a tier may only come from disclosed odds-table data
 * (mockPackOdds rows carry N2Tier directly) or an explicit card→tier link.
 * Deriving tiers from card labels, names or prices is forbidden — it
 * created contradictory colors for the same card and risks misleading
 * rarity presentation.
 *
 * The only card→tier link in the current data is PackTopHit.isChase.
 */

export type N2Tier = 'mythic' | 'legendary' | 'epic' | 'base';

/**
 * BASE means "judged, and it is the low tier" — it must never absorb
 * "cannot judge, no tier data". Cards without a defined tier are UNKNOWN
 * and render with NO tier chrome at all (no tag, no color).
 */
export type N2TierState = N2Tier | 'unknown';

/** Top → bottom display order (§6 — the odds table uses the same four steps). */
export const N2_TIERS: readonly N2Tier[] = ['mythic', 'legendary', 'epic', 'base'];

/** Lowest → highest for roll ranking and sort. */
export const N2_TIER_RANK: Record<N2Tier, number> = {
  base: 0,
  epic: 1,
  legendary: 2,
  mythic: 3,
};

/**
 * isChase is a boolean, so it can only assert "top tier or not":
 * true → MYTHIC; false stays UNKNOWN — never downgraded to a low tier.
 */
export function tierFromIsChase(isChase: boolean): N2TierState {
  return isChase ? 'mythic' : 'unknown';
}

export function isN2Tier(value: string): value is N2Tier {
  return (N2_TIERS as readonly string[]).includes(value);
}

/** Uppercase label for UI chrome (odds rows, badges). */
export function n2TierLabel(tier: N2Tier): string {
  return tier.toUpperCase();
}

/**
 * Map legacy 5-tier strings, admin DB labels, and unknown inputs → N2 pull tier.
 * Used during migration and when reading persisted / external data.
 */
export function legacyTierToN2(tier: string): N2Tier {
  const t = tier.trim().toLowerCase();
  switch (t) {
    case 'mythic':
    case 'grail':
      return 'mythic';
    case 'legendary':
      return 'legendary';
    case 'epic':
    case 'mid-tier':
    case 'mid_tier':
      return 'epic';
    case 'base':
    case 'bulk':
    case 'common':
    case 'rare':
    case 'uncommon':
      return 'base';
    default:
      return 'base';
  }
}
