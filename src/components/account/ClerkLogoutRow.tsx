import React from 'react';
import { Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-expo';
import { ListRow } from '../shared/ListRow';

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
        Alert.alert(t('auth.signOutTitle'), t('auth.signOutMessage'), [
          { text: t('auth.cancel'), style: 'cancel' },
          {
            text: t('auth.signOutConfirm'),
            style: 'destructive',
            onPress: () => void signOut(),
          },
        ])
      }
    />
  );
}
