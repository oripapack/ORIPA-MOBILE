import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Neutral empty/connection state for product surfaces whose service is not wired yet. */
export function ConnectionStatusCard({ eyebrow, title, body, icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={sg.gold} />
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.lg,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sg.space.lg,
  },
  eyebrow: {
    fontFamily: sg.font.dataBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: sg.gold,
    marginBottom: sg.space.sm,
  },
  title: {
    fontFamily: sg.font.display,
    fontSize: 24,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  body: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 20,
    color: sg.muted,
  },
});
