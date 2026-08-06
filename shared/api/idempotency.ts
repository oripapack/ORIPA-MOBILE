/** Client seed for provably-fair pulls. */
export function newClientSeed(): string {
  return `ph_${crypto.randomUUID().replace(/-/g, '')}_${Date.now().toString(36)}`;
}

/** New UUID for a single pull or bulk batch root. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/** Batch root id — one per ×10 session. */
export function newBatchIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Deterministic per-pull key inside a bulk batch (index 0–9).
 * Embeds the pull index in the last UUID segment for retry safety.
 */
export function idempotencyKeyForBulkPull(batchKey: string, index: number): string {
  const parts = batchKey.toLowerCase().split('-');
  if (parts.length !== 5) return newIdempotencyKey();
  const idx = Math.max(0, Math.min(9, index)).toString(16);
  parts[4] = `${idx}${parts[4].slice(1)}`;
  return parts.join('-');
}
