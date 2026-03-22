/**
 * Disclosure copy for App Store Guideline 3.1.1 (randomized digital items).
 * Replace with live server-driven odds when backend exists.
 */
export interface LootTierOdds {
  tier: string;
  /** Approximate probability (0–100), display only. */
  probabilityPct: number;
  notes?: string;
}

export const PACK_OPENING_TIER_ODDS: LootTierOdds[] = [
  { tier: 'Common', probabilityPct: 62, notes: 'Baseline hits and bulk cards.' },
  { tier: 'Rare', probabilityPct: 22 },
  { tier: 'Epic', probabilityPct: 10 },
  { tier: 'Legendary', probabilityPct: 4.5 },
  { tier: 'Mythic', probabilityPct: 1.5, notes: 'Chase hits; rates vary by pack.' },
];
