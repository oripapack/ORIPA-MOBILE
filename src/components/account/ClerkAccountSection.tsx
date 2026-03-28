import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-expo';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';
import { AppUserUnsafeMetadata } from '../../lib/clerkProfile';
import { VaultFramedCard } from '../shared/VaultFramedCard';

/**
 * Username (handle), email, phone — display name lives on the tier card.
 * Renders only when Clerk is configured and the tree is under `ClerkProvider`.
 */
export function ClerkAccountSection() {
  if (!isClerkEnabled) return null;
  return <ClerkAccountSectionInner />;
}

function ClerkAccountSectionInner() {
  const { t } = useTranslation();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const meta = user.unsafeMetadata as AppUserUnsafeMetadata | undefined;
  const appUsername = (meta?.appUsername ?? '').trim();
  const clerkUsername = (user.username ?? '').trim();
  const username = appUsername || clerkUsername;

  const email = user.primaryEmailAddress?.emailAddress;
  const phone = user.primaryPhoneNumber?.phoneNumber;

  return (
    <VaultFramedCard style={styles.wrap}>
      <Text style={styles.eyebrow}>{t('account.accountDetailsEyebrow')}</Text>

      <View style={styles.fieldBlock}>
        <Text style={styles.contactLabel}>{t('account.usernameLabel')}</Text>
        <Text style={username ? styles.contactValue : styles.contactValueMuted} numberOfLines={1}>
          {username || t('account.usernameUnset')}
        </Text>
      </View>

      {email ? (
        <View style={styles.fieldBlock}>
          <Text style={styles.contactLabel}>{t('account.emailLabel')}</Text>
          <Text style={styles.contactValue} numberOfLines={2}>
            {email}
          </Text>
        </View>
      ) : null}

      {phone ? (
        <View style={styles.fieldBlock}>
          <Text style={styles.contactLabel}>{t('account.phoneLabel')}</Text>
          <Text style={styles.contactValue} numberOfLines={2}>
            {phone}
          </Text>
        </View>
      ) : null}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldBlock: {
    marginBottom: spacing.md,
  },
  contactLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  contactValueMuted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
});
