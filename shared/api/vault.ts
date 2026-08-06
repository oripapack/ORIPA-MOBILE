import { catalogPackIdForPackVersionId } from './catalogLive';
import type {
  SupabaseQueryClient,
  TradeInRequest,
  TradeInResponse,
  VaultItem,
  VaultItemStatus,
} from './types';
import type { N2Tier } from '../../src/lib/n2Rarity';
import { legacyTierToN2 } from '../../src/lib/n2Rarity';

export type { TradeInRequest, TradeInResponse, VaultItem, VaultItemStatus };

const VAULT_ITEM_SELECT =
  'id,user_id,pull_id,card_id,card_name,rarity_tier,acquisition_type,status,trade_in_value_credits,pack_version_id,vault_expires_at,metadata,created_at,updated_at';

function mapVaultRow(row: Record<string, unknown>): VaultItem {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    pull_id: String(row.pull_id),
    card_id: String(row.card_id),
    card_name: String(row.card_name),
    rarity_tier: legacyTierToN2(String(row.rarity_tier ?? 'base')) as N2Tier,
    acquisition_type: 'pack_pull',
    status: String(row.status ?? 'vaulted') as VaultItemStatus,
    trade_in_value_credits: Number(row.trade_in_value_credits ?? 0),
    pack_version_id: row.pack_version_id ? String(row.pack_version_id) : null,
    vault_expires_at: row.vault_expires_at ? String(row.vault_expires_at) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/** Fetch all vault inventory rows for the signed-in user (RLS-scoped). */
export async function fetchUserVaultItems(
  client: SupabaseQueryClient,
): Promise<VaultItem[]> {
  const sb = client as SupabaseQueryClient & {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await sb
    .from('user_vault_items')
    .select(VAULT_ITEM_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('[vault] fetch failed:', error?.message);
    return [];
  }

  return data.map((row) => mapVaultRow(row));
}

/** Resolve vault item id by pull id (post-open fulfillment). */
export async function fetchVaultItemByPullId(
  client: SupabaseQueryClient,
  pullId: string,
): Promise<VaultItem | null> {
  const { data, error } = await client
    .from('user_vault_items')
    .select(VAULT_ITEM_SELECT)
    .eq('pull_id', pullId)
    .maybeSingle();

  if (error || !data) return null;
  return mapVaultRow(data as Record<string, unknown>);
}

export async function processInstantTradeInLive(
  client: SupabaseQueryClient,
  input: TradeInRequest,
): Promise<
  | { ok: true; response: TradeInResponse }
  | { ok: false; code: string; message: string }
> {
  const { data, error } = await client.rpc('process_instant_trade_in', {
    p_vault_item_id: input.vaultItemId,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) {
    const msg = error.message ?? 'Trade-in failed';
    if (msg.includes('VAULT_ITEM_NOT_FOUND')) {
      return { ok: false, code: 'VAULT_ITEM_NOT_FOUND', message: msg };
    }
    if (msg.includes('VAULT_ITEM_NOT_TRADEABLE')) {
      return { ok: false, code: 'VAULT_ITEM_NOT_TRADEABLE', message: msg };
    }
    if (msg.includes('UNAUTHORIZED')) {
      return { ok: false, code: 'UNAUTHORIZED', message: msg };
    }
    return { ok: false, code: 'TRADE_IN_FAILED', message: msg };
  }

  const response = data as TradeInResponse;
  if (!response?.vault_item_id) {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'process_instant_trade_in returned no vault_item_id',
    };
  }

  return { ok: true, response };
}

/** Map server vault row → client Pull shape for vault / won-prizes UI. */
export function vaultItemToPull(
  item: VaultItem,
  opts?: { packTitle?: string; packId?: string },
): {
  id: string;
  packId: string;
  packTitle: string;
  result: string;
  creditsWon: number;
  timestamp: Date;
  fulfillment: 'pending' | 'vaulted' | 'converted' | 'shipped';
  vaultExpiresAt?: Date;
  vaultHoldDays?: number;
  convertCreditValue?: number;
  tier?: N2Tier;
  vaultItemId?: string;
} {
  const fulfillment =
    item.status === 'instant_traded'
      ? 'converted'
      : item.status === 'shipped' || item.status === 'shipping_requested'
        ? 'shipped'
        : 'vaulted';

  const packId =
    opts?.packId ??
    (item.pack_version_id
      ? catalogPackIdForPackVersionId(item.pack_version_id) ?? 'unknown-pack'
      : 'unknown-pack');

  return {
    id: item.pull_id,
    packId,
    packTitle: opts?.packTitle ?? item.card_name,
    result: item.card_name,
    creditsWon: item.trade_in_value_credits,
    timestamp: new Date(item.created_at),
    fulfillment,
    vaultExpiresAt: item.vault_expires_at ? new Date(item.vault_expires_at) : undefined,
    convertCreditValue: item.trade_in_value_credits,
    tier: item.rarity_tier,
    vaultItemId: item.id,
  };
}

export function parseVaultItemSnapshot(raw: unknown): VaultItem | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  return mapVaultRow(raw as Record<string, unknown>);
}
