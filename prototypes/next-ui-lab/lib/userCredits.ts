import { fetchUserCreditBalance as fetchShared } from '../../../shared/api/userCredits';
import type { SupabaseQueryClient } from '../../../shared/api/types';
import { createClerkAuthedClient } from './supabaseAuthed';
import { isSupabaseConfigured } from './supabase';

export async function fetchUserCreditBalance(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  const client = await createClerkAuthedClient();
  if (!client) return null;

  return fetchShared(client as unknown as SupabaseQueryClient, userId);
}
