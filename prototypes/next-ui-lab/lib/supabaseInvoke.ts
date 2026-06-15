import { invokeEdgeFunction as invokeShared } from '../../../shared/api/invokeEdgeFunction';
import type { SupabaseFunctionsClient } from '../../../shared/api/types';
import { isSupabaseConfigured, supabase } from './supabase';

export type { InvokeEdgeResult } from '../../../shared/api/types';

export async function invokeEdgeFunction<TResponse>(
  functionName: string,
  body: Record<string, unknown>,
) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false as const,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase URL and anon key are not set in .env.local',
    };
  }

  return invokeShared<TResponse>(supabase as unknown as SupabaseFunctionsClient, functionName, body);
}
