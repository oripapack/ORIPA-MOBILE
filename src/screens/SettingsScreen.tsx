import React, { useMemo, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SgScreen } from '../components/ui';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { screenRoot, screenScroll, screenHeader } from '../tokens/layout';
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
import {
  ADVANCED_ACCOUNT_SERVICES_ARE_LIVE,
  APP_DISPLAY_NAME,
  APP_VERSION,
  SHIPPING_IS_LIVE,
  SUPPORT_EMAIL,
  SUPPORT_IS_LIVE,
} from '../config/app';
import { RootStackParamList } from '../navigation/types';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { openExternalUrl } from '../utils/openExternalUrl';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { isClerkEnabled } from '../config/clerk';
import { AccountSignOutFooter } from '../components/account/AccountSignOutFooter';
import { DeleteAccountSection } from '../components/account/DeleteAccountSection';
import { ClerkAccountSection } from '../components/account/ClerkAccountSection';
import { AdminToolsSection } from '../components/account/AdminToolsSection';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { resetLocalOnboardingStateAndReload } from '../lib/resetLocalOnboardingState';
import { confirmUserAction } from '../utils/showUserMessage';
import { PRIVACY_POLICY_URL } from '../config/legal';

type LegalSheet = 'terms' | 'privacy' | 'promo' | 'payment' | null;

const LEGAL_BODY: Record<'terms' | 'privacy' | 'promo' | 'payment', string> = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
  promo: PROMOTIONAL_RULES,
  payment: PAYMENT_DISCLOSURES,
};

const ROW_ICON_SIZE = 22;

const ALL_ACCOUNT_ROW_KEYS = [
  'creditHistory',
  'wallet',
  'shipping',
  'shippingOrders',
  'payout',
  'identity',
  'linked',
] as const;
type AccountRowKey = (typeof ALL_ACCOUNT_ROW_KEYS)[number];
const accountIcons: Record<AccountRowKey, keyof typeof Ionicons.glyphMap> = {
  creditHistory: 'list-outline',
  wallet: 'diamond-outline',
  shipping: 'cube-outline',
  shippingOrders: 'receipt-outline',
  payout: 'wallet-outline',
  identity: 'person-circle-outline',
  linked: 'link-outline',
};

const ALL_SUPPORT_ROW_KEYS = ['help', 'contact'] as const;
type SupportRowKey = (typeof ALL_SUPPORT_ROW_KEYS)[number];
const supportIcons: Record<SupportRowKey, keyof typeof Ionicons.glyphMap> = {
  help: 'help-circle-outline',
  contact: 'mail-outline',
};

export function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [legalSheet, setLegalSheet] = useState<LegalSheet>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const { language, region, saveLocale } = useLocalePreferences();
  const { requireAuth } = useRequireAuth();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const accountRowKeys: AccountRowKey[] = [
    'creditHistory',
    ...(SHIPPING_IS_LIVE ? (['shipping', 'shippingOrders'] as const) : []),
    ...(ADVANCED_ACCOUNT_SERVICES_ARE_LIVE
      ? (['wallet', 'payout', 'identity', 'linked'] as const)
      : []),
  ];
  const supportRowKeys: SupportRowKey[] = SUPPORT_IS_LIVE ? ['help', 'contact'] : ['help'];

  const localeSummary = useMemo(() => {
    const langLabel = LANGUAGE_OPTIONS.find((l) => l.code === language)?.label ?? language;
    const regionLabel = t(`regions.${region}`);
    return `${langLabel} · ${regionLabel}`;
  }, [language, region, t]);

  const onAccountRow = (key: AccountRowKey) => {
    requireAuth(() => {
      if (key === 'creditHistory') navigation.navigate('CreditHistory');
      if (key === 'wallet') navigation.navigate('WalletLinking');
      if (key === 'shipping') navigation.navigate('ShippingAddress');
      if (key === 'shippingOrders') navigation.navigate('ShippingOrders');
      if (key === 'payout') navigation.navigate('PayoutMethod');
      if (key === 'identity') navigation.navigate('IdentityVerification');
      if (key === 'linked') navigation.navigate('LinkedAccounts');
    });
  };

  const onSupportRow = (key: SupportRowKey) => {
    if (key === 'help') {
      navigation.navigate('HelpCenter');
      return;
    }
    void openExternalUrl(`mailto:${SUPPORT_EMAIL}`, t('supportRows.contact'));
  };

  return (
    <SgScreen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('packDetails.back')}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ClerkAccountSection />

        {accountRowKeys.length > 0 ? (
          <>
            <Text style={styles.sectionHeader}>{t('settings.sectionWallet')}</Text>
            <VaultFramedCard style={styles.listGroupWrap} contentStyle={styles.listGroupInner}>
              {accountRowKeys.map((key) => (
                <ListRow
                  key={key}
                  label={t(`accountRows.${key}`)}
                  icon={
                    <Ionicons name={accountIcons[key]} size={ROW_ICON_SIZE} color={sg.muted} />
                  }
                  onPress={() => onAccountRow(key)}
                />
              ))}
            </VaultFramedCard>
          </>
        ) : null}

        <Text style={styles.sectionHeader}>{t('account.sectionSupport')}</Text>
        <VaultFramedCard style={styles.listGroupWrap} contentStyle={styles.listGroupInner}>
          {supportRowKeys.map((key) => (
            <ListRow
              key={key}
              label={t(`supportRows.${key}`)}
              icon={
                <Ionicons name={supportIcons[key]} size={ROW_ICON_SIZE} color={sg.muted} />
              }
              onPress={() => onSupportRow(key)}
            />
          ))}
        </VaultFramedCard>

        <Text style={styles.sectionHeader}>{t('account.sectionLegal')}</Text>
        <VaultFramedCard style={styles.listGroupWrap} contentStyle={styles.listGroupInner}>
          <ListRow
            label={t('legalRows.terms')}
            icon={<Ionicons name="document-text-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            onPress={() => setLegalSheet('terms')}
          />
          <ListRow
            label={t('legalRows.privacy')}
            icon={<Ionicons name="lock-closed-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            onPress={() => setLegalSheet('privacy')}
          />
          <ListRow
            label={t('legalRows.promo')}
            icon={<Ionicons name="megaphone-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            onPress={() => setLegalSheet('promo')}
          />
          <ListRow
            label={t('legalRows.payment')}
            icon={<Ionicons name="card-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            onPress={() => setLegalSheet('payment')}
          />
        </VaultFramedCard>

        <Text style={styles.sectionHeader}>{t('account.sectionPreferences')}</Text>
        <VaultFramedCard style={styles.listGroupWrap} contentStyle={styles.listGroupInner}>
          <ListRow
            label={t('account.languageRegion')}
            icon={<Ionicons name="globe-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            rightContent={<Text style={styles.localeValue}>{localeSummary}</Text>}
            onPress={() => setLocaleOpen(true)}
          />
        </VaultFramedCard>

        <AdminToolsSection />

        {__DEV__ ? (
          <>
            <Text style={styles.sectionHeader}>{t('settings.devSection')}</Text>
            <VaultFramedCard style={styles.listGroupWrap} contentStyle={styles.listGroupInner}>
              <ListRow
                label={t('settings.devResetLocalOnboarding')}
                icon={<Ionicons name="refresh-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
                onPress={() => {
                  confirmUserAction({
                    title: t('settings.devResetAlertTitle'),
                    message: t('settings.devResetAlertBody'),
                    cancelLabel: t('common.cancel'),
                    confirmLabel: t('settings.devResetConfirm'),
                    destructive: true,
                    onConfirm: () => void resetLocalOnboardingStateAndReload(),
                  });
                }}
              />
            </VaultFramedCard>
          </>
        ) : null}

        <Text style={styles.version}>{t('account.version', { name: APP_DISPLAY_NAME, version: APP_VERSION })}</Text>
        <AccountSignOutFooter visible={isClerkEnabled && clerkSignedIn} />
        {isClerkEnabled && clerkSignedIn ? <DeleteAccountSection /> : null}
      </ScrollView>

      {legalSheet !== null && (
        <LegalDocumentModal
          visible
          title={t(`legalRows.${legalSheet}`)}
          body={LEGAL_BODY[legalSheet]}
          externalUrl={legalSheet === 'privacy' ? PRIVACY_POLICY_URL || undefined : undefined}
          externalLabel={legalSheet === 'privacy' ? t('legalModal.openPublicPolicy') : undefined}
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
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    ...screenRoot,
  },
  header: {
    ...screenHeader,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: sg.bg,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 32,
    color: sg.text,
    marginTop: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    ...screenScroll,
    backgroundColor: sg.bg,
  },
  content: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  listGroupWrap: {
    marginBottom: spacing.xs,
  },
  listGroupInner: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 11,
  },
  localeValue: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    maxWidth: 160,
    textAlign: 'right',
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: sg.muted,
    marginTop: spacing.xl,
  },
});
