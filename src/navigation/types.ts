export type RootStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  /** Unified checkout: in-app credits (digital) vs marketplace physical goods (Stripe server flow). */
  PaymentPortal:
    | {
        initialTab?: 'credits' | 'marketplace';
        listingTitle?: string;
        listingPrice?: string;
      }
    | undefined;
};

export type RootTabParamList = {
  Marketplace: undefined;
  Home: undefined;
  Friends: undefined;
  Account: undefined;
};