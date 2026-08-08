import {
  requestShipmentLive as requestShipmentLiveShared,
} from '../../shared/api/requestShipment';
import type {
  RequestShipmentResponse,
  ShippingAddressPayload,
  SupabaseFunctionsClient,
} from '../../shared/api/types';
import { isSupabaseConfigured, supabase } from './supabase';

export type { RequestShipmentResponse, ShippingAddressPayload };

export async function requestShipmentLive(input: {
  pullId: string;
  shippingAddress: ShippingAddressPayload;
}): Promise<
  | { ok: true; response: RequestShipmentResponse }
  | { ok: false; status?: number; code: string; message: string }
> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'This feature isn’t available right now. Please try again later.',
    };
  }

  return requestShipmentLiveShared(
    supabase as unknown as SupabaseFunctionsClient,
    input,
  );
}
