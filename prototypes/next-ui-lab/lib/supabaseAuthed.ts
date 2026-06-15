import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getClerkSupabaseToken } from '../../../shared/api/clerkSupabaseToken';
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from '../../../shared/api/env';
import { supabase } from './supabase';

export async function createClerkAuthedClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const token = await getClerkSupabaseToken();
  if (!token) return null;

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
