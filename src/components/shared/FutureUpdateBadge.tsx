import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

/** Honest status chip for features that are documented but not yet shippable. */
export function FutureUpdateBadge() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <Text style={styles.text}>{t('futureUpdate.badge')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
