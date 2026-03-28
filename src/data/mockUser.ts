/** After a pack opens, user must choose ship vs convert — until then, `pending`. */
export type PullFulfillment = 'pending' | 'converted' | 'shipped';

/** Lowest → highest: common (green) … mythic (red). */
export type PullRarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Pull {
  id: string;
  packId: string;
  packTitle: string;
  result: string;
  /** Notional / display value of the hit (can exceed pack price). */
  creditsWon: number;
  timestamp: Date;
  /**
   * Legacy pulls may omit this — treat as already settled for Rewards UI.
   * New pulls start as `pending` until Won Prizes flow completes.
   */
  fulfillment?: PullFulfillment;
  /** Credits added to wallet if user taps “Convert to points” (matches reveal `creditsWon`). */
  convertCreditValue?: number;
  /** From pack opening reveal — for Won Prizes UI. */
  tier?: PullRarityTier;
}

export interface UserState {
  id: string;
  displayName: string;
  /** Public handle — unique; used to add friends (QR / search). */
  username: string;
  /**
   * Promo / referral free opens — consumed before charging credits in `openPack`.
   * Not shown in MVP profile; surfaced via pack flow.
   */
  freePackGrants: number;
  credits: number;
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold';
  xp: number;
  xpToNextTier: number;
  isVerified: boolean;
  pullHistory: Pull[];
}

export const mockUser: UserState = {
  id: 'usr_001',
  displayName: 'TrainerAlex',
  username: 'trainer_alex',
  freePackGrants: 0,
  credits: 1250,
  tier: 'Starter',
  xp: 4200,
  xpToNextTier: 100000,
  isVerified: false,
  pullHistory: [
    {
      id: 'p1',
      packId: '2',
      packTitle: 'Scarlet & Violet Booster Hits',
      result: 'Charizard ex Full Art',
      creditsWon: 850,
      timestamp: new Date('2026-03-19T14:22:00'),
    },
    {
      id: 'p2',
      packId: '6',
      packTitle: 'Crown Zenith Galarian Gallery',
      result: 'Arceus VSTAR GG',
      creditsWon: 320,
      timestamp: new Date('2026-03-18T09:11:00'),
    },
    {
      id: 'p3',
      packId: '1',
      packTitle: 'Paldea Beginner Commons',
      result: 'Bonus Pack + Holo',
      creditsWon: 420,
      timestamp: new Date('2026-03-17T20:45:00'),
    },
    {
      id: 'p4',
      packId: '3',
      packTitle: 'Paldea Evolved Chase',
      result: 'Miraidon ex',
      creditsWon: 180,
      timestamp: new Date('2026-03-16T12:00:00'),
    },
  ],
};
