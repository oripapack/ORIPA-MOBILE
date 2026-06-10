import type { RarityTier } from '../../../audio/packOpeningFeedback';
import type { PackCategory } from '../../../data/mockPacks';
import type { RevealCard, RevealRarity } from './types';
import { revealRarityFromTier } from './types';

/** Demo slab artwork — swap for real card art when catalog is wired. */
const welcomePackArt = require('../../../../assets/pack-images/welcome_pack.png');

const WEIGHTS: Record<RevealRarity, number> = {
  common: 52,
  rare: 26,
  ultra_rare: 14,
  chase: 8,
};

const POOLS: Record<PackCategory, RevealCard[]> = {
  onboarding: [
    { id: 'ob_c1', name: 'Welcome Card', image: '🎁', rarity: 'common', value: 50, color: '#166534', artwork: welcomePackArt },
    { id: 'ob_c2', name: 'Promo Coin Bonus', image: '🪙', rarity: 'common', value: 50, color: '#CA8A04' },
    { id: 'ob_c3', name: 'Starter Pack Card', image: '🃏', rarity: 'common', value: 55, color: '#14532D' },
    { id: 'ob_r1', name: 'First-Pull Rare', image: '⭐', rarity: 'rare', value: 100, color: '#CA8A04', artwork: welcomePackArt },
    { id: 'ob_r2', name: 'Bonus Holo', image: '✨', rarity: 'rare', value: 110, color: '#86198F' },
    { id: 'ob_r3', name: 'Welcome Promo', image: '🎉', rarity: 'rare', value: 105, color: '#EA580C' },
    { id: 'ob_u1', name: '2× Coin Bonus', image: '💰', rarity: 'ultra_rare', value: 200, color: '#CA8A04' },
    { id: 'ob_u2', name: 'Surprise Rare Card', image: '🌟', rarity: 'ultra_rare', value: 180, color: '#1E1B4B' },
    { id: 'ob_u3', name: 'Premium Welcome Hit', image: '🏆', rarity: 'ultra_rare', value: 220, color: '#831843' },
    { id: 'ob_ch1', name: '3× Bonus Coins', image: '👑', rarity: 'chase', value: 500, color: '#881337', artwork: welcomePackArt },
    { id: 'ob_ch2', name: 'Welcome Chase Surprise', image: '💎', rarity: 'chase', value: 600, color: '#9F1239' },
  ],
  micro: [
    { id: 'mc_c1', name: 'Lucky Coin', image: '🪙', rarity: 'common', value: 10, color: '#1A2E5A' },
    { id: 'mc_c2', name: 'Mini Card', image: '🃏', rarity: 'common', value: 12, color: '#0F172A' },
    { id: 'mc_c3', name: 'Small Gift Coupon', image: '🎫', rarity: 'common', value: 10, color: '#1E3A5F' },
    { id: 'mc_r1', name: 'Rare Card Hit', image: '⭐', rarity: 'rare', value: 50, color: '#1E40AF' },
    { id: 'mc_r2', name: 'Bonus Coupon ×2', image: '💳', rarity: 'rare', value: 45, color: '#14532D' },
    { id: 'mc_r3', name: 'Double Coin Pull', image: '💰', rarity: 'rare', value: 55, color: '#854D0E' },
    { id: 'mc_u1', name: 'Nintendo Switch', image: '🎮', rarity: 'ultra_rare', value: 30000, color: '#EA0A0A' },
    { id: 'mc_u2', name: 'PS5', image: '🕹️', rarity: 'ultra_rare', value: 70000, color: '#003087' },
    { id: 'mc_u3', name: 'Gift Card ¥5,000', image: '🎁', rarity: 'ultra_rare', value: 5000, color: '#166534' },
    { id: 'mc_ch1', name: 'iPhone 16', image: '📱', rarity: 'chase', value: 120000, color: '#881337' },
    { id: 'mc_ch2', name: 'PS5 + Game Bundle', image: '👑', rarity: 'chase', value: 90000, color: '#9F1239' },
  ],
  premium: [
    { id: 'pm_c1', name: 'Base Chase Card', image: '🃏', rarity: 'common', value: 1000, color: '#1B0A3A' },
    { id: 'pm_c2', name: 'High-Value Standard', image: '✨', rarity: 'common', value: 1200, color: '#2D1A6B' },
    { id: 'pm_c3', name: 'Vintage Reprint', image: '📜', rarity: 'common', value: 1100, color: '#1C1048' },
    { id: 'pm_r1', name: 'Graded Card Hit', image: '🏅', rarity: 'rare', value: 5000, color: '#C084FC' },
    { id: 'pm_r2', name: 'Premium Rare', image: '⭐', rarity: 'rare', value: 6000, color: '#4C1D95' },
    { id: 'pm_r3', name: 'PSA 9 Vintage Holo', image: '🌟', rarity: 'rare', value: 8000, color: '#5B21B6' },
    { id: 'pm_u1', name: 'Chase-Grade Slab', image: '💜', rarity: 'ultra_rare', value: 30000, color: '#312E81' },
    { id: 'pm_u2', name: 'PSA 9+ Alt Art', image: '🔮', rarity: 'ultra_rare', value: 50000, color: '#1E1B4B' },
    { id: 'pm_u3', name: 'Ultra Rare Slab', image: '💎', rarity: 'ultra_rare', value: 40000, color: '#3730A3' },
    { id: 'pm_ch1', name: 'PSA 10 Trophy Card', image: '👑', rarity: 'chase', value: 500000, color: '#881337', artwork: welcomePackArt },
    { id: 'pm_ch2', name: '1/1 Holy Grail Chase', image: '🏆', rarity: 'chase', value: 1000000, color: '#9F1239' },
  ],
};

const DEFAULT_LINE: PackCategory = 'onboarding';

function poolFor(line: PackCategory): RevealCard[] {
  return POOLS[line] ?? POOLS[DEFAULT_LINE];
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
  const total = WEIGHTS.common + WEIGHTS.rare + WEIGHTS.ultra_rare + WEIGHTS.chase;
  let r = rng() * total;
  if (r < WEIGHTS.common) return 'common';
  r -= WEIGHTS.common;
  if (r < WEIGHTS.rare) return 'rare';
  r -= WEIGHTS.rare;
  if (r < WEIGHTS.ultra_rare) return 'ultra_rare';
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
