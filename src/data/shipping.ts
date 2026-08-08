/**
 * Physical shipping — live Supabase when online, AsyncStorage fallback in demo mode.
 */
import type {
  FulfillmentResponse,
  ShippingAddress,
  ShippingAddressPayload,
  ShippingOrder,
} from '../../shared/api/types';
import {
  addressToPayload,
  createShippingAddress as createShared,
  getUserShippingAddresses as listAddressesShared,
  getUserShippingOrders as listOrdersShared,
  requestPhysicalFulfillment as fulfillShared,
} from '../../shared/api/shipping';
import { newIdempotencyKey } from '../../shared/api/idempotency';
import type { SupabaseQueryClient } from '../../shared/api/types';
import { CREDITS_ARE_MOCK, SHIPPING_IS_LIVE } from '../config/app';
import { isSupabaseConfigured } from '../lib/supabase';
import { createClerkAuthedClient } from '../lib/supabaseAuthed';
import {
  loadShippingAddress,
  SHIPPING_ADDRESS_STORAGE_KEY,
} from '../lib/shippingAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type { FulfillmentResponse, ShippingAddress, ShippingOrder };
export { addressToPayload };

export function isLiveShippingEnabled(): boolean {
  return SHIPPING_IS_LIVE && !CREDITS_ARE_MOCK && isSupabaseConfigured;
}

export async function getUserShippingAddressesLive(): Promise<ShippingAddress[]> {
  if (!isLiveShippingEnabled()) return [];
  const client = await createClerkAuthedClient();
  if (!client) return [];
  return listAddressesShared(client as unknown as SupabaseQueryClient);
}

export async function createShippingAddressLive(
  userId: string,
  payload: ShippingAddressPayload,
): Promise<
  | { ok: true; address: ShippingAddress }
  | { ok: false; code: string; message: string }
> {
  if (!isLiveShippingEnabled()) {
    if (!__DEV__) {
      return {
        ok: false,
        code: 'SHIPPING_OFFLINE',
        message: 'Live shipping is not configured',
      };
    }
    try {
      await AsyncStorage.setItem(
        SHIPPING_ADDRESS_STORAGE_KEY,
        JSON.stringify({
          fullName: payload.fullName,
          line1: payload.line1,
          line2: payload.line2 ?? '',
          city: payload.city,
          region: payload.region ?? '',
          postal: payload.postal ?? '',
          country: payload.country,
        }),
      );
      return {
        ok: true,
        address: {
          id: `local_${Date.now()}`,
          user_id: userId,
          recipient_name: payload.fullName.trim(),
          street1: payload.line1.trim(),
          street2: payload.line2?.trim() || null,
          city: payload.city.trim(),
          state: payload.region?.trim() || null,
          postal_code: payload.postal?.trim() || null,
          country: payload.country.trim(),
          phone: payload.phone?.trim() || null,
          is_default: true,
          created_at: new Date().toISOString(),
        },
      };
    } catch (e) {
      return {
        ok: false,
        code: 'ADDRESS_CREATE_FAILED',
        message: e instanceof Error ? e.message : 'Failed to save address',
      };
    }
  }

  const client = await createClerkAuthedClient();
  if (!client) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Sign in required' };
  }

  const result = await createShared(
    client as unknown as SupabaseQueryClient,
    userId,
    payload,
  );

  if (result.ok) {
    // Mirror to local cache so Settings / legacy loadShippingAddress still work.
    try {
      await AsyncStorage.setItem(
        SHIPPING_ADDRESS_STORAGE_KEY,
        JSON.stringify({
          fullName: payload.fullName,
          line1: payload.line1,
          line2: payload.line2 ?? '',
          city: payload.city,
          region: payload.region ?? '',
          postal: payload.postal ?? '',
          country: payload.country,
        }),
      );
    } catch {
      /* ignore cache errors */
    }
  }

  return result;
}

export async function requestPhysicalFulfillmentLive(input: {
  userId: string;
  vaultItemIds: string[];
  addressId: string;
  idempotencyKey?: string;
}): Promise<
  | { ok: true; response: FulfillmentResponse }
  | { ok: false; code: string; message: string }
> {
  if (!isLiveShippingEnabled()) {
    return {
      ok: false,
      code: 'SHIPPING_OFFLINE',
      message: 'This feature isn’t available right now. Please try again later.',
    };
  }

  const client = await createClerkAuthedClient();
  if (!client) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Sign in required' };
  }

  return fulfillShared(client as unknown as SupabaseQueryClient, {
    userId: input.userId,
    vaultItemIds: input.vaultItemIds,
    addressId: input.addressId,
    idempotencyKey: input.idempotencyKey ?? newIdempotencyKey(),
  });
}

export async function getUserShippingOrdersLive(): Promise<ShippingOrder[]> {
  if (!isLiveShippingEnabled()) return [];
  const client = await createClerkAuthedClient();
  if (!client) return [];

  // Prefer nested items when PostgREST embed is available; fall back to plain orders.
  try {
    const { data, error } = await client
      .from('shipping_orders')
      .select(
        'id,user_id,shipping_address_id,status,tracking_number,carrier,fee_credits,idempotency_key,created_at,shipped_at,shipping_order_items(vault_item_id)',
      )
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row) => {
        const items = (row as { shipping_order_items?: { vault_item_id?: string }[] })
          .shipping_order_items;
        const ids = Array.isArray(items)
          ? items.map((i) => String(i.vault_item_id ?? '')).filter(Boolean)
          : undefined;
        return {
          id: String(row.id),
          user_id: String(row.user_id),
          shipping_address_id: String(row.shipping_address_id),
          status: String(row.status ?? 'pending') as ShippingOrder['status'],
          tracking_number: row.tracking_number ? String(row.tracking_number) : null,
          carrier: row.carrier ? String(row.carrier) : null,
          fee_credits: Number(row.fee_credits ?? 0),
          idempotency_key: row.idempotency_key ? String(row.idempotency_key) : undefined,
          created_at: String(row.created_at ?? new Date().toISOString()),
          shipped_at: row.shipped_at ? String(row.shipped_at) : null,
          vault_item_ids: ids,
        };
      });
    }
  } catch {
    /* fall through */
  }

  return listOrdersShared(client as unknown as SupabaseQueryClient);
}

/** Resolve a usable address id: prefer server default, else create from local payload. */
export async function ensureShippingAddressId(
  userId: string,
): Promise<
  | { ok: true; addressId: string }
  | { ok: false; code: string; message: string }
> {
  if (isLiveShippingEnabled()) {
    const addresses = await getUserShippingAddressesLive();
    if (addresses[0]) return { ok: true, addressId: addresses[0].id };

    const local = await loadShippingAddress();
    if (!local) {
      return {
        ok: false,
        code: 'ADDRESS_REQUIRED',
        message: 'Add a shipping address in Settings before requesting shipment.',
      };
    }

    const created = await createShippingAddressLive(userId, local);
    if (!created.ok) return created;
    return { ok: true, addressId: created.address.id };
  }

  if (!__DEV__) {
    return {
      ok: false,
      code: 'SHIPPING_OFFLINE',
      message: 'Live shipping is not configured',
    };
  }

  const local = await loadShippingAddress();
  if (!local) {
    return {
      ok: false,
      code: 'ADDRESS_REQUIRED',
      message: 'Add a shipping address in Settings before requesting shipment.',
    };
  }
  return { ok: true, addressId: 'local_demo' };
}
