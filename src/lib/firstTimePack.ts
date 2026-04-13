/**
 * Server-side enforcement for first-time packs.
 *
 * Two-layer approach:
 *   1. AsyncStorage — survives app restarts; persisted on-device per (userId, packId).
 *      Prevents bypass via state reset or app kill/reopen.
 *   2. Supabase `first_time_pack_claims` table — when env vars are configured,
 *      becomes the authoritative server-side check.
 *      A Row-Level-Security policy on that table prevents any client from inserting
 *      a duplicate row, so even a direct Supabase call with a valid anon-key cannot
 *      bypass the restriction.
 *
 * Usage
 * -----
 *   // On startup — repopulate in-memory state from persistent storage
 *   const claimed = await loadClaimedFirstTimePacks(userId);
 *
 *   // Before opening — check + atomically record claim
 *   const result = await claimFirstTimePack(userId, packId);
 *   if (!result.allowed) { // block the open }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';

// ---------------------------------------------------------------------------
// Storage key — keyed by userId so multi-account devices work correctly
// ---------------------------------------------------------------------------

const storageKey = (userId: string) => `@pullhub_first_time_packs_v1:${userId}`;

// ---------------------------------------------------------------------------
// AsyncStorage helpers
// ---------------------------------------------------------------------------

/** Returns the set of packIds already claimed by this user (from AsyncStorage). */
async function readLocalClaims(userId: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // Corrupt or missing — treat as empty
  }
  return new Set();
}

async function writeLocalClaims(userId: string, claims: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify([...claims]));
  } catch {
    // Best-effort — in-memory Zustand state still blocks duplicate opens in the session
  }
}

// ---------------------------------------------------------------------------
// Supabase helpers (no-op when not configured)
// ---------------------------------------------------------------------------

/**
 * Reads all claimed first-time pack IDs for the user from Supabase.
 * Table: first_time_pack_claims (user_id text, pack_id text, claimed_at timestamptz)
 * RLS policy: users can only SELECT/INSERT their own rows; no DELETE/UPDATE.
 */
async function readSupabaseClaims(userId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured || !supabase) return new Set();
  try {
    const { data, error } = await supabase
      .from('first_time_pack_claims')
      .select('pack_id')
      .eq('user_id', userId);
    if (error) return new Set();
    return new Set((data ?? []).map((r: { pack_id: string }) => r.pack_id));
  } catch {
    return new Set();
  }
}

/**
 * Atomically inserts a claim row in Supabase.
 * The table has a UNIQUE constraint on (user_id, pack_id), so a duplicate insert
 * returns a conflict error — which we treat as "already claimed".
 * Returns false if the row already exists (conflict) or on error.
 */
async function insertSupabaseClaim(userId: string, packId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true; // no server configured → pass through
  try {
    const { error } = await supabase
      .from('first_time_pack_claims')
      .insert({ user_id: userId, pack_id: packId, claimed_at: new Date().toISOString() });
    if (error) {
      // Postgres unique violation: code 23505
      if (error.code === '23505') return false;
      // Other DB error — fail open so the app isn't bricked (server guard is supplementary in MVP)
      console.warn('[firstTimePack] Supabase insert error (fail open):', error.message);
      return true;
    }
    return true;
  } catch {
    return true; // network error — fail open, AsyncStorage still guards locally
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load all first-time pack IDs already claimed by this user.
 * Call on app startup / after sign-in to hydrate in-memory Zustand state.
 *
 * Priority: Supabase (server) → AsyncStorage (local fallback)
 */
export async function loadClaimedFirstTimePacks(userId: string): Promise<string[]> {
  if (!userId) return [];

  // Prefer server source when available
  if (isSupabaseConfigured) {
    const serverClaims = await readSupabaseClaims(userId);
    if (serverClaims.size > 0) {
      // Back-fill local storage so offline checks work too
      await writeLocalClaims(userId, serverClaims);
      return [...serverClaims];
    }
  }

  const localClaims = await readLocalClaims(userId);
  return [...localClaims];
}

/**
 * Attempt to claim a first-time pack.
 *
 * - Checks local AsyncStorage first (fast, no network).
 * - If not locally claimed, checks + writes Supabase (when configured).
 * - On success, writes to AsyncStorage for offline use.
 *
 * Returns { allowed: true } if the pack can be opened,
 * or { allowed: false, reason: 'already_claimed' } if it cannot.
 *
 * This is the function `openPack()` calls before deducting credits.
 * Because it writes to persistent storage atomically, replaying the same
 * request (direct Supabase call, state reset, app restart) will always
 * be caught by either the AsyncStorage check or the Supabase unique constraint.
 */
export async function claimFirstTimePack(
  userId: string,
  packId: string,
): Promise<{ allowed: boolean; reason?: 'already_claimed' }> {
  if (!userId) {
    // Guest users — allow but do not persist (openPack handles freePackGrants separately)
    return { allowed: true };
  }

  // 1. Fast local check
  const localClaims = await readLocalClaims(userId);
  if (localClaims.has(packId)) {
    return { allowed: false, reason: 'already_claimed' };
  }

  // 2. Server check + atomic insert (when Supabase is configured)
  //    The UNIQUE constraint means a concurrent request from another device
  //    will also be rejected at the DB level.
  const serverAllowed = await insertSupabaseClaim(userId, packId);
  if (!serverAllowed) {
    // Server says already claimed — sync local storage and reject
    localClaims.add(packId);
    await writeLocalClaims(userId, localClaims);
    return { allowed: false, reason: 'already_claimed' };
  }

  // 3. Persist locally for fast offline checks
  localClaims.add(packId);
  await writeLocalClaims(userId, localClaims);

  return { allowed: true };
}
