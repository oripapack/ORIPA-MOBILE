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
          style={[styles.cardWrap, { paddingBottom: Math.max(insets.bottom, sg.space.md) + sg.space.sm }]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
  },
  cardWrap: {
    paddingHorizontal: sg.space.md,
    zIndex: 2,
  },
  cardRing: {
    borderRadius: sg.radius.panel,
    padding: 1.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    ...Platform.select({
      ios: {
        shadowColor: sg.bg,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  cardInner: {
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface2,
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.sm,
    paddingBottom: sg.space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.line,
    marginBottom: sg.space.md,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: sg.space.sm + 2,
    paddingVertical: 5,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.accentLine,
    marginBottom: sg.space.md,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.gold,
  },
  eyebrow: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.md,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  bodyLine: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.xs,
  },
  compareWrap: {
    marginTop: 0,
    gap: 0,
  },
  comparePrimaryBlock: {
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
    paddingLeft: sg.space.md,
    paddingVertical: sg.space.md,
    marginLeft: 1,
    backgroundColor: sg.accentSoft,
    borderRadius: sg.radius.btn,
  },
  comparePrimaryHeading: {
    fontSize: sg.type.md,
    fontFamily: sg.font.display,
    color: sg.gold,
    letterSpacing: -0.3,
    marginBottom: sg.space.sm,
  },
  comparePrimaryLine: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    lineHeight: 22,
    marginTop: 4,
  },
  compareDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: sg.line,
    marginVertical: sg.space.sm + 2,
  },
  compareSecondaryBlock: {
    borderLeftWidth: 2,
    borderLeftColor: sg.line,
    paddingLeft: sg.space.md,
    paddingVertical: sg.space.sm,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.surface,
  },
  compareSecondaryHeading: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    letterSpacing: -0.15,
    marginBottom: sg.space.xs,
  },
  compareSecondaryLine: {
    fontSize: sg.type.xs,
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
    marginTop: sg.space.md,
    paddingVertical: sg.space.sm + 2,
    paddingHorizontal: sg.space.sm,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.accentWash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.accentLine,
  },
  flowStep: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  flowArrow: {
    fontSize: sg.type.xs,
    color: sg.gold,
    fontFamily: sg.font.bodyBold,
  },
  actions: {
    marginTop: sg.space.md + 4,
    gap: sg.space.sm,
  },
  primaryCta: {
    minHeight: 56,
    borderRadius: sg.radius.btn,
    ...Platform.select({
      ios: {
        shadowColor: sg.bg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
});
