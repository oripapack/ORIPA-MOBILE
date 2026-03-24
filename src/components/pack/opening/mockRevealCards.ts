import type { RarityTier } from '../../../audio/packOpeningFeedback';
import type { RevealCard, RevealRarity } from './types';
import { revealRarityFromTier } from './types';

const POOL: RevealCard[] = [
  {
    id: 'c1',
    name: 'Rookie Slab',
    image: '🧩',
    rarity: 'common',
    value: 12,
    color: '#14532d',
  },
  {
    id: 'c2',
    name: 'Trainer Notes',
    image: '📝',
    rarity: 'common',
    value: 18,
    color: '#1e293b',
  },
  {
    id: 'c3',
    name: 'Base Holo',
    image: '✨',
    rarity: 'common',
    value: 24,
    color: '#0f172a',
  },
  {
    id: 'r1',
    name: 'Parallel Edge',
    image: '💠',
    rarity: 'rare',
    value: 48,
    color: '#1e3a8a',
  },
  {
    id: 'r2',
    name: 'Alt Art Sketch',
    image: '🖋️',
    rarity: 'rare',
    value: 56,
    color: '#312e81',
  },
  {
    id: 'r3',
    name: 'Stadium Patch',
    image: '🏟️',
    rarity: 'rare',
    value: 62,
    color: '#1d4ed8',
  },
  {
    id: 'u1',
    name: 'Signature Series',
    image: '✍️',
    rarity: 'ultra_rare',
    value: 120,
    color: '#86198f',
  },
  {
    id: 'u2',
    name: 'Chromatic Wave',
    image: '🌊',
    rarity: 'ultra_rare',
    value: 140,
    color: '#701a75',
  },
  {
    id: 'u3',
    name: 'Legacy Frame',
    image: '🪟',
    rarity: 'ultra_rare',
    value: 155,
    color: '#5b21b6',
  },
  {
    id: 'ch1',
    name: 'Mythic Grail',
    image: '👑',
    rarity: 'chase',
    value: 320,
    color: '#881337',
  },
  {
    id: 'ch2',
    name: 'One-of-One Echo',
    image: '💎',
    rarity: 'chase',
    value: 400,
    color: '#9f1239',
  },
];

const WEIGHTS: Record<RevealRarity, number> = {
  common: 52,
  rare: 26,
  ultra_rare: 14,
  chase: 8,
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeightedRarity(rng: () => number): RevealRarity {
  const total = WEIGHTS.common + WEIGHTS.rare + WEIGHTS.ultra_rare + WEIGHTS.chase;
  let r = rng() * total;
  if (r < WEIGHTS.common) return 'common';
  r -= WEIGHTS.common;
  if (r < WEIGHTS.rare) return 'rare';
  r -= WEIGHTS.rare;
  if (r < WEIGHTS.ultra_rare) return 'ultra_rare';
  return 'chase';
}

function pickCardForRarity(rarity: RevealRarity, rng: () => number): RevealCard {
  const pool = POOL.filter((c) => c.rarity === rarity);
  if (pool.length === 0) return POOL[0]!;
  return pool[Math.floor(rng() * pool.length)]!;
}

/**
 * Resolves a demo card for the strip / reveal. The roll tier selects the display rarity;
 * which specific card is cosmetic for the MVP (no inventory).
 */
export function resolveRevealCardForTier(tier: RarityTier, sessionSalt: number): RevealCard {
  const rng = mulberry32(sessionSalt * 9973 + 1337);
  const targetRarity = revealRarityFromTier(tier);
  const same = POOL.filter((c) => c.rarity === targetRarity);
  if (same.length) {
    return { ...same[Math.floor(rng() * same.length)]! };
  }
  return { ...pickCardForRarity(pickWeightedRarity(rng), rng) };
}

export function randomFillerCard(seed: number): RevealCard {
  const rng = mulberry32(seed);
  const rarity = pickWeightedRarity(rng);
  const base = pickCardForRarity(rarity, rng);
  return { ...base, id: `f_${seed}_${base.id}` };
}
