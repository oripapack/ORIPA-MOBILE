/**
 * 実データ待ち。外部に見せないこと。
 * Local animation fallback only. Production outcomes must come from the
 * server-side finite inventory and disclosed odds.
 */
import type { TFunction } from 'i18next';
import type { N2Tier } from '../../../lib/n2Rarity';
import { N2_TIER_RANK } from '../../../lib/n2Rarity';
import type { ChipTagType, Pack } from '../../../data/mockPacks';
import type { PackRollResult } from './types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function packResultPool(pack: Pack, t: TFunction, packName: string) {
  const tags = pack.tags as ChipTagType[];
  const isGraded = tags.includes('graded');
  const isBest = tags.includes('best_value');
  const isHot = tags.includes('hot_drop') || tags.includes('chase_boost');
  const isNew = tags.includes('new') || tags.includes('new_user');

  const rarityBase = [
    t('packOpening.resultCommon1', { packName }),
    t('packOpening.resultCommon2', { packName }),
    t('packOpening.resultCommon3', { packName }),
  ];
  const rarityEpic = [
    t('packOpening.resultRare1', { packName }),
    t('packOpening.resultRare2', { packName }),
    t('packOpening.resultRare3', { packName }),
  ];
  const rarityTop = [
    t('packOpening.resultLegendary1', { packName }),
    t('packOpening.resultLegendary2', { packName }),
    t('packOpening.resultLegendary3', { packName }),
  ];

  let minMult = 0.2;
  let maxMult = 1.6;
  if (isNew) {
    minMult = 0.25;
    maxMult = 1.8;
  }
  if (isHot) {
    minMult = 0.35;
    maxMult = 2.2;
  }
  if (isBest) {
    minMult = 0.65;
    maxMult = 2.7;
  }
  if (isGraded) {
    minMult = 0.6;
    maxMult = 3.0;
  }

  return { rarityBase, rarityEpic, rarityTop, minMult, maxMult };
}

function tierFromRoll(creditsWon: number, creditPrice: number): N2Tier {
  const p = Math.max(1, creditPrice);
  const r = creditsWon / p;
  if (r >= 2.35) return 'mythic';
  if (r >= 1.9) return 'legendary';
  if (r >= 1.4) return 'epic';
  return 'base';
}

/** Demo RNG for a single pack pull (same rules as the reveal engine). */
export function generatePackOpenResult(pack: Pack, t: TFunction, packName: string): PackRollResult {
  const { rarityBase, rarityEpic, rarityTop, minMult, maxMult } = packResultPool(pack, t, packName);
  const mult = minMult + Math.random() * (maxMult - minMult);
  const creditsWon = Math.max(0, Math.floor(pack.creditPrice * mult));

  const tier = tierFromRoll(creditsWon, pack.creditPrice);
  let result: string;
  if (tier === 'mythic' || tier === 'legendary') {
    result = pick(rarityTop);
  } else if (tier === 'epic') {
    result = pick(rarityEpic);
  } else {
    result = pick(rarityBase);
  }

  return { result, creditsWon, tier };
}

/**
 * Compare two rolls for ranking. Negative → `a` is better (higher tier/credits).
 * Tie-break: lower index wins (stable, first pull preferred).
 */
export function compareRolls(
  a: PackRollResult,
  aIndex: number,
  b: PackRollResult,
  bIndex: number,
): number {
  const tierDiff = N2_TIER_RANK[b.tier] - N2_TIER_RANK[a.tier];
  if (tierDiff !== 0) return tierDiff;
  const creditsDiff = b.creditsWon - a.creditsWon;
  if (creditsDiff !== 0) return creditsDiff;
  return aIndex - bIndex;
}

export type BestHitSelection = {
  best: PackRollResult;
  bestIndex: number;
};

/** Pick the single best hit: tier → credits → lowest index. */
export function selectBestHit(rolls: PackRollResult[]): BestHitSelection | null {
  if (rolls.length === 0) return null;
  let bestIndex = 0;
  for (let i = 1; i < rolls.length; i++) {
    if (compareRolls(rolls[i]!, i, rolls[bestIndex]!, bestIndex) < 0) {
      bestIndex = i;
    }
  }
  return { best: rolls[bestIndex]!, bestIndex };
}

/** @deprecated Prefer `selectBestHit` when you need the index; this wraps it for callers that only need the roll. */
export function bestRollFromResults(rolls: PackRollResult[]): PackRollResult | null {
  return selectBestHit(rolls)?.best ?? null;
}
