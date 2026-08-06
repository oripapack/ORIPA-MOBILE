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
import { CREDITS_ARE_MOCK } from '../config/app';
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
  return !CREDITS_ARE_MOCK && isSupabaseConfigured;
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
      message: 'Live shipping is not configured',
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
