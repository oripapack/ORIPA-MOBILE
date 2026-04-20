import type { Pull } from '../data/mockUser';
import type { UserState } from '../data/mockUser';
import { normalizeFriendUsername } from '../data/friends';
import { getSocialProfile, buildMinimalSocialProfile } from '../data/socialMock';
import type { FriendEntry } from '../data/friends';
import { VAULT_HOLD_DAYS } from './vaultConstants';

function vaultExpiry(): Date {
  const exp = new Date();
  exp.setDate(exp.getDate() + VAULT_HOLD_DAYS);
  return exp;
}

function makeVaultPull(p: Omit<Pull, 'fulfillment' | 'vaultExpiresAt' | 'vaultHoldDays'>): Pull {
  return {
    ...p,
    fulfillment: 'vaulted',
    vaultExpiresAt: vaultExpiry(),
    vaultHoldDays: VAULT_HOLD_DAYS,
  };
}

/**
 * Demo NPC vaulted inventory — every item is discoverable; listings are keyed separately in the shop.
 * Pull ids must match `PublicVaultListing.pullId` where listed.
 */
const MOCK_VAULT_BY_USER: Record<string, Pull[]> = {
  sam_r: [
    makeVaultPull({
      id: 'pull_demo_sam_1',
      packId: '6',
      packTitle: 'Crown Zenith Galarian Gallery',
      result: 'VSTAR Universe promo',
      creditsWon: 4200,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tier: 'epic',
    }),
    makeVaultPull({
      id: 'pull_demo_sam_2',
      packId: '3',
      packTitle: 'Paldea Evolved Chase',
      result: 'Trainer gallery rare',
      creditsWon: 1800,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tier: 'rare',
    }),
    makeVaultPull({
      id: 'pull_sam_v_3',
      packId: '2',
      packTitle: 'Scarlet & Violet Booster Hits',
      result: 'Gardevoir ex (binder copy)',
      creditsWon: 5600,
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      tier: 'legendary',
    }),
    makeVaultPull({
      id: 'pull_sam_v_4',
      packId: '1',
      packTitle: 'Paldea Beginner Commons',
      result: 'Illustration rare energy',
      creditsWon: 320,
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      tier: 'rare',
    }),
  ],
  casey_m: [
    makeVaultPull({
      id: 'pull_demo_casey_1',
      packId: '4',
      packTitle: 'Obsidian Flames Premium',
      result: 'Charizard ex SAR',
      creditsWon: 12000,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tier: 'legendary',
    }),
    makeVaultPull({
      id: 'pull_casey_v_2',
      packId: '6',
      packTitle: 'Crown Zenith Galarian Gallery',
      result: 'Raikou V alt',
      creditsWon: 4800,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      tier: 'epic',
    }),
    makeVaultPull({
      id: 'pull_casey_v_3',
      packId: '2',
      packTitle: 'Scarlet & Violet Booster Hits',
      result: 'Penny SAR',
      creditsWon: 2100,
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      tier: 'epic',
    }),
  ],
  jordan: [
    makeVaultPull({
      id: 'pull_jordan_v_1',
      packId: '4',
      packTitle: 'Prismatic Evolutions Elite',
      result: 'Espeon ex special',
      creditsWon: 3200,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tier: 'epic',
    }),
    makeVaultPull({
      id: 'pull_jordan_v_2',
      packId: '6',
      packTitle: 'Crown Zenith Galarian Gallery',
      result: 'Leafeon VSTAR',
      creditsWon: 900,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      tier: 'rare',
    }),
    makeVaultPull({
      id: 'pull_jordan_v_3',
      packId: '2',
      packTitle: 'Scarlet & Violet Booster Hits',
      result: 'Miraidon ex',
      creditsWon: 1800,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tier: 'rare',
    }),
  ],
};

function pullsFromRecentSocial(username: string): Pull[] {
  const profile = getSocialProfile(username) ?? null;
  if (!profile) return [];
  return profile.recentPulls.slice(0, 5).map((ev, i) =>
    makeVaultPull({
      id: `vault_syn_${username}_${ev.id}`,
      packId: '1',
      packTitle: ev.packTitle,
      result: ev.cardName,
      creditsWon: ev.estimatedValue,
      timestamp: ev.timestamp,
      tier: ev.rarity === 'uncommon' ? 'rare' : ev.rarity === 'mythic' ? 'mythic' : ev.rarity,
    }),
  );
}

/**
 * All vaulted items discoverable for a friend profile (self = current user's real Vault rows).
 */
export function getFriendVaultShowcasePulls(opts: {
  username: string;
  isSelf: boolean;
  user: UserState;
  friendEntry?: FriendEntry | null;
}): Pull[] {
  const u = normalizeFriendUsername(opts.username);
  if (opts.isSelf) {
    return opts.user.pullHistory.filter((p) => p.fulfillment === 'vaulted');
  }
  const mock = MOCK_VAULT_BY_USER[u];
  if (mock?.length) return mock;
  if (opts.friendEntry) {
    const minimal = buildMinimalSocialProfile(opts.friendEntry);
    return pullsFromRecentSocial(minimal.username);
  }
  const profile = getSocialProfile(u);
  if (profile) return pullsFromRecentSocial(profile.username);
  return [];
}
