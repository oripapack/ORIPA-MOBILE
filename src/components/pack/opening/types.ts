import type { RarityTier } from '../../../audio/packOpeningFeedback';

export type PackOpeningStyle = 'csgo' | 'fifa' | 'hybrid';
export type PackOpeningPhase = 'idle' | 'intro' | 'spinning' | 'slowing' | 'landing' | 'reveal' | 'result';

/** Display tiers for the reveal UI (demo pool cards). */
export type RevealRarity = 'common' | 'rare' | 'ultra_rare' | 'chase';

export interface RevealCard {
  id: string;
  name: string;
  /** Demo: emoji or short glyph for card art */
  image: string;
  rarity: RevealRarity;
  value: number;
  color: string;
}

export type PackRollResult = {
  result: string;
  creditsWon: number;
  tier: RarityTier;
};

export function revealRarityFromTier(tier: RarityTier): RevealRarity {
  switch (tier) {
    case 'common':
      return 'common';
    case 'rare':
      return 'rare';
    case 'epic':
    case 'legendary':
      return 'ultra_rare';
    case 'mythic':
      return 'chase';
    default:
      return 'common';
  }
}
