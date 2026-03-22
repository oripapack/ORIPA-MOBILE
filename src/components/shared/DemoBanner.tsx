import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { SHOW_DEMO_BANNER } from '../../config/app';

export function DemoBanner() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  if (!SHOW_DEMO_BANNER) return null;

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
      <Text style={styles.text}>{t('demoBanner')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.nearBlack,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  text: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 20,
  },
});
