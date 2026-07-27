import { sg } from '../tokens/sg';

export interface FoilGradient {
  top: string;
  mid: string;
  bot: string;
  accent: string;
}

/**
 * Category-based foil gradient for pack visuals.
 *
 * Moved here from shared/utils/foil.ts so the values come straight from the
 * N2 tokens (shared/ cannot import src/tokens — the old copy duplicated hex
 * by hand, which is guaranteed to drift). N2 §5-2: the per-category colored
 * foils (incl. purple) are gone; every category gets the same achromatic
 * ground — surface2 over surface with `line` as accent — as a placeholder
 * until real pack art lands. The gradient plumbing stays so a §8 foil sweep
 * can ride on it later.
 */
export function getCategoryFoil(_category: string): FoilGradient {
  return { top: sg.surface2, mid: sg.surface, bot: sg.surface2, accent: sg.line };
}
