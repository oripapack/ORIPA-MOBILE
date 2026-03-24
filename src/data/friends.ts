import { isValidAppUsername } from '../lib/clerkProfile';

/** Local friend list entry (MVP — no backend). `username` is normalized lowercase. */
export interface FriendEntry {
  username: string;
  displayName: string;
  addedAt: number;
}

/**
 * Mock directory for “lookup by username”. Keys are lowercase handles.
 * Replace with API later.
 */
export const MOCK_USERNAME_DIRECTORY: Record<string, string> = {
  jordan: 'Jordan K.',
  sam_r: 'Sam R.',
  casey_m: 'Casey M.',
};

/** Legacy demo: old QR / paste still used TCG-… codes — map to canonical username. */
export const LEGACY_TCG_TO_USERNAME: Record<string, string> = {
  'TCG-100001': 'jordan',
  'TCG-100002': 'sam_r',
  'TCG-100003': 'casey_m',
};

const MEMBER_ID_RE = /^TCG-\d{4,}$/i;

export function normalizeMemberId(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}

export function isValidMemberIdFormat(id: string): boolean {
  return MEMBER_ID_RE.test(normalizeMemberId(id));
}

/** Normalize handle for storage and comparison (case-insensitive; strips a leading @). */
export function normalizeFriendUsername(raw: string): string {
  let s = raw.trim().toLowerCase();
  if (s.startsWith('@')) s = s.slice(1);
  return s;
}

export function isValidFriendUsernameFormat(usernameNormalized: string): boolean {
  if (!usernameNormalized) return false;
  return isValidAppUsername(usernameNormalized);
}

/** Returns display name if known in mock directory; otherwise null (unknown user). */
export function lookupFriendDisplayName(usernameNormalized: string): string | null {
  const n = normalizeFriendUsername(usernameNormalized);
  if (!isValidFriendUsernameFormat(n)) return null;
  return MOCK_USERNAME_DIRECTORY[n] ?? null;
}

/** If `raw` is a legacy TCG-… code from demos, return the username key; else null. */
export function legacyTcgToUsername(raw: string): string | null {
  const n = normalizeMemberId(raw);
  if (!isValidMemberIdFormat(n)) return null;
  const u = LEGACY_TCG_TO_USERNAME[n];
  return u ? normalizeFriendUsername(u) : null;
}
