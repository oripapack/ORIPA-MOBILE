import type { N2TierState } from '../lib/n2Rarity';
import type { Pull } from './mockUser';
import type { ResultCard, ResultPullData } from './mockResultPull';

/** Demo slab imagery — same pool as mock result review. */
const IMG = [
  'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=256&q=80',
] as const;

/** Certificate-style digits from a UUID / local pull id. */
export function certificatePullId(id: string): string {
  const digits = id.replace(/\D/g, '');
  if (digits.length >= 5) return digits.slice(-5);
  const hex = id.replace(/-/g, '');
  return (hex.slice(-5) || '00000').toUpperCase();
}

/** 100 Coins = $1.00 — matches ResultScreen / Vault. */
export function creditsToListedUsd(credits: number): number {
  return Math.max(0, credits) / 100;
}

function imageForName(name: string, index: number): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h + name.charCodeAt(i) * (i + 1)) % 997;
  return IMG[(h + index) % IMG.length];
}

function pullToResultCard(pull: Pull, index: number): ResultCard {
  const credits = pull.creditsWon ?? pull.convertCreditValue ?? 0;
  const tier = (pull.tier ?? 'unknown') as N2TierState;
  return {
    name: pull.result,
    tier: tier === 'base' || tier === 'epic' || tier === 'legendary' || tier === 'mythic' ? tier : 'unknown',
    imageUrl: imageForName(pull.result, index),
    listedValueUsd: creditsToListedUsd(credits),
  };
}

/** Map one or more session pulls into Result screen payload. */
export function buildResultPullData(
  pulls: Pull[],
  packName: string,
): ResultPullData | null {
  if (pulls.length === 0) return null;
  const cards = pulls.map((p, i) => pullToResultCard(p, i));
  const totalListedValueUsd = cards.reduce((sum, c) => sum + c.listedValueUsd, 0);
  const primary = pulls[0];
  const pulledAt =
    primary.timestamp instanceof Date
      ? primary.timestamp.toISOString()
      : new Date(primary.timestamp as unknown as string | number).toISOString();

  return {
    pullId: certificatePullId(primary.id),
    pulledAt,
    packName,
    cards,
    totalListedValueUsd,
  };
}
