import type { TFunction } from 'i18next';
import { VAULT_EXPIRY_WARN_MS } from './vaultConstants';
import type { Pull } from '../data/mockUser';

export function vaultMillisRemaining(pull: Pull): number | null {
  if (pull.fulfillment !== 'vaulted' || !pull.vaultExpiresAt) return null;
  return Math.max(0, pull.vaultExpiresAt.getTime() - Date.now());
}

export function vaultExpiryNoticeActive(pull: Pull): boolean {
  const ms = vaultMillisRemaining(pull);
  if (ms == null) return false;
  return ms > 0 && ms <= VAULT_EXPIRY_WARN_MS;
}

/** Short countdown for tiles and sheets (English copy via i18n). */
export function formatVaultTimeLeft(ms: number, t: TFunction): string {
  if (ms <= 0) return t('vaultScreen.timerEnded');
  const hours = Math.ceil(ms / 3600000);
  if (hours < 48) {
    return t('vaultScreen.timerHoursLeft', { count: hours });
  }
  const days = Math.ceil(ms / 86400000);
  return t('vaultScreen.timerDaysLeft', { count: days });
}
