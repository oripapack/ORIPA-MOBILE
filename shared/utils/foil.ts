import type { TcgCategory } from '../types/pack';

export interface FoilGradient {
  top: string;
  mid: string;
  bot: string;
  accent: string;
}

/**
 * Category-based foil gradient for pack visuals.
 *
 * N2 §5-2: the old per-category colored foils (incl. purple) are removed —
 * purple is not in the N2 palette and had become the de-facto brand color by
 * area. Until real pack art lands, every category gets the same achromatic
 * ground: surface2 (#17171C) over surface (#101013) with the 1px `line`
 * (#27272E) as accent. Values mirror src/tokens/sg.ts (shared/ cannot import
 * src/, so they are duplicated here by design — keep in sync).
 * The gradient plumbing stays so a §8 foil sweep can ride on it later.
 */
export function getCategoryFoil(_category: string): FoilGradient {
  return { top: '#17171C', mid: '#101013', bot: '#17171C', accent: '#27272E' };
}

export function tcgCategoryToSlug(category: TcgCategory): string {
  switch (category) {
    case 'Pokémon TCG': return 'pokemon';
    case 'One Piece TCG': return 'one_piece';
    case 'Yu-Gi-Oh!': return 'yugioh';
    case 'Sports Cards': return 'sports';
    default: return 'multi';
  }
}
