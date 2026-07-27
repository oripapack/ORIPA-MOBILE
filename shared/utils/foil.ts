import type { TcgCategory } from '../types/pack';

export function tcgCategoryToSlug(category: TcgCategory): string {
  switch (category) {
    case 'Pokémon TCG': return 'pokemon';
    case 'One Piece TCG': return 'one_piece';
    case 'Yu-Gi-Oh!': return 'yugioh';
    case 'Sports Cards': return 'sports';
    default: return 'multi';
  }
}
