"use client";

import { cn } from "../utils/cn";

export interface PriceTier {
  id: string;
  label: string;
  /** Credits required to open this tier */
  credits: number;
  /** Display price in USD */
  usd: number;
  /** Optional short badge: "Popular", "Best Value", etc. */
  badge?: string;
}

interface PriceTierSelectorProps {
  tiers: PriceTier[];
  selected: string;
  onSelect: (id: string) => void;
  /** Number of columns on small screens (default 2) */
  cols?: 2 | 3;
  className?: string;
}

export function PriceTierSelector({
  tiers,
  selected,
  onSelect,
  cols = 2,
  className,
}: PriceTierSelectorProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        cols === 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3",
        className,
      )}
    >
      {tiers.map((tier) => {
        const isActive = tier.id === selected;
        return (
          <button
            key={tier.id}
            type="button"
            onClick={() => onSelect(tier.id)}
            aria-pressed={isActive}
            className={cn(
              // Base
              "relative rounded-ph-lg border px-3 py-2.5 text-left",
              "ph-transition outline-none",
              "focus-visible:ring-2 focus-visible:ring-ph-green focus-visible:ring-offset-2 focus-visible:ring-offset-ph-bg",
              // Active vs idle
              isActive
                ? "border-ph-border-high bg-ph-surface-raise"
                : "border-ph-border bg-ph-surface hover:border-ph-border-md hover:bg-ph-surface-high",
            )}
          >
            {/* Badge (e.g. "Popular") */}
            {tier.badge && (
              <span
                className={cn(
                  "absolute -top-2 right-2",
                  "rounded-ph-pill px-1.5 py-0.5",
                  "text-[9px] font-black uppercase tracking-wide",
                  tier.badge === "Popular"
                    ? "bg-ph-green text-ph-green-ink"
                    : "bg-ph-amber text-ph-amber-ink",
                )}
              >
                {tier.badge}
              </span>
            )}

            {/* Tier label */}
            <p
              className={cn(
                "mb-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isActive ? "text-ph-text-sec" : "text-ph-text-muted",
              )}
            >
              {tier.label}
            </p>

            {/* USD price */}
            <p
              className={cn(
                "text-lg font-black leading-none tracking-tight",
                isActive ? "text-ph-text" : "text-ph-text-sec",
              )}
            >
              ${tier.usd}
            </p>

            {/* Credits */}
            <p className="mt-0.5 text-[10px] tabular-nums text-ph-text-muted">
              {tier.credits.toLocaleString("en-US")} credits
            </p>
          </button>
        );
      })}
    </div>
  );
}
