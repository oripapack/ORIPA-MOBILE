import type { N2Tier } from '../../src/lib/n2Rarity';

/** N2 pull tier for server/client roll results. */
export type PullRarityTier = N2Tier;

/** Minimal Supabase client surface for Edge Function invokes (avoids duplicate package types). */
export type SupabaseFunctionsClient = {
  functions: {
    invoke: <T>(
      functionName: string,
      options: {
        body?: Record<string, unknown>;
        headers?: Record<string, string>;
      },
    ) => Promise<{ data: T | null; error: unknown }>;
  };
};

export type SupabaseQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { balance?: number } | null;
          error: { message: string } | null;
        }>;
      };
      order: (
        column: string,
        options: { ascending: boolean },
      ) => Promise<{
        data: Record<string, unknown>[] | null;
        error: { message: string } | null;
      }>;
    };
  };
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export type PackRollResult = {
  result: string;
  creditsWon: number;
  tier: N2Tier;
};

export type CreditTransactionType =
  | 'top_up'
  | 'pack_spend'
  | 'bulk_pack_spend'
  | 'refund'
  | 'trade_in_credit';

export type VaultItemStatus = 'vaulted' | 'shipping_requested' | 'instant_traded' | 'shipped';

export type VaultAcquisitionType = 'pack_pull';

export type VaultItem = {
  id: string;
  user_id: string;
  pull_id: string;
  card_id: string;
  card_name: string;
  rarity_tier: N2Tier;
  acquisition_type: VaultAcquisitionType;
  status: VaultItemStatus;
  trade_in_value_credits: number;
  pack_version_id?: string | null;
  vault_expires_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
};

export type TradeInRequest = {
  vaultItemId: string;
  idempotencyKey: string;
};

export type TradeInResponse = {
  status: string;
  vault_item_id: string;
  pull_id: string;
  credits_added: number;
  balance_after: number;
  transaction_id?: string;
  card_name?: string;
  rarity_tier?: N2Tier;
  error_code?: LedgerErrorCode;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: CreditTransactionType;
  idempotency_key: string;
  reference_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type LedgerErrorCode = 'INSUFFICIENT_FUNDS' | 'DUPLICATE_TRANSACTION';

export type DeductUserCreditsResult = {
  status: 'ok' | 'already_processed' | 'error';
  error_code?: LedgerErrorCode;
  transaction_id?: string;
  balance_after?: number;
  amount?: number;
  reference_id?: string | null;
  required?: number;
};

export type InvokeEdgeResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; code: string; message: string };

export type ExecutePullResponse = {
  pull_id: string;
  status?: string;
  error_code?: LedgerErrorCode;
  pack_version_id: string;
  credit_cost?: number;
  balance_after?: number;
  transaction_id?: string;
  won_item_id: string;
  card_name: string;
  serial_number: string;
  mint_status: string;
  idempotency_key: string;
  vault_item_id?: string;
  vault_item?: VaultItem;
};

export type BulkPullLiveResult = {
  pullId: string;
  mintStatus: string;
  roll: PackRollResult;
  idempotencyKey: string;
  balanceAfter?: number;
  vaultItemId?: string;
  tradeInValueCredits?: number;
};

export type ExecuteBulkPullResponse = {
  batchId: string;
  pulls: BulkPullLiveResult[];
  balanceAfter: number;
  creditCostTotal: number;
};

export type ShippingAddressPayload = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postal?: string;
  country: string;
  phone?: string;
};

/** Persisted address row in `shipping_addresses`. */
export type ShippingAddress = {
  id: string;
  user_id: string;
  recipient_name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
  phone?: string | null;
  is_default?: boolean;
  created_at: string;
};

export type ShippingOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type ShippingOrder = {
  id: string;
  user_id: string;
  shipping_address_id: string;
  status: ShippingOrderStatus;
  tracking_number?: string | null;
  carrier?: string | null;
  fee_credits: number;
  idempotency_key?: string;
  created_at: string;
  shipped_at?: string | null;
  vault_item_ids?: string[];
};

export type FulfillmentRequest = {
  vaultItemIds: string[];
  addressId: string;
  idempotencyKey: string;
  userId?: string;
};

export type FulfillmentResponse = {
  status: string;
  shipping_order_id: string;
  order_status: ShippingOrderStatus | string;
  fee_credits: number;
  vault_item_ids: string[];
  pull_ids?: string[];
  balance_after?: number;
  error_code?: LedgerErrorCode;
};

export type RequestShipmentResponse = {
  pull_id: string;
  status: string;
  fulfillment_status?: string;
  mint_status: string;
  shipping_order_id?: string;
};
