import React from 'react';
import { sg } from '../../tokens/sg';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  onOpenLootBoxDisclosure: () => void;
}

export function CreditsPurchaseSection({ onOpenLootBoxDisclosure }: Props) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.title}>{t('buyCredits.title')}</Text>
      <Text style={styles.subtitle}>{t('buyCredits.subtitle')}</Text>

      <TouchableOpacity
        style={styles.probabilityLink}
        onPress={onOpenLootBoxDisclosure}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={styles.probabilityLinkText}>{t('paymentPortal.viewProbabilities')}</Text>
      </TouchableOpacity>

      <View style={styles.unavailableCard}>
        <View style={styles.unavailableIcon}>
          <MaterialCommunityIcons name="lock-outline" size={24} color={sg.text} />
        </View>
        <Text style={styles.unavailableTitle}>{t('buyCredits.unavailableTitle')}</Text>
        <Text style={styles.unavailableBody}>{t('buyCredits.unavailableBody')}</Text>
        <Text style={styles.routingNote}>{t('paymentPortal.digitalRoutingNote')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  mockNote: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    backgroundColor: sg.vermilionWash,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  probabilityLink: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  probabilityLinkText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.error,
    textDecorationLine: 'underline',
  },
  unavailableCard: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  unavailableIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface,
    marginBottom: spacing.md,
  },
  unavailableTitle: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  unavailableBody: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  routingNote: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
});
