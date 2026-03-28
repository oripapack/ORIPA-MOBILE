import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PackRollResult, RevealCard, RevealRarity } from './types';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { useHeroReveal } from './useHeroReveal';
import { HeroCardView, HERO_CARD_WIDTH } from './HeroCardView';
import { HeroPackFace } from './HeroPackFace';
import { RevealAuraHalo } from './RevealAuraHalo';
import { PremiumChaseParticles } from './PremiumChaseParticles';
import { PachinkoChrome } from './PachinkoChrome';
import { HERO_STAGE } from './heroVisualTokens';
import { LinearGradient } from 'expo-linear-gradient';

export function HeroRevealEngine({
  roll,
  revealCard,
  revealRarity,
  packTint,
  replayKey,
  skipNonce,
  onRevealDone,
}: {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
}) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  const h = useHeroReveal({ roll, revealRarity, replayKey, skipNonce, onRevealDone });

  const dim = h.bgDim;
  const pulse = h.glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, tv.glowStrength] });
  const leak = h.leakOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const split = h.packSplit.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const splitLeftRot = h.packSplit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-5deg'] });
  const splitRightRot = h.packSplit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '5deg'] });

  const flipDeg = h.flip.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] });
  const valueText = `${roll.creditsWon.toLocaleString()} CR`;

  const flashColor =
    revealRarity === 'chase'
      ? 'rgba(251,191,36,1)'
      : revealRarity === 'ultra_rare'
        ? 'rgba(125,211,252,1)'
        : revealRarity === 'rare'
          ? 'rgba(56,189,248,1)'
          : '#FFFFFF';

  const chromeAccent =
    h.phase === 'primed' ? tv.accent : 'rgba(148, 163, 184, 0.85)';

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.cameraStage, { transform: [{ scale: h.cameraPunch }] }]}>
      {/* Background dim layer */}
      <Animated.View style={[styles.dim, { opacity: dim }]} pointerEvents="none" />

      <PachinkoChrome
        railShimmer={h.railShimmer}
        accent={tv.accent}
        sparkLevel={
          h.phase === 'primed' ? 2 : h.phase === 'arming' || h.phase === 'spinning' ? 1 : 0
        }
      />

      {/* Focus vignette (during reveal) */}
      <Animated.View style={[styles.vignette, { opacity: h.vignetteOpacity }]} pointerEvents="none" />

      {/* Ambient key (neutral); rarity reads on pack/card, not global purple wash */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.leak,
          {
            opacity: leak,
            shadowColor: 'rgba(148, 163, 184, 0.35)',
          },
        ]}
      />

      {/* Pack layer (center) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.packWrap,
          {
            opacity: h.packOpacity,
            transform: [{ translateX: h.packShakeX }, { scale: h.packScale }],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.packHalo,
            {
              borderColor: tv.border,
              shadowColor: tv.glow,
              opacity: pulse,
            },
          ]}
        />
        {/* Pack split illusion (two halves) */}
        <View style={styles.packSplitRow}>
          <Animated.View
            style={{
              transform: [{ translateX: Animated.multiply(split, -1) }, { rotate: splitLeftRot }],
            }}
          >
            <View style={[styles.packHalf, styles.packHalfLeft]}>
              <HeroPackFace side="left" packAccent={packTint} />
            </View>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: split }, { rotate: splitRightRot }] }}>
            <View style={[styles.packHalf, styles.packHalfRight]}>
              <HeroPackFace side="right" packAccent={packTint} />
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Flash */}
      <Animated.View
        style={[styles.flash, { opacity: h.flashOpacity, backgroundColor: flashColor }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.afterglow, { opacity: h.afterglowOpacity, backgroundColor: flashColor }]}
        pointerEvents="none"
      />

      {/* Silhouette */}
      <Animated.View style={[styles.silhouette, { opacity: h.silhouetteOpacity }]} pointerEvents="none">
        <View style={styles.silhouetteCard} />
      </Animated.View>

      <RevealAuraHalo accent={tv.accent} opacity={h.auraOpacity} />

      {/* Chase-only particles (premium) */}
      <PremiumChaseParticles
        active={
          (h.phase === 'primed' || h.phase === 'reveal' || h.phase === 'result') && revealRarity === 'chase'
        }
        revealRarity={revealRarity}
      />

      {/* Hero card */}
      <View style={styles.cardCenter} pointerEvents="none">
        <Animated.View
          collapsable={false}
          style={{
            opacity: h.cardOpacity,
            width: HERO_CARD_WIDTH,
            maxWidth: '92%',
            alignItems: 'center',
            transform: [
              { translateY: h.cardY },
              { translateY: h.floatY },
              { scale: h.cardScale },
              { perspective: 1200 },
              { rotateY: flipDeg },
            ],
          }}
        >
          {/* Depth shadow (parallax lift illusion) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardShadow,
              {
                opacity: h.cardShadow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }),
                transform: [
                  { translateY: h.cardShadow.interpolate({ inputRange: [0, 1], outputRange: [12, 22] }) },
                  { scale: h.cardShadow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                ],
              },
            ]}
          />

          <HeroCardView card={revealCard} revealRarity={revealRarity} valueText={valueText} />

          {/* Single foil sweep (one pass) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.foilWrap,
              {
                opacity: h.foilOpacity,
                transform: [{ translateX: h.foilX }, { rotate: '-18deg' }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.foil}
            />
          </Animated.View>

          <Animated.View style={[styles.badgeOverlay, { opacity: h.badgeOpacity, transform: [{ scale: h.badgeScale }] }]}>
            <View style={[styles.badge, { backgroundColor: tv.ovrBg }]}>
              <Text style={styles.badgeText}>{tv.label}</Text>
            </View>
          </Animated.View>
          <Animated.View style={[styles.valueOverlay, { opacity: h.valueOpacity, transform: [{ translateY: h.valueY }] }]}>
            <Text style={[styles.valueText, { color: 'rgba(226, 232, 240, 0.88)' }]}>
              Pull Hub · {valueText}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Tap-to-build HUD */}
      {h.phase === 'arming' ? (
        <View style={styles.hud} pointerEvents="none">
          <Text style={styles.hudTitle}>Firing up…</Text>
          <Text style={styles.hudSub}>Rails charging — get ready</Text>
        </View>
      ) : null}
      {h.phase === 'spinning' ? (
        <View style={styles.hud} pointerEvents="none">
          <Text style={styles.hudTitle}>Tap to open</Text>
          <View style={styles.hudBarTrack}>
            {/* Use scaleX instead of width (native driver-safe). */}
            <Animated.View
              style={[
                styles.hudBarFill,
                {
                  backgroundColor: tv.accent,
                  transform: [{ scaleX: h.tapCharge }],
                },
              ]}
            />
          </View>
          <Text style={styles.hudSub}>Keep tapping…</Text>
        </View>
      ) : null}
      {h.phase === 'primed' ? (
        <View style={styles.hud} pointerEvents="none">
          <Text style={[styles.hudTitle, styles.hudPrimed]}>BREAK!</Text>
          <Text style={styles.hudSub}>Pack&apos;s going…</Text>
        </View>
      ) : null}
      </Animated.View>

      {/* Must sit above cameraStage so scale wrapper never steals touches */}
      <Pressable style={styles.tapLayer} onPress={h.onTapCharge}>
        <View />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 420,
    justifyContent: 'center',
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  cameraStage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  leak: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    top: '14%',
    height: 260,
    borderRadius: 200,
    backgroundColor: HERO_STAGE.leakCore,
    borderWidth: 1,
    borderColor: HERO_STAGE.leakRim,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    zIndex: 2,
  },
  packWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  packHalo: {
    position: 'absolute',
    width: 220,
    height: 280,
    borderRadius: 18,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 26,
    elevation: 12,
  },
  packSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  packHalf: {
    width: 105,
    height: 270,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    backgroundColor: '#06090c',
  },
  packHalfLeft: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderRightWidth: 0,
  },
  packHalfRight: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderLeftWidth: 0,
  },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 10 },
  afterglow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
    opacity: 0,
  },
  silhouette: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 11 },
  silhouetteCard: {
    width: HERO_CARD_WIDTH,
    height: 380,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  cardCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  cardShadow: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    bottom: -18,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#000',
  },
  foilWrap: {
    position: 'absolute',
    left: -40,
    top: 36,
    width: 420,
    height: 120,
    zIndex: 30,
  },
  foil: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: { position: 'absolute', top: -10, right: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  valueOverlay: { position: 'absolute', left: 0, right: 0, bottom: -26, alignItems: 'center' },
  valueText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3, opacity: 0.95 },
  hud: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: 'center',
    zIndex: 60,
  },
  hudTitle: {
    color: 'rgba(248,250,252,0.9)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  hudBarTrack: {
    width: 220,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  hudBarFill: {
    height: '100%',
    borderRadius: 999,
    width: '100%',
    transform: [{ scaleX: 0 }],
  },
  hudSub: {
    marginTop: 8,
    color: 'rgba(248,250,252,0.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  hudPrimed: {
    fontSize: 15,
    letterSpacing: 3,
    color: 'rgba(253, 224, 71, 0.95)',
  },
});

