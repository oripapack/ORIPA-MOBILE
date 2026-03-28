/**
 * Pack opening engine — shared types (web / Next.js demo).
 */

export type PackOpeningPhase =
  | 'idle'
  | 'intro'
  | 'spinning'
  | 'slowing'
  | 'landing'
  | 'reveal'
  | 'result';

/** Product-facing tiers (maps from gameplay tiers if needed). */
export type RevealRarity = 'common' | 'rare' | 'ultra' | 'chase';

export interface RevealCard {
  id: string;
  name: string;
  /** Placeholder: emoji, URL, or short token */
  image: string;
  rarity: RevealRarity;
  value: number;
  color: string;
}

export type PackOpeningSpeed = 'slow' | 'normal' | 'fast';

export interface RarityTimingProfile {
  /** Multiplier applied to base segment durations */
  durationMultiplier: number;
  /** Extra suspense pause before reveal (ms) */
  suspenseMs: number;
  /** Flash peak opacity 0–1 */
  flashBrightness: number;
  /** Glow intensity 0–1 */
  glowIntensity: number;
  /** Enable light confetti (chase only) */
  confetti: boolean;
  /** Optional hooks for SFX integration */
  sound: {
    onIntroEnd?: string;
    onReveal?: string;
    onResult?: string;
  };
}

export interface ReelLayoutConfig {
  /** Width of one slot (card + gap) in px */
  slotWidth: number;
  /** Card width inside slot */
  cardWidth: number;
}

export interface PackOpeningEngineProps {
  /** Winning card (must appear on reel) */
  winningCard: RevealCard;
  /** Session seed for deterministic reel strip */
  sessionSalt?: number;
  /** Dev: show speed toggle */
  showDevControls?: boolean;
  onComplete?: () => void;
}
