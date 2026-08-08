import { sg } from '../../tokens/sg';
import type { SocialRarity } from '../../data/socialMock';

export function rarityColor(r: SocialRarity): string {
  const map: Record<SocialRarity, string> = {
    common: sg.chrome,
    uncommon: sg.success,
    rare: sg.goldHi,
    epic: sg.gold,
    legendary: sg.warning,
    mythic: sg.neon,
  };
  return map[r];
}

export function rarityLabel(r: SocialRarity): string {
  return r.charAt(0).toUpperCase() + r.slice(1);
}
