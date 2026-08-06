import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ActivityHighlight } from '../../data/socialMock';

const ACTIVITY_ICONS = ['trophy-outline', 'cube-outline', 'sparkles-outline'] as const;

export function ActivityStrip({ items }: { items: ActivityHighlight[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {items.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <Ionicons name={ACTIVITY_ICONS[index % ACTIVITY_ICONS.length]} size={20} color={sg.muted} />
          <Text style={styles.text} numberOfLines={2}>
            {item.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: sg.space.sm, paddingVertical: 2 },
  card: {
    width: 220,
    padding: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
    flexDirection: 'row',
    gap: sg.space.sm,
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    fontSize: 11,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 17,
  },
});
