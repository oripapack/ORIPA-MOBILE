/**
 * Marketplace listing thumbnails — Unsplash URLs (512×512 via `w`/`h` query).
 * `GEMINI_IMAGE_PROMPT` comments above each row were used to pick images; swap URLs anytime.
 */

/** Product line on a listing (not pack-opening). */
export type ListingCategory = 'pokemon' | 'one_piece' | 'yugioh' | 'sports' | 'other';

export interface MarketplaceStore {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  /** Platform take rate on marketplace sales, e.g. 0.12 = 12% */
  commissionRate: number;
  verified: boolean;
}

/** Single card / single listing — buy now style, no mystery-pack open flow. */
export interface MarketplaceListing {
  id: string;
  storeId: string;
  title: string;
  subtitle: string;
  /** Display price (demo — not wired to checkout) */
  price: string;
  category: ListingCategory;
  badge?: 'sale' | 'tournament' | 'new';
  imageColor: string;
  /** Optional product photo — ListingCard shows image over color swatch. */
  imageUrl?: string;
}

export const marketplaceStores: MarketplaceStore[] = [
  {
    id: 'store_tokyo_cards',
    name: 'Tokyo Cards Shibuya',
    tagline: 'Pokémon & One Piece — ships from Tokyo',
    rating: 4.9,
    reviewCount: 1284,
    commissionRate: 0.12,
    verified: true,
  },
  {
    id: 'store_midwest_breaks',
    name: 'Midwest Sports Breaks',
    tagline: 'Sealed wax & singles — US fulfillment',
    rating: 4.7,
    reviewCount: 892,
    commissionRate: 0.15,
    verified: true,
  },
  {
    id: 'store_ygo_vault',
    name: 'YGO Vault Online',
    tagline: 'Yu-Gi-Oh! singles & sealed',
    rating: 4.8,
    reviewCount: 2103,
    commissionRate: 0.1,
    verified: true,
  },
  {
    id: 'store_eu_collectibles',
    name: 'EU Collectibles Express',
    tagline: 'EU shipping · graded slabs & singles',
    rating: 4.6,
    reviewCount: 756,
    commissionRate: 0.14,
    verified: true,
  },
];

export const marketplaceListings: MarketplaceListing[] = [
  // GEMINI_IMAGE_PROMPT (l1): Square crop — Pokémon TCG style **yellow electric mouse** character full-art VMAX card in a soft sleeve, angled on a matte dark surface, studio lighting, subtle holographic rainbow on edges (generic collectible look, not an exact reproduction of IP art).
  {
    id: 'l1',
    storeId: 'store_tokyo_cards',
    title: 'Pikachu VMAX HR (S-P Promo)',
    subtitle: 'Near Mint · Japanese',
    price: '¥4,200',
    category: 'pokemon',
    badge: 'sale',
    imageColor: '#FCD34D',
    imageUrl:
      'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l2): One Piece TCG **straw-hat captain** leader card aesthetic — red/denim tones, manga-anime style border, card on wooden table, warm light, slight depth of field (generic pirate adventure CCG vibe).
  {
    id: 'l2',
    storeId: 'store_tokyo_cards',
    title: 'Luffy Leader ST01-001',
    subtitle: 'OP-05 · Light play',
    price: '¥1,850',
    category: 'one_piece',
    imageColor: '#4F46E5',
    imageUrl:
      'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l3): **Orange fire dragon** Pokémon ex-style full-art in a **clear PSA-style slab** stack, label visible, premium collector photo, neutral gray backdrop.
  {
    id: 'l3',
    storeId: 'store_tokyo_cards',
    title: 'Charizard ex SAR 125/108',
    subtitle: 'SV3 · PSA 10',
    price: '¥28,000',
    category: 'pokemon',
    badge: 'tournament',
    imageColor: '#EA580C',
    imageUrl:
      'https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l4): **Basketball** Prizm-style chrome rookie card — silver refractor shine, player silhouette generic, in one-touch holder, hardwood floor blur in background.
  {
    id: 'l4',
    storeId: 'store_midwest_breaks',
    title: '2024 Prizm Victor Wembanyama RC',
    subtitle: 'Base Silver',
    price: '$18.00',
    category: 'sports',
    badge: 'new',
    imageColor: '#1E3A5F',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l5): **Sealed hobby box** — dark blue/silver sports wax packaging, shrink wrap gleam, top-down or ¾ angle, “chrome” branding feel without readable trademarks.
  {
    id: 'l5',
    storeId: 'store_midwest_breaks',
    title: 'Sealed Hobby Box — 2023 Chrome',
    subtitle: 'Factory sealed',
    price: '$189.00',
    category: 'sports',
    badge: 'sale',
    imageColor: '#0F172A',
    imageUrl:
      'https://images.unsplash.com/photo-1606335543042-57c525922933?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l6): Yu-Gi-Oh!-style **hand-trap fairy ash blossom** aesthetic — pale pink/white floral fantasy card frame, intricate border, floating on dark purple gradient (generic OCG ultra rare look).
  {
    id: 'l6',
    storeId: 'store_ygo_vault',
    title: 'Ash Blossom & Joyous Spring',
    subtitle: 'Ultra Rare · MP24',
    price: '$22.50',
    category: 'yugioh',
    imageColor: '#1A0A2E',
    imageUrl:
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l7): **Mermaid / sea priestess** archetype secret rare — teal and silver foil, wave motifs, vertical card in sleeve, moody blue lighting (generic fantasy TCG).
  {
    id: 'l7',
    storeId: 'store_ygo_vault',
    title: 'Tearlaments Kitkallos',
    subtitle: 'Secret Rare · OP22',
    price: '$34.00',
    category: 'yugioh',
    imageColor: '#312E81',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l8): Pokémon **dark moon fox** VMAX alt-art vibe — black/purple night sky, full moon bokeh, elegant full-art creature silhouette, soft sleeve, collector desk shot.
  {
    id: 'l8',
    storeId: 'store_tokyo_cards',
    title: 'Umbreon VMAX Alt Art',
    subtitle: 'Evolving Skies · NM',
    price: '¥12,400',
    category: 'pokemon',
    badge: 'sale',
    imageColor: '#1E1B4B',
    imageUrl:
      'https://images.unsplash.com/photo-1534841073722-6739e1b21959?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l9): One Piece **red-haired mentor** character parallel — bold red hair energy, scar aesthetic, dramatic manga ink halftone background, card slightly curved in hand (generic).
  {
    id: 'l9',
    storeId: 'store_tokyo_cards',
    title: 'Shanks OP05-118 Parallel',
    subtitle: 'Awakening of the New Era',
    price: '¥3,200',
    category: 'one_piece',
    imageColor: '#7F1D1D',
    imageUrl:
      'https://images.unsplash.com/photo-1578632738980-43314a57c4f1?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l10): Baseball **Bowman Chrome** refractor rookie — rainbow chrome surface, stadium lights reflection, generic player batting pose, PSA slab corner visible.
  {
    id: 'l10',
    storeId: 'store_midwest_breaks',
    title: 'Bowman Chrome Elly De La Cruz',
    subtitle: 'Refractor RC · PSA 9',
    price: '$64.00',
    category: 'sports',
    badge: 'new',
    imageColor: '#0C4A6E',
    imageUrl:
      'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l11): Classic **dark wizard** vintage TCG — purple robes, ancient spell circle border, nostalgic 90s print grain, slight edge wear for “moderate play” story.
  {
    id: 'l11',
    storeId: 'store_ygo_vault',
    title: 'Dark Magician LOB-005',
    subtitle: 'LOB · Moderate play',
    price: '$120.00',
    category: 'yugioh',
    badge: 'tournament',
    imageColor: '#312E81',
    imageUrl:
      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l12): Pokémon **ninja frog** water-type ex SAR — dynamic splash, blue/teal energy, English set symbol area blurred, premium chase card photography.
  {
    id: 'l12',
    storeId: 'store_eu_collectibles',
    title: 'Greninja ex SAR 132/108',
    subtitle: 'SV3 · English',
    price: '€42.00',
    category: 'pokemon',
    imageColor: '#164E63',
    imageUrl:
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l13): One Piece **three-sword swordsman** full-art — green hair silhouette, dramatic cross-slash ink effects, emerald and black palette, museum-print quality.
  {
    id: 'l13',
    storeId: 'store_eu_collectibles',
    title: 'Zoro ST12-001 Full Art',
    subtitle: '500 Years in the Future',
    price: '€28.00',
    category: 'one_piece',
    imageColor: '#14532D',
    imageUrl:
      'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l14): Basketball **gold parallel** /10 — metallic gold flood, laser etch lines, jersey patch swatch visible, high-end sports card macro.
  {
    id: 'l14',
    storeId: 'store_midwest_breaks',
    title: '2023 Select Paolo Banchero Gold',
    subtitle: '/10 · Raw',
    price: '$240.00',
    category: 'sports',
    badge: 'sale',
    imageColor: '#854D0E',
    imageUrl:
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l15): Yu-Gi-Oh! **rock meteor golem** starlight rare — prismatic starfoil texture, stone giant breaking sky, cosmic purple backdrop.
  {
    id: 'l15',
    storeId: 'store_ygo_vault',
    title: 'Nibiru, the Primal Being',
    subtitle: 'Starlight Rare · MP24',
    price: '$89.00',
    category: 'yugioh',
    imageColor: '#4C1D95',
    imageUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l16): Pokémon **pink psychic mythical** ex SAR — pastel aura, floating bubbles, Japanese text area as abstract blur, dreamy studio shot.
  {
    id: 'l16',
    storeId: 'store_tokyo_cards',
    title: 'Mew ex SAR 232/091',
    subtitle: 'SV4a · Japanese',
    price: '¥6,800',
    category: 'pokemon',
    badge: 'new',
    imageColor: '#831843',
    imageUrl:
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l17): **Emerald sky serpent** dragon V alt-art — aurora borealis greens, clouds, legendary Pokémon energy streaks, wide cinematic crop.
  {
    id: 'l17',
    storeId: 'store_eu_collectibles',
    title: 'Rayquaza V Alt Art',
    subtitle: 'Crown Zenith · NM',
    price: '€55.00',
    category: 'pokemon',
    imageColor: '#166534',
    imageUrl:
      'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&q=80&w=512&h=512',
  },
  // GEMINI_IMAGE_PROMPT (l18): **Football RPA** patch auto — chunky game-worn fabric swatch, on-card signature, dark ornate National Treasures-style frame, /99 numbering feel.
  {
    id: 'l18',
    storeId: 'store_midwest_breaks',
    title: 'National Treasures RPA /99',
    subtitle: 'Football · Game-worn',
    price: '$420.00',
    category: 'sports',
    imageColor: '#422006',
    imageUrl:
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=512&h=512',
  },
];

export function getStoreById(id: string): MarketplaceStore | undefined {
  return marketplaceStores.find((s) => s.id === id);
}
