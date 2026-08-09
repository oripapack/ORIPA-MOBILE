import { createClerkAuthedClient } from './supabaseAuthed';

/**
 * Deletes the signed-in user's Pull Hub records before the Clerk identity is removed.
 * The database function derives identity from the JWT and accepts no user id input.
 */
export async function deleteServerAccountData(): Promise<void> {
  const client = await createClerkAuthedClient();
  if (!client) {
    throw new Error('Account deletion is unavailable because the server is not configured.');
  }

  const { error } = await client.rpc('delete_my_account_data');
  if (error) {
    throw new Error(error.message || 'Account data could not be deleted.');
  }
}
