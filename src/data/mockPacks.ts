export type ChipTagType = 'new' | 'new_user' | 'best_value' | 'graded' | 'hot_drop' | 'bonus_pack' | 'chase_boost';

export type PackCategory =
  | 'featured'
  | 'new'
  | 'pokemon'
  | 'yugioh'
  | 'one_piece'
  | 'sports'
  | 'graded'
  | 'hot_drops';

export interface Pack {
  id: string;
  title: string;
  category: PackCategory;
  tags: ChipTagType[];
  imageColor: string; // placeholder color
  creditPrice: number;
  totalInventory: number;
  remainingInventory: number;
  valueDescription: string;
  guaranteeText: string;
  maxPerUser: number | null;
}

export const mockPacks: Pack[] = [
  {
    id: '1',
    title: 'New User Welcome Pack',
    category: 'featured',
    tags: ['new_user', 'best_value'],
    imageColor: '#1C1C2E',
    creditPrice: 300,
    totalInventory: 50000,
    remainingInventory: 22881,
    valueDescription: 'Over 100% chase value',
    guaranteeText: 'Guaranteed bonus every 2 opens',
    maxPerUser: 4,
  },
  {
    id: '2',
    title: 'Pokémon Scarlet & Violet Hit Pack',
    category: 'pokemon',
    tags: ['hot_drop', 'new'],
    imageColor: '#E11D2E',
    creditPrice: 500,
    totalInventory: 30000,
    remainingInventory: 18420,
    valueDescription: '90% chance at 200+ credits value',
    guaranteeText: 'Holofoil guaranteed in every pack',
    maxPerUser: null,
  },
  {
    id: '3',
    title: 'One Piece Graded Vault Pack',
    category: 'one_piece',
    tags: ['graded', 'chase_boost'],
    imageColor: '#0F172A',
    creditPrice: 1000,
    totalInventory: 10000,
    remainingInventory: 3241,
    valueDescription: 'PSA 9–10 graded cards inside',
    guaranteeText: 'Every pack contains a graded card',
    maxPerUser: 2,
  },
  {
    id: '4',
    title: 'Sports Cards Flash Pack',
    category: 'sports',
    tags: ['hot_drop', 'new'],
    imageColor: '#1E3A5F',
    creditPrice: 750,
    totalInventory: 20000,
    remainingInventory: 9810,
    valueDescription: 'Rookie cards from top 2024 picks',
    guaranteeText: 'Auto or relic card every 5 opens',
    maxPerUser: null,
  },
  {
    id: '5',
    title: 'Pokémon Vintage Graded Pack',
    category: 'graded',
    tags: ['graded', 'best_value'],
    imageColor: '#3B1F6B',
    creditPrice: 2000,
    totalInventory: 5000,
    remainingInventory: 1102,
    valueDescription: 'Base Set era graded hits',
    guaranteeText: 'Guaranteed PSA 8+ condition',
    maxPerUser: 1,
  },
  {
    id: '6',
    title: 'Hot Drop Mystery Pack',
    category: 'hot_drops',
    tags: ['new', 'bonus_pack'],
    imageColor: '#7C2D12',
    creditPrice: 200,
    totalInventory: 100000,
    remainingInventory: 67340,
    valueDescription: 'Surprise mix from all categories',
    guaranteeText: 'Bonus pack after every 3 opens',
    maxPerUser: 10,
  },
  {
    id: '7',
    title: 'One Piece Paramount War Pack',
    category: 'one_piece',
    tags: ['new', 'chase_boost'],
    imageColor: '#134E4A',
    creditPrice: 600,
    totalInventory: 25000,
    remainingInventory: 19870,
    valueDescription: 'Leader SR cards with chase foils',
    guaranteeText: '1-in-10 chance at Alt Art',
    maxPerUser: null,
  },
  {
    id: '8',
    title: 'New Arrivals Sampler Pack',
    category: 'new',
    tags: ['new', 'new_user'],
    imageColor: '#1F2937',
    creditPrice: 150,
    totalInventory: 75000,
    remainingInventory: 71200,
    valueDescription: 'Sample hits from newest sets',
    guaranteeText: 'At least 3 cards per open',
    maxPerUser: 5,
  },
  {
    id: '9',
    title: 'Yu-Gi-Oh! Battles of Legend Pack',
    category: 'yugioh',
    tags: ['new', 'hot_drop'],
    imageColor: '#1A0A2E',
    creditPrice: 450,
    totalInventory: 18000,
    remainingInventory: 12400,
    valueDescription: 'Secret Rares and starlight chase slots',
    guaranteeText: 'Ultra Rare or higher every pack',
    maxPerUser: null,
  },
];

/** Top chips: product lines + cross-cutting rows (order = left-to-right in UI). */
export const categories: { key: PackCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pokemon', label: 'Pokémon' },
  { key: 'yugioh', label: 'Yu-Gi-Oh!' },
  { key: 'one_piece', label: 'One Piece' },
  { key: 'sports', label: 'Sports' },
  { key: 'graded', label: 'Graded' },
  { key: 'new', label: 'New' },
  { key: 'hot_drops', label: 'Hot Drops' },
];

/**
 * Credit packs for Buy Credits.
 * - `showPromoDiscount`: starter / low tiers only — % OFF + strikethrough (acquisition).
 * - High tiers ($5k+): list price only (no “was” / no badge) to avoid training whales on discounts.
 * JPY ≈ USD × (5,000,000 / 30,000) = ×166.67 for top-tier consistency.
 */
export interface CreditBundle {
  id: string;
  credits: number;
  label: string;
  bonus: string | null;
  /** When false, UI shows a single list price (no % badge, no crossed-out “was”). */
  showPromoDiscount: boolean;
  /** Shown only if showPromoDiscount */
  discountPercent: number;
  priceUsd: string;
  /** Strikethrough “was” — use empty string when !showPromoDiscount */
  priceUsdWas: string;
  /** Primary JPY line (promo: discounted; standard: only line shown) */
  jpyNow: string;
  /** Strikethrough JPY — empty when !showPromoDiscount */
  jpyWas: string;
}

export const creditBundles: CreditBundle[] = [
  /* ——— Promo tiers (cheap — show discount) ——— */
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
  /* ——— Standard tiers (no % badge — list price) ——— */
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
