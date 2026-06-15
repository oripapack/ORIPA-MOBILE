/**
 * Server-side enforcement for first-time packs.
 *
 * Two-layer approach:
 *   1. AsyncStorage — survives app restarts; persisted on-device per (userId, packId).
 *   2. Supabase `first_time_pack_claims` table — authoritative when configured.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockPacks } from '../data/mockPacks';
import { createClerkAuthedClient } from './supabaseAuthed';
import { isSupabaseConfigured } from './supabase';

const storageKey = (userId: string) => `@pullhub_first_time_packs_v1:${userId}`;

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
    // Best-effort
  }
}

function packIdsFromVersionIds(versionIds: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const pack of mockPacks) {
    if (pack.packVersionId && versionIds.has(pack.packVersionId)) {
      out.add(pack.id);
    }
  }
  return out;
}

async function readSupabaseClaims(userId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set();
  try {
    const client = await createClerkAuthedClient();
    if (!client) return new Set();

    const { data, error } = await client
      .from('first_time_pack_claims')
      .select('pack_version_id')
      .eq('user_id', userId);
    if (error) return new Set();

    const versionIds = new Set(
      (data ?? []).map((r: { pack_version_id: string }) => r.pack_version_id),
    );
    return packIdsFromVersionIds(versionIds);
  } catch {
    return new Set();
  }
}

async function insertSupabaseClaim(
  userId: string,
  packVersionId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const client = await createClerkAuthedClient();
    if (!client) return true;

    const { error } = await client.from('first_time_pack_claims').insert({
      user_id: userId,
      pack_version_id: packVersionId,
      claimed_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === '23505') return false;
      console.warn('[firstTimePack] Supabase insert error (fail open):', error.message);
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

export async function loadClaimedFirstTimePacks(userId: string): Promise<string[]> {
  if (!userId) return [];

  if (isSupabaseConfigured) {
    const serverClaims = await readSupabaseClaims(userId);
    if (serverClaims.size > 0) {
      await writeLocalClaims(userId, serverClaims);
      return [...serverClaims];
    }
  }

  const localClaims = await readLocalClaims(userId);
  return [...localClaims];
}

export async function claimFirstTimePack(
  userId: string,
  packId: string,
  packVersionId?: string,
): Promise<{ allowed: boolean; reason?: 'already_claimed' }> {
  if (!userId) {
    return { allowed: true };
  }

  const localClaims = await readLocalClaims(userId);
  if (localClaims.has(packId)) {
    return { allowed: false, reason: 'already_claimed' };
  }

  if (packVersionId) {
    const serverAllowed = await insertSupabaseClaim(userId, packVersionId);
    if (!serverAllowed) {
      localClaims.add(packId);
      await writeLocalClaims(userId, localClaims);
      return { allowed: false, reason: 'already_claimed' };
    }
  }

  localClaims.add(packId);
  await writeLocalClaims(userId, localClaims);

  return { allowed: true };
}
