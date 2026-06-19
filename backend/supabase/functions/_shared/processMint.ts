import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  buildTokenMetadataURI,
  buildTwinMetadata,
  getDigitalTwinContractAddress,
  getMintReceiptDetails,
  mintCardNFT,
} from "./blockchain.ts";
import type { TwinMetadata } from "./blockchain.ts";

export type ProcessMintResult =
  | { status: "completed" }
  | { status: "skipped_no_wallet" }
  | { status: "skipped_low_tier" }
  | { status: "skipped_deferred" }
  | { status: "pending"; error: string };

/** Exported for mint-retry queue queries (must stay in sync). */
export const MAX_MINT_ATTEMPTS = 8;

function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Native Base mint for high-tier pulls only after shipment is requested.
 * Low-tier pulls use `mint_skipped_low_tier` and never hit the chain.
 */
export async function processMintForPullId(
  pullId: string,
  admin?: SupabaseClient,
): Promise<ProcessMintResult> {
  const supabase = admin ?? serviceClient();

  const { data: twin, error: twinErr } = await supabase
    .from("digital_twins")
    .select("id")
    .eq("pull_id", pullId)
    .maybeSingle();

  if (twinErr) {
    return { status: "pending", error: twinErr.message };
  }
  if (twin) {
    await supabase
      .from("pull_results")
      .update({ mint_status: "mint_completed" })
      .eq("id", pullId);
    return { status: "completed" };
  }

  const { data: pull, error: pullErr } = await supabase
    .from("pull_results")
    .select(
      "id, user_id, digest_hex, card_name, serial_number, provenance_at, mint_attempts, mint_status",
    )
    .eq("id", pullId)
    .single();

  if (pullErr || !pull) {
    return { status: "pending", error: pullErr?.message ?? "pull not found" };
  }

  if (pull.mint_status === "mint_completed") {
    return { status: "completed" };
  }

  if (pull.mint_status === "mint_skipped_low_tier") {
    return { status: "skipped_low_tier" };
  }

  if (pull.mint_status === "mint_skipped_no_wallet") {
    return { status: "skipped_no_wallet" };
  }

  if (pull.mint_status === "mint_deferred") {
    return { status: "skipped_deferred" };
  }

  if (pull.mint_status !== "mint_pending") {
    if (pull.mint_status === "mint_failed") {
      return { status: "pending", error: "mint_failed_final" };
    }
    return { status: "pending", error: `unexpected_mint_status:${pull.mint_status}` };
  }

  const attempts = Number(pull.mint_attempts ?? 0);
  if (attempts >= MAX_MINT_ATTEMPTS) {
    await supabase
      .from("pull_results")
      .update({
        mint_status: "mint_failed",
        mint_last_error: `Exceeded mint retry budget (${MAX_MINT_ATTEMPTS})`,
      })
      .eq("id", pullId);
    return {
      status: "pending",
      error: "max_attempts_exceeded",
    };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("wallet_address")
    .eq("id", pull.user_id)
    .single();

  if (profileErr) {
    await bumpFailure(supabase, pullId, attempts, profileErr.message);
    return { status: "pending", error: profileErr.message };
  }

  const wallet = profile?.wallet_address?.trim();
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    await supabase
      .from("pull_results")
      .update({
        mint_status: "mint_skipped_no_wallet",
        mint_last_error: "No valid EVM wallet on profile",
      })
      .eq("id", pullId);
    return { status: "skipped_no_wallet" };
  }

  const provenanceIso = new Date(pull.provenance_at).toISOString();
  const metadata: TwinMetadata = buildTwinMetadata({
    cardName: pull.card_name,
    serialNumber: pull.serial_number,
    fairnessHash: pull.digest_hex,
    provenanceTimestamp: provenanceIso,
  });

  const tokenMetadataURI = buildTokenMetadataURI(metadata);
  let txHash: string;
  let receipt: Awaited<ReturnType<typeof getMintReceiptDetails>>;

  try {
    txHash = await mintCardNFT({
      userWalletAddress: wallet,
      tokenMetadataURI,
    });
    receipt = await getMintReceiptDetails({
      txHash,
      ownerWallet: wallet,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await bumpFailure(supabase, pullId, attempts, message);
    return { status: "pending", error: message };
  }

  const { error: insertErr } = await supabase.from("digital_twins").insert({
    pull_id: pullId,
    chain_id: 8453,
    contract_address: getDigitalTwinContractAddress(),
    token_id: receipt.tokenId ?? txHash,
    tx_hash: txHash,
    owner_wallet: wallet,
    block_number: receipt.blockNumber != null ? Number(receipt.blockNumber) : null,
    block_timestamp: null,
    metadata_snapshot: metadata as unknown as Record<string, unknown>,
    mint_provider: "viem_native_base",
  });

  if (insertErr) {
    await bumpFailure(supabase, pullId, attempts, insertErr.message);
    return { status: "pending", error: insertErr.message };
  }

  await supabase
    .from("pull_results")
    .update({
      mint_status: "mint_completed",
      mint_last_error: null,
    })
    .eq("id", pullId);

  return { status: "completed" };
}

async function bumpFailure(
  supabase: SupabaseClient,
  pullId: string,
  attempts: number,
  message: string,
) {
  await supabase
    .from("pull_results")
    .update({
      mint_status: "mint_pending",
      mint_attempts: attempts + 1,
      mint_last_error: message,
    })
    .eq("id", pullId);
}
