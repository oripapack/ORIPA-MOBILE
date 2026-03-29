import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { AuthSheetModal } from '../auth/AuthSheetModal';

type EmailMode = 'signin' | 'signup';

/**
 * First guest pack completion — soft conversion (no Won Prizes until signed in).
 */
export function SignupPromptModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const visible = useGuestBrowseStore((s) => s.signupPromptVisible);
  const hideSignupPrompt = useGuestBrowseStore((s) => s.hideSignupPrompt);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<EmailMode>('signup');

  const onMaybeLater = () => {
    void hideSignupPrompt(true);
  };

  const openAuth = (mode: EmailMode) => {
    void hideSignupPrompt(true);
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
        <Pressable style={styles.backdrop} onPress={onMaybeLater} accessibilityRole="button">
          <Pressable
            style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient colors={['#1A1F1C', '#121614']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.accent} />
            <Text style={styles.eyebrow}>{t('onboarding.promptEyebrow')}</Text>
            <Text style={styles.title}>{t('onboarding.promptTitle')}</Text>
            <Text style={styles.body}>{t('onboarding.promptBody')}</Text>
            <View style={styles.row}>
              <PrimaryButton label={t('onboarding.promptSignUp')} variant="red" onPress={() => openAuth('signup')} />
              <SecondaryButton label={t('onboarding.promptSignIn')} onPress={() => openAuth('signin')} />
            </View>
            <Pressable onPress={onMaybeLater} accessibilityRole="button">
              <Text style={styles.later}>{t('onboarding.promptLater')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AuthSheetModal
        visible={authOpen}
        initialEmailMode={authMode}
        onRequestClose={() => setAuthOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  row: {
    gap: spacing.sm,
  },
  later: {
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
