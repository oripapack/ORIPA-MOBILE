/**
 * 実データ待ち。外部に見せないこと。
 * Presentation-only placeholders for the opening prototype. Product names,
 * grading claims, card photos, and monetary values must come from catalog data.
 */
import type { RarityTier } from '../../../audio/packOpeningFeedback';
import type { PackCategory } from '../../../data/mockPacks';
import type { RevealCard, RevealRarity } from './types';
import { revealRarityFromTier } from './types';

const MOCK_WEIGHTS: Record<RevealRarity, number> = {
  common: 52,
  rare: 26,
  ultra_rare: 14,
  chase: 8,
};

const MOCK_NEUTRAL_POOL: RevealCard[] = [
  { id: 'mock_base', name: 'Catalog item', image: 'BASE', rarity: 'common', value: 0, color: '#172033' },
  { id: 'mock_epic', name: 'Catalog item', image: 'EPIC', rarity: 'rare', value: 0, color: '#102A43' },
  { id: 'mock_legendary', name: 'Catalog item', image: 'LGND', rarity: 'ultra_rare', value: 0, color: '#123047' },
  { id: 'mock_mythic', name: 'Catalog item', image: 'MYTH', rarity: 'chase', value: 0, color: '#341829' },
];

const MOCK_POOLS: Record<PackCategory, RevealCard[]> = {
  onboarding: MOCK_NEUTRAL_POOL,
  micro: MOCK_NEUTRAL_POOL,
  premium: MOCK_NEUTRAL_POOL,
};

const DEFAULT_LINE: PackCategory = 'onboarding';

function poolFor(line: PackCategory): RevealCard[] {
  return MOCK_POOLS[line] ?? MOCK_POOLS[DEFAULT_LINE];
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeightedRarity(rng: () => number): RevealRarity {
  const total =
    MOCK_WEIGHTS.common +
    MOCK_WEIGHTS.rare +
    MOCK_WEIGHTS.ultra_rare +
    MOCK_WEIGHTS.chase;
  let r = rng() * total;
  if (r < MOCK_WEIGHTS.common) return 'common';
  r -= MOCK_WEIGHTS.common;
  if (r < MOCK_WEIGHTS.rare) return 'rare';
  r -= MOCK_WEIGHTS.rare;
  if (r < MOCK_WEIGHTS.ultra_rare) return 'ultra_rare';
  return 'chase';
}

function pickCardForRarity(rarity: RevealRarity, rng: () => number, line: PackCategory): RevealCard {
  const pool = poolFor(line).filter((c) => c.rarity === rarity);
  if (pool.length === 0) return poolFor(line)[0]!;
  return pool[Math.floor(rng() * pool.length)]!;
}

/**
 * Demo reveal card for the strip / hero card. `prizeLine` must match the pack's tier
 * (onboarding, micro, or premium — never 'all').
 */
export function resolveRevealCardForTier(
  tier: RarityTier,
  sessionSalt: number,
  prizeLine: PackCategory,
): RevealCard {
  const rng = mulberry32(sessionSalt * 9973 + 1337);
  const targetRarity = revealRarityFromTier(tier);
  const same = poolFor(prizeLine).filter((c) => c.rarity === targetRarity);
  if (same.length) {
    return { ...same[Math.floor(rng() * same.length)]! };
  }
  return { ...pickCardForRarity(pickWeightedRarity(rng), rng, prizeLine) };
}

export function randomFillerCard(seed: number, prizeLine: PackCategory): RevealCard {
  const rng = mulberry32(seed);
  const rarity = pickWeightedRarity(rng);
  const base = pickCardForRarity(rarity, rng, prizeLine);
  return { ...base, id: `f_${seed}_${base.id}` };
}
