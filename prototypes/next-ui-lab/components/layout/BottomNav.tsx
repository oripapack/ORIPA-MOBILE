"use client";

import { cn } from "../utils/cn";

type TabId = "home" | "packs" | "vault" | "account";

interface NavTab {
  id: TabId;
  label: string;
  icon: (filled: boolean) => React.ReactNode;
}

// ── Minimal inline SVG icons ─────────────────────────────────────────────────

function HomeIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        fill={filled ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
      {!filled && (
        <path d="M7 18v-5h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function PacksIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect
        x="3" y="3" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
      <rect
        x="11" y="3" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
      <rect
        x="3" y="11" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
      <rect
        x="11" y="11" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function VaultIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2L3 6v5c0 3.87 3.13 7 7 7s7-3.13 7-7V6l-7-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
      {filled && (
        <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {!filled && (
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function AccountIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle
        cx="10" cy="7" r="3.25"
        stroke="currentColor" strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M3.5 17c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface BottomNavProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

const TABS: NavTab[] = [
  {
    id: "home",
    label: "Home",
    icon: (filled: boolean) => <HomeIcon filled={filled} />,
  },
  {
    id: "packs",
    label: "Packs",
    icon: (filled: boolean) => <PacksIcon filled={filled} />,
  },
  {
    id: "vault",
    label: "Vault",
    icon: (filled: boolean) => <VaultIcon filled={filled} />,
  },
  {
    id: "account",
    label: "Account",
    icon: (filled: boolean) => <AccountIcon filled={filled} />,
  },
] as const;

export function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-ph-border",
        "bg-ph-bg/95 backdrop-blur-md",
        // Safe area for notched devices
        "pb-[env(safe-area-inset-bottom)]",
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1",
                "py-3 outline-none",
                "ph-transition-colors",
                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ph-green",
                isActive ? "text-ph-green" : "text-ph-text-muted hover:text-ph-text-sec",
              )}
            >
              {/* Icon */}
              <span className="relative">
                {tab.icon(isActive)}
                {/* Active underline dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-ph-green" />
                )}
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
