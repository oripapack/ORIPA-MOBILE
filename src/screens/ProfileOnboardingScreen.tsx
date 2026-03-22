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
import { useClerk, useUser } from '@clerk/clerk-expo';
import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { getAppLogoParts } from '../config/app';
import {
  AppUserUnsafeMetadata,
  isValidAppUsername,
  memberIdFromClerkUserId,
  normalizeDisplayName,
} from '../lib/clerkProfile';

function mergeUnsafeMetadata(
  user: { unsafeMetadata?: unknown },
  patch: AppUserUnsafeMetadata,
): Record<string, unknown> {
  const cur = user.unsafeMetadata;
  const base =
    cur && typeof cur === 'object' && !Array.isArray(cur) ? { ...(cur as Record<string, unknown>) } : {};
  return { ...base, ...patch };
}

/**
 * After phone verification: choose a public username and optional display name.
 * Persisted on Clerk `unsafeMetadata` (sync to Supabase profiles later).
 */
export function ProfileOnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { primary, secondary } = getAppLogoParts();

  const onSubmit = useCallback(async () => {
    if (!user) return;
    setError(null);

    const u = username.trim();
    if (!isValidAppUsername(u)) {
      setError(t('profileOnboarding.usernameInvalid'));
      return;
    }

    const d = normalizeDisplayName(displayName);
    const meta = user.unsafeMetadata as AppUserUnsafeMetadata | undefined;
    const memberId = meta?.appMemberId ?? memberIdFromClerkUserId(user.id);

    setBusy(true);
    try {
      await user.update({
        unsafeMetadata: mergeUnsafeMetadata(user, {
          onboardingComplete: true,
          appUsername: u,
          appDisplayName: d || u,
          appMemberId: memberId,
        }),
      });
      await user.reload();
    } catch (e: unknown) {
      if (isClerkAPIResponseError(e)) {
        const msg = e.errors?.[0]?.message;
        setError(msg ?? t('profileOnboarding.genericError'));
      } else {
        setError(e instanceof Error ? e.message : t('profileOnboarding.genericError'));
      }
    } finally {
      setBusy(false);
    }
  }, [displayName, t, user, username]);

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

        <Text style={styles.title}>{t('profileOnboarding.title')}</Text>
        <Text style={styles.subtitle}>{t('profileOnboarding.subtitle')}</Text>

        <Text style={styles.label}>{t('profileOnboarding.usernameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder={t('profileOnboarding.usernamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          editable={!busy}
        />

        <Text style={styles.label}>{t('profileOnboarding.displayNameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('profileOnboarding.displayNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          editable={!busy}
        />

        <Text style={styles.hintInline}>{t('profileOnboarding.memberIdHint')}</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, busy && styles.btnDisabled]}
          onPress={() => void onSubmit()}
          disabled={busy}
          activeOpacity={0.88}
          accessibilityRole="button"
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>{t('profileOnboarding.continue')}</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
    marginBottom: spacing.md,
  },
  hintInline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
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
  error: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.redDark,
    lineHeight: 20,
  },
  linkMuted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  signOutWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
