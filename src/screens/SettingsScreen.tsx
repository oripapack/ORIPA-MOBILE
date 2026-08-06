import React, { useMemo, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SgScreen } from '../components/ui';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import { APP_DISPLAY_NAME, APP_VERSION, SUPPORT_EMAIL } from '../config/app';
import { RootStackParamList } from '../navigation/types';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { openExternalUrl } from '../utils/openExternalUrl';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { isClerkEnabled } from '../config/clerk';
import { AccountSignOutFooter } from '../components/account/AccountSignOutFooter';
import { ClerkAccountSection } from '../components/account/ClerkAccountSection';
import { AdminToolsSection } from '../components/account/AdminToolsSection';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { resetLocalOnboardingStateAndReload } from '../lib/resetLocalOnboardingState';
import { confirmUserAction } from '../utils/showUserMessage';

type LegalSheet = 'terms' | 'privacy' | 'promo' | 'payment' | null;

const LEGAL_BODY: Record<'terms' | 'privacy' | 'promo' | 'payment', string> = {
  terms: TERMS_OF_SERVICE,
  privacy: PRIVACY_POLICY,
  promo: PROMOTIONAL_RULES,
  payment: PAYMENT_DISCLOSURES,
};

const ROW_ICON_SIZE = 22;

const accountRowKeys = ['wallet', 'shipping', 'payout', 'identity', 'linked'] as const;
const accountIcons: Record<(typeof accountRowKeys)[number], keyof typeof Ionicons.glyphMap> = {
  wallet: 'diamond-outline',
  shipping: 'cube-outline',
  payout: 'wallet-outline',
  identity: 'person-circle-outline',
  linked: 'link-outline',
};

const supportRowKeys = ['help', 'contact', 'faq'] as const;
const supportIcons: Record<(typeof supportRowKeys)[number], keyof typeof Ionicons.glyphMap> = {
  help: 'help-circle-outline',
  contact: 'mail-outline',
  faq: 'book-outline',
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

  const localeSummary = useMemo(() => {
    const langLabel = LANGUAGE_OPTIONS.find((l) => l.code === language)?.label ?? language;
    const regionLabel = t(`regions.${region}`);
    return `${langLabel} · ${regionLabel}`;
  }, [language, region, t]);

  const onAccountRow = (key: (typeof accountRowKeys)[number]) => {
    requireAuth(() => {
      if (key === 'wallet') navigation.navigate('WalletLinking');
      if (key === 'shipping') navigation.navigate('ShippingAddress');
      if (key === 'payout') navigation.navigate('PayoutMethod');
      if (key === 'identity') navigation.navigate('IdentityVerification');
      if (key === 'linked') navigation.navigate('LinkedAccounts');
    });
  };

  const onSupportRow = (key: (typeof supportRowKeys)[number]) => {
    if (key === 'help' || key === 'faq') {
      navigation.navigate('HelpCenter');
      return;
    }
    void openExternalUrl(`mailto:${SUPPORT_EMAIL}`, t('supportRows.contact'));
  };

  return (
    <SgScreen>
      <View style={[styles.header, { paddingTop: insets.top + sg.space.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ClerkAccountSection />

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
            label={t('notifications.navTitle')}
            icon={<Ionicons name="notifications-outline" size={ROW_ICON_SIZE} color={sg.muted} />}
            onPress={() => navigation.navigate('Notifications')}
          />
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
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.sm,
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
    fontSize: sg.type.lg,
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
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
  },
  sectionHeader: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: sg.space.lg,
    marginBottom: sg.space.xs,
    paddingLeft: sg.space.xs,
  },
  listGroupWrap: {
    marginBottom: sg.space.xs,
  },
  listGroupInner: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 11,
  },
  localeValue: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    maxWidth: 160,
    textAlign: 'right',
  },
  version: {
    textAlign: 'center',
    fontSize: sg.type.xs,
    color: sg.muted,
    marginTop: sg.space.lg,
  },
});
