import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PackOpenQuantity } from '../../store/useAppStore';
import { PACK_OPEN_QUANTITIES } from '../../lib/packMultiOpen';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  value: PackOpenQuantity;
  onChange: (q: PackOpenQuantity) => void;
  disabled?: boolean;
  disabled10?: boolean;
  disabled100?: boolean;
};

export function PackOpenQuantitySelector({ value, onChange, disabled, disabled10, disabled100 }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('packDetails.multiOpen.quantity')}</Text>
      <View style={styles.row}>
        {PACK_OPEN_QUANTITIES.map((q) => {
          const isSelected = value === q;
          const segDisabled =
            disabled || (q === 10 && disabled10) || (q === 100 && disabled100);
          return (
            <TouchableOpacity
              key={q}
              style={[styles.seg, isSelected && styles.segSelected, segDisabled && styles.segDisabled]}
              activeOpacity={0.88}
              disabled={segDisabled}
              onPress={() => onChange(q)}
            >
              <Text style={[styles.segText, isSelected && styles.segTextSelected]}>{q}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 4,
    gap: 4,
  },
  seg: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segSelected: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  segDisabled: {
    opacity: 0.35,
  },
  segText: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  segTextSelected: {
    color: colors.accentDark,
  },
});
