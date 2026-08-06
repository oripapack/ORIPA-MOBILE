import type { ImageSourcePropType } from 'react-native';
import type { N2Tier } from '../../../lib/n2Rarity';

export type PackOpeningStyle = 'csgo' | 'fifa' | 'hybrid';
export type PackOpeningPhase =
  | 'idle'
  | 'intro'
  /** Pachinko rails / atmosphere ramp before taps register */
  | 'arming'
  /** Tap-to-charge */
  | 'spinning'
  /**
   * Meter full — user must tap again to trigger the break (agency / “my timing”).
   * Does **not** change the pre-rolled outcome; presentation only.
   */
  | 'commit'
  /** Full charge: shake + strobes before the pack breaks */
  | 'primed'
  | 'slowing'
  | 'landing'
  | 'reveal'
  | 'result';

/** Display tiers for the reveal UI (demo pool cards). */
export type RevealRarity = 'common' | 'rare' | 'ultra_rare' | 'chase';

export interface RevealCard {
  id: string;
  name: string;
  /** Demo: emoji or short glyph for card art */
  image: string;
  /** Optional slab artwork (`require(...)` or `{ uri }`). When absent, a monogram fallback is shown. */
  artwork?: ImageSourcePropType;
  rarity: RevealRarity;
  value: number;
  color: string;
}

export type PackRollResult = {
  result: string;
  creditsWon: number;
  tier: N2Tier;
};

/** Map N2 pull tier → reveal animation vocabulary (presentation only). */
export function revealRarityFromTier(tier: N2Tier): RevealRarity {
  switch (tier) {
    case 'base':
      return 'common';
    case 'epic':
      return 'rare';
    case 'legendary':
      return 'ultra_rare';
    case 'mythic':
      return 'chase';
    default:
      return 'common';
  }
}
