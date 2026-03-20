export type ChipTagType = 'new' | 'new_user' | 'best_value' | 'graded' | 'hot_drop' | 'bonus_pack' | 'chase_boost';

export type PackCategory = 'featured' | 'new' | 'pokemon' | 'one_piece' | 'sports' | 'graded' | 'hot_drops';

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
];

export const categories: { key: PackCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Featured' },
  { key: 'new', label: 'New' },
  { key: 'hot_drops', label: 'Hot Drops' },
  { key: 'pokemon', label: 'Pokémon' },
  { key: 'one_piece', label: 'One Piece' },
  { key: 'sports', label: 'Sports' },
  { key: 'graded', label: 'Graded' },
];

export const creditBundles = [
  { id: 'b1', credits: 500, price: '$4.99', label: '500 Credits', bonus: null },
  { id: 'b2', credits: 1000, price: '$9.99', label: '1,000 Credits', bonus: null },
  { id: 'b3', credits: 2500, price: '$22.99', label: '2,500 Credits', bonus: '+ 250 Bonus' },
  { id: 'b4', credits: 5000, price: '$44.99', label: '5,000 Credits', bonus: '+ 750 Bonus' },
];
