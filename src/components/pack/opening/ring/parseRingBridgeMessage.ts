/**
 * Safe parser for opening-3d ↔ native/iframe bridge payloads.
 * Unknown or malformed messages are ignored (never throw into RN).
 */

export type RingBridgeMessage =
  | { type: 'revealDone' }
  | { type: 'skip' };

const KNOWN = new Set(['revealDone', 'skip']);

export function parseRingBridgeMessage(raw: unknown): RingBridgeMessage | null {
  try {
    let data: unknown = raw;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return null;
      data = JSON.parse(trimmed);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const type = (data as { type?: unknown }).type;
    if (typeof type !== 'string' || !KNOWN.has(type)) return null;
    return { type: type as RingBridgeMessage['type'] };
  } catch {
    return null;
  }
}
