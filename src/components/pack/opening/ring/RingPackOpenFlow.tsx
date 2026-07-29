import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';
import { getPackRingWebBaseUrl } from '../../../../config/packRingWebUrl';
import { colors } from '../../../../tokens/colors';
import { fontSize, brandFont } from '../../../../tokens/typography';
import { spacing } from '../../../../tokens/spacing';

/**
 * Native iOS/Android — 3D ring scene in a WebView (served by the prototype dev server).
 * `npm start` runs Expo + the scene server together.
 */
export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const revealedRef = useRef(false);

  const baseUrl = getPackRingWebBaseUrl();

  const uri = useMemo(() => {
    if (!baseUrl) return '';
    const tier = tierToRingRarity(props.roll.tier);
    const qs = new URLSearchParams({
      embed: '1',
      tier,
      card: props.revealCard.name.slice(0, 120),
    });
    return `${baseUrl}?${qs.toString()}`;
  }, [baseUrl, props.revealCard.name, props.roll.tier]);

  const onRevealDone = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    props.onRevealDone();
  }, [props]);

  const retry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  if (!uri || failed) {
    return (
      <View style={styles.fill}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Pack scene unavailable</Text>
          <Text style={styles.errorBody}>
            {uri
              ? 'The 3D ring could not load. Make sure `npm start` is running (it starts the scene server automatically).'
              : 'Set EXPO_PUBLIC_PACK_RING_WEB_URL in .env to your Mac IP, e.g. http://192.168.11.14:3000'}
          </Text>
          {uri ? (
            <Pressable onPress={retry} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        key={reloadKey}
        source={{ uri }}
        style={styles.fill}
        originWhitelist={['*']}
        mixedContentMode="always"
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
        onHttpError={(event) => {
          const { statusCode, url } = event.nativeEvent;
          if (statusCode >= 400 && url.startsWith(baseUrl)) {
            setFailed(true);
            setLoading(false);
          }
        }}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data) as { type?: string };
            if (msg.type === 'revealDone') onRevealDone();
          } catch {
            /* ignore malformed messages */
          }
        }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaCapturePermissionGrantType="grant"
      />
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading pack scene…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 420,
    width: '100%',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: brandFont.bold,
    textAlign: 'center',
  },
  errorBody: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retryText: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
  },
});
