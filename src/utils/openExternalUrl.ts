import { Alert, Linking, Platform } from 'react-native';

export async function openExternalUrl(url: string, label?: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    Alert.alert('Missing link', 'This URL is not set yet. Update `src/config/app.ts`.');
    return;
  }

  try {
    const supported = await Linking.canOpenURL(trimmed);
    if (!supported) {
      Alert.alert(
        'Cannot open link',
        Platform.OS === 'web'
          ? 'Open this URL in your browser manually.'
          : 'Check that the URL is valid (https) in `src/config/app.ts`.',
      );
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    Alert.alert('Error', label ? `Could not open ${label}.` : 'Could not open link.');
  }
}
