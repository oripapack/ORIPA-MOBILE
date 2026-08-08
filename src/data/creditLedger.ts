/**
 * Credit ledger — live `credit_transactions` reads + shared types.
 */
export type {
  CreditTransaction,
  CreditTransactionType,
  DeductUserCreditsResult,
  LedgerErrorCode,
} from '../../shared/api/types';

export {
  idempotencyKeyForBulkPull,
  newBatchIdempotencyKey,
  newIdempotencyKey,
} from '../../shared/api/idempotency';

export {
  getUserCreditTransactions,
  withBalanceAfter,
} from '../../shared/api/creditTransactions';

import type { CreditTransaction, SupabaseQueryClient } from '../../shared/api/types';
import {
  getUserCreditTransactions as getShared,
  withBalanceAfter,
} from '../../shared/api/creditTransactions';
import { CREDITS_ARE_MOCK } from '../config/app';
import { isSupabaseConfigured } from '../lib/supabase';
import { createClerkAuthedClient } from '../lib/supabaseAuthed';
import i18n from '../i18n';

export type CreditLedgerRow = CreditTransaction & { balanceAfter: number };

export function isLiveCreditLedgerEnabled(): boolean {
  return !CREDITS_ARE_MOCK && isSupabaseConfigured;
}

export async function fetchCreditLedgerLive(opts?: {
  limit?: number;
  currentBalance?: number;
}): Promise<CreditLedgerRow[]> {
  if (!isLiveCreditLedgerEnabled()) return [];
  const client = await createClerkAuthedClient();
  if (!client) return [];

  const txs = await getShared(client as unknown as SupabaseQueryClient, {
    limit: opts?.limit,
  });
  const balance = opts?.currentBalance ?? 0;
  return withBalanceAfter(txs, balance);
}

/** Human labels for ledger `transaction_type` values. */
export function creditTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'pack_spend':
    case 'bulk_pack_spend':
      return i18n.t('creditHistory.type.packPull');
    case 'trade_in_credit':
      return i18n.t('creditHistory.type.tradeIn');
    case 'top_up':
      return i18n.t('creditHistory.type.topUp');
    case 'refund':
      return i18n.t('creditHistory.type.refund');
    default:
      return i18n.t('creditHistory.type.other');
  }
}
