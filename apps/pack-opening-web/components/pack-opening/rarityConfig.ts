import type { RevealRarity, RarityTimingProfile } from './types';

/** Tier-driven animation intensity (premium collectible, not casino). */
export const RARITY_PROFILE: Record<RevealRarity, RarityTimingProfile> = {
  common: {
    durationMultiplier: 0.92,
    suspenseMs: 120,
    flashBrightness: 0.35,
    glowIntensity: 0.2,
    confetti: false,
    sound: { onReveal: 'tier_common', onResult: 'result_common' },
  },
  rare: {
    durationMultiplier: 1,
    suspenseMs: 200,
    flashBrightness: 0.5,
    glowIntensity: 0.45,
    confetti: false,
    sound: { onReveal: 'tier_rare', onResult: 'result_rare' },
  },
  ultra: {
    durationMultiplier: 1.08,
    suspenseMs: 320,
    flashBrightness: 0.65,
    glowIntensity: 0.65,
    confetti: false,
    sound: { onReveal: 'tier_ultra', onResult: 'result_ultra' },
  },
  chase: {
    durationMultiplier: 1.15,
    suspenseMs: 520,
    flashBrightness: 0.85,
    glowIntensity: 0.95,
    confetti: true,
    sound: { onReveal: 'tier_chase', onResult: 'result_chase' },
  },
};

export const RARITY_VISUAL: Record<
  RevealRarity,
  { label: string; gradient: string; ring: string; badge: string }
> = {
  common: {
    label: 'Common',
    gradient: 'from-slate-600/30 to-slate-800/40',
    ring: 'ring-slate-500/25',
    badge: 'bg-slate-600/90 text-slate-100',
  },
  rare: {
    label: 'Rare',
    gradient: 'from-sky-600/35 to-indigo-900/40',
    ring: 'ring-sky-400/35',
    badge: 'bg-sky-600/95 text-white',
  },
  ultra: {
    label: 'Ultra',
    gradient: 'from-violet-600/40 to-fuchsia-900/45',
    ring: 'ring-violet-400/45',
    badge: 'bg-violet-600/95 text-white',
  },
  chase: {
    label: 'Chase',
    gradient: 'from-amber-500/35 to-amber-900/50',
    ring: 'ring-amber-300/55',
    badge: 'bg-amber-600/95 text-amber-50',
  },
};
