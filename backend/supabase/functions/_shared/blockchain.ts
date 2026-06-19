import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  isAddress,
  parseAbi,
  type Address,
  type Hex,
} from "npm:viem@2.52.2";
import { privateKeyToAccount } from "npm:viem@2.52.2/accounts";
import { base } from "npm:viem@2.52.2/chains";

export type TwinMetadata = {
  name: string;
  description?: string;
  image?: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
};

export type MintReceiptDetails = {
  tokenId?: string;
  blockNumber?: bigint;
};

const mintToAbi = parseAbi([
  "function mintTo(address to, string uri) returns (uint256)",
]);

const transferEventAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

const zeroAddress = "0x0000000000000000000000000000000000000000";

function env(name: string): string | undefined {
  try {
    const denoValue = Deno.env.get(name);
    if (denoValue) return denoValue;
  } catch {
    // Non-Deno test runners may not expose Deno.env.
  }

  return (globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env?.[name];
}

function requireAddress(name: string): Address {
  const value = env(name)?.trim();
  if (!value || !isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }
  return value as Address;
}

function requirePrivateKey(): Hex {
  const raw = env("PRIVATE_MINTER_KEY")?.trim();
  const value = raw?.startsWith("0x") ? raw : raw ? `0x${raw}` : "";

  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("PRIVATE_MINTER_KEY must be a 32-byte hex private key");
  }

  return value as Hex;
}

function baseTransport() {
  const rpcUrl = env("BASE_RPC_URL")?.trim();
  return rpcUrl ? http(rpcUrl) : http();
}

function createClients() {
  const account = privateKeyToAccount(requirePrivateKey());
  const transport = baseTransport();

  const publicClient = createPublicClient({
    chain: base,
    transport,
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport,
  });

  return { account, publicClient, walletClient };
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

export function buildTokenMetadataURI(metadata: TwinMetadata): string {
  const json = JSON.stringify(metadata);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:application/json;base64,${btoa(binary)}`;
}

/**
 * Sends a native Base transaction from the backend minter wallet.
 *
 * Required Supabase secrets:
 * - PRIVATE_MINTER_KEY: hot minter wallet key, backend only
 * - DIGITAL_TWIN_CONTRACT_ADDRESS: deployed ERC-721 contract on Base
 * - BASE_RPC_URL: optional dedicated Base RPC endpoint
 */
export async function mintCardNFT(input: {
  userWalletAddress: string;
  tokenMetadataURI: string;
}): Promise<string> {
  if (!isAddress(input.userWalletAddress)) {
    throw new Error("userWalletAddress must be a valid EVM address");
  }

  if (!input.tokenMetadataURI.trim()) {
    throw new Error("tokenMetadataURI is required");
  }

  const contractAddress = requireAddress("DIGITAL_TWIN_CONTRACT_ADDRESS");
  const { account, publicClient, walletClient } = createClients();

  const { request } = await publicClient.simulateContract({
    account,
    address: contractAddress,
    abi: mintToAbi,
    functionName: "mintTo",
    args: [input.userWalletAddress as Address, input.tokenMetadataURI],
  });

  return await walletClient.writeContract(request);
}

export async function getMintReceiptDetails(input: {
  txHash: string;
  ownerWallet: string;
}): Promise<MintReceiptDetails> {
  const contractAddress = requireAddress("DIGITAL_TWIN_CONTRACT_ADDRESS");
  const { publicClient } = createClients();
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: input.txHash as Hex,
    confirmations: 1,
  });

  if (receipt.status !== "success") {
    throw new Error(`Mint transaction reverted: ${input.txHash}`);
  }

  const owner = input.ownerWallet.toLowerCase();
  let tokenId: string | undefined;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: transferEventAbi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Transfer") continue;

      const args = decoded.args as {
        from?: Address;
        to?: Address;
        tokenId?: bigint;
      };

      if (
        args.from?.toLowerCase() === zeroAddress &&
        args.to?.toLowerCase() === owner &&
        args.tokenId != null
      ) {
        tokenId = args.tokenId.toString();
        break;
      }
    } catch {
      // Ignore non-ERC721 logs emitted by the same transaction.
    }
  }

  return {
    tokenId,
    blockNumber: receipt.blockNumber,
  };
}

export function getDigitalTwinContractAddress(): string {
  return requireAddress("DIGITAL_TWIN_CONTRACT_ADDRESS");
}

