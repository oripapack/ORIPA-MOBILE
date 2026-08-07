import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { useTranslation } from 'react-i18next';
import { TerminalBackdrop } from '../terminal/TerminalBackdrop';
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingTop: insets.top + sg.space.sm, paddingBottom: insets.bottom + sg.space.md }]}>
        <TerminalBackdrop />
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="globe-outline" size={19} color={sg.goldHi} />
            </View>
            <View>
              <Text style={styles.headerKicker}>TOKYO TERMINAL / REGION</Text>
              <Text style={styles.title}>{t('locale.title')}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={12}
            style={styles.cancelBtn}
            accessibilityRole="button"
            accessibilityLabel={t('locale.cancel')}
          >
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
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{
                  checked: draftLang === opt.code,
                  selected: draftLang === opt.code,
                }}
                aria-checked={draftLang === opt.code}
              >
                <Text style={[styles.rowLabel, draftLang === opt.code && styles.rowLabelSelected]}>
                  {opt.label}
                </Text>
                {draftLang === opt.code ? (
                  <Ionicons name="checkmark" size={18} color={sg.goldHi} />
                ) : null}
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
                accessibilityRole="radio"
                accessibilityLabel={t(`regions.${opt.code}`)}
                accessibilityState={{
                  checked: draftRegion === opt.code,
                  selected: draftRegion === opt.code,
                }}
                aria-checked={draftRegion === opt.code}
              >
                <Text style={[styles.rowLabel, draftRegion === opt.code && styles.rowLabelSelected]}>
                  {t(`regions.${opt.code}`)}
                </Text>
                {draftRegion === opt.code ? (
                  <Ionicons name="checkmark" size={18} color={sg.goldHi} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={apply}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('locale.save')}
        >
          <Text style={styles.doneText}>{t('locale.save')}</Text>
          <Ionicons name="arrow-forward" size={18} color={sg.onValue} />
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
    gap: sg.space.sm,
    minHeight: 68,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    backgroundColor: sg.surface,
  },
  headerTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.cobaltWash,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  headerKicker: {
    fontFamily: sg.font.label,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: sg.muted,
  },
  title: {
    marginTop: 1,
    fontSize: 19,
    lineHeight: 22,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  cancelBtn: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    backgroundColor: sg.surface2,
  },
  cancel: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  scroll: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: sg.space.md,
    paddingBottom: sg.space.xl,
  },
  sectionLabel: {
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    fontFamily: sg.font.label,
    color: sg.muted,
    letterSpacing: sg.type.label.letterSpacing,
    textTransform: 'uppercase',
    marginBottom: sg.space.sm,
    marginTop: sg.space.sm,
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: sg.space.sm,
    lineHeight: 18,
  },
  group: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    overflow: 'hidden',
    marginBottom: sg.space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: sg.space.md,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  rowSelected: {
    backgroundColor: sg.cobaltWashStrong,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
    paddingLeft: sg.space.md - 3,
  },
  rowLabel: {
    fontSize: 15,
    color: sg.text,
    fontFamily: sg.font.bodyMedium,
  },
  rowLabelSelected: {
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  doneBtn: {
    width: 'auto',
    maxWidth: 688,
    alignSelf: 'stretch',
    marginHorizontal: sg.space.md,
    minHeight: sg.component.buttonPrimary.height,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.value,
    borderWidth: 1,
    borderColor: sg.valueHi,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sg.space.sm,
  },
  doneText: {
    color: sg.onValue,
    fontSize: 15,
    fontFamily: sg.font.bodyBold,
  },
});
