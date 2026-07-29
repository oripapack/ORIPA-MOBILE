import React, { useCallback, useMemo, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { isClerkAPIResponseError, useClerk, useUser } from '@clerk/clerk-expo';
import { sg } from '../tokens/sg';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { getAppLogoParts } from '../config/app';
import {
  hasVerifiedPhone,
  isValidNationalForDial,
  toE164FromDialAndNational,
} from '../lib/clerkPhone';
import {
  DEFAULT_DIAL_CODE_ID,
  DialCodeOption,
  dialOptionById,
} from '../constants/phoneDialCodes';
import { PhoneCountryPickerModal } from '../components/phone/PhoneCountryPickerModal';
import { SgScreen } from '../components/ui';
import { PrimaryButton } from '../components/shared/PrimaryButton';

type Phase = 'phone' | 'code';

function formatNanpDisplay(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * After OAuth/email sign-in: collect & verify a phone number on the Clerk user.
 * Dashboard: User & authentication → Phone → enable SMS; add a test number or SMS provider for dev.
 */
export function LinkPhoneScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const defaultCountry = useMemo(
    () => dialOptionById(DEFAULT_DIAL_CODE_ID) ?? dialOptionById('US')!,
    [],
  );

  const [phase, setPhase] = useState<Phase>('phone');
  const [selectedCountry, setSelectedCountry] = useState<DialCodeOption>(defaultCountry);
  const [nationalDigits, setNationalDigits] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [pendingPhoneId, setPendingPhoneId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { primary, secondary } = getAppLogoParts();

  const isNanp = selectedCountry.dial === '+1';

  const nationalDisplay = isNanp ? formatNanpDisplay(nationalDigits) : nationalDigits;

  const onNationalChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '');
      const max = isNanp ? 10 : 15;
      setNationalDigits(digits.slice(0, max));
    },
    [isNanp],
  );

  const onSubmitPhone = useCallback(async () => {
    if (!user) return;
    setError(null);

    const phoneNumber = toE164FromDialAndNational(selectedCountry.dial, nationalDigits);
    if (!isValidNationalForDial(selectedCountry.dial, nationalDigits)) {
      setError(isNanp ? t('linkPhone.nanpInvalid') : t('linkPhone.invalid'));
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
        const errs = e.errors;
        const msg =
          Array.isArray(errs) && errs.length > 0
            ? errs.map((er) => er.message).filter(Boolean).join(' ')
            : undefined;
        setError(msg || t('linkPhone.genericError'));
      } else {
        setError(e instanceof Error ? e.message : t('linkPhone.genericError'));
      }
    } finally {
      setBusy(false);
    }
  }, [isNanp, nationalDigits, selectedCountry.dial, t, user]);

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
      <SgScreen style={styles.centered}>
        <ActivityIndicator size="large" color={sg.gold} />
      </SgScreen>
    );
  }

  if (hasVerifiedPhone(user)) {
    return null;
  }

  return (
    <SgScreen style={styles.screenRoot}>
      
      <KeyboardAvoidingView
        style={styles.flexOverBg}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
      >
      <PhoneCountryPickerModal
        visible={pickerOpen}
        selected={selectedCountry}
        onClose={() => setPickerOpen(false)}
        onSelect={(opt) => {
          setSelectedCountry(opt);
          setNationalDigits('');
          setError(null);
        }}
      />

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

        <Text style={styles.title}>{t('linkPhone.title')}</Text>
        <Text style={styles.subtitle}>{t('linkPhone.subtitle')}</Text>

        {phase === 'phone' ? (
          <>
            <Text style={styles.fieldLabel}>{t('linkPhone.mobileLabel')}</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setPickerOpen(true)}
                disabled={busy}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('linkPhone.countryPickerA11y')}
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryDial}>{selectedCountry.dial}</Text>
                <Ionicons name="chevron-down" size={18} color={sg.muted} />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                value={nationalDisplay}
                onChangeText={onNationalChange}
                placeholder={isNanp ? t('linkPhone.nationalPlaceholderNanp') : t('linkPhone.nationalPlaceholder')}
                placeholderTextColor={sg.muted}
                keyboardType="phone-pad"
                autoComplete="tel-national"
                textContentType="telephoneNumber"
                editable={!busy}
              />
            </View>

            <PrimaryButton
              label={t('linkPhone.sendCode')}
              onPress={() => void onSubmitPhone()}
              disabled={busy}
              loading={busy}
              style={styles.primaryBtnWrap}
            />
          </>
        ) : (
          <>
            <Text style={styles.verifyHint}>{t('linkPhone.codeHint')}</Text>
            <TextInput
              style={styles.inputFull}
              value={code}
              onChangeText={setCode}
              placeholder={t('linkPhone.codePlaceholder')}
              placeholderTextColor={sg.muted}
              keyboardType="number-pad"
              maxLength={8}
              editable={!busy}
            />
            <PrimaryButton
              label={t('linkPhone.verify')}
              onPress={() => void onVerifyCode()}
              disabled={busy}
              loading={busy}
              style={styles.primaryBtnWrap}
            />
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
        <Text style={styles.hintSecondary}>{t('linkPhone.smsDevHint')}</Text>

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
  fieldLabel: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    minHeight: 50,
    backgroundColor: sg.surface2,
  },
  countryFlag: {
    fontSize: fontSize.lg,
  },
  countryDial: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  phoneInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontFamily: sg.font.body,
    color: sg.text,
    backgroundColor: sg.surface2,
    minHeight: 50,
  },
  inputFull: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    fontFamily: sg.font.body,
    color: sg.text,
    backgroundColor: sg.surface2,
    marginBottom: spacing.sm,
  },
  primaryBtnWrap: {
    marginTop: spacing.xs,
  },
  verifyHint: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  linkWrap: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  link: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
  },
  linkMuted: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
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
  hintSecondary: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
  },
  signOutWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
