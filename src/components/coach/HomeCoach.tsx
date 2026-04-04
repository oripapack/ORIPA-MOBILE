import React, { useEffect, useState, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCoachStore } from '../../store/coachStore';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { isClerkEnabled } from '../../config/clerk';
import { CoachSpotlight } from './CoachSpotlight';
import { useAppStore } from '../../store/useAppStore';

const SHOW_DELAY_MS = 700;

/**
 * First visit to Packs (Home): short loop intro + CTA into browse / first pull.
 */
export function HomeCoach() {
  const { t } = useTranslation();
  const focused = useIsFocused();
  const hydrated = useCoachStore((s) => s.hydrated);
  const homeDismissed = useCoachStore((s) => s.homeDismissed);
  const dismissHomeCoach = useCoachStore((s) => s.dismissHomeCoach);
  const setHomeViewMode = useAppStore((s) => s.setHomeViewMode);
  const onboardingSheetDismissed = useGuestBrowseStore((s) => s.onboardingSheetDismissed);
  const guestBrowseEnabled = useGuestBrowseStore((s) => s.guestBrowseEnabled);
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);

  const [show, setShow] = useState(false);

  const pastAuthGate =
    !isClerkEnabled || onboardingSheetDismissed || guestBrowseEnabled || clerkSignedIn;

  useEffect(() => {
    if (!hydrated || homeDismissed || !focused || !pastAuthGate) {
      setShow(false);
      return;
    }
    const tmr = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(tmr);
  }, [hydrated, homeDismissed, focused, pastAuthGate]);

  const onDismiss = useCallback(() => {
    setShow(false);
    void dismissHomeCoach();
  }, [dismissHomeCoach]);

  const onPrimary = useCallback(() => {
    setShow(false);
    void dismissHomeCoach();
    setHomeViewMode('browse');
  }, [dismissHomeCoach, setHomeViewMode]);

  return (
    <CoachSpotlight
      visible={show}
      eyebrow={t('coach.homeEyebrow')}
      title={t('coach.homeTitle')}
      bodyLines={[t('coach.homeBody')]}
      flowSteps={[
        t('coach.homeFlowOpen'),
        t('coach.homeFlowWin'),
        t('coach.homeFlowConvert'),
        t('coach.homeFlowRepeat'),
      ]}
      primaryLabel={t('coach.homeCtaStart')}
      onPrimary={onPrimary}
      secondaryLabel={t('coach.homeDismissSecondary')}
      onDismiss={onDismiss}
    />
  );
}
