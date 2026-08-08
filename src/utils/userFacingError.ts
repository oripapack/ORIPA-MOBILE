import i18n from '../i18n';

/**
 * Map API / infrastructure error text to user-safe copy.
 * Technical messages (env, stack names, service codes) never reach the UI.
 */
const TECH =
  /supabase|\.env|execute-pull|pull_id|idempotency|rpc\b|jwt|deno|stack trace|ECONN|ENOTFOUND|postgres|postgrest|edge function|npm:|node_modules/i;

export function userFacingErrorBody(
  raw: string | undefined | null,
  fallbackKey = 'alerts.generic.body',
): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return i18n.t(fallbackKey);
  if (TECH.test(trimmed)) return i18n.t(fallbackKey);
  if (/^[A-Z][A-Z0-9_]{2,}$/.test(trimmed)) return i18n.t(fallbackKey);
  return trimmed;
}

/** Title + body for a failed pack open by error code. */
export function packOpenFailureCopy(code: string): { title: string; body: string } {
  if (code === 'NETWORK_ERROR') {
    return {
      title: i18n.t('alerts.packOpen.connectionTitle'),
      body: i18n.t('alerts.generic.body'),
    };
  }
  return {
    title: i18n.t('alerts.packOpen.failedTitle'),
    body: i18n.t('alerts.packOpen.failedBody'),
  };
}
