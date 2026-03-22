import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  /** Primary CTA — e.g. dismiss welcome hero (full catalog is already below). */
  onBrowsePacks?: () => void;
  /** Close without navigating (still one-time hide). */
  onDismiss?: () => void;
}

export function HeroBanner({ onBrowsePacks, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.cta} onPress={onBrowsePacks} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('hero.browsePacks')}</Text>
        </TouchableOpacity>
        {onDismiss ? (
          <TouchableOpacity onPress={onDismiss} style={styles.notNow} hitSlop={8}>
            <Text style={styles.notNowText}>{t('hero.notNow')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Decorative card stack */}
      <View style={styles.cardStack}>
        <View style={[styles.card, styles.cardBack2]} />
        <View style={[styles.card, styles.cardBack1]} />
        <View style={[styles.card, styles.cardFront]}>
          <Text style={styles.cardEmoji}>⭐</Text>
          <Text style={styles.cardLabel}>{t('hero.hitCard')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.nearBlack,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
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
    backgroundColor: '#2D2D3A',
    top: 0,
    left: 8,
    transform: [{ rotate: '8deg' }],
  },
  cardBack1: {
    backgroundColor: '#3D2020',
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
