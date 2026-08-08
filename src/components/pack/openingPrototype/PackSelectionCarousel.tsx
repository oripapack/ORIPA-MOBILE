import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brandFont } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { runHapticIfEnabled } from '../../../audio/hapticsGate';
import { ReelPackShell } from '../opening/ReelPackShell';

const WIN_W = Dimensions.get('window').width;
/** Hero packs in the lineup (also drives rip + centered stage via `CAROUSEL_PACK_DIMS`). */
const PACK_W = 196;
const PACK_H = Math.round(PACK_W * 1.38);
const GAP = 34;
const SLOT = PACK_W + GAP;
/** Horizontal padding so each snap position centers a pack under the viewport. */
const EDGE_PAD = WIN_W / 2 - PACK_W / 2;

const VARIANT_TINTS = [
  '#1e3a5f',
  '#2d1f3d',
  '#0f2f32',
  '#3d2a1f',
  '#1a2840',
  '#252045',
  '#0d2d28',
] as const;

const COUNT = 7;
const DEFAULT_FOCUS_INDEX = Math.floor(COUNT / 2);
const SNAP_OFFSETS = Array.from({ length: COUNT }, (_, i) => i * SLOT);

/** Same tint logic as the carousel slots — use for focus + rip so the shell matches the pick. */
export function lineupPackTintAt(index: number, packTint: string, sessionSalt: number): string {
  if (index < 0 || index >= COUNT) return packTint;
  if (index === DEFAULT_FOCUS_INDEX) return packTint;
  return VARIANT_TINTS[(sessionSalt + index * 11) % VARIANT_TINTS.length]!;
}

function tintRgba(hex: string, alpha: number): string {
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(59, 130, 246, ${alpha})`;
}

function PackCarouselAmbient({ packTint }: { packTint: string }) {
  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;
  const spotlight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(driftA, {
          toValue: 1,
          duration: 7200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftA, {
          toValue: 0,
          duration: 7200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(driftB, {
          toValue: 1,
          duration: 11000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(driftB, {
          toValue: 0,
          duration: 11000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loopA.start();
    loopB.start();
    const spot = Animated.loop(
      Animated.sequence([
        Animated.timing(spotlight, { toValue: 1, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(spotlight, { toValue: 0, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    spot.start();
    return () => {
      loopA.stop();
      loopB.stop();
      spot.stop();
    };
  }, [driftA, driftB, spotlight]);

  const sheenX = driftA.interpolate({
    inputRange: [0, 1],
    outputRange: [-WIN_W * 0.42, WIN_W * 0.42],
  });
  const vignettePulse = driftB.interpolate({
    inputRange: [0, 1],
    outputRange: [0.38, 0.52],
  });

  const accent = tintRgba(packTint, 0.18);
  const accentSoft = tintRgba(packTint, 0.08);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Vault chamber base */}
      <LinearGradient
        colors={['#020617', '#0f172a', accentSoft, '#020617']}
        locations={[0, 0.35, 0.55, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial-ish spotlight (tight behind center packs). */}
      <Animated.View
        style={[
          styles.spotWrap,
          {
            opacity: spotlight.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.78] }),
            transform: [
              {
                scale: spotlight.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'transparent', 'transparent']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <LinearGradient
        colors={['rgba(248,250,252,0.14)', 'transparent', 'transparent']}
        locations={[0, 0.35, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: vignettePulse,
          },
        ]}
      >
        <LinearGradient
          colors={[accent, 'transparent', accent]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheenStrip,
          {
            transform: [{ translateX: sheenX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.09)', 'rgba(226,232,240,0.14)', 'rgba(255,255,255,0.09)', 'transparent']}
          locations={[0, 0.35, 0.5, 0.65, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.sheenGradient}
        />
      </Animated.View>

      {/* Subtle dust particles (luxury, not “sparkle”) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.dustField,
          {
            opacity: driftB.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.28] }),
            transform: [{ translateY: driftA.interpolate({ inputRange: [0, 1], outputRange: [6, -6] }) }],
          },
        ]}
      >
        {Array.from({ length: 14 }, (_, i) => {
          const left = ((i * 37) % 100) / 100 * WIN_W;
          const top = (((i * 19) % 60) + 20) / 100 * 640;
          const s = 1 + ((i % 5) * 0.12);
          return <View key={i} style={[styles.dustDot, { left, top, transform: [{ scale: s }] }]} />;
        })}
      </Animated.View>

      {/* Soft “floor” under the lineup */}
      <View style={styles.floorWrap}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.floorGradient}
        />
      </View>
    </View>
  );
}

type Props = {
  packTint: string;
  sessionSalt: number;
  onSelectIndex: (index: number) => void;
  interactionEnabled: boolean;
  /** Index user locked in (drives pulse + ring while waiting for next phase). */
  selectedIndex?: number | null;
  /** True during the post-tap beat before the focused pack stage. */
  selectionLocked?: boolean;
};

/**
 * Horizontally scrollable sealed-pack lineup. Packs scale with distance from viewport center
 * (correct center math + symmetric padding). Entrance: staggered pop-in per pack.
 */
export function PackSelectionCarousel({
  packTint,
  sessionSalt,
  onSelectIndex,
  interactionEnabled,
  selectedIndex = null,
  selectionLocked = false,
}: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const didCenterRef = useRef(false);

  const popAnims = useRef(Array.from({ length: COUNT }, () => new Animated.Value(0))).current;
  const commitScales = useRef(Array.from({ length: COUNT }, () => new Animated.Value(0))).current;

  const tints = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => lineupPackTintAt(i, packTint, sessionSalt)),
    [packTint, sessionSalt],
  );

  useEffect(() => {
    const springs = popAnims.map((val, i) => {
      const stagger = 72 * i + (i % 3) * 18;
      return Animated.sequence([
        Animated.delay(60 + stagger),
        Animated.spring(val, {
          toValue: 1,
          friction: 10,
          tension: 78,
          useNativeDriver: true,
        }),
      ]);
    });
    Animated.parallel(springs).start();
  }, [popAnims]);

  useEffect(() => {
    if (selectedIndex == null || selectedIndex < 0 || selectedIndex >= COUNT) return;
    const v = commitScales[selectedIndex];
    v.setValue(0);
    Animated.sequence([
      Animated.spring(v, {
        toValue: 1,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }),
      Animated.spring(v, {
        toValue: 0,
        friction: 10,
        tension: 76,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedIndex, commitScales]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  }, []);

  const centerOnIndex = useCallback(
    (index: number, animated: boolean) => {
      const x = Math.max(0, index * SLOT);
      scrollRef.current?.scrollTo({ x, y: 0, animated });
      setScrollX(x);
    },
    [scrollRef],
  );

  const onContentSizeChange = useCallback((_w: number, _h: number) => {
    if (didCenterRef.current) return;
    didCenterRef.current = true;
    requestAnimationFrame(() => {
      centerOnIndex(DEFAULT_FOCUS_INDEX, false);
    });
  }, [centerOnIndex]);

  useEffect(() => {
    if (!selectionLocked) return;
    if (selectedIndex == null || selectedIndex < 0 || selectedIndex >= COUNT) return;
    // On selection lock, gently bring the chosen pack to center so the user feels
    // the exact pack they tapped becomes the “hero”.
    requestAnimationFrame(() => {
      centerOnIndex(selectedIndex, true);
    });
  }, [centerOnIndex, selectedIndex, selectionLocked]);

  const viewportCenter = scrollX + WIN_W / 2;

  const onPackPress = useCallback(
    (i: number) => {
      if (!interactionEnabled) return;
      runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      onSelectIndex(i);
    },
    [interactionEnabled, onSelectIndex],
  );

  return (
    <View style={styles.wrap}>
      <PackCarouselAmbient packTint={packTint} />
      <Text style={styles.hint}>{t('packOpening.lineupHint')}</Text>
      <View pointerEvents="none" style={styles.edgeFade} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LinearGradient
          colors={['rgba(2,6,23,0.92)', 'rgba(2,6,23,0.0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.edgeFadeSide, { left: 0 }]}
        />
        <LinearGradient
          colors={['rgba(2,6,23,0.0)', 'rgba(2,6,23,0.92)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.edgeFadeSide, { right: 0 }]}
        />
      </View>
      <View style={styles.carouselBand}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="normal"
          snapToOffsets={SNAP_OFFSETS}
          snapToAlignment="start"
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: EDGE_PAD }]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          scrollEnabled={interactionEnabled}
          onContentSizeChange={onContentSizeChange}
        >
          {tints.map((tint, i) => {
            const cx = EDGE_PAD + i * SLOT + PACK_W / 2;
            const dist = Math.abs(cx - viewportCenter);
            const norm = Math.min(1, dist / (WIN_W * 0.52));
            // Physical depth: center feels a touch closer + clearer, sides fall back gently.
            const depthScale = 0.92 + (1 - norm) * 0.11;
            const depthOpacity = 0.52 + (1 - norm) * 0.48;
            const z = 100 - Math.round(dist / 8);

            const pop = popAnims[i];
            const isChosen = selectedIndex === i;
            const dimOthers = selectionLocked && selectedIndex != null && !isChosen;

            const commit = commitScales[i];
            const commitBoost = commit.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.09],
              extrapolate: 'clamp',
            });
            const scalePop = pop.interpolate({
              inputRange: [0, 1],
              outputRange: [0.42, 1],
              extrapolate: 'clamp',
            });
            const chosenLockBoost = isChosen && selectionLocked ? 1.06 : 1;
            const packScale = isChosen
              ? Animated.multiply(scalePop, Animated.multiply(commitBoost, chosenLockBoost))
              : scalePop;

            return (
              <Pressable
                key={`line-${i}`}
                disabled={!interactionEnabled}
                onPress={() => onPackPress(i)}
                style={[styles.slot, { width: SLOT }]}
              >
                <Animated.View
                  style={[
                    styles.slotDim,
                    dimOthers && styles.slotDimmed,
                    dimOthers
                      ? {
                          transform: [
                            {
                              translateY: 10,
                            },
                          ],
                        }
                      : null,
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.popShell,
                      {
                        opacity: pop.interpolate({
                          inputRange: [0, 0.12, 1],
                          outputRange: [0, 0.85, 1],
                          extrapolate: 'clamp',
                        }),
                        transform: [
                          { scale: packScale },
                          {
                            translateY: pop.interpolate({
                              inputRange: [0, 1],
                              outputRange: [26, 0],
                              extrapolate: 'clamp',
                            }),
                          },
                          dimOthers
                            ? {
                                translateX: isChosen ? 0 : i < (selectedIndex ?? 0) ? -18 : 18,
                              }
                            : { translateX: 0 },
                        ],
                      },
                    ]}
                  >
                  <View
                    style={[
                      styles.packLift,
                      {
                        transform: [{ scale: depthScale }],
                        opacity: depthOpacity,
                        zIndex: z,
                      },
                    ]}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        styles.packShadow,
                        {
                          opacity: 0.18 + (1 - norm) * 0.22,
                          transform: [{ scaleX: 0.92 + (1 - norm) * 0.16 }],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.ring,
                        isChosen && selectionLocked ? { borderColor: tintRgba(tint, 0.95), borderWidth: 2 } : null,
                        isChosen && selectionLocked
                          ? {
                              shadowColor: tint,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.75,
                              shadowRadius: 18,
                              elevation: 14,
                            }
                          : null,
                      ]}
                    >
                      <ReelPackShell width={PACK_W} height={PACK_H} tint={tint} lockEmphasis={0} />
                    </View>
                  </View>
                  </Animated.View>
                </Animated.View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    paddingTop: spacing.xs,
    overflow: 'hidden',
  },
  sheenStrip: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheenGradient: {
    width: WIN_W * 0.55,
    height: '100%',
  },
  spotWrap: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '18%',
    height: 340,
    borderRadius: 999,
  },
  floorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    opacity: 0.9,
  },
  floorGradient: {
    width: '100%',
    height: '100%',
  },
  dustField: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  dustDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(226,232,240,0.55)',
    shadowColor: 'rgba(255,255,255,0.45)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  carouselBand: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  hint: {
    color: 'rgba(226,232,240,0.82)',
    fontSize: 13,
    fontFamily: brandFont.medium,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
    zIndex: 1,
  },
  edgeFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 3,
  },
  edgeFadeSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: Math.min(72, WIN_W * 0.18),
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotDim: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotDimmed: {
    opacity: 0.36,
  },
  popShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  packLift: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  packShadow: {
    position: 'absolute',
    bottom: -18,
    width: PACK_W * 0.9,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#000',
  },
  ring: {
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

export const CAROUSEL_PACK_DIMS = { w: PACK_W, h: PACK_H, slot: SLOT };
