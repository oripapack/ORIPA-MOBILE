/**
 * 実データ待ち。外部に見せないこと。
 * Neutral fallback only; real top-hit claims must come from the live catalog.
 */
import type { PackCategory, Pack } from './mockPacks';

export type TopHitRarity = 'Common' | 'Rare' | 'Ultra Rare' | 'Secret Rare' | 'Alt Art' | 'Legendary';

export type PackTopHit = {
  imageUrl: string;
  name: string;
  rarity: TopHitRarity;
  estValue: string;
  isChase: boolean;
};

const MOCK_TOP_HIT_TABLE: Record<PackCategory, PackTopHit> = {
  onboarding: {
    imageUrl: '',
    name: 'Catalog item pending',
    rarity: 'Common',
    estValue: '—',
    isChase: false,
  },
  micro: {
    imageUrl: '',
    name: 'Catalog item pending',
    rarity: 'Common',
    estValue: '—',
    isChase: false,
  },
  premium: {
    imageUrl: '',
    name: 'Catalog item pending',
    rarity: 'Common',
    estValue: '—',
    isChase: false,
  },
};

/**
 * Featured "top hit" for pack detail / pack card.
 */
export function getMockPackTopHit(pack: Pack): PackTopHit {
  const base = MOCK_TOP_HIT_TABLE[pack.category] ?? MOCK_TOP_HIT_TABLE.onboarding;
  return base;
}

/** @deprecated Prefer `getMockPackTopHit(pack)`. */
export const mockPackTopHits: Record<string, PackTopHit> = {
  welcome_pack: MOCK_TOP_HIT_TABLE.onboarding,
  lucky_mini: MOCK_TOP_HIT_TABLE.micro,
  ultra_chase: MOCK_TOP_HIT_TABLE.premium,
};
