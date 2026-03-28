/**
 * Demo-only social / collector profiles. Replace with API later.
 * Kept separate from gameplay `Pull` types for clarity.
 */

import type { Pull, PullRarityTier, UserState } from './mockUser';
import type { FriendEntry } from './friends';

/** Display rarity for social cards (includes uncommon for flavor). */
export type SocialRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface SocialPullEvent {
  id: string;
  cardName: string;
  /** Optional remote art — falls back to placeholder UI if missing. */
  imageUrl?: string;
  rarity: SocialRarity;
  estimatedValue: number;
  packTitle: string;
  timestamp: Date;
  badge?: 'hit' | 'chase';
}

export interface RarityBreakdown {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

export interface ProfileStats {
  packsOpened: number;
  totalEstimatedValue: number;
  bestPullValue: number;
  bestPullCardName: string;
  chaseHits: number;
  averagePullValue: number;
  favoritePackTitle: string;
  mostOpenedPackTitle: string;
  rarityBreakdown: RarityBreakdown;
}

export interface SocialUserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarEmoji: string;
  joinDateIso: string;
  status?: string;
  stats: ProfileStats;
  recentPulls: SocialPullEvent[];
  luckScore: number;
}

export type LeaderboardMetric =
  | 'totalValue'
  | 'biggestPull'
  | 'packsOpened'
  | 'chaseHits'
  | 'luckScore';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatarEmoji: string;
  /** Primary value for the active metric (formatted in UI). */
  value: number;
  isCurrentUser: boolean;
}

export interface ActivityHighlight {
  id: string;
  text: string;
  emoji: string;
}

function tierToSocial(t?: PullRarityTier): SocialRarity {
  if (!t) return 'rare';
  const m: Record<PullRarityTier, SocialRarity> = {
    common: 'common',
    rare: 'rare',
    epic: 'epic',
    legendary: 'legendary',
    mythic: 'mythic',
  };
  return m[t];
}

function breakdownFromPulls(pulls: SocialPullEvent[]): RarityBreakdown {
  const z: RarityBreakdown = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  for (const p of pulls) {
    z[p.rarity] += 1;
  }
  return z;
}

/** Simple 0–100 luck: value per pack, capped. */
export function computeLuckScore(stats: ProfileStats): number {
  if (stats.packsOpened <= 0) return 50;
  const ratio = stats.totalEstimatedValue / stats.packsOpened / 500;
  return Math.min(100, Math.max(12, Math.round(35 + ratio * 45)));
}

export function pullToSocialEvent(p: Pull, idx: number): SocialPullEvent {
  const rarity = tierToSocial(p.tier);
  const badge: 'hit' | 'chase' | undefined =
    p.creditsWon >= 600 ? 'chase' : p.creditsWon >= 300 ? 'hit' : undefined;
  return {
    id: p.id,
    cardName: p.result,
    rarity,
    estimatedValue: p.creditsWon,
    packTitle: p.packTitle,
    timestamp: p.timestamp instanceof Date ? p.timestamp : new Date(p.timestamp),
    badge,
  };
}

export function deriveSocialProfileFromUser(user: UserState): SocialUserProfile {
  const pulls = user.pullHistory.map((p, i) => pullToSocialEvent(p, i));
  const total = pulls.reduce((s, p) => s + p.estimatedValue, 0);
  const packsOpened = pulls.length;
  const best = pulls.reduce((a, b) => (a.estimatedValue >= b.estimatedValue ? a : b), pulls[0]);
  const chaseHits = pulls.filter((p) => p.badge === 'chase').length;
  const avg = packsOpened ? Math.round(total / packsOpened) : 0;
  const packCounts: Record<string, number> = {};
  for (const p of pulls) {
    packCounts[p.packTitle] = (packCounts[p.packTitle] ?? 0) + 1;
  }
  const mostOpened = Object.entries(packCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const stats: ProfileStats = {
    packsOpened,
    totalEstimatedValue: total,
    bestPullValue: best?.estimatedValue ?? 0,
    bestPullCardName: best?.cardName ?? '—',
    chaseHits,
    averagePullValue: avg,
    favoritePackTitle: mostOpened,
    mostOpenedPackTitle: mostOpened,
    rarityBreakdown: breakdownFromPulls(pulls),
  };
  const luckScore = computeLuckScore(stats);
  return {
    username: user.username,
    displayName: user.displayName,
    bio: 'Chasing hits & building the binder. PullHub demo profile.',
    avatarEmoji: '🎴',
    joinDateIso: '2025-11-01T12:00:00.000Z',
    status: 'Opening packs',
    stats,
    recentPulls: pulls.slice(0, 8),
    luckScore,
  };
}

const JORDAN: SocialUserProfile = {
  username: 'jordan',
  displayName: 'Jordan K.',
  bio: 'Full-art hunter · JP promos · late-night rips.',
  avatarEmoji: '🔥',
  joinDateIso: '2025-08-12T10:00:00.000Z',
  status: 'Hunting Charizards',
  stats: {
    packsOpened: 142,
    totalEstimatedValue: 186_400,
    bestPullValue: 12_500,
    bestPullCardName: 'Umbreon VMAX Alt Art',
    chaseHits: 9,
    averagePullValue: 1312,
    favoritePackTitle: 'Prismatic Evolutions Elite',
    mostOpenedPackTitle: 'Crown Zenith Galarian Gallery',
    rarityBreakdown: { common: 12, uncommon: 28, rare: 44, epic: 32, legendary: 18, mythic: 8 },
  },
  recentPulls: [
    {
      id: 'j1',
      cardName: 'Rayquaza V Alt',
      rarity: 'legendary',
      estimatedValue: 8900,
      packTitle: 'Prismatic Evolutions Elite',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      badge: 'chase',
    },
    {
      id: 'j2',
      cardName: 'Mew VMAX',
      rarity: 'epic',
      estimatedValue: 2100,
      packTitle: 'Crown Zenith Galarian Gallery',
      timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
      badge: 'hit',
    },
    {
      id: 'j3',
      cardName: 'Trainer Gallery',
      rarity: 'rare',
      estimatedValue: 420,
      packTitle: 'Scarlet & Violet Booster Hits',
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
  ],
  luckScore: 88,
};

const SAM: SocialUserProfile = {
  username: 'sam_r',
  displayName: 'Sam R.',
  bio: 'Budget rips · best hit: $4k · always chasing.',
  avatarEmoji: '⚡',
  joinDateIso: '2025-09-01T15:30:00.000Z',
  status: 'In queue for drops',
  stats: {
    packsOpened: 89,
    totalEstimatedValue: 92_100,
    bestPullValue: 8200,
    bestPullCardName: 'Lugia V Alt',
    chaseHits: 4,
    averagePullValue: 1035,
    favoritePackTitle: 'Obsidian Flames Premium',
    mostOpenedPackTitle: 'Paldea Evolved Chase',
    rarityBreakdown: { common: 10, uncommon: 18, rare: 30, epic: 20, legendary: 9, mythic: 2 },
  },
  recentPulls: [
    {
      id: 's1',
      cardName: 'Gardevoir ex',
      rarity: 'legendary',
      estimatedValue: 5600,
      packTitle: 'Obsidian Flames',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      badge: 'chase',
    },
    {
      id: 's2',
      cardName: 'Iono',
      rarity: 'epic',
      estimatedValue: 1800,
      packTitle: 'Paldea Evolved Chase',
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
      badge: 'hit',
    },
  ],
  luckScore: 72,
};

const CASEY: SocialUserProfile = {
  username: 'casey_m',
  displayName: 'Casey M.',
  bio: 'Sealed sometimes · mostly singles · luck goblin.',
  avatarEmoji: '✨',
  joinDateIso: '2025-10-05T08:00:00.000Z',
  status: 'AFK — grading',
  stats: {
    packsOpened: 56,
    totalEstimatedValue: 201_200,
    bestPullValue: 45_000,
    bestPullCardName: 'Pikachu Illustrator Proxy',
    chaseHits: 3,
    averagePullValue: 3593,
    favoritePackTitle: '151 Kanto Collection',
    mostOpenedPackTitle: '151 Kanto Collection',
    rarityBreakdown: { common: 6, uncommon: 10, rare: 14, epic: 12, legendary: 10, mythic: 4 },
  },
  recentPulls: [
    {
      id: 'c1',
      cardName: 'Charizard ex Special',
      rarity: 'mythic',
      estimatedValue: 12000,
      packTitle: 'Obsidian Flames Premium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      badge: 'chase',
    },
    {
      id: 'c2',
      cardName: 'Wugtrio',
      rarity: 'uncommon',
      estimatedValue: 40,
      packTitle: 'Scarlet & Violet Booster Hits',
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
  ],
  luckScore: 94,
};

export const MOCK_SOCIAL_PROFILES: Record<string, SocialUserProfile> = {
  jordan: JORDAN,
  sam_r: SAM,
  casey_m: CASEY,
};

export function getSocialProfile(username: string): SocialUserProfile | null {
  const u = username.trim().toLowerCase();
  return MOCK_SOCIAL_PROFILES[u] ?? null;
}

/** When a friend exists but has no rich mock row yet (demo fallback). */
export function buildMinimalSocialProfile(entry: FriendEntry): SocialUserProfile {
  return {
    username: entry.username,
    displayName: entry.displayName,
    bio: 'Demo profile — connect the API to sync full stats.',
    avatarEmoji: '🎴',
    joinDateIso: new Date(entry.addedAt).toISOString(),
    status: 'Collector',
    stats: {
      packsOpened: 24,
      totalEstimatedValue: 8200,
      bestPullValue: 1200,
      bestPullCardName: 'Placeholder hit',
      chaseHits: 1,
      averagePullValue: 340,
      favoritePackTitle: 'Demo pack',
      mostOpenedPackTitle: 'Demo pack',
      rarityBreakdown: { common: 4, uncommon: 6, rare: 8, epic: 4, legendary: 2, mythic: 0 },
    },
    recentPulls: [
      {
        id: `ph_${entry.username}`,
        cardName: 'Placeholder rare',
        rarity: 'rare',
        estimatedValue: 180,
        packTitle: 'Demo pack',
        timestamp: new Date(entry.addedAt),
      },
    ],
    luckScore: 58,
  };
}

export function getActivityHighlights(profile: SocialUserProfile): ActivityHighlight[] {
  const best = profile.stats.bestPullCardName;
  return [
    {
      id: 'a1',
      emoji: '🎯',
      text: `${profile.displayName.split(' ')[0]}’s best hit: ${best}`,
    },
    {
      id: 'a2',
      emoji: '📦',
      text: `${profile.stats.packsOpened} packs opened · $${(profile.stats.totalEstimatedValue / 1000).toFixed(0)}k est. value`,
    },
    {
      id: 'a3',
      emoji: '🍀',
      text: `Luck score ${profile.luckScore} · ${profile.stats.chaseHits} chase pulls`,
    },
  ];
}

export function metricValue(profile: SocialUserProfile, metric: LeaderboardMetric): number {
  const { stats } = profile;
  switch (metric) {
    case 'totalValue':
      return stats.totalEstimatedValue;
    case 'biggestPull':
      return stats.bestPullValue;
    case 'packsOpened':
      return stats.packsOpened;
    case 'chaseHits':
      return stats.chaseHits;
    case 'luckScore':
      return profile.luckScore;
    default:
      return 0;
  }
}

/** Merged, time-sorted feed of friends’ recent pulls (demo data from `SocialUserProfile.recentPulls`). */
export interface FriendActivityFeedItem {
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  cardName: string;
  rarity: SocialRarity;
  estimatedValue: number;
  packTitle: string;
  timestamp: Date;
}

export function buildFriendsRecentActivity(friends: FriendEntry[], limit = 24): FriendActivityFeedItem[] {
  const out: FriendActivityFeedItem[] = [];
  for (const f of friends) {
    const profile = getSocialProfile(f.username) ?? buildMinimalSocialProfile(f);
    for (const pull of profile.recentPulls) {
      out.push({
        id: `${f.username}_${pull.id}`,
        username: f.username,
        displayName: profile.displayName,
        avatarEmoji: profile.avatarEmoji,
        cardName: pull.cardName,
        rarity: pull.rarity,
        estimatedValue: pull.estimatedValue,
        packTitle: pull.packTitle,
        timestamp: pull.timestamp instanceof Date ? pull.timestamp : new Date(pull.timestamp),
      });
    }
  }
  out.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return out.slice(0, limit);
}

export function buildLeaderboard(
  metric: LeaderboardMetric,
  currentUsername: string,
  meProfile: SocialUserProfile,
  friends: FriendEntry[],
): LeaderboardEntry[] {
  const rows: LeaderboardEntry[] = [];
  const seen = new Set<string>();
  const meLower = currentUsername.trim().toLowerCase();

  const pushProfile = (profile: SocialUserProfile) => {
    const u = profile.username.toLowerCase();
    if (seen.has(u)) return;
    seen.add(u);
    rows.push({
      rank: 0,
      username: profile.username,
      displayName: profile.displayName,
      avatarEmoji: profile.avatarEmoji,
      value: metricValue(profile, metric),
      isCurrentUser: false,
    });
  };

  pushProfile(meProfile);

  for (const f of friends) {
    const p = getSocialProfile(f.username) ?? buildMinimalSocialProfile(f);
    pushProfile(p);
  }

  rows.sort((a, b) => b.value - a.value);
  rows.forEach((r, i) => {
    r.rank = i + 1;
    r.isCurrentUser = r.username.toLowerCase() === meLower;
  });
  return rows;
}

export type CompareRow = {
  key: string;
  label: string;
  me: number | string;
  them: number | string;
  winner: 'me' | 'them' | 'tie';
};

export function buildCompareRows(me: SocialUserProfile, them: SocialUserProfile): CompareRow[] {
  const a = me.stats;
  const b = them.stats;
  const num = (x: number, y: number): CompareRow['winner'] =>
    x > y ? 'me' : x < y ? 'them' : 'tie';

  return [
    {
      key: 'packs',
      label: 'Packs opened',
      me: a.packsOpened,
      them: b.packsOpened,
      winner: num(a.packsOpened, b.packsOpened),
    },
    {
      key: 'value',
      label: 'Total est. value',
      me: a.totalEstimatedValue,
      them: b.totalEstimatedValue,
      winner: num(a.totalEstimatedValue, b.totalEstimatedValue),
    },
    {
      key: 'best',
      label: 'Best single pull',
      me: a.bestPullValue,
      them: b.bestPullValue,
      winner: num(a.bestPullValue, b.bestPullValue),
    },
    {
      key: 'chase',
      label: 'Chase hits',
      me: a.chaseHits,
      them: b.chaseHits,
      winner: num(a.chaseHits, b.chaseHits),
    },
    {
      key: 'avg',
      label: 'Avg pull value',
      me: a.averagePullValue,
      them: b.averagePullValue,
      winner: num(a.averagePullValue, b.averagePullValue),
    },
    {
      key: 'luck',
      label: 'Luck score',
      me: me.luckScore,
      them: them.luckScore,
      winner: num(me.luckScore, them.luckScore),
    },
  ];
}

/** Demo accounts shown in “browse” add flow (subset of profiles + display). */
export const DEMO_DISCOVERABLE_USERS: { username: string; displayName: string; blurb: string }[] = [
  { username: 'jordan', displayName: 'Jordan K.', blurb: 'Alt-art hunter' },
  { username: 'sam_r', displayName: 'Sam R.', blurb: 'Budget rips' },
  { username: 'casey_m', displayName: 'Casey M.', blurb: 'Biggest single hit' },
];
