import type { RarityTier } from '../../../../audio/packOpeningFeedback';

export type PackRingRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const RING_RARITIES: PackRingRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export function tierToRingRarity(tier: RarityTier): PackRingRarity {
  if (RING_RARITIES.includes(tier as PackRingRarity)) {
    return tier as PackRingRarity;
  }
  return 'rare';
}

export function parseRingRarity(raw: string | null | undefined): PackRingRarity {
  const v = raw?.trim().toLowerCase();
  if (v && RING_RARITIES.includes(v as PackRingRarity)) {
    return v as PackRingRarity;
  }
  return 'rare';
}
