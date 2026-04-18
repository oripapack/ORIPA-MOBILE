import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Marketplace: undefined;
  Home: undefined;
  Vault: undefined;
  Friends: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  Settings: undefined;
  PackDetails: { packId: string };
  /** Unified checkout: in-app credits (digital) vs marketplace physical goods (Stripe server flow). */
  PaymentPortal:
    | {
        initialTab?: 'credits' | 'marketplace';
        listingTitle?: string;
        listingPrice?: string;
      }
    | undefined;
  HelpCenter: undefined;
  ShippingAddress: undefined;
  TierBenefits: undefined;
  Notifications: undefined;
  HotDropsInfo: undefined;
  PromosInfo: undefined;
  PullHistory: undefined;
  FriendProfile: { username: string };
  FriendsLeaderboard: undefined;
  LinkedAccounts: undefined;
  IdentityVerification: undefined;
  PayoutMethod: undefined;
  /** Promo codes + referral link (Profile → rewards). */
  Promotions: undefined;
  /** Paid membership — Silver / Gold / Black (demo CTA until IAP). */
  Membership: undefined;
};
