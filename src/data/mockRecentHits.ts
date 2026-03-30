/** Demo “live hits” for Home ticker — social excitement / FOMO. */
import type { SocialRarity } from './socialMock';

export type LiveHit = {
  id: string;
  user: string;
  pull: string;
  packTitle: string;
  /** Display value (demo credits ≈ USD-style formatting). */
  value: number;
  rarity: SocialRarity;
};

export const mockLiveHits: LiveHit[] = [
  {
    id: '1',
    user: 'jordan',
    pull: 'PSA 10 Charizard ex',
    packTitle: 'Charizard ex Special Collection',
    value: 8900,
    rarity: 'legendary',
  },
  {
    id: '2',
    user: 'sam_r',
    pull: 'Shanks Leader Alt Art',
    packTitle: 'Leader Alt Art Vault',
    value: 5600,
    rarity: 'epic',
  },
  {
    id: '3',
    user: 'casey_m',
    pull: 'Starlight Rare Accesscode',
    packTitle: 'Starlight Anniversary God Box',
    value: 12000,
    rarity: 'mythic',
  },
  {
    id: '4',
    user: 'mira_tcg',
    pull: 'Umbreon VMAX Alt',
    packTitle: 'Eevee Heroes',
    value: 7200,
    rarity: 'legendary',
  },
  {
    id: '5',
    user: 'devon_p',
    pull: 'Lugia V Alt',
    packTitle: 'Silver Tempest',
    value: 4100,
    rarity: 'epic',
  },
  {
    id: '6',
    user: 'riley_k',
    pull: 'Pikachu Illustrator',
    packTitle: '151 Kanto Collection',
    value: 45000,
    rarity: 'mythic',
  },
];

/** @deprecated use mockLiveHits */
export const mockRecentHits = mockLiveHits;
