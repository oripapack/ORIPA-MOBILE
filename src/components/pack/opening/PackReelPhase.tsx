import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brandFont } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { ReelBackRim } from './ReelBackRim';
import { ReelRingSlot } from './ReelRingSlot';
import { usePackReel } from './usePackReel';

const WIN_W = Dimensions.get('window').width;
/**
 * Ring radius vs window width: too large reads as a flat strip; slightly tighter keeps an arc
 * readable once the stage is tilted (overhead camera).
 */
const RING_RADIUS = WIN_W * 0.88;
/** Zoomed-out stage — whole ring reads as environment. */
const REEL_STAGE_SCALE = 0.63;
/** Downward view: enough to read the ring, not so steep that the center pack warps. */
const REEL_CAMERA_TILT_X = '25deg';
/** Higher = milder foreshortening (cleaner pack art, still reads 3D). */
const REEL_STAGE_PERSPECTIVE = 1120;
/** Hinge toward the back/top of the stage — reads like a camera slightly above & behind. */
const REEL_STAGE_ORIGIN = '50% 30%';
/** Reframe after tilt so the arc sits comfortably under the title. */
const REEL_STAGE_POST_TILT_Y = 16;

function hexWithAlpha(hex: string, aa: string): string {
  if (typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex)) return `${hex}${aa}`;
  return `#C9A227${aa}`;
}

/**
 * Smooth studio backdrop — many close gradient stops + blur dithers banding;
 * avoids stacked high-contrast layers that read as “blocky” bands.
 */
function ReelStageBackdrop({ winTint, dimExtra }: { winTint: string; dimExtra: number }) {
  const accentTop = hexWithAlpha(winTint, '14');
  const accentBot = hexWithAlpha(winTint, '0a');
  const blurIntensity = Platform.OS === 'ios' ? 34 : 26;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#070a12', '#090d16', '#0b101a', '#0d121f', '#0e1424', '#0c121f', '#0a0f1a', '#080c16']}
        locations={[0, 0.11, 0.24, 0.38, 0.52, 0.66, 0.82, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[accentTop, 'transparent', accentBot]}
        locations={[0, 0.52, 1]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.85 }]}
      />
      <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'transparent', 'transparent', 'rgba(0,0,0,0.22)']}
        locations={[0, 0.2, 0.8, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
      />
      <View style={[styles.stageDimWash, { opacity: 0.12 + dimExtra * 0.32 }]} />
    </View>
  );
}

const PACK_W = 82;
const PACK_H = Math.round(PACK_W * 1.38);
/** Extra vertical room for overhead arc + tilt (avoid clipping top/bottom of packs). */
const REEL_CANVAS_H = PACK_H + 96;
const MARKER_H = 18;
const CENTER_BLOCK_H = MARKER_H + REEL_CANVAS_H * REEL_STAGE_SCALE + MARKER_H + 20;

const HANDOFF_MS = 840;
const LOCK_BEAT_MS = 220;
/** Fade / lift / scale in before the reel starts moving. */
const GALLERY_ENTRANCE_MS = 560;
/** Start horizontal motion shortly after entrance completes. */
const REEL_MOTION_DELAY_MS = GALLERY_ENTRANCE_MS + 72;

type Props = {
  sessionSalt: number;
  winTint: string;
  skipNonce: number;
  /** Fires once when the gallery begins receding (mount / fade hero underneath). */
  onHandoffStart?: () => void;
  /** Reel overlay done; `skipped` when user used Skip during reel. */
  onFinished?: (detail?: { skipped?: boolean }) => void;
};

export function PackReelPhase({
  sessionSalt,
  winTint,
  skipNonce,
  onHandoffStart,
  onFinished,
}: Props) {
  const { t } = useTranslation();
  const [landedOnce, setLandedOnce] = useState(false);
  const [skipHandoff, setSkipHandoff] = useState(false);
  const entranceProgress = useRef(new Animated.Value(0)).current;
  const handoffProgress = useRef(new Animated.Value(0)).current;
  const finishedRef = useRef(false);
  const handoffStartedRef = useRef(false);
  const onHandoffStartRef = useRef(onHandoffStart);
  const onFinishedRef = useRef(onFinished);
  onHandoffStartRef.current = onHandoffStart;
  onFinishedRef.current = onFinished;

  const handleLanded = (fromSkip: boolean) => {
    setSkipHandoff(fromSkip);
    setLandedOnce(true);
  };

  const { reelX, shells, winIndex, slotW, packW, screenCx, uiPhase, motionStarted, onUserSlowTap } = usePackReel({
    sessionSalt,
    winTint,
    skipNonce,
    onLanded: handleLanded,
    reelMotionDelayMs: REEL_MOTION_DELAY_MS,
  });

  useEffect(() => {
    entranceProgress.setValue(0);
    const anim = Animated.timing(entranceProgress, {
      toValue: 1,
      duration: GALLERY_ENTRANCE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [entranceProgress, sessionSalt]);

  useEffect(() => {
    if (!landedOnce) return;

    if (skipHandoff) {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onFinishedRef.current?.({ skipped: true });
      return;
    }

    if (handoffStartedRef.current) return;
    handoffStartedRef.current = true;
    handoffProgress.setValue(0);

    const lockBeat = setTimeout(() => {
      onHandoffStartRef.current?.();
      Animated.timing(handoffProgress, {
        toValue: 1,
        duration: HANDOFF_MS,
        easing: Easing.bezier(0.33, 0, 0.2, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !finishedRef.current) {
          finishedRef.current = true;
          onFinishedRef.current?.({ skipped: false });
        }
      });
    }, LOCK_BEAT_MS);

    return () => clearTimeout(lockBeat);
  }, [handoffProgress, landedOnce, skipHandoff]);

  const hintOpacity = !motionStarted ? 0.55 : uiPhase === 'fast' ? 1 : uiPhase === 'slow' ? 0.45 : 0.2;
  const dimExtra = uiPhase === 'slow' ? 0.08 : 0;

  const entranceOpacity = entranceProgress.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0.92, 1, 1],
  });
  const entranceScale = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const entranceTranslateY = entranceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  const galleryOpacity = handoffProgress.interpolate({
    inputRange: [0, 0.38, 1],
    outputRange: [1, 1, 0],
  });
  const galleryTranslateX = handoffProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const galleryTranslateY = handoffProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });
  const galleryScale = handoffProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.entranceWrap,
          {
            opacity: entranceOpacity,
            transform: [{ translateY: entranceTranslateY }, { scale: entranceScale }],
          },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.galleryShell,
            {
              opacity: galleryOpacity,
              transform: [
                { translateX: galleryTranslateX },
                { translateY: galleryTranslateY },
                { scale: galleryScale },
              ],
            },
          ]}
          pointerEvents="box-none"
        >
        <ReelStageBackdrop winTint={winTint} dimExtra={dimExtra} />

        <View style={styles.centerZone}>
          <View style={styles.markerTop} pointerEvents="none" />
          <View style={styles.reelRingStage}>
            <View
              collapsable={false}
              style={[
                styles.reelRingScale,
                {
                  transformOrigin: REEL_STAGE_ORIGIN,
                  transform: [
                    { perspective: REEL_STAGE_PERSPECTIVE },
                    { rotateX: REEL_CAMERA_TILT_X },
                    { translateY: REEL_STAGE_POST_TILT_Y },
                    { scale: REEL_STAGE_SCALE },
                  ],
                },
              ]}
            >
              <View style={[styles.reelRingCanvas, { width: WIN_W, height: REEL_CANVAS_H }]}>
                <ReelBackRim reelX={reelX} screenCx={screenCx} ringRadius={RING_RADIUS} sessionSalt={sessionSalt} />
                {shells.map((s, i) => (
                  <ReelRingSlot
                    key={s.key}
                    reelX={reelX}
                    index={i}
                    shell={s}
                    slotW={slotW}
                    packW={packW}
                    packH={PACK_H}
                    screenCx={screenCx}
                    ringRadius={RING_RADIUS}
                    lockEmphasis={i === winIndex && uiPhase === 'landed'}
                  />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.markerBottom} pointerEvents="none" />
        </View>

        <View style={styles.hud} pointerEvents="box-none">
          <Text style={[styles.hudTitle, { opacity: hintOpacity }]}>
            {!motionStarted
              ? t('packOpening.reelEntering')
              : uiPhase === 'fast'
                ? t('packOpening.reelTapToSlow')
                : uiPhase === 'slow'
                  ? t('packOpening.reelSlowing')
                  : t('packOpening.reelLocked')}
          </Text>
          <Text style={styles.hudSub}>
            {!motionStarted ? t('packOpening.reelEnteringSub') : t('packOpening.reelSub')}
          </Text>
        </View>
        </Animated.View>
      </Animated.View>

      <Pressable
        style={styles.tapShield}
        onPress={onUserSlowTap}
        disabled={uiPhase === 'landed' || !motionStarted}
        accessibilityRole="button"
        accessibilityLabel={t('packOpening.reelTapToSlowA11y')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  entranceWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  galleryShell: {
    ...StyleSheet.absoluteFillObject,
  },
  stageDimWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
  },
  centerZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '14%',
    height: CENTER_BLOCK_H,
    justifyContent: 'center',
  },
  reelRingStage: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: REEL_CANVAS_H * REEL_STAGE_SCALE,
  },
  reelRingScale: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelRingCanvas: {
    position: 'relative',
    overflow: 'visible',
  },
  markerTop: {
    alignSelf: 'center',
    width: 2,
    height: MARKER_H,
    borderRadius: 1,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 251, 235, 0.55)',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#FDE68A',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.85,
          shadowRadius: 5,
        }
      : { elevation: 4 }),
  },
  markerBottom: {
    alignSelf: 'center',
    width: 2,
    height: MARKER_H,
    borderRadius: 1,
    marginTop: 4,
    backgroundColor: 'rgba(255, 251, 235, 0.55)',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#FDE68A',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.85,
          shadowRadius: 5,
        }
      : { elevation: 4 }),
  },
  hud: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: '20%',
    alignItems: 'center',
  },
  hudTitle: {
    color: 'rgba(248,250,252,0.92)',
    fontSize: 13,
    fontFamily: brandFont.extraBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  hudSub: {
    color: 'rgba(148,163,184,0.88)',
    fontSize: 11,
    fontFamily: brandFont.medium,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tapShield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
  },
});
