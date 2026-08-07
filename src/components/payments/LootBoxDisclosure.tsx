import React from 'react';
import { sg } from '../../tokens/sg';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Non-blocking disclosure modal for randomized digital outcomes (pack openings).
 * Import from `src/components/payments/LootBoxDisclosure` wherever purchase or credit flows touch random rewards.
 */
export function LootBoxDisclosure({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      {...transparentModalIOSProps}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>{t('lootBox.title')}</Text>
        <Text style={styles.lead}>{t('packDetails.liveUnavailableBody')}</Text>

        <View style={styles.statusPanel} accessibilityRole="summary">
          <Text style={styles.statusCode}>LIVE ODDS / STATUS</Text>
          <Text style={styles.statusTitle}>{t('packDetails.liveUnavailableTitle')}</Text>
          <Text style={styles.statusBody}>{t('packDetails.liveUnavailableShort')}</Text>
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.88}>
          <Text style={styles.doneText}>{t('lootBox.done')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '18%',
    maxHeight: '72%',
    backgroundColor: sg.surface2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  statusPanel: {
    minHeight: 136,
    padding: sg.space.md,
    justifyContent: 'space-between',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
  },
  statusCode: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.chrome,
  },
  statusTitle: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    color: sg.text,
  },
  statusBody: {
    fontFamily: sg.font.body,
    fontSize: sg.type.body.fontSize,
    lineHeight: sg.type.body.lineHeight,
    color: sg.warning,
  },
  doneBtn: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    backgroundColor: sg.surface2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneText: {
    color: sg.text,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
  },
});
