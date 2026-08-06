import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { VaultFramedCard } from '../shared/VaultFramedCard';

const POINTS = [
  { pointKey: '1', icon: 'cube-outline' },
  { pointKey: '2', icon: 'pricetag-outline' },
  { pointKey: '3', icon: 'albums-outline' },
] as const;

/**
 * Post-browse trust reinforcement — vault-framed but visually secondary to inventory.
 */
export function WhyChoosePullHub() {
  const { t } = useTranslation();

  return (
    <VaultFramedCard style={styles.outer} contentStyle={styles.inner}>
      <Text style={styles.sectionTitle}>{t('marketplace.whyTitle')}</Text>

      {POINTS.map(({ pointKey, icon }) => (
        <View key={pointKey} style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={19} color={sg.gold} />
          </View>
          <View style={styles.textCol}>
            <View style={styles.pointPill}>
              <Text style={styles.pointPillText}>{t(`marketplace.whyPointLabel${pointKey}`)}</Text>
            </View>
            <Text style={styles.heading}>{t(`marketplace.whyPoint${pointKey}Title`)}</Text>
            <Text style={styles.body}>{t(`marketplace.whyPoint${pointKey}Body`)}</Text>
          </View>
        </View>
      ))}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: sg.space.md,
    marginBottom: sg.space.md,
  },
  inner: {
    paddingTop: sg.space.sm,
    paddingBottom: sg.space.xs,
    paddingHorizontal: sg.space.md,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: sg.font.display,
    color: sg.muted,
    marginBottom: sg.space.sm,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sg.space.sm,
    marginBottom: sg.space.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  pointPill: {
    alignSelf: 'flex-start',
    backgroundColor: sg.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: sg.accentLine,
    marginBottom: 4,
  },
  pointPillText: {
    fontSize: 8,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 13,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: sg.muted,
    lineHeight: 17,
  },
});
