import { sg } from '../../tokens/sg';
import type { SocialRarity } from '../../data/socialMock';

export function rarityColor(r: SocialRarity): string {
  const map: Record<SocialRarity, string> = {
    common: sg.muted,
    uncommon: sg.muted,
    rare: sg.text,
    epic: sg.gold,
    legendary: sg.goldHi,
    mythic: sg.neon,
  };
  return map[r];
}

export function rarityLabel(r: SocialRarity): string {
  return r.charAt(0).toUpperCase() + r.slice(1);
}
