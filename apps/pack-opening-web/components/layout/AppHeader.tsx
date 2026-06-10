"use client";

import Link from "next/link";
import { cn } from "../utils/cn";

interface Crumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  /** Breadcrumb trail. Last item is the current page (no link needed). */
  crumbs?: Crumb[];
  /** Current credits balance to display in the pill. Hide if undefined. */
  credits?: number;
  className?: string;
}

/** Coin icon — inline SVG, no external dependency */
function CoinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="7"
        y="10.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fill="currentColor"
        fontFamily="system-ui"
      >
        $
      </text>
    </svg>
  );
}

export function AppHeader({ crumbs, credits, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "border-b border-ph-border",
        "bg-ph-bg/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Left — logo + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          {/* Wordmark */}
          <Link
            href="/"
            className="flex-shrink-0 text-base font-black tracking-tight text-ph-text outline-none focus-visible:ring-2 focus-visible:ring-ph-green rounded"
          >
            Pull<span className="text-ph-green">Hub</span>
          </Link>

          {/* Breadcrumb */}
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1">
              {crumbs.map((crumb, i) => (
                <span key={i} className="flex min-w-0 items-center gap-1">
                  <span className="text-ph-border select-none" aria-hidden>›</span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="truncate text-xs text-ph-text-muted hover:text-ph-text-sec ph-transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ph-green rounded"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate text-xs font-semibold text-ph-text-sec">
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Right — credits pill */}
        {credits !== undefined && (
          <div
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5",
              "rounded-ph-pill border border-ph-border bg-ph-surface",
              "px-3 py-1.5",
            )}
          >
            <CoinIcon />
            <span className="text-xs font-bold tabular-nums text-ph-text">
              {credits.toLocaleString("en-US")}
            </span>
            <span className="text-[10px] text-ph-text-muted">cr</span>
          </div>
        )}
      </div>
    </header>
  );
}
