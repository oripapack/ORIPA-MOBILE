import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { SOCIAL_URLS } from '../../config/social';

type SocialId = keyof typeof SOCIAL_URLS;

const SOCIAL_CONFIG: {
  id: SocialId;
  label: string;
  icon: 'instagram' | 'twitter' | 'youtube' | 'discord';
  color: string;
}[] = [
  { id: 'instagram', label: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { id: 'x', label: 'X', icon: 'twitter', color: '#F8FAFC' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { id: 'discord', label: 'Discord', icon: 'discord', color: '#5865F2' },
];

export function SocialFollowRow() {
  const open = async (id: SocialId) => {
    const url = SOCIAL_URLS[id];
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Unable to open link', 'Update the URL in `src/config/social.ts`.');
    } catch {
      Alert.alert('Error', 'Could not open link.');
    }
  };

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
          <View style={[styles.iconBubble, { borderColor: `${item.color}55` }]}>
            <FontAwesome5 name={item.icon} size={22} color={item.color} brand />
          </View>
          <Text style={styles.socialLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.nearBlack,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  socialLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(248,250,252,0.88)',
    letterSpacing: 0.2,
  },
});
