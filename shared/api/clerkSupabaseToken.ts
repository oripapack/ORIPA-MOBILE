/**
 * Clerk session token provider for Supabase Edge Functions + RLS.
 * Registered from each app's Clerk bridge via `setClerkSupabaseTokenGetter`.
 */

export type ClerkTokenGetter = () => Promise<string | null>;

let tokenGetter: ClerkTokenGetter | null = null;

export function setClerkSupabaseTokenGetter(getter: ClerkTokenGetter | null): void {
  tokenGetter = getter;
}

export async function getClerkSupabaseToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  return tokenGetter();
}
