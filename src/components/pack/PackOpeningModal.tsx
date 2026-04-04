import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RarityTier } from '../../audio/packOpeningFeedback';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ChipTagType, Pack } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { isClerkEnabled } from '../../config/clerk';
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
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const firstPackPromptHandled = useGuestBrowseStore((s) => s.firstPackSignupPromptHandled);
  const showSignupPrompt = useGuestBrowseStore((s) => s.showSignupPrompt);
  const isGuest = isClerkEnabled && !clerkSignedIn;

  const visible = useAppStore((s) => s.modals.packOpening);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const packOpenSessionId = useAppStore((s) => s.packOpenSessionId);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);
  const applyPackOpenResult = useAppStore((s) => s.applyPackOpenResult);
  const openPack = useAppStore((s) => s.openPack);

  const [pending, setPending] = useState<PackRollResult | null>(null);
  const [skippedToEnd, setSkippedToEnd] = useState(false);
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
    setSkipNonce(0);
    setEngineDone(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || !selectedPack) return;
    didApplyRef.current = false;
    setSkippedToEnd(false);
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

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (didApplyRef.current) return;
    if (!engineDone) return;

    didApplyRef.current = true;
    applyPackOpenResult(pending, { persistToVault: !isGuest });
  }, [applyPackOpenResult, engineDone, isGuest, pending, selectedPack, visible]);

  const packTint = selectedPack?.imageColor ?? colors.nearBlack;
  const revealCard =
    pending && selectedPack
      ? resolveRevealCardForTier(pending.tier, packOpenSessionId, selectedPack.category)
      : null;
  const revealRarity = pending ? revealRarityFromTier(pending.tier) : 'common';

  const goToWonPrizes = () => {
    closeModal('packOpening');
    if (isGuest) {
      if (!firstPackPromptHandled) {
        showSignupPrompt();
      } else {
        Alert.alert(t('onboarding.guestClaimTitle'), t('onboarding.guestClaimBody'));
      }
      return;
    }
    openModal('wonPrizes');
  };

  const openAnother = useCallback(() => {
    if (!selectedPack) return;
    // This re-charges credits + increments session id like a real open.
    // In demo mode, we still use store openPack for a consistent “spent credits” story.
    const ok = openPack(selectedPack, { keepPackModalOnInsufficient: true });
    if (!ok) return;
    setSkippedToEnd(false);
    setEngineDone(false);
    setSkipNonce(0);
  }, [openPack, selectedPack]);

  const showSkip = !!pending && !engineDone;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      {...transparentModalIOSProps}
      onRequestClose={() => {}}
    >
      <View style={styles.rootPress}>
        {/* Background press-catcher (prevents tap-to-dismiss) */}
        <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
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
              key={`pack-open-${packOpenSessionId}`}
              style={DEFAULT_PACK_OPENING_STYLE}
              roll={pending}
              revealCard={revealCard}
              revealRarity={revealRarity}
              packTint={packTint}
              sessionSalt={packOpenSessionId}
              replayKey={0}
              skipNonce={skipNonce}
              onRevealDone={onRevealDone}
            />
          ) : null}

          <RevealCtaFade visible={engineDone} instant={skippedToEnd} enterDelayMs={560}>
            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.openAnotherBtn}
                onPress={openAnother}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('packOpening.openNext')}
              >
                <LinearGradient
                  colors={[colors.gold, colors.goldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.openAnotherGradient}
                >
                  <View style={styles.openAnotherRow}>
                    <View style={styles.openAnotherIconCircle}>
                      <Ionicons name="flash" size={22} color={colors.black} />
                    </View>
                    <View style={styles.openAnotherCopy}>
                      <Text style={styles.openAnotherHeadline}>{t('packOpening.openAnotherHeadline')}</Text>
                      <Text style={styles.openAnotherSub}>
                        {t('packOpening.openAnotherSub', {
                          credits:
                            selectedPack != null ? selectedPack.creditPrice.toLocaleString() : '—',
                        })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="rgba(2,6,23,0.45)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToWonPrizes}
                style={styles.manageWinningsBtn}
                activeOpacity={0.65}
                hitSlop={12}
              >
                <Text style={styles.manageWinningsText}>{t('packOpening.manageWinnings')}</Text>
              </TouchableOpacity>
            </View>
          </RevealCtaFade>
        </Animated.View>
      </View>
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
  stageHeader: {
    marginBottom: spacing.md,
  },
  headerBridge: {
    width: '100%',
    height: 1,
    marginTop: spacing.sm,
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  stageEyebrow: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: 'rgba(248,250,252,0.38)',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleFifa: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: '#F8FAFC',
    marginBottom: 2,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  subFifa: {
    fontSize: fontSize.xs,
    color: 'rgba(226,232,240,0.42)',
    maxWidth: '80%',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: 'rgba(255,255,255,0.62)',
  },
  livePillFifa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  liveDot: {
    fontSize: 9,
    color: colors.red,
  },
  liveText: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: 'rgba(255,255,255,0.68)',
    letterSpacing: 1.6,
  },
  ctaRow: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  openAnotherBtn: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    elevation: 10,
  },
  openAnotherGradient: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  openAnotherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.base,
  },
  openAnotherIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(2,6,23,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openAnotherCopy: {
    flex: 1,
    minWidth: 0,
  },
  openAnotherHeadline: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  openAnotherSub: {
    color: 'rgba(2,6,23,0.62)',
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
  },
  manageWinningsBtn: {
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageWinningsText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: 'rgba(248,250,252,0.52)',
    letterSpacing: 0.2,
  },
});
