import {
  isValidFriendUsernameFormat,
  legacyTcgToUsername,
  normalizeFriendUsername,
} from '../data/friends';

/** Prefix for QR payloads — encodes unique username (v2). */
const PAYLOAD_PREFIX_V2 = 'tcgfp:v2:';

/** Legacy: encoded TCG-… friend code (v1). */
const PAYLOAD_PREFIX_V1 = 'tcgfp:v1:';

/**
 * String encoded in the user’s “add me” QR. Friends app scans this.
 */
export function buildFriendQrPayload(username: string): string {
  const n = normalizeFriendUsername(username);
  return `${PAYLOAD_PREFIX_V2}${encodeURIComponent(n)}`;
}

/**
 * Parse scanned QR / pasted text into a normalized username, or null if unrecognized.
 * Supports v2 (username), v1 + legacy TCG-… demo codes, and plain usernames.
 */
export function parseFriendInviteFromQr(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(PAYLOAD_PREFIX_V2)) {
    try {
      const decoded = decodeURIComponent(trimmed.slice(PAYLOAD_PREFIX_V2.length));
      const n = normalizeFriendUsername(decoded);
      return isValidFriendUsernameFormat(n) ? n : null;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith(PAYLOAD_PREFIX_V1)) {
    try {
      const id = decodeURIComponent(trimmed.slice(PAYLOAD_PREFIX_V1.length));
      const legacy = legacyTcgToUsername(id);
      return legacy;
    } catch {
      return null;
    }
  }

  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get('code') ?? url.searchParams.get('id') ?? url.searchParams.get('username');
    if (code) {
      const fromTcg = legacyTcgToUsername(code);
      if (fromTcg) return fromTcg;
      const n = normalizeFriendUsername(code);
      if (isValidFriendUsernameFormat(n)) return n;
    }
  } catch {
    // not a URL
  }

  const legacyPlain = legacyTcgToUsername(trimmed);
  if (legacyPlain) return legacyPlain;

  const n = normalizeFriendUsername(trimmed);
  if (isValidFriendUsernameFormat(n)) return n;

  return null;
}
