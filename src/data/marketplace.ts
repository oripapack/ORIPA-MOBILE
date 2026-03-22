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
];

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: 'l1',
    storeId: 'store_tokyo_cards',
    title: 'Pikachu VMAX HR (S-P Promo)',
    subtitle: 'Near Mint · Japanese',
    price: '¥4,200',
    category: 'pokemon',
    badge: 'sale',
    imageColor: '#FCD34D',
  },
  {
    id: 'l2',
    storeId: 'store_tokyo_cards',
    title: 'Luffy Leader ST01-001',
    subtitle: 'OP-05 · Light play',
    price: '¥1,850',
    category: 'one_piece',
    imageColor: '#E11D2E',
  },
  {
    id: 'l3',
    storeId: 'store_tokyo_cards',
    title: 'Charizard ex SAR 125/108',
    subtitle: 'SV3 · PSA 10',
    price: '¥28,000',
    category: 'pokemon',
    badge: 'tournament',
    imageColor: '#EA580C',
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
  },
  {
    id: 'l6',
    storeId: 'store_ygo_vault',
    title: 'Ash Blossom & Joyous Spring',
    subtitle: 'Ultra Rare · MP24',
    price: '$22.50',
    category: 'yugioh',
    imageColor: '#1A0A2E',
  },
  {
    id: 'l7',
    storeId: 'store_ygo_vault',
    title: 'Tearlaments Kitkallos',
    subtitle: 'Secret Rare · OP22',
    price: '$34.00',
    category: 'yugioh',
    imageColor: '#312E81',
  },
];

export function getStoreById(id: string): MarketplaceStore | undefined {
  return marketplaceStores.find((s) => s.id === id);
}
