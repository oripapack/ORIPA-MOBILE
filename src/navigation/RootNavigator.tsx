import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { PacksScreen } from '../screens/PacksScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  Home: '🏠',
  Packs: '📦',
  Rewards: '⭐',
  Account: '👤',
};

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
              {tabIcons[route.name]}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Packs" component={PacksScreen} />
        <Tab.Screen name="Rewards" component={RewardsScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
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
});
