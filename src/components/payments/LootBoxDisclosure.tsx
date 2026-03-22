import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PACK_OPENING_TIER_ODDS } from '../../data/lootBoxOdds';
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
        <Text style={styles.lead}>{t('lootBox.lead')}</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          bounces={Platform.OS !== 'android'}
        >
          <Text style={styles.tableHead}>{t('lootBox.columnTier')}</Text>
          {PACK_OPENING_TIER_ODDS.map((row) => (
            <View key={row.tier} style={styles.row}>
              <Text style={styles.tier}>{row.tier}</Text>
              <Text style={styles.pct}>~{row.probabilityPct}%</Text>
            </View>
          ))}
          <Text style={styles.footnote}>{t('lootBox.footnote')}</Text>
        </ScrollView>

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
    backgroundColor: colors.white,
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
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  scroll: { maxHeight: 320 },
  scrollContent: { paddingBottom: spacing.sm },
  tableHead: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tier: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  pct: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  footnote: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  doneBtn: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    backgroundColor: colors.nearBlack,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  doneText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
