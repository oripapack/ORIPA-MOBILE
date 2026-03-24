import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-expo';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';

/**
 * Single sign-out control for the Player tab — centered at the bottom for reach.
 * Parent should pass `visible` when Clerk is on and the user is signed in.
 * Only mounts the inner tree when Clerk is configured (requires `ClerkProvider`).
 */
export function AccountSignOutFooter({ visible }: { visible: boolean }) {
  if (!isClerkEnabled) {
    return null;
  }
  return <AccountSignOutFooterInner visible={visible} />;
}

function AccountSignOutFooterInner({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const { signOut } = useClerk();

  if (!visible) {
    return null;
  }

  const onPress = () => {
    Alert.alert(t('auth.signOutTitle'), t('auth.signOutMessage'), [
      { text: t('auth.cancel'), style: 'cancel' },
      {
        text: t('auth.signOutConfirm'),
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t('account.logout')}
      >
        <Text style={styles.btnText}>{t('account.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  btn: {
    minWidth: 200,
    maxWidth: 320,
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
