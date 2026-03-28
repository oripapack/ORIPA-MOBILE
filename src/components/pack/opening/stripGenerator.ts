import type { HomeNicheCategory } from '../../../data/mockPacks';
import type { RevealCard } from './types';
import { randomFillerCard } from './mockRevealCards';

export type CsgoStrip = {
  strip: RevealCard[];
  winIndex: number;
};

/**
 * Builds a horizontal strip with weighted filler cards and a fixed winning index.
 */
export function buildCsgoStrip(
  winning: RevealCard,
  sessionSalt: number,
  prizeLine: HomeNicheCategory = 'pokemon',
): CsgoStrip {
  const len = 44 + (sessionSalt % 13);
  const winIndex = 26 + (sessionSalt % 11);
  const strip: RevealCard[] = [];

  for (let i = 0; i < len; i++) {
    if (i === winIndex) {
      strip.push({ ...winning });
    } else {
      strip.push(randomFillerCard(sessionSalt * 31 + i * 17, prizeLine));
    }
  }

  return { strip, winIndex };
}
