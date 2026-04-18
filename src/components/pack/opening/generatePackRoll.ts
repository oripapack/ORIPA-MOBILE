import type { TFunction } from 'i18next';
import type { RarityTier } from '../../../audio/packOpeningFeedback';
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

  const rarityCommon = [
    t('packOpening.resultCommon1', { packName }),
    t('packOpening.resultCommon2', { packName }),
    t('packOpening.resultCommon3', { packName }),
  ];
  const rarityRare = [
    t('packOpening.resultRare1', { packName }),
    t('packOpening.resultRare2', { packName }),
    t('packOpening.resultRare3', { packName }),
  ];
  const rarityLegendary = [
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

  return { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult };
}

function tierFromRoll(creditsWon: number, creditPrice: number): RarityTier {
  const p = Math.max(1, creditPrice);
  const r = creditsWon / p;
  if (r >= 2.35) return 'mythic';
  if (r >= 1.9) return 'legendary';
  if (r >= 1.4) return 'epic';
  if (r >= 1.07) return 'rare';
  return 'common';
}

/** Demo RNG for a single pack pull (same rules as the reveal engine). */
export function generatePackOpenResult(pack: Pack, t: TFunction, packName: string): PackRollResult {
  const { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult } = packResultPool(pack, t, packName);
  const mult = minMult + Math.random() * (maxMult - minMult);
  const creditsWon = Math.max(0, Math.floor(pack.creditPrice * mult));

  const tier = tierFromRoll(creditsWon, pack.creditPrice);
  let result: string;
  if (tier === 'mythic' || tier === 'legendary') {
    result = pick(rarityLegendary);
  } else if (tier === 'epic' || tier === 'rare') {
    result = pick(rarityRare);
  } else {
    result = pick(rarityCommon);
  }

  return { result, creditsWon, tier };
}

const TIER_RANK: Record<RarityTier, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
  mythic: 4,
};

export function bestRollFromResults(rolls: PackRollResult[]): PackRollResult | null {
  if (rolls.length === 0) return null;
  return rolls.reduce((best, r) => (TIER_RANK[r.tier] > TIER_RANK[best.tier] ? r : best), rolls[0]);
}
