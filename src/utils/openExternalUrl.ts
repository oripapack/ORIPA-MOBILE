import { Linking, Platform } from 'react-native';
import i18n from '../i18n';
import { showUserMessage } from './showUserMessage';

export async function openExternalUrl(url: string, label?: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    showUserMessage(i18n.t('alerts.missingLink.title'), i18n.t('alerts.missingLink.body'));
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
      showUserMessage(i18n.t('alerts.cannotOpenLink.title'), i18n.t('alerts.cannotOpenLink.body'));
      return;
    }
    await Linking.openURL(trimmed);
  } catch {
    showUserMessage(
      i18n.t('common.error'),
      label
        ? i18n.t('alerts.openLinkFailed', { label })
        : i18n.t('alerts.openLinkFailedGeneric'),
    );
  }
}
