import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_OPTIONS,
  REGION_OPTIONS,
  type LanguageCode,
  type RegionCode,
} from '../../hooks/useLocalePreferences';

interface Props {
  visible: boolean;
  onClose: () => void;
  language: LanguageCode;
  region: RegionCode;
  onApply: (language: LanguageCode, region: RegionCode) => void;
}

export function LanguageRegionModal({
  visible,
  onClose,
  language,
  region,
  onApply,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [draftLang, setDraftLang] = useState(language);
  const [draftRegion, setDraftRegion] = useState(region);

  useEffect(() => {
    if (visible) {
      setDraftLang(language);
      setDraftRegion(region);
    }
  }, [visible, language, region]);

  const apply = () => {
    onApply(draftLang, draftRegion);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.base }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Language & Region</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Language</Text>
          <View style={styles.group}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[styles.row, draftLang === opt.code && styles.rowSelected]}
                onPress={() => setDraftLang(opt.code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rowLabel, draftLang === opt.code && styles.rowLabelSelected]}>
                  {opt.label}
                </Text>
                {draftLang === opt.code ? <Text style={styles.check}>✓</Text> : null}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{t('locale.region')}</Text>
          <Text style={styles.sectionHint}>{t('locale.regionHint')}</Text>
          <View style={styles.group}>
            {REGION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[styles.row, draftRegion === opt.code && styles.rowSelected]}
                onPress={() => setDraftRegion(opt.code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rowLabel, draftRegion === opt.code && styles.rowLabelSelected]}>
                  {t(`regions.${opt.code}`)}
                </Text>
                {draftRegion === opt.code ? <Text style={styles.check}>✓</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneBtn} onPress={apply} activeOpacity={0.85}>
          <Text style={styles.doneText}>{t('locale.save')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  cancel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  group: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowSelected: {
    backgroundColor: '#FFF1F2',
  },
  rowLabel: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  rowLabelSelected: {
    fontWeight: fontWeight.bold,
    color: colors.redDark,
  },
  check: {
    fontSize: fontSize.lg,
    color: colors.red,
    fontWeight: fontWeight.bold,
  },
  doneBtn: {
    marginHorizontal: spacing.base,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
