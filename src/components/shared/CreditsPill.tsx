import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
  /** Optional: tap the balance number (e.g. open credit ledger). */
  onPressBalance?: () => void;
}

/**
 * Coin balance chip — N2: the balance NUMBER is the gold value signal (§4);
 * the coin glyph stays muted so header gold stays scarce (wordmark accent +
 * balance only). Surface fill + 1px line border; tag radius. Gold never
 * fills the add button.
 */
export function CreditsPill({ onAdd, onPressBalance }: Props) {
  const { t } = useTranslation();
  const credits = useAppStore((s) => s.user.credits);

  return (
    <View style={styles.pill}>
      <FontAwesome5 name="coins" size={13} color={sg.muted} style={styles.coin} solid />
      <TouchableOpacity
        onPress={onPressBalance}
        disabled={!onPressBalance}
        accessibilityRole={onPressBalance ? 'button' : undefined}
        accessibilityLabel={onPressBalance ? t('creditsPill.a11yHistory') : undefined}
        hitSlop={6}
      >
        <Text style={styles.amount}>{credits.toLocaleString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAdd}
        activeOpacity={0.8}
        accessibilityLabel={t('creditsPill.a11yAdd')}
      >
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.tag,
    paddingLeft: spacing.sm,
    paddingRight: 0,
    height: 34,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  coin: {
    marginRight: 2,
  },
  amount: {
    color: sg.gold,
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    marginRight: spacing.xs,
  },
  addBtn: {
    backgroundColor: sg.surface2,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: sg.text,
    fontSize: 16,
    fontFamily: sg.font.bodyBold,
    lineHeight: 20,
  },
});
