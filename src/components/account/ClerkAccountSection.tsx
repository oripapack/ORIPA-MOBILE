import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { isClerkEnabled } from '../../config/clerk';
import { AppUserUnsafeMetadata } from '../../lib/clerkProfile';
import { VaultFramedCard } from '../shared/VaultFramedCard';

/**
 * Settings (and similar): signed-in identity — username, email, phone.
 * Renders section title + card only when Clerk is on and `useUser()` is available.
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
    <>
      <Text style={styles.sectionHeader}>{t('settings.sectionProfile')}</Text>
      <VaultFramedCard style={styles.wrap} contentStyle={styles.cardInner}>
        <View style={[styles.fieldBlock, !email && !phone && styles.fieldBlockLast]}>
          <Text style={styles.contactLabel}>{t('account.usernameLabel')}</Text>
          <Text style={username ? styles.contactValue : styles.contactValueMuted} numberOfLines={1}>
            {username || t('account.usernameUnset')}
          </Text>
        </View>

        {email ? (
          <View style={[styles.fieldBlock, !phone && styles.fieldBlockLast]}>
            <Text style={styles.contactLabel}>{t('account.emailLabel')}</Text>
            <Text style={styles.contactValue} numberOfLines={2}>
              {email}
            </Text>
          </View>
        ) : null}

        {phone ? (
          <View style={[styles.fieldBlock, styles.fieldBlockLast]}>
            <Text style={styles.contactLabel}>{t('account.phoneLabel')}</Text>
            <Text style={styles.contactValue} numberOfLines={2}>
              {phone}
            </Text>
          </View>
        ) : null}
      </VaultFramedCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: sg.space.sm,
    marginBottom: sg.space.xs,
    paddingLeft: sg.space.xs,
  },
  wrap: {
    marginBottom: sg.space.lg,
  },
  cardInner: {
    paddingTop: sg.space.md,
    paddingBottom: sg.space.md,
  },
  fieldBlock: {
    marginBottom: sg.space.md,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  contactLabel: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  contactValueMuted: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
});
