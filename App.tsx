import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { hydrateLocaleFromStorage } from './src/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SimulationDisclosure } from './src/components/shared/SimulationDisclosure';
import { PhysicalGoodsPaymentRoot } from './src/payments';
import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from './src/config/clerk';
import { ClerkSessionBridge } from './src/components/account/ClerkSessionBridge';
import { colors } from './src/tokens/colors';

/** Mitigate RN default Text weight drift (explicit regular weight when unspecified). */
const baseTextStyle = { fontWeight: '400' as const };
const T = Text as typeof Text & { defaultProps?: { style?: unknown } };
const TI = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
T.defaultProps = { ...T.defaultProps, style: [T.defaultProps?.style, baseTextStyle] };
TI.defaultProps = { ...TI.defaultProps, style: [TI.defaultProps?.style, baseTextStyle] };

export default function App() {
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    void hydrateLocaleFromStorage().then(() => setLocaleReady(true));
  }, []);

  useEffect(() => {
    void WebBrowser.maybeCompleteAuthSession();
  }, []);

  const tree = (
    <PhysicalGoodsPaymentRoot>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.root}>
          <SimulationDisclosure />
          {__DEV__ && !isClerkEnabled ? (
            <View style={styles.clerkHint} accessibilityRole="text">
              <Text style={styles.clerkHintText}>
                Sign-in is disabled: set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in a root `.env` file (see
                `.env.example`), then restart Metro with a clean cache (`npx expo start -c`).
              </Text>
            </View>
          ) : null}
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </PhysicalGoodsPaymentRoot>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!localeReady ? (
        <View style={[styles.root, { backgroundColor: colors.background }]} />
      ) : isClerkEnabled ? (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
          <ClerkSessionBridge />
          {tree}
        </ClerkProvider>
      ) : (
        tree
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  clerkHint: {
    backgroundColor: colors.warningBannerBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.warningBannerBorder,
  },
  clerkHintText: {
    fontSize: 12,
    color: colors.warningBannerText,
    lineHeight: 18,
  },
});
