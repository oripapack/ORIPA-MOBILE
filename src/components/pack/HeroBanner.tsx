import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { demoHomeHeroBackground } from '../../data/demoMedia';

const { width: BANNER_W } = Dimensions.get('window');

interface Props {
  /** Primary CTA — e.g. dismiss welcome hero (full catalog is already below). */
  onBrowsePacks?: () => void;
  /** Close without navigating (still one-time hide). */
  onDismiss?: () => void;
}

export function HeroBanner({ onBrowsePacks, onDismiss }: Props) {
  const { t } = useTranslation();
  const float = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(float, {
            toValue: 1,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sheen, {
            toValue: 1,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(float, {
            toValue: 0,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sheen, {
            toValue: 0,
            duration: 3200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, sheen]);

  const cardLift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const cardTilt = float.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '-5deg'] });
  const glowOpacity = sheen.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: demoHomeHeroBackground }}
        style={styles.bgPhoto}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.bgSvg} pointerEvents="none">
        <Svg width={BANNER_W} height={220}>
          <Defs>
            <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#050a06" />
              <Stop offset="0.32" stopColor="#0f1f14" />
              <Stop offset="0.65" stopColor="#142010" />
              <Stop offset="1" stopColor="#020403" />
            </LinearGradient>
            <LinearGradient id="heroHot" x1="1" y1="0" x2="0.2" y2="0.85">
              <Stop offset="0" stopColor="rgba(196, 30, 58, 0.42)" />
              <Stop offset="0.4" stopColor="rgba(212, 175, 55, 0.18)" />
              <Stop offset="1" stopColor="rgba(255,255,255,0)" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={BANNER_W} height={220} fill="url(#heroGrad)" />
          <Rect x={0} y={0} width={BANNER_W} height={220} fill="url(#heroHot)" opacity={0.88} />
        </Svg>
      </View>

      <Animated.View style={[styles.hotGlow, { opacity: glowOpacity }]} pointerEvents="none" />

      {onDismiss ? (
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel={t('hero.notNow')}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>{t('hero.eyebrow')}</Text>
        <Text style={styles.headline}>
          {t('hero.headline1')}
          {'\n'}
          {t('hero.headline2')}
        </Text>
        <Text style={styles.subtext}>{t('hero.sub')}</Text>
        <TouchableOpacity style={styles.cta} onPress={onBrowsePacks} activeOpacity={0.88}>
          <Text style={styles.ctaText}>{t('hero.browsePacks')}</Text>
        </TouchableOpacity>
        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss} style={styles.notNow} hitSlop={8}>
            <Text style={styles.notNowText}>{t('hero.notNow')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Decorative card stack */}
      <Animated.View
        style={[
          styles.cardStack,
          {
            transform: [{ translateY: cardLift }, { rotate: cardTilt }],
          },
        ]}
      >
        <View style={[styles.card, styles.cardBack2]} />
        <View style={[styles.card, styles.cardBack1]} />
        <View style={[styles.card, styles.cardFront]}>
          <Text style={styles.cardEmoji}>⭐</Text>
          <Text style={styles.cardLabel}>{t('hero.hitCard')}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  bgSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  hotGlow: {
    position: 'absolute',
    left: '58%',
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.red,
    opacity: 0.5,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 2,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 28,
    fontWeight: fontWeight.regular,
    lineHeight: 30,
  },
  inner: {
    flex: 1,
    marginRight: spacing.base,
    zIndex: 1,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.white,
    lineHeight: 33,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 19,
    marginBottom: spacing.base,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.red,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  notNow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  notNowText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.45)',
    textDecorationLine: 'underline',
  },
  cardStack: {
    width: 80,
    height: 110,
    position: 'relative',
    zIndex: 1,
  },
  card: {
    position: 'absolute',
    width: 72,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardBack2: {
    backgroundColor: '#2A1810',
    top: 0,
    left: 8,
    transform: [{ rotate: '8deg' }],
  },
  cardBack1: {
    backgroundColor: '#5C1F1F',
    top: 2,
    left: 4,
    transform: [{ rotate: '4deg' }],
  },
  cardFront: {
    backgroundColor: colors.red,
    top: 4,
    left: 0,
    transform: [{ rotate: '-2deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginTop: 4,
  },
});
