import React from 'react';
import { sg } from '../../tokens/sg';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { MOCK_PACK_OPENING_TIER_ODDS } from '../../data/lootBoxOdds';
import { SgButton } from '../ui';
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
          {MOCK_PACK_OPENING_TIER_ODDS.map((row) => (
            <View key={row.tier} style={styles.row}>
              <Text style={styles.tier}>{row.tier}</Text>
              <Text style={styles.pct}>~{row.probabilityPct}%</Text>
            </View>
          ))}
          <Text style={styles.footnote}>{t('lootBox.footnote')}</Text>
        </ScrollView>

        <SgButton label={t('lootBox.done')} onPress={onClose} />
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
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
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
  scroll: { maxHeight: 320 },
  scrollContent: { paddingBottom: spacing.sm },
  tableHead: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  tier: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    letterSpacing: 0.8,
  },
  pct: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  footnote: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
  },
});
