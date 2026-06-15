import {
  executePullLive as executePullLiveShared,
  LIVE_DEMO_PACK_VERSION_ID,
  mapExecutePullToRollResult,
  newClientSeed,
  newIdempotencyKey,
} from '../../../shared/api/executePull';
import type { SupabaseFunctionsClient } from '../../../shared/api/types';
import { isSupabaseConfigured, supabase } from './supabase';

export {
  LIVE_DEMO_PACK_VERSION_ID,
  mapExecutePullToRollResult,
  newClientSeed,
  newIdempotencyKey,
};
export type { ExecutePullResponse, PackRollResult, PullRarityTier } from '../../../shared/api/types';

export async function executePullLive(input: {
  clientSeed: string;
  packVersionId: string;
  idempotencyKey: string;
  packCreditPrice: number;
}) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false as const,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase URL and anon key are not set in .env.local',
    };
  }

  return executePullLiveShared(supabase as unknown as SupabaseFunctionsClient, input);
}
