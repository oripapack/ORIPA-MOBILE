import { normalizeMemberId } from '../data/friends';

/** Prefix for QR payloads so we don’t treat random URLs as friend codes. */
const PAYLOAD_PREFIX = 'tcgfp:v1:';

/**
 * String encoded in the user’s “add me” QR. Friends app scans this.
 */
export function buildFriendQrPayload(memberId: string): string {
  const n = normalizeMemberId(memberId);
  return `${PAYLOAD_PREFIX}${encodeURIComponent(n)}`;
}

/**
 * Parse scanned QR / pasted text into a member ID, or null if unrecognized.
 */
export function parseFriendMemberIdFromQr(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(PAYLOAD_PREFIX)) {
    try {
      const id = decodeURIComponent(trimmed.slice(PAYLOAD_PREFIX.length));
      const n = normalizeMemberId(id);
      return n.length > 0 ? n : null;
    } catch {
      return null;
    }
  }

  // Plain member ID pasted or encoded without prefix
  const n = normalizeMemberId(trimmed);
  if (/^TCG-\d{4,}$/.test(n)) return n;

  // Optional: deep link / https with ?code=TCG-...
  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get('code') ?? url.searchParams.get('id');
    if (code) {
      const cn = normalizeMemberId(code);
      if (/^TCG-\d{4,}$/.test(cn)) return cn;
    }
  } catch {
    // not a URL
  }

  return null;
}
