import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
}

/**
 * Points balance rendered as a compact ticket-machine readout.
 */
export function CreditsPill({ onAdd }: Props) {
  const credits = useAppStore((s) => s.user.credits);

  return (
    <View style={styles.pill}>
      <Text style={styles.pointsLabel}>PTS</Text>
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
  pointsLabel: { color: sg.muted, fontSize: 8, fontFamily: sg.font.label, letterSpacing: 0.8 },
  amount: {
    color: sg.gold,
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    marginRight: spacing.xs,
  },
  addBtn: {
    backgroundColor: sg.gold,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: sg.onGold,
    fontSize: 16,
    fontFamily: sg.font.bodyBold,
    lineHeight: 20,
  },
});
