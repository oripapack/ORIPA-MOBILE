import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-expo';
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
      icon={<Text>🚪</Text>}
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
