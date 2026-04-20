import type { Pull, PullFulfillment } from '../data/mockUser';
import type { PublicVaultListing } from './friendVaultShop';

/**
 * How a vaulted item appears in Vault Exchange / friend discovery.
 * - `requestable`: in collection, interest / offers only (no instant buy).
 * - `listed_buy_now`: seller posted a Vault Exchange listing → card checkout (stub in app).
 */
export type VaultItemExchangeSurface = 'requestable' | 'listed_buy_now';

/** Buyer-side rule set for CTAs and badges. */
export type VaultExchangeBuyerRules = {
  surface: VaultItemExchangeSurface;
  /** Instant purchase (cash) — only when surface is listed_buy_now. */
  canBuyNow: boolean;
  canRequestInterest: boolean;
  canMakeOffer: boolean;
  canAskAvailability: boolean;
  listPriceUsd?: number;
  listingId?: string;
};

/** Seller-side: what they can do from their own Vault asset sheet. */
export type VaultExchangeSellerRules = {
  /** Item is in Vault (eligible for listing / requests). */
  isInVault: boolean;
  /** Posted fixed USD price on Vault Exchange. */
  isListedForExchange: boolean;
  listPriceUsd?: number;
  canCreateListing: boolean;
  canDelist: boolean;
};

export function isVaultFulfillment(f?: PullFulfillment): boolean {
  return f === 'vaulted' || f === 'shipped';
}

/** Listed for instant sale (USD) — source of truth on the pull for the owner. */
export function hasActiveVaultExchangeListingOnPull(p: Pull): boolean {
  return (
    p.fulfillment === 'vaulted' &&
    p.vaultExchangeListUsd != null &&
    p.vaultExchangeListUsd >= 1
  );
}

export function listingForPull(
  listings: PublicVaultListing[] | undefined,
  pullId: string,
): PublicVaultListing | undefined {
  return listings?.find((l) => l.pullId === pullId);
}

/**
 * Buyer viewing someone else's vaulted item (friend discovery).
 * Listing match is by pull id against active `PublicVaultListing` rows.
 */
export function vaultExchangeBuyerRules(
  pull: Pull,
  activeListingsForSeller: PublicVaultListing[] | undefined,
): VaultExchangeBuyerRules {
  const listing = listingForPull(activeListingsForSeller, pull.id);
  const listed = listing != null && (listing.listPriceUsd ?? 0) >= 1;

  if (listed && listing != null) {
    return {
      surface: 'listed_buy_now',
      canBuyNow: true,
      canRequestInterest: true,
      canMakeOffer: true,
      canAskAvailability: true,
      listPriceUsd: listing.listPriceUsd,
      listingId: listing.id,
    };
  }

  return {
    surface: 'requestable',
    canBuyNow: false,
    canRequestInterest: true,
    canMakeOffer: true,
    canAskAvailability: true,
  };
}

/** Seller rules from pull only (listings mirror pull state in store). */
export function vaultExchangeSellerRules(pull: Pull): VaultExchangeSellerRules {
  const inVault = pull.fulfillment === 'vaulted';
  const usd = pull.vaultExchangeListUsd;
  const listed = inVault && usd != null && usd >= 1;
  return {
    isInVault: inVault,
    isListedForExchange: listed,
    listPriceUsd: listed ? usd : undefined,
    canCreateListing: inVault && !listed,
    canDelist: inVault && listed,
  };
}

export function formatVaultExchangeUsd(amountUsd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, amountUsd));
}
