"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";

// ── Icons ────────────────────────────────────────────────────────────────────

function ShopIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 6h14l-1.5 9H4.5L3 6z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.4}
        fill={filled ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
      <path
        d="M7 6V4.5a3 3 0 016 0V6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VaultIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2L3 6.5v5.5c0 3.5 3 6.5 7 6.5s7-3 7-6.5V6.5L10 2z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={filled ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
      {filled ? (
        <path d="M7 10l2.2 2L13 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7 10l2.2 2L13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function HomeIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 9L10 3l7 6v8a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.4}
        fill={filled ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
      {!filled && (
        <path d="M7 17v-5h6v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function AccountIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle
        cx="10" cy="7" r="3.25"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M3.5 17c0-3 2.9-5.5 6.5-5.5S16.5 14 16.5 17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Tabs config ───────────────────────────────────────────────────────────────
// Order mirrors mobile: Shop / Vault / Home (center) / Account

const TABS = [
  { id: "shop",    label: "Shop",    href: "/packs",   Icon: ShopIcon    },
  { id: "vault",   label: "Vault",   href: "/vault",   Icon: VaultIcon   },
  { id: "home",    label: "Home",    href: "/",        Icon: HomeIcon    },
  { id: "account", label: "Account", href: "/sign-in", Icon: AccountIcon },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-ph-border",
        "bg-ph-bg/95 backdrop-blur-md",
        "pb-[env(safe-area-inset-bottom)]",
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const filled = isActive(tab.href, pathname);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={filled ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1",
                "py-3 outline-none",
                "transition-colors duration-[150ms] ease-out",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ph-green",
                filled ? "text-ph-green" : "text-ph-text-muted hover:text-ph-text-sec",
              )}
            >
              <span className="relative">
                <tab.Icon filled={filled} />
                {filled && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-ph-green" />
                )}
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
