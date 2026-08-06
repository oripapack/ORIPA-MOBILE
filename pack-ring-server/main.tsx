import { createRoot } from 'react-dom/client';

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
        Port <strong style={{ color: '#fff' }}>3000</strong> serves the 3D pack-opening HTML for the
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
        Dev preview of the opening scene:{' '}
        <a href="/opening-3d.html?embed=1&tier=legendary&card=Preview" style={{ color: '#C9A96E' }}>
          /opening-3d.html?embed=1
        </a>
      </p>
      <p style={{ margin: 0, lineHeight: 1.5, color: '#A3A3A3', fontSize: 14 }}>
        Or in the Expo terminal press <kbd style={{ color: '#fff' }}>w</kbd>. The pack animation
        only appears inside the app after you tap Open Pack (x1).
      </p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<HelpPage />);
