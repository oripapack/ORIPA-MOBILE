import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';
import { confirmUserAction, showUserMessage } from '../../utils/showUserMessage';
import { clearLocalAccountData } from '../../lib/clearLocalAccountData';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';

/**
 * Destructive account deletion. Clerk: `user.delete()`. Guest/demo: clear local data.
 */
export function DeleteAccountSection() {
  if (isClerkEnabled) {
    return <DeleteAccountClerk />;
  }
  return <DeleteAccountLocalOnly />;
}

function DeleteAccountClerk() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const [busy, setBusy] = useState(false);

  if (!clerkSignedIn || !user) {
    return <DeleteAccountLocalOnly />;
  }

  const runDelete = () => {
    confirmUserAction({
      title: t('deleteAccount.confirmTitle'),
      message: t('deleteAccount.confirmBody'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('deleteAccount.confirmAction'),
      destructive: true,
      onConfirm: () => {
        void (async () => {
          setBusy(true);
          try {
            await user.delete();
            await clearLocalAccountData();
            try {
              await signOut();
            } catch {
              /* session may already be cleared after delete */
            }
            showUserMessage(t('deleteAccount.doneTitle'), t('deleteAccount.doneBody'));
          } catch {
            showUserMessage(t('deleteAccount.errorTitle'), t('deleteAccount.errorBody'));
          } finally {
            setBusy(false);
          }
        })();
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionHeader}>{t('deleteAccount.section')}</Text>
      <Text style={styles.lead}>{t('deleteAccount.lead')}</Text>
      <TouchableOpacity
        style={[styles.btn, busy && styles.btnDisabled]}
        onPress={runDelete}
        disabled={busy}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t('deleteAccount.cta')}
      >
        {busy ? (
          <ActivityIndicator color={sg.error} />
        ) : (
          <Text style={styles.btnText}>{t('deleteAccount.cta')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function DeleteAccountLocalOnly() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const runClear = () => {
    confirmUserAction({
      title: t('deleteAccount.localConfirmTitle'),
      message: t('deleteAccount.localConfirmBody'),
      cancelLabel: t('common.cancel'),
      confirmLabel: t('deleteAccount.localConfirmAction'),
      destructive: true,
      onConfirm: () => {
        void (async () => {
          setBusy(true);
          try {
            await clearLocalAccountData();
            showUserMessage(t('deleteAccount.localDoneTitle'), t('deleteAccount.localDoneBody'));
          } catch {
            showUserMessage(t('deleteAccount.errorTitle'), t('deleteAccount.errorBody'));
          } finally {
            setBusy(false);
          }
        })();
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionHeader}>{t('deleteAccount.section')}</Text>
      <Text style={styles.lead}>{t('deleteAccount.localLead')}</Text>
      <TouchableOpacity
        style={[styles.btn, busy && styles.btnDisabled]}
        onPress={runClear}
        disabled={busy}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t('deleteAccount.localCta')}
      >
        {busy ? (
          <ActivityIndicator color={sg.error} />
        ) : (
          <Text style={styles.btnText}>{t('deleteAccount.localCta')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  lead: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  btn: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.error,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: fontSize.md,
    fontFamily: brandFont.semibold,
    color: sg.error,
  },
});
