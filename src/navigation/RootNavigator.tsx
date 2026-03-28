import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
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
import { PromotionsScreen } from '../screens/PromotionsScreen';
import { PackDetailsScreen } from '../screens/PackDetailsScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { FriendsLeaderboardScreen } from '../screens/FriendsLeaderboardScreen';
import { GlobalPackModals } from '../components/pack/GlobalPackModals';
import { navigationRef } from './navigationRef';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
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
import { AppBootEntrance, BOOT_ENTRANCE_SPRING } from '../components/splash/AppBootEntrance';
import { AppSplashScreen } from '../components/splash/AppSplashScreen';
import { GuestModeProvider } from '../context/GuestModeContext';
import { OnboardingGate } from '../components/onboarding/OnboardingGate';
import { useReferralLinkListener } from '../hooks/useReferralLinkListener';
import { PromotionSync } from '../components/promotions/PromotionSync';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Marketplace: ['storefront-outline', 'storefront'],
  Home: ['home-outline', 'home'],
  Friends: ['people-outline', 'people'],
  Account: ['person-outline', 'person'],
};

function TabNavigatorInner() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      // Bar order follows <Tab.Screen /> order (Shop first). Default *selected* tab is Home (packs).
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const pair = TAB_ICONS[route.name];
          const name = pair ? (focused ? pair[1] : pair[0]) : 'ellipse-outline';
          return <Ionicons name={name} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarLabel: t('tabs.marketplace') }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ tabBarLabel: t('tabs.friends') }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarLabel: t('tabs.account') }} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <>
      {isClerkEnabled ? <ClerkProfileSync /> : null}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigatorInner} />
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
  useEffect(() => {
    void hydrate();
    void hydratePromotions();
  }, [hydrate, hydratePromotions]);
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
  },
  tabBar: {
    backgroundColor: colors.tabBarBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.headerHairline,
    height: 82,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  stackHeaderTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
