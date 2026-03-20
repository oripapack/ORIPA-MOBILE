import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

interface Props {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
}

export function ListRow({ label, onPress, icon, rightContent, showChevron = true, destructive }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.right}>
        {rightContent}
        {showChevron && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 52,
  },
  icon: {
    marginRight: spacing.md,
    width: 22,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
  },
  destructive: {
    color: colors.red,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
