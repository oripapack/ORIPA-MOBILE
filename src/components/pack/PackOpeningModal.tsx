import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { isClerkEnabled } from '../../config/clerk';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import {
  DEFAULT_PACK_OPENING_STYLE,
  USE_PHYGITALS_OPEN,
  USE_POKEPOKE_PACK_OPEN,
  USE_PROTOTYPE_LINEUP_PACK_OPEN,
} from '../../config/packOpeningAnimation';
import { PhygitalsOpenFlow } from '../ph/PhygitalsOpenFlow';
import { ph } from '../../tokens/phTheme';
import { PackOpeningEngine } from './opening/PackOpeningEngine';
import { PrototypePackOpenFlow } from './openingPrototype/PrototypePackOpenFlow';
import { PokePokePackOpenFlow } from './opening/pokepoke/PokePokePackOpenFlow';
import { StadiumGradient, Spotlight } from './opening/sharedStage';
import { resolveRevealCardForTier } from './opening/mockRevealCards';
import { generatePackOpenResult, bestRollFromResults } from './opening/generatePackRoll';
import { revealRarityFromTier, type PackRollResult } from './opening/types';
import { RevealCtaFade } from './opening/RevealResultCard';
import { showUserMessage } from '../../utils/showUserMessage';
import { shareUserContent } from '../../utils/shareUserContent';

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
  const applyBulkPackOpenResults = useAppStore((s) => s.applyBulkPackOpenResults);
  const openPack = useAppStore((s) => s.openPack);
  const packOpenQuantity = useAppStore((s) => s.packOpenQuantity);
  const pendingServerPull = useAppStore((s) => s.pendingServerPull);
  const clearPendingServerPull = useAppStore((s) => s.clearPendingServerPull);

  const [pending, setPending] = useState<PackRollResult | null>(null);
  const [bulkRolls, setBulkRolls] = useState<PackRollResult[] | null>(null);
  const [skippedToEnd, setSkippedToEnd] = useState(false);
  const [skipNonce, setSkipNonce] = useState(0);
  const [engineDone, setEngineDone] = useState(false);

  const didApplyRef = useRef(false);
  const rollRef = useRef<PackRollResult | null>(null);
  const isBulkOpen = packOpenQuantity > 1;

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) return;
    setPending(null);
    setBulkRolls(null);
    rollRef.current = null;
    didApplyRef.current = false;
    setSkippedToEnd(false);
    setSkipNonce(0);
    setEngineDone(false);
    clearPendingServerPull();
  }, [visible, clearPendingServerPull]);

  useEffect(() => {
    if (!visible || !selectedPack) return;
    didApplyRef.current = false;
    setSkippedToEnd(false);
    setSkipNonce(0);

    modalOpacity.setValue(0);
    spotlightPulse.setValue(0);

    const loc = getLocalizedPackFields(selectedPack, t);

    if (packOpenQuantity > 1) {
      const rolls: PackRollResult[] = [];
      for (let i = 0; i < packOpenQuantity; i += 1) {
        rolls.push(generatePackOpenResult(selectedPack, t, loc.title));
      }
      setBulkRolls(rolls);
      setPending(null);
      rollRef.current = null;
      setEngineDone(true);
      setSkippedToEnd(true);
    } else {
      setBulkRolls(null);
      const serverRoll =
        pendingServerPull && pendingServerPull.sessionId === packOpenSessionId
          ? pendingServerPull.roll
          : null;
      const roll =
        serverRoll ?? generatePackOpenResult(selectedPack, t, loc.title);
      rollRef.current = roll;
      setPending(roll);
      setEngineDone(false);
    }

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
  }, [
    visible,
    selectedPack,
    packOpenSessionId,
    packOpenQuantity,
    pendingServerPull,
    t,
    modalOpacity,
    spotlightPulse,
  ]);

  const onRevealDone = useCallback(() => {
    setEngineDone(true);
  }, []);

  const skipToEnd = useCallback(() => {
    setSkippedToEnd(true);
    setSkipNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (packOpenQuantity > 1) return;
    if (didApplyRef.current) return;
    if (!engineDone) return;

    didApplyRef.current = true;
    applyPackOpenResult(pending, { persistToVault: !isGuest });
  }, [applyPackOpenResult, engineDone, isGuest, packOpenQuantity, pending, selectedPack, visible]);

  useEffect(() => {
    if (!visible || !selectedPack) return;
    if (packOpenQuantity <= 1) return;
    if (!bulkRolls || bulkRolls.length === 0) return;
    if (didApplyRef.current) return;

    didApplyRef.current = true;
    applyBulkPackOpenResults(bulkRolls, { persistToVault: !isGuest });
  }, [applyBulkPackOpenResults, bulkRolls, isGuest, packOpenQuantity, selectedPack, visible]);

  const packTint = selectedPack?.imageColor ?? colors.nearBlack;
  const revealCard =
    pending && selectedPack && !isBulkOpen
      ? resolveRevealCardForTier(pending.tier, packOpenSessionId, selectedPack.category)
      : null;
  const revealRarity = pending ? revealRarityFromTier(pending.tier) : 'common';

  const bulkBest = bulkRolls && bulkRolls.length > 0 ? bestRollFromResults(bulkRolls) : null;
  const bulkTotalCredits =
    bulkRolls?.reduce((sum, r) => sum + r.creditsWon, 0) ?? 0;
  const bulkTierCounts = bulkRolls?.reduce(
    (acc, r) => {
      acc[r.tier] = (acc[r.tier] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<PackRollResult['tier'], number>>,
  );

  const packFaceTitle = useMemo(() => {
    if (!selectedPack) return undefined;
    const title = getLocalizedPackFields(selectedPack, t).title.trim();
    if (title.length <= 36) return title;
    return `${title.slice(0, 35)}…`;
  }, [selectedPack, t]);

  const goToWonPrizes = () => {
    closeModal('packOpening');
    if (isGuest) {
      if (!firstPackPromptHandled) {
        showSignupPrompt();
      } else {
        showUserMessage(t('onboarding.guestClaimTitle'), t('onboarding.guestClaimBody'));
      }
      return;
    }
    openModal('wonPrizes');
  };

  const openAnother = useCallback(() => {
    if (!selectedPack) return;
    if (isGuest) {
      if (!firstPackPromptHandled) {
        showSignupPrompt();
      } else {
        showUserMessage(t('onboarding.guestClaimTitle'), t('onboarding.guestClaimBody'));
      }
      return;
    }
    // This re-charges credits + increments session id like a real open.
    // In demo mode, we still use store openPack for a consistent “spent credits” story.
    void openPack(selectedPack, { keepPackModalOnInsufficient: true, quantity: 1 }).then((ok) => {
      if (!ok) return;
      setSkippedToEnd(false);
      setEngineDone(false);
      setSkipNonce(0);
    });
  }, [firstPackPromptHandled, isGuest, openPack, selectedPack, showSignupPrompt, t]);

  const sharePullFromReveal = useCallback(() => {
    if (!pending || !revealCard) return;
    const tierLabel = t(`packOpening.tier_${pending.tier}`);
    const msg = t('packOpening.shareMessage', {
      name: revealCard.name,
      tier: tierLabel,
      credits: pending.creditsWon.toLocaleString(),
    });
    void shareUserContent(msg);
  }, [pending, revealCard, t]);

  const showSkip = !!pending && !engineDone && !isBulkOpen;
  const compactPackHeader = !!(pending && engineDone && !isBulkOpen);

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
        {!USE_PHYGITALS_OPEN ? <StadiumGradient /> : null}
        {!USE_PHYGITALS_OPEN ? <Spotlight pulse={spotlightPulse} /> : null}

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
              {compactPackHeader ? (
                <Text style={styles.titleCompact} numberOfLines={1}>
                  {selectedPack ? getLocalizedPackFields(selectedPack, t).title : ''}
                </Text>
              ) : (
                <>
                  <Text style={styles.titleFifa}>{t('packOpening.title')}</Text>
                  <Text style={styles.subFifa} numberOfLines={2}>
                    {selectedPack
                      ? isBulkOpen
                        ? t('packOpening.bulkPackSubtitle', {
                            title: getLocalizedPackFields(selectedPack, t).title,
                            count: packOpenQuantity,
                          })
                        : getLocalizedPackFields(selectedPack, t).title
                      : ''}
                  </Text>
                </>
              )}
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

          <View style={styles.body}>
            {pending && selectedPack && !isBulkOpen ? (
              USE_PHYGITALS_OPEN ? (
                <PhygitalsOpenFlow
                  key={`pack-open-phyg-${packOpenSessionId}`}
                  pack={selectedPack}
                  skipNonce={skipNonce}
                  onRevealDone={onRevealDone}
                  onStoreInVault={goToWonPrizes}
                />
              ) : USE_POKEPOKE_PACK_OPEN && revealCard ? (
                <PokePokePackOpenFlow
                  key={`pack-open-pokepoke-${packOpenSessionId}`}
                  roll={pending}
                  revealCard={revealCard}
                  revealRarity={revealRarity}
                  packTint={packTint}
                  packFaceTitle={packFaceTitle}
                  sessionSalt={packOpenSessionId}
                  replayKey={0}
                  skipNonce={skipNonce}
                  onRevealDone={onRevealDone}
                  onStoreInVault={goToWonPrizes}
                  onSharePull={sharePullFromReveal}
                  pack={selectedPack}
                />
              ) : USE_PROTOTYPE_LINEUP_PACK_OPEN && revealCard ? (
                <PrototypePackOpenFlow
                  key={`pack-open-proto-${packOpenSessionId}`}
                  roll={pending}
                  revealCard={revealCard}
                  revealRarity={revealRarity}
                  packTint={packTint}
                  packFaceTitle={packFaceTitle}
                  sessionSalt={packOpenSessionId}
                  replayKey={0}
                  skipNonce={skipNonce}
                  onRevealDone={onRevealDone}
                  onStoreInVault={goToWonPrizes}
                  onSharePull={sharePullFromReveal}
                />
              ) : revealCard ? (
                <PackOpeningEngine
                  key={`pack-open-${packOpenSessionId}`}
                  style={DEFAULT_PACK_OPENING_STYLE}
                  roll={pending}
                  revealCard={revealCard}
                  revealRarity={revealRarity}
                  packTint={packTint}
                  packFaceTitle={packFaceTitle}
                  sessionSalt={packOpenSessionId}
                  replayKey={0}
                  skipNonce={skipNonce}
                  onRevealDone={onRevealDone}
                />
              ) : null
            ) : null}

            {isBulkOpen && bulkRolls && bulkBest ? (
              <View style={styles.bulkSummary}>
                <Text style={styles.bulkTitle}>{t('packOpening.bulkSummaryTitle', { count: packOpenQuantity })}</Text>
                <Text style={styles.bulkTotal}>
                  {t('packOpening.bulkTotalCredits', { amount: bulkTotalCredits.toLocaleString() })}
                </Text>
                <View style={styles.bulkBestRow}>
                  <Text style={styles.bulkBestLabel}>{t('packOpening.bulkBestHit')}</Text>
                  <Text style={styles.bulkBestTier}>{t(`packOpening.tier_${bulkBest.tier}`)}</Text>
                  <Text style={styles.bulkBestResult} numberOfLines={2}>
                    {bulkBest.result}
                  </Text>
                  <Text style={styles.bulkBestCredits}>
                    {t('packOpening.bulkRowCredits', { amount: bulkBest.creditsWon.toLocaleString() })}
                  </Text>
                </View>
                {bulkTierCounts ? (
                  <Text style={styles.bulkTierLine} numberOfLines={2}>
                    {(['mythic', 'legendary', 'epic', 'rare', 'common'] as const)
                      .flatMap((tier) => {
                        const n = bulkTierCounts[tier];
                        if (!n) return [];
                        return [`${t(`packOpening.tier_${tier}`)} ×${n}`];
                      })
                      .join(' · ')}
                  </Text>
                ) : null}
                <ScrollView
                  style={styles.bulkScroll}
                  contentContainerStyle={styles.bulkScrollContent}
                  showsVerticalScrollIndicator
                >
                  {bulkRolls.map((r, idx) => (
                    <View key={`bulk-${packOpenSessionId}-${idx}`} style={styles.bulkRow}>
                      <Text style={styles.bulkRowIdx}>#{idx + 1}</Text>
                      <View style={styles.bulkRowMid}>
                        <Text style={styles.bulkRowTier}>{t(`packOpening.tier_${r.tier}`)}</Text>
                        <Text style={styles.bulkRowResult} numberOfLines={1}>
                          {r.result}
                        </Text>
                      </View>
                      <Text style={styles.bulkRowCredits}>{r.creditsWon.toLocaleString()}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <RevealCtaFade
            visible={engineDone}
            instant={skippedToEnd || isBulkOpen}
            enterDelayMs={isBulkOpen ? 120 : 720}
            enterDurationMs={isBulkOpen ? 520 : 720}
          >
            {compactPackHeader ? (
              <LinearGradient
                colors={['transparent', 'rgba(2,6,23,0.55)']}
                style={styles.ctaBridge}
                pointerEvents="none"
              />
            ) : null}
            <View style={[styles.ctaRow, compactPackHeader && styles.ctaRowTight]}>
              {!isBulkOpen ? (
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
              ) : null}
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
    alignSelf: 'stretch',
    paddingHorizontal: 0,
    zIndex: 2,
  },
  body: {
    flex: 1,
    minHeight: 0,
    width: '100%',
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
    paddingHorizontal: spacing.base,
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
    fontSize: 22,
    fontFamily: brandFont.extraBold,
    color: 'rgba(248,250,252,0.92)',
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  titleCompact: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: 'rgba(226,232,240,0.55)',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  subFifa: {
    fontSize: fontSize.xs,
    color: 'rgba(148,163,184,0.78)',
    maxWidth: '80%',
    letterSpacing: 0.2,
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
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(2,6,23,0.35)',
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
  ctaBridge: {
    width: '100%',
    height: 20,
    marginTop: -4,
  },
  ctaRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  ctaRowTight: {
    marginTop: 0,
    paddingTop: spacing.xs,
  },
  openAnotherBtn: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 26,
    elevation: 14,
  },
  openAnotherGradient: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
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
    backgroundColor: 'rgba(2,6,23,0.18)',
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
  bulkSummary: {
    flex: 1,
    marginTop: spacing.md,
    minHeight: 0,
    paddingHorizontal: spacing.base,
  },
  bulkTitle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  bulkTotal: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: 'rgba(226,232,240,0.72)',
    marginBottom: spacing.md,
  },
  bulkBestRow: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  bulkBestLabel: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: 'rgba(248,250,252,0.45)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  bulkBestTier: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.gold,
  },
  bulkBestResult: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: '#F8FAFC',
    lineHeight: 20,
  },
  bulkBestCredits: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: 'rgba(226,232,240,0.55)',
  },
  bulkTierLine: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: 'rgba(226,232,240,0.5)',
    marginBottom: spacing.sm,
  },
  bulkScroll: {
    flexGrow: 0,
    maxHeight: 240,
  },
  bulkScrollContent: {
    paddingBottom: spacing.sm,
    gap: 0,
  },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  bulkRowIdx: {
    width: 36,
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: 'rgba(248,250,252,0.38)',
  },
  bulkRowMid: {
    flex: 1,
    minWidth: 0,
  },
  bulkRowTier: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: colors.gold,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  bulkRowResult: {
    fontSize: 12,
    fontFamily: brandFont.semibold,
    color: 'rgba(248,250,252,0.82)',
  },
  bulkRowCredits: {
    fontSize: 12,
    fontFamily: brandFont.bold,
    color: 'rgba(226,232,240,0.65)',
  },
});
