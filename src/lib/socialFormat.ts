export function formatPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Points`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k Points`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k Points`;
  return `${Math.round(n).toLocaleString()} Points`;
}

/** @deprecated Active UI uses Points; retained only for archived imports. */
export const formatUsd = formatPoints;

export function formatRelativeTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}
