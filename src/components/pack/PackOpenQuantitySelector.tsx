import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PackOpenQuantity } from '../../store/useAppStore';
import { PACK_OPEN_QUANTITIES } from '../../lib/packMultiOpen';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius } from '../../tokens/spacing';

type Props = {
  value: PackOpenQuantity;
  onChange: (q: PackOpenQuantity) => void;
  disabled?: boolean;
  disabled10?: boolean;
};

export function PackOpenQuantitySelector({ value, onChange, disabled, disabled10 }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('packDetails.multiOpen.quantity')}</Text>
      <View style={styles.row}>
        {PACK_OPEN_QUANTITIES.map((q) => {
          const isSelected = value === q;
          const segDisabled = disabled || (q === 10 && disabled10);
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
    gap: sg.space.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    borderRadius: radius.full,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
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
    backgroundColor: sg.cobaltWashStrong,
    borderWidth: 1,
    borderColor: sg.gold,
  },
  segDisabled: {
    opacity: 0.35,
  },
  segText: {
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.4,
  },
  segTextSelected: {
    color: sg.accentText,
  },
});
