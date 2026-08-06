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
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
          <Text style={styles.title}>{t('locale.title')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>{t('locale.cancel')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>{t('locale.language')}</Text>
          <Text style={styles.sectionHint}>{t('locale.fallbackNote')}</Text>
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
                {draftLang === opt.code ? <Ionicons name="checkmark" size={20} color={sg.gold} /> : null}
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
                {draftRegion === opt.code ? <Ionicons name="checkmark" size={20} color={sg.gold} /> : null}
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
    backgroundColor: sg.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    backgroundColor: sg.surface,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  cancel: {
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  group: {
    backgroundColor: sg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
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
    borderBottomColor: sg.line,
  },
  rowSelected: {
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  rowLabel: {
    fontSize: fontSize.base,
    color: sg.text,
    fontFamily: sg.font.bodyMedium,
  },
  rowLabelSelected: {
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  doneBtn: {
    marginHorizontal: spacing.base,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    color: sg.onGold,
    fontSize: fontSize.base,
    fontFamily: sg.font.bodyBold,
  },
});
