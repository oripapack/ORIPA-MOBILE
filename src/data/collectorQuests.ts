export type CollectorQuestKind = 'weekly' | 'daily';

export type CollectorQuestTrack =
  | 'pack_opens'
  | 'vault_secured'
  | 'vault_convert'
  | 'friends_added'
  | 'daily_login';

export type CollectorQuestDef = {
  id: string;
  /** i18n: `quests.<key>.title` / `desc` */
  titleKey: string;
  kind: CollectorQuestKind;
  target: number;
  xpReward: number;
  track: CollectorQuestTrack;
};

/**
 * Premium-collector tone: light goals, not grind. Weekly reset by calendar week key.
 */
export const COLLECTOR_QUESTS: CollectorQuestDef[] = [
  {
    id: 'daily_collector_log',
    titleKey: 'daily_collector_log',
    kind: 'daily',
    target: 1,
    xpReward: 35,
    track: 'daily_login',
  },
  {
    id: 'weekly_open_packs',
    titleKey: 'weekly_open_packs',
    kind: 'weekly',
    target: 5,
    xpReward: 120,
    track: 'pack_opens',
  },
  {
    id: 'weekly_secure_vault',
    titleKey: 'weekly_secure_vault',
    kind: 'weekly',
    target: 2,
    xpReward: 100,
    track: 'vault_secured',
  },
  {
    id: 'weekly_convert',
    titleKey: 'weekly_convert',
    kind: 'weekly',
    target: 1,
    xpReward: 75,
    track: 'vault_convert',
  },
  {
    id: 'weekly_add_friend',
    titleKey: 'weekly_add_friend',
    kind: 'weekly',
    target: 1,
    xpReward: 90,
    track: 'friends_added',
  },
];

export function initialQuestProgress(): Record<string, { progress: number; claimed: boolean }> {
  const o: Record<string, { progress: number; claimed: boolean }> = {};
  for (const q of COLLECTOR_QUESTS) {
    o[q.id] = { progress: 0, claimed: false };
  }
  return o;
}
