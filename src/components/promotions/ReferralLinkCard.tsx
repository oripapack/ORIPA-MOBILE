import React, { useCallback, useState } from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { PUBLIC_WEB_ORIGIN } from '../../config/app';
import { fontSize } from '../../tokens/typography';
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
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  linkBox: {
    backgroundColor: sg.surface,
    borderRadius: radius.md,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    marginBottom: spacing.md,
  },
  link: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.accentText,
  },
  copyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  copyText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
});
