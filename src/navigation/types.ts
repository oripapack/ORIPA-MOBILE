import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ResultPullData, MockResultVariant } from '../data/mockResultPull';

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
  /**
   * Post-opening pull record. The opening flow supplies `pull` + `pullIds`;
   * without params it renders MOCK data for isolated UI review.
   */
  Result:
    | {
        pull?: ResultPullData;
        pullIds?: string[];
        mock?: MockResultVariant;
      }
    | undefined;
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
  ShippingOrders: undefined;
  /** Credit ledger (`credit_transactions`) — top-ups, pack spends, trade-ins. */
  CreditHistory: undefined;
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
