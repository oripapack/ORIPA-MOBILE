import type { PackRollResult } from '../components/pack/opening/types';
import {
  executeBulkPullLive as executeBulkPullLiveShared,
  executePullLive as executePullLiveShared,
  LIVE_DEMO_PACK_VERSION_ID,
  mapExecutePullToRollResult,
} from '../../shared/api/executePull';
import {
  idempotencyKeyForBulkPull,
  newBatchIdempotencyKey,
  newClientSeed,
  newIdempotencyKey,
} from '../../shared/api/idempotency';
import type { SupabaseFunctionsClient } from '../../shared/api/types';
import { isSupabaseConfigured, supabase } from './supabase';

export {
  LIVE_DEMO_PACK_VERSION_ID,
  idempotencyKeyForBulkPull,
  mapExecutePullToRollResult,
  newBatchIdempotencyKey,
  newClientSeed,
  newIdempotencyKey,
};
export { fairnessFromExecuteResponse } from '../../shared/api/executePull';
export type {
  ExecuteBulkPullResponse,
  ExecutePullResponse,
  PullFairnessRecord,
} from '../../shared/api/types';

export async function executePullLive(input: {
  clientSeed: string;
  packVersionId: string;
  idempotencyKey: string;
  packCreditPrice: number;
}): Promise<
  | { ok: true; response: import('../../shared/api/types').ExecutePullResponse; roll: PackRollResult }
  | { ok: false; status?: number; code: string; message: string }
> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Pack opening isn’t available right now. Please try again later.',
    };
  }

  return executePullLiveShared(supabase as unknown as SupabaseFunctionsClient, input);
}

export async function executeBulkPullLive(input: {
  packVersionId: string;
  packCreditPrice: number;
  quantity: number;
  batchIdempotencyKey?: string;
}): Promise<
  | { ok: true; response: import('../../shared/api/types').ExecuteBulkPullResponse }
  | { ok: false; status?: number; code: string; message: string }
> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Pack opening isn’t available right now. Please try again later.',
    };
  }

  return executeBulkPullLiveShared(supabase as unknown as SupabaseFunctionsClient, input);
}
