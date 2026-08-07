import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';
import { appendPackOpeningSceneTweaks } from '../../../../config/packOpeningSceneTweaks';
import { sg } from '../../../../tokens/sg';
import { TerminalOpeningFallback } from '../TerminalOpeningFallback';

/**
 * Expo web — load opening-3d.html in an iframe from the Vite helper (:3000).
 */
export function RingPackOpenFlow(props: RingPackOpenFlowProps) {
  const [loading, setLoading] = useState(true);
  const [sceneState, setSceneState] = useState<'checking' | 'ready' | 'failed'>('checking');
  const revealedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastSkipRef = useRef(0);

  const origin = useMemo(
    () =>
      typeof window !== 'undefined' && window.location.hostname
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : 'http://127.0.0.1:3000',
    [],
  );

  const src = useMemo(() => {
    const tier = tierToRingRarity(props.roll.tier);
    const qs = new URLSearchParams({
      embed: '1',
      tier,
      card: props.revealCard.name.slice(0, 120),
    });
    appendPackOpeningSceneTweaks(qs);
    return `${origin}/opening-3d.html?${qs.toString()}`;
  }, [origin, props.revealCard.name, props.roll.tier]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2600);
    setSceneState('checking');
    setLoading(true);

    void fetch(`${origin}/opening-3d.html`, {
      cache: 'no-store',
      mode: 'no-cors',
      signal: controller.signal,
    })
      .then(() => setSceneState('ready'))
      .catch(() => setSceneState('failed'))
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [origin]);

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

  useEffect(() => {
    if (!props.skipNonce || props.skipNonce === lastSkipRef.current) return;
    lastSkipRef.current = props.skipNonce;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ type: 'skip' }),
        '*',
      );
    } catch {
      /* ignore */
    }
  }, [props.skipNonce]);

  useEffect(() => {
    document.querySelectorAll('[data-pack-ring-overlay]').forEach((n) => n.remove());
  }, []);

  if (sceneState === 'failed') {
    return <TerminalOpeningFallback {...props} />;
  }

  if (sceneState === 'checking') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={sg.gold} />
        <Text style={styles.loadingText}>Checking reveal lane…</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <iframe
        ref={iframeRef as unknown as React.RefObject<never>}
        title="Pack opening"
        src={src}
        style={styles.iframe}
        allow="autoplay; fullscreen"
        onLoad={() => setLoading(false)}
        onError={() => {
          setSceneState('failed');
          setLoading(false);
        }}
      />
      {loading ? (
        <View style={styles.loading}>
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
    minHeight: '100dvh' as unknown as number,
    width: '100%',
    backgroundColor: sg.bg,
    position: 'relative',
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%',
    minHeight: '100dvh',
    backgroundColor: sg.bg,
  } as unknown as object,
  loading: {
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
