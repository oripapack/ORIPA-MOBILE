import type { N2TierState } from '../lib/n2Rarity';

/**
 * MOCK RESULT DATA — 実データ待ち。外部に見せないこと。
 * The opening flow passes its real runtime payload to Result; these pulls
 * remain only for isolated Result-screen review (KNOWN_ISSUES).
 * Card names/values are fabricated placeholders, not content claims (§5-9).
 *
 * Every card ships with tier 'unknown': no card↔tier data structure exists
 * (KNOWN_ISSUES #4), and tiers must never be guessed from names or values.
 * When the backend starts returning tiers, populating `tier` here (or in the
 * real payload) is all it takes for the tags to light up.
 */

export type ResultCard = {
  name: string;
  tier: N2TierState;
  /** Real card art when supplied by the pull payload; omitted renders a neutral placeholder. */
  imageUrl?: string;
  tradeInValuePoints: number;
};

export type ResultPullData = {
  /** Certificate-style pull number, digits only (rendered as "#00412"). */
  pullId: string;
  /** ISO timestamp of the opening (rendered as a JST stamp). */
  pulledAt: string;
  packName: string;
  cards: ResultCard[];
  totalTradeInValuePoints: number;
};

export type MockResultVariant = '1' | '5' | '10' | 'long';

// Same demo imagery the top-hit mock already uses.
const IMG = [
  'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=256&q=80',
] as const;

function card(name: string, tradeInValuePoints: number, i: number): ResultCard {
  return { name, tier: 'unknown', imageUrl: IMG[i % IMG.length], tradeInValuePoints };
}

const FIVE_CARDS: ResultCard[] = [
  card('Mock Card Alpha', 18_240, 0),
  card('Mock Card Beta', 3_600, 1),
  card('Mock Card Gamma', 2_200, 2),
  card('Mock Card Delta', 1_460, 3),
  card('Mock Card Epsilon', 900, 0),
];

export const MOCK_RESULT_PULLS: Record<MockResultVariant, ResultPullData> = {
  '1': {
    pullId: '00409',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: [card('Mock Card Alpha', 18_240, 0)],
    totalTradeInValuePoints: 18_240,
  },
  '5': {
    pullId: '00412',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: FIVE_CARDS,
    totalTradeInValuePoints: 26_400,
  },
  // 10 cards + 6-digit coin total (126,450) in one variant.
  '10': {
    pullId: '00413',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: [
      card('Mock Card 01', 48_000, 0),
      card('Mock Card 02', 26_010, 1),
      card('Mock Card 03', 18_000, 2),
      card('Mock Card 04', 12_000, 3),
      card('Mock Card 05', 8_440, 0),
      card('Mock Card 06', 6_000, 1),
      card('Mock Card 07', 4_000, 2),
      card('Mock Card 08', 2_000, 3),
      card('Mock Card 09', 1_200, 0),
      card('Mock Card 10', 800, 1),
    ],
    totalTradeInValuePoints: 126_450,
  },
  long: {
    pullId: '00414',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack With A Very Long Name',
    cards: [
      card('Mock Card With An Exceptionally Long Display Name For Wrap Checks', 18_240, 0),
      card('Another Deliberately Overlong Mock Card Name', 3_600, 1),
      card('Mock Card Gamma', 2_200, 2),
      card('Mock Card Delta', 1_460, 3),
      card('Mock Card Epsilon', 900, 0),
    ],
    totalTradeInValuePoints: 26_400,
  },
};
