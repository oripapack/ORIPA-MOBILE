import type { N2TierState } from '../lib/n2Rarity';

/**
 * MOCK RESULT DATA — review / EXPO_PUBLIC_DEV_SCREEN=Result only.
 * Live opens navigate to Result with `buildResultPullData` from the session.
 * Card names/values here are fabricated placeholders, not content claims (§5-9).
 *
 * Every card ships with tier 'unknown': no card↔tier data structure exists
 * (KNOWN_ISSUES #4), and tiers must never be guessed from names or values.
 * Live payloads set `tier` from the roll when available.
 */

export type ResultCard = {
  name: string;
  tier: N2TierState;
  imageUrl: string;
  listedValueUsd: number;
};

export type ResultPullData = {
  /** Certificate-style pull number, digits only (rendered as "#00412"). */
  pullId: string;
  /** ISO timestamp of the opening (rendered as a JST stamp). */
  pulledAt: string;
  packName: string;
  cards: ResultCard[];
  totalListedValueUsd: number;
};

export type MockResultVariant = '1' | '5' | '10' | 'long';

// Same demo imagery the top-hit mock already uses.
const IMG = [
  'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=256&q=80',
] as const;

function card(name: string, listedValueUsd: number, i: number): ResultCard {
  return { name, tier: 'unknown', imageUrl: IMG[i % IMG.length], listedValueUsd };
}

const FIVE_CARDS: ResultCard[] = [
  card('Mock Card Alpha', 182.4, 0),
  card('Mock Card Beta', 36, 1),
  card('Mock Card Gamma', 22, 2),
  card('Mock Card Delta', 14.6, 3),
  card('Mock Card Epsilon', 9, 0),
];

export const MOCK_RESULT_PULLS: Record<MockResultVariant, ResultPullData> = {
  '1': {
    pullId: '00409',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: [card('Mock Card Alpha', 182.4, 0)],
    totalListedValueUsd: 182.4,
  },
  '5': {
    pullId: '00412',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: FIVE_CARDS,
    totalListedValueUsd: 264,
  },
  // 10 cards + 6-digit coin total (126,450) in one variant.
  '10': {
    pullId: '00413',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack',
    cards: [
      card('Mock Card 01', 480, 0),
      card('Mock Card 02', 260.1, 1),
      card('Mock Card 03', 180, 2),
      card('Mock Card 04', 120, 3),
      card('Mock Card 05', 84.4, 0),
      card('Mock Card 06', 60, 1),
      card('Mock Card 07', 40, 2),
      card('Mock Card 08', 20, 3),
      card('Mock Card 09', 12, 0),
      card('Mock Card 10', 8, 1),
    ],
    totalListedValueUsd: 1264.5,
  },
  long: {
    pullId: '00414',
    pulledAt: '2026-07-27T05:32:00Z',
    packName: 'Mock Premium Pack With A Very Long Name',
    cards: [
      card('Mock Card With An Exceptionally Long Display Name For Wrap Checks', 182.4, 0),
      card('Another Deliberately Overlong Mock Card Name', 36, 1),
      card('Mock Card Gamma', 22, 2),
      card('Mock Card Delta', 14.6, 3),
      card('Mock Card Epsilon', 9, 0),
    ],
    totalListedValueUsd: 264,
  },
};
