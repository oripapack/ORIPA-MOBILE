import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { sg } from '../../../tokens/sg';
import { SgButton, SgData, SgTierTag } from '../../ui';
import { TerminalBackdrop, TerminalPackBay, TerminalStatusRail } from '../../terminal';
import type { PackRollResult, RevealCard } from './types';

type Props = {
  pack: Pack;
  roll: PackRollResult;
  revealCard: RevealCard;
  onRevealDone: () => void;
};

/**
 * Code-native safety path for devices where the optional 3D scene is unavailable.
 * It preserves the same pre-rolled result and never re-rolls or mutates inventory.
 */
export function TerminalOpeningFallback({ pack, roll, revealCard, onRevealDone }: Props) {
  const [revealed, setRevealed] = useState(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (completionTimer.current) clearTimeout(completionTimer.current);
    },
    [],
  );

  const reveal = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    completionTimer.current = setTimeout(onRevealDone, 1400);
  }, [onRevealDone, revealed]);

  return (
    <View style={styles.root}>
      <TerminalBackdrop />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>CODE-NATIVE / SAFE REVEAL</Text>
          <Text style={styles.title}>{revealed ? 'PULL RECORDED' : 'PACK SEALED'}</Text>
        </View>
        <Text style={styles.status}>{revealed ? 'SYNCED' : 'READY'}</Text>
      </View>

      {!revealed ? (
        <>
          <View style={styles.machineRow}>
            <View style={styles.bay}>
              <TerminalPackBay
                name={pack.title}
                category={pack.tcgCategory ?? 'TCG'}
                rarityTier={pack.rarityTier}
                size="hero"
              />
            </View>
            <TerminalStatusRail />
          </View>
          <View style={styles.control}>
            <Text style={styles.controlLabel}>3D SCENE BYPASSED / RESULT PRESERVED</Text>
            <SgButton label="Reveal pack" onPress={reveal} />
          </View>
        </>
      ) : (
        <View style={styles.resultPanel}>
          <Text style={styles.resultEyebrow}>PULL / TERMINAL RECORD</Text>
          <Text style={styles.resultName} numberOfLines={3}>
            {revealCard.name || roll.result}
          </Text>
          <View style={styles.tierRow}>
            <Text style={styles.tierLabel}>TIER</Text>
            <SgTierTag tier={roll.tier} context="badge" />
          </View>
          <View style={styles.valueRail}>
            <SgData value={roll.creditsWon.toLocaleString()} unit="Points" size="lg" tone="gold" />
            <Text style={styles.syncText}>SENDING TO RESULT</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 420,
    paddingTop: sg.space.xl,
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.lg,
    backgroundColor: sg.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: sg.space.md,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  eyebrow: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.goldHi,
  },
  title: {
    marginTop: sg.space.xs,
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    color: sg.text,
  },
  status: {
    fontFamily: sg.font.dataBold,
    fontSize: sg.type.label.fontSize,
    color: sg.success,
    borderWidth: 1,
    borderColor: sg.mintBorder,
    borderRadius: sg.radius.tag,
    paddingHorizontal: sg.space.sm,
    paddingVertical: sg.space.xs,
  },
  machineRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: sg.space.sm,
    paddingVertical: sg.space.md,
  },
  bay: { flex: 1 },
  control: {
    borderTopWidth: 1,
    borderTopColor: sg.line,
    paddingTop: sg.space.md,
    gap: sg.space.sm,
  },
  controlLabel: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
  },
  resultPanel: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: sg.space.lg,
    padding: sg.space.lg,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.cobaltBorderStrong,
    borderRadius: sg.radius.panel,
    ...sg.shadowHero,
  },
  resultEyebrow: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.goldHi,
  },
  resultName: {
    marginTop: sg.space.sm,
    fontFamily: sg.font.display,
    fontSize: sg.type.hero.fontSize,
    lineHeight: sg.type.hero.lineHeight,
    color: sg.text,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginTop: sg.space.lg,
  },
  tierLabel: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
  },
  valueRail: {
    marginTop: sg.space.lg,
    paddingTop: sg.space.md,
    borderTopWidth: 1,
    borderTopColor: sg.line,
    gap: sg.space.sm,
  },
  syncText: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.success,
  },
});
