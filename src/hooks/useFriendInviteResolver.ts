import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { lookupFriendDisplayName } from '../data/friends';
import { parseFriendInviteFromQr } from '../lib/friendQr';
import { confirmUserAction, showUserMessage } from '../utils/showUserMessage';

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
      confirmUserAction({
        title: t('friendsAlerts.addTitle'),
        message: `${displayName}\n@${username}`,
        cancelLabel: t('friendsAlerts.cancel'),
        confirmLabel: t('friendsAlerts.add'),
        onConfirm: () => {
          const res = addFriend(username, displayName);
          if (res.ok) {
            showUserMessage(t('friendsAlerts.addedTitle'), t('friendsAlerts.addedBody', { name: displayName }));
            onAdded?.();
          } else if (res.reason === 'self') {
            showUserMessage(t('friendsAlerts.selfTitle'), t('friendsAlerts.selfBody'));
          } else if (res.reason === 'duplicate') {
            showUserMessage(t('friendsAlerts.duplicateTitle'), t('friendsAlerts.duplicateBody'));
          } else if (res.reason === 'invalid') {
            showUserMessage(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
          } else {
            showUserMessage(t('friendsAlerts.errorTitle'), t('friendsAlerts.errorBody'));
          }
        },
      });
    },
    [addFriend, onAdded, t],
  );

  /** Raw input: username, full QR string, or legacy TCG code. */
  const resolveFromRaw = useCallback(
    (raw: string) => {
      const username = parseFriendInviteFromQr(raw);
      if (!username) {
        showUserMessage(t('friendsAlerts.invalidIdTitle'), t('friendsAlerts.invalidIdBody'));
        return;
      }
      const name = lookupFriendDisplayName(username);
      if (!name) {
        showUserMessage(t('friendsAlerts.notFoundTitle'), t('friendsAlerts.notFoundBody'));
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
        showUserMessage(t('friendsAlerts.notFoundTitle'), t('friendsAlerts.notFoundBody'));
        return;
      }
      promptAddFriend(username, name);
    },
    [promptAddFriend, t],
  );

  return { resolveFromRaw, resolveFromUsername, promptAddFriend };
}
