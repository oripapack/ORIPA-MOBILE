import type { UserState } from '../data/mockUser';

/** XP needed to go from `level` → `level + 1` (gentle curve, caps per step). */
export function xpToAdvanceFromLevel(level: number): number {
  const L = Math.max(1, Math.floor(level));
  return Math.min(1400, 420 + (L - 1) * 48);
}

export type CollectorProgressionView = {
  level: number;
  /** XP accumulated inside the current level (0 … xpForNextLevel-1). */
  xpIntoLevel: number;
  /** XP required to reach the next level from the start of this level. */
  xpForNextLevel: number;
  /** 0–100 for the level bar. */
  pctInLevel: number;
  /** i18n key: `progression.rankBand_${band}` */
  rankBand: number;
};

/**
 * Maps total lifetime collector XP → level + bar. Level starts at 1.
 */
export function progressionFromTotalXp(totalXp: number): CollectorProgressionView {
  let xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  for (;;) {
    const need = xpToAdvanceFromLevel(level);
    if (xp < need) {
      const pctInLevel = need <= 0 ? 0 : Math.min(100, Math.round((xp / need) * 100));
      const rankBand = Math.min(4, Math.floor((level - 1) / 6));
      return { level, xpIntoLevel: xp, xpForNextLevel: need, pctInLevel, rankBand };
    }
    xp -= need;
    level += 1;
    if (level > 5000) {
      return {
        level,
        xpIntoLevel: 0,
        xpForNextLevel: xpToAdvanceFromLevel(level),
        pctInLevel: 0,
        rankBand: 4,
      };
    }
  }
}

/** Maps level → legacy membership tier (existing `UserState.tier`). */
export function legacyTierFromLevel(level: number): UserState['tier'] {
  if (level >= 28) return 'Gold';
  if (level >= 16) return 'Silver';
  if (level >= 8) return 'Bronze';
  return 'Starter';
}

/** Sync `xp`, `tier`, and `xpToNextTier` after XP changes. */
export function userWithSyncedProgression(user: UserState, nextTotalXp: number): UserState {
  const p = progressionFromTotalXp(nextTotalXp);
  return {
    ...user,
    xp: Math.max(0, Math.floor(nextTotalXp)),
    tier: legacyTierFromLevel(p.level),
    xpToNextTier: p.xpForNextLevel,
  };
}

export function tierXpBonusForPull(tier: string): number {
  switch (tier) {
    case 'rare':
      return 6;
    case 'epic':
      return 12;
    case 'legendary':
      return 24;
    case 'mythic':
      return 40;
    default:
      return 0;
  }
}
