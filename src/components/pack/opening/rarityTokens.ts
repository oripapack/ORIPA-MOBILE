import type { RevealRarity } from './types';

export type RevealRarityVisual = {
  label: string;
  emoji: string;
  accent: string;
  glow: string;
  border: string;
  glowStrength: number;
  animationIntensity: number;
  /** Base duration for flip / finale (lower = snappier) */
  revealSpeedMs: number;
  cardTop: string;
  ovrBg: string;
  beam: string;
  beamSoft: string;
};

export const REVEAL_RARITY_VISUAL: Record<RevealRarity, RevealRarityVisual> = {
  common: {
    label: 'COMMON',
    emoji: '●',
    accent: '#4ADE80',
    glow: 'rgba(34, 197, 94, 0.55)',
    border: 'rgba(74, 222, 128, 0.95)',
    glowStrength: 0.35,
    animationIntensity: 0.35,
    revealSpeedMs: 520,
    cardTop: '#0f1f14',
    ovrBg: '#15803D',
    beam: 'rgba(74, 222, 128, 0.45)',
    beamSoft: 'rgba(74, 222, 128, 0.14)',
  },
  rare: {
    label: 'RARE',
    emoji: '✦',
    accent: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.65)',
    border: 'rgba(96, 165, 250, 1)',
    glowStrength: 0.55,
    animationIntensity: 0.5,
    revealSpeedMs: 640,
    cardTop: '#172554',
    ovrBg: '#2563EB',
    beam: 'rgba(59, 130, 246, 0.55)',
    beamSoft: 'rgba(59, 130, 246, 0.15)',
  },
  ultra_rare: {
    label: 'ULTRA RARE',
    emoji: '✧',
    /** Sapphire / indigo — separates from purple-magenta chase lane */
    accent: '#7DD3FC',
    glow: 'rgba(56, 189, 248, 0.45)',
    border: 'rgba(125, 211, 252, 0.95)',
    glowStrength: 0.68,
    animationIntensity: 0.72,
    revealSpeedMs: 820,
    cardTop: '#0c1929',
    ovrBg: '#0369a1',
    beam: 'rgba(56, 189, 248, 0.5)',
    beamSoft: 'rgba(56, 189, 248, 0.14)',
  },
  chase: {
    label: 'CHASE',
    emoji: '★',
    accent: '#FB7185',
    glow: 'rgba(244, 63, 94, 0.82)',
    border: 'rgba(251, 113, 133, 1)',
    glowStrength: 0.95,
    animationIntensity: 0.95,
    revealSpeedMs: 1100,
    cardTop: '#450a0a',
    ovrBg: '#BE123C',
    beam: 'rgba(251, 113, 133, 0.58)',
    beamSoft: 'rgba(251, 113, 133, 0.18)',
  },
};
