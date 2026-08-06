import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';

function readCallbackSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    return (
      url.searchParams.get('created_session_id') ??
      url.searchParams.get('createdSessionId')
    );
  } catch {
    return null;
  }
}

function isSsoCallbackPath(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('sso-callback');
}

/**
 * Completes Clerk OAuth on Expo web after redirect to /sso-callback?created_session_id=…
 * Then hard-navigates to `/` so the app boots cleanly (replaceState alone left a white screen).
 */
export function ClerkSsoCallbackHandler() {
  const { isLoaded, isSignedIn } = useAuth();
  const { setActive } = useClerk();
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isLoaded) return;

    const sessionId = readCallbackSessionId();
    const onCallback = isSsoCallbackPath();
    if (!sessionId && !onCallback) return;

    // Already signed in on callback URL — just leave
    if (isSignedIn && !sessionId) {
      window.location.replace('/');
      return;
    }

    let cancelled = false;

    const finish = async () => {
      setStatus('working');
      try {
        if (sessionId) {
          await setActive({ session: sessionId });
        }
        // Hard navigation clears blank SPA state after OAuth
        window.location.replace('/');
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          setError(msg);
          setStatus('error');
        }
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setActive]);

  if (Platform.OS !== 'web') return null;
  if (status === 'idle') return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>
        {status === 'error' ? 'Sign-in hiccup' : 'Signing you in…'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: sg.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: sg.text,
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
  },
  error: {
    color: sg.warning,
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    textAlign: 'center',
  },
});
