export type PullRarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** Minimal Supabase client surface for Edge Function invokes (avoids duplicate package types). */
export type SupabaseFunctionsClient = {
  functions: {
    invoke: <T>(
      functionName: string,
      options: {
        body?: Record<string, unknown>;
        headers?: Record<string, string>;
      },
    ) => Promise<{ data: T | null; error: unknown }>;
  };
};

export type SupabaseQueryClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: { balance?: number } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type PackRollResult = {
  result: string;
  creditsWon: number;
  tier: PullRarityTier;
};

export type InvokeEdgeResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; code: string; message: string };

export type ExecutePullResponse = {
  pull_id: string;
  status?: string;
  pack_version_id: string;
  credit_cost?: number;
  balance_after?: number;
  won_item_id: string;
  card_name: string;
  serial_number: string;
  mint_status: string;
  idempotency_key: string;
};
