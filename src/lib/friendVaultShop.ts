// 実データ待ち。外部に見せないこと。
import type { PullRarityTier } from '../data/mockUser';

/** Preview Vault Exchange listing. No transaction service is connected. */
export type PublicVaultListing = {
  id: string;
  sellerUsername: string;
  /** Seller’s pull id when listed from a real Vault row; synthetic for demo NPC rows. */
  pullId: string;
  /** Seller’s fixed ask in whole USD. */
  listPriceUsd: number;
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
        listPriceUsd: 99,
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
        listPriceUsd: 49,
        result: 'Trainer Gallery Rare',
        packTitle: 'Paldea Evolved Chase',
        packId: '3',
        tier: 'rare',
        isDemo: true,
      },
      {
        id: 'listing_demo_sam_3',
        sellerUsername: 'sam_r',
        pullId: 'pull_demo_sam_3',
        listPriceUsd: 8,
        result: 'Basic Energy Holo',
        packTitle: 'Lucky Mini',
        packId: 'lucky_mini',
        tier: 'common',
        isDemo: true,
      },
    ],
    casey_m: [
      {
        id: 'listing_demo_casey_1',
        sellerUsername: 'casey_m',
        pullId: 'pull_demo_casey_1',
        listPriceUsd: 649,
        result: 'Charizard ex SAR',
        packTitle: 'Obsidian Flames Premium',
        packId: '4',
        tier: 'legendary',
        isDemo: true,
      },
      {
        id: 'listing_demo_casey_2',
        sellerUsername: 'casey_m',
        pullId: 'pull_demo_casey_2',
        listPriceUsd: 280,
        result: 'Pikachu VMAX Rainbow Rare',
        packTitle: 'Ultra Chase',
        packId: 'ultra_chase',
        tier: 'legendary',
        isDemo: true,
      },
    ],
    ryu_tcg: [
      {
        id: 'listing_demo_ryu_1',
        sellerUsername: 'ryu_tcg',
        pullId: 'pull_demo_ryu_1',
        listPriceUsd: 1200,
        result: 'PSA 10 Charizard Base Set',
        packTitle: 'Ultra Chase',
        packId: 'ultra_chase',
        tier: 'mythic',
        isDemo: true,
      },
      {
        id: 'listing_demo_ryu_2',
        sellerUsername: 'ryu_tcg',
        pullId: 'pull_demo_ryu_2',
        listPriceUsd: 55,
        result: 'Mew ex Full Art',
        packTitle: 'Paldea Evolved Chase',
        packId: '3',
        tier: 'epic',
        isDemo: true,
      },
      {
        id: 'listing_demo_ryu_3',
        sellerUsername: 'ryu_tcg',
        pullId: 'pull_demo_ryu_3',
        listPriceUsd: 22,
        result: 'Iono Full Art',
        packTitle: 'Paldea Evolved Chase',
        packId: '3',
        tier: 'rare',
        isDemo: true,
      },
    ],
    mika_pulls: [
      {
        id: 'listing_demo_mika_1',
        sellerUsername: 'mika_pulls',
        pullId: 'pull_demo_mika_1',
        listPriceUsd: 380,
        result: 'Umbreon VMAX Alt Art',
        packTitle: 'Evolving Skies Premium',
        packId: '5',
        tier: 'legendary',
        isDemo: true,
      },
      {
        id: 'listing_demo_mika_2',
        sellerUsername: 'mika_pulls',
        pullId: 'pull_demo_mika_2',
        listPriceUsd: 18,
        result: 'Lucario V Full Art',
        packTitle: 'Crown Zenith Galarian Gallery',
        packId: '6',
        tier: 'rare',
        isDemo: true,
      },
    ],
    alex_vault: [
      {
        id: 'listing_demo_alex_1',
        sellerUsername: 'alex_vault',
        pullId: 'pull_demo_alex_1',
        listPriceUsd: 75,
        result: 'Arceus VSTAR Gold',
        packTitle: 'Crown Zenith Galarian Gallery',
        packId: '6',
        tier: 'epic',
        isDemo: true,
      },
    ],
  };
}

/** Flatten all listings from all users for the card marketplace. */
export function getAllCardMarketListings(
  shopByUser: Record<string, PublicVaultListing[]>,
): PublicVaultListing[] {
  return Object.values(shopByUser).flat();
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
