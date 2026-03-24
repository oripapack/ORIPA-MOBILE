import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useClerk, useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { getAppLogoParts } from '../config/app';
import { useGuestBrowseStore } from '../store/guestBrowseStore';

/** Narrow types for Clerk’s email/password + verification helpers (see Clerk custom-flow docs). */
type ClerkSignInPwd = {
  password: (args: { emailAddress: string; password: string }) => Promise<{ error: unknown } | void>;
};

type ClerkSignUpPwd = {
  password: (args: { emailAddress: string; password: string }) => Promise<{ error: unknown } | void>;
  verifications: {
    sendEmailCode: () => Promise<void>;
    verifyEmailCode: (args: { code: string }) => Promise<void>;
  };
};

type OAuthProvider = 'google' | 'apple';
type EmailMode = 'signin' | 'signup';
type SignupPhase = 'form' | 'verify';

type AuthScreenProps = {
  /** Welcome screen: signup promo strip + skip to browse as guest. */
  welcomeMode?: boolean;
};

/**
 * OAuth: enable `oauth_google` / `oauth_apple` in Clerk → SSO connections.
 * Email: enable email + password + verification code in Clerk → User & authentication.
 */
export function AuthScreen({ welcomeMode = false }: AuthScreenProps) {
  const { t } = useTranslation();
  const welcomePromoSeen = useGuestBrowseStore((s) => s.welcomePromoSeen);
  const setGuestBrowseEnabled = useGuestBrowseStore((s) => s.setGuestBrowseEnabled);
  const markWelcomePromoSeen = useGuestBrowseStore((s) => s.markWelcomePromoSeen);
  const clearAuthWall = useGuestBrowseStore((s) => s.clearAuthWall);
  const insets = useSafeAreaInsets();
  const { setActive } = useClerk();
  const { startSSOFlow } = useSSO();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();

  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [signupPhase, setSignupPhase] = useState<SignupPhase>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const { primary, secondary } = getAppLogoParts();

  const setMode = (m: EmailMode) => {
    setEmailMode(m);
    setSignupPhase('form');
    setError(null);
    setCode('');
  };

  const activateSession = useCallback(
    async (sessionId: string | null | undefined) => {
      if (sessionId) {
        await setActive({ session: sessionId });
        void markWelcomePromoSeen();
      }
    },
    [markWelcomePromoSeen, setActive],
  );

  const runOAuth = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple', label: OAuthProvider) => {
      setError(null);
      setOauthBusy(label);
      try {
        const { createdSessionId } = await startSSOFlow({ strategy });
        if (createdSessionId) {
          await activateSession(createdSessionId);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setOauthBusy(null);
      }
    },
    [activateSession, startSSOFlow],
  );

  const onGoogle = () => runOAuth('oauth_google', 'google');
  const onApple = () => runOAuth('oauth_apple', 'apple');

  const onSkipBrowse = useCallback(() => {
    void (async () => {
      await setGuestBrowseEnabled(true);
      await markWelcomePromoSeen();
      clearAuthWall();
    })();
  }, [clearAuthWall, markWelcomePromoSeen, setGuestBrowseEnabled]);

  const onEmailSubmit = useCallback(async () => {
    if (!signInLoaded || !signUpLoaded) return;
    setError(null);
    setEmailBusy(true);
    try {
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setError(t('auth.emailPasswordRequired'));
        return;
      }

      if (emailMode === 'signin') {
        // Clerk future API — typings can lag; runtime matches dashboard guides.
        const res = await (signIn as unknown as ClerkSignInPwd).password({ emailAddress: trimmed, password });
        if (res?.error) {
          const err = res.error as { message?: string };
          setError(err.message ?? String(res.error));
          return;
        }
        if (signIn.status === 'complete') {
          await activateSession(signIn.createdSessionId);
        } else {
          setError(t('auth.signInIncomplete'));
        }
        return;
      }

      // Sign up
      if (signupPhase === 'form') {
        const res = await (signUp as unknown as ClerkSignUpPwd).password({ emailAddress: trimmed, password });
        if (res?.error) {
          const err = res.error as { message?: string };
          setError(err.message ?? String(res.error));
          return;
        }
        await (signUp as unknown as ClerkSignUpPwd).verifications.sendEmailCode();
        setSignupPhase('verify');
        return;
      }

      // Verify email code
      await (signUp as unknown as ClerkSignUpPwd).verifications.verifyEmailCode({ code: code.trim() });
      if (signUp.status === 'complete') {
        await activateSession(signUp.createdSessionId);
      } else {
        setError(t('auth.verifyFailed'));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setEmailBusy(false);
    }
  }, [
    activateSession,
    code,
    email,
    emailMode,
    password,
    signIn,
    signInLoaded,
    signUp,
    signUpLoaded,
    signupPhase,
    t,
  ]);

  const onResendCode = useCallback(async () => {
    if (!signUpLoaded) return;
    setError(null);
    setEmailBusy(true);
    try {
      await (signUp as unknown as ClerkSignUpPwd).verifications.sendEmailCode();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setEmailBusy(false);
    }
  }, [signUp, signUpLoaded]);

  const oauthDisabled = oauthBusy !== null || emailBusy;
  const emailDisabled = emailBusy || oauthBusy !== null;

  if (!signInLoaded || !signUpLoaded) {
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

        <Text style={styles.title}>{t('auth.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        {welcomeMode && !welcomePromoSeen ? (
          <View style={styles.promoBanner} accessibilityRole="text">
            <Text style={styles.promoBannerTitle}>{t('welcome.signupPromoTitle')}</Text>
            <Text style={styles.promoBannerBody}>{t('welcome.signupPromoBody')}</Text>
          </View>
        ) : null}

        {/* OAuth */}
        <TouchableOpacity
          style={[styles.oauthBtn, oauthDisabled && styles.btnDisabled]}
          onPress={onGoogle}
          disabled={oauthDisabled}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('auth.continueGoogle')}
        >
          {oauthBusy === 'google' ? (
            <ActivityIndicator color={colors.nearBlack} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.oauthText}>{t('auth.continueGoogle')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthBtn, styles.appleBtn, oauthDisabled && styles.btnDisabled]}
          onPress={onApple}
          disabled={oauthDisabled}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('auth.continueApple')}
        >
          {oauthBusy === 'apple' ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="logo-apple" size={22} color={colors.white} />
              <Text style={styles.appleText}>{t('auth.continueApple')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email mode */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            onPress={() => setMode('signin')}
            style={[styles.modeChip, emailMode === 'signin' && styles.modeChipOn]}
          >
            <Text style={[styles.modeChipText, emailMode === 'signin' && styles.modeChipTextOn]}>
              {t('auth.modeSignIn')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('signup')}
            style={[styles.modeChip, emailMode === 'signup' && styles.modeChipOn]}
          >
            <Text style={[styles.modeChipText, emailMode === 'signup' && styles.modeChipTextOn]}>
              {t('auth.modeSignUp')}
            </Text>
          </TouchableOpacity>
        </View>

        {emailMode === 'signup' && signupPhase === 'verify' ? (
          <>
            <Text style={styles.verifyHint}>{t('auth.verifyHint', { email: email.trim() })}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.codePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailDisabled}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, emailDisabled && styles.btnDisabled]}
              onPress={onEmailSubmit}
              disabled={emailDisabled}
            >
              {emailBusy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>{t('auth.verifyCode')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onResendCode} disabled={emailDisabled}>
              <Text style={styles.link}>{t('auth.resendCode')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailDisabled}
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!emailDisabled}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, emailDisabled && styles.btnDisabled]}
              onPress={onEmailSubmit}
              disabled={emailDisabled}
            >
              {emailBusy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {emailMode === 'signin' ? t('auth.emailSignIn') : t('auth.emailContinue')}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        {welcomeMode ? (
          <>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onSkipBrowse}
              disabled={oauthDisabled || emailBusy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('welcome.skip')}
            >
              <Text style={styles.skipBtnText}>{t('welcome.skip')}</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>{t('welcome.guestHint')}</Text>
          </>
        ) : (
          <Text style={styles.hint}>{t('auth.dashboardHint')}</Text>
        )}
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
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    marginBottom: spacing.sm,
  },
  appleBtn: {
    backgroundColor: colors.nearBlack,
    borderColor: colors.nearBlack,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  googleIcon: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#4285F4',
  },
  oauthText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.nearBlack,
  },
  appleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  modeChipOn: {
    borderColor: colors.nearBlack,
    backgroundColor: '#FAFAFA',
  },
  modeChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  modeChipTextOn: {
    color: colors.nearBlack,
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
  verifyHint: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  link: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.red,
    textAlign: 'center',
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
  promoBanner: {
    backgroundColor: '#FFF7ED',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FDBA74',
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  promoBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.nearBlack,
    marginBottom: spacing.xs,
  },
  promoBannerBody: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  skipBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
});
