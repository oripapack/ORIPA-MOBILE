import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { PUBLIC_WEB_ORIGIN } from '../../config/app';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  username: string;
};

export function ReferralLinkCard({ username }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const handle = username.trim().replace(/^@/, '');
  const link = handle ? `${PUBLIC_WEB_ORIGIN}?r=${encodeURIComponent(handle)}` : PUBLIC_WEB_ORIGIN;

  const copy = useCallback(async () => {
    if (!handle) return;
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [handle, link]);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{t('promotions.referralEyebrow')}</Text>
      <Text style={styles.title}>{t('promotions.referralTitle')}</Text>
      <Text style={styles.body}>{t('promotions.referralBody')}</Text>
      <View style={styles.linkBox}>
        <Text style={styles.link} numberOfLines={2} selectable>
          {link}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.copyBtn}
        onPress={copy}
        disabled={!handle}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t('promotions.copyLink')}
      >
        <Text style={styles.copyText}>{copied ? t('promotions.copied') : t('promotions.copyLink')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  linkBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gold,
  },
  copyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  copyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
