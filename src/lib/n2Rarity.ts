/**
 * N2 §6 (v2.2) tiers — MYTHIC / LEGENDARY / EPIC / RARE / UNCOMMON / COMMON.
 *
 * A tier describes the pull ("引きの良さ") and belongs to the PACK side — it
 * is NOT a card attribute. Printed card rarity (SR / SAR / Secret Rare /
 * Alt Art …) is a separate vocabulary and must render in its own field,
 * never in the tier slot. The UI label is "TIER", not "RARITY".
 *
 * SINGLE mapping path: a tier may only come from disclosed odds-table data
 * (mockPackOdds rows carry N2Tier directly) or an explicit card→tier link.
 * Deriving tiers from card labels, names or prices is forbidden — it
 * created contradictory colors for the same card and risks misleading
 * rarity presentation.
 *
 * The only card→tier link in the current data is PackTopHit.isChase.
 */

export type N2Tier = 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

/**
 * The low tiers mean "judged low" — they must never absorb "cannot judge,
 * no tier data". Cards without a defined tier are UNKNOWN and render with
 * NO tier chrome at all (no tag, no color).
 */
export type N2TierState = N2Tier | 'unknown';

/** Top → bottom display order (§6 — the odds table uses the same six steps). */
export const N2_TIERS: readonly N2Tier[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

/**
 * isChase is a boolean, so it can only assert "top tier or not":
 * true → MYTHIC; false stays UNKNOWN — never downgraded to a low tier.
 */
export function tierFromIsChase(isChase: boolean): N2TierState {
  return isChase ? 'mythic' : 'unknown';
}
