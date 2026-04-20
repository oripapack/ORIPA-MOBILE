import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { elevation, radius, spacing } from '../../tokens/spacing';
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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const cardLift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const cardTilt = float.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '-4deg'] });

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
              <Stop offset="0" stopColor="#120A22" stopOpacity={0.94} />
              <Stop offset="0.45" stopColor="#0F1428" stopOpacity={0.9} />
              <Stop offset="1" stopColor="#1A1035" stopOpacity={0.92} />
            </LinearGradient>
            <LinearGradient id="heroTint" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="rgba(232, 197, 71, 0.09)" />
              <Stop offset="0.5" stopColor="rgba(192, 132, 252, 0.07)" />
              <Stop offset="1" stopColor="rgba(56, 189, 248, 0.05)" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={BANNER_W} height={220} fill="url(#heroGrad)" />
          <Rect x={0} y={0} width={BANNER_W} height={220} fill="url(#heroTint)" />
        </Svg>
      </View>

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
          <ExpoLinearGradient
            colors={[colors.gold, colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.ctaText}>{t('hero.browsePacks')}</Text>
        </TouchableOpacity>
        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss} style={styles.notNow} hitSlop={8}>
            <Text style={styles.notNowText}>{t('hero.notNow')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldBorderHairline,
    backgroundColor: colors.surfaceElevated,
    ...elevation.heroBanner,
  },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.38,
  },
  bgSvg: {
    ...StyleSheet.absoluteFillObject,
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
    color: colors.textMuted,
    fontSize: 28,
    fontFamily: brandFont.regular,
    lineHeight: 30,
  },
  inner: {
    flex: 1,
    marginRight: spacing.base,
    zIndex: 1,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.gold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.base,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.goldBorder,
    position: 'relative',
  },
  ctaText: {
    color: colors.ink,
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    letterSpacing: 0.35,
    zIndex: 1,
  },
  notNow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  notNowText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
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
    borderColor: colors.border,
  },
  cardBack2: {
    backgroundColor: '#243B56',
    top: 0,
    left: 8,
    transform: [{ rotate: '8deg' }],
  },
  cardBack1: {
    backgroundColor: '#1F4A45',
    top: 2,
    left: 4,
    transform: [{ rotate: '4deg' }],
  },
  cardFront: {
    backgroundColor: colors.nearBlack,
    top: 4,
    left: 0,
    transform: [{ rotate: '-2deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardLabel: {
    color: colors.textOnDark,
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    marginTop: 4,
  },
});
