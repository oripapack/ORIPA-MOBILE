import type { CreditTransaction, CreditTransactionType, SupabaseQueryClient } from './types';

const TX_SELECT =
  'id,user_id,amount,transaction_type,idempotency_key,reference_id,metadata,created_at';

function mapTransaction(row: Record<string, unknown>): CreditTransaction {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    amount: Number(row.amount ?? 0),
    transaction_type: String(row.transaction_type ?? 'pack_spend') as CreditTransactionType,
    idempotency_key: String(row.idempotency_key ?? ''),
    reference_id: row.reference_id != null ? String(row.reference_id) : null,
    metadata:
      row.metadata && typeof row.metadata === 'object'
        ? (row.metadata as Record<string, unknown>)
        : undefined,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

/** Own ledger rows via RLS (`credit_transactions_select_own`). Newest first. */
export async function getUserCreditTransactions(
  client: SupabaseQueryClient,
  opts?: { limit?: number },
): Promise<CreditTransaction[]> {
  const limit = Math.max(1, Math.min(200, opts?.limit ?? 50));
  const sb = client as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => {
          limit: (n: number) => Promise<{
            data: Record<string, unknown>[] | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };

  const { data, error } = await sb
    .from('credit_transactions')
    .select(TX_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || 'Failed to load credit transactions');
  }

  return (data ?? []).map(mapTransaction);
}

/**
 * Reconstruct balance-after for each row from the current wallet balance
 * (table has no balance_after column). Rows must be newest-first.
 */
export function withBalanceAfter<T extends { amount: number }>(
  txs: T[],
  currentBalance: number,
): Array<T & { balanceAfter: number }> {
  let cursor = currentBalance;
  return txs.map((tx) => {
    const balanceAfter = cursor;
    cursor -= tx.amount;
    return { ...tx, balanceAfter };
  });
}
