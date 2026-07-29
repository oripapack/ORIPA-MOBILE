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
import { sg } from '../tokens/sg';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { getAppLogoParts } from '../config/app';
import { AppUserUnsafeMetadata, isValidAppUsername, normalizeDisplayName } from '../lib/clerkProfile';
import { SgScreen } from '../components/ui';
import { PrimaryButton } from '../components/shared/PrimaryButton';

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

    setBusy(true);
    try {
      await user.update({
        unsafeMetadata: mergeUnsafeMetadata(user, {
          onboardingComplete: true,
          appUsername: u,
          appDisplayName: d || u,
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
      <SgScreen style={styles.centered}>
        <ActivityIndicator size="large" color={sg.gold} />
      </SgScreen>
    );
  }

  return (
    <SgScreen style={styles.screenRoot}>
      
      <KeyboardAvoidingView
        style={styles.flexOverBg}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
      >
      <ScrollView
        style={styles.flexOverBg}
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
          placeholderTextColor={sg.muted}
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
          placeholderTextColor={sg.muted}
          autoCapitalize="words"
          editable={!busy}
        />

        <Text style={styles.hintInline}>{t('profileOnboarding.profileHint')}</Text>

        <PrimaryButton
          label={t('profileOnboarding.continue')}
          onPress={() => void onSubmit()}
          disabled={busy}
          loading={busy}
          style={styles.primaryBtnWrap}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={onSignOut} style={styles.signOutWrap} disabled={busy}>
          <Text style={styles.linkMuted}>{t('linkPhone.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  flexOverBg: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
  },
  logoSecondary: {
    fontSize: fontSize.hero,
    fontFamily: sg.font.display,
    color: sg.gold,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontFamily: sg.font.body,
    color: sg.text,
    marginBottom: spacing.md,
  },
  hintInline: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  primaryBtnWrap: {
    marginTop: spacing.xs,
  },
  error: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    lineHeight: 20,
  },
  linkMuted: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  signOutWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
