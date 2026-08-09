import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';
import { parseRingBridgeMessage } from './parseRingBridgeMessage';
import { getPackRingWebBaseUrl } from '../../../../config/packRingWebUrl';
import { appendPackOpeningSceneTweaks } from '../../../../config/packOpeningSceneTweaks';
import { sg } from '../../../../tokens/sg';
import { TerminalOpeningFallback } from '../TerminalOpeningFallback';

/**
 * Native iOS/Android — new opening-3d HTML scene in a WebView
 * (`pack-ring-server/opening-3d.html`, co-started by `npm start` on :3000).
 */
export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
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
    try {
      props.onRevealDone();
    } catch {
      /* host must not crash the opening surface */
      revealedRef.current = false;
    }
  }, [props]);

  // Skip FAB in PackOpeningModal bumps skipNonce — tell the HTML scene to finish.
  useEffect(() => {
    if (!props.skipNonce || props.skipNonce === lastSkipRef.current) return;
    lastSkipRef.current = props.skipNonce;
    try {
      webRef.current?.injectJavaScript(
        'try{window.__PH_SKIP_OPEN__&&window.__PH_SKIP_OPEN__();}catch(e){}true;',
      );
    } catch {
      /* ignore inject failures */
    }
  }, [props.skipNonce]);

  if (!uri || failed) {
    return <TerminalOpeningFallback {...props} />;
  }

  return (
    <View style={styles.fill}>
      <WebView
        ref={webRef}
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
          try {
            const { statusCode, url } = event.nativeEvent;
            if (statusCode >= 400 && typeof url === 'string' && url.startsWith(baseUrl)) {
              setFailed(true);
              setLoading(false);
            }
          } catch {
            setFailed(true);
            setLoading(false);
          }
        }}
        onMessage={(event) => {
          try {
            const msg = parseRingBridgeMessage(event?.nativeEvent?.data);
            if (msg?.type === 'revealDone') onRevealDone();
          } catch {
            /* ignore unknown / malformed bridge payloads */
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
    gap: sg.space.md,
  },
  loadingText: {
    color: sg.muted,
    fontSize: sg.type.data.fontSize,
    fontFamily: sg.font.bodyMedium,
  },
});
