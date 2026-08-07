import type { PackCategory, Pack } from './mockPacks';

export type TopHitRarity = 'Common' | 'Rare' | 'Ultra Rare' | 'Secret Rare' | 'Alt Art' | 'Legendary';

export type PackTopHit = {
  imageUrl: string;
  name: string;
  rarity: TopHitRarity;
  estValue: string;
  isChase: boolean;
};

const IMG = {
  tcg: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=256&q=80',
  foil: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=256&q=80',
  slab: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=256&q=80',
  prize: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=256&q=80',
} as const;

const TOP_HIT_TABLE: Record<PackCategory, PackTopHit> = {
  onboarding: {
    imageUrl: IMG.tcg,
    name: 'Welcome Bonus Card',
    rarity: 'Rare',
    estValue: '~500 Points',
    isChase: false,
  },
  micro: {
    imageUrl: IMG.prize,
    name: 'Nintendo Switch / PS5 / iPhone 16',
    rarity: 'Legendary',
    estValue: '¥30,000+',
    isChase: true,
  },
  premium: {
    imageUrl: IMG.slab,
    name: 'PSA 10 Trophy Card',
    rarity: 'Legendary',
    estValue: '¥500,000+',
    isChase: true,
  },
};

/**
 * Featured "top hit" for pack detail / pack card.
 */
export function getMockPackTopHit(pack: Pack): PackTopHit {
  const base = TOP_HIT_TABLE[pack.category] ?? TOP_HIT_TABLE.onboarding;
  if (pack.topCard) {
    return { ...base, name: pack.topCard, isChase: pack.rarityTier === 'legendary' || pack.rarityTier === 'mythic' };
  }
  return base;
}

/** @deprecated Prefer `getMockPackTopHit(pack)`. */
export const mockPackTopHits: Record<string, PackTopHit> = {
  welcome_pack: TOP_HIT_TABLE.onboarding,
  lucky_mini: TOP_HIT_TABLE.micro,
  ultra_chase: TOP_HIT_TABLE.premium,
};
