import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';

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
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
    >
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
    paddingVertical: sg.space.md + 2,
    paddingHorizontal: sg.space.md,
    backgroundColor: sg.surface,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    minHeight: 52,
  },
  icon: {
    marginRight: sg.space.md,
    width: 22,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: sg.font.body,
    color: sg.text,
  },
  destructive: {
    color: sg.error,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.xs,
  },
  chevron: {
    fontSize: 20,
    color: sg.muted,
    marginLeft: sg.space.xs,
  },
});
