import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { creditBundles } from '../data/mockPacks';
import { useAppStore } from '../store/useAppStore';

export function BuyCreditsModal() {
  const visible = useAppStore((s) => s.modals.buyCredits);
  const closeModal = useAppStore((s) => s.closeModal);
  const addCredits = useAppStore((s) => s.addCredits);
  const insets = useSafeAreaInsets();

  const handlePurchase = (credits: number) => {
    addCredits(credits);
    closeModal('buyCredits');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={() => closeModal('buyCredits')}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Buy Credits</Text>
          <Text style={styles.subtitle}>Credits are used to open packs. Choose a bundle below.</Text>

          {creditBundles.map((bundle) => (
            <TouchableOpacity
              key={bundle.id}
              style={styles.bundleCard}
              onPress={() => handlePurchase(bundle.credits)}
              activeOpacity={0.85}
            >
              <View style={styles.bundleLeft}>
                <Text style={styles.coin}>🪙</Text>
                <View>
                  <Text style={styles.bundleLabel}>{bundle.label}</Text>
                  {bundle.bonus && (
                    <Text style={styles.bundleBonus}>{bundle.bonus}</Text>
                  )}
                </View>
              </View>
              <View style={styles.bundleRight}>
                <Text style={styles.bundlePrice}>{bundle.price}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.trustRow}>
            <Text style={styles.trustText}>🔒 Secure checkout  ·  Instant delivery  ·  No expiry</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  bundleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bundleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  coin: {
    fontSize: 28,
  },
  bundleLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  bundleBonus: {
    fontSize: fontSize.xs,
    color: colors.green,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  bundleRight: {
    alignItems: 'flex-end',
  },
  bundlePrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
  },
  trustRow: {
    alignItems: 'center',
    marginTop: spacing.base,
  },
  trustText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
