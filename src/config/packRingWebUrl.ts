import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PACK_RING_PORT = 3000;

/** Same machine as Metro — parse `192.168.x.x:8081` from Expo Go. */
function metroLanHost(): string | null {
  const raw =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (!raw || typeof raw !== 'string') return null;

  const host = raw.split(':')[0]?.trim();
  if (!host) return null;

  // Tunnel URLs cannot reach the local Vite server.
  if (host.includes('exp.direct') || host.includes('ngrok')) return null;

  if (host === 'localhost') return '127.0.0.1';
  return host;
}

/**
 * Base URL for the 3D pack ring WebView on native (no query string).
 * Dev: auto-matches Metro's LAN IP. Tunnel: set via `npm run start:tunnel` (ngrok on :3000).
 */
export function getPackRingWebBaseUrl(): string {
  if (Platform.OS === 'web') return '';

  if (__DEV__) {
    if (Platform.OS === 'ios' && !Constants.isDevice) {
      return `http://127.0.0.1:${PACK_RING_PORT}`;
    }
    if (Platform.OS === 'android' && !Constants.isDevice) {
      return `http://10.0.2.2:${PACK_RING_PORT}`;
    }

    const lan = metroLanHost();
    if (lan) return `http://${lan}:${PACK_RING_PORT}`;

    const fromEnv = process.env.EXPO_PUBLIC_PACK_RING_WEB_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    return '';
  }

  const fromEnv = process.env.EXPO_PUBLIC_PACK_RING_WEB_URL?.trim();
  return fromEnv ? fromEnv.replace(/\/$/, '') : '';
}
