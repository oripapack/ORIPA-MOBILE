import type { RecentPull } from '../types/pack';

// Tier data intentionally absent: feed pulls have no card→tier link yet
// (KNOWN_ISSUES #4/#5), so their tier state is UNKNOWN and the UI renders no
// tier chrome. Do not re-add a card-side rarity field here — the legacy
// 5-value enum collided with the §6 tier names.
export const RECENT_PULLS: RecentPull[] = [
  { id: 'r1', username: 'trainer_alex', card: 'Charizard ex SAR', value: '$649', timeAgo: '2m ago' },
  { id: 'r2', username: 'casey_m', card: 'Umbreon VMAX Alt Art', value: '$380', timeAgo: '5m ago' },
  { id: 'r3', username: 'ryu_tcg', card: 'Iono Full Art Trainer', value: '$22', timeAgo: '9m ago' },
  { id: 'r4', username: 'mika_pulls', card: 'Mew ex Full Art', value: '$55', timeAgo: '12m ago' },
  { id: 'r5', username: 'jake_collector', card: 'Pikachu VMAX Rainbow', value: '$280', timeAgo: '15m ago' },
  { id: 'r6', username: 'sam_r', card: 'Arceus VSTAR Gold', value: '$75', timeAgo: '20m ago' },
];
