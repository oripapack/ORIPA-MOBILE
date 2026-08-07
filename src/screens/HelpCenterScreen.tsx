import React, { useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { openExternalUrl } from '../utils/openExternalUrl';
import { SUPPORT_EMAIL, SUPPORT_IS_LIVE } from '../config/app';
import { SgScreen } from '../components/ui/SgScreen';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';

type Nav = StackNavigationProp<RootStackParamList, 'HelpCenter'>;

export function HelpCenterScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const faqIds = ['credits', 'shipping', 'drops'] as const;
  const [openId, setOpenId] = useState<string | null>('credits');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('helpCenter.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.display, fontSize: 21 },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.bg },
    });
  }, [navigation, t]);

  return (
    <SgScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.routeRail}>
          <View style={styles.routeCode}>
            <Text style={styles.routeNumber}>01</Text>
          </View>
          <View style={styles.routeCopy}>
            <Text style={styles.routeKicker}>TOKYO TERMINAL / SUPPORT</Text>
            <Text style={styles.routeTitle}>{t('helpCenter.navTitle')}</Text>
          </View>
          <Ionicons name="help-buoy-outline" size={24} color={sg.goldHi} />
        </View>

        <Text style={styles.lead}>{t('helpCenter.lead')}</Text>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionIndex}>A</Text>
          <Text style={styles.sectionLabel}>FAQ / QUICK GUIDE</Text>
          <View style={styles.sectionLine} />
        </View>

        <VaultFramedCard contentStyle={styles.faqList}>
          {faqIds.map((id, index) => {
            const expanded = openId === id;
            return (
            <TouchableOpacity
              key={id}
              style={[styles.faqRow, index > 0 && styles.faqRowDivider]}
              onPress={() => setOpenId(expanded ? null : id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t(`helpCenter.faq.${id}.q`)}
              accessibilityState={{ expanded }}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqIndex, expanded && styles.faqIndexActive]}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.faqQ}>{t(`helpCenter.faq.${id}.q`)}</Text>
                <Ionicons
                  name={expanded ? 'remove' : 'add'}
                  size={20}
                  color={expanded ? sg.goldHi : sg.muted}
                />
              </View>
              {expanded ? (
                <View style={styles.answerRow}>
                  <View style={styles.answerRail} />
                  <Text style={styles.faqA}>{t(`helpCenter.faq.${id}.a`)}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            );
          })}
        </VaultFramedCard>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionIndex}>B</Text>
          <Text style={styles.sectionLabel}>
            {t(SUPPORT_IS_LIVE ? 'helpCenter.contactSection' : 'helpCenter.contactStatusSection')}
          </Text>
          <View style={styles.sectionLine} />
        </View>

        <VaultFramedCard fill="felt" contentStyle={styles.contactCard}>
          {SUPPORT_IS_LIVE ? (
            <>
              <View style={styles.contactIcon}>
                <Ionicons name="mail-outline" size={22} color={sg.goldHi} />
              </View>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => void openExternalUrl(`mailto:${SUPPORT_EMAIL}`, t('helpCenter.emailUs'))}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('helpCenter.emailCta', { email: SUPPORT_EMAIL })}
              >
                <Text style={styles.contactBtnText}>{t('helpCenter.emailCta', { email: SUPPORT_EMAIL })}</Text>
                <Ionicons name="arrow-forward" size={18} color={sg.onGold} />
              </TouchableOpacity>
              <Text style={styles.footnote}>{t('helpCenter.responseTime')}</Text>
            </>
          ) : (
            <View accessibilityRole="summary">
              <Text style={styles.contactStatus}>{t('helpCenter.contactUnavailableEyebrow')}</Text>
              <Text style={styles.contactUnavailableTitle}>{t('helpCenter.contactUnavailableTitle')}</Text>
              <Text style={styles.contactUnavailableBody}>{t('helpCenter.contactUnavailableBody')}</Text>
            </View>
          )}
        </VaultFramedCard>
      </ScrollView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
  },
  routeRail: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
  },
  routeCode: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.cobaltWashStrong,
    borderWidth: 1,
    borderColor: sg.cobaltBorderStrong,
  },
  routeNumber: {
    fontFamily: sg.font.dataBold,
    fontSize: 13,
    color: sg.goldHi,
    fontVariant: ['tabular-nums'],
  },
  routeCopy: { flex: 1 },
  routeKicker: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
  },
  routeTitle: {
    marginTop: 2,
    fontFamily: sg.font.display,
    fontSize: 25,
    lineHeight: 28,
    color: sg.text,
  },
  lead: {
    marginTop: sg.space.md,
    fontFamily: sg.font.body,
    fontSize: 14,
    color: sg.muted,
    lineHeight: 21,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginTop: sg.space.lg,
    marginBottom: sg.space.sm,
  },
  sectionIndex: {
    fontFamily: sg.font.dataBold,
    fontSize: 11,
    color: sg.goldHi,
  },
  sectionLabel: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
    textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: sg.line },
  faqList: { padding: 0, paddingLeft: 6 },
  faqRow: {
    paddingHorizontal: sg.space.md,
    paddingVertical: 15,
  },
  faqRowDivider: {
    borderTopWidth: 1,
    borderTopColor: sg.line,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqIndex: {
    width: 24,
    fontFamily: sg.font.data,
    fontSize: 11,
    color: sg.chrome,
    fontVariant: ['tabular-nums'],
  },
  faqIndexActive: { color: sg.goldHi },
  faqQ: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingLeft: 36,
  },
  answerRail: { width: 2, backgroundColor: sg.gold, opacity: 0.75 },
  faqA: {
    flex: 1,
    fontFamily: sg.font.body,
    fontSize: 13,
    color: sg.muted,
    lineHeight: 20,
  },
  contactCard: {
    padding: sg.space.md,
    paddingLeft: sg.space.md + 6,
  },
  contactIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sg.space.sm,
    backgroundColor: sg.cobaltWash,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  contactBtn: {
    backgroundColor: sg.gold,
    minHeight: sg.component.buttonPrimary.height,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: sg.goldHi,
  },
  contactBtnText: {
    flex: 1,
    fontSize: 15,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
  footnote: {
    marginTop: sg.space.sm,
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.muted,
    lineHeight: 16,
  },
  contactStatus: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.warning,
    marginBottom: sg.space.sm,
  },
  contactUnavailableTitle: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    letterSpacing: sg.type.title.letterSpacing,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  contactUnavailableBody: {
    fontFamily: sg.font.body,
    fontSize: sg.type.body.fontSize,
    lineHeight: sg.type.body.lineHeight,
    color: sg.muted,
  },
});
