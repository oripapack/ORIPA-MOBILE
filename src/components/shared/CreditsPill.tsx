import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { sg } from '../../tokens/sg';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onAdd: () => void;
}

/**
 * Coin balance chip — Urushi Archive: obsidian pill (status chip → pill
 * allowed), brass coin glyph (detail role), mono amount (coin counts are
 * data-face by rule). The add action is a quiet raised circle — brass is
 * never a button color.
 */
export function CreditsPill({ onAdd }: Props) {
  const credits = useAppStore((s) => s.user.credits);

  return (
    <View style={styles.pill}>
      <FontAwesome5 name="coins" size={13} color={sg.brass} style={styles.coin} solid />
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
    backgroundColor: sg.sumi.s2,
    borderRadius: radius.full,
    paddingLeft: spacing.sm,
    paddingRight: 0,
    height: 34,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  coin: {
    marginRight: 2,
  },
  amount: {
    color: sg.showroom.text,
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    marginRight: spacing.xs,
  },
  addBtn: {
    backgroundColor: sg.sumi.s3,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: sg.showroom.text,
    fontSize: 16,
    fontFamily: sg.font.bodyBold,
    lineHeight: 20,
  },
});
