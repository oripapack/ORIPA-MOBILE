import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { spacing, elevation } from '../../tokens/spacing';
import { CreditsPill } from './CreditsPill';
import { APP_DISPLAY_NAME, getLogoInitials, getLogoWordmarkParts } from '../../config/app';
import { navigationRef } from '../../navigation/navigationRef';
import { useRequireAuth } from '../../hooks/useRequireAuth';

interface Props {
  onSearch?: () => void;
}

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
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(34,197,94,0.06)', 'transparent', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.row}>
        <View
          style={styles.logo}
          accessibilityRole="header"
          accessibilityLabel={APP_DISPLAY_NAME}
        >
          <LinearGradient
            colors={[colors.goldDark, colors.gold, '#4ADE80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.monogramRing}
          >
            <View style={styles.monogramInner}>
              <Text style={styles.monogramText} numberOfLines={1}>
                {initials}
              </Text>
            </View>
          </LinearGradient>
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
            <Ionicons name="search" size={20} color={colors.textPrimary} />
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
    borderBottomColor: colors.headerHairline,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,5,15,0.42)',
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
  },
  monogramInner: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  wordmarkCol: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  wordmarkLine: {
    fontSize: fontSize.lg,
    letterSpacing: -0.35,
  },
  wordmarkLead: {
    color: colors.textPrimary,
    fontFamily: brandFont.bold,
  },
  wordmarkAccent: {
    color: colors.gold,
    fontFamily: brandFont.black,
  },
  wordmarkSingle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: -0.35,
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
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
});
