import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { ListRow } from '../components/shared/ListRow';
import { LegalDocumentModal } from '../components/legal/LegalDocumentModal';
import {
  TERMS_OF_SERVICE,
  PRIVACY_POLICY,
  PROMOTIONAL_RULES,
  PAYMENT_DISCLOSURES,
} from '../legal/inAppLegalCopy';
import { LanguageRegionModal } from '../components/account/LanguageRegionModal';
import { useLocalePreferences, LANGUAGE_OPTIONS } from '../hooks/useLocalePreferences';
import { APP_DISPLAY_NAME, APP_VERSION } from '../config/app';
import { RootStackParamList } from '../navigation/types';

type LegalSheet = 'terms' | 'privacy' | 'promo' | 'payment' | null;

const LEGAL_BODY: Record<'terms' | 'privacy' | 'promo' | 'payment', string> = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
  promo: PROMOTIONAL_RULES,
  payment: PAYMENT_DISCLOSURES,
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [legalSheet, setLegalSheet] = useState<LegalSheet>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const { language, region, saveLocale } = useLocalePreferences();

  const localeSummary = useMemo(() => {
    const langLabel = LANGUAGE_OPTIONS.find((l) => l.code === language)?.label ?? language;
    const regionLabel = t(`regions.${region}`);
    return `${langLabel} · ${regionLabel}`;
  }, [language, region, t]);

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>{t('account.sectionLegal')}</Text>
        <View style={styles.listGroup}>
          <ListRow
            label={t('legalRows.terms')}
            icon={<Text>📄</Text>}
            onPress={() => setLegalSheet('terms')}
          />
          <ListRow
            label={t('legalRows.privacy')}
            icon={<Text>🔒</Text>}
            onPress={() => setLegalSheet('privacy')}
          />
          <ListRow
            label={t('legalRows.promo')}
            icon={<Text>📣</Text>}
            onPress={() => setLegalSheet('promo')}
          />
          <ListRow
            label={t('legalRows.payment')}
            icon={<Text>💳</Text>}
            onPress={() => setLegalSheet('payment')}
          />
        </View>

        <Text style={styles.sectionHeader}>{t('account.sectionPreferences')}</Text>
        <View style={styles.listGroup}>
          <ListRow
            label={t('account.languageRegion')}
            icon={<Text>🌐</Text>}
            rightContent={<Text style={styles.localeValue}>{localeSummary}</Text>}
            onPress={() => setLocaleOpen(true)}
          />
        </View>

        <Text style={styles.version}>{t('account.version', { name: APP_DISPLAY_NAME, version: APP_VERSION })}</Text>
      </ScrollView>

      {legalSheet !== null && (
        <LegalDocumentModal
          visible
          title={t(`legalRows.${legalSheet}`)}
          body={LEGAL_BODY[legalSheet]}
          onClose={() => setLegalSheet(null)}
        />
      )}

      <LanguageRegionModal
        visible={localeOpen}
        onClose={() => setLocaleOpen(false)}
        language={language}
        region={region}
        onApply={(l, r) => void saveLocale(l, r)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  listGroup: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  localeValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    maxWidth: 160,
    textAlign: 'right',
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
