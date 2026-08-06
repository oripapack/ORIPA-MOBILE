import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';
import { getPackRingWebBaseUrl } from '../../../../config/packRingWebUrl';
import { appendPackOpeningSceneTweaks } from '../../../../config/packOpeningSceneTweaks';
import { sg } from '../../../../tokens/sg';
import { fontSize } from '../../../../tokens/typography';
import { spacing } from '../../../../tokens/spacing';

/**
 * Native iOS/Android — new opening-3d HTML scene in a WebView
 * (`pack-ring-server/opening-3d.html`, co-started by `npm start` on :3000).
 */
export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const revealedRef = useRef(false);
  const webRef = useRef<WebView>(null);
  const lastSkipRef = useRef(0);

  const baseUrl = getPackRingWebBaseUrl();

  const uri = useMemo(() => {
    if (!baseUrl) return '';
    const tier = tierToRingRarity(props.roll.tier);
    const qs = new URLSearchParams({
      embed: '1',
      tier,
      card: props.revealCard.name.slice(0, 120),
    });
    appendPackOpeningSceneTweaks(qs);
    const root = baseUrl.replace(/\/$/, '');
    return `${root}/opening-3d.html?${qs.toString()}`;
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

  // Skip FAB in PackOpeningModal bumps skipNonce — tell the HTML scene to finish.
  useEffect(() => {
    if (!props.skipNonce || props.skipNonce === lastSkipRef.current) return;
    lastSkipRef.current = props.skipNonce;
    webRef.current?.injectJavaScript(
      'try{window.__PH_SKIP_OPEN__&&window.__PH_SKIP_OPEN__();}catch(e){} true;',
    );
  }, [props.skipNonce]);

  if (!uri || failed) {
    return (
      <View style={styles.fill}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Pack scene unavailable</Text>
          <Text style={styles.errorBody}>
            {uri
              ? 'The 3D opening scene could not load. Make sure `npm start` is running (it starts the scene server automatically).'
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
        ref={webRef}
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
          <ActivityIndicator size="large" color={sg.gold} />
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
    backgroundColor: sg.bg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.bg,
    gap: spacing.md,
  },
  loadingText: {
    color: sg.muted,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sg.space.xl,
    gap: spacing.md,
  },
  errorTitle: {
    color: sg.text,
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    textAlign: 'center',
  },
  errorBody: {
    color: sg.muted,
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: sg.space.sm,
    paddingHorizontal: sg.space.lg,
    paddingVertical: sg.space.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: sg.line,
  },
  retryText: {
    color: sg.gold,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
  },
});
