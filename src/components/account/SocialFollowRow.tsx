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
  { id: 'x', label: 'X', icon: 'twitter', color: '#000000' },
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
          activeOpacity={0.7}
          onPress={() => void open(item.id)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${item.label}`}
        >
          <FontAwesome5 name={item.icon} size={26} color={item.color} brand />
          <Text style={styles.socialLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialBtn: {
    width: '48%',
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
