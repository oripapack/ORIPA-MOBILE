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
 * App chrome header — N2 "Neon Torii": translucent night slab (functional
 * chrome per §9). Gold budget is deliberately scarce here: wordmark accent +
 * balance number only (§4 — gold stops signalling value when it multiplies).
 * Logic (auth gate, PaymentPortal navigation) is unchanged.
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
          {/* Monogram ring — line, not gold: the header gold budget is the wordmark accent + balance */}
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
            <Ionicons name="search" size={20} color={sg.text} />
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
    borderBottomColor: sg.line,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)', // §9 functional-chrome translucency
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
    backgroundColor: sg.line, // gold budget: wordmark accent + balance only
  },
  monogramInner: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
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
    color: sg.text,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkAccent: {
    color: sg.gold,
    fontFamily: sg.font.bodyBold,
  },
  wordmarkSingle: {
    fontSize: 17,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
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
    borderRadius: sg.radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface,
  },
});
