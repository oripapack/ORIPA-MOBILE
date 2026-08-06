import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
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
            style={[styles.card, { paddingBottom: insets.bottom + sg.space.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.eyebrow}>{t('onboarding.promptEyebrow')}</Text>
            <Text style={styles.title}>{t('onboarding.promptTitle')}</Text>
            <Text style={styles.body}>{t('onboarding.promptBody')}</Text>
            <View style={styles.row}>
              <PrimaryButton label={t('onboarding.promptSignUp')} onPress={() => openAuth('signup')} />
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
    paddingHorizontal: sg.space.lg,
  },
  card: {
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.lg,
    backgroundColor: sg.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
  },
  eyebrow: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: sg.space.sm,
  },
  title: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  body: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.lg,
  },
  row: {
    gap: sg.space.sm,
  },
  later: {
    marginTop: sg.space.lg,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textAlign: 'center',
  },
});
