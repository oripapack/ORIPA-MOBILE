import React, { useCallback, useEffect, useState } from 'react';
import { sg } from '../tokens/sg';
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
import { SgScreen } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useClerk, useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
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
  /** When opened from onboarding / conversion modals. */
  initialEmailMode?: EmailMode;
  /** Modal close (e.g. page sheet). */
  onRequestClose?: () => void;
  /**
   * When set with `welcomeMode`, “Browse without signing in” calls this instead of the guest-wall
   * defaults (e.g. first-launch gate uses the same dismiss confirmation as the close button).
   */
  onWelcomeSkip?: () => void;
  /** Compact bottom sheet — less padding, transparent bg (gradient is on shell). */
  presentation?: 'full' | 'sheet';
};

/**
 * OAuth: enable `oauth_google` / `oauth_apple` in Clerk → SSO connections.
 * Email: enable email + password + verification code in Clerk → User & authentication.
 */
export function AuthScreen({
  welcomeMode = false,
  initialEmailMode,
  onRequestClose,
  onWelcomeSkip,
  presentation = 'full',
}: AuthScreenProps) {
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

  const [emailMode, setEmailMode] = useState<EmailMode>(initialEmailMode ?? 'signin');
  const [signupPhase, setSignupPhase] = useState<SignupPhase>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const setMode = (m: EmailMode) => {
    setEmailMode(m);
    setSignupPhase('form');
    setError(null);
    setCode('');
  };

  useEffect(() => {
    if (initialEmailMode) setEmailMode(initialEmailMode);
  }, [initialEmailMode]);

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
        // On web, Clerk returns to /sso-callback — handled by ClerkSsoCallbackHandler.
        const redirectUrl =
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/sso-callback`
            : undefined;
        const { createdSessionId, setActive: setActiveFromFlow } = await startSSOFlow({
          strategy,
          ...(redirectUrl ? { redirectUrl } : null),
        });
        if (createdSessionId) {
          if (setActiveFromFlow) {
            await setActiveFromFlow({ session: createdSessionId });
          } else {
            await activateSession(createdSessionId);
          }
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
    if (onWelcomeSkip) {
      onWelcomeSkip();
      return;
    }
    void (async () => {
      await setGuestBrowseEnabled(true);
      await markWelcomePromoSeen();
      clearAuthWall();
    })();
  }, [clearAuthWall, markWelcomePromoSeen, onWelcomeSkip, setGuestBrowseEnabled]);

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
  const isSheet = presentation === 'sheet';

  if (!signInLoaded || !signUpLoaded) {
    const loading = (
      <View
        style={[
          styles.centered,
          isSheet && styles.centeredSheet,
          !isSheet && styles.centeredOnArt,
          { paddingTop: isSheet ? 0 : insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={isSheet ? sg.error : sg.gold} />
      </View>
    );
    if (isSheet) {
      return <View style={styles.sheetOuter}>{loading}</View>;
    }
    return <SgScreen style={styles.welcomeScreenRoot}>{loading}</SgScreen>;
  }

  const body = (
    <>
      <KeyboardAvoidingView
        style={[isSheet ? styles.flexSheet : styles.flexOverWelcome]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (isSheet ? 24 : 48) : 0}
      >
      <ScrollView
        style={[isSheet ? styles.flex : styles.scrollOnArt, isSheet && styles.scrollSheet]}
        contentContainerStyle={[
          styles.scrollContent,
          isSheet && styles.scrollContentSheet,
          {
            paddingTop: isSheet ? spacing.sm : insets.top + spacing.lg,
            /* Sheet shell already applies bottom safe area — extra scroll padding only */
            paddingBottom: isSheet ? spacing.xl : insets.bottom + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        stickyHeaderIndices={isSheet && onRequestClose ? [0] : undefined}
      >
        {onRequestClose ? (
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderSpacer} />
            <TouchableOpacity
              onPress={onRequestClose}
              hitSlop={14}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={isSheet ? 22 : 26} color={sg.muted} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={[styles.logoRow, isSheet && styles.logoRowSheet]}>
          <Text style={[styles.logoPrimary, isSheet && styles.logoPrimarySheet]}>PULL.HUB</Text>
          <Text style={styles.accessLabel}>TOKYO TERMINAL / ACCESS</Text>
        </View>

        <Text style={[styles.title, isSheet && styles.titleSheet]}>
          {t(emailMode === 'signup' ? 'auth.modeSignUp' : 'auth.title')}
        </Text>
        <Text
          style={[styles.subtitle, isSheet && styles.subtitleSheet]}
          numberOfLines={isSheet ? 3 : undefined}
        >
          {t('auth.subtitle')}
        </Text>

        {welcomeMode && isSheet ? (
          <Text style={styles.flowMapLine} accessibilityRole="text">
            {t('welcome.flowMapLine')}
          </Text>
        ) : null}

        {welcomeMode && !welcomePromoSeen ? (
          <View
            style={[
              styles.promoBanner,
              isSheet && styles.promoBannerSheet,
              !isSheet && styles.promoBannerOnArt,
            ]}
            accessibilityRole="text"
          >
            <Text
              style={[
                styles.promoBannerTitle,
                isSheet && styles.promoBannerTitleSheet,
                !isSheet && styles.promoBannerTitleOnArt,
              ]}
            >
              {t('welcome.signupPromoTitle')}
            </Text>
            <Text
              style={[
                styles.promoBannerBody,
                isSheet && styles.promoBannerBodySheet,
                !isSheet && styles.promoBannerBodyOnArt,
              ]}
            >
              {t('welcome.signupPromoBody')}
            </Text>
          </View>
        ) : null}

        {/* OAuth */}
        <TouchableOpacity
          style={[styles.oauthBtn, isSheet && styles.oauthBtnSheet, oauthDisabled && styles.btnDisabled]}
          onPress={onGoogle}
          disabled={oauthDisabled}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('auth.continueGoogle')}
        >
          {oauthBusy === 'google' ? (
            <ActivityIndicator color={sg.text} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.oauthText}>{t('auth.continueGoogle')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.oauthBtn, styles.appleBtn, isSheet && styles.oauthBtnSheet, isSheet && styles.appleBtnSheet, oauthDisabled && styles.btnDisabled]}
          onPress={onApple}
          disabled={oauthDisabled}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('auth.continueApple')}
        >
          {oauthBusy === 'apple' ? (
            <ActivityIndicator color={sg.text} />
          ) : (
            <>
              <Ionicons name="logo-apple" size={22} color={sg.text} />
              <Text style={styles.appleText}>{t('auth.continueApple')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={[styles.dividerRow, isSheet && styles.dividerRowSheet]}>
          <View style={[styles.dividerLine, isSheet && styles.dividerLineSheet]} />
          <Text style={[styles.dividerText, isSheet && styles.dividerTextSheet]}>{t('auth.or')}</Text>
          <View style={[styles.dividerLine, isSheet && styles.dividerLineSheet]} />
        </View>

        {/* Email mode */}
        <View style={[styles.modeRow, isSheet && styles.modeRowSheet]}>
          <TouchableOpacity
            onPress={() => setMode('signin')}
            style={[
              styles.modeChip,
              isSheet && styles.modeChipSheet,
              emailMode === 'signin' && (isSheet ? styles.modeChipOnSheet : styles.modeChipOn),
            ]}
          >
            <Text
              style={[
                styles.modeChipText,
                isSheet && styles.modeChipTextSheet,
                emailMode === 'signin' && (isSheet ? styles.modeChipTextOnSheet : styles.modeChipTextOn),
              ]}
            >
              {t('auth.modeSignIn')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('signup')}
            style={[
              styles.modeChip,
              isSheet && styles.modeChipSheet,
              emailMode === 'signup' && (isSheet ? styles.modeChipOnSheet : styles.modeChipOn),
            ]}
          >
            <Text
              style={[
                styles.modeChipText,
                isSheet && styles.modeChipTextSheet,
                emailMode === 'signup' && (isSheet ? styles.modeChipTextOnSheet : styles.modeChipTextOn),
              ]}
            >
              {t('auth.modeSignUp')}
            </Text>
          </TouchableOpacity>
        </View>

        {emailMode === 'signup' && signupPhase === 'verify' ? (
          <>
            <Text style={styles.verifyHint}>{t('auth.verifyHint', { email: email.trim() })}</Text>
            <TextInput
              style={[styles.input, isSheet && styles.inputSheet]}
              placeholder={t('auth.codePlaceholder')}
              placeholderTextColor={sg.muted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailDisabled}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isSheet && styles.primaryBtnSheet, emailDisabled && styles.btnDisabled]}
              onPress={onEmailSubmit}
              disabled={emailDisabled}
            >
              {emailBusy ? (
                <ActivityIndicator color={sg.onValue} />
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
              style={[styles.input, isSheet && styles.inputSheet]}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={sg.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailDisabled}
            />
            <TextInput
              style={[styles.input, isSheet && styles.inputSheet]}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={sg.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!emailDisabled}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isSheet && styles.primaryBtnSheet, emailDisabled && styles.btnDisabled]}
              onPress={onEmailSubmit}
              disabled={emailDisabled}
            >
              {emailBusy ? (
                <ActivityIndicator color={sg.onValue} />
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
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );

  if (isSheet) {
    return <View style={styles.sheetOuter}>{body}</View>;
  }
  return <SgScreen style={styles.welcomeScreenRoot}>{body}</SgScreen>;
}

const styles = StyleSheet.create({
  welcomeScreenRoot: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  sheetOuter: {
    flex: 1,
  },
  flex: { flex: 1, backgroundColor: sg.surface2 },
  flexOverWelcome: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollOnArt: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flexSheet: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  centeredOnArt: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollSheet: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
  },
  scrollContentSheet: {
    flexGrow: 0,
    paddingHorizontal: sg.space.md,
  },
  logoRowSheet: {
    marginBottom: spacing.sm,
  },
  logoPrimarySheet: {
    fontSize: fontSize.xxl,
  },
  logoSecondarySheet: {
    fontSize: fontSize.xxl,
  },
  titleSheet: {
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
    color: sg.text,
    fontFamily: sg.font.display,
  },
  subtitleSheet: {
    marginBottom: sg.space.md,
    lineHeight: 22,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  flowMapLine: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    letterSpacing: 0.2,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    lineHeight: 17,
  },
  dividerRowSheet: {
    marginVertical: sg.space.md,
  },
  dividerLineSheet: {
    backgroundColor: sg.line,
  },
  dividerTextSheet: {
    color: sg.muted,
  },
  oauthBtnSheet: {
    backgroundColor: sg.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    minHeight: 48,
    paddingVertical: 12,
  },
  appleBtnSheet: {
    backgroundColor: sg.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  modeChipSheet: {
    backgroundColor: sg.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    paddingVertical: 12,
    minHeight: 46,
  },
  modeChipOnSheet: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.cobaltBorder,
    backgroundColor: sg.cobaltWashStrong,
  },
  modeChipTextSheet: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
  },
  modeChipTextOnSheet: {
    color: sg.text,
    fontFamily: sg.font.display,
  },
  modeRowSheet: {
    marginTop: spacing.xs,
    marginBottom: sg.space.md,
    gap: sg.space.sm,
  },
  inputSheet: {
    backgroundColor: sg.surface2,
    borderColor: sg.line,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryBtnSheet: {
    shadowColor: sg.value,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  hintSheet: {
    color: sg.muted,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: sg.surface2,
  },
  centeredSheet: {
    flex: 1,
    minHeight: 200,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 36,
    marginBottom: sg.space.sm,
    paddingVertical: sg.space.xs,
    backgroundColor: sg.surface,
    zIndex: 2,
  },
  modalHeaderSpacer: {
    flex: 1,
  },
  logoRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  logoPrimary: {
    fontSize: fontSize.hero,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
  },
  accessLabel: {
    marginTop: 2,
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
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
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: sg.surface2,
    borderWidth: 1.5,
    borderColor: sg.line,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    marginBottom: spacing.sm,
  },
  appleBtn: {
    backgroundColor: sg.surface2,
    borderColor: sg.surface2,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  googleIcon: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    color: '#4285F4',
  },
  oauthText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  appleText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
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
    backgroundColor: sg.line,
  },
  dividerText: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
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
    borderColor: sg.line,
    alignItems: 'center',
    backgroundColor: sg.surface2,
  },
  modeChipOn: {
    borderColor: sg.cobaltBorder,
    backgroundColor: sg.cobaltWash,
  },
  modeChipText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  modeChipTextOn: {
    color: sg.text,
  },
  input: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontFamily: sg.font.body,
    color: sg.text,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: sg.value,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onValue,
  },
  verifyHint: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  link: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    textAlign: 'center',
  },
  error: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    lineHeight: 20,
  },
  hint: {
    marginTop: spacing.xl,
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
  },
  promoBanner: {
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  /** Full-screen auth on jewel background — no “light card on dark” clash */
  promoBannerOnArt: {
    backgroundColor: sg.surface,
    borderColor: sg.cobaltBorder,
    borderWidth: StyleSheet.hairlineWidth,
  },
  promoBannerTitleOnArt: {
    color: sg.gold,
    fontSize: fontSize.sm,
    fontFamily: sg.font.display,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  promoBannerBodyOnArt: {
    color: sg.muted,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    lineHeight: 22,
  },
  /** Taller card, clearer separation from OAuth row on glass sheets */
  promoBannerSheet: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  promoBannerTitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.4,
  },
  promoBannerTitleSheet: {
    fontSize: fontSize.md,
    letterSpacing: 0.8,
    color: sg.text,
  },
  promoBannerBody: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 22,
  },
  promoBannerBodySheet: {
    fontSize: fontSize.base,
    lineHeight: 24,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  skipBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
});
