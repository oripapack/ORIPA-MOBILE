import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

// ── Rarity badge ──────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

const RARITY_CLASSES: Record<Rarity, string> = {
  common:    "bg-ph-common-bg    border-ph-common-border    text-ph-common",
  rare:      "bg-ph-rare-bg      border-ph-rare-border      text-ph-rare",
  epic:      "bg-ph-epic-bg      border-ph-epic-border      text-ph-epic",
  legendary: "bg-ph-legendary-bg border-ph-legendary-border text-ph-legendary",
  mythic:    "bg-ph-mythic-bg    border-ph-mythic-border    text-ph-mythic",
};

const RARITY_LABEL: Record<Rarity, string> = {
  common:    "Common",
  rare:      "Rare",
  epic:      "Epic",
  legendary: "Legendary",
  mythic:    "Mythic",
};

interface RarityBadgeProps {
  rarity: Rarity;
  /** Show the coloured dot indicator */
  showDot?: boolean;
  /** Compact size — smaller padding and font */
  small?: boolean;
  className?: string;
}

export function RarityBadge({ rarity, showDot = true, small = false, className }: RarityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-ph-pill border whitespace-nowrap",
        "font-bold uppercase tracking-wide",
        small
          ? "px-2 py-px text-[9px]"
          : "px-2.5 py-0.5 text-[10px]",
        RARITY_CLASSES[rarity],
        className,
      )}
    >
      {showDot && (
        <span className={cn("rounded-full bg-current flex-shrink-0", small ? "h-1 w-1" : "h-1.5 w-1.5")} />
      )}
      {RARITY_LABEL[rarity]}
    </span>
  );
}

// ── Trust badge ────────────────────────────────────────────────────────────────

interface TrustBadgeProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
}

export function TrustBadge({ icon, label, className, ...props }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        "rounded-ph-lg border border-ph-border bg-ph-surface",
        "px-3 py-2",
        className,
      )}
      {...props}
    >
      <span className="text-ph-text-sec text-sm flex-shrink-0">{icon}</span>
      <span className="text-xs font-semibold text-ph-text-sec">{label}</span>
    </div>
  );
}

// ── Generic status badge ────────────────────────────────────────────────────────

type StatusVariant = "success" | "warning" | "error" | "neutral" | "featured";

const STATUS_CLASSES: Record<StatusVariant, string> = {
  success:  "bg-ph-green-soft  border-ph-green-border  text-ph-green",
  warning:  "bg-ph-red-soft    border-ph-red-border    text-ph-red",
  error:    "bg-ph-red-soft    border-ph-red-border    text-ph-red",
  neutral:  "bg-ph-surface     border-ph-border        text-ph-text-sec",
  featured: "bg-ph-epic-bg     border-ph-epic-border   text-ph-epic",
};

interface StatusBadgeProps {
  variant?: StatusVariant;
  className?: string;
  children: React.ReactNode;
}

export function StatusBadge({ variant = "neutral", className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "rounded-ph-pill border px-2.5 py-0.5",
        "text-[10px] font-bold uppercase tracking-wide whitespace-nowrap",
        STATUS_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── Buyback badge ─────────────────────────────────────────────────────────────
// Specific badge shown on pack cards: "80% Buyback"

interface BuybackBadgeProps {
  rate: number;
  className?: string;
}

export function BuybackBadge({ rate, className }: BuybackBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "rounded-ph-pill border border-ph-green-border bg-ph-green-soft",
        "px-2.5 py-0.5",
        "text-[10px] font-bold text-ph-green uppercase tracking-wide whitespace-nowrap",
        className,
      )}
    >
      {rate}% Buyback
    </span>
  );
}
