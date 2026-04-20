import { COLLECTOR_QUESTS, type CollectorQuestDef } from '../data/collectorQuests';

type ProgressMap = Record<string, { progress: number; claimed: boolean }>;

/** Surface claimable quests first, then closest incomplete, for profile snapshot (2–3 rows). */
export function pickPreviewQuests(progress: ProgressMap, limit: number): CollectorQuestDef[] {
  type Enriched = { def: CollectorQuestDef; score: number };
  const enriched: Enriched[] = COLLECTOR_QUESTS.map((def) => {
    const row = progress[def.id] ?? { progress: 0, claimed: false };
    const done = row.progress >= def.target;
    const claimable = done && !row.claimed;
    const pct = def.target > 0 ? row.progress / def.target : 0;
    let score = 0;
    if (claimable) score = 300 + pct;
    else if (!row.claimed && !done) score = 100 + pct;
    else score = pct * 0.05;
    return { def, score };
  });
  enriched.sort((a, b) => b.score - a.score);
  return enriched.slice(0, limit).map((e) => e.def);
}

export function countClaimableQuests(progress: ProgressMap): number {
  return COLLECTOR_QUESTS.filter((def) => {
    const row = progress[def.id];
    if (!row) return false;
    return row.progress >= def.target && !row.claimed;
  }).length;
}
