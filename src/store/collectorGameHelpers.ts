import { COLLECTOR_QUESTS, type CollectorQuestTrack } from '../data/collectorQuests';

export function bumpQuestTrack(
  progress: Record<string, { progress: number; claimed: boolean }>,
  track: CollectorQuestTrack,
  delta: number,
): Record<string, { progress: number; claimed: boolean }> {
  if (delta <= 0) return progress;
  const next = { ...progress };
  for (const q of COLLECTOR_QUESTS) {
    if (q.track !== track) continue;
    const row = next[q.id] ?? { progress: 0, claimed: false };
    if (row.claimed) continue;
    next[q.id] = {
      progress: Math.min(q.target, row.progress + delta),
      claimed: row.claimed,
    };
  }
  return next;
}
