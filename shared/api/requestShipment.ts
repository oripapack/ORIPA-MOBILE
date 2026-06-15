import { invokeEdgeFunction } from './invokeEdgeFunction';
import type {
  RequestShipmentResponse,
  ShippingAddressPayload,
  SupabaseFunctionsClient,
} from './types';

export type { ShippingAddressPayload, RequestShipmentResponse };

export async function requestShipmentLive(
  client: SupabaseFunctionsClient,
  input: {
    pullId: string;
    shippingAddress: ShippingAddressPayload;
  },
): Promise<
  | { ok: true; response: RequestShipmentResponse }
  | { ok: false; status?: number; code: string; message: string }
> {
  const result = await invokeEdgeFunction<RequestShipmentResponse>(
    client,
    'request-shipment',
    {
      pull_id: input.pullId,
      shipping_address: input.shippingAddress,
    },
  );

  if (!result.ok) {
    return result;
  }

  const response = result.data;
  if (!response?.pull_id) {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'request-shipment returned no pull_id',
    };
  }

  return { ok: true, response };
}
