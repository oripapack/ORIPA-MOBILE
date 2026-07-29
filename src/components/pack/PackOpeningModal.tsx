import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useGuestBrowseStore } from '../../store/guestBrowseStore';
import { isClerkEnabled } from '../../config/clerk';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { resolveRevealCardForTier } from './opening/mockRevealCards';
import { generatePackOpenResult } from './opening/generatePackRoll';
import type { PackRollResult } from './opening/types';
import { RevealCtaFade } from './opening/RevealResultCard';
import { showUserMessage } from '../../utils/showUserMessage';
import { buildBulkOpenViewModel } from './opening/bulk/bulkOpenViewModel';

/** Lazy so Three.js / R3F only load when a pack is opened (keeps web boot light). */
const RingPackOpenFlow = React.lazy(() =>
  import('./opening/ring/RingPackOpenFlow').then((m) => ({ default: m.RingPackOpenFlow })),
);

const BulkOpenCinematic = React.lazy(() =>
  import('./opening/bulk/BulkOpenCinematic').then((m) => ({ default: m.BulkOpenCinematic })),
);

const BulkResultsScreen = React.lazy(() =>
  import('./opening/bulk/BulkResultsScreen').then((m) => ({ default: m.BulkResultsScreen })),
);

type BulkOpenPhase = 'bulkCinematic' | 'bulkResults';

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
  const [bulkPhase, setBulkPhase] = useState<BulkOpenPhase>('bulkCinematic');
  const [skippedToEnd, setSkippedToEnd] = useState(false);
  const [skipNonce, setSkipNonce] = useState(0);
  const [engineDone, setEngineDone] = useState(false);

  const didApplyRef = useRef(false);
  const rollRef = useRef<PackRollResult | null>(null);
  const didAdvanceToWonRef = useRef(false);
  const isBulkOpen = packOpenQuantity > 1;

  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) return;
    setPending(null);
    setBulkRolls(null);
    setBulkPhase('bulkCinematic');
    rollRef.current = null;
    didApplyRef.current = false;
    didAdvanceToWonRef.current = false;
    setSkippedToEnd(false);
    setSkipNonce(0);
    setEngineDone(false);
    clearPendingServerPull();
  }, [visible, clearPendingServerPull]);

  useEffect(() => {
    if (!visible || !selectedPack) return;
    didApplyRef.current = false;
    didAdvanceToWonRef.current = false;
    setSkippedToEnd(false);
    setSkipNonce(0);
    setBulkPhase('bulkCinematic');

    modalOpacity.setValue(1);

    const loc = getLocalizedPackFields(selectedPack, t);

    if (packOpenQuantity > 1) {
      const rolls: PackRollResult[] = [];
      for (let i = 0; i < packOpenQuantity; i += 1) {
        rolls.push(generatePackOpenResult(selectedPack, t, loc.title));
      }
      setBulkRolls(rolls);
      setPending(null);
      rollRef.current = null;
      setEngineDone(false);
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

    Animated.timing(modalOpacity, {
      toValue: 1,
      duration: Platform.OS === 'web' ? 0 : 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [
    visible,
    selectedPack,
    packOpenSessionId,
    packOpenQuantity,
    pendingServerPull,
    t,
    modalOpacity,
  ]);

  const onRevealDone = useCallback(() => {
    setEngineDone(true);
  }, []);

  const skipToEnd = useCallback(() => {
    if (isBulkOpen && bulkPhase === 'bulkCinematic') {
      setBulkPhase('bulkResults');
      return;
    }
    setSkippedToEnd(true);
    setSkipNonce((n) => n + 1);
  }, [bulkPhase, isBulkOpen]);

  const onBulkCinematicComplete = useCallback(() => {
    setBulkPhase('bulkResults');
  }, []);

  const bulkViewModel = useMemo(() => {
    if (!bulkRolls || !selectedPack || packOpenQuantity <= 1) return null;
    try {
      return buildBulkOpenViewModel(
        bulkRolls,
        packOpenQuantity,
        packOpenSessionId,
        selectedPack.category,
      );
    } catch {
      return null;
    }
  }, [bulkRolls, packOpenQuantity, packOpenSessionId, selectedPack]);

  const onBulkContinue = useCallback(() => {
    if (!bulkRolls) return;
    if (!didApplyRef.current) {
      didApplyRef.current = true;
      applyBulkPackOpenResults(bulkRolls, { persistToVault: true });
    }
    closeModal('packOpening');
    openModal('wonPrizes');
  }, [applyBulkPackOpenResults, bulkRolls, closeModal, openModal]);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (packOpenQuantity > 1) return;
    if (didApplyRef.current) return;
    if (!engineDone) return;

    didApplyRef.current = true;
    // Always record the pull so Won Prizes (convert vs vault) can open — even for unsigned demos.
    applyPackOpenResult(pending, { persistToVault: true });
  }, [applyPackOpenResult, engineDone, packOpenQuantity, pending, selectedPack, visible]);

  /** After the 3D reveal finishes, go straight to convert / vault — CTAs under the iframe were unreachable. */
  useEffect(() => {
    if (!visible || !engineDone || isBulkOpen) return;
    if (!didApplyRef.current || didAdvanceToWonRef.current) return;

    didAdvanceToWonRef.current = true;
    const t = setTimeout(() => {
      closeModal('packOpening');
      openModal('wonPrizes');
    }, 600);
    return () => clearTimeout(t);
  }, [closeModal, engineDone, isBulkOpen, openModal, visible]);

  const revealCard =
    pending && selectedPack && !isBulkOpen
      ? resolveRevealCardForTier(pending.tier, packOpenSessionId, selectedPack.category)
      : null;

  const bulkOpenActive = isBulkOpen && !!bulkViewModel;
  const bulkCinematicActive = bulkOpenActive && bulkPhase === 'bulkCinematic';
  const bulkResultsActive = bulkOpenActive && bulkPhase === 'bulkResults';

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

  const goToWonPrizes = () => {
    closeModal('packOpening');
    openModal('wonPrizes');
  };

  const showSkip =
    (!!pending && !engineDone && !isBulkOpen) ||
    bulkCinematicActive;
  const compactPackHeader = !!(pending && engineDone && !isBulkOpen);
  const ringOpenActive = !!pending && !!selectedPack && !isBulkOpen && !!revealCard;
  const fullscreenFlow = ringOpenActive || bulkOpenActive;

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

        <Animated.View
          style={[
            styles.content,
            {
              opacity: modalOpacity,
              flex: fullscreenFlow ? 1 : undefined,
              paddingTop: fullscreenFlow ? 0 : insets.top + sg.space.sm,
              paddingBottom: fullscreenFlow ? 0 : insets.bottom + sg.space.lg,
            },
          ]}
        >
          {!fullscreenFlow ? (
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
          ) : showSkip ? (
            <TouchableOpacity
              onPress={skipToEnd}
              hitSlop={12}
              style={[
                styles.ringSkipFab,
                { top: insets.top + sg.space.sm },
                bulkCinematicActive && styles.bulkSkipFab,
              ]}
            >
              <Text style={styles.skipText}>{t('packOpening.skip')}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={[styles.body, fullscreenFlow && styles.bodyRing]}>
            {pending && selectedPack && !isBulkOpen && revealCard ? (
              <React.Suspense
                fallback={
                  <View style={styles.ringLoading}>
                    <Text style={styles.skipText}>Loading pack scene…</Text>
                  </View>
                }
              >
                <RingPackOpenFlow
                  key={`pack-open-ring-${packOpenSessionId}`}
                  pack={selectedPack}
                  roll={pending}
                  revealCard={revealCard}
                  skipNonce={skipNonce}
                  onRevealDone={onRevealDone}
                  onStoreInVault={goToWonPrizes}
                />
              </React.Suspense>
            ) : null}

            {bulkOpenActive && bulkViewModel ? (
              <React.Suspense
                fallback={
                  <View style={styles.ringLoading}>
                    <Text style={styles.skipText}>{t('packOpening.reelEntering')}</Text>
                  </View>
                }
              >
                {bulkCinematicActive ? (
                  <BulkOpenCinematic
                    quantity={bulkViewModel.quantity}
                    bestTier={bulkViewModel.best.roll.tier}
                    onComplete={onBulkCinematicComplete}
                    onSkip={onBulkCinematicComplete}
                  />
                ) : null}
                {bulkResultsActive ? (
                  <BulkResultsScreen
                    viewModel={bulkViewModel}
                    onContinue={onBulkContinue}
                  />
                ) : null}
              </React.Suspense>
            ) : null}
          </View>

          {!isBulkOpen ? (
          <RevealCtaFade
            visible={engineDone}
            instant={skippedToEnd}
            enterDelayMs={720}
            enterDurationMs={720}
          >
            {compactPackHeader ? (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                style={styles.ctaBridge}
                pointerEvents="none"
              />
            ) : null}
            <View style={[styles.ctaRow, compactPackHeader && styles.ctaRowTight]}>
              <TouchableOpacity
                style={styles.openAnotherBtn}
                onPress={openAnother}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('packOpening.openNext')}
              >
                <LinearGradient
                  colors={[sg.gold, sg.goldHi]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.openAnotherGradient}
                >
                  <View style={styles.openAnotherRow}>
                    <View style={styles.openAnotherIconCircle}>
                      <Ionicons name="flash" size={22} color={sg.onGold} />
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
                    <Ionicons name="chevron-forward" size={22} color="rgba(0,0,0,0.45)" />
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
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootPress: {
    flex: 1,
    backgroundColor: sg.bg,
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
  bodyRing: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? ('100dvh' as unknown as number) : 420,
  },
  ringLoading: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.bg,
  },
  ringSkipFab: {
    position: 'absolute',
    right: sg.space.md,
    zIndex: 20,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: sg.line,
  },
  bulkSkipFab: {
    zIndex: 30,
  },
  stageHeader: {
    marginBottom: spacing.md,
  },
  headerBridge: {
    width: '100%',
    height: 1,
    marginTop: sg.space.sm,
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: sg.space.md,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: sg.space.sm,
  },
  stageEyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  titleFifa: {
    fontSize: 22,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  titleCompact: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  subFifa: {
    fontSize: fontSize.xs,
    color: sg.muted,
    maxWidth: '80%',
    letterSpacing: 0.2,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  livePillFifa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  liveDot: {
    fontSize: 9,
    color: sg.error,
  },
  liveText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.6,
  },
  ctaBridge: {
    width: '100%',
    height: 20,
    marginTop: -4,
  },
  ctaRow: {
    marginTop: sg.space.sm,
    paddingTop: sg.space.sm,
    paddingBottom: sg.space.xs,
    paddingHorizontal: sg.space.md,
    gap: sg.space.md,
  },
  ctaRowTight: {
    marginTop: 0,
    paddingTop: sg.space.xs,
  },
  openAnotherBtn: {
    borderRadius: sg.radius.btn,
    overflow: 'hidden',
    ...sg.shadowHero,
  },
  openAnotherGradient: {
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  openAnotherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: sg.space.md,
  },
  openAnotherIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openAnotherCopy: {
    flex: 1,
    minWidth: 0,
  },
  openAnotherHeadline: {
    color: sg.onGold,
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  openAnotherSub: {
    color: 'rgba(0,0,0,0.62)',
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
  },
  manageWinningsBtn: {
    paddingVertical: sg.space.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageWinningsText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: 0.2,
  },
});
