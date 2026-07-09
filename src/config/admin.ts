/**
 * Admin / staff access control.
 *
 * An account is treated as an admin when EITHER:
 *   1. Its Clerk `publicMetadata.role` is `"admin"` (set in the Clerk dashboard), OR
 *   2. Its primary email is listed in `ADMIN_EMAIL_ALLOWLIST` below.
 *
 * Admins unlock the in-app "Admin Tools" section (e.g. grant infinite credits).
 * Keep this list short and use lowercase emails.
 */

/** Lowercase emails that always count as admin. Add your dev / staff accounts here. */
export const ADMIN_EMAIL_ALLOWLIST: string[] = [
  // 'you@example.com',
];

/** Minimal shape of the Clerk user fields we need — avoids importing Clerk types here. */
export type AdminCheckUser =
  | {
      primaryEmailAddress?: { emailAddress?: string | null } | null;
      publicMetadata?: unknown;
    }
  | null
  | undefined;

function metadataRoleIsAdmin(publicMetadata: unknown): boolean {
  if (!publicMetadata || typeof publicMetadata !== 'object' || Array.isArray(publicMetadata)) {
    return false;
  }
  const role = (publicMetadata as { role?: unknown }).role;
  return typeof role === 'string' && role.trim().toLowerCase() === 'admin';
}

function emailIsAllowlisted(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return ADMIN_EMAIL_ALLOWLIST.some((e) => e.trim().toLowerCase() === normalized);
}

/** True when the given Clerk user should have admin powers. */
export function isAdminUser(user: AdminCheckUser): boolean {
  if (!user) return false;
  if (metadataRoleIsAdmin(user.publicMetadata)) return true;
  if (emailIsAllowlisted(user.primaryEmailAddress?.emailAddress)) return true;
  return false;
}
