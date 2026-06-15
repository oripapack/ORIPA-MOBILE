/**
 * Clerk session token provider for Supabase Edge Functions + RLS.
 * Registered from ClerkProfileSync via useAuth().getToken().
 *
 * Native third-party auth: pass the Clerk **session** JWT (getToken() with no template).
 * Falls back to `template: 'supabase'` only if the session token is unavailable.
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
