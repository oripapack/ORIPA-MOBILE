import { N2_TIERS, legacyTierToN2, type N2Tier } from '../lib/n2Rarity';

/**
 * Pack odds disclosure — N2 tier rows derived from live pool weights or static fallback.
 */

export type OddsTier = N2Tier;

export type TierOddsRow = {
  tier: OddsTier;
  chance: string;
  examples: string[];
};

export type PackOdds = {
  rows: TierOddsRow[];
  note: string;
  /** True when rows were computed from Supabase pack_pool_items. */
  isLive?: boolean;
};

/** Safe empty placeholder when pack is unresolved (hooks run before screen guard). */
export const EMPTY_PACK_ODDS: PackOdds = { rows: [], note: '' };

/** Production-safe state when no active pool can be verified. */
export const UNAVAILABLE_PACK_ODDS: PackOdds = {
  rows: [],
  note: 'Live pool odds are unavailable. This pack cannot be opened.',
  isLive: false,
};

const STATIC_FALLBACK_NOTE =
  'Demo probabilities — connect Supabase for live pool odds.';

const LIVE_NOTE =
  'Disclosed probabilities from the active pack pool. Rates reflect current pool weights.';

/** Static N2 placeholder for offline / packs without a live version id. */
const STATIC_TIER_CHANCES: Record<N2Tier, string> = {
  mythic: '0.5%',
  legendary: '2%',
  epic: '5.5%',
  base: '92%',
};

const STATIC_TIER_EXAMPLES: Record<N2Tier, string[]> = {
  mythic: ['Highest tier'],
  legendary: ['Second-highest tier'],
  epic: ['Mid tier'],
  base: ['Standard outcome'],
};

export type PackPoolItemInput = {
  card_name: string;
  weight: number;
  rarity_tier: string | null;
  item_id?: string;
};

function formatPercent(weight: number, total: number): string {
  if (total <= 0) return '0%';
  const pct = (weight / total) * 100;
  if (pct >= 10) return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(3)}%`;
}

function tierForPoolItem(item: PackPoolItemInput): N2Tier {
  if (item.rarity_tier) return legacyTierToN2(item.rarity_tier);
  return legacyTierToN2(item.item_id ?? 'base');
}

/** Build disclosure rows from weighted pool lines (sum of weights = 100% space). */
export function buildPackOddsFromPoolItems(items: PackPoolItemInput[]): PackOdds {
  const totalWeight = items.reduce((sum, row) => sum + Math.max(1, row.weight), 0);
  const byTier: Record<N2Tier, { weight: number; examples: string[] }> = {
    mythic: { weight: 0, examples: [] },
    legendary: { weight: 0, examples: [] },
    epic: { weight: 0, examples: [] },
    base: { weight: 0, examples: [] },
  };

  for (const item of items) {
    const tier = tierForPoolItem(item);
    byTier[tier].weight += Math.max(1, item.weight);
    if (byTier[tier].examples.length < 4) {
      byTier[tier].examples.push(item.card_name);
    }
  }

  const rows: TierOddsRow[] = N2_TIERS.filter((tier) => byTier[tier].weight > 0).map((tier) => ({
    tier,
    chance: formatPercent(byTier[tier].weight, totalWeight),
    examples: byTier[tier].examples,
  }));

  return {
    rows,
    note: LIVE_NOTE,
    isLive: true,
  };
}

/** Offline / demo fallback — identical static N2 disclosure for every pack. */
export function getStaticFallbackPackOdds(): PackOdds {
  return {
    rows: N2_TIERS.map((tier) => ({
      tier,
      chance: STATIC_TIER_CHANCES[tier],
      examples: STATIC_TIER_EXAMPLES[tier],
    })),
    note: STATIC_FALLBACK_NOTE,
    isLive: false,
  };
}

/** @deprecated Prefer resolvePackOdds() / usePackOdds — static fallback only. */
export function getMockPackOdds(_pack?: unknown): PackOdds {
  return getStaticFallbackPackOdds();
}
