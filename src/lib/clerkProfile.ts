/**
 * App profile fields stored on Clerk `unsafeMetadata` (client-writable; sync to Supabase later).
 */

export type AppUserUnsafeMetadata = {
  onboardingComplete?: boolean;
  /** Public handle: letters, numbers, underscore. */
  appUsername?: string;
  /** Shown in UI; falls back to appUsername. */
  appDisplayName?: string;
  /** Stable friend code prefix `TCG-…` — set on first onboarding. */
  appMemberId?: string;
};

export function memberIdFromClerkUserId(clerkUserId: string): string {
  let h = 2166136261;
  for (let i = 0; i < clerkUserId.length; i++) {
    h ^= clerkUserId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (Math.abs(h) % 9000000) + 1000000;
  return `TCG-${n}`;
}

function readMeta(user: { unsafeMetadata?: unknown } | null | undefined): AppUserUnsafeMetadata {
  const m = user?.unsafeMetadata;
  if (m && typeof m === 'object' && !Array.isArray(m)) {
    return m as AppUserUnsafeMetadata;
  }
  return {};
}

export function hasCompletedProfileOnboarding(user: { unsafeMetadata?: unknown } | null | undefined): boolean {
  const m = readMeta(user);
  const u = typeof m.appUsername === 'string' ? m.appUsername.trim() : '';
  return m.onboardingComplete === true && u.length >= 2;
}

export function getAppProfileFromClerkUser(user: {
  id: string;
  unsafeMetadata?: unknown;
}): { displayName: string; memberId: string } | null {
  const m = readMeta(user);
  if (!hasCompletedProfileOnboarding(user)) return null;
  const username = (m.appUsername ?? '').trim();
  const displayName = (m.appDisplayName ?? username).trim() || username;
  const memberId = m.appMemberId ?? memberIdFromClerkUserId(user.id);
  return { displayName, memberId };
}

/** Username: 2–20 chars, letters, numbers, underscore. */
export function isValidAppUsername(raw: string): boolean {
  const s = raw.trim();
  return /^[a-zA-Z0-9_]{2,20}$/.test(s);
}

/** Optional display name: max 30 chars after trim; allows spaces. */
export function normalizeDisplayName(raw: string): string {
  const s = raw.trim().replace(/\s+/g, ' ');
  if (!s) return '';
  return s.length > 30 ? s.slice(0, 30) : s;
}
