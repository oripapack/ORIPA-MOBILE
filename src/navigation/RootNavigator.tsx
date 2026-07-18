import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DevUiGalleryScreen } from '../screens/DevUiGalleryScreen';
import { PaymentPortalScreen } from '../screens/PaymentPortalScreen';
import { HelpCenterScreen } from '../screens/HelpCenterScreen';
import { ShippingAddressScreen } from '../screens/ShippingAddressScreen';
import { TierBenefitsScreen } from '../screens/TierBenefitsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { HotDropsInfoScreen } from '../screens/HotDropsInfoScreen';
import { PromosInfoScreen } from '../screens/PromosInfoScreen';
import { PullHistoryScreen } from '../screens/PullHistoryScreen';
import { LinkedAccountsScreen } from '../screens/LinkedAccountsScreen';
import { IdentityVerificationScreen } from '../screens/IdentityVerificationScreen';
import { PayoutMethodScreen } from '../screens/PayoutMethodScreen';
import { WalletLinkingScreen } from '../screens/WalletLinkingScreen';
import { PromotionsScreen } from '../screens/PromotionsScreen';
import { MembershipScreen } from '../screens/MembershipScreen';
import { CollectorQuestsScreen } from '../screens/CollectorQuestsScreen';
import { PackDetailsScreen } from '../screens/PackDetailsScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { FriendsLeaderboardScreen } from '../screens/FriendsLeaderboardScreen';
import { GlobalPackModals } from '../components/pack/GlobalPackModals';
import { navigationRef } from './navigationRef';
import { colors } from '../tokens/colors';
import { useAppStore } from '../store/useAppStore';
import { fontSize, brandFont } from '../tokens/typography';
import { RootStackParamList } from './types';
import { GuestAuthWallModal } from '../components/auth/GuestAuthWallModal';
import { LinkPhoneScreen } from '../screens/LinkPhoneScreen';
import { ProfileOnboardingScreen } from '../screens/ProfileOnboardingScreen';
import { ClerkProfileSync } from '../components/account/ClerkProfileSync';
import { isClerkEnabled, requirePhoneVerification } from '../config/clerk';
import { hasVerifiedPhone } from '../lib/clerkPhone';
import { hasCompletedProfileOnboarding } from '../lib/clerkProfile';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { usePromotionStore } from '../store/promotionStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import { AppBootEntrance, BOOT_ENTRANCE_SPRING } from '../components/splash/AppBootEntrance';
import { AppSplashScreen } from '../components/splash/AppSplashScreen';
import { GuestModeProvider } from '../context/GuestModeContext';
import { CoachHydration } from '../components/coach/CoachHydration';
import { OnboardingGate } from '../components/onboarding/OnboardingGate';
import { useReferralLinkListener } from '../hooks/useReferralLinkListener';
import { PromotionSync } from '../components/promotions/PromotionSync';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const tabBarDockStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  topRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

/**
 * Dock-style bar: stable jewel tones (no muddy blur tint) + beveled top for 3D depth.
 * iOS gets a very light blur under the gradients; Android uses gradients only.
 */
function PremiumTabBarBackground() {
  return (
    <View style={tabBarDockStyles.root}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}

      {/* Base slab — matches app surfaces, darker toward bottom (receding plane) */}
      <LinearGradient
        colors={[colors.surfaceMuted, colors.surfaceElevated, colors.background]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top “lit face” — subtle 3D bevel */}
      <LinearGradient
        colors={['rgba(255,255,255,0.11)', 'rgba(255,255,255,0.02)', 'transparent']}
        locations={[0, 0.18, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Emerald hairline rim (premium edge) */}
      <LinearGradient
        colors={['rgba(16,185,129,0.40)', 'rgba(16,185,129,0.14)', 'rgba(255,255,255,0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={tabBarDockStyles.topRim}
        pointerEvents="none"
      />

      {/* Bottom weight — grounds the dock */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.22)']}
        locations={[0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const TAB_ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  /** Shop / singles — cart is distinct from packs (cards) and reads as marketplace checkout. */
  Marketplace: ['cart-outline', 'cart'],
  Vault: ['file-tray-stacked-outline', 'file-tray-stacked'],
  Friends: ['people-outline', 'people'],
  Account: ['person-outline', 'person'],
};

function TabNavigatorInner() {
  const { t } = useTranslation();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const incomingFriendRequestCount = useAppStore((s) => s.incomingFriendRequests.length);
  const friendTabBadgeCount =
    (!isClerkEnabled || clerkSignedIn) && incomingFriendRequestCount > 0
      ? incomingFriendRequestCount
      : 0;
  const pendingVaultCount = useAppStore((s) => s.pendingFulfillmentPullIds.length);
  const vaultTabBadgeCount =
    (!isClerkEnabled || clerkSignedIn) && pendingVaultCount > 0 ? pendingVaultCount : 0;

  return (
    <Tab.Navigator
      // Bar order: Shop → Vault → Packs (center) → Friends → Player (far right). Default tab is Packs.
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneContainerStyle: Platform.OS === 'web' ? { flex: 1, minHeight: 0 } : undefined,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: PremiumTabBarBackground,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Home') {
            /* Overlapping playing cards — reads as TCG pack / pulls (Ionicons has no booster glyph). */
            return (
              <MaterialCommunityIcons
                name={focused ? 'cards-playing' : 'cards-playing-outline'}
                size={25}
                color={color}
              />
            );
          }
          const pair = TAB_ICONS[route.name];
          const name = pair ? (focused ? pair[1] : pair[0]) : 'ellipse-outline';
          return <Ionicons name={name} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: t('tabs.marketplace') }} />
      <Tab.Screen
        name="Vault"
        component={VaultScreen}
        options={{
          tabBarLabel: t('tabs.vault'),
          tabBarBadge:
            vaultTabBadgeCount > 0
              ? vaultTabBadgeCount > 99
                ? '99+'
                : vaultTabBadgeCount
              : undefined,
          tabBarBadgeStyle:
            vaultTabBadgeCount > 0
              ? { backgroundColor: colors.goldDark, color: colors.ink, fontSize: 11 }
              : undefined,
        }}
      />
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: t('tabs.friends'),
          tabBarBadge:
            friendTabBadgeCount > 0
              ? friendTabBadgeCount > 99
                ? '99+'
                : friendTabBadgeCount
              : undefined,
          tabBarBadgeStyle:
            friendTabBadgeCount > 0
              ? { backgroundColor: colors.red, color: colors.white, fontSize: 11 }
              : undefined,
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarLabel: t('tabs.account') }} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <>
      {isClerkEnabled ? <ClerkProfileSync /> : null}
      <Stack.Navigator
        // Dev-only: EXPO_PUBLIC_DEV_SCREEN=UiGallery boots straight into the
        // component gallery (docs/design-spec.md). No effect in normal runs.
        initialRouteName={process.env.EXPO_PUBLIC_DEV_SCREEN === 'UiGallery' ? 'DevUiGallery' : 'MainTabs'}
        screenOptions={{
          headerShown: false,
          cardStyle: { flex: 1, backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigatorInner} />
        <Stack.Screen name="DevUiGallery" component={DevUiGalleryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="PackDetails"
          component={PackDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PaymentPortal"
          component={PaymentPortalScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="HelpCenter"
          component={HelpCenterScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="ShippingAddress"
          component={ShippingAddressScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="TierBenefits"
          component={TierBenefitsScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="Membership"
          component={MembershipScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="CollectorQuests"
          component={CollectorQuestsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="HotDropsInfo"
          component={HotDropsInfoScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="PromosInfo"
          component={PromosInfoScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="PullHistory"
          component={PullHistoryScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="FriendProfile"
          component={FriendProfileScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="FriendsLeaderboard"
          component={FriendsLeaderboardScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="LinkedAccounts"
          component={LinkedAccountsScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="WalletLinking"
          component={WalletLinkingScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="IdentityVerification"
          component={IdentityVerificationScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="PayoutMethod"
          component={PayoutMethodScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.textPrimary,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surfaceElevated },
          }}
        />
        <Stack.Screen
          name="Promotions"
          component={PromotionsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      <GlobalPackModals />
    </>
  );
}

function GuestHydration() {
  const hydrate = useGuestBrowseStore((s) => s.hydrate);
  const hydratePromotions = usePromotionStore((s) => s.hydrate);
  const hydrateMembershipSim = useMembershipSimulationStore((s) => s.hydrate);
  const hydrateFirstTimePacks = useAppStore((s) => s.hydrateFirstTimePacks);
  const hydrateCollectorGame = useAppStore((s) => s.hydrateCollectorGame);
  const recordCollectorActivity = useAppStore((s) => s.recordCollectorActivity);
  useEffect(() => {
    void hydrate();
    void hydratePromotions();
    void hydrateMembershipSim();
    void hydrateFirstTimePacks();
    void (async () => {
      await hydrateCollectorGame();
      recordCollectorActivity();
    })();
  }, [
    hydrate,
    hydratePromotions,
    hydrateMembershipSim,
    hydrateFirstTimePacks,
    hydrateCollectorGame,
    recordCollectorActivity,
  ]);
  return null;
}

function ReferralLinkBootstrap() {
  useReferralLinkListener();
  return null;
}

function ClerkAuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const hydrated = useGuestBrowseStore((s) => s.hydrated);
  const authWallForced = useGuestBrowseStore((s) => s.authWallForced);
  const onboardingSheetDismissed = useGuestBrowseStore((s) => s.onboardingSheetDismissed);
  const [splashDone, setSplashDone] = useState(false);
  const bootEntrance = useSharedValue(0);

  const loading = !isLoaded || !hydrated || (isSignedIn && (!userLoaded || !user));

  const onSplashExitStart = useCallback(() => {
    bootEntrance.value = withSpring(1, BOOT_ENTRANCE_SPRING);
  }, [bootEntrance]);

  let content: React.ReactNode = null;
  if (!loading) {
    if (!isSignedIn) {
      content = (
        <>
          <RootStack />
          {!onboardingSheetDismissed && !authWallForced ? <OnboardingGate /> : null}
          {authWallForced ? <GuestAuthWallModal /> : null}
        </>
      );
    } else if (user && requirePhoneVerification && !hasVerifiedPhone(user)) {
      content = <LinkPhoneScreen />;
    } else if (user && !hasCompletedProfileOnboarding(user)) {
      content = <ProfileOnboardingScreen />;
    } else {
      content = <RootStack />;
    }
  }

  return (
    <View style={styles.gateRoot}>
      <AppBootEntrance entrance={bootEntrance}>{content}</AppBootEntrance>
      {!splashDone ? (
        <AppSplashScreen
          exitTrigger={!loading}
          onExitStart={onSplashExitStart}
          onExitComplete={() => setSplashDone(true)}
        />
      ) : null}
    </View>
  );
}

/** Clerk disabled — still show branded boot once before tabs (dev / demo). */
function NonClerkBoot() {
  const [splashDone, setSplashDone] = useState(false);
  const bootEntrance = useSharedValue(0);

  const onSplashExitStart = useCallback(() => {
    bootEntrance.value = withSpring(1, BOOT_ENTRANCE_SPRING);
  }, [bootEntrance]);

  return (
    <View style={styles.gateRoot}>
      <AppBootEntrance entrance={bootEntrance}>
        <RootStack />
      </AppBootEntrance>
      {!splashDone ? (
        <AppSplashScreen
          exitTrigger={true}
          onExitStart={onSplashExitStart}
          onExitComplete={() => setSplashDone(true)}
        />
      ) : null}
    </View>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <GuestHydration />
      <CoachHydration />
      <ReferralLinkBootstrap />
      <PromotionSync />
      <GuestModeProvider>{isClerkEnabled ? <ClerkAuthGate /> : <NonClerkBoot />}</GuestModeProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  gateRoot: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? { minHeight: 0, height: '100%' } : null),
  },
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 82,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
  },
  stackHeaderTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
  },
});
