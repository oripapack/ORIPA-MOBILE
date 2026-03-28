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
  /** i18n: `marketplace.storeSpecialty.<key>` */
  specialtyKey: string;
  /** i18n: `marketplace.storeShipping.<key>` */
  shippingKey: string;
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
  /** Curated order for “Recommended” sort (set in seed order). */
  recommendedRank: number;
  /** Mock “listed” time — higher = newer. */
  listedAt: number;
  /** Mock monotone price tier for local sort only (not a real currency conversion). */
  priceSort: number;
  /** Short condition / grade line on tile. */
  conditionGrade?: string;
  /** Negative = below mock market average (shown as trust/pricing signal). */
  marketDeltaPct?: number;
  /** i18n: `marketplace.listingShip.<key>` */
  listingShipKey?: string;
}

export type MarketplaceSortId = 'recommended' | 'newest' | 'price_low' | 'price_high' | 'sale_first';

const PRICE_SORT: Record<string, number> = {
  l1: 4200,
  l2: 1850,
  l3: 280000,
  l4: 1800,
  l5: 18900,
  l6: 2250,
  l7: 3400,
  l8: 124000,
  l9: 32000,
  l10: 6400,
  l11: 12000,
  l12: 4500,
  l13: 3000,
  l14: 24000,
  l15: 8900,
  l16: 6800,
  l17: 5900,
  l18: 420000,
};

type ListingSeed = Omit<MarketplaceListing, 'recommendedRank' | 'listedAt' | 'priceSort'>;

const LISTING_SEEDS: ListingSeed[] = [
  // GEMINI_IMAGE_PROMPT (l1): Square crop — Pokémon TCG style **yellow electric mouse** character full-art VMAX card in a soft sleeve, angled on a matte dark surface, studio lighting, subtle holographic rainbow on edges (generic collectible look, not an exact reproduction of IP art).
  {
    id: 'l1',
    storeId: 'store_tokyo_cards',
    title: 'Pikachu VMAX HR (S-P Promo)',
    subtitle: 'S-P Promo · Japanese',
    price: '¥4,200',
    category: 'pokemon',
    badge: 'sale',
    imageColor: '#FCD34D',
    conditionGrade: 'Near Mint',
    marketDeltaPct: -8,
    listingShipKey: 'intl_ok',
    imageUrl:
      'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l2',
    storeId: 'store_tokyo_cards',
    title: 'Luffy Leader ST01-001',
    subtitle: 'OP-05 · Leader',
    price: '¥1,850',
    category: 'one_piece',
    imageColor: '#4F46E5',
    conditionGrade: 'Light play',
    imageUrl:
      'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l3',
    storeId: 'store_tokyo_cards',
    title: 'Charizard ex SAR 125/108',
    subtitle: 'SV3 · Graded',
    price: '¥28,000',
    category: 'pokemon',
    badge: 'tournament',
    imageColor: '#EA580C',
    conditionGrade: 'PSA 10',
    imageUrl:
      'https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l4',
    storeId: 'store_midwest_breaks',
    title: '2024 Prizm Victor Wembanyama RC',
    subtitle: 'Base Silver',
    price: '$18.00',
    category: 'sports',
    badge: 'new',
    imageColor: '#1E3A5F',
    conditionGrade: 'NM raw',
    marketDeltaPct: -12,
    listingShipKey: 'us_fast',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l5',
    storeId: 'store_midwest_breaks',
    title: 'Sealed Hobby Box — 2023 Chrome',
    subtitle: 'Factory sealed',
    price: '$189.00',
    category: 'sports',
    badge: 'sale',
    imageColor: '#0F172A',
    conditionGrade: 'Sealed',
    marketDeltaPct: -6,
    listingShipKey: 'us_fast',
    imageUrl:
      'https://images.unsplash.com/photo-1606335543042-57c525922933?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l6',
    storeId: 'store_ygo_vault',
    title: 'Ash Blossom & Joyous Spring',
    subtitle: 'Ultra Rare · MP24',
    price: '$22.50',
    category: 'yugioh',
    imageColor: '#1A0A2E',
    conditionGrade: 'Near Mint',
    imageUrl:
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l7',
    storeId: 'store_ygo_vault',
    title: 'Tearlaments Kitkallos',
    subtitle: 'Secret Rare · OP22',
    price: '$34.00',
    category: 'yugioh',
    imageColor: '#312E81',
    conditionGrade: 'NM',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l8',
    storeId: 'store_tokyo_cards',
    title: 'Umbreon VMAX Alt Art',
    subtitle: 'Evolving Skies',
    price: '¥12,400',
    category: 'pokemon',
    badge: 'sale',
    imageColor: '#1E1B4B',
    conditionGrade: 'Near Mint',
    marketDeltaPct: -5,
    listingShipKey: 'intl_ok',
    imageUrl:
      'https://images.unsplash.com/photo-1534841073722-6739e1b21959?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l9',
    storeId: 'store_tokyo_cards',
    title: 'Shanks OP05-118 Parallel',
    subtitle: 'Awakening of the New Era',
    price: '¥3,200',
    category: 'one_piece',
    imageColor: '#7F1D1D',
    conditionGrade: 'NM',
    imageUrl:
      'https://images.unsplash.com/photo-1578632738980-43314a57c4f1?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l10',
    storeId: 'store_midwest_breaks',
    title: 'Bowman Chrome Elly De La Cruz',
    subtitle: 'Refractor RC · PSA 9',
    price: '$64.00',
    category: 'sports',
    badge: 'new',
    imageColor: '#0C4A6E',
    conditionGrade: 'PSA 9',
    listingShipKey: 'us_fast',
    imageUrl:
      'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l11',
    storeId: 'store_ygo_vault',
    title: 'Dark Magician LOB-005',
    subtitle: 'LOB · Vintage',
    price: '$120.00',
    category: 'yugioh',
    badge: 'tournament',
    imageColor: '#312E81',
    conditionGrade: 'Moderate',
    imageUrl:
      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l12',
    storeId: 'store_eu_collectibles',
    title: 'Greninja ex SAR 132/108',
    subtitle: 'SV3 · English',
    price: '€42.00',
    category: 'pokemon',
    imageColor: '#164E63',
    conditionGrade: 'NM',
    listingShipKey: 'eu_tracked',
    imageUrl:
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l13',
    storeId: 'store_eu_collectibles',
    title: 'Zoro ST12-001 Full Art',
    subtitle: '500 Years in the Future',
    price: '€28.00',
    category: 'one_piece',
    imageColor: '#14532D',
    conditionGrade: 'NM',
    listingShipKey: 'eu_tracked',
    imageUrl:
      'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l14',
    storeId: 'store_midwest_breaks',
    title: '2023 Select Paolo Banchero Gold',
    subtitle: '/10 · Raw',
    price: '$240.00',
    category: 'sports',
    badge: 'sale',
    imageColor: '#854D0E',
    conditionGrade: 'Raw NM',
    marketDeltaPct: -8,
    listingShipKey: 'us_fast',
    imageUrl:
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l15',
    storeId: 'store_ygo_vault',
    title: 'Nibiru, the Primal Being',
    subtitle: 'Starlight Rare · MP24',
    price: '$89.00',
    category: 'yugioh',
    imageColor: '#4C1D95',
    conditionGrade: 'NM',
    imageUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l16',
    storeId: 'store_tokyo_cards',
    title: 'Mew ex SAR 232/091',
    subtitle: 'SV4a · Japanese',
    price: '¥6,800',
    category: 'pokemon',
    badge: 'new',
    imageColor: '#831843',
    conditionGrade: 'NM',
    listingShipKey: 'intl_ok',
    imageUrl:
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l17',
    storeId: 'store_eu_collectibles',
    title: 'Rayquaza V Alt Art',
    subtitle: 'Crown Zenith',
    price: '€55.00',
    category: 'pokemon',
    imageColor: '#166534',
    conditionGrade: 'Near Mint',
    marketDeltaPct: -7,
    listingShipKey: 'eu_tracked',
    imageUrl:
      'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&q=80&w=512&h=512',
  },
  {
    id: 'l18',
    storeId: 'store_midwest_breaks',
    title: 'National Treasures RPA /99',
    subtitle: 'Football · Patch auto',
    price: '$420.00',
    category: 'sports',
    imageColor: '#422006',
    conditionGrade: 'NM / auth',
    listingShipKey: 'us_fast',
    imageUrl:
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=512&h=512',
  },
];

export const marketplaceListings: MarketplaceListing[] = LISTING_SEEDS.map((l, idx) => ({
  ...l,
  recommendedRank: idx,
  listedAt: 1_740_412_800_000 + (LISTING_SEEDS.length - idx) * 86_400_000,
  priceSort: PRICE_SORT[l.id] ?? 0,
}));

export const marketplaceStores: MarketplaceStore[] = [
  {
    id: 'store_tokyo_cards',
    name: 'Tokyo Cards Shibuya',
    tagline: 'Pokémon & One Piece — ships from Tokyo',
    rating: 4.9,
    reviewCount: 1284,
    commissionRate: 0.12,
    verified: true,
    specialtyKey: 'pokemon_jp_singles',
    shippingKey: 'dispatch_1_2',
  },
  {
    id: 'store_midwest_breaks',
    name: 'Midwest Sports Breaks',
    tagline: 'Sealed wax & singles — US fulfillment',
    rating: 4.7,
    reviewCount: 892,
    commissionRate: 0.15,
    verified: true,
    specialtyKey: 'sports_sealed',
    shippingKey: 'dispatch_1_2_us',
  },
  {
    id: 'store_ygo_vault',
    name: 'YGO Vault Online',
    tagline: 'Yu-Gi-Oh! singles & sealed',
    rating: 4.8,
    reviewCount: 2103,
    commissionRate: 0.1,
    verified: true,
    specialtyKey: 'yugioh_core',
    shippingKey: 'dispatch_2_3',
  },
  {
    id: 'store_eu_collectibles',
    name: 'EU Collectibles Express',
    tagline: 'EU shipping · graded slabs & singles',
    rating: 4.6,
    reviewCount: 756,
    commissionRate: 0.14,
    verified: true,
    specialtyKey: 'graded_eu',
    shippingKey: 'dispatch_2_4_eu',
  },
];

export function sortMarketplaceListings(listings: MarketplaceListing[], sort: MarketplaceSortId): MarketplaceListing[] {
  const out = [...listings];
  const rank = (x: MarketplaceListing) => x.recommendedRank;
  const listed = (x: MarketplaceListing) => x.listedAt;
  const price = (x: MarketplaceListing) => x.priceSort;
  switch (sort) {
    case 'recommended':
      return out.sort((a, b) => rank(a) - rank(b));
    case 'newest':
      return out.sort((a, b) => listed(b) - listed(a));
    case 'price_low':
      return out.sort((a, b) => price(a) - price(b));
    case 'price_high':
      return out.sort((a, b) => price(b) - price(a));
    case 'sale_first':
      return out.sort((a, b) => {
        const sa = a.badge === 'sale' ? 0 : 1;
        const sb = b.badge === 'sale' ? 0 : 1;
        if (sa !== sb) return sa - sb;
        return rank(a) - rank(b);
      });
    default:
      return out;
  }
}

export function getStoreById(id: string): MarketplaceStore | undefined {
  return marketplaceStores.find((s) => s.id === id);
}
