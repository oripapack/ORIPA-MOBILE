import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
}

/**
 * Coin balance chip — N2: balances are a GOLD value role (§4) in the data
 * face with tabular-nums. Surface fill + 1px line border (dividers are
 * lines, not shadows); tag radius. Gold never fills the add button.
 */
export function CreditsPill({ onAdd }: Props) {
  const credits = useAppStore((s) => s.user.credits);

  return (
    <View style={styles.pill}>
      <FontAwesome5 name="coins" size={13} color={sg.gold} style={styles.coin} solid />
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
