import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { usePromotionStore } from '../store/promotionStore';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { ReferralLinkCard } from '../components/promotions/ReferralLinkCard';
import { PromoCodeInput } from '../components/promotions/PromoCodeInput';
import { PromoSuccessModal } from '../components/promotions/PromoSuccessModal';
import { formatGrantSummary } from '../components/promotions/formatGrant';

export function PromotionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const userId = useAppStore((s) => s.user.id);
  const username = useAppStore((s) => s.user.username);
  const applyManualPromo = usePromotionStore((s) => s.applyManualPromo);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const onSubmitCode = useCallback(
    async (raw: string) => {
      setError(null);
      const result = applyManualPromo(userId, raw);
      if (!result.ok) {
        const key =
          result.reason === 'already_redeemed'
            ? 'promotions.errorRedeemed'
            : result.reason === 'invalid'
              ? 'promotions.errorInvalid'
              : 'promotions.errorInactive';
        setError(t(key));
        return;
      }
      setSuccess({
        title: result.label,
        body: formatGrantSummary(result.grant),
      });
    },
    [applyManualPromo, userId, t],
  );

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('promotions.screenTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>{t('promotions.screenLead')}</Text>

        <Text style={styles.sectionHeader}>{t('promotions.sectionReferral')}</Text>
        <VaultFramedCard style={styles.card}>
          <ReferralLinkCard username={username} />
        </VaultFramedCard>

        <Text style={styles.sectionHeader}>{t('promotions.sectionCode')}</Text>
        <VaultFramedCard style={styles.card}>
          <View style={styles.codeInner}>
            <Text style={styles.codeExplainer}>{t('promotions.codeExplainer')}</Text>
            <PromoCodeInput onSubmit={onSubmitCode} />
            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </View>
        </VaultFramedCard>
      </ScrollView>

      <PromoSuccessModal
        visible={success !== null}
        title={success?.title ?? ''}
        body={success?.body ?? ''}
        onDismiss={() => setSuccess(null)}
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
    paddingTop: spacing.lg,
  },
  lead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.lg,
  },
  codeInner: {
    padding: spacing.lg,
  },
  codeExplainer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
