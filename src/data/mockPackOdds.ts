import type { HomeNicheCategory, Pack } from './mockPacks';

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

const NOTE = 'Demo probabilities. Final rates may change before launch.';

const ROWS: Record<HomeNicheCategory, TierOddsRow[]> = {
  pokemon: [
    {
      tier: 'Top hit',
      chance: '0.5%',
      examples: ['PSA 10 SAR Charizard', 'Illustration rare chase'],
    },
    {
      tier: 'Ultra',
      chance: '5%',
      examples: ['Full-art ex', 'Special illustration rare'],
    },
    {
      tier: 'Rare',
      chance: '20%',
      examples: ['Double rare', 'Holo rare', 'Trainer gallery'],
    },
    {
      tier: 'Common',
      chance: '74.5%',
      examples: ['Reverse holo', 'Common / uncommon playables'],
    },
  ],
  one_piece: [
    {
      tier: 'Top hit',
      chance: '0.5%',
      examples: ['PSA 10 leader alt art', 'Serialized manga rare'],
    },
    {
      tier: 'Ultra',
      chance: '5%',
      examples: ['Manga rare', 'Alt-art leader', 'Parallel SR'],
    },
    {
      tier: 'Rare',
      chance: '20%',
      examples: ['Super rare character', 'Event counter'],
    },
    {
      tier: 'Common',
      chance: '74.5%',
      examples: ['DON!!', 'Commons & uncommons'],
    },
  ],
  yugioh: [
    {
      tier: 'Top hit',
      chance: '0.5%',
      examples: ['Starlight rare', 'Ghost rare', 'LOB 1st holo'],
    },
    {
      tier: 'Ultra',
      chance: '5%',
      examples: ['Secret rare', 'Collector rare', 'Quarter-century secret'],
    },
    {
      tier: 'Rare',
      chance: '20%',
      examples: ['Ultra rare', 'Super rare staples'],
    },
    {
      tier: 'Common',
      chance: '74.5%',
      examples: ['Common reprints', 'Normal monsters'],
    },
  ],
  sports: [
    {
      tier: 'Top hit',
      chance: '0.5%',
      examples: ['Logoman 1/1', 'Rookie patch auto /10'],
    },
    {
      tier: 'Ultra',
      chance: '5%',
      examples: ['Gold /10', 'RPA /25', 'Flawless diamond'],
    },
    {
      tier: 'Rare',
      chance: '20%',
      examples: ['Silver Prizm RC', 'Optic holo', 'Select concourse'],
    },
    {
      tier: 'Common',
      chance: '74.5%',
      examples: ['Base rookies', 'Inserts', 'Parallels'],
    },
  ],
};

export function getMockPackOdds(pack: Pack): PackOdds {
  const rows = ROWS[pack.category];
  return {
    rows,
    note: NOTE,
  };
}
