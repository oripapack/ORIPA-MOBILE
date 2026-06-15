import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getClerkSupabaseToken } from './clerkSupabaseToken';
import { isSupabaseConfigured, supabase } from './supabase';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Short-lived Supabase client with Clerk session JWT for RLS-protected reads/writes.
 */
export async function createClerkAuthedClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const token = await getClerkSupabaseToken();
  if (!token) return null;

  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
