import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
    backgroundColor: sg.bg,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  text: {
    color: sg.text,
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.88,
  },
});
