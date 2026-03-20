export interface Pull {
  id: string;
  packId: string;
  packTitle: string;
  result: string;
  creditsWon: number;
  timestamp: Date;
}

export interface UserState {
  id: string;
  displayName: string;
  memberId: string;
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
  memberId: 'TCG-002891',
  credits: 1250,
  tier: 'Starter',
  xp: 4200,
  xpToNextTier: 100000,
  isVerified: false,
  pullHistory: [
    {
      id: 'p1',
      packId: '2',
      packTitle: 'Pokémon Scarlet & Violet Hit Pack',
      result: 'Charizard ex Full Art',
      creditsWon: 850,
      timestamp: new Date('2026-03-19T14:22:00'),
    },
    {
      id: 'p2',
      packId: '6',
      packTitle: 'Hot Drop Mystery Pack',
      result: 'Pikachu VMAX Rainbow',
      creditsWon: 320,
      timestamp: new Date('2026-03-18T09:11:00'),
    },
    {
      id: 'p3',
      packId: '1',
      packTitle: 'New User Welcome Pack',
      result: 'Bonus Pack + Holo',
      creditsWon: 420,
      timestamp: new Date('2026-03-17T20:45:00'),
    },
  ],
};
