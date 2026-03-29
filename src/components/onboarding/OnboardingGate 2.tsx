import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '@clerk/clerk-expo';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { AuthBottomSheet } from '../auth/AuthBottomSheet';
import { AuthScreen } from '../../screens/AuthScreen';
import { OnboardingSheet } from './OnboardingSheet';

type EmailMode = 'signin' | 'signup';

/**
 * Blur + dim + draggable sheet; touches pass through to the home shell behind.
 * Auth opens in a native modal sheet after the onboarding sheet animates down.
 */
export function OnboardingGate() {
  const { isSignedIn } = useAuth();
  const dismissOnboardingSheet = useGuestBrowseStore((s) => s.dismissOnboardingSheet);
  const setGuestBrowseEnabled = useGuestBrowseStore((s) => s.setGuestBrowseEnabled);
  const markWelcomePromoSeen = useGuestBrowseStore((s) => s.markWelcomePromoSeen);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<EmailMode>('signin');

  const finishPreview = useCallback(async () => {
    await setGuestBrowseEnabled(true);
    await markWelcomePromoSeen();
    await dismissOnboardingSheet();
  }, [dismissOnboardingSheet, markWelcomePromoSeen, setGuestBrowseEnabled]);

  useEffect(() => {
    if (isSignedIn) {
      setAuthOpen(false);
      void dismissOnboardingSheet();
    }
  }, [isSignedIn, dismissOnboardingSheet]);

  const openAuth = useCallback((mode: EmailMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const onAuthClose = useCallback(() => {
    setAuthOpen(false);
    void finishPreview();
  }, [finishPreview]);

  return (
    <>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.dim} pointerEvents="none" />
        <OnboardingSheet
          onDismiss={finishPreview}
          onContinueGuest={finishPreview}
          onSignIn={() => openAuth('signin')}
          onSignUp={() => openAuth('signup')}
        />
      </View>

      <AuthBottomSheet visible={authOpen} onRequestClose={onAuthClose} showBackdrop={false}>
        <AuthScreen
          presentation="sheet"
          welcomeMode={false}
          initialEmailMode={authMode}
          onRequestClose={onAuthClose}
        />
      </AuthBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
});
