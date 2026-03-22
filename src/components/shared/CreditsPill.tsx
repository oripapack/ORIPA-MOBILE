import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
}

export function CreditsPill({ onAdd }: Props) {
  const credits = useAppStore((s) => s.user.credits);

  return (
    <View style={styles.pill}>
      <FontAwesome5 name="coins" size={14} color={colors.gold} style={styles.coin} solid />
      <Text style={styles.amount}>{credits.toLocaleString()}</Text>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creditsPillBg,
    borderRadius: radius.full,
    paddingLeft: spacing.sm,
    paddingRight: 0,
    height: 34,
    gap: spacing.xs,
  },
  coin: {
    marginRight: 2,
  },
  amount: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginRight: spacing.xs,
  },
  addBtn: {
    backgroundColor: colors.red,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: 20,
  },
});
