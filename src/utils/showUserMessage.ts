import { Alert, Platform } from 'react-native';

/** User-visible feedback — `Alert.alert` is unreliable on web. */
export function showUserMessage(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}
