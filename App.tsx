import React, { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  useFonts,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import {
  ChakraPetch_400Regular,
  ChakraPetch_500Medium,
  ChakraPetch_700Bold,
} from '@expo-google-fonts/chakra-petch';
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
import { ClerkSsoCallbackHandler } from './src/components/account/ClerkSsoCallbackHandler';
import { sg } from './src/tokens/sg';

/** Tokyo Arcade Vault default body. Explicit roles opt into `sg.font.*` weights. */
const baseTextStyle = { fontFamily: sg.font.body, color: sg.text } as const;
const T = Text as typeof Text & { defaultProps?: { style?: unknown } };
const TI = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
T.defaultProps = { ...T.defaultProps, style: [T.defaultProps?.style, baseTextStyle] };
TI.defaultProps = { ...TI.defaultProps, style: [TI.defaultProps?.style, baseTextStyle] };

export default function App() {
  const [localeReady, setLocaleReady] = useState(false);
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const [fontsLoaded] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    // Tokyo Arcade Vault control faces.
    ChakraPetch_400Regular,
    ChakraPetch_500Medium,
    ChakraPetch_700Bold,
  });

  useEffect(() => {
    void hydrateLocaleFromStorage().then(() => setLocaleReady(true));
  }, []);

  /** Don't hang forever on a blank screen if Google Fonts fail to load (common on web). */
  useEffect(() => {
    if (fontsLoaded) return;
    const t = setTimeout(() => setFontsTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  useEffect(() => {
    void WebBrowser.maybeCompleteAuthSession();
  }, []);

  /** Clean up leftover fullscreen pack overlays that can blank the page. */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.querySelectorAll('[data-pack-ring-overlay]').forEach((n) => n.remove());
  }, []);

  /** RN Web: constrain document height so inner ScrollViews scroll instead of the page. */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyBg = body.style.backgroundColor;
    html.style.height = '100%';
    body.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.backgroundColor = sg.bg;
    return () => {
      html.style.height = prevHtmlHeight;
      body.style.height = prevBodyHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  useEffect(() => {
    const sweep = () => useAppStore.getState().processVaultExpiries();
    sweep();
    const id = setInterval(sweep, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') useAppStore.getState().recordCollectorActivity();
    });
    return () => sub.remove();
  }, []);

  const tree = (
    <PhysicalGoodsPaymentRoot>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.root}>
          <SimulationDisclosure />
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </PhysicalGoodsPaymentRoot>
  );

  const bootReady = localeReady && (fontsLoaded || fontsTimedOut);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!bootReady ? (
        <View style={[styles.root, styles.boot, { backgroundColor: sg.bg }]}>
          {Platform.OS === 'web' ? (
            <Text style={styles.bootText}>Loading Pull Hub…</Text>
          ) : null}
        </View>
      ) : isClerkEnabled ? (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
          <ClerkSsoCallbackHandler />
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
  boot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bootText: {
    color: sg.muted,
    fontFamily: sg.font.body,
    fontSize: 14,
  },
});
