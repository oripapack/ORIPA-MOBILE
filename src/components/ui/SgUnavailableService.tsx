import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { SgScreen } from './SgScreen';

interface Props {
  code: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  status?: string;
}

/** Release-safe destination for account services without a verified provider connection. */
export function SgUnavailableService({ code, eyebrow, title, body, status }: Props) {
  const { t } = useTranslation();

  return (
    <SgScreen constrainContent>
      <View style={styles.page} accessibilityRole="summary">
        <Text style={styles.eyebrow}>{eyebrow ?? t('serviceAvailability.eyebrow')}</Text>
        <Text style={styles.title}>{title ?? t('serviceAvailability.title')}</Text>
        <Text style={styles.body}>{body ?? t('serviceAvailability.body')}</Text>
        <View style={styles.panel}>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.status}>{status ?? t('serviceAvailability.status')}</Text>
        </View>
      </View>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.xl,
  },
  eyebrow: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.warning,
    marginBottom: sg.space.sm,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    letterSpacing: sg.type.title.letterSpacing,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  body: {
    maxWidth: 520,
    fontFamily: sg.font.body,
    fontSize: sg.type.body.fontSize,
    lineHeight: sg.type.body.lineHeight,
    color: sg.muted,
  },
  panel: {
    minHeight: 112,
    marginTop: sg.space.xl,
    padding: sg.space.md,
    justifyContent: 'space-between',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
  },
  code: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.chrome,
  },
  status: {
    fontFamily: sg.font.label,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    color: sg.warning,
  },
});
