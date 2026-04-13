import type { PackCategory, Pack } from './mockPacks';

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

const ROWS: Record<PackCategory, TierOddsRow[]> = {
  onboarding: [
    {
      tier: 'Top hit',
      chance: '10%',
      examples: ['3× coin bonus', 'Welcome surprise card'],
    },
    {
      tier: 'Ultra',
      chance: '20%',
      examples: ['2× coin bonus', 'Holographic promo'],
    },
    {
      tier: 'Rare',
      chance: '30%',
      examples: ['Rare card', '1.5× coin return'],
    },
    {
      tier: 'Common',
      chance: '40%',
      examples: ['Standard card', '1× coin return'],
    },
  ],
  micro: [
    {
      tier: 'Top hit',
      chance: '2%',
      examples: ['Nintendo Switch', 'PS5', 'iPhone 16'],
    },
    {
      tier: 'Ultra',
      chance: '8%',
      examples: ['Gift coupon (¥5,000)', 'Ultra rare card'],
    },
    {
      tier: 'Rare',
      chance: '25%',
      examples: ['Rare card', 'Coin bonus ×2'],
    },
    {
      tier: 'Common',
      chance: '65%',
      examples: ['Standard card', 'Small coin return'],
    },
  ],
  premium: [
    {
      tier: 'Top hit',
      chance: '5%',
      examples: ['PSA 10 Trophy Card', '1/1 holy grail'],
    },
    {
      tier: 'Ultra',
      chance: '15%',
      examples: ['Chase-grade slab', 'PSA 9+ vintage holo'],
    },
    {
      tier: 'Rare',
      chance: '30%',
      examples: ['Graded card hit', 'Premium rare'],
    },
    {
      tier: 'Common',
      chance: '50%',
      examples: ['High-value standard', 'Base chase card'],
    },
  ],
};

export function getMockPackOdds(pack: Pack): PackOdds {
  const rows = ROWS[pack.category] ?? ROWS.onboarding;
  return {
    rows,
    note: NOTE,
  };
}
