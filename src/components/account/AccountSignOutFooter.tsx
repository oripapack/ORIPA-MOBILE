import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { isClerkEnabled } from '../../config/clerk';
import { confirmUserAction } from '../../utils/showUserMessage';

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
    confirmUserAction({
      title: t('auth.signOutTitle'),
      message: t('auth.signOutMessage'),
      cancelLabel: t('auth.cancel'),
      confirmLabel: t('auth.signOutConfirm'),
      destructive: true,
      onConfirm: () => void signOut(),
    });
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
    marginTop: sg.space.lg,
    marginBottom: sg.space.lg,
    paddingHorizontal: sg.space.md,
  },
  btn: {
    minWidth: 200,
    maxWidth: 320,
    width: '100%',
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
});
