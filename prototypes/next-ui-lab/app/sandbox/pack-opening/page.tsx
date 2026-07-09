'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { parseRingRarity } from '../../../../../src/components/pack/opening/ring/ringRarity';
import type { PackRingSceneProps } from '../../../../../src/components/pack/opening/ring/PackRingScene.web';

const PackRingScene = dynamic(
  () => import('../../../../../src/components/pack/opening/ring/PackRingScene.web'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          background: 'linear-gradient(to bottom, #1A1A1E, #0A0A0C)',
        }}
      />
    ),
  },
);

function postRevealDone() {
  const bridge = (window as Window & { ReactNativeWebView?: { postMessage: (s: string) => void } })
    .ReactNativeWebView;
  bridge?.postMessage(JSON.stringify({ type: 'revealDone' }));
}

function PackRingEmbedInner() {
  const searchParams = useSearchParams();
  const embed = searchParams.get('embed') === '1';
  const rollRarity = parseRingRarity(searchParams.get('tier'));
  const cardLabel = searchParams.get('card') ?? undefined;

  const onRevealDone = useCallback(() => {
    if (embed) postRevealDone();
  }, [embed]);

  const sceneProps: PackRingSceneProps = useMemo(
    () => ({
      embed,
      rollRarity,
      cardLabel,
      onRevealDone: embed ? onRevealDone : undefined,
    }),
    [cardLabel, embed, onRevealDone, rollRarity],
  );

  return (
    <main
      style={{
        width: '100vw',
        height: '100dvh',
        background: '#0A0A0C',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <PackRingScene {...sceneProps} />
    </main>
  );
}

export default function SandboxPackOpeningPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100dvh',
            background: 'linear-gradient(to bottom, #1A1A1E, #0A0A0C)',
          }}
        />
      }
    >
      <PackRingEmbedInner />
    </Suspense>
  );
}
