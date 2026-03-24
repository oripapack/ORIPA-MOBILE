import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { lookupFriendDisplayName } from '../data/friends';
import { parseFriendInviteFromQr } from '../lib/friendQr';

type Options = {
  /** Called after user confirms add and it succeeds (e.g. close modal). */
  onAdded?: () => void;
};

/**
 * Shared lookup + add prompts for typed username, pasted payload, or scanned QR (normalized username).
 */
export function useFriendInviteResolver(options?: Options) {
  const { t } = useTranslation();
  const addFriend = useAppStore((s) => s.addFriend);
  const onAdded = options?.onAdded;

  const promptAddFriend = useCallback(
    (username: string, displayName: string) => {
      Alert.alert(t('friendsAlerts.addTitle'), `${displayName}\n@${username}`, [
        { text: t('friendsAlerts.cancel'), style: 'cancel' },
        {
          text: t('friendsAlerts.add'),
          onPress: () => {
            const res = addFriend(username, displayName);
            if (res.ok) {
              Alert.alert(t('friendsAlerts.addedTitle'), t('friendsAlerts.addedBody', { name: displayName }));
              onAdded?.();
            } else if (res.reason === 'self') {
              Alert.alert(t('friendsAlerts.selfTitle'), t('friendsAlerts.selfBody'));
            } else if (res.reason === 'duplicate') {
              Alert.alert(t('friendsAlerts.duplicateTitle'), t('friendsAlerts.duplicateBody'));
            } else if (res.reason === 'invalid') {
              Alert.alert(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
            } else {
              Alert.alert(t('friendsAlerts.errorTitle'), t('friendsAlerts.errorBody'));
            }
          },
        },
      ]);
    },
    [addFriend, onAdded, t],
  );

  /** Raw input: username, full QR string, or legacy TCG code. */
  const resolveFromRaw = useCallback(
    (raw: string) => {
      const username = parseFriendInviteFromQr(raw);
      if (!username) {
        Alert.alert(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
        return;
      }
      const name = lookupFriendDisplayName(username);
      if (!name) {
        Alert.alert(t('friendsAlerts.notFoundTitle'), t('friendsAlerts.notFoundBody'));
        return;
      }
      promptAddFriend(username, name);
    },
    [promptAddFriend, t],
  );

  /** Already normalized username from `QrScannerModal`. */
  const resolveFromUsername = useCallback(
    (username: string) => {
      const name = lookupFriendDisplayName(username);
      if (!name) {
        Alert.alert(t('friendsAlerts.notFoundTitle'), t('friendsAlerts.notFoundBody'));
        return;
      }
      promptAddFriend(username, name);
    },
    [promptAddFriend, t],
  );

  return { resolveFromRaw, resolveFromUsername, promptAddFriend };
}
