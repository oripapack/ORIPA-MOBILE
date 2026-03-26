import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { navigationRef } from '../navigation/navigationRef';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAppStore } from '../store/useAppStore';
import { mockPacks, type Pack } from '../data/mockPacks';
import { getLocalizedPackFields } from '../i18n/packCopy';
import { demoPackHeroImage } from '../data/demoMedia';

type Props = {
  route: { params: { packId: string } };
};

export function PackDetailsScreen({ route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => !!s.pendingFulfillmentPullId);

  const pack = useMemo<Pack | undefined>(
    () => mockPacks.find((p) => String(p.id) === String(route.params.packId)),
    [route.params.packId],
  );

  const loc = pack ? getLocalizedPackFields(pack, t) : null;

  if (!pack || !loc) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigationRef.goBack()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>{t('packDetails.back')}</Text>
        </TouchableOpacity>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>{t('packDetails.missingTitle')}</Text>
          <Text style={styles.missingBody}>{t('packDetails.missingBody')}</Text>
        </View>
      </View>
    );
  }

  const disabled = isPackOpening || awaitingFulfillment || pack.remainingInventory <= 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigationRef.goBack()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>{t('packDetails.back')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={{ uri: demoPackHeroImage(String(pack.id)) }} style={styles.heroImg} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{loc.title}</Text>
            <Text style={styles.heroValue}>{loc.valueDescription}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('packDetails.guaranteeTitle')}</Text>
            <Text style={styles.sectionBody}>{loc.guaranteeText}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('packDetails.priceTitle')}</Text>
            <Text style={styles.sectionBody}>
              {pack.creditPrice} {t('packCard.credits')}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>
                  {t('packDetails.remaining', {
                    left: pack.remainingInventory,
                    total: pack.totalInventory,
                  })}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>{t(`packCard.shortBadge.${pack.tags[0] ?? 'new'}`)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <TouchableOpacity
          style={[styles.cta, disabled && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={disabled}
          onPress={() =>
            requireAuth(() => {
              openPack(pack);
            })
          }
        >
          <Text style={styles.ctaText}>
            {disabled ? t('packDetails.ctaDisabled') : t('packCard.openPack')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  missing: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  missingTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  missingBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hero: {
    marginHorizontal: spacing.base,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  heroImg: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroText: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    bottom: spacing.base,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  cta: {
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
  },
});

