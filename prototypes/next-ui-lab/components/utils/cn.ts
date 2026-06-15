/**
 * Merges Tailwind class strings safely.
 * Filters out falsy values — no clsx dependency needed.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
