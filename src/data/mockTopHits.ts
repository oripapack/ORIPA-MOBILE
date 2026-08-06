/**
 * 実データ待ち。外部に見せないこと。
 * Rights-safe placeholder for pack-card and pack-detail key-item slots.
 * Replace only with approved inventory data and owned media.
 */
import type { Pack } from './mockPacks';

export type TopHitRarity = 'Unknown';

export type PackTopHit = {
  imageUrl: string;
  name: string;
  rarity: TopHitRarity;
  estValue: string;
  isChase: boolean;
};

const MOCK_ASSET_BLOCKED_TOP_HIT: PackTopHit = {
  imageUrl: '',
  name: 'Inventory item pending',
  rarity: 'Unknown',
  estValue: '—',
  isChase: false,
};

export function getMockPackTopHit(_pack: Pack): PackTopHit {
  return MOCK_ASSET_BLOCKED_TOP_HIT;
}

/** @deprecated Prefer `getMockPackTopHit(pack)`. */
export const mockPackTopHits: Record<string, PackTopHit> = {
  welcome_pack: MOCK_ASSET_BLOCKED_TOP_HIT,
  lucky_mini: MOCK_ASSET_BLOCKED_TOP_HIT,
  ultra_chase: MOCK_ASSET_BLOCKED_TOP_HIT,
};
