import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { SHOW_DEMO_BANNER } from '../../config/app';

export function DemoBanner() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  if (!SHOW_DEMO_BANNER) return null;

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, sg.space.sm) }]}>
      <Text style={styles.text}>{t('demoBanner')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: sg.bg,
    paddingBottom: sg.space.sm,
    paddingHorizontal: sg.space.md,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  text: {
    color: sg.text,
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.88,
  },
});
