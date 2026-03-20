import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { useAppStore } from '../../store/useAppStore';

export function InsufficientCreditsModal() {
  const visible = useAppStore((s) => s.modals.insufficientCredits);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);
  const userCredits = useAppStore((s) => s.user.credits);

  const needed = selectedPack ? selectedPack.creditPrice - userCredits : 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={() => closeModal('insufficientCredits')}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🪙</Text>
          </View>

          <Text style={styles.title}>Not Enough Credits</Text>
          <Text style={styles.body}>
            You need{' '}
            <Text style={styles.highlight}>{needed.toLocaleString()} more credits</Text>{' '}
            to open this pack. Add credits now to continue.
          </Text>

          {selectedPack && (
            <View style={styles.packInfo}>
              <Text style={styles.packInfoLabel}>Pack</Text>
              <Text style={styles.packInfoValue}>{selectedPack.title}</Text>
              <Text style={styles.packInfoLabel}>Cost</Text>
              <Text style={styles.packInfoValue}>🪙 {selectedPack.creditPrice.toLocaleString()} Credits</Text>
              <Text style={styles.packInfoLabel}>Your Balance</Text>
              <Text style={styles.packInfoValue}>🪙 {userCredits.toLocaleString()} Credits</Text>
            </View>
          )}

          <PrimaryButton
            label="Buy Credits"
            variant="red"
            style={styles.primaryBtn}
            onPress={() => {
              closeModal('insufficientCredits');
              openModal('buyCredits');
            }}
          />
          <SecondaryButton
            label="Cancel"
            onPress={() => closeModal('insufficientCredits')}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.base,
  },
  highlight: {
    color: colors.red,
    fontWeight: fontWeight.bold,
  },
  packInfo: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  packInfoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packInfoValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  primaryBtn: {
    marginBottom: spacing.sm,
  },
});
