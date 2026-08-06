import { invokeEdgeFunction } from './invokeEdgeFunction';
import {
  idempotencyKeyForBulkPull,
  newBatchIdempotencyKey,
  newClientSeed,
  newIdempotencyKey,
} from './idempotency';
import type {
  BulkPullLiveResult,
  ExecuteBulkPullResponse,
  ExecutePullResponse,
  LedgerErrorCode,
  PackRollResult,
  PullRarityTier,
  SupabaseFunctionsClient,
} from './types';
import { legacyTierToN2 } from '../../src/lib/n2Rarity';

export {
  idempotencyKeyForBulkPull,
  newBatchIdempotencyKey,
  newClientSeed,
  newIdempotencyKey,
};

/** @deprecated Import from catalogLive */
export { LIVE_DEMO_PACK_VERSION_ID } from './catalogLive';

function tierForWonItem(wonItemId: string): PullRarityTier {
  const id = wonItemId.toLowerCase();
  if (id.includes('mythic') || id.includes('grail') || id.includes('1pct')) {
    return 'mythic';
  }
  if (id.includes('legendary')) {
    return 'legendary';
  }
  if (id.includes('epic') || id.includes('mid-tier') || id.includes('mid_tier')) {
    return 'epic';
  }
  if (id.includes('bulk') || id.includes('99pct') || id.includes('standard') || id.includes('base')) {
    return 'base';
  }
  return legacyTierToN2(id);
}

function creditMultiplierForTier(tier: PullRarityTier): number {
  switch (tier) {
    case 'mythic':
      return 2.8;
    case 'legendary':
      return 2.5;
    case 'epic':
      return 1.4;
    case 'base':
      return 0.85;
    default:
      return 0.85;
  }
}

export function mapExecutePullToRollResult(
  response: ExecutePullResponse,
  packCreditPrice: number,
): PackRollResult {
  const tier = tierForWonItem(response.won_item_id);
  const fromVault = response.vault_item?.trade_in_value_credits;
  const creditsWon =
    fromVault != null && fromVault > 0
      ? fromVault
      : Math.max(0, Math.floor(packCreditPrice * creditMultiplierForTier(tier)));

  return {
    result: response.card_name,
    creditsWon,
    tier: response.vault_item?.rarity_tier ?? tier,
  };
}

export async function executePullLive(
  client: SupabaseFunctionsClient,
  input: {
    clientSeed: string;
    packVersionId: string;
    idempotencyKey: string;
    packCreditPrice: number;
  },
): Promise<
  | { ok: true; response: ExecutePullResponse; roll: PackRollResult }
  | { ok: false; status?: number; code: string; message: string }
> {
  const result = await invokeEdgeFunction<ExecutePullResponse>(client, 'execute-pull', {
    client_seed: input.clientSeed,
    pack_version_id: input.packVersionId,
    idempotency_key: input.idempotencyKey,
  });

  if (!result.ok) {
    return mapLedgerEdgeError(result);
  }

  const response = result.data;
  if (!response?.pull_id) {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'execute-pull returned no pull_id',
    };
  }

  return {
    ok: true,
    response,
    roll: mapExecutePullToRollResult(response, input.packCreditPrice),
  };
}

/** Live ×10: sequential execute-pull calls with batch-scoped idempotency keys. */
export async function executeBulkPullLive(
  client: SupabaseFunctionsClient,
  input: {
    packVersionId: string;
    packCreditPrice: number;
    quantity: number;
    batchIdempotencyKey?: string;
  },
): Promise<
  | { ok: true; response: ExecuteBulkPullResponse }
  | { ok: false; status?: number; code: string; message: string }
> {
  const batchId = input.batchIdempotencyKey ?? newBatchIdempotencyKey();
  const quantity = Math.max(1, Math.min(10, input.quantity));
  const pulls: BulkPullLiveResult[] = [];
  let balanceAfter = 0;
  let creditCostTotal = 0;

  for (let i = 0; i < quantity; i += 1) {
    const idempotencyKey = idempotencyKeyForBulkPull(batchId, i);
    const pullResult = await executePullLive(client, {
      clientSeed: newClientSeed(),
      packVersionId: input.packVersionId,
      idempotencyKey,
      packCreditPrice: input.packCreditPrice,
    });

    if (!pullResult.ok) {
      return pullResult;
    }

    const { response, roll } = pullResult;
    creditCostTotal += response.credit_cost ?? input.packCreditPrice;
    balanceAfter = response.balance_after ?? balanceAfter;

    pulls.push({
      pullId: response.pull_id,
      mintStatus: response.mint_status,
      roll,
      idempotencyKey,
      balanceAfter: response.balance_after,
      vaultItemId: response.vault_item_id ?? response.vault_item?.id,
      tradeInValueCredits: response.vault_item?.trade_in_value_credits,
    });
  }

  return {
    ok: true,
    response: {
      batchId,
      pulls,
      balanceAfter,
      creditCostTotal,
    },
  };
}

function mapLedgerEdgeError(result: {
  ok: false;
  status?: number;
  code: string;
  message: string;
}): { ok: false; status?: number; code: string; message: string } {
  const code = normalizeLedgerErrorCode(result.code);
  return { ...result, code };
}

function normalizeLedgerErrorCode(code: string): string {
  if (code === 'INSUFFICIENT_CREDITS' || code === 'INSUFFICIENT_FUNDS') {
    return 'INSUFFICIENT_FUNDS';
  }
  if (code === 'DUPLICATE_TRANSACTION' || code === 'already_processed') {
    return 'DUPLICATE_TRANSACTION';
  }
  return code;
}

export function isLedgerErrorCode(code: string): code is LedgerErrorCode {
  return code === 'INSUFFICIENT_FUNDS' || code === 'DUPLICATE_TRANSACTION';
}
