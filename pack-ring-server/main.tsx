import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { parseRingRarity } from '../src/components/pack/opening/ring/ringRarity';

const PackRingScene = lazy(
  () => import('../src/components/pack/opening/ring/PackRingScene.web'),
);

function postRevealDone() {
  const bridge = (window as Window & { ReactNativeWebView?: { postMessage: (s: string) => void } })
    .ReactNativeWebView;
  bridge?.postMessage(JSON.stringify({ type: 'revealDone' }));
  // Expo web iframe parent
  try {
    window.parent?.postMessage(JSON.stringify({ type: 'revealDone' }), '*');
  } catch {
    /* ignore */
  }
}

/** Shown when someone opens :3000 in a browser — this is NOT the Pull Hub app. */
function HelpPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        margin: 0,
        padding: 32,
        boxSizing: 'border-box',
        background: '#0A0A0C',
        color: '#F5F5F5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 16,
        maxWidth: 560,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 22 }}>This is not the app</h1>
      <p style={{ margin: 0, lineHeight: 1.5, color: '#A3A3A3' }}>
        Port <strong style={{ color: '#fff' }}>3000</strong> only serves the 3D pack scene for the
        phone WebView. The full Pull Hub app runs on Expo:
      </p>
      <a
        href="http://localhost:8081"
        style={{
          color: '#C9A96E',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        → Open http://localhost:8081
      </a>
      <p style={{ margin: 0, lineHeight: 1.5, color: '#A3A3A3', fontSize: 14 }}>
        Or in the Expo terminal press <kbd style={{ color: '#fff' }}>w</kbd>. The pack animation
        only appears inside the app after you tap Open Pack.
      </p>
    </main>
  );
}

function EmbedApp() {
  const params = new URLSearchParams(window.location.search);
  const rollRarity = parseRingRarity(params.get('tier'));
  const cardLabel = params.get('card') ?? undefined;

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
      <Suspense
        fallback={
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Loading pack scene…
          </div>
        }
      >
        <PackRingScene
          embed
          rollRarity={rollRarity}
          cardLabel={cardLabel}
          onRevealDone={postRevealDone}
        />
      </Suspense>
    </main>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') !== '1') return <HelpPage />;
  return <EmbedApp />;
}

createRoot(document.getElementById('root')!).render(<App />);
