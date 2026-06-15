import { createClerkAuthedClient } from './supabaseAuthed';
import { isSupabaseConfigured } from './supabase';

/**
 * Loads `user_credits.balance` for the signed-in Clerk user.
 * Requires Clerk token on the Supabase client (Authorization header).
 */
export async function fetchUserCreditBalance(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured || !userId) return null;

  const client = await createClerkAuthedClient();
  if (!client) return null;

  const { data, error } = await client
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[userCredits] fetch failed:', error.message);
    return null;
  }

  if (!data) return 0;
  return Number(data.balance ?? 0);
}
