/**
 * Re-exports shared catalog for the Next.js web app.
 * Coworker edits shared/mock/catalog.ts — both apps stay in sync.
 */
export {
  CATALOG_PACKS,
  getCatalogPack,
  getFeaturedPack,
} from '../../../shared/mock/catalog';

export { RECENT_PULLS } from '../../../shared/mock/recentPulls';

export type {
  CatalogPack,
  RecentPull,
  RarityTier,
  TcgCategory,
} from '../../../shared/types/pack';
