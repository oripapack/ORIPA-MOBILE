import React, { useEffect, useState, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCoachStore } from '../../store/coachStore';
import { navigationRef } from '../../navigation/navigationRef';
import { CoachSpotlight } from './CoachSpotlight';

const SHOW_DELAY_MS = 500;

/**
 * First visit to Shop tab: clarify Shop vs Packs — default dismiss stays on Shop; optional hop to Packs.
 */
export function ShopCoach() {
  const { t } = useTranslation();
  const focused = useIsFocused();
  const hydrated = useCoachStore((s) => s.hydrated);
  const shopDismissed = useCoachStore((s) => s.shopDismissed);
  const homeDismissed = useCoachStore((s) => s.homeDismissed);
  const dismissShopCoach = useCoachStore((s) => s.dismissShopCoach);

  const [show, setShow] = useState(false);

  /** Show Shop tip only after Home coach was seen or dismissed (avoid two modals in one session). */
  const homeCoachDone = homeDismissed;

  useEffect(() => {
    if (!hydrated || shopDismissed || !focused || !homeCoachDone) {
      setShow(false);
      return;
    }
    const tmr = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(tmr);
  }, [hydrated, shopDismissed, focused, homeCoachDone]);

  const onDismiss = useCallback(() => {
    setShow(false);
    void dismissShopCoach();
  }, [dismissShopCoach]);

  const onContinueShop = useCallback(() => {
    setShow(false);
    void dismissShopCoach();
  }, [dismissShopCoach]);

  const onBackToPacks = useCallback(() => {
    setShow(false);
    void dismissShopCoach();
    if (navigationRef.isReady()) {
      navigationRef.navigate('MainTabs', { screen: 'Home' });
    }
  }, [dismissShopCoach]);

  return (
    <CoachSpotlight
      visible={show}
      title={t('coach.shopTitle')}
      bodyLines={[]}
      comparison={{
        packsHeading: t('coach.shopPacksHeading'),
        packsLines: [
          t('coach.shopPacksLine1'),
          t('coach.shopPacksLine2'),
          t('coach.shopPacksLine3'),
        ],
        shopHeading: t('coach.shopShopHeading'),
        shopLines: [t('coach.shopShopLine1')],
      }}
      primaryLabel={t('coach.shopCtaContinue')}
      onPrimary={onContinueShop}
      secondaryLabel={t('coach.shopCtaBackPacks')}
      onDismiss={onContinueShop}
      onSecondary={onBackToPacks}
    />
  );
}
