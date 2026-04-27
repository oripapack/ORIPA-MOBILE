import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../tokens/colors';
import { fontSize, brandFont } from '../../../tokens/typography';
import type { PackRollResult, RevealRarity } from './types';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';

export function ResultLayer({
  roll,
  revealRarity,
  valueOpacity,
}: {
  roll: PackRollResult;
  revealRarity: RevealRarity;
  valueOpacity: Animated.Value;
}) {
  const { t } = useTranslation();
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>{t('packOpeningEngine.estimatedValueLabel')}</Text>
      <Animated.Text style={[styles.value, { opacity: valueOpacity, color: tv.accent }]}>
        {roll.creditsWon.toLocaleString()} CR
      </Animated.Text>
      <Text style={styles.subtitle}>{tv.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
    zIndex: 30,
  },
  label: {
    fontSize: 10,
    fontFamily: brandFont.black,
    letterSpacing: 1.3,
    color: colors.textMuted,
  },
  value: {
    marginTop: 4,
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
    letterSpacing: 1.1,
  },
});
