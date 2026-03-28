import type { RarityTier } from '../../../audio/packOpeningFeedback';
import type { HomeNicheCategory } from '../../../data/mockPacks';
import type { RevealCard, RevealRarity } from './types';
import { revealRarityFromTier } from './types';

const WEIGHTS: Record<RevealRarity, number> = {
  common: 52,
  rare: 26,
  ultra_rare: 14,
  chase: 8,
};

const POOLS: Record<HomeNicheCategory, RevealCard[]> = {
  pokemon: [
    { id: 'pk_c1', name: 'Sprigatito (PAL)', image: '🐱', rarity: 'common', value: 12, color: '#166534' },
    { id: 'pk_c2', name: 'Basic Lightning Energy', image: '⚡', rarity: 'common', value: 10, color: '#CA8A04' },
    { id: 'pk_c3', name: 'Nest Ball', image: '🥎', rarity: 'common', value: 14, color: '#14532D' },
    { id: 'pk_r1', name: 'Pikachu (PAL)', image: '🐭', rarity: 'rare', value: 48, color: '#CA8A04' },
    { id: 'pk_r2', name: 'Iono (IR)', image: '🎨', rarity: 'rare', value: 58, color: '#86198F' },
    { id: 'pk_r3', name: 'Charmander (151)', image: '🦎', rarity: 'rare', value: 52, color: '#EA580C' },
    { id: 'pk_u1', name: 'Charizard ex (OBF)', image: '🔥', rarity: 'ultra_rare', value: 140, color: '#9A3412' },
    { id: 'pk_u2', name: 'Umbreon VMAX Alt', image: '🌙', rarity: 'ultra_rare', value: 165, color: '#1E1B4B' },
    { id: 'pk_u3', name: 'Gardevoir ex SAR', image: '✨', rarity: 'ultra_rare', value: 155, color: '#831843' },
    { id: 'pk_ch1', name: 'PSA 10 Charizard ex', image: '👑', rarity: 'chase', value: 320, color: '#881337' },
    { id: 'pk_ch2', name: 'Mew ex SAR (SV4a)', image: '💎', rarity: 'chase', value: 400, color: '#9F1239' },
  ],
  yugioh: [
    { id: 'yg_c1', name: 'Effect Veiler', image: '✨', rarity: 'common', value: 11, color: '#312E81' },
    { id: 'yg_c2', name: 'Ash Blossom & Joyous Spring', image: '🌸', rarity: 'common', value: 18, color: '#831843' },
    { id: 'yg_c3', name: 'Pot of Prosperity', image: '🏺', rarity: 'common', value: 16, color: '#4C1D95' },
    { id: 'yg_r1', name: 'Tearlaments Merrli', image: '🌊', rarity: 'rare', value: 52, color: '#164E63' },
    { id: 'yg_r2', name: 'Kashtira Fenrir', image: '🐺', rarity: 'rare', value: 48, color: '#1E3A8A' },
    { id: 'yg_r3', name: 'Branded Fusion', image: '🔗', rarity: 'rare', value: 55, color: '#7C2D12' },
    { id: 'yg_u1', name: 'Dark Magician LOB Reprint', image: '🧙', rarity: 'ultra_rare', value: 130, color: '#312E81' },
    { id: 'yg_u2', name: 'Blue-Eyes White Dragon CR', image: '🐉', rarity: 'ultra_rare', value: 148, color: '#1E40AF' },
    { id: 'yg_u3', name: 'Nibiru, the Primal Being', image: '☄️', rarity: 'ultra_rare', value: 138, color: '#4C1D95' },
    { id: 'yg_ch1', name: 'Starlight Rare Accesscode', image: '👑', rarity: 'chase', value: 340, color: '#881337' },
    { id: 'yg_ch2', name: 'LOB Dark Magician 1st', image: '💎', rarity: 'chase', value: 410, color: '#9F1239' },
  ],
  one_piece: [
    { id: 'op_c1', name: 'ST01 Monkey D. Luffy', image: '🏴‍☠️', rarity: 'common', value: 12, color: '#991B1B' },
    { id: 'op_c2', name: 'DON!! Card', image: '💎', rarity: 'common', value: 10, color: '#0F172A' },
    { id: 'op_c3', name: 'Nami (ST01)', image: '🧭', rarity: 'common', value: 14, color: '#EA580C' },
    { id: 'op_r1', name: 'Zoro Leader (ST12)', image: '⚔️', rarity: 'rare', value: 50, color: '#14532D' },
    { id: 'op_r2', name: 'Sanji (OP-06)', image: '🍖', rarity: 'rare', value: 54, color: '#1E1B4B' },
    { id: 'op_r3', name: 'Boa Hancock SR', image: '🐍', rarity: 'rare', value: 48, color: '#831843' },
    { id: 'op_u1', name: 'Shanks Leader Alt Art', image: '🥃', rarity: 'ultra_rare', value: 140, color: '#7F1D1D' },
    { id: 'op_u2', name: 'Luffy Manga Rare', image: '📖', rarity: 'ultra_rare', value: 160, color: '#B91C1C' },
    { id: 'op_u3', name: 'Law Full Art Parallel', image: '⚕️', rarity: 'ultra_rare', value: 150, color: '#164E63' },
    { id: 'op_ch1', name: 'PSA 10 Luffy Leader', image: '👑', rarity: 'chase', value: 330, color: '#881337' },
    { id: 'op_ch2', name: 'Manga Shanks Parallel', image: '💎', rarity: 'chase', value: 400, color: '#9F1239' },
  ],
  sports: [
    { id: 'sp_c1', name: 'Rated Rookie Base', image: '🏀', rarity: 'common', value: 11, color: '#1E3A5F' },
    { id: 'sp_c2', name: 'Silver Prizm Base', image: '⚪', rarity: 'common', value: 13, color: '#64748B' },
    { id: 'sp_c3', name: 'Insert Laser', image: '✨', rarity: 'common', value: 12, color: '#0C4A6E' },
    { id: 'sp_r1', name: 'Prizm Rookie Silver', image: '🔷', rarity: 'rare', value: 52, color: '#1E40AF' },
    { id: 'sp_r2', name: 'Optic Holo RC', image: '🎯', rarity: 'rare', value: 56, color: '#14532D' },
    { id: 'sp_r3', name: 'Select Concourse', image: '🏟️', rarity: 'rare', value: 50, color: '#854D0E' },
    { id: 'sp_u1', name: 'National Treasures RPA', image: '🖊️', rarity: 'ultra_rare', value: 145, color: '#422006' },
    { id: 'sp_u2', name: 'Flawless Diamond /10', image: '💠', rarity: 'ultra_rare', value: 158, color: '#1C1917' },
    { id: 'sp_u3', name: 'Gold Prizm /10', image: '🥇', rarity: 'ultra_rare', value: 152, color: '#A16207' },
    { id: 'sp_ch1', name: 'Logoman 1/1 Shield', image: '👑', rarity: 'chase', value: 350, color: '#881337' },
    { id: 'sp_ch2', name: 'Rookie Patch Auto /99', image: '💎', rarity: 'chase', value: 420, color: '#9F1239' },
  ],
};

function poolFor(line: HomeNicheCategory): RevealCard[] {
  return POOLS[line] ?? POOLS.pokemon;
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

function pickCardForRarity(rarity: RevealRarity, rng: () => number, line: HomeNicheCategory): RevealCard {
  const pool = poolFor(line).filter((c) => c.rarity === rarity);
  if (pool.length === 0) return poolFor(line)[0]!;
  return pool[Math.floor(rng() * pool.length)]!;
}

/**
 * Demo reveal card for the strip / hero card. `prizeLine` must match the pack’s product line
 * (no Pokémon cards in One Piece packs, etc.).
 */
export function resolveRevealCardForTier(
  tier: RarityTier,
  sessionSalt: number,
  prizeLine: HomeNicheCategory,
): RevealCard {
  const rng = mulberry32(sessionSalt * 9973 + 1337);
  const targetRarity = revealRarityFromTier(tier);
  const same = poolFor(prizeLine).filter((c) => c.rarity === targetRarity);
  if (same.length) {
    return { ...same[Math.floor(rng() * same.length)]! };
  }
  return { ...pickCardForRarity(pickWeightedRarity(rng), rng, prizeLine) };
}

export function randomFillerCard(seed: number, prizeLine: HomeNicheCategory): RevealCard {
  const rng = mulberry32(seed);
  const rarity = pickWeightedRarity(rng);
  const base = pickCardForRarity(rarity, rng, prizeLine);
  return { ...base, id: `f_${seed}_${base.id}` };
}
