import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { ListRow } from '../shared/ListRow';
import { confirmUserAction } from '../../utils/showUserMessage';

/**
 * Must only render under `ClerkProvider` when the user is signed in.
 * Parent should gate `isClerkEnabled && clerkSignedIn`.
 */
export function ClerkLogoutRow() {
  const { t } = useTranslation();
  const { signOut } = useClerk();

  return (
    <ListRow
      label={t('account.logout')}
      icon={<Ionicons name="log-out-outline" size={20} color={sg.error} />}
      destructive
      showChevron={false}
      onPress={() =>
        confirmUserAction({
          title: t('auth.signOutTitle'),
          message: t('auth.signOutMessage'),
          cancelLabel: t('auth.cancel'),
          confirmLabel: t('auth.signOutConfirm'),
          destructive: true,
          onConfirm: () => void signOut(),
        })
      }
    />
  );
}
