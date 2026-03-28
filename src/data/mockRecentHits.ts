/** Demo-only “recent hits” for lobby social proof. */
export type RecentHit = {
  id: string;
  user: string;
  pull: string;
  packTitle: string;
};

export const mockRecentHits: RecentHit[] = [
  { id: '1', user: 'jordan', pull: 'PSA 10 Charizard ex', packTitle: 'Charizard ex Special Collection' },
  { id: '2', user: 'sam_r', pull: 'Shanks Leader Alt Art', packTitle: 'Leader Alt Art Vault' },
  { id: '3', user: 'casey_m', pull: 'Starlight Rare Accesscode', packTitle: 'Starlight Anniversary God Box' },
];
