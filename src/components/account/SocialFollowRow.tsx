import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { SOCIAL_URLS } from '../../config/social';
import { openExternalUrl } from '../../utils/openExternalUrl';

type SocialId = keyof typeof SOCIAL_URLS;

const SOCIAL_CONFIG: {
  id: SocialId;
  label: string;
  icon: 'instagram' | 'twitter' | 'youtube' | 'discord';
}[] = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'x', label: 'X', icon: 'twitter' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'discord', label: 'Discord', icon: 'discord' },
];

type Props = {
  /** Slim icon row for footers — avoids a second “card” of big blocks. */
  compact?: boolean;
};

export function SocialFollowRow({ compact = false }: Props) {
  const open = async (id: SocialId) => {
    await openExternalUrl(SOCIAL_URLS[id], SOCIAL_CONFIG.find((item) => item.id === id)?.label);
  };

  if (compact) {
    return (
      <View style={styles.compactRow}>
        {SOCIAL_CONFIG.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.compactBtn}
            activeOpacity={0.82}
            onPress={() => void open(item.id)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${item.label}`}
          >
            <FontAwesome5 name={item.icon} size={18} color={sg.accentText} brand />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.socialRow}>
      {SOCIAL_CONFIG.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.socialBtn}
          activeOpacity={0.82}
          onPress={() => void open(item.id)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${item.label}`}
        >
          <View style={styles.iconBubble}>
            <FontAwesome5 name={item.icon} size={20} color={sg.accentText} brand />
          </View>
          <Text style={styles.socialLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  compactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.lineStrong,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  socialBtn: {
    width: '48%',
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: sg.line,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: sg.cobaltWash,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  socialLabel: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.text,
    letterSpacing: 0.2,
  },
});
