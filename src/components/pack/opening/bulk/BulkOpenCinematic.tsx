import React, { useEffect, useMemo, useRef } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  Easing,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { RarityTier } from '../../../../audio/packOpeningFeedback';
import { hapticPackReveal } from '../../../../audio/packOpeningFeedback';
import type { PackOpenQuantity } from '../../../../store/useAppStore';
import { colors } from '../../../../tokens/colors';
import { brandFont, fontSize } from '../../../../tokens/typography';
import { tierCelebrationFor } from '../tierCelebration';

/** Shared multi-pack open beat (~1.5s) before bulk results. */
const C = {
  totalMs: 1500,
  reducedMs: 120,
  packCount: 5,
  /** Stagger each silhouette inward (ms). */
  packStaggerMs: 55,
  /** Pack fly-in from ring positions → center. */
  packInMs: 520,
  /** Hold at center before flash. */
  holdMs: 180,
  flashPeakMs: 90,
  flashOutMs: 420,
  /** Final fade before handoff. */
  outMs: 280,
} as const;

/** Spread offsets (normalized) — packs start on a ring and collapse to center. */
const PACK_OFFSETS = [
  { x: -0.38, y: -0.06, rot: -12 },
  { x: 0.34, y: -0.08, rot: 10 },
  { x: -0.22, y: 0.14, rot: -6 },
  { x: 0.26, y: 0.12, rot: 8 },
  { x: 0, y: -0.18, rot: 0 },
] as const;

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeIn = Easing.bezier(0.55, 0, 0.9, 0.45);

export type BulkOpenCinematicProps = {
  quantity: Extract<PackOpenQuantity, 10 | 100>;
  bestTier: RarityTier;
  onComplete: () => void;
  /** Optional — parent wires Skip FAB. */
  onSkip?: () => void;
};

function PackSilhouette({
  index,
  progress,
  flash,
  accent,
  stageW,
  stageH,
}: {
  index: number;
  progress: SharedValue<number>;
  flash: SharedValue<number>;
  accent: string;
  stageW: number;
  stageH: number;
}) {
  const offset = PACK_OFFSETS[index % PACK_OFFSETS.length]!;

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const travelX = offset.x * stageW * (1 - p);
    const travelY = offset.y * stageH * (1 - p);
    const scale = 0.72 + p * 0.38 - flash.value * 0.22;
    const opacity = (0.35 + p * 0.65) * (1 - flash.value * 0.85);
    return {
      opacity,
      transform: [
        { translateX: travelX },
        { translateY: travelY },
        { rotate: `${offset.rot * (1 - p)}deg` },
        { scale },
      ],
    };
  });

  return (
    <Reanimated.View style={[styles.packWrap, style]} pointerEvents="none">
      <View style={[styles.packBody, { borderColor: `${accent}88` }]}>
        <LinearGradient
          colors={['#1E1E2A', '#12121A']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.packStripe, { backgroundColor: `${accent}44` }]} />
      </View>
    </Reanimated.View>
  );
}

export function BulkOpenCinematic({
  quantity,
  bestTier,
  onComplete,
  onSkip,
}: BulkOpenCinematicProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const accent = tierCelebrationFor(bestTier).accent;

  const progress = useSharedValue(0);
  const flash = useSharedValue(0);
  const badge = useSharedValue(0);
  const root = useSharedValue(1);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  const quantityLabel = useMemo(
    () => (quantity === 10 ? t('packDetails.multiOpen.fastTitle') : t('packDetails.multiOpen.rushTitle')),
    [quantity, t],
  );

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      hapticPackReveal();
      onCompleteRef.current();
    };

    const run = (reduced: boolean) => {
      if (cancelled) return;

      if (reduced) {
        progress.value = 1;
        flash.value = withSequence(
          withTiming(0.5, { duration: 40 }),
          withTiming(0, { duration: C.reducedMs - 40, easing: easeOut }, (done) => {
            if (done) runOnJS(finish)();
          }),
        );
        return;
      }

      progress.value = withTiming(1, {
        duration: C.packInMs,
        easing: easeOut,
      });

      badge.value = withDelay(
        120,
        withTiming(1, { duration: 380, easing: easeOut }),
      );

      const flashAt = C.packInMs + C.holdMs;
      flash.value = withDelay(
        flashAt,
        withSequence(
          withTiming(1, { duration: C.flashPeakMs, easing: easeIn }),
          withTiming(0, { duration: C.flashOutMs, easing: easeOut }),
        ),
      );

      root.value = withDelay(
        flashAt + C.flashPeakMs + C.flashOutMs,
        withTiming(0, { duration: C.outMs, easing: easeIn }, (done) => {
          if (done) runOnJS(finish)();
        }),
      );
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => run(reduced))
      .catch(() => run(false));

    return () => {
      cancelled = true;
    };
  }, [badge, flash, progress, root]);

  const skip = () => {
    onSkipRef.current?.();
    onCompleteRef.current();
  };

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.72,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.value,
    transform: [{ scale: 0.88 + badge.value * 0.12 }],
  }));

  const rootStyle = useAnimatedStyle(() => ({
    opacity: root.value,
  }));

  return (
    <Reanimated.View style={[styles.root, rootStyle]} accessibilityRole="none">
      <LinearGradient
        colors={['#060606', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.stage, { width, height: height * 0.55 }]}>
        {Array.from({ length: C.packCount }, (_, i) => (
          <PackSilhouette
            key={i}
            index={i}
            progress={progress}
            flash={flash}
            accent={accent}
            stageW={width * 0.72}
            stageH={height * 0.28}
          />
        ))}

        <Reanimated.View style={[styles.countBadge, badgeStyle]} pointerEvents="none">
          <Text style={styles.countQty}>×{quantity}</Text>
          <Text style={styles.countMode} numberOfLines={1}>
            {quantityLabel}
          </Text>
        </Reanimated.View>
      </View>

      <Reanimated.View style={[styles.flash, { backgroundColor: accent }, flashStyle]} pointerEvents="none" />

      {onSkip ? (
        <Pressable
          style={styles.skipBtn}
          onPress={skip}
          accessibilityRole="button"
          accessibilityLabel={t('packOpening.skip')}
        >
          <Text style={styles.skipLabel}>{t('packOpening.skip')}</Text>
        </Pressable>
      ) : null}
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: colors.black,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packWrap: {
    position: 'absolute',
    width: 72,
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packBody: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  packStripe: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '38%',
    height: 3,
    borderRadius: 2,
  },
  countBadge: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  countQty: {
    fontFamily: brandFont.black,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  countMode: {
    fontFamily: brandFont.semibold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  skipLabel: {
    fontFamily: brandFont.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
