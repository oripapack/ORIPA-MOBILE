/**
 * MOCK ODDS — 実データ待ち。外部に見せないこと。
 * Replace with live, per-pack server-driven odds before release (KNOWN_ISSUES #4).
 */
export interface LootTierOdds {
  tier: string;
  /** Approximate probability (0–100), display only. */
  probabilityPct: number;
  notes?: string;
}

export const MOCK_PACK_OPENING_TIER_ODDS: LootTierOdds[] = [
  { tier: 'MYTHIC', probabilityPct: 0.5 },
  { tier: 'LEGENDARY', probabilityPct: 2 },
  { tier: 'EPIC', probabilityPct: 5.5 },
  { tier: 'BASE', probabilityPct: 92 },
];
