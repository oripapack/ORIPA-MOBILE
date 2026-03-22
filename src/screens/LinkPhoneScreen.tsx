import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isClerkAPIResponseError, useClerk, useUser } from '@clerk/clerk-expo';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { getAppLogoParts } from '../config/app';
import { hasVerifiedPhone, normalizeE164 } from '../lib/clerkPhone';

type Phase = 'phone' | 'code';

/**
 * After OAuth/email sign-in: collect & verify a phone number on the Clerk user.
 * Dashboard: User & authentication → Phone → enable SMS / verification (sign-in with phone can stay off).
 */
export function LinkPhoneScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const [phase, setPhase] = useState<Phase>('phone');
  const [rawPhone, setRawPhone] = useState('');
  const [code, setCode] = useState('');
  const [pendingPhoneId, setPendingPhoneId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { primary, secondary } = getAppLogoParts();

  const onSubmitPhone = useCallback(async () => {
    if (!user) return;
    setError(null);
    const phoneNumber = normalizeE164(rawPhone);
    if (phoneNumber.length < 8) {
      setError(t('linkPhone.invalid'));
      return;
    }

    setBusy(true);
    try {
      if (hasVerifiedPhone(user)) {
        return;
      }

      const phone = await user.createPhoneNumber({ phoneNumber });
      await phone.prepareVerification();
      setPendingPhoneId(phone.id);
      setPhase('code');
      setCode('');
    } catch (e: unknown) {
      if (isClerkAPIResponseError(e)) {
        const msg = e.errors?.[0]?.message;
        setError(msg ?? t('linkPhone.genericError'));
      } else {
        setError(e instanceof Error ? e.message : t('linkPhone.genericError'));
      }
    } finally {
      setBusy(false);
    }
  }, [rawPhone, t, user]);

  const onVerifyCode = useCallback(async () => {
    if (!user || !pendingPhoneId) return;
    setError(null);
    setBusy(true);
    try {
      const phone = user.phoneNumbers.find((p) => p.id === pendingPhoneId);
      if (!phone) {
        setError(t('linkPhone.phoneMissing'));
        setPhase('phone');
        setPendingPhoneId(null);
        return;
      }

      const result = await phone.attemptVerification({ code: code.trim() });
      if (result.verification?.status === 'verified') {
        await user.reload();
        return;
      }
      setError(t('linkPhone.verifyFailed'));
    } catch (e: unknown) {
      if (isClerkAPIResponseError(e)) {
        const msg = e.errors?.[0]?.message;
        setError(msg ?? t('linkPhone.verifyFailed'));
      } else {
        setError(e instanceof Error ? e.message : t('linkPhone.verifyFailed'));
      }
    } finally {
      setBusy(false);
    }
  }, [code, pendingPhoneId, t, user]);

  const onResend = useCallback(async () => {
    if (!user || !pendingPhoneId) return;
    setError(null);
    setBusy(true);
    try {
      const phone = user.phoneNumbers.find((p) => p.id === pendingPhoneId);
      await phone?.prepareVerification();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('linkPhone.genericError'));
    } finally {
      setBusy(false);
    }
  }, [pendingPhoneId, t, user]);

  const onSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (!isLoaded || !user) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (hasVerifiedPhone(user)) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <Text style={styles.logoPrimary}>{primary}</Text>
          {secondary ? <Text style={styles.logoSecondary}>{secondary}</Text> : null}
        </View>

        <Text style={styles.title}>{t('linkPhone.title')}</Text>
        <Text style={styles.subtitle}>{t('linkPhone.subtitle')}</Text>

        {phase === 'phone' ? (
          <>
            <TextInput
              style={styles.input}
              value={rawPhone}
              onChangeText={setRawPhone}
              placeholder={t('linkPhone.phonePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              editable={!busy}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, busy && styles.btnDisabled]}
              onPress={() => void onSubmitPhone()}
              disabled={busy}
              activeOpacity={0.88}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>{t('linkPhone.sendCode')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.verifyHint}>{t('linkPhone.codeHint')}</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder={t('linkPhone.codePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={8}
              editable={!busy}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, busy && styles.btnDisabled]}
              onPress={() => void onVerifyCode()}
              disabled={busy}
              activeOpacity={0.88}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>{t('linkPhone.verify')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void onResend()} disabled={busy} style={styles.linkWrap}>
              <Text style={styles.link}>{t('linkPhone.resend')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPhase('phone');
                setPendingPhoneId(null);
                setCode('');
                setError(null);
              }}
              disabled={busy}
              style={styles.linkWrap}
            >
              <Text style={styles.linkMuted}>{t('linkPhone.changeNumber')}</Text>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.hint}>{t('linkPhone.dashboardHint')}</Text>

        <TouchableOpacity onPress={onSignOut} style={styles.signOutWrap} disabled={busy}>
          <Text style={styles.linkMuted}>{t('linkPhone.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: spacing.xl,
  },
  logoPrimary: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
    letterSpacing: -0.5,
  },
  logoSecondary: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    color: colors.red,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  verifyHint: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  linkWrap: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.red,
  },
  linkMuted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  error: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.redDark,
    lineHeight: 20,
  },
  hint: {
    marginTop: spacing.xl,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  signOutWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
