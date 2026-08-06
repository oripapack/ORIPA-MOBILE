import type { N2TierState } from '../lib/n2Rarity';

/**
 * MOCK RESULT DATA — 実データ待ち。外部に見せないこと。
 * The Result screen is not wired to the opening flow yet (Yutaka domain);
 * these pulls exist only so the screen can be reviewed (KNOWN_ISSUES).
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

// Rights-cleared inventory media is blocked; the UI renders AssetBlockedCard.
const IMG = [''] as const;

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
  // 10 cards + a four-digit listed-value total in one layout-stress variant.
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
