import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { Pull } from '../../data/mockUser';
import type { VaultExchangeBuyerRules } from '../../lib/vaultExchange';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { showUserMessage } from '../../utils/showUserMessage';

type Props = {
  visible: boolean;
  pull: Pull | null;
  rules: VaultExchangeBuyerRules | null;
  sellerDisplayHandle: string;
  isSelf: boolean;
  onClose: () => void;
  /** When listed — open the unconnected physical-checkout preview. */
  onBuyNow: (listingId: string, priceUsd: number) => void;
};

export function FriendVaultItemSheet({
  visible,
  pull,
  rules,
  sellerDisplayHandle,
  isSelf,
  onClose,
  onBuyNow,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const stubInterest = (key: 'request' | 'offer' | 'ask') => {
    const title = t(`vaultExchange.stub.${key}Title`);
    const body = t(`vaultExchange.stub.${key}Body`, { handle: sellerDisplayHandle });
    showUserMessage(title, body);
  };

  if (!pull || !rules) return null;

  const listed = rules.surface === 'listed_buy_now';

  return (
    <Modal visible={visible} transparent animationType="slide" {...transparentModalIOSProps}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + sg.space.lg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          <Text style={styles.kicker}>{t('vaultExchange.sheetKicker')}</Text>
          <Text style={styles.title} numberOfLines={3}>
            {pull.result}
          </Text>
          <Text style={styles.pack} numberOfLines={2}>
            {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
          </Text>

          <View style={[styles.badge, listed ? styles.badgeListed : styles.badgeRequest]}>
            <Text style={[styles.badgeText, listed ? styles.badgeTextListed : styles.badgeTextRequest]}>
              {listed ? t('vaultExchange.badgeBuyNow') : t('vaultExchange.badgeRequestable')}
            </Text>
          </View>

          {listed && rules.listPriceUsd != null ? (
            <Text style={styles.price}>{formatVaultExchangeUsd(rules.listPriceUsd)}</Text>
          ) : null}

          {isSelf ? (
            <Text style={styles.selfHint}>{t('vaultExchange.selfSheetHint')}</Text>
          ) : listed && rules.listingId && rules.listPriceUsd != null ? (
            <>
              <PrimaryButton
                label={t('vaultExchange.buyNowCta')}
                onPress={() => {
                  onBuyNow(rules.listingId!, rules.listPriceUsd!);
                  onClose();
                }}
                style={styles.cta}
              />
              <Text style={styles.fine}>{t('vaultExchange.buyNowFine')}</Text>
              <View style={styles.row3}>
                <TouchableOpacity style={styles.ghost} onPress={() => stubInterest('request')}>
                  <Text style={styles.ghostText}>{t('vaultExchange.actionRequest')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghost} onPress={() => stubInterest('offer')}>
                  <Text style={styles.ghostText}>{t('vaultExchange.actionOffer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghost} onPress={() => stubInterest('ask')}>
                  <Text style={styles.ghostText}>{t('vaultExchange.actionAsk')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.lead}>{t('vaultExchange.requestableLead')}</Text>
              <PrimaryButton label={t('vaultExchange.actionRequest')} onPress={() => stubInterest('request')} style={styles.cta} />
              <View style={styles.row2}>
                <TouchableOpacity style={styles.outline} onPress={() => stubInterest('offer')}>
                  <Text style={styles.outlineText}>{t('vaultExchange.actionOffer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.outline} onPress={() => stubInterest('ask')}>
                  <Text style={styles.outlineText}>{t('vaultExchange.actionAsk')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <SecondaryButton label={t('vaultAsset.close')} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: sg.surface,
    borderTopLeftRadius: sg.radius.panel,
    borderTopRightRadius: sg.radius.panel,
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.sm,
    borderTopWidth: 1,
    borderColor: sg.line,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    marginBottom: sg.space.md,
  },
  kicker: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    marginBottom: sg.space.xs,
  },
  title: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.xs,
  },
  pack: {
    fontSize: sg.type.sm,
    color: sg.muted,
    marginBottom: sg.space.md,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: sg.space.sm,
    borderRadius: sg.radius.tag,
    marginBottom: sg.space.sm,
  },
  badgeListed: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.55)',
  },
  badgeRequest: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.6,
  },
  badgeTextListed: { color: sg.gold },
  badgeTextRequest: { color: sg.muted },
  price: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
    marginBottom: sg.space.md,
  },
  selfHint: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.md,
  },
  fine: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: sg.space.md,
  },
  cta: { marginBottom: sg.space.sm },
  row2: { flexDirection: 'row', gap: sg.space.sm, marginBottom: sg.space.md },
  row3: { flexDirection: 'row', flexWrap: 'wrap', gap: sg.space.sm, marginBottom: sg.space.md },
  outline: {
    flex: 1,
    paddingVertical: sg.space.md,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
  },
  outlineText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  ghost: {
    paddingVertical: sg.space.sm,
    paddingHorizontal: sg.space.sm,
  },
  ghostText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    textDecorationLine: 'underline',
  },
});
