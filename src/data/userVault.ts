/**
 * User vault inventory — live Supabase when online, in-memory demo fallback otherwise.
 */
import type { Pull } from './mockUser';
import { CREDITS_ARE_MOCK } from '../config/app';
import { isSupabaseConfigured } from '../lib/supabase';
import { createClerkAuthedClient } from '../lib/supabaseAuthed';
import {
  fetchUserVaultItems as fetchShared,
  processInstantTradeInLive as tradeInShared,
  vaultItemToPull,
} from '../../shared/api/vault';
import type { SupabaseQueryClient, TradeInResponse, VaultItem } from '../../shared/api/types';
import { newIdempotencyKey } from '../../shared/api/idempotency';

export type { TradeInResponse, VaultItem };

export function isLiveVaultEnabled(): boolean {
  return !CREDITS_ARE_MOCK && isSupabaseConfigured;
}

export async function fetchUserVaultFromServer(): Promise<VaultItem[]> {
  if (!isLiveVaultEnabled()) return [];
  const client = await createClerkAuthedClient();
  if (!client) return [];
  return fetchShared(client as unknown as SupabaseQueryClient);
}

export async function instantTradeInLive(input: {
  vaultItemId: string;
  idempotencyKey?: string;
}): Promise<
  | { ok: true; response: TradeInResponse }
  | { ok: false; code: string; message: string }
> {
  if (!isLiveVaultEnabled()) {
    return {
      ok: false,
      code: 'VAULT_OFFLINE',
      message: 'Vault isn’t available right now. Please try again later.',
    };
  }

  const client = await createClerkAuthedClient();
  if (!client) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Sign in required' };
  }

  return tradeInShared(client as unknown as SupabaseQueryClient, {
    vaultItemId: input.vaultItemId,
    idempotencyKey: input.idempotencyKey ?? newIdempotencyKey(),
  });
}

/** Merge server vault rows into pull history (preserves local pending rows). */
export function mergeVaultItemsIntoPullHistory(
  pullHistory: Pull[],
  items: VaultItem[],
): Pull[] {
  const byPullId = new Map(items.map((item) => [item.pull_id, item]));
  const merged = pullHistory.map((pull) => {
    const item = byPullId.get(pull.id);
    if (!item) return pull;
    const mapped = vaultItemToPull(item, { packTitle: pull.packTitle, packId: pull.packId });
    return {
      ...pull,
      ...mapped,
      fulfillment: pull.fulfillment === 'pending' ? 'pending' : mapped.fulfillment,
    };
  });

  for (const item of items) {
    if (merged.some((p) => p.id === item.pull_id)) continue;
    merged.unshift(vaultItemToPull(item) as Pull);
  }

  return merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/** Demo-only: resolve vault item id from pull id in local state. */
export function resolveVaultItemIdForPull(
  pull: Pull,
  vaultIndex: Map<string, string>,
): string | undefined {
  return pull.vaultItemId ?? vaultIndex.get(pull.id);
}
