import type { N2Tier } from '../../src/lib/n2Rarity';

/** N2 pull tier — canonical across catalog and mobile pack types. */
export type RarityTier = N2Tier;

/** Opening-flow rarity (4-tier reel / slab reveal — presentation only, not pull tier). */
export type RevealRarity = 'common' | 'rare' | 'ultra' | 'chase';

export type TcgCategory =
  | 'Multi TCG'
  | 'Pokémon TCG'
  | 'One Piece TCG'
  | 'Yu-Gi-Oh!'
  | 'Sports Cards';

export type CatalogCategoryFilter = 'All' | TcgCategory;

export type PriceRange = 'budget' | 'mid' | 'premium';

/** Canonical pack catalog entry — shared by web lab and Expo app. */
export interface CatalogPack {
  id: string;
  name: string;
  category: TcgCategory;
  /** USD display price (maps to credits × 100 in mobile). */
  price: number;
  remainingFraction: number;
  tagline: string;
  description: string;
  topCard: string;
  pullCount: number;
  rarityTier: RarityTier;
  isFeatured?: boolean;
  isNew?: boolean;
  isLimitedTime?: boolean;
  priceRange: PriceRange;
  /** Demo opening outcome (until execute-pull is wired). */
  demoReveal?: {
    rarity: RevealRarity;
    cardName: string;
    value: number;
    grade: string;
    year: string;
  };
}

export interface RecentPull {
  id: string;
  username: string;
  card: string;
  value: string;
  timeAgo: string;
}

export const CATALOG_CATEGORIES: { key: CatalogCategoryFilter; label: string }[] = [
  { key: 'All', label: 'All Packs' },
  { key: 'Pokémon TCG', label: 'Pokémon' },
  { key: 'One Piece TCG', label: 'One Piece' },
  { key: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { key: 'Sports Cards', label: 'Sports' },
];
