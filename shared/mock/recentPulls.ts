import type { RecentPull } from '../types/pack';

// 実データ待ち。外部に見せないこと。

// Tier data intentionally absent: feed pulls have no card→tier link yet
// (KNOWN_ISSUES #4/#5), so their tier state is UNKNOWN and the UI renders no
// tier chrome. Do not re-add a card-side rarity field here — the legacy
// 5-value enum collided with the §6 tier names.
export const RECENT_PULLS: RecentPull[] = [
  { id: 'r1', username: 'collector_01', card: 'Inventory item pending', value: '—', timeAgo: 'Preview' },
  { id: 'r2', username: 'collector_02', card: 'Inventory item pending', value: '—', timeAgo: 'Preview' },
  { id: 'r3', username: 'collector_03', card: 'Inventory item pending', value: '—', timeAgo: 'Preview' },
];
