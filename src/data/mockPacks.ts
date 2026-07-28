import type { CatalogPack, RarityTier, TcgCategory, PriceRange } from '../../shared/types/pack';
import { catalogPacksToMobile } from '../lib/catalogAdapter';
import type { MembershipTierId } from './membershipPlans';

// ---------------------------------------------------------------------------
// Tag types
// ---------------------------------------------------------------------------

export type ChipTagType =
  | 'new'
  | 'new_user'
  | 'best_value'
  | 'graded'
  | 'hot_drop'
  | 'bonus_pack'
  | 'chase_boost'
  // MVP pack-tier badges
  | 'first_time'   // onboarding: 初回限定
  | 'low_cost'     // micro: 低額高回転
  | 'high_return'  // premium: 高還元
  | 'premium_pack'; // premium: プレミアム感

// ---------------------------------------------------------------------------
// Category types — MVP uses 3 dedicated tiers instead of TCG genres
// ---------------------------------------------------------------------------

/**
 * The three intent-based groups shown in the "All" view.
 * Maps 1-to-1 with HomeNicheCategory but is used independently for
 * section headers so the two concerns stay decoupled.
 */
export type PackGroup = 'first_time' | 'low_cost' | 'high_value';

/**
 * Home / catalog filter tabs — TCG categories from the shared catalog.
 * 'all' shows every pack; others filter by `Pack.tcgCategory`.
 */
export type HomeNicheCategory =
  | 'all'
  | 'pokemon'
  | 'one_piece'
  | 'yugioh'
  | 'sports'
  | 'multi';

export type PackCategory = 'onboarding' | 'micro' | 'premium';

/**
 * Prize types supported in a pack.
 * 'card' = traditional TCG card (existing behaviour).
 * Others are physical/digital prizes (future fulfilment integrations).
 */
export type PrizeType = 'card' | 'console' | 'smartphone' | 'points' | 'coupon';

/**
 * Identifies which of the three MVP pack tiers this pack belongs to.
 * Uses PackCategory (never 'all') — 'all' is a UI-only virtual tab.
 */
export type PackTier = PackCategory;

// ---------------------------------------------------------------------------
// Pack interface
// ---------------------------------------------------------------------------

export interface Pack {
  id: string;
  title: string;
  category: PackCategory;
  tags: ChipTagType[];
  imageColor: string;
  /** URI string (remote) or `require()` result (local asset). */
  imageUrl?: string | number;
  creditPrice: number;
  totalInventory: number;
  remainingInventory: number;
  valueDescription: string;
  guaranteeText: string;
  maxPerUser: number | null;
  /** Member-only: requires this tier or higher (Silver < Gold < Black). */
  requiredMembershipTier?: MembershipTierId;

  // --- MVP extensions ---

  /** Which tier this pack belongs to. Mirrors `category` for typed call-sites. */
  packTier: PackTier;

  /**
   * When true, this pack may only be opened once per account.
   * Business-logic enforcement lives in `useAppStore.openPack()` (and eventually
   * server-side) — `usedFirstTimePackIds` tracks which packs have been used.
   */
  isFirstTimePack?: boolean;

  /**
   * Prize types that can appear in this pack.
   * Defaults to ['card'] when absent (legacy behaviour).
   * Enables future fulfilment routing without changing the opening engine.
   */
  prizeTypes?: PrizeType[];

  /** Short marketing copy for the featured / biggest prize in the pack. */
  highlightPrize?: string;

  /**
   * Intent-based group used for "All packs" grouped view.
   * Derived from category but stored explicitly for fast filtering.
   */
  packGroup: PackGroup;

  // --- Shared catalog fields (Phygitals redesign) ---
  tcgCategory?: TcgCategory;
  tagline?: string;
  catalogDescription?: string;
  topCard?: string;
  pullCount?: number;
  remainingFraction?: number;
  rarityTier?: RarityTier;
  isFeatured?: boolean;
  isNew?: boolean;
  isLimitedTime?: boolean;
  priceRange?: PriceRange;
  demoReveal?: CatalogPack['demoReveal'];

  /** Supabase `pack_versions.id` when this pack is backed by the live engine. */
  packVersionId?: string;
}

// ---------------------------------------------------------------------------
// Category constants
// ---------------------------------------------------------------------------

/** All tab options including the virtual "all" tab. */
export const HOME_NICHE_CATEGORIES: HomeNicheCategory[] = [
  'all',
  'pokemon',
  'one_piece',
  'yugioh',
  'sports',
  'multi',
];

const NICHE_TO_TCG: Record<Exclude<HomeNicheCategory, 'all'>, TcgCategory> = {
  pokemon: 'Pokémon TCG',
  one_piece: 'One Piece TCG',
  yugioh: 'Yu-Gi-Oh!',
  sports: 'Sports Cards',
  multi: 'Multi TCG',
};

/** The three display groups used in the "All packs" grouped view. */
export const PACK_GROUPS: PackGroup[] = ['first_time', 'low_cost', 'high_value'];

/** Label key for each group header in the "All" view (no emoji — N2 §5-4). */
export const PACK_GROUP_META: Record<PackGroup, { labelKey: string }> = {
  first_time: { labelKey: 'packGroup.first_time' },
  low_cost:   { labelKey: 'packGroup.low_cost' },
  high_value: { labelKey: 'packGroup.high_value' },
};

export type PackSubfilter = 'all' | ChipTagType;

export const HOME_SUBFILTER_KEYS: PackSubfilter[] = [
  'all',
  'first_time',
  'low_cost',
  'high_return',
  'premium_pack',
  'best_value',
  'hot_drop',
  'chase_boost',
  'new_user',
];

// ---------------------------------------------------------------------------
// Filter helpers (API unchanged — HomeScreen uses these directly)
// ---------------------------------------------------------------------------

export function packBelongsToHomeNiche(pack: Pack, niche: HomeNicheCategory): boolean {
  if (niche === 'all') return true;
  return pack.tcgCategory === NICHE_TO_TCG[niche];
}

export function packMatchesSubfilter(pack: Pack, sub: PackSubfilter): boolean {
  if (sub === 'all') return true;
  return pack.tags.includes(sub);
}

/**
 * Returns an expo-image-compatible source from a pack's imageUrl field.
 * Local assets (require() = number) are passed through directly;
 * remote URLs are wrapped in { uri }.
 */
export function packImageSource(
  imageUrl: string | number | undefined,
): { uri: string } | number | undefined {
  if (imageUrl == null) return undefined;
  if (typeof imageUrl === 'number') return imageUrl;
  return { uri: imageUrl };
}

// ---------------------------------------------------------------------------
// Pack catalog — sourced from shared/mock/catalog.ts (12 TCG packs)
// ---------------------------------------------------------------------------

export const mockPacks: Pack[] = catalogPacksToMobile();

// ---------------------------------------------------------------------------
// Deprecated category list — kept for scripts / docs parity only
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `HOME_NICHE_CATEGORIES` instead.
 */
export const categories: { key: PackCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'onboarding', label: 'Welcome' },
  { key: 'micro', label: 'Mini' },
  { key: 'premium', label: 'Premium' },
];

// ---------------------------------------------------------------------------
// Credit bundles (unchanged)
// ---------------------------------------------------------------------------

export interface CreditBundle {
  id: string;
  credits: number;
  label: string;
  bonus: string | null;
  showPromoDiscount: boolean;
  discountPercent: number;
  priceUsd: string;
  priceUsdWas: string;
  jpyNow: string;
  jpyWas: string;
}

export const creditBundles: CreditBundle[] = [
  {
    id: 'b1',
    credits: 500,
    label: 'Starter',
    bonus: null,
    showPromoDiscount: true,
    discountPercent: 90,
    priceUsd: '$0.49',
    priceUsdWas: '$4.90',
    jpyNow: '¥80',
    jpyWas: '¥820',
  },
  {
    id: 'b2',
    credits: 2500,
    label: 'Value',
    bonus: null,
    showPromoDiscount: true,
    discountPercent: 75,
    priceUsd: '$1.99',
    priceUsdWas: '$7.96',
    jpyNow: '¥330',
    jpyWas: '¥1,330',
  },
  {
    id: 'b3',
    credits: 12000,
    label: 'Popular',
    bonus: '+ 500 Bonus',
    showPromoDiscount: true,
    discountPercent: 45,
    priceUsd: '$9.99',
    priceUsdWas: '$18.17',
    jpyNow: '¥1,670',
    jpyWas: '¥3,030',
  },
  {
    id: 'b4',
    credits: 45000,
    label: 'Plus',
    bonus: null,
    showPromoDiscount: true,
    discountPercent: 25,
    priceUsd: '$29.99',
    priceUsdWas: '$39.99',
    jpyNow: '¥5,000',
    jpyWas: '¥6,670',
  },
  {
    id: 'b5',
    credits: 180000,
    label: 'Boost',
    bonus: '+ 10,000 Bonus',
    showPromoDiscount: true,
    discountPercent: 12,
    priceUsd: '$99.99',
    priceUsdWas: '$113.62',
    jpyNow: '¥16,670',
    jpyWas: '¥18,940',
  },
  {
    id: 'b6',
    credits: 900000,
    label: 'Pro',
    bonus: null,
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$499.00',
    priceUsdWas: '',
    jpyNow: '¥83,000',
    jpyWas: '',
  },
  {
    id: 'b7',
    credits: 3200000,
    label: 'Studio',
    bonus: '+ 150,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$1,500.00',
    priceUsdWas: '',
    jpyNow: '¥250,000',
    jpyWas: '',
  },
  {
    id: 'b8',
    credits: 7000000,
    label: 'Wholesale',
    bonus: '+ 400,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$3,000.00',
    priceUsdWas: '',
    jpyNow: '¥500,000',
    jpyWas: '',
  },
  {
    id: 'b9',
    credits: 12000000,
    label: 'Enterprise',
    bonus: '+ 800,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$5,000.00',
    priceUsdWas: '',
    jpyNow: '¥830,000',
    jpyWas: '',
  },
  {
    id: 'b10',
    credits: 26000000,
    label: 'Partner',
    bonus: '+ 2,000,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$10,000.00',
    priceUsdWas: '',
    jpyNow: '¥1,670,000',
    jpyWas: '',
  },
  {
    id: 'b11',
    credits: 55000000,
    label: 'Strategic',
    bonus: '+ 5,000,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$20,000.00',
    priceUsdWas: '',
    jpyNow: '¥3,330,000',
    jpyWas: '',
  },
  {
    id: 'b12',
    credits: 85000000,
    label: 'Maximum',
    bonus: '+ 8,000,000 Bonus',
    showPromoDiscount: false,
    discountPercent: 0,
    priceUsd: '$30,000.00',
    priceUsdWas: '',
    jpyNow: '¥5,000,000',
    jpyWas: '',
  },
];