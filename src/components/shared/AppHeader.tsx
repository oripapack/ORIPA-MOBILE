import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { spacing, elevation } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { APP_DISPLAY_NAME, getLogoInitials, getLogoWordmarkParts } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface Props {
  onSearch?: () => void;
}

/**
 * App chrome header — Urushi Archive: obsidian (sumi) translucent slab with a
 * satin top-edge grammar; brass only in the details (monogram ring, wordmark
 * accent). Logic (auth gate, PaymentPortal navigation) is unchanged.
 */
export function AppHeader({ onSearch }: Props) {
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const initials = getLogoInitials();
  const wordmark = getLogoWordmarkParts();

  const goCredits = () => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
      }
    });
  };

  return (
    <View style={[styles.shell, { paddingTop: insets.top + spacing.sm }, elevation.chromeBar]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 52 : 40}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scrim} pointerEvents="none" />

      <View style={styles.row}>
        <View
          style={styles.logo}
          accessibilityRole="header"
          accessibilityLabel={APP_DISPLAY_NAME}
        >
          {/* Brass monogram ring — obsidian core */}
          <View style={styles.monogramRing}>
            <View style={styles.monogramInner}>
              <Text style={styles.monogramText} numberOfLines={1}>
                {initials}
              </Text>
            </View>
          </View>
          <View style={styles.wordmarkCol}>
            {wordmark ? (
              <Text style={styles.wordmarkLine} numberOfLines={1}>
                <Text style={styles.wordmarkLead}>{wordmark.lead}</Text>
                <Text style={styles.wordmarkAccent}> {wordmark.accent}</Text>
              </Text>
            ) : (
              <Text style={styles.wordmarkSingle} numberOfLines={1}>
                {APP_DISPLAY_NAME}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.right}>
          <CreditsPill onAdd={goCredits} />
          <TouchableOpacity style={styles.iconBtn} onPress={onSearch} activeOpacity={0.75}>
            <Ionicons name="search" size={20} color={sg.showroom.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(232,229,222,0.08)',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,19,19,0.55)', // sumi1 tint over the blur
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  monogramRing: {
    borderRadius: 12,
    padding: 1.5,
    backgroundColor: sg.brass,
  },
  monogramInner: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: sg.sumi.s2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.showroom.text,
    letterSpacing: 0.5,
  },
  wordmarkCol: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  wordmarkLine: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  wordmarkLead: {
    color: sg.showroom.text,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkAccent: {
    color: sg.brass,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkSingle: {
    fontSize: 17,
    fontFamily: sg.font.bodyBold,
    color: sg.showroom.text,
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.sumi.s2,
  },
});
