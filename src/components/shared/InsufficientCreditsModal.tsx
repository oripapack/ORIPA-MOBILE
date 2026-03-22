import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { useAppStore } from '../../store/useAppStore';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { navigationRef } from '../../navigation/navigationRef';

export function InsufficientCreditsModal() {
  const { t } = useTranslation();
  const visible = useAppStore((s) => s.modals.insufficientCredits);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const closeModal = useAppStore((s) => s.closeModal);
  const userCredits = useAppStore((s) => s.user.credits);

  const needed = selectedPack ? selectedPack.creditPrice - userCredits : 0;
  const packLoc = selectedPack ? getLocalizedPackFields(selectedPack, t) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
      <Pressable style={styles.overlay} onPress={() => closeModal('insufficientCredits')}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="wallet" size={32} color="#EA580C" />
          </View>

          <Text style={styles.title}>{t('insufficientCredits.title')}</Text>
          <Text style={styles.body}>
            {t('insufficientCredits.bodyWithAmount', { needed: needed.toLocaleString() })}
          </Text>

          {selectedPack && (
            <View style={styles.packInfo}>
              <Text style={styles.packInfoLabel}>{t('insufficientCredits.packLabel')}</Text>
              <Text style={styles.packInfoValue}>{packLoc?.title ?? selectedPack.title}</Text>
              <Text style={styles.packInfoLabel}>{t('insufficientCredits.costLabel')}</Text>
              <Text style={styles.packInfoValue}>
                {t('insufficientCredits.creditsLine', {
                  amount: selectedPack.creditPrice.toLocaleString(),
                })}
              </Text>
              <Text style={styles.packInfoLabel}>{t('insufficientCredits.balanceLabel')}</Text>
              <Text style={styles.packInfoValue}>
                {t('insufficientCredits.creditsLine', { amount: userCredits.toLocaleString() })}
              </Text>
            </View>
          )}

          <PrimaryButton
            label={t('insufficientCredits.buyCredits')}
            variant="red"
            style={styles.primaryBtn}
            onPress={() => {
              closeModal('insufficientCredits');
              if (navigationRef.isReady()) {
                navigationRef.navigate('PaymentPortal', { initialTab: 'credits' });
              }
            }}
          />
          <SecondaryButton
            label={t('insufficientCredits.cancel')}
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
