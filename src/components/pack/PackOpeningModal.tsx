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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { resolveRevealCardForTier } from './opening/mockRevealCards';
import { generatePackOpenResult } from './opening/generatePackRoll';
import type { PackRollResult } from './opening/types';
import { buildBulkOpenViewModel } from './opening/bulk/bulkOpenViewModel';
import { navigationRef } from '../../navigation/navigationRef';
import type { ResultPullData } from '../../data/mockResultPull';

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

function toCertificateId(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, '').slice(-6);
  return (digits || '0').padStart(5, '0');
}

function buildResultPull(
  rolls: PackRollResult[],
  packName: string,
  sourceId: string | number,
): ResultPullData {
  const cards = rolls.map((roll) => ({
    name: roll.result,
    tier: 'unknown' as const,
    listedValueUsd: roll.creditsWon / 100,
  }));

  return {
    pullId: toCertificateId(sourceId),
    pulledAt: new Date().toISOString(),
    packName,
    cards,
    totalListedValueUsd: cards.reduce((total, card) => total + card.listedValueUsd, 0),
  };
}

export function PackOpeningModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const visible = useAppStore((s) => s.modals.packOpening);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const packOpenSessionId = useAppStore((s) => s.packOpenSessionId);
  const closeModal = useAppStore((s) => s.closeModal);
  const applyPackOpenResult = useAppStore((s) => s.applyPackOpenResult);
  const applyBulkPackOpenResults = useAppStore((s) => s.applyBulkPackOpenResults);
  const packOpenQuantity = useAppStore((s) => s.packOpenQuantity);
  const pendingServerPull = useAppStore((s) => s.pendingServerPull);
  const pendingBulkServerPull = useAppStore((s) => s.pendingBulkServerPull);
  const clearPendingServerPull = useAppStore((s) => s.clearPendingServerPull);
  const clearPendingBulkServerPull = useAppStore((s) => s.clearPendingBulkServerPull);

  const [pending, setPending] = useState<PackRollResult | null>(null);
  const [bulkRolls, setBulkRolls] = useState<PackRollResult[] | null>(null);
  const [bulkPhase, setBulkPhase] = useState<BulkOpenPhase>('bulkCinematic');
  const [skipNonce, setSkipNonce] = useState(0);
  const [engineDone, setEngineDone] = useState(false);

  const didApplyRef = useRef(false);
  const didAdvanceToResultRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBulkOpen = packOpenQuantity > 1;

  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) return;
    setPending(null);
    setBulkRolls(null);
    setBulkPhase('bulkCinematic');
    didApplyRef.current = false;
    didAdvanceToResultRef.current = false;
    setSkipNonce(0);
    setEngineDone(false);
    clearPendingServerPull();
    clearPendingBulkServerPull();
  }, [visible, clearPendingServerPull, clearPendingBulkServerPull]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible || !selectedPack) return;
    didApplyRef.current = false;
    didAdvanceToResultRef.current = false;
    setSkipNonce(0);
    setBulkPhase('bulkCinematic');

    modalOpacity.setValue(1);

    const loc = getLocalizedPackFields(selectedPack, t);

    if (packOpenQuantity > 1) {
      const serverBulk =
        pendingBulkServerPull && pendingBulkServerPull.sessionId === packOpenSessionId
          ? pendingBulkServerPull.pulls.map((p) => p.roll)
          : null;
      const rolls: PackRollResult[] = serverBulk ?? [];
      if (!serverBulk) {
        for (let i = 0; i < packOpenQuantity; i += 1) {
          rolls.push(generatePackOpenResult(selectedPack, t, loc.title));
        }
      }
      setBulkRolls(rolls);
      setPending(null);
      setEngineDone(false);
    } else {
      setBulkRolls(null);
      const serverRoll =
        pendingServerPull && pendingServerPull.sessionId === packOpenSessionId
          ? pendingServerPull.roll
          : null;
      const roll =
        serverRoll ?? generatePackOpenResult(selectedPack, t, loc.title);
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
    pendingBulkServerPull,
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
    setSkipNonce((n) => n + 1);
    // Advance even if the WebView hasn't loaded / missed the skip message.
    setEngineDone(true);
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

  const navigateToResult = useCallback(
    (rolls: PackRollResult[]) => {
      if (!selectedPack || rolls.length === 0) return;

      const pullIds = useAppStore
        .getState()
        .pendingFulfillmentPullIds.slice(0, rolls.length);
      const pull = buildResultPull(
        rolls,
        getLocalizedPackFields(selectedPack, t).title,
        pullIds[0] ?? packOpenSessionId,
      );

      closeModal('packOpening');
      if (!navigationRef.isReady()) return;
      navigationRef.navigate('Result', { pull, pullIds });
    },
    [closeModal, packOpenSessionId, selectedPack, t],
  );

  const onBulkContinue = useCallback(() => {
    if (!bulkRolls) return;
    if (!didApplyRef.current) {
      didApplyRef.current = true;
      applyBulkPackOpenResults(bulkRolls, { persistToVault: true });
    }
    navigateToResult(bulkRolls);
  }, [applyBulkPackOpenResults, bulkRolls, navigateToResult]);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (packOpenQuantity > 1) return;
    if (didApplyRef.current) return;
    if (!engineDone) return;

    didApplyRef.current = true;
    // Record the pull before Result renders so its fulfillment actions target real store ids.
    applyPackOpenResult(pending, { persistToVault: true });
  }, [applyPackOpenResult, engineDone, packOpenQuantity, pending, selectedPack, visible]);

  /** The reveal is presentation-only; the Result screen owns the irreversible fulfillment choice. */
  useEffect(() => {
    if (!visible || !engineDone || isBulkOpen) return;
    if (!pending || !didApplyRef.current || didAdvanceToResultRef.current) return;

    didAdvanceToResultRef.current = true;
    advanceTimerRef.current = setTimeout(() => {
      navigateToResult([pending]);
    }, 600);
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [engineDone, isBulkOpen, navigateToResult, pending, visible]);

  const revealCard =
    pending && selectedPack && !isBulkOpen
      ? resolveRevealCardForTier(pending.tier, packOpenSessionId, selectedPack.category)
      : null;

  const bulkOpenActive = isBulkOpen && !!bulkViewModel;
  const bulkCinematicActive = bulkOpenActive && bulkPhase === 'bulkCinematic';
  const bulkResultsActive = bulkOpenActive && bulkPhase === 'bulkResults';

  const showSkip =
    (!!pending && !engineDone && !isBulkOpen) ||
    bulkCinematicActive;
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
            </View>
            <View style={styles.headerRight}>
              {showSkip && (
                <TouchableOpacity onPress={skipToEnd} hitSlop={12} style={styles.skipBtn}>
                  <Text style={styles.skipText}>{t('packOpening.skip')}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.livePillFifa}>
                <View style={styles.liveDot} />
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
    borderRadius: sg.radius.tag,
    backgroundColor: sg.functionalScrim,
    borderWidth: 1,
    borderColor: sg.line,
  },
  bulkSkipFab: {
    zIndex: 30,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  titleFifa: {
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  subFifa: {
    fontSize: 12,
    color: sg.muted,
    maxWidth: '80%',
    letterSpacing: 0.2,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: sg.type.data.fontSize,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
  },
  livePillFifa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: sg.radius.tag,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.neon,
    ...sg.glowNeon,
  },
  liveText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.6,
  },
});
