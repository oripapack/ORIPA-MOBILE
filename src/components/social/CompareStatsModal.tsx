import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SocialUserProfile } from '../../data/socialMock';
import { buildCompareRows } from '../../data/socialMock';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { formatUsd } from '../../lib/socialFormat';
import { transparentModalIOSProps } from '../../constants/modalPresentation';

interface Props {
  visible: boolean;
  onClose: () => void;
  me: SocialUserProfile;
  friend: SocialUserProfile;
}

function fmtVal(v: number | string): string {
  if (typeof v === 'string') return v;
  if (v >= 1000) return formatUsd(v);
  return v.toLocaleString();
}

export function CompareStatsModal({ visible, onClose, me, friend }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const rows = buildCompareRows(me, friend);

  return (
    <Modal visible={visible} animationType="slide" transparent {...transparentModalIOSProps}>
      <View style={styles.back}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backTap} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t('social.compareTitle')}</Text>
          <Text style={styles.sub}>{t('social.compareSub')}</Text>

          <View style={styles.heads}>
            <Text style={[styles.headName, styles.headYou]} numberOfLines={1}>
              {t('social.you')}
            </Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={[styles.headName, styles.headThem]} numberOfLines={1}>
              @{friend.username}
            </Text>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {rows.map((row) => (
              <View key={row.key} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.rowVals}>
                  <View
                    style={[
                      styles.cell,
                      row.winner === 'me' ? styles.win : row.winner === 'tie' ? styles.tie : styles.lose,
                    ]}
                  >
                    <Text style={styles.cellText}>{fmtVal(row.me)}</Text>
                  </View>
                  <View
                    style={[
                      styles.cell,
                      row.winner === 'them' ? styles.win : row.winner === 'tie' ? styles.tie : styles.lose,
                    ]}
                  >
                    <Text style={styles.cellText}>{fmtVal(row.them)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.done} onPress={onClose} activeOpacity={0.88}>
            <Text style={styles.doneText}>{t('social.compareDone')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backTap: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  heads: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headName: { flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  headYou: { textAlign: 'left' },
  headThem: { textAlign: 'right' },
  vs: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  scroll: { maxHeight: 360 },
  row: { marginBottom: spacing.md },
  rowLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  rowVals: { flexDirection: 'row', gap: spacing.sm },
  cell: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  win: {
    backgroundColor: 'rgba(22,163,74,0.1)',
    borderColor: 'rgba(22,163,74,0.35)',
  },
  lose: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  tie: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  cellText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  done: {
    marginTop: spacing.md,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { color: colors.white, fontWeight: fontWeight.black, fontSize: fontSize.md },
});
