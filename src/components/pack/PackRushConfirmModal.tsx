import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  visible: boolean;
  packCount: number;
  totalCredits: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PackRushConfirmModal({ visible, packCount, totalCredits, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const totalStr = totalCredits.toLocaleString();

  return (
    <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.kicker}>{t('packDetails.multiOpen.rushModalKicker')}</Text>
          <Text style={styles.title}>{t('packDetails.multiOpen.rushModalTitle')}</Text>
          <Text style={styles.body}>
            {t('packDetails.multiOpen.rushModalBody', { count: packCount, total: totalStr })}
          </Text>
          <Text style={styles.disclosure}>{t('packDetails.multiOpen.rushModalDisclosure', { total: totalStr })}</Text>

          <TouchableOpacity style={styles.primary} activeOpacity={0.9} onPress={onConfirm}>
            <Text style={styles.primaryLabel}>{t('packDetails.multiOpen.rushModalConfirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} activeOpacity={0.85} onPress={onCancel}>
            <Text style={styles.secondaryLabel}>{t('packDetails.multiOpen.rushModalCancel')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: sg.space.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    padding: sg.space.xl,
  },
  kicker: {
    alignSelf: 'center',
    marginBottom: sg.space.sm,
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.accentText,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    textAlign: 'center',
    marginBottom: sg.space.sm,
  },
  body: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: sg.space.sm,
  },
  disclosure: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    textAlign: 'center',
    marginBottom: sg.space.lg,
  },
  primary: {
    height: 50,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sg.space.sm,
  },
  primaryLabel: {
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
  secondary: {
    paddingVertical: sg.space.sm,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
  },
});
