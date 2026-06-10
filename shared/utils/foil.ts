import type { TcgCategory } from '../types/pack';

export interface FoilGradient {
  top: string;
  mid: string;
  bot: string;
  accent: string;
}

/** Category-based foil gradient for pack visuals. */
export function getCategoryFoil(category: string): FoilGradient {
  const c = category.toLowerCase();
  if (c.includes('pokemon') || c.includes('pokémon')) {
    return { top: '#1a0f30', mid: '#3d1e6e', bot: '#1a0f30', accent: 'rgba(168,85,247,0.35)' };
  }
  if (c.includes('one piece')) {
    return { top: '#0f2040', mid: '#1e4080', bot: '#0f2040', accent: 'rgba(96,165,250,0.35)' };
  }
  if (c.includes('sports')) {
    return { top: '#200d18', mid: '#5c1a38', bot: '#200d18', accent: 'rgba(236,72,153,0.35)' };
  }
  if (c.includes('yu-gi') || c.includes('yugioh')) {
    return { top: '#281400', mid: '#5c3000', bot: '#1a0d00', accent: 'rgba(245,158,11,0.38)' };
  }
  return { top: '#1e293b', mid: '#334155', bot: '#1e293b', accent: 'rgba(148,163,184,0.25)' };
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
