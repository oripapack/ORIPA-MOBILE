import type { CatalogPack, TcgCategory } from '../../shared/types/pack';
import { CATALOG_PACKS } from '../../shared/mock/catalog';
import { tcgCategoryToSlug } from '../../shared/utils/foil';
import type {
  ChipTagType,
  Pack,
  PackCategory,
  PackGroup,
} from '../data/mockPacks';
import { packVersionIdForCatalogPackId } from '../../shared/api/catalogLive';

const TOTAL_INVENTORY_BASE = 50_000;

function inferPackCategory(catalog: CatalogPack): PackCategory {
  if (catalog.id === 'welcome-pack' || catalog.isNew) return 'onboarding';
  if (catalog.priceRange === 'budget' || catalog.price < 25) return 'micro';
  return 'premium';
}

const CATEGORY_TO_GROUP: Record<PackCategory, PackGroup> = {
  onboarding: 'first_time',
  micro: 'low_cost',
  premium: 'high_value',
};

function inferTags(catalog: CatalogPack): ChipTagType[] {
  const tags: ChipTagType[] = [];
  if (catalog.id === 'welcome-pack') tags.push('first_time', 'new_user', 'best_value');
  if (catalog.isFeatured) tags.push('hot_drop');
  if (catalog.isNew) tags.push('new');
  if (catalog.isLimitedTime) tags.push('chase_boost');
  if (catalog.priceRange === 'budget') tags.push('low_cost');
  if (catalog.priceRange === 'premium' || catalog.price >= 75) tags.push('premium_pack', 'high_return');
  if (catalog.rarityTier === 'legendary' || catalog.rarityTier === 'mythic') tags.push('graded', 'chase_boost');
  if (tags.length === 0) tags.push('best_value');
  return tags;
}

const FOIL_COLORS: Record<string, string> = {
  pokemon: '#1a0f30',
  one_piece: '#0f2040',
  yugioh: '#281400',
  sports: '#200d18',
  multi: '#1e293b',
};

function foilColorFor(category: TcgCategory): string {
  const slug = tcgCategoryToSlug(category);
  return FOIL_COLORS[slug] ?? FOIL_COLORS.multi;
}

/** Maps shared catalog entry → legacy mobile Pack (store + navigation). */
export function catalogToPack(catalog: CatalogPack): Pack {
  const category = inferPackCategory(catalog);
  const totalInventory = Math.round(TOTAL_INVENTORY_BASE / Math.max(catalog.remainingFraction, 0.1));
  const remainingInventory = Math.round(totalInventory * catalog.remainingFraction);

  return {
    id: catalog.id,
    title: catalog.name,
    category,
    packTier: category,
    packGroup: CATEGORY_TO_GROUP[category],
    tags: inferTags(catalog),
    imageColor: foilColorFor(catalog.category),
    creditPrice: catalog.price * 100,
    totalInventory,
    remainingInventory,
    valueDescription: catalog.description,
    guaranteeText: `${catalog.buybackRate}% instant buyback · transparent odds`,
    maxPerUser: catalog.id === 'welcome-pack' ? 1 : null,
    isFirstTimePack: catalog.id === 'welcome-pack',
    packVersionId: packVersionIdForCatalogPackId(catalog.id),
    highlightPrize: catalog.topCard,
    prizeTypes: ['card'],
    tcgCategory: catalog.category,
    buybackRate: catalog.buybackRate,
    tagline: catalog.tagline,
    catalogDescription: catalog.description,
    topCard: catalog.topCard,
    pullCount: catalog.pullCount,
    remainingFraction: catalog.remainingFraction,
    rarityTier: catalog.rarityTier,
    isFeatured: catalog.isFeatured,
    isNew: catalog.isNew,
    isLimitedTime: catalog.isLimitedTime,
    priceRange: catalog.priceRange,
    demoReveal: catalog.demoReveal,
  };
}

export function catalogPacksToMobile(): Pack[] {
  return CATALOG_PACKS.map(catalogToPack);
}

export function getCatalogPackForMobile(id: string): Pack | undefined {
  const catalog = CATALOG_PACKS.find((p) => p.id === id);
  return catalog ? catalogToPack(catalog) : undefined;
}
