import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';
import { AppUserUnsafeMetadata } from '../../lib/clerkProfile';

/**
 * Renders only when Clerk is configured and the tree is under `ClerkProvider`.
 */
export function ClerkAccountSection() {
  if (!isClerkEnabled) return null;
  return <ClerkAccountSectionInner />;
}

function ClerkAccountSectionInner() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const meta = user.unsafeMetadata as AppUserUnsafeMetadata | undefined;
  const appProfileName = (meta?.appDisplayName || meta?.appUsername)?.trim();
  const name =
    appProfileName ||
    (typeof user?.fullName === 'string' && user.fullName.trim()) ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.username ||
    email;

  const onSignOut = () => {
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
      <Text style={styles.eyebrow}>{t('auth.signedInAs')}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {name || '—'}
      </Text>
      {email ? (
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.outBtn} onPress={onSignOut} activeOpacity={0.88}>
        <Text style={styles.outBtnText}>{t('auth.signOut')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    padding: spacing.base,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  email: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  outBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  outBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
