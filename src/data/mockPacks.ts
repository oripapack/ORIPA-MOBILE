import { demoPackHeroImage } from './demoMedia';

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
  /** Optional hero art — when set, PackCard shows photo + gradient overlay. */
  imageUrl?: string;
  creditPrice: number;
  totalInventory: number;
  remainingInventory: number;
  valueDescription: string;
  guaranteeText: string;
  maxPerUser: number | null;
}

/** Home screen primary tabs — product lines only (no mega “All”). */
export type HomeNicheCategory = 'pokemon' | 'yugioh' | 'one_piece' | 'sports';

export const HOME_NICHE_CATEGORIES: HomeNicheCategory[] = ['pokemon', 'yugioh', 'one_piece', 'sports'];

const IP_LINE_CATEGORIES = new Set<PackCategory>(['pokemon', 'yugioh', 'one_piece', 'sports']);

/** Sub-filters within the selected niche (tags + cross-line categories). */
export type PackSubfilter = 'all' | ChipTagType;

export const HOME_SUBFILTER_KEYS: PackSubfilter[] = [
  'all',
  'new',
  'hot_drop',
  'graded',
  'best_value',
  'chase_boost',
  'bonus_pack',
  'new_user',
];

export function packBelongsToHomeNiche(pack: Pack, niche: HomeNicheCategory): boolean {
  if (pack.category === niche) return true;
  if (!IP_LINE_CATEGORIES.has(pack.category)) return true;
  return false;
}

export function packMatchesSubfilter(pack: Pack, sub: PackSubfilter): boolean {
  if (sub === 'all') return true;
  if (pack.tags.includes(sub)) return true;
  if (sub === 'new' && pack.category === 'new') return true;
  if (sub === 'hot_drop' && pack.category === 'hot_drops') return true;
  if (sub === 'graded' && pack.category === 'graded') return true;
  return false;
}

export const mockPacks: Pack[] = [
  {
    id: '1',
    title: 'New User Welcome Pack',
    category: 'featured',
    tags: ['new_user', 'best_value'],
    imageColor: '#1C1C2E',
    imageUrl: demoPackHeroImage('1'),
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
    imageColor: '#4F46E5',
    imageUrl: demoPackHeroImage('2'),
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
    imageUrl: demoPackHeroImage('3'),
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
    imageUrl: demoPackHeroImage('4'),
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
    imageUrl: demoPackHeroImage('5'),
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
    imageUrl: demoPackHeroImage('6'),
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
    imageUrl: demoPackHeroImage('7'),
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
    imageUrl: demoPackHeroImage('8'),
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
    imageUrl: demoPackHeroImage('9'),
    creditPrice: 450,
    totalInventory: 18000,
    remainingInventory: 12400,
    valueDescription: 'Secret Rares and starlight chase slots',
    guaranteeText: 'Ultra Rare or higher every pack',
    maxPerUser: null,
  },
  {
    id: '10',
    title: 'Prism Clash Championship Box',
    category: 'pokemon',
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#4C1D95',
    imageUrl: demoPackHeroImage('10'),
    creditPrice: 850,
    totalInventory: 14000,
    remainingInventory: 9021,
    valueDescription: 'Full-art trainers & secret rare chase lane',
    guaranteeText: 'VSTAR or better in every 3rd pack',
    maxPerUser: 3,
  },
  {
    id: '11',
    title: 'Obsidian Moon Elite Crate',
    category: 'pokemon',
    tags: ['new', 'best_value'],
    imageColor: '#0C4A6E',
    imageUrl: demoPackHeroImage('11'),
    creditPrice: 1200,
    totalInventory: 8000,
    remainingInventory: 4102,
    valueDescription: 'Alt arts & special illustration pool',
    guaranteeText: 'Double rare slot on every open',
    maxPerUser: 2,
  },
  {
    id: '12',
    title: 'Stadium Legends Pro Wax',
    category: 'sports',
    tags: ['graded', 'hot_drop'],
    imageColor: '#14532D',
    imageUrl: demoPackHeroImage('12'),
    creditPrice: 920,
    totalInventory: 12000,
    remainingInventory: 7800,
    valueDescription: 'Rookie autos & patch relics',
    guaranteeText: 'Serial numbered hit every 4 opens',
    maxPerUser: null,
  },
  {
    id: '13',
    title: 'Holographic Dreams Booster',
    category: 'featured',
    tags: ['new_user', 'bonus_pack'],
    imageColor: '#831843',
    imageUrl: demoPackHeroImage('13'),
    creditPrice: 275,
    totalInventory: 60000,
    remainingInventory: 44120,
    valueDescription: 'Iridescent chase pool · all lines',
    guaranteeText: 'Bonus roll after every 2 opens',
    maxPerUser: 8,
  },
  {
    id: '14',
    title: 'Rift Masters Cross-Set',
    category: 'hot_drops',
    tags: ['hot_drop', 'new'],
    imageColor: '#9A3412',
    imageUrl: demoPackHeroImage('14'),
    creditPrice: 350,
    totalInventory: 45000,
    remainingInventory: 31200,
    valueDescription: 'Random set mix — surprise EV curve',
    guaranteeText: 'Guaranteed foil or better',
    maxPerUser: 12,
  },
  {
    id: '15',
    title: 'Film Red Treasure Vault',
    category: 'one_piece',
    tags: ['chase_boost', 'new'],
    imageColor: '#991B1B',
    imageUrl: demoPackHeroImage('15'),
    creditPrice: 680,
    totalInventory: 19000,
    remainingInventory: 12440,
    valueDescription: 'Leader alt arts & manga rares',
    guaranteeText: 'SR+ in every pack',
    maxPerUser: null,
  },
  {
    id: '16',
    title: 'Magnificent Mavens Reloaded',
    category: 'yugioh',
    tags: ['graded', 'best_value'],
    imageColor: '#312E81',
    imageUrl: demoPackHeroImage('16'),
    creditPrice: 520,
    totalInventory: 22000,
    remainingInventory: 15600,
    valueDescription: 'Starlight & CR slots enabled',
    guaranteeText: 'Ultra Rare minimum rarity',
    maxPerUser: 6,
  },
  {
    id: '17',
    title: 'Gem Mint Showcase',
    category: 'graded',
    tags: ['graded', 'hot_drop'],
    imageColor: '#581C87',
    imageUrl: demoPackHeroImage('17'),
    creditPrice: 2400,
    totalInventory: 3200,
    remainingInventory: 890,
    valueDescription: 'PSA 10 chase slab rotation',
    guaranteeText: 'Every slab is PSA 9+',
    maxPerUser: 1,
  },
  {
    id: '18',
    title: 'Turbo New Arrivals Crate',
    category: 'new',
    tags: ['new', 'bonus_pack'],
    imageColor: '#164E63',
    imageUrl: demoPackHeroImage('18'),
    creditPrice: 195,
    totalInventory: 88000,
    remainingInventory: 72100,
    valueDescription: 'Fresh set sampling — fast hits',
    guaranteeText: '3+ playable cards per rip',
    maxPerUser: 15,
  },
  {
    id: '19',
    title: 'Midnight Chase Roulette',
    category: 'hot_drops',
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#1E1B4B',
    imageUrl: demoPackHeroImage('19'),
    creditPrice: 425,
    totalInventory: 55000,
    remainingInventory: 38900,
    valueDescription: 'Weighted mythic table after 10 PM',
    guaranteeText: 'Double pull token every 5 opens',
    maxPerUser: null,
  },
  {
    id: '20',
    title: 'TCG Classic Anniversary',
    category: 'pokemon',
    tags: ['best_value', 'graded'],
    imageColor: '#B45309',
    imageUrl: demoPackHeroImage('20'),
    creditPrice: 1500,
    totalInventory: 6000,
    remainingInventory: 2100,
    valueDescription: 'Retro holos & reprint grails',
    guaranteeText: 'Vintage slot in every box',
    maxPerUser: 2,
  },
  {
    id: '21',
    title: 'Rookie Year Chronicles',
    category: 'sports',
    tags: ['new', 'new_user'],
    imageColor: '#1D4ED8',
    imageUrl: demoPackHeroImage('21'),
    creditPrice: 640,
    totalInventory: 16000,
    remainingInventory: 11200,
    valueDescription: '2024 rookie class spotlight',
    guaranteeText: 'RC or auto in every 2 packs',
    maxPerUser: null,
  },
  {
    id: '22',
    title: 'Alt-Art Appreciation Pack',
    category: 'pokemon',
    tags: ['chase_boost', 'hot_drop'],
    imageColor: '#BE185D',
    imageUrl: demoPackHeroImage('22'),
    creditPrice: 780,
    totalInventory: 11000,
    remainingInventory: 6400,
    valueDescription: 'Full-art & special illustration focus',
    guaranteeText: 'Alt art in 1-of-6 opens (demo odds)',
    maxPerUser: 4,
  },
  {
    id: '23',
    title: 'Sealed Vault Mystery',
    category: 'featured',
    tags: ['bonus_pack', 'best_value'],
    imageColor: '#134E4A',
    imageUrl: demoPackHeroImage('23'),
    creditPrice: 1100,
    totalInventory: 7000,
    remainingInventory: 3020,
    valueDescription: 'Factory sealed product — random SKU',
    guaranteeText: 'Minimum MSRP 1.2× entry',
    maxPerUser: 1,
  },
  {
    id: '24',
    title: 'Crossover Battle Pass',
    category: 'hot_drops',
    tags: ['new', 'bonus_pack'],
    imageColor: '#713F12',
    imageUrl: demoPackHeroImage('24'),
    creditPrice: 225,
    totalInventory: 95000,
    remainingInventory: 80100,
    valueDescription: 'Multi-IP pool — wild variance',
    guaranteeText: 'Streak bonus after 7 opens',
    maxPerUser: 20,
  },
];

/**
 * @deprecated Home uses `HOME_NICHE_CATEGORIES` + `PackSubfilter`; kept for scripts / docs parity.
 */
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
