import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { PhygitalsOpenFlow } from '../../../ph/PhygitalsOpenFlow';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';

/**
 * Native iOS/Android — loads the web sandbox scene in a WebView.
 * Set `EXPO_PUBLIC_PACK_RING_WEB_URL` (e.g. http://localhost:3000/sandbox/pack-opening)
 * and run `npm run prototype:web` alongside Expo. Falls back to Phygitals slab flow when
 * the URL is missing or the page fails to load.
 */
const BASE_URL = process.env.EXPO_PUBLIC_PACK_RING_WEB_URL?.trim() ?? '';

export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [failed, setFailed] = useState(false);

  const uri = useMemo(() => {
    if (!BASE_URL) return '';
    const tier = tierToRingRarity(props.roll.tier);
    const qs = new URLSearchParams({
      embed: '1',
      tier,
      card: props.revealCard.name.slice(0, 120),
    });
    return `${BASE_URL.replace(/\/$/, '')}?${qs.toString()}`;
  }, [props.revealCard.name, props.roll.tier]);

  if (!uri || failed) {
    return (
      <PhygitalsOpenFlow
        pack={props.pack}
        skipNonce={props.skipNonce}
        onRevealDone={props.onRevealDone}
        onStoreInVault={props.onStoreInVault}
      />
    );
  }

  return (
    <View style={styles.fill}>
      <WebView
        source={{ uri }}
        style={styles.fill}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data) as { type?: string };
            if (msg.type === 'revealDone') props.onRevealDone();
          } catch {
            /* ignore malformed messages */
          }
        }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: '#000',
  },
});
