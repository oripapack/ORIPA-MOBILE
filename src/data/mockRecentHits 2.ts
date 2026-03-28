/** Demo-only “recent hits” for lobby social proof. */
export type RecentHit = {
  id: string;
  user: string;
  pull: string;
  packTitle: string;
};

export const mockRecentHits: RecentHit[] = [
  { id: '1', user: 'jordan', pull: 'PSA 10 Charizard V', packTitle: 'Pokémon Scarlet & Violet Hit Pack' },
  { id: '2', user: 'sam_r', pull: 'Alt Art Leader', packTitle: 'One Piece Paramount War Pack' },
  { id: '3', user: 'casey_m', pull: 'Starlight Rare', packTitle: 'Yu-Gi-Oh! Battles of Legend Pack' },
];
