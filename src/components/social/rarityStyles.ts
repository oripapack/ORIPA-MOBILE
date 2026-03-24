import { colors } from '../../tokens/colors';
import type { SocialRarity } from '../../data/socialMock';

export function rarityColor(r: SocialRarity): string {
  const map: Record<SocialRarity, string> = {
    common: '#6B7280',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
    mythic: colors.red,
  };
  return map[r];
}

export function rarityLabel(r: SocialRarity): string {
  return r.charAt(0).toUpperCase() + r.slice(1);
}
