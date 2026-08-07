import React, { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-expo';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { AuthBottomSheet, type AuthBottomSheetRef } from '../auth/AuthBottomSheet';
import { AuthScreen } from '../../screens/AuthScreen';
import { confirmUserAction } from '../../utils/showUserMessage';
import { canOpenPackWithoutSignIn } from '../../config/demo';

/**
 * First-launch welcome: slide-up `AuthScreen` with a solid dim + opaque sheet (no blur).
 */
export function OnboardingGate() {
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const authSheetRef = useRef<AuthBottomSheetRef>(null);
  const dismissOnboardingSheet = useGuestBrowseStore((s) => s.dismissOnboardingSheet);
  const setGuestBrowseEnabled = useGuestBrowseStore((s) => s.setGuestBrowseEnabled);
  const markWelcomePromoSeen = useGuestBrowseStore((s) => s.markWelcomePromoSeen);

  const finishPreview = useCallback(async () => {
    await setGuestBrowseEnabled(true);
    await markWelcomePromoSeen();
    await dismissOnboardingSheet();
  }, [dismissOnboardingSheet, markWelcomePromoSeen, setGuestBrowseEnabled]);

  const confirmDismiss = useCallback(
    ({ confirm, cancel }: { confirm: () => void; cancel: () => void }) => {
      confirmUserAction({
        title: t('onboarding.dismissConfirmTitle'),
        message: t('onboarding.dismissConfirmMessage'),
        cancelLabel: t('onboarding.dismissConfirmStay'),
        confirmLabel: t('onboarding.dismissConfirmLeave'),
        destructive: true,
        onConfirm: confirm,
        onCancel: cancel,
      });
    },
    [t],
  );

  useEffect(() => {
    if (isSignedIn) {
      void markWelcomePromoSeen();
      void dismissOnboardingSheet();
    }
  }, [isSignedIn, dismissOnboardingSheet, markWelcomePromoSeen]);

  // Development web builds may skip the sheet so animation review stays fast.
  useEffect(() => {
    if (!canOpenPackWithoutSignIn) return;
    if (Platform.OS !== 'web') return;
    void finishPreview();
  }, [finishPreview]);

  return (
    <AuthBottomSheet
      ref={authSheetRef}
      visible
      showBackdrop
      onRequestClose={() => void finishPreview()}
      confirmDismiss={confirmDismiss}
    >
      <AuthScreen
        presentation="sheet"
        welcomeMode
        onWelcomeSkip={() => void finishPreview()}
        onRequestClose={() => authSheetRef.current?.requestCloseWithConfirmation()}
      />
    </AuthBottomSheet>
  );
}
