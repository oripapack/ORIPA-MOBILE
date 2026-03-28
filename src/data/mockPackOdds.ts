export type OddsTier = 'Top hit' | 'Ultra' | 'Rare' | 'Common';

export type TierOddsRow = {
  tier: OddsTier;
  chance: string;
  examples: string[];
};

export type PackOdds = {
  rows: TierOddsRow[];
  note: string;
};

const DEFAULT_ROWS: TierOddsRow[] = [
  {
    tier: 'Top hit',
    chance: '0.5%',
    examples: ['PSA 10 Charizard', 'Gold Mewtwo'],
  },
  {
    tier: 'Ultra',
    chance: '5%',
    examples: ['Alt-Art Umbreon', 'Secret Rare Luffy'],
  },
  {
    tier: 'Rare',
    chance: '20%',
    examples: ['VSTAR Pikachu', 'Blue-Eyes Silver'],
  },
  {
    tier: 'Common',
    chance: '74.5%',
    examples: ['Holo Trainer', 'Base Rare Slot'],
  },
];

export function getMockPackOdds(packId: string): PackOdds {
  // Keep mock data deterministic but not identical per pack.
  const even = Number(packId) % 2 === 0;
  const rows = DEFAULT_ROWS.map((row) =>
    row.tier === 'Ultra' && even
      ? { ...row, examples: ['Rainbow Pikachu VMAX', 'Legendary Blue-Eyes'] }
      : row
  );

  return {
    rows,
    note: 'Demo probabilities. Final rates may change before launch.',
  };
}

