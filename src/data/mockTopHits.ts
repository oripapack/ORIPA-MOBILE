import type { HomeNicheCategory, Pack } from './mockPacks';

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
  sport: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=256&q=80',
} as const;

/** One showcase chase per price tier (10 slots) — matches `mockPacks` order within each genre. */
const TOP_HIT_TABLE: Record<HomeNicheCategory, PackTopHit[]> = {
  pokemon: [
    { imageUrl: IMG.tcg, name: 'Fuecoco (PAL)', rarity: 'Common', estValue: '$2', isChase: false },
    { imageUrl: IMG.foil, name: 'Pikachu (SV1)', rarity: 'Rare', estValue: '$18', isChase: false },
    { imageUrl: IMG.foil, name: 'Miraidon ex (PAL)', rarity: 'Ultra Rare', estValue: '$42', isChase: false },
    { imageUrl: IMG.foil, name: 'Charizard ex (OBF)', rarity: 'Ultra Rare', estValue: '$95', isChase: true },
    { imageUrl: IMG.foil, name: 'Charizard ex SAR (151)', rarity: 'Alt Art', estValue: '$220', isChase: true },
    { imageUrl: IMG.foil, name: 'Arceus VSTAR GG', rarity: 'Secret Rare', estValue: '$180', isChase: true },
    { imageUrl: IMG.slab, name: 'Umbreon VMAX Alt', rarity: 'Alt Art', estValue: '$380', isChase: true },
    { imageUrl: IMG.slab, name: 'Charizard ex Special Collection', rarity: 'Legendary', estValue: '$650', isChase: true },
    { imageUrl: IMG.slab, name: 'PSA 10 Base Set Charizard', rarity: 'Legendary', estValue: '$4,200', isChase: true },
    { imageUrl: IMG.slab, name: 'PSA 10 Pikachu Illustrator', rarity: 'Legendary', estValue: '$12,000', isChase: true },
  ],
  one_piece: [
    { imageUrl: IMG.tcg, name: 'ST01 Luffy', rarity: 'Common', estValue: '$3', isChase: false },
    { imageUrl: IMG.foil, name: 'Yamato Leader (OP-02)', rarity: 'Rare', estValue: '$22', isChase: false },
    { imageUrl: IMG.foil, name: 'Law SR (OP-05)', rarity: 'Ultra Rare', estValue: '$48', isChase: false },
    { imageUrl: IMG.foil, name: 'Zoro Alt Art (OP-06)', rarity: 'Alt Art', estValue: '$120', isChase: true },
    { imageUrl: IMG.foil, name: 'Luffy Manga Rare (OP-07)', rarity: 'Secret Rare', estValue: '$280', isChase: true },
    { imageUrl: IMG.foil, name: 'Shanks Parallel (OP-08)', rarity: 'Ultra Rare', estValue: '$210', isChase: true },
    { imageUrl: IMG.slab, name: 'Kid & Law SR (OP-09)', rarity: 'Ultra Rare', estValue: '$165', isChase: true },
    { imageUrl: IMG.slab, name: 'Leader Alt Art Shanks', rarity: 'Alt Art', estValue: '$520', isChase: true },
    { imageUrl: IMG.slab, name: 'PSA 10 Manga Rare Luffy', rarity: 'Legendary', estValue: '$1,800', isChase: true },
    { imageUrl: IMG.slab, name: 'Trophy PSA 10 Manga Panel', rarity: 'Legendary', estValue: '$6,500', isChase: true },
  ],
  yugioh: [
    { imageUrl: IMG.tcg, name: 'Dark Magician (SDY)', rarity: 'Common', estValue: '$4', isChase: false },
    { imageUrl: IMG.foil, name: 'Tearlaments Kitkallos', rarity: 'Rare', estValue: '$16', isChase: false },
    { imageUrl: IMG.foil, name: 'Maze of Millennia CR', rarity: 'Ultra Rare', estValue: '$55', isChase: true },
    { imageUrl: IMG.foil, name: 'Voiceless Voice Ritual', rarity: 'Ultra Rare', estValue: '$38', isChase: false },
    { imageUrl: IMG.foil, name: 'Fiendsmith Engraver', rarity: 'Ultra Rare', estValue: '$72', isChase: true },
    { imageUrl: IMG.foil, name: 'Nightmare Magician', rarity: 'Secret Rare', estValue: '$95', isChase: true },
    { imageUrl: IMG.slab, name: 'Ghost Rare Dark Magician', rarity: 'Secret Rare', estValue: '$420', isChase: true },
    { imageUrl: IMG.slab, name: 'QC Secret Dark Magician', rarity: 'Secret Rare', estValue: '$890', isChase: true },
    { imageUrl: IMG.slab, name: 'LOB Dark Magician 1st', rarity: 'Legendary', estValue: '$3,200', isChase: true },
    { imageUrl: IMG.slab, name: 'Starlight Rare Accesscode', rarity: 'Legendary', estValue: '$8,900', isChase: true },
  ],
  sports: [
    { imageUrl: IMG.sport, name: 'Base Rated Rookie', rarity: 'Common', estValue: '$5', isChase: false },
    { imageUrl: IMG.sport, name: 'Prizm Silver RC', rarity: 'Rare', estValue: '$28', isChase: false },
    { imageUrl: IMG.sport, name: 'Optic Holo RC', rarity: 'Rare', estValue: '$45', isChase: false },
    { imageUrl: IMG.sport, name: 'Select Concourse /99', rarity: 'Ultra Rare', estValue: '$120', isChase: true },
    { imageUrl: IMG.sport, name: 'Mosaic Genesis /10', rarity: 'Ultra Rare', estValue: '$280', isChase: true },
    { imageUrl: IMG.sport, name: 'National Treasures RPA', rarity: 'Secret Rare', estValue: '$650', isChase: true },
    { imageUrl: IMG.sport, name: 'Flawless Diamond /10', rarity: 'Secret Rare', estValue: '$1,100', isChase: true },
    { imageUrl: IMG.sport, name: 'The Cup /99 RPA', rarity: 'Legendary', estValue: '$2,400', isChase: true },
    { imageUrl: IMG.sport, name: '1986 Fleer Jordan RC', rarity: 'Legendary', estValue: '$8,900', isChase: true },
    { imageUrl: IMG.sport, name: 'Logoman 1/1 Shield', rarity: 'Legendary', estValue: '$18,000', isChase: true },
  ],
};

/**
 * Featured “top hit” for pack detail / hero — tier slot matches price tier within each genre (ids 1–10, 11–20, …).
 */
export function getMockPackTopHit(pack: Pack): PackTopHit {
  const n = parseInt(pack.id, 10);
  const slot = Number.isFinite(n) ? (n - 1) % 10 : 0;
  return TOP_HIT_TABLE[pack.category][slot] ?? TOP_HIT_TABLE.pokemon[0]!;
}

/** @deprecated Prefer `getMockPackTopHit(pack)` — kept for one-off lookups. */
export const mockPackTopHits: Record<string, PackTopHit> = {
  '1': TOP_HIT_TABLE.pokemon[0]!,
  '2': TOP_HIT_TABLE.pokemon[1]!,
  '3': TOP_HIT_TABLE.pokemon[2]!,
};
