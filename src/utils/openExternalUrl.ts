import { Linking, Platform } from 'react-native';
import { showUserMessage } from './showUserMessage';

export async function openExternalUrl(url: string, label?: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    showUserMessage('Missing link', 'This URL is not set yet. Update `src/config/app.ts`.');
    return;
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(trimmed, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  try {
    const supported = await Linking.canOpenURL(trimmed);
    if (!supported) {
      showUserMessage(
        'Cannot open link',
        'Check that the URL is valid (https) in `src/config/app.ts`.',
      );
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    showUserMessage('Error', label ? `Could not open ${label}.` : 'Could not open link.');
  }
}
