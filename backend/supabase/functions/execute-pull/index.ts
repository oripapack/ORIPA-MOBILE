import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { bytesToHex, sha256HexUtf8 } from "../_shared/crypto.ts";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  parseUuid,
  requireBearer,
} from "../_shared/http.ts";
import {
  type PoolItemRow,
  rollWeightedPool,
} from "../_shared/weightedRoll.ts";

type ExecutePullBody = {
  client_seed: string;
  pack_version_id?: string | null;
  nonce?: number | null;
  idempotency_key: string;
};

type PoolRow = PoolItemRow & { should_mint: boolean };

type AtomicPullRow = {
  status: string;
  error_code?: string;
  pull_id?: string;
  mint_status?: string;
  credit_cost?: number;
  balance_after?: number;
  transaction_id?: string;
  vault_item_id?: string;
  vault_item?: Record<string, unknown>;
  won_item_id?: string;
  card_name?: string;
  serial_number?: string;
  digest_hex?: string;
  roll_value?: number;
};

function randomServerSeedHex(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

function mapRpcError(error: { message?: string; details?: string }): {
  status: number;
  code: string;
  message: string;
} {
  const raw = `${error.message ?? ""} ${error.details ?? ""}`;
  if (raw.includes("INSUFFICIENT_CREDITS") || raw.includes("INSUFFICIENT_FUNDS")) {
    return { status: 402, code: "INSUFFICIENT_FUNDS", message: raw };
  }
  if (raw.includes("DUPLICATE_TRANSACTION") || raw.includes("already_processed")) {
    return { status: 409, code: "DUPLICATE_TRANSACTION", message: raw };
  }
  if (raw.includes("UNAUTHORIZED") || raw.includes("FORBIDDEN")) {
    return { status: 401, code: "UNAUTHORIZED", message: raw };
  }
  if (raw.includes("UNKNOWN_PACK_VERSION")) {
    return { status: 404, code: "UNKNOWN_PACK_VERSION", message: raw };
  }
  if (raw.includes("PACK_VERSION_INACTIVE")) {
    return { status: 400, code: "PACK_VERSION_INACTIVE", message: raw };
  }
  return { status: 500, code: "PULL_FAILED", message: raw || "Unknown error" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();

  if (req.method !== "POST") {
    return errorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return errorResponse(
      500,
      "SERVER_MISCONFIGURED",
      "Server misconfigured (Supabase env)",
    );
  }

  if (!requireBearer(req)) {
    return errorResponse(401, "UNAUTHORIZED", "Bearer token required");
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user?.id) {
    return errorResponse(401, "UNAUTHORIZED", "Sign in required");
  }

  const clerkUserId = user.id;

  let body: ExecutePullBody;
  try {
    body = (await req.json()) as ExecutePullBody;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON body");
  }

  const clientSeed = String(body.client_seed ?? "").trim();
  if (!clientSeed || clientSeed.length > 512) {
    return errorResponse(
      400,
      "INVALID_CLIENT_SEED",
      "client_seed is required (max 512 chars)",
    );
  }

  const idempotencyKey = parseUuid(body.idempotency_key);
  if (!idempotencyKey) {
    return errorResponse(
      400,
      "INVALID_IDEMPOTENCY_KEY",
      "idempotency_key (UUID) is required",
    );
  }

  const packVersionId =
    parseUuid(body.pack_version_id) ??
    parseUuid(Deno.env.get("DEFAULT_PACK_VERSION_ID"));

  if (!packVersionId) {
    return errorResponse(
      400,
      "PACK_VERSION_REQUIRED",
      "pack_version_id is required (or set DEFAULT_PACK_VERSION_ID for dev)",
    );
  }

  const { data: packVersion, error: pvErr } = await userClient
    .from("pack_versions")
    .select("id, is_active, credit_cost")
    .eq("id", packVersionId)
    .maybeSingle();

  if (pvErr || !packVersion) {
    return errorResponse(404, "UNKNOWN_PACK_VERSION", "Unknown pack_version_id");
  }

  if (!packVersion.is_active) {
    return errorResponse(
      400,
      "PACK_VERSION_INACTIVE",
      "This pack version is not active",
    );
  }

  const { data: poolRows, error: poolErr } = await userClient
    .from("pack_pool_items")
    .select("item_id, card_name, weight, sort_order, should_mint")
    .eq("pack_version_id", packVersionId)
    .order("sort_order", { ascending: true })
    .order("item_id", { ascending: true });

  if (poolErr) {
    console.error(poolErr);
    return errorResponse(500, "POOL_LOOKUP_FAILED", poolErr.message);
  }

  if (!poolRows?.length) {
    return errorResponse(400, "EMPTY_POOL", "Pack pool has no items");
  }

  const pool: PoolRow[] = [];
  try {
    for (const r of poolRows) {
      pool.push({
        item_id: String(r.item_id),
        card_name: String(r.card_name),
        weight: normalizeWeight(r.weight),
        sort_order: Number(r.sort_order ?? 0),
        should_mint: Boolean(r.should_mint),
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(400, "INVALID_POOL_WEIGHT", msg);
  }

  const nonce =
    body.nonce != null && Number.isFinite(body.nonce)
      ? Number(body.nonce)
      : await nextNonce(userClient, clerkUserId);

  const serverSeedHex = randomServerSeedHex();
  const hashedServerSeed = await sha256HexUtf8(serverSeedHex);

  const canonicalMessage =
    `v1|${clientSeed}|${nonce}|${packVersionId}|${clerkUserId}`;

  let roll: Awaited<ReturnType<typeof rollWeightedPool>>;
  try {
    roll = await rollWeightedPool({
      serverSeedHex,
      canonicalMessage,
      pool,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(400, "ROLL_FAILED", msg);
  }

  const wonLine = pool.find((p) => p.item_id === roll.won.item_id);
  const shouldMint = wonLine?.should_mint ?? false;

  const serialNumber =
    `PRH-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
  const provenanceAt = new Date().toISOString();

  const { data: rpcData, error: rpcErr } = await userClient.rpc(
    "process_atomic_pull",
    {
      p_pack_version_id: packVersionId,
      p_idempotency_key: idempotencyKey,
      p_client_seed: clientSeed,
      p_nonce: nonce,
      p_hashed_server_seed: hashedServerSeed,
      p_revealed_server_seed: serverSeedHex,
      p_digest_hex: roll.digest_hex,
      p_roll_value: roll.accepted_uint32,
      p_won_item_id: roll.won.item_id,
      p_card_name: roll.won.card_name,
      p_serial_number: serialNumber,
      p_provenance_at: provenanceAt,
      p_should_mint: shouldMint,
    },
  );

  if (rpcErr) {
    const mapped = mapRpcError(rpcErr);
    return errorResponse(mapped.status, mapped.code, mapped.message);
  }

  const result = rpcData as AtomicPullRow;
  const pullId = result.pull_id;
  const mintStatus = result.mint_status ?? "mint_skipped_low_tier";
  const rpcStatus = result.status;

  if (!pullId) {
    return errorResponse(500, "PULL_FAILED", "No pull_id returned");
  }

  // Idempotent replay: return prior result without re-rolling fairness fields
  if (rpcStatus === "already_processed") {
    return jsonResponse({
      pull_id: pullId,
      status: "already_processed",
      error_code: "DUPLICATE_TRANSACTION",
      pack_version_id: packVersionId,
      credit_cost: result.credit_cost ?? packVersion.credit_cost,
      balance_after: result.balance_after,
      transaction_id: result.transaction_id,
      won_item_id: result.won_item_id ?? roll.won.item_id,
      card_name: result.card_name ?? roll.won.card_name,
      serial_number: result.serial_number ?? serialNumber,
      mint_status: mintStatus,
      idempotency_key: idempotencyKey,
      vault_item_id: result.vault_item_id,
      vault_item: result.vault_item,
    });
  }

  return jsonResponse({
    pull_id: pullId,
    status: rpcStatus ?? "ok",
    error_code: result.error_code,
    pack_version_id: packVersionId,
    credit_cost: result.credit_cost ?? packVersion.credit_cost,
    balance_after: result.balance_after,
    transaction_id: result.transaction_id,
    hashed_server_seed: hashedServerSeed,
    revealed_server_seed: serverSeedHex,
    should_mint: shouldMint,
    fairness: {
      algo: "hmac_sha256_rejection_uint32_v1",
      digest_hex: roll.digest_hex,
      canonical_message: canonicalMessage,
      accepted_uint32: roll.accepted_uint32,
      slot_index: roll.slot_index,
      total_weight: roll.total_weight,
      stream_block: roll.stream_block,
      stream_word_index: roll.stream_word_index,
      rejection_limit: Math.floor(0x1_0000_0000 / roll.total_weight) *
        roll.total_weight,
    },
    won_item_id: roll.won.item_id,
    card_name: roll.won.card_name,
    serial_number: serialNumber,
    provenance_at: provenanceAt,
    mint_status: mintStatus,
    idempotency_key: idempotencyKey,
    vault_item_id: result.vault_item_id,
    vault_item: result.vault_item,
  });
});

function normalizeWeight(raw: unknown): number {
  const n = typeof raw === "number"
    ? raw
    : typeof raw === "string"
    ? Number(raw)
    : Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > Number.MAX_SAFE_INTEGER) {
    throw new Error("Invalid pool weight");
  }
  return Math.trunc(n);
}

async function nextNonce(
  client: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await client
    .from("pull_results")
    .select("nonce")
    .eq("user_id", userId)
    .order("nonce", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("nonce lookup", error);
    return 0;
  }
  if (!data) return 0;
  return Number(data.nonce) + 1;
}
