import type { N2Tier } from '../../../lib/n2Rarity';

/** Pull-result screen: tier colors and glow strength (BASE → MYTHIC). */
export type TierCelebrationVisual = {
  accent: string;
  glow: string;
  border: string;
  halo: string;
  emoji: string;
  /** 0–1; drives optional ambient pulse on the hero halo */
  pulseStrength: number;
};

export const TIER_CELEBRATION: Record<N2Tier, TierCelebrationVisual> = {
  base: {
    accent: '#CBD5E1',
    glow: 'rgba(203, 213, 225, 0.38)',
    border: 'rgba(148, 163, 184, 0.55)',
    halo: 'rgba(148, 163, 184, 0.22)',
    emoji: '●',
    pulseStrength: 0.12,
  },
  epic: {
    accent: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.52)',
    border: 'rgba(192, 132, 252, 0.88)',
    halo: 'rgba(147, 51, 234, 0.3)',
    emoji: '✧',
    pulseStrength: 0.48,
  },
  legendary: {
    accent: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.55)',
    border: 'rgba(251, 191, 36, 0.92)',
    halo: 'rgba(245, 158, 11, 0.32)',
    emoji: '★',
    pulseStrength: 0.62,
  },
  mythic: {
    accent: '#FDE68A',
    glow: 'rgba(253, 224, 71, 0.58)',
    border: 'rgba(255, 250, 235, 0.88)',
    halo: 'rgba(250, 204, 21, 0.35)',
    emoji: '✺',
    pulseStrength: 0.82,
  },
};

export function tierCelebrationFor(tier: N2Tier): TierCelebrationVisual {
  return TIER_CELEBRATION[tier] ?? TIER_CELEBRATION.base;
}
