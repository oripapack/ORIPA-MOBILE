import type { PullRarityTier } from '../data/mockUser';
import type { PackRollResult } from '../components/pack/opening/types';
import { invokeEdgeFunction } from './supabaseInvoke';

/** Live pack version from seed.sql — map catalog packs via `packVersionId`. */
export const LIVE_DEMO_PACK_VERSION_ID =
  'a0000000-0000-4000-8000-000000000002';

export type ExecutePullResponse = {
  pull_id: string;
  status?: string;
  pack_version_id: string;
  credit_cost?: number;
  balance_after?: number;
  won_item_id: string;
  card_name: string;
  serial_number: string;
  mint_status: string;
  idempotency_key: string;
};

function tierForWonItem(wonItemId: string): PullRarityTier {
  if (wonItemId.includes('grail') || wonItemId.includes('1pct')) {
    return 'legendary';
  }
  if (wonItemId.includes('epic') || wonItemId.includes('rare')) {
    return 'rare';
  }
  return 'common';
}

export function mapExecutePullToRollResult(
  response: ExecutePullResponse,
  packCreditPrice: number,
): PackRollResult {
  const tier = tierForWonItem(response.won_item_id);
  const mult =
    tier === 'legendary' || tier === 'mythic'
      ? 2.5
      : tier === 'epic' || tier === 'rare'
      ? 1.4
      : 0.85;
  const creditsWon = Math.max(0, Math.floor(packCreditPrice * mult));

  return {
    result: response.card_name,
    creditsWon,
    tier,
  };
}

export async function executePullLive(input: {
  clientSeed: string;
  packVersionId: string;
  idempotencyKey: string;
  packCreditPrice: number;
}): Promise<
  | { ok: true; response: ExecutePullResponse; roll: PackRollResult }
  | { ok: false; status?: number; code: string; message: string }
> {
  const result = await invokeEdgeFunction<ExecutePullResponse>('execute-pull', {
    client_seed: input.clientSeed,
    pack_version_id: input.packVersionId,
    idempotency_key: input.idempotencyKey,
  });

  if (!result.ok) {
    return result;
  }

  const response = result.data;
  if (!response?.pull_id) {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'execute-pull returned no pull_id',
    };
  }

  return {
    ok: true,
    response,
    roll: mapExecutePullToRollResult(response, input.packCreditPrice),
  };
}

export function newClientSeed(): string {
  return `ph_${crypto.randomUUID().replace(/-/g, '')}_${Date.now().toString(36)}`;
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
