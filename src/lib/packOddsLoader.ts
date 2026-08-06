import {
  buildPackOddsFromPoolItems,
  getStaticFallbackPackOdds,
  type PackOdds,
  type PackPoolItemInput,
} from '../data/packOdds';
import type { Pack } from '../data/mockPacks';
import { isSupabaseConfigured, supabase } from './supabase';

const oddsCache = new Map<string, Promise<PackOdds>>();

export async function fetchPackPoolItems(packVersionId: string): Promise<PackPoolItemInput[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('pack_pool_items')
    .select('card_name,weight,rarity_tier,item_id')
    .eq('pack_version_id', packVersionId)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return null;

  return data.map((row) => ({
    card_name: row.card_name,
    weight: Number(row.weight),
    rarity_tier: row.rarity_tier,
    item_id: row.item_id,
  }));
}

export async function resolvePackOdds(pack: Pack): Promise<PackOdds> {
  if (!pack.packVersionId || !isSupabaseConfigured) {
    return getStaticFallbackPackOdds();
  }

  const cached = oddsCache.get(pack.packVersionId);
  if (cached) return cached;

  const promise = (async () => {
    const items = await fetchPackPoolItems(pack.packVersionId!);
    if (!items?.length) return getStaticFallbackPackOdds();
    return buildPackOddsFromPoolItems(items);
  })();

  oddsCache.set(pack.packVersionId, promise);
  return promise;
}

/** Clear cached odds (e.g. after admin pool update in dev). */
export function invalidatePackOddsCache(packVersionId?: string): void {
  if (packVersionId) {
    oddsCache.delete(packVersionId);
    return;
  }
  oddsCache.clear();
}
