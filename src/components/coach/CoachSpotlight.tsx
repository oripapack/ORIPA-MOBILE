import React, { Fragment } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';

export type CoachComparisonProps = {
  packsHeading: string;
  packsLines: string[];
  shopHeading: string;
  shopLines: string[];
};

type Props = {
  visible: boolean;
  title: string;
  bodyLines: string[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onDismiss: () => void;
  /** Optional kicker above title */
  eyebrow?: string;
  /** Optional subtle loop hint (e.g. Open → Win → Convert → Repeat) */
  flowSteps?: string[];
  /** Shop coach: two-column Packs vs Shop (replaces bodyLines when set). */
  comparison?: CoachComparisonProps;
  /** Second button (defaults to `onDismiss` if omitted). */
  onSecondary?: () => void;
};

const GOLD_SOFT = sg.cobaltWash;
const GOLD_BORDER = sg.cobaltBorder;
const GOLD_WASH = sg.cobaltWashSoft;

/**
 * Bottom-anchored coach card — solid dim (no blur) so the tab behind stays readable.
 */
export function CoachSpotlight({
  visible,
  title,
  bodyLines,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onDismiss,
  eyebrow,
  flowSteps,
  comparison,
  onSecondary,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.root, { minHeight: height }]} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityRole="button">
          <View style={styles.dim} />
        </Pressable>

        <View
          style={[styles.cardWrap, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}
          pointerEvents="box-none"
        >
          <View style={styles.cardRing}>
            <View style={styles.cardInner}>
              <View style={styles.handle} />
              {eyebrow ? (
                <View style={styles.eyebrowPill}>
                  <View style={styles.eyebrowDot} />
                  <Text style={styles.eyebrow} accessibilityRole="text">
                    {eyebrow}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.title}>{title}</Text>
              {comparison ? (
                <View style={styles.compareWrap}>
                  {/* Shop first: user opened Shop — primary visual treatment */}
                  <View style={styles.comparePrimaryBlock}>
                    <Text style={styles.comparePrimaryHeading}>{comparison.shopHeading}</Text>
                    {comparison.shopLines.map((line, i) => (
                      <Text key={`s-${i}`} style={styles.comparePrimaryLine}>
                        {line}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.compareDivider} />
                  <View style={styles.compareSecondaryBlock}>
                    <Text style={styles.compareSecondaryHeading}>{comparison.packsHeading}</Text>
                    {comparison.packsLines.map((line, i) => (
                      <Text key={`p-${i}`} style={styles.compareSecondaryLine}>
                        {line}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : (
                bodyLines.map((line, i) => (
                  <Text key={i} style={styles.bodyLine}>
                    {line}
                  </Text>
                ))
              )}
              {flowSteps && flowSteps.length > 0 ? (
                <View
                  style={styles.flowRow}
                  accessibilityRole="text"
                  accessibilityLabel={flowSteps.join(' → ')}
                >
                  {flowSteps.map((step, i) => (
                    <Fragment key={`${step}-${i}`}>
                      {i > 0 ? <Text style={styles.flowArrow}>→</Text> : null}
                      <Text style={styles.flowStep}>{step}</Text>
                    </Fragment>
                  ))}
                </View>
              ) : null}
              <View style={styles.actions}>
                <PrimaryButton label={primaryLabel} onPress={onPrimary} style={styles.primaryCta} />
                <SecondaryButton label={secondaryLabel} onPress={onSecondary ?? onDismiss} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: sg.modalScrim,
  },
  cardWrap: {
    paddingHorizontal: spacing.base,
    zIndex: 2,
  },
  cardRing: {
    borderRadius: radius.xl,
    padding: 1.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    ...Platform.select({
      ios: {
        shadowColor: sg.shadowHero.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  cardInner: {
    borderRadius: radius.xl - 1,
    backgroundColor: sg.surface2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: sg.line,
    marginBottom: spacing.md,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: GOLD_SOFT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
    marginBottom: spacing.md,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: sg.gold,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.accentText,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.md,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  bodyLine: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  compareWrap: {
    marginTop: 0,
    gap: 0,
  },
  comparePrimaryBlock: {
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
    paddingLeft: spacing.md,
    paddingVertical: spacing.md,
    marginLeft: 1,
    backgroundColor: GOLD_SOFT,
    borderRadius: radius.md,
  },
  comparePrimaryHeading: {
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.accentText,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  comparePrimaryLine: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    lineHeight: 22,
    marginTop: 4,
  },
  compareDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: sg.line,
    marginVertical: spacing.sm + 2,
  },
  compareSecondaryBlock: {
    borderLeftWidth: 2,
    borderLeftColor: sg.line,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: sg.surface,
  },
  compareSecondaryHeading: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: -0.15,
    marginBottom: spacing.xs,
  },
  compareSecondaryLine: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 19,
    marginTop: 3,
    opacity: 0.95,
  },
  flowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: GOLD_WASH,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
  },
  flowStep: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  flowArrow: {
    fontSize: fontSize.xs,
    color: sg.accentText,
    fontFamily: sg.font.bodyBold,
  },
  actions: {
    marginTop: spacing.md + 4,
    gap: spacing.sm,
  },
  primaryCta: {
    minHeight: 56,
    borderRadius: radius.lg,
  },
});
