import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';

type Props = {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon?: React.ReactNode;
};

/** Settings preference row with a Switch (no navigation chevron). */
export function PreferenceSwitchRow({
  label,
  subtitle,
  value,
  onValueChange,
  icon,
}: Props) {
  return (
    <View style={styles.row}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: sg.line, true: sg.gold }}
        thumbColor={sg.text}
        accessibilityLabel={label}
      />
    </View>
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
    gap: sg.space.sm,
  },
  icon: {
    width: 22,
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 16,
    fontFamily: sg.font.body,
    color: sg.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 16,
  },
});
