import { demoPackHeroImage } from './demoMedia';

export type ChipTagType = 'new' | 'new_user' | 'best_value' | 'graded' | 'hot_drop' | 'bonus_pack' | 'chase_boost';

/** Home niche tabs — every demo pack belongs to exactly one product line. */
export type HomeNicheCategory = 'pokemon' | 'yugioh' | 'one_piece' | 'sports';

export type PackCategory = HomeNicheCategory;

export interface Pack {
  id: string;
  title: string;
  category: PackCategory;
  tags: ChipTagType[];
  imageColor: string;
  imageUrl?: string;
  creditPrice: number;
  totalInventory: number;
  remainingInventory: number;
  valueDescription: string;
  guaranteeText: string;
  maxPerUser: number | null;
}

export const HOME_NICHE_CATEGORIES: HomeNicheCategory[] = ['pokemon', 'yugioh', 'one_piece', 'sports'];

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
  return pack.category === niche;
}

export function packMatchesSubfilter(pack: Pack, sub: PackSubfilter): boolean {
  if (sub === 'all') return true;
  return pack.tags.includes(sub);
}

function p(
  id: string,
  title: string,
  category: HomeNicheCategory,
  args: {
    creditPrice: number;
    tags: ChipTagType[];
    imageColor: string;
    valueDescription: string;
    guaranteeText: string;
    maxPerUser: number | null;
    totalInventory?: number;
    remainingInventory?: number;
  },
): Pack {
  const n = parseInt(id, 10);
  const invBase = Number.isFinite(n) ? 52000 - n * 1100 : 40000;
  return {
    id,
    title,
    category,
    tags: args.tags,
    imageColor: args.imageColor,
    imageUrl: demoPackHeroImage(id),
    creditPrice: args.creditPrice,
    totalInventory: args.totalInventory ?? 50000,
    remainingInventory: args.remainingInventory ?? Math.max(800, invBase),
    valueDescription: args.valueDescription,
    guaranteeText: args.guaranteeText,
    maxPerUser: args.maxPerUser,
  };
}

/**
 * Demo catalog: 10 packs per genre, cheap → expensive credits.
 * Titles and copy match real product lines so simulated pulls stay on-theme.
 */
export const mockPacks: Pack[] = [
  // ——— Pokémon (ids 1–10) ———
  p('1', 'Paldea Beginner Commons', 'pokemon', {
    creditPrice: 85,
    tags: ['new_user', 'best_value'],
    imageColor: '#14532D',
    valueDescription: 'PAL-era commons & uncommons — great for new binders',
    guaranteeText: '3+ playable cards every open',
    maxPerUser: 6,
  }),
  p('2', 'Scarlet & Violet Booster Hits', 'pokemon', {
    creditPrice: 125,
    tags: ['new'],
    imageColor: '#4F46E5',
    valueDescription: 'SV-era holos & illustration rare chase slots',
    guaranteeText: 'Reverse holo or better in every pack',
    maxPerUser: null,
  }),
  p('3', 'Paldea Evolved Chase', 'pokemon', {
    creditPrice: 220,
    tags: ['best_value'],
    imageColor: '#0E7490',
    valueDescription: 'ex & double rare hits from Paldea Evolved',
    guaranteeText: 'Rare slot or higher guaranteed',
    maxPerUser: null,
  }),
  p('4', 'Obsidian Flames Premium', 'pokemon', {
    creditPrice: 360,
    tags: ['hot_drop'],
    imageColor: '#9A3412',
    valueDescription: 'Charizard ex & type-shift chase pool',
    guaranteeText: 'Holo rare or better every rip',
    maxPerUser: null,
  }),
  p('5', '151 Kanto Collection', 'pokemon', {
    creditPrice: 520,
    tags: ['chase_boost'],
    imageColor: '#BE123C',
    valueDescription: 'Classic Kanto ex & art rare focus',
    guaranteeText: 'Illustration rare in 1-of-8 opens (demo)',
    maxPerUser: null,
  }),
  p('6', 'Crown Zenith Galarian Gallery', 'pokemon', {
    creditPrice: 780,
    tags: ['hot_drop'],
    imageColor: '#6D28D9',
    valueDescription: 'GG full arts & trainer gallery chases',
    guaranteeText: 'Gallery or VSTAR-class hit every 2 packs',
    maxPerUser: 3,
  }),
  p('7', 'Prismatic Evolutions Elite', 'pokemon', {
    creditPrice: 1180,
    tags: ['graded'],
    imageColor: '#831843',
    valueDescription: 'Eevee evolutions & ACE SPEC chase lane',
    guaranteeText: 'Double rare slot minimum',
    maxPerUser: 2,
  }),
  p('8', 'Charizard ex Special Collection', 'pokemon', {
    creditPrice: 1850,
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#EA580C',
    valueDescription: 'Promo Charizard ex & bundled chase cards',
    guaranteeText: 'Promo + booster-equivalent value floor',
    maxPerUser: 2,
  }),
  p('9', 'Base Set Era Graded Vault', 'pokemon', {
    creditPrice: 4200,
    tags: ['graded', 'chase_boost'],
    imageColor: '#312E81',
    valueDescription: 'WOTC holos & shadowless chase slabs',
    guaranteeText: 'PSA 8+ vintage holo in every pack',
    maxPerUser: 1,
  }),
  p('10', 'PSA 10 Trophy Showcase', 'pokemon', {
    creditPrice: 8500,
    tags: ['graded', 'chase_boost'],
    imageColor: '#1E1B4B',
    valueDescription: 'Modern SAR & trophy-grade slabs',
    guaranteeText: 'PSA 10 or BGS 9.5+ chase rotation',
    maxPerUser: 1,
  }),

  // ——— One Piece TCG (ids 11–20) ———
  p('11', 'Romance Dawn Reprint Starters', 'one_piece', {
    creditPrice: 95,
    tags: ['new_user', 'best_value'],
    imageColor: '#1E3A5F',
    valueDescription: 'ST-01 / early leaders & commons',
    guaranteeText: 'Leader or key character in every pack',
    maxPerUser: 8,
  }),
  p('12', 'Paramount War Leaders', 'one_piece', {
    creditPrice: 145,
    tags: ['new'],
    imageColor: '#134E4A',
    valueDescription: 'OP-02 leader rares & event cards',
    guaranteeText: 'SR or parallel in 1-of-4 opens (demo)',
    maxPerUser: null,
  }),
  p('13', 'OP-05 Awakening of the New Era', 'one_piece', {
    creditPrice: 265,
    tags: ['best_value'],
    imageColor: '#14532D',
    valueDescription: 'Manga rare & character SR pool',
    guaranteeText: 'Super rare or better every pack',
    maxPerUser: null,
  }),
  p('14', 'OP-06 Wings of the Captain', 'one_piece', {
    creditPrice: 390,
    tags: ['hot_drop'],
    imageColor: '#166534',
    valueDescription: 'Alt-art leaders & foil chase slots',
    guaranteeText: 'DON!! card + rare slot guaranteed',
    maxPerUser: null,
  }),
  p('15', 'OP-07 500 Years in the Future', 'one_piece', {
    creditPrice: 540,
    tags: ['chase_boost'],
    imageColor: '#991B1B',
    valueDescription: 'Egghead arc SR chase & manga panels',
    guaranteeText: 'Leader alt art in 1-of-10 opens (demo)',
    maxPerUser: null,
  }),
  p('16', 'OP-08 Two Legends', 'one_piece', {
    creditPrice: 720,
    tags: ['hot_drop'],
    imageColor: '#7C2D12',
    valueDescription: 'Dual-leader meta & parallel foils',
    guaranteeText: 'Two rare+ slots per open',
    maxPerUser: null,
  }),
  p('17', 'OP-09 Emperors in the New World', 'one_piece', {
    creditPrice: 1050,
    tags: ['graded'],
    imageColor: '#4C1D95',
    valueDescription: 'Yonko-era chases & full-art events',
    guaranteeText: 'SR+ with foil treatment every rip',
    maxPerUser: 2,
  }),
  p('18', 'Leader Alt Art Vault', 'one_piece', {
    creditPrice: 1680,
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#881337',
    valueDescription: 'ST & OP-01–OP-09 alt-art leaders',
    guaranteeText: 'Alt-art or manga rare in 1-of-6 opens',
    maxPerUser: 2,
  }),
  p('19', 'Manga Rare & Don!! Chase', 'one_piece', {
    creditPrice: 2980,
    tags: ['graded', 'chase_boost'],
    imageColor: '#0F172A',
    valueDescription: 'Serialized parallels & top manga hits',
    guaranteeText: 'Serialized or manga rare floor',
    maxPerUser: 1,
  }),
  p('20', 'Holy Grail PSA Manga Slot', 'one_piece', {
    creditPrice: 7800,
    tags: ['graded', 'chase_boost'],
    imageColor: '#312E81',
    valueDescription: 'Graded chase leaders & trophy panels',
    guaranteeText: 'PSA 9+ graded hit every pack',
    maxPerUser: 1,
  }),

  // ——— Yu-Gi-Oh! (ids 21–30) ———
  p('21', 'Speed Duel & Structure Mix', 'yugioh', {
    creditPrice: 75,
    tags: ['new_user', 'best_value'],
    imageColor: '#1A0A2E',
    valueDescription: 'Starter staples & common reprints',
    guaranteeText: '8+ playable cards per open',
    maxPerUser: 10,
  }),
  p('22', 'Photon Hypernova', 'yugioh', {
    creditPrice: 130,
    tags: ['new'],
    imageColor: '#312E81',
    valueDescription: 'Kashtira & Tearlaments-era secrets',
    guaranteeText: 'Super rare or higher every pack',
    maxPerUser: null,
  }),
  p('23', 'Maze of Millennia', 'yugioh', {
    creditPrice: 245,
    tags: ['best_value'],
    imageColor: '#4C1D95',
    valueDescription: 'Collector’s rare chase pool',
    guaranteeText: 'Ultra rare minimum rarity',
    maxPerUser: null,
  }),
  p('24', 'Legacy of Destruction', 'yugioh', {
    creditPrice: 395,
    tags: ['hot_drop'],
    imageColor: '#581C87',
    valueDescription: 'Voiceless Voice & Sinful Spoils support',
    guaranteeText: 'Secret rare slot enabled',
    maxPerUser: null,
  }),
  p('25', 'Rage of the Abyss', 'yugioh', {
    creditPrice: 555,
    tags: ['chase_boost'],
    imageColor: '#701A75',
    valueDescription: 'Abyss-themed ultras & quarter-century slots',
    guaranteeText: 'Ultra rare or higher — no commons-only',
    maxPerUser: null,
  }),
  p('26', 'Phantom Nightmare', 'yugioh', {
    creditPrice: 820,
    tags: ['hot_drop'],
    imageColor: '#1E1B4B',
    valueDescription: 'Nightmare Magician & Fiendsmith chase',
    guaranteeText: 'Super rare+ in every 2 packs',
    maxPerUser: null,
  }),
  p('27', 'Battles of Legend: Terminal Revenge', 'yugioh', {
    creditPrice: 1280,
    tags: ['graded'],
    imageColor: '#312E81',
    valueDescription: 'High-impact reprints & ghost rare chase',
    guaranteeText: 'Secret rare or collector’s rare every pack',
    maxPerUser: 2,
  }),
  p('28', 'Quarter Century Chronicle', 'yugioh', {
    creditPrice: 2150,
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#4C1D95',
    valueDescription: 'Quarter-century secret & nostalgia hits',
    guaranteeText: 'QC secret or starlight chase lane',
    maxPerUser: 2,
  }),
  p('29', 'LOB 1st Edition Chase', 'yugioh', {
    creditPrice: 4650,
    tags: ['graded', 'chase_boost'],
    imageColor: '#172554',
    valueDescription: 'Legend of Blue Eyes vintage ultra chase',
    guaranteeText: 'LOB-era holo or graded slab',
    maxPerUser: 1,
  }),
  p('30', 'Starlight Anniversary God Box', 'yugioh', {
    creditPrice: 9200,
    tags: ['graded', 'chase_boost'],
    imageColor: '#0F172A',
    valueDescription: 'Starlight & prize-card tier chases',
    guaranteeText: 'Starlight or equivalent top rarity',
    maxPerUser: 1,
  }),

  // ——— Sports cards (ids 31–40) ———
  p('31', 'Hobby Rookie Mixer', 'sports', {
    creditPrice: 90,
    tags: ['new_user', 'best_value'],
    imageColor: '#1E3A5F',
    valueDescription: 'NFL / NBA / MLB base & insert mix',
    guaranteeText: 'Rookie card in every pack',
    maxPerUser: null,
  }),
  p('32', 'Prizm Retail Hits', 'sports', {
    creditPrice: 155,
    tags: ['new'],
    imageColor: '#0C4A6E',
    valueDescription: 'Silver & base Prizm rookies',
    guaranteeText: 'Insert or parallel every 2 opens',
    maxPerUser: null,
  }),
  p('33', 'Optic Holo Rookies', 'sports', {
    creditPrice: 285,
    tags: ['best_value'],
    imageColor: '#14532D',
    valueDescription: 'Rated rookie holos & downtown chase',
    guaranteeText: 'Holo rookie or key insert',
    maxPerUser: null,
  }),
  p('34', 'Select Concourse', 'sports', {
    creditPrice: 445,
    tags: ['hot_drop'],
    imageColor: '#854D0E',
    valueDescription: 'Concourse silvers & tri-color parallels',
    guaranteeText: 'Numbered or SP in 1-of-5 opens (demo)',
    maxPerUser: null,
  }),
  p('35', 'Mosaic Fast Break', 'sports', {
    creditPrice: 665,
    tags: ['chase_boost'],
    imageColor: '#422006',
    valueDescription: 'Genesis & reactive gold parallels',
    guaranteeText: 'Mosaic parallel every rip',
    maxPerUser: null,
  }),
  p('36', 'National Treasures RPA Chase', 'sports', {
    creditPrice: 980,
    tags: ['hot_drop'],
    imageColor: '#1C1917',
    valueDescription: 'On-card autos & patch relics',
    guaranteeText: 'Relic or auto hit every 3 packs',
    maxPerUser: null,
  }),
  p('37', 'Flawless Gem Hits', 'sports', {
    creditPrice: 1520,
    tags: ['graded'],
    imageColor: '#0F172A',
    valueDescription: 'Diamond & gemstone parallel rookies',
    guaranteeText: 'Gem mint candidate or PSA slab',
    maxPerUser: 2,
  }),
  p('38', 'The Cup /99 RPA', 'sports', {
    creditPrice: 2680,
    tags: ['hot_drop', 'chase_boost'],
    imageColor: '#78350F',
    valueDescription: 'Hockey & basketball cup RPAs',
    guaranteeText: 'Premium patch or auto slot',
    maxPerUser: 1,
  }),
  p('39', '1986 Fleer Basketball Chase', 'sports', {
    creditPrice: 5800,
    tags: ['graded', 'chase_boost'],
    imageColor: '#7F1D1D',
    valueDescription: 'Vintage wax-era grail chase',
    guaranteeText: 'Graded vintage or iconic rookie',
    maxPerUser: 1,
  }),
  p('40', 'Logoman 1/1 Vault', 'sports', {
    creditPrice: 9800,
    tags: ['graded', 'chase_boost'],
    imageColor: '#F59E0B',
    valueDescription: '1/1 shields & laundry-tag logoman chases',
    guaranteeText: '1-of-1 or /5 hit rotation (demo)',
    maxPerUser: 1,
  }),
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
];

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
