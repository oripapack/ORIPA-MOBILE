import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RarityTier } from '../../audio/packOpeningFeedback';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ChipTagType, Pack } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { DEFAULT_PACK_OPENING_STYLE } from '../../config/packOpeningAnimation';
import { PackOpeningEngine } from './opening/PackOpeningEngine';
import { StadiumGradient, Spotlight } from './opening/sharedStage';
import { resolveRevealCardForTier } from './opening/mockRevealCards';
import { revealRarityFromTier, type PackRollResult } from './opening/types';
import { RevealCtaFade } from './opening/RevealResultCard';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function packResultPool(pack: Pack, t: TFunction, packName: string) {
  const tags = pack.tags as ChipTagType[];
  const isGraded = tags.includes('graded');
  const isBest = tags.includes('best_value');
  const isHot = tags.includes('hot_drop') || tags.includes('chase_boost');
  const isNew = tags.includes('new') || tags.includes('new_user');

  const rarityCommon = [
    t('packOpening.resultCommon1', { packName }),
    t('packOpening.resultCommon2', { packName }),
    t('packOpening.resultCommon3', { packName }),
  ];
  const rarityRare = [
    t('packOpening.resultRare1', { packName }),
    t('packOpening.resultRare2', { packName }),
    t('packOpening.resultRare3', { packName }),
  ];
  const rarityLegendary = [
    t('packOpening.resultLegendary1', { packName }),
    t('packOpening.resultLegendary2', { packName }),
    t('packOpening.resultLegendary3', { packName }),
  ];

  let minMult = 0.2;
  let maxMult = 1.6;
  if (isNew) {
    minMult = 0.25;
    maxMult = 1.8;
  }
  if (isHot) {
    minMult = 0.35;
    maxMult = 2.2;
  }
  if (isBest) {
    minMult = 0.65;
    maxMult = 2.7;
  }
  if (isGraded) {
    minMult = 0.6;
    maxMult = 3.0;
  }

  return { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult };
}

function tierFromRoll(creditsWon: number, creditPrice: number): RarityTier {
  const p = Math.max(1, creditPrice);
  const r = creditsWon / p;
  if (r >= 2.35) return 'mythic';
  if (r >= 1.9) return 'legendary';
  if (r >= 1.4) return 'epic';
  if (r >= 1.07) return 'rare';
  return 'common';
}

function generatePackOpenResult(pack: Pack, t: TFunction, packName: string): PackRollResult {
  const { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult } = packResultPool(pack, t, packName);
  const mult = minMult + Math.random() * (maxMult - minMult);
  const creditsWon = Math.max(0, Math.floor(pack.creditPrice * mult));

  const tier = tierFromRoll(creditsWon, pack.creditPrice);
  let result: string;
  if (tier === 'mythic' || tier === 'legendary') {
    result = pick(rarityLegendary);
  } else if (tier === 'epic' || tier === 'rare') {
    result = pick(rarityRare);
  } else {
    result = pick(rarityCommon);
  }

  return { result, creditsWon, tier };
}

export function PackOpeningModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const visible = useAppStore((s) => s.modals.packOpening);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const packOpenSessionId = useAppStore((s) => s.packOpenSessionId);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);
  const setSelectedPack = useAppStore((s) => s.setSelectedPack);
  const applyPackOpenResult = useAppStore((s) => s.applyPackOpenResult);

  const [pending, setPending] = useState<PackRollResult | null>(null);
  const [skippedToEnd, setSkippedToEnd] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [skipNonce, setSkipNonce] = useState(0);
  const [engineDone, setEngineDone] = useState(false);

  const didApplyRef = useRef(false);
  const rollRef = useRef<PackRollResult | null>(null);

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) return;
    setPending(null);
    rollRef.current = null;
    didApplyRef.current = false;
    setSkippedToEnd(false);
    setReplayKey(0);
    setSkipNonce(0);
    setEngineDone(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || !selectedPack) return;

    didApplyRef.current = false;
    setSkippedToEnd(false);
    setReplayKey(0);
    setSkipNonce(0);
    setEngineDone(false);

    const loc = getLocalizedPackFields(selectedPack, t);
    const roll = generatePackOpenResult(selectedPack, t, loc.title);
    rollRef.current = roll;
    setPending(roll);

    modalOpacity.setValue(0);
    spotlightPulse.setValue(0);

    const spotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(spotlightPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    spotLoop.start();

    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => {
      spotLoop.stop();
    };
  }, [visible, selectedPack, packOpenSessionId, t, modalOpacity, spotlightPulse]);

  const onRevealDone = useCallback(() => {
    setEngineDone(true);
  }, []);

  const skipToEnd = useCallback(() => {
    setSkippedToEnd(true);
    setSkipNonce((n) => n + 1);
  }, []);

  const replayAnimation = useCallback(() => {
    setSkippedToEnd(false);
    setEngineDone(false);
    setSkipNonce(0);
    setReplayKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (didApplyRef.current) return;
    if (!engineDone) return;

    didApplyRef.current = true;
    applyPackOpenResult(pending);
  }, [applyPackOpenResult, engineDone, pending, selectedPack, visible]);

  const packTint = selectedPack?.imageColor ?? colors.nearBlack;
  const revealCard = pending
    ? resolveRevealCardForTier(pending.tier, packOpenSessionId + replayKey * 997)
    : null;
  const revealRarity = pending ? revealRarityFromTier(pending.tier) : 'common';

  const goToWonPrizes = () => {
    closeModal('packOpening');
    setSelectedPack(null);
    openModal('wonPrizes');
  };

  const showSkip = !!pending && !engineDone;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      {...transparentModalIOSProps}
      onRequestClose={() => {}}
    >
      <Pressable style={styles.rootPress} onPress={() => {}}>
        <StadiumGradient />
        <Spotlight pulse={spotlightPulse} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: modalOpacity,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.titleFifa}>{t('packOpening.title')}</Text>
              <Text style={styles.subFifa} numberOfLines={2}>
                {selectedPack ? getLocalizedPackFields(selectedPack, t).title : ''}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {showSkip && (
                <TouchableOpacity onPress={skipToEnd} hitSlop={12} style={styles.skipBtn}>
                  <Text style={styles.skipText}>{t('packOpening.skip')}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.livePillFifa}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>{t('packOpening.live')}</Text>
              </View>
            </View>
          </View>

          {pending && revealCard ? (
            <PackOpeningEngine
              style={DEFAULT_PACK_OPENING_STYLE}
              roll={pending}
              revealCard={revealCard}
              revealRarity={revealRarity}
              packTint={packTint}
              sessionSalt={packOpenSessionId + replayKey * 31}
              replayKey={replayKey}
              skipNonce={skipNonce}
              onRevealDone={onRevealDone}
            />
          ) : null}

          <RevealCtaFade visible={engineDone} instant={skippedToEnd}>
            <View style={styles.ctaRow}>
              <PrimaryButton label={t('packOpening.continue')} variant="red" onPress={goToWonPrizes} style={styles.cta} />
              <SecondaryButton label={t('packOpening.openNext')} onPress={goToWonPrizes} />
              <TouchableOpacity onPress={replayAnimation} style={styles.replayBtn} hitSlop={10}>
                <Text style={styles.replayText}>{t('packOpening.replay')}</Text>
              </TouchableOpacity>
            </View>
          </RevealCtaFade>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootPress: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleFifa: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: '#F8FAFC',
    marginBottom: 2,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subFifa: {
    fontSize: fontSize.xs,
    color: 'rgba(248,250,252,0.45)',
    maxWidth: '80%',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.75)',
  },
  livePillFifa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  liveDot: {
    fontSize: 9,
    color: colors.red,
  },
  liveText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  ctaRow: {
    gap: spacing.sm,
  },
  cta: {
    marginBottom: 0,
  },
  replayBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  replayText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
  },
});
