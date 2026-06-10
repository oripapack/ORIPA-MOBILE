import { hexToBytes, hmacSha256HexUtf8, readUint32BE } from "./crypto.ts";

export type PoolItemRow = {
  item_id: string;
  card_name: string;
  weight: number;
  sort_order: number;
};

export type WeightedRollOutcome = {
  /** Primary fairness digest: HMAC-SHA256(server_seed, canonicalMessage), hex. */
  digest_hex: string;
  /** Accepted uniform uint32 in [0, rejectionLimit) used for slot = value % totalWeight. */
  accepted_uint32: number;
  /** Uniform slot index in [0, totalWeight - 1]. */
  slot_index: number;
  /** Which HMAC extension block produced the accepted word (0 = main digest). */
  stream_block: number;
  /** Word index 0..7 within that block's 32-byte output. */
  stream_word_index: number;
  /** Sum of pool weights (integer). */
  total_weight: number;
  won: PoolItemRow;
};

const UINT32_MOD = 0x1_0000_0000;
const WORDS_PER_BLOCK = 8;
const MAX_STREAM_BLOCKS = 256;

/**
 * Rejection sampling (uint32 space, no modulo bias):
 * Draw uniform u in [0, 2^32). Accept only if u < floor(2^32 / W) * W; then slot = u % W is uniform on [0, W-1].
 *
 * Stream: block 0 uses digest_hex bytes of HMAC(key, canonical).
 * Block k>0 uses HMAC(key, canonical + "|rollStream|" + k) interpreted as 32 bytes → 8 big-endian uint32s.
 */
export async function rollWeightedPool(args: {
  serverSeedHex: string;
  canonicalMessage: string;
  pool: PoolItemRow[];
}): Promise<WeightedRollOutcome> {
  const sorted = [...args.pool].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.item_id.localeCompare(b.item_id);
  });

  let total = 0;
  for (const row of sorted) {
    if (!Number.isFinite(row.weight) || row.weight < 1) {
      throw new Error(`Invalid weight for item ${row.item_id}`);
    }
    total += row.weight;
  }

  if (sorted.length === 0) {
    throw new Error("Pool is empty");
  }
  if (total <= 0 || total > UINT32_MOD) {
    throw new Error("Total weight must be in (0, 2^32]");
  }

  const keyBytes = hexToBytes(args.serverSeedHex);
  const digestHex = await hmacSha256HexUtf8(keyBytes, args.canonicalMessage);

  const rejectionLimit = Math.floor(UINT32_MOD / total) * total;
  if (rejectionLimit === 0) {
    throw new Error("Total weight too large for uint32 rejection bound");
  }

  let streamBlock = 0;
  let bytes = hexToBytes(digestHex);

  for (; streamBlock < MAX_STREAM_BLOCKS; streamBlock++) {
    if (streamBlock > 0) {
      const msg = `${args.canonicalMessage}|rollStream|${streamBlock}`;
      const blockHex = await hmacSha256HexUtf8(keyBytes, msg);
      bytes = hexToBytes(blockHex);
    }

    for (let w = 0; w < WORDS_PER_BLOCK; w++) {
      const u = readUint32BE(bytes, w * 4);
      if (u < rejectionLimit) {
        const slotIndex = u % total;
        const won = pickBySlot(sorted, slotIndex);
        return {
          digest_hex: digestHex,
          accepted_uint32: u,
          slot_index: slotIndex,
          stream_block: streamBlock,
          stream_word_index: w,
          total_weight: total,
          won,
        };
      }
    }
  }

  throw new Error("Rejection sampling exceeded stream budget (extremely unlikely)");
}

function pickBySlot(sorted: PoolItemRow[], slotIndex: number): PoolItemRow {
  let acc = 0;
  for (const row of sorted) {
    acc += row.weight;
    if (slotIndex < acc) return row;
  }
  throw new Error("Slot index out of range");
}
