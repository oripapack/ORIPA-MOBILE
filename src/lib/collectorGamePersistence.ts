import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLLECTOR_QUESTS, initialQuestProgress } from '../data/collectorQuests';

const STORAGE_PREFIX = '@pullhub/collector_game_v1:';

export type PersistedCollectorGame = {
  streakDays: number;
  streakBest: number;
  lastStreakYmd: string | null;
  questWeekKey: string;
  lastDailyYmd: string | null;
  questProgress: Record<string, { progress: number; claimed: boolean }>;
};

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/** Local calendar YYYY-MM-DD */
export function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function ymdAddDays(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return localYmd(dt);
}

/** Monday local date as week key — weekly quests reset when this changes. */
export function currentQuestWeekKey(d = new Date()): string {
  const copy = new Date(d.getTime());
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return localYmd(copy);
}

function mergeQuestTemplate(
  stored: Record<string, { progress: number; claimed: boolean }> | undefined,
): Record<string, { progress: number; claimed: boolean }> {
  const base = initialQuestProgress();
  if (!stored) return base;
  for (const q of COLLECTOR_QUESTS) {
    const row = stored[q.id];
    if (row) base[q.id] = { progress: row.progress, claimed: row.claimed };
  }
  return base;
}

export async function loadCollectorGame(userId: string): Promise<PersistedCollectorGame | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedCollectorGame;
    return {
      streakDays: typeof p.streakDays === 'number' ? p.streakDays : 0,
      streakBest: typeof p.streakBest === 'number' ? p.streakBest : 0,
      lastStreakYmd: p.lastStreakYmd ?? null,
      questWeekKey: typeof p.questWeekKey === 'string' ? p.questWeekKey : currentQuestWeekKey(),
      lastDailyYmd: p.lastDailyYmd ?? null,
      questProgress: mergeQuestTemplate(p.questProgress),
    };
  } catch {
    return null;
  }
}

export async function saveCollectorGame(userId: string, state: PersistedCollectorGame): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
