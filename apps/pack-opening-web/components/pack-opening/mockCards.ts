import type { RevealCard, RevealRarity } from './types';

/** Deterministic PRNG for reel generation */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES: Record<RevealRarity, string[]> = {
  common: ['Trainer', 'Energy', 'Common V', 'Bulk rare'],
  rare: ['Holo rare', 'Full art', 'V card', 'Trainer FA'],
  ultra: ['Alt art', 'Secret rare', 'Gold card', 'Special art'],
  chase: ['Grail chase', 'Moonbreon', 'Trophy card', '1st Ed shadow'],
};

function pickName(rarity: RevealRarity, rng: () => number): string {
  const pool = NAMES[rarity];
  return pool[Math.floor(rng() * pool.length)] ?? 'Card';
}

export function makeMockCard(id: string, rarity: RevealRarity, rng: () => number): RevealCard {
  const glyphs = ['🎴', '✨', '⚡', '🌙', '🔥', '💎'];
  return {
    id,
    name: pickName(rarity, rng),
    image: glyphs[Math.floor(rng() * glyphs.length)] ?? '🎴',
    rarity,
    value: Math.round(10 + rng() * (rarity === 'chase' ? 900 : rarity === 'ultra' ? 400 : 120)),
    color:
      rarity === 'common'
        ? '#64748b'
        : rarity === 'rare'
          ? '#38bdf8'
          : rarity === 'ultra'
            ? '#a78bfa'
            : '#fbbf24',
  };
}

export interface GeneratedReel {
  cards: RevealCard[];
  winningIndex: number;
}

/**
 * Weighted filler distribution + fixed winning index for landing math.
 */
export function generateReelStrip(
  winningCard: RevealCard,
  sessionSalt: number,
  opts?: { length?: number; winningIndex?: number },
): GeneratedReel {
  const length = opts?.length ?? 52;
  const winningIndex = opts?.winningIndex ?? 36;
  const rng = mulberry32(sessionSalt ^ 0x9e3779b9);

  const weightPick = (): RevealRarity => {
    const r = rng();
    if (r < 0.52) return 'common';
    if (r < 0.78) return 'rare';
    if (r < 0.94) return 'ultra';
    return 'chase';
  };

  const cards: RevealCard[] = [];
  for (let i = 0; i < length; i++) {
    if (i === winningIndex) {
      cards.push({ ...winningCard, id: `win-${winningCard.id}` });
    } else {
      cards.push(makeMockCard(`r-${i}`, weightPick(), rng));
    }
  }
  return { cards, winningIndex };
}
