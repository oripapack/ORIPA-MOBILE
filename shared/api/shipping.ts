import type {
  FulfillmentRequest,
  FulfillmentResponse,
  ShippingAddress,
  ShippingAddressPayload,
  ShippingOrder,
  ShippingOrderStatus,
  SupabaseQueryClient,
} from './types';

export type {
  FulfillmentRequest,
  FulfillmentResponse,
  ShippingAddress,
  ShippingOrder,
};

const ADDRESS_SELECT =
  'id,user_id,recipient_name,street1,street2,city,state,postal_code,country,phone,is_default,created_at';

const ORDER_SELECT =
  'id,user_id,shipping_address_id,status,tracking_number,carrier,fee_credits,idempotency_key,created_at,shipped_at';

function mapAddress(row: Record<string, unknown>): ShippingAddress {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    recipient_name: String(row.recipient_name),
    street1: String(row.street1),
    street2: row.street2 ? String(row.street2) : null,
    city: String(row.city),
    state: row.state ? String(row.state) : null,
    postal_code: row.postal_code ? String(row.postal_code) : null,
    country: String(row.country),
    phone: row.phone ? String(row.phone) : null,
    is_default: Boolean(row.is_default),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapOrder(
  row: Record<string, unknown>,
  vaultItemIds?: string[],
): ShippingOrder {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    shipping_address_id: String(row.shipping_address_id),
    status: String(row.status ?? 'pending') as ShippingOrderStatus,
    tracking_number: row.tracking_number ? String(row.tracking_number) : null,
    carrier: row.carrier ? String(row.carrier) : null,
    fee_credits: Number(row.fee_credits ?? 0),
    idempotency_key: row.idempotency_key ? String(row.idempotency_key) : undefined,
    created_at: String(row.created_at ?? new Date().toISOString()),
    shipped_at: row.shipped_at ? String(row.shipped_at) : null,
    vault_item_ids: vaultItemIds,
  };
}

export function payloadToAddressInsert(
  userId: string,
  payload: ShippingAddressPayload,
  isDefault = true,
): Record<string, unknown> {
  return {
    user_id: userId,
    recipient_name: payload.fullName.trim(),
    street1: payload.line1.trim(),
    street2: payload.line2?.trim() || null,
    city: payload.city.trim(),
    state: payload.region?.trim() || null,
    postal_code: payload.postal?.trim() || null,
    country: payload.country.trim(),
    phone: payload.phone?.trim() || null,
    is_default: isDefault,
  };
}

export function addressToPayload(address: ShippingAddress): ShippingAddressPayload {
  return {
    fullName: address.recipient_name,
    line1: address.street1,
    line2: address.street2 ?? undefined,
    city: address.city,
    region: address.state ?? undefined,
    postal: address.postal_code ?? undefined,
    country: address.country,
    phone: address.phone ?? undefined,
  };
}

/** Create a saved shipping address for the signed-in user. */
export async function createShippingAddress(
  client: SupabaseQueryClient,
  userId: string,
  payload: ShippingAddressPayload,
): Promise<
  | { ok: true; address: ShippingAddress }
  | { ok: false; code: string; message: string }
> {
  if (
    !payload.fullName?.trim() ||
    !payload.line1?.trim() ||
    !payload.city?.trim() ||
    !payload.country?.trim()
  ) {
    return {
      ok: false,
      code: 'INVALID_SHIPPING_ADDRESS',
      message: 'Name, street, city, and country are required',
    };
  }

  const sb = client as unknown as {
    from: (table: string) => {
      insert: (row: Record<string, unknown>) => {
        select: (columns: string) => {
          maybeSingle: () => Promise<{
            data: Record<string, unknown> | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };

  const { data, error } = await sb
    .from('shipping_addresses')
    .insert(payloadToAddressInsert(userId, payload, true))
    .select(ADDRESS_SELECT)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      code: 'ADDRESS_CREATE_FAILED',
      message: error?.message ?? 'Failed to save address',
    };
  }

  return { ok: true, address: mapAddress(data) };
}

/** List saved shipping addresses (newest first). */
export async function getUserShippingAddresses(
  client: SupabaseQueryClient,
): Promise<ShippingAddress[]> {
  const sb = client as SupabaseQueryClient & {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => Promise<{
          data: Record<string, unknown>[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };

  const { data, error } = await sb
    .from('shipping_addresses')
    .select(ADDRESS_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('[shipping] addresses fetch failed:', error?.message);
    return [];
  }

  return data.map((row) => mapAddress(row));
}

/** Request physical redemption for one or more vault items. */
export async function requestPhysicalFulfillment(
  client: SupabaseQueryClient,
  input: FulfillmentRequest,
): Promise<
  | { ok: true; response: FulfillmentResponse }
  | { ok: false; code: string; message: string }
> {
  const { data, error } = await client.rpc('request_physical_fulfillment', {
    p_user_id: input.userId ?? '',
    p_vault_item_ids: input.vaultItemIds,
    p_address_id: input.addressId,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) {
    const msg = error.message ?? 'Fulfillment request failed';
    if (msg.includes('INSUFFICIENT_CREDITS') || msg.includes('INSUFFICIENT_FUNDS')) {
      return { ok: false, code: 'INSUFFICIENT_FUNDS', message: msg };
    }
    if (msg.includes('VAULT_ITEM_NOT_FOUND')) {
      return { ok: false, code: 'VAULT_ITEM_NOT_FOUND', message: msg };
    }
    if (msg.includes('VAULT_ITEM_NOT_SHIPPABLE')) {
      return { ok: false, code: 'VAULT_ITEM_NOT_SHIPPABLE', message: msg };
    }
    if (msg.includes('ADDRESS_NOT_FOUND')) {
      return { ok: false, code: 'ADDRESS_NOT_FOUND', message: msg };
    }
    if (msg.includes('UNAUTHORIZED')) {
      return { ok: false, code: 'UNAUTHORIZED', message: msg };
    }
    return { ok: false, code: 'FULFILLMENT_FAILED', message: msg };
  }

  const raw = data as Record<string, unknown>;
  if (!raw?.shipping_order_id) {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'request_physical_fulfillment returned no shipping_order_id',
    };
  }

  const vaultIds = Array.isArray(raw.vault_item_ids)
    ? (raw.vault_item_ids as unknown[]).map(String)
    : [];
  const pullIds = Array.isArray(raw.pull_ids)
    ? (raw.pull_ids as unknown[]).map(String)
    : undefined;

  return {
    ok: true,
    response: {
      status: String(raw.status ?? 'ok'),
      shipping_order_id: String(raw.shipping_order_id),
      order_status: String(raw.order_status ?? 'pending'),
      fee_credits: Number(raw.fee_credits ?? 0),
      vault_item_ids: vaultIds,
      pull_ids: pullIds,
      balance_after:
        raw.balance_after != null ? Number(raw.balance_after) : undefined,
      error_code: raw.error_code as FulfillmentResponse['error_code'],
    },
  };
}

/** List the user's shipping orders (newest first). */
export async function getUserShippingOrders(
  client: SupabaseQueryClient,
): Promise<ShippingOrder[]> {
  const sb = client as SupabaseQueryClient & {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => Promise<{
          data: Record<string, unknown>[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };

  const { data, error } = await sb
    .from('shipping_orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('[shipping] orders fetch failed:', error?.message);
    return [];
  }

  return data.map((row) => mapOrder(row));
}
