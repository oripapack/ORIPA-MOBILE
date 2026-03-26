export type TopHitRarity = 'Common' | 'Rare' | 'Ultra Rare' | 'Secret Rare' | 'Alt Art' | 'Legendary';

export type PackTopHit = {
  /** Small image thumbnail for the chase card (mock). */
  imageUrl: string;
  /** Display name: include grade if relevant (e.g., PSA 10). */
  name: string;
  rarity: TopHitRarity;
  /** Estimated value as a formatted display string (mock). */
  estValue: string;
  /** If true, render subtle gold glow + CHASE badge. */
  isChase: boolean;
};

/**
 * Mock “top hit” previews, keyed by pack id.
 * Keep these stable so the UI feels consistent while you iterate product.
 */
export const mockPackTopHits: Record<string, PackTopHit> = {
  '1': {
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=256&q=80',
    name: 'PSA 10 Charizard',
    rarity: 'Legendary',
    estValue: '$1,200',
    isChase: true,
  },
  '2': {
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=256&q=80',
    name: 'Alt Art EX Chase',
    rarity: 'Alt Art',
    estValue: '$450',
    isChase: true,
  },
  '3': {
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80',
    name: 'PSA 10 Luffy Leader',
    rarity: 'Ultra Rare',
    estValue: '$900',
    isChase: true,
  },
  '4': {
    imageUrl: 'https://images.unsplash.com/photo-1622227922682-56c92e523e58?auto=format&fit=crop&w=256&q=80',
    name: 'Rookie Auto /10',
    rarity: 'Secret Rare',
    estValue: '$650',
    isChase: true,
  },
  '5': {
    imageUrl: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=256&q=80',
    name: 'PSA 10 Base Set Holo',
    rarity: 'Legendary',
    estValue: '$2,400',
    isChase: true,
  },
  '6': {
    imageUrl: 'https://images.unsplash.com/photo-1612036782265-0c18fb0f0f6b?auto=format&fit=crop&w=256&q=80',
    name: 'Mystery God Pull',
    rarity: 'Legendary',
    estValue: '$1,500',
    isChase: true,
  },
  // Fallbacks for other packs (keep simple)
  '7': {
    imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=256&q=80',
    name: 'Alt Art Captain',
    rarity: 'Alt Art',
    estValue: '$700',
    isChase: true,
  },
  '8': {
    imageUrl: 'https://images.unsplash.com/photo-1618005182299-8e7f576d1a0f?auto=format&fit=crop&w=256&q=80',
    name: 'New Set Hit',
    rarity: 'Ultra Rare',
    estValue: '$220',
    isChase: false,
  },
  '9': {
    imageUrl: 'https://images.unsplash.com/photo-1618005198404-4d4b1c9e2c0b?auto=format&fit=crop&w=256&q=80',
    name: 'Starlight Rare',
    rarity: 'Secret Rare',
    estValue: '$800',
    isChase: true,
  },
};

