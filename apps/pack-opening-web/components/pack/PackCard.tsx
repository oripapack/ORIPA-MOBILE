"use client";

import { cn } from "../utils/cn";
import { BuybackBadge, StatusBadge } from "../ui/Badge";

export interface PackCardData {
  id: string;
  name: string;
  category: string;
  /** USD price for the default tier */
  price: number;
  /** 0–100 buyback guarantee rate. Omit to hide badge. */
  buybackRate?: number;
  /** Shows "Featured" pill */
  isFeatured?: boolean;
  /** Remaining as a fraction 0–1 for the inventory strip */
  remainingFraction?: number;
  /** Short description (1 line max) */
  tagline?: string;
}

interface PackCardProps {
  pack: PackCardData;
  onClick?: () => void;
  className?: string;
}

/** Visual placeholder used when no real image is provided */
function PackArtPlaceholder({ category }: { category: string }) {
  // Category → subtle accent color for the gradient
  const isEpic    = category.toLowerCase().includes("pokemon");
  const isRare    = category.toLowerCase().includes("one piece");
  const isMythic  = category.toLowerCase().includes("sports");

  const gradientClass = isEpic
    ? "from-ph-epic-bg to-ph-surface"
    : isRare
    ? "from-ph-rare-bg to-ph-surface"
    : isMythic
    ? "from-ph-mythic-bg to-ph-surface"
    : "from-ph-surface-high to-ph-surface";

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2",
        "bg-gradient-to-b",
        gradientClass,
      )}
      aria-hidden
    >
      {/* Decorative pack shape */}
      <div className="h-16 w-12 rounded-ph-md border border-ph-border bg-ph-surface-raise opacity-60" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-ph-text-muted opacity-50">
        {category}
      </span>
    </div>
  );
}

export function PackCard({ pack, onClick, className }: PackCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "rounded-ph-xl border border-ph-border bg-ph-surface",
        "ph-transition shadow-ph-card",
        isClickable &&
          "cursor-pointer hover:border-ph-border-md hover:shadow-ph-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ph-green focus-visible:ring-offset-2 focus-visible:ring-offset-ph-bg active:translate-y-0 active:shadow-ph-card",
        className,
      )}
    >
      {/* ── Pack art area (3:4 ratio) ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ph-surface-high">
        <PackArtPlaceholder category={pack.category} />

        {/* Badges overlay — top-right */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {pack.isFeatured && (
            <StatusBadge variant="featured">Featured</StatusBadge>
          )}
          {pack.buybackRate !== undefined && (
            <BuybackBadge rate={pack.buybackRate} />
          )}
        </div>

        {/* Bottom gradient fade for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ph-surface to-transparent" />
      </div>

      {/* ── Info strip ── */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* Category label */}
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ph-text-muted">
          {pack.category}
        </p>

        {/* Pack name */}
        <p className="text-sm font-bold leading-snug text-ph-text line-clamp-2">
          {pack.name}
        </p>

        {/* Tagline */}
        {pack.tagline && (
          <p className="text-xs text-ph-text-muted line-clamp-1">{pack.tagline}</p>
        )}

        {/* Price + inventory strip */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-base font-black tracking-tight text-ph-text">
            ${pack.price}
          </span>
          {pack.remainingFraction !== undefined && (
            <span className="text-[10px] text-ph-text-muted tabular-nums">
              {Math.round(pack.remainingFraction * 100)}% left
            </span>
          )}
        </div>

        {/* Remaining inventory bar */}
        {pack.remainingFraction !== undefined && (
          <div className="h-1 w-full overflow-hidden rounded-ph-pill bg-ph-surface-high">
            <div
              className="h-full rounded-ph-pill bg-ph-green"
              style={{ width: `${(pack.remainingFraction * 100).toFixed(1)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
