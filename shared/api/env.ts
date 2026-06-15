/**
 * Reads Supabase / Clerk env from Expo (`EXPO_PUBLIC_*`) or Next.js (`NEXT_PUBLIC_*`).
 *
 * Use direct `process.env.NEXT_PUBLIC_*` property access (not dynamic keys) so
 * Next.js can inline values into the client bundle.
 */

function trim(value: string | undefined): string {
  return value?.trim() ?? '';
}

export function getSupabaseUrl(): string {
  return (
    trim(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    trim(process.env.EXPO_PUBLIC_SUPABASE_URL)
  );
}

export function getSupabaseAnonKey(): string {
  return (
    trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trim(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function getClerkPublishableKey(): string {
  return (
    trim(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) ||
    trim(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isClerkConfigured(): boolean {
  return getClerkPublishableKey().length > 0;
}
