import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showUserMessage } from './showUserMessage';

/** Share text — `Share.share` is unreliable on React Native Web. */
export async function shareUserContent(message: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        /* user cancelled or browser blocked */
      }
    }
    await Clipboard.setStringAsync(message);
    showUserMessage('Copied to clipboard', 'Paste anywhere to share your pull.');
    return;
  }
  await Share.share({ message });
}
