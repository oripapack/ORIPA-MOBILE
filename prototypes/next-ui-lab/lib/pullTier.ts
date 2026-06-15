import type { PullRarityTier } from '../../../shared/api/types';
import type { RevealRarity } from '@/components/pack-opening/types';

export function pullTierToRevealRarity(tier: PullRarityTier): RevealRarity {
  switch (tier) {
    case 'common':
      return 'common';
    case 'rare':
      return 'rare';
    case 'epic':
    case 'legendary':
      return 'ultra';
    case 'mythic':
      return 'chase';
    default:
      return 'common';
  }
}
