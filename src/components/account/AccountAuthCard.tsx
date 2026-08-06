import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';
import { AppUserUnsafeMetadata } from '../../lib/clerkProfile';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { confirmUserAction } from '../../utils/showUserMessage';
import { VaultFramedCard } from '../shared/VaultFramedCard';

/**
 * Account tab: single source of truth for sign-in state.
 * - Signed in  → real Clerk identity (username / email) + Sign Out.
 * - Guest      → prompt to sign in (opens the auth wall).
 * Renders nothing when Clerk is disabled (no auth available in that build).
 */
export function AccountAuthCard() {
  if (!isClerkEnabled) return null;
  return <AccountAuthCardInner />;
}

function AccountAuthCardInner() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);

  const signedIn = clerkSignedIn && !!user;

  if (!signedIn) {
    return (
      <VaultFramedCard style={styles.card}>
        <Text style={styles.guestEyebrow}>{t('account.guestSignInEyebrow')}</Text>
        <Text style={styles.guestTitle}>{t('account.guestSignInTitle')}</Text>
        <Text style={styles.guestBody}>{t('account.guestSignInBody')}</Text>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={forceAuthWall}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('account.guestSignInCta')}
        >
          <Ionicons name="log-in-outline" size={20} color={sg.text} />
          <Text style={styles.signInBtnText}>{t('account.guestSignInCta')}</Text>
        </TouchableOpacity>
      </VaultFramedCard>
    );
  }

  const meta = user.unsafeMetadata as AppUserUnsafeMetadata | undefined;
  const appUsername = (meta?.appUsername ?? '').trim();
  const clerkUsername = (user.username ?? '').trim();
  const username = appUsername || clerkUsername;
  const email = user.primaryEmailAddress?.emailAddress;

  const onSignOut = () => {
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
    <VaultFramedCard style={styles.card}>
      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={sg.gold} />
        </View>
        <View style={styles.identityMeta}>
          <Text style={styles.signedInLabel}>{t('account.usernameLabel')}</Text>
          <Text style={styles.identityName} numberOfLines={1}>
            {username ? `@${username}` : t('account.usernameUnset')}
          </Text>
          {email ? (
            <Text style={styles.identityEmail} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={onSignOut}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('account.logout')}
      >
        <Ionicons name="log-out-outline" size={18} color={sg.muted} />
        <Text style={styles.signOutBtnText}>{t('account.logout')}</Text>
      </TouchableOpacity>
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  guestEyebrow: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  guestTitle: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.sm,
  },
  guestBody: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: sg.gold,
    borderRadius: sg.radius.btn,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  signInBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  identityMeta: {
    flex: 1,
    minWidth: 0,
  },
  signedInLabel: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  identityName: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  identityEmail: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  signOutBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
  },
});
