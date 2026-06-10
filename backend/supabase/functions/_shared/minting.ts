/**
 * Gasless mint integration (Thirdweb Engine-style HTTP API).
 *
 * Secrets: use Supabase project secrets (`supabase secrets set`) — never commit keys.
 * Do not put minter private keys in Postgres unless using Supabase Vault + sealed columns;
 * prefer Thirdweb Engine / Crossmint so Pull Hub never holds a hot signing key in Edge code.
 */

export type TwinMetadata = {
  name: string;
  description?: string;
  image?: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
};

export type MintSuccess = {
  chainId: number;
  contractAddress: string;
  tokenId: string;
  txHash: string;
  ownerWallet: string;
  blockNumber?: bigint;
  blockTimestamp?: string;
  provider: "thirdweb_engine";
};

export type MintFailure = {
  error: string;
  status?: number;
};

function env(name: string): string | undefined {
  return Deno.env.get(name) ?? undefined;
}

export function buildTwinMetadata(input: {
  cardName: string;
  serialNumber: string;
  fairnessHash: string;
  /** ISO-8601 wall time of the resolved pull (legal provenance). */
  provenanceTimestamp: string;
  /** Optional: set once a receipt is available. */
  chainBlockTimestamp?: string;
}): TwinMetadata {
  const attrs: TwinMetadata["attributes"] = [
    { trait_type: "card_name", value: input.cardName },
    { trait_type: "serial_number", value: input.serialNumber },
    { trait_type: "fairness_hash", value: input.fairnessHash },
    { trait_type: "timestamp", value: input.provenanceTimestamp },
  ];
  if (input.chainBlockTimestamp) {
    attrs.push({
      trait_type: "chain_block_timestamp",
      value: input.chainBlockTimestamp,
    });
  }
  return {
    name: `${input.cardName} · ${input.serialNumber}`,
    description:
      "Pull Hub Digital Twin — programmatically tied to provably fair pull provenance.",
    attributes: attrs,
  };
}

/**
 * Calls Thirdweb Engine `mint-to` for ERC-721 on Base (chain 8453).
 * Env:
 * - THIRDWEB_ENGINE_URL — e.g. https://<your-engine>.thirdweb.com
 * - THIRDWEB_ENGINE_ACCESS_TOKEN — Bearer token for Engine
 * - DIGITAL_TWIN_CONTRACT_ADDRESS — deployed ERC-721 on Base
 */
export async function mintViaThirdwebEngine(input: {
  receiver: string;
  metadata: TwinMetadata;
}): Promise<MintSuccess | MintFailure> {
  const baseUrl = env("THIRDWEB_ENGINE_URL")?.replace(/\/$/, "");
  const token = env("THIRDWEB_ENGINE_ACCESS_TOKEN");
  const contract = env("DIGITAL_TWIN_CONTRACT_ADDRESS");
  const chainId = Number(env("BASE_CHAIN_ID") ?? "8453");

  if (!baseUrl || !token || !contract) {
    return {
      error:
        "Missing THIRDWEB_ENGINE_URL, THIRDWEB_ENGINE_ACCESS_TOKEN, or DIGITAL_TWIN_CONTRACT_ADDRESS",
    };
  }

  const url =
    `${baseUrl}/contract/${chainId}/${contract}/erc721/mint-to`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiver: input.receiver,
        metadata: input.metadata,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `Mint request failed: ${msg}` };
  }

  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    return {
      error: `Mint API returned non-JSON (${res.status}): ${text.slice(0, 500)}`,
      status: res.status,
    };
  }

  if (!res.ok) {
    return {
      error:
        `Mint API ${res.status}: ${(json["error"] as string) ?? text.slice(0, 500)}`,
      status: res.status,
    };
  }

  const txHash = pickTxHash(json);
  const tokenId = pickTokenId(json);

  if (!txHash) {
    return {
      error:
        `Mint API OK but no transaction hash in response: ${text.slice(0, 800)}`,
      status: res.status,
    };
  }

  return {
    chainId,
    contractAddress: contract,
    tokenId: tokenId ?? "0",
    txHash,
    ownerWallet: input.receiver,
    provider: "thirdweb_engine",
  };
}

function pickTxHash(json: Record<string, unknown>): string | undefined {
  const candidates = [
    json["transactionHash"],
    json["txHash"],
    json["hash"],
    (json["result"] as Record<string, unknown> | undefined)?.["transactionHash"],
    (json["result"] as Record<string, unknown> | undefined)?.["txHash"],
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.startsWith("0x")) return c;
  }
  return undefined;
}

function pickTokenId(json: Record<string, unknown>): string | undefined {
  const candidates = [
    json["tokenId"],
    json["id"],
    (json["result"] as Record<string, unknown> | undefined)?.["tokenId"],
    (json["result"] as Record<string, unknown> | undefined)?.["id"],
  ];
  for (const c of candidates) {
    if (typeof c === "number") return String(c);
    if (typeof c === "string") return c;
  }
  return undefined;
}
