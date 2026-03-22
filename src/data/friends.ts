/** Local friend list entry (MVP — no backend). */
export interface FriendEntry {
  memberId: string;
  displayName: string;
  addedAt: number;
}

/**
 * Mock directory for “lookup by ID”. Replace with API later.
 * Keys are uppercase `TCG-…` member IDs.
 */
export const MOCK_MEMBER_DIRECTORY: Record<string, string> = {
  'TCG-100001': 'Jordan K.',
  'TCG-100002': 'Sam R.',
  'TCG-100003': 'Casey M.',
};

const MEMBER_ID_RE = /^TCG-\d{4,}$/i;

export function normalizeMemberId(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}

export function isValidMemberIdFormat(id: string): boolean {
  return MEMBER_ID_RE.test(normalizeMemberId(id));
}

/** Returns display name if known in mock directory; otherwise null (unknown user). */
export function lookupMemberDisplayName(memberId: string): string | null {
  const n = normalizeMemberId(memberId);
  if (!isValidMemberIdFormat(n)) return null;
  return MOCK_MEMBER_DIRECTORY[n] ?? null;
}
