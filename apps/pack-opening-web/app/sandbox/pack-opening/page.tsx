'use client';

import dynamic from 'next/dynamic';

const PackRingScene = dynamic(
  () => import('./PackRingScene'),
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

export default function SandboxPackOpeningPage() {
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
      <PackRingScene />
    </main>
  );
}
