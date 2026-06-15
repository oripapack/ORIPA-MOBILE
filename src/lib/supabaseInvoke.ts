import { FunctionsHttpError } from '@supabase/supabase-js';
import { getClerkSupabaseToken } from './clerkSupabaseToken';
import { isSupabaseConfigured, supabase } from './supabase';

export type InvokeEdgeResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; code: string; message: string };

export async function invokeEdgeFunction<TResponse>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<InvokeEdgeResult<TResponse>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase URL and anon key are not set in .env',
    };
  }

  const token = await getClerkSupabaseToken();
  if (!token) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Sign in required',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        const status = error.context.status;
        let payload: { error?: string; message?: string } = {};
        try {
          payload = (await error.context.json()) as typeof payload;
        } catch {
          // ignore parse errors
        }
        const code = payload.error ?? 'EDGE_FUNCTION_ERROR';
        const message = payload.message ?? error.message;
        return { ok: false, status, code, message };
      }
      return {
        ok: false,
        code: 'EDGE_FUNCTION_ERROR',
        message: error.message,
      };
    }

    return { ok: true, data: data as TResponse };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message,
    };
  }
}
