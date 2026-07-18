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
  /** Dev-only component gallery (EXPO_PUBLIC_DEV_SCREEN=UiGallery). */
  DevUiGallery: undefined;
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
  WalletLinking: undefined;
  IdentityVerification: undefined;
  PayoutMethod: undefined;
  /** Promo codes + referral link (Profile → rewards). */
  Promotions: undefined;
  /** Paid membership — Silver / Gold / Black (demo CTA until IAP). */
  Membership: undefined;
  /** Full collector quest list + streak (Player tab links here). */
  CollectorQuests: undefined;
};
