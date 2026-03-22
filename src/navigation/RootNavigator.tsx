import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import { GlobalPackModals } from '../components/pack/GlobalPackModals';
import { navigationRef } from './navigationRef';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { RootStackParamList } from './types';
import { AuthScreen } from '../screens/AuthScreen';
import { LinkPhoneScreen } from '../screens/LinkPhoneScreen';
import { ProfileOnboardingScreen } from '../screens/ProfileOnboardingScreen';
import { ClerkProfileSync } from '../components/account/ClerkProfileSync';
import { isClerkEnabled } from '../config/clerk';
import { hasVerifiedPhone } from '../lib/clerkPhone';
import { hasCompletedProfileOnboarding } from '../lib/clerkProfile';

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.red,
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
          name="PaymentPortal"
          component={PaymentPortalScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.nearBlack,
            headerTitleStyle: styles.stackHeaderTitle,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.white },
          }}
        />
      </Stack.Navigator>
      <GlobalPackModals />
    </>
  );
}

function ClerkAuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  if (!isLoaded) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  if (!userLoaded || !user) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (!hasVerifiedPhone(user)) {
    return <LinkPhoneScreen />;
  }

  if (!hasCompletedProfileOnboarding(user)) {
    return <ProfileOnboardingScreen />;
  }

  return <RootStack />;
}

export function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      {isClerkEnabled ? <ClerkAuthGate /> : <RootStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  authLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  stackHeaderTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
