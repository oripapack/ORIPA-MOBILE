import type { N2Tier } from '../../../../lib/n2Rarity';
import { legacyTierToN2 } from '../../../../lib/n2Rarity';

/** N2 pull tier passed to the 3D opening scene. */
export type PackRingRarity = N2Tier;

export function tierToRingRarity(tier: N2Tier | string): PackRingRarity {
  return typeof tier === 'string' && tier.length > 0 ? legacyTierToN2(tier) : (tier as N2Tier);
}

export function parseRingRarity(raw: string | null | undefined): PackRingRarity {
  return legacyTierToN2(raw ?? 'base');
}
