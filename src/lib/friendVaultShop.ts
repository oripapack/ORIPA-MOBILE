import type { PullRarityTier } from '../data/mockUser';

/** A hit visible on a friend’s public Vault shop — coins-only purchase (demo: local store). */
export type PublicVaultListing = {
  id: string;
  sellerUsername: string;
  /** Seller’s pull id when listed from a real Vault row; synthetic for demo NPC rows. */
  pullId: string;
  priceCredits: number;
  result: string;
  packTitle: string;
  packId: string;
  tier?: PullRarityTier;
  /** When true, purchase only clones into buyer’s Vault — no seller `pullHistory` row exists locally. */
  isDemo?: boolean;
};

export function listingIdForPull(pullId: string): string {
  return `listing_${pullId}`;
}

/** Demo friend storefronts — merge with live listings under the same username in the store. */
export function createInitialFriendVaultShop(): Record<string, PublicVaultListing[]> {
  return {
    sam_r: [
      {
        id: 'listing_demo_sam_1',
        sellerUsername: 'sam_r',
        pullId: 'pull_demo_sam_1',
        priceCredits: 420,
        result: 'VSTAR Universe promo',
        packTitle: 'Crown Zenith Galarian Gallery',
        packId: '6',
        tier: 'epic',
        isDemo: true,
      },
      {
        id: 'listing_demo_sam_2',
        sellerUsername: 'sam_r',
        pullId: 'pull_demo_sam_2',
        priceCredits: 180,
        result: 'Trainer gallery rare',
        packTitle: 'Paldea Evolved Chase',
        packId: '3',
        tier: 'rare',
        isDemo: true,
      },
    ],
    casey_m: [
      {
        id: 'listing_demo_casey_1',
        sellerUsername: 'casey_m',
        pullId: 'pull_demo_casey_1',
        priceCredits: 650,
        result: 'Charizard ex SAR',
        packTitle: 'Obsidian Flames Premium',
        packId: '4',
        tier: 'legendary',
        isDemo: true,
      },
    ],
  };
}

export function removeListingsForPullId(
  shop: Record<string, PublicVaultListing[]>,
  sellerUsername: string,
  pullId: string,
): Record<string, PublicVaultListing[]> {
  const u = sellerUsername.trim().toLowerCase();
  const rows = shop[u];
  if (!rows?.length) return shop;
  const next = rows.filter((l) => l.pullId !== pullId);
  if (next.length === rows.length) return shop;
  return { ...shop, [u]: next };
}
