import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-expo';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { AuthBottomSheet, type AuthBottomSheetRef } from '../auth/AuthBottomSheet';
import { AuthScreen } from '../../screens/AuthScreen';
import { SIGNUP_PROMO_BONUS_USD } from '../../data/promotions.mock';

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
      const title = t('onboarding.dismissConfirmTitle');
      const message = t('onboarding.dismissConfirmMessage', { usd: SIGNUP_PROMO_BONUS_USD });
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
          confirm();
        } else {
          cancel();
        }
        return;
      }
      Alert.alert(title, message, [
        { text: t('onboarding.dismissConfirmStay'), style: 'cancel', onPress: cancel },
        { text: t('onboarding.dismissConfirmLeave'), style: 'destructive', onPress: confirm },
      ]);
    },
    [t],
  );

  useEffect(() => {
    if (isSignedIn) {
      void markWelcomePromoSeen();
      void dismissOnboardingSheet();
    }
  }, [isSignedIn, dismissOnboardingSheet, markWelcomePromoSeen]);

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
