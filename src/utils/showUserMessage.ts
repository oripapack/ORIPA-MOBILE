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

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

/** Cross-platform confirm — `Alert.alert` multi-button prompts fail on React Native Web. */
export function confirmUserAction({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const body = message ? `${title}\n\n${message}` : title;
      if (window.confirm(body)) {
        onConfirm();
      } else {
        onCancel?.();
      }
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel', onPress: onCancel },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
