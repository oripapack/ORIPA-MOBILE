import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';
import { colors } from '../../../../tokens/colors';
import { fontSize, brandFont } from '../../../../tokens/typography';
import { spacing } from '../../../../tokens/spacing';

/**
 * Expo web — load the 3D ring in an iframe from the Vite helper (:3000).
 * In-process R3F + createPortal was causing blank/white screens inside RN Modal.
 * Animation only appears when this component mounts (Open Pack).
 */
export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const revealedRef = useRef(false);

  const src = useMemo(() => {
    const tier = tierToRingRarity(props.roll.tier);
    const qs = new URLSearchParams({
      embed: '1',
      tier,
      card: props.revealCard.name.slice(0, 120),
    });
    const origin =
      typeof window !== 'undefined' && window.location.hostname
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : 'http://127.0.0.1:3000';
    return `${origin}/?${qs.toString()}`;
  }, [props.revealCard.name, props.roll.tier]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'revealDone') {
          if (revealedRef.current) return;
          revealedRef.current = true;
          props.onRevealDone();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [props]);

  // Also remove any leftover body overlays from earlier in-process attempts
  useEffect(() => {
    document.querySelectorAll('[data-pack-ring-overlay]').forEach((n) => n.remove());
  }, []);

  if (failed) {
    return (
      <View style={styles.fill}>
        <Text style={styles.errorTitle}>Pack scene unavailable</Text>
        <Text style={styles.errorBody}>
          Make sure `npm start` is running (it starts the scene server on port 3000).
          Then refresh and open a pack again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {/* iframe is valid on react-native-web */}
      <iframe
        title="Pack opening"
        src={src}
        style={styles.iframe}
        allow="autoplay; fullscreen"
        onLoad={() => setLoading(false)}
        onError={() => {
          setFailed(true);
          setLoading(false);
        }}
      />
      {loading ? (
        <View style={styles.loading}>
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
    minHeight: '100dvh' as unknown as number,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%',
    minHeight: '100dvh',
    backgroundColor: '#000',
  } as unknown as object,
  loading: {
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
  errorTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontFamily: brandFont.bold,
    textAlign: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  errorBody: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});
