import React, { useCallback, useState } from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { PUBLIC_WEB_ORIGIN } from '../../config/app';

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
    padding: sg.space.lg,
  },
  eyebrow: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
  },
  title: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  body: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.md,
  },
  linkBox: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.btn,
    padding: sg.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    marginBottom: sg.space.md,
  },
  link: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
  },
  copyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: sg.space.sm,
    paddingHorizontal: sg.space.md,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  copyText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
});
