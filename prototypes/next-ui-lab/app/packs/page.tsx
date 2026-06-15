"use client";

/**
 * Pull Hub — Packs List Screen  (/packs)
 *
 * Sections:
 *   1. AppHeader        sticky nav + breadcrumb
 *   2. PageIntro        title, lead, live count
 *   3. FilterBar        category chips + sort chips + price-range chips (sticky)
 *   4. FeaturedBanner   wide hero card for the top featured pack (All tab only)
 *   5. PackGrid         2→3→4 column grid of PackCards
 *   6. EmptyState       zero-results fallback
 *   7. TrustStrip       credibility row
 *
 * Data: shared CATALOG_PACKS (same source as mobile Expo app)
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNav } from "../../components/layout/BottomNav";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { BuybackBadge, StatusBadge, TrustBadge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PackCard } from "../../components/pack/PackCard";
import { cn } from "../../components/utils/cn";
import {
  CATALOG_PACKS,
  CATALOG_CATEGORIES,
  getFeaturedPack,
} from "@/data/catalog";
import type { CatalogPack, CatalogCategoryFilter } from "@/data/catalog";

// ─────────────────────────────────────────────────────────────────────────────
// Adapter — CatalogPack → shape expected by PackCard + FeaturedBanner
// Parses "CardName — $value" topCard string into separate topHit / topHitValue.
// ─────────────────────────────────────────────────────────────────────────────

type AdaptedPack = CatalogPack & { topHit?: string; topHitValue?: number };

function adaptPack(c: CatalogPack): AdaptedPack {
  const m = c.topCard.match(/^(.+?) — \$(\d[\d,]*)$/);
  return {
    ...c,
    topHit:      m ? m[1].trim() : undefined,
    topHitValue: m ? Number(m[2].replace(/,/g, "")) : undefined,
  };
}

const ADAPTED_PACKS: AdaptedPack[] = CATALOG_PACKS.map(adaptPack);

// ─────────────────────────────────────────────────────────────────────────────
// Filter / sort configuration
// ─────────────────────────────────────────────────────────────────────────────

type SortKey    = "featured" | "price_asc" | "price_desc" | "low_stock";
type PriceFilter = "all" | "budget" | "mid" | "premium";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured",   label: "Featured"  },
  { key: "price_asc",  label: "Price ↑"   },
  { key: "price_desc", label: "Price ↓"   },
  { key: "low_stock",  label: "Low Stock" },
];

const PRICE_RANGES: { key: PriceFilter; label: string }[] = [
  { key: "all",     label: "Any price" },
  { key: "budget",  label: "Under $25" },
  { key: "mid",     label: "$25 – $75" },
  { key: "premium", label: "$75+"      },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: colour-coded art placeholder
// ─────────────────────────────────────────────────────────────────────────────

function categoryGradient(cat: string): string {
  if (cat.includes("Pokémon"))    return "from-ph-epic-bg    to-ph-surface";
  if (cat.includes("One Piece"))  return "from-ph-rare-bg    to-ph-surface";
  if (cat.includes("Yu-Gi-Oh"))   return "from-ph-legendary-bg to-ph-surface";
  if (cat.includes("Sports"))     return "from-ph-mythic-bg  to-ph-surface";
  return                                  "from-ph-surface-high to-ph-surface";
}

// ─────────────────────────────────────────────────────────────────────────────
// FeaturedBanner — wide horizontal card for the top featured pack
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedBanner({ pack }: { pack: AdaptedPack }) {
  const urgency = pack.remainingFraction < 0.35;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-ph-2xl border bg-ph-surface shadow-ph-card",
        urgency ? "border-ph-red/30" : "border-ph-border-md",
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Art — full width mobile, fixed width desktop */}
        <div
          className={cn(
            "relative h-48 flex-shrink-0 overflow-hidden",
            "sm:h-auto sm:w-56",
            "bg-gradient-to-b",
            categoryGradient(pack.category),
          )}
        >
          {/* Decorative pack shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="h-28 w-20 rounded-ph-lg border border-ph-border-md bg-ph-surface-raise shadow-ph-card" />
              <div className="absolute -right-3 -top-2 h-28 w-20 rounded-ph-lg border border-ph-border bg-ph-surface opacity-50" />
            </div>
          </div>
          {/* Badges */}
          <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
            {pack.isFeatured    && <StatusBadge variant="featured">Featured</StatusBadge>}
            {pack.isNew         && <StatusBadge variant="success">New</StatusBadge>}
            {pack.isLimitedTime && <StatusBadge variant="warning">Limited</StatusBadge>}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ph-text-muted">
                {pack.category}
              </span>
              <BuybackBadge rate={pack.buybackRate} />
            </div>

            <h2 className="text-xl font-black tracking-tight text-ph-text sm:text-2xl">
              {pack.name}
            </h2>
            <p className="text-sm leading-relaxed text-ph-text-sec">
              {pack.description}
            </p>

            {/* Top card preview */}
            <div className="flex items-center gap-2 rounded-ph-md border border-ph-border bg-ph-surface-high px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
                Top hit
              </span>
              <span className="text-xs font-bold text-ph-text">{pack.topCard}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Remaining */}
            <ProgressBar
              value={pack.remainingFraction}
              label="Remaining inventory"
              sublabel={`${Math.round(pack.remainingFraction * 100)}% left · ${pack.pullCount.toLocaleString("en-US")} pulled`}
              color={urgency ? "red" : "green"}
            />

            {/* Price + CTA row */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
                  From
                </p>
                <p className="text-2xl font-black tracking-tight text-ph-text">
                  ${pack.price}
                </p>
              </div>
              <Link
                href={`/opening?packId=${pack.id}`}
                className="flex flex-1 items-center justify-center rounded-ph-md bg-ph-green px-5 py-3 text-sm font-bold text-ph-green-ink shadow-ph-cta transition-all duration-[150ms] ease-out hover:bg-ph-green-hover sm:flex-none"
              >
                Open Pack
              </Link>
              <Link
                href={`/pack-detail?packId=${pack.id}`}
                className="flex items-center justify-center rounded-ph-md border border-ph-border-md bg-ph-surface-high px-5 py-3 text-sm font-semibold text-ph-text-sec transition-colors duration-[150ms] ease-out hover:border-ph-border-high hover:text-ph-text"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter chip — reusable within this page
// ─────────────────────────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-shrink-0 rounded-ph-pill px-3.5 py-1.5",
        "text-xs font-semibold whitespace-nowrap",
        "border outline-none ph-transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ph-green",
        active
          ? accent
            ? "border-ph-green/40 bg-ph-green-soft text-ph-green"
            : "border-ph-border-high bg-ph-surface-raise text-ph-text"
          : "border-ph-border bg-ph-surface text-ph-text-muted hover:border-ph-border-md hover:text-ph-text-sec",
      )}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <SurfaceCard padding="lg" className="py-16 text-center">
      <p className="mb-2 text-4xl" aria-hidden>🔍</p>
      <h3 className="mb-2 text-base font-bold text-ph-text">No packs match</h3>
      <p className="mb-6 text-sm text-ph-text-sec">
        Try a different category, price range, or sort order.
      </p>
      <Button variant="secondary" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust strip
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "✓",  label: "Verified inventory"  },
  { icon: "◎",  label: "Transparent odds"    },
  { icon: "🏛", label: "Vault storage"       },
  { icon: "📦", label: "Ships worldwide"     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function PacksPage() {
  const router = useRouter();

  const [category,    setCategory]    = useState<CatalogCategoryFilter>("All");
  const [sortKey,     setSortKey]     = useState<SortKey>("featured");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filteredPacks = useMemo<AdaptedPack[]>(() => {
    let packs = ADAPTED_PACKS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (priceFilter !== "all" && p.priceRange !== priceFilter) return false;
      return true;
    });

    switch (sortKey) {
      case "price_asc":  packs = [...packs].sort((a, b) => a.price - b.price); break;
      case "price_desc": packs = [...packs].sort((a, b) => b.price - a.price); break;
      case "low_stock":  packs = [...packs].sort((a, b) => a.remainingFraction - b.remainingFraction); break;
      default:           packs = [...packs].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
    }

    return packs;
  }, [category, sortKey, priceFilter]);

  const featuredPack = useMemo<AdaptedPack | undefined>(
    () => category === "All" ? adaptPack(getFeaturedPack()) : undefined,
    [category],
  );

  const gridPacks = useMemo<AdaptedPack[]>(
    () => filteredPacks.filter((p) => !(category === "All" && p.id === featuredPack?.id)),
    [filteredPacks, featuredPack, category],
  );

  const resetFilters = () => {
    setCategory("All");
    setSortKey("featured");
    setPriceFilter("all");
  };

  return (
    <div className="min-h-dvh bg-ph-bg text-ph-text">
      {/* ── Sticky header ── */}
      <AppHeader
        crumbs={[{ label: "Packs" }]}
        credits={12_500}
      />

      {/* ── Page intro ── */}
      <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-10 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
              Mystery Packs
            </p>
            <h1 className="text-3xl font-black tracking-tight text-ph-text sm:text-4xl">
              Open a Pack
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-ph-text-sec">
              Transparent odds · Real authenticated cards · Up to 90% buyback
            </p>
          </div>
          <p className="text-sm font-semibold tabular-nums text-ph-text-muted">
            {filteredPacks.length} pack{filteredPacks.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <div
        className={cn(
          "sticky top-14 z-30",
          "border-b border-ph-border",
          "bg-ph-bg/95 backdrop-blur-md",
        )}
      >
        <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6">

          {/* Row 1: categories + sort */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {/* Category chips — sourced from shared CATALOG_CATEGORIES */}
            {CATALOG_CATEGORIES.map(({ key, label }) => (
              <FilterChip
                key={key}
                active={category === key}
                onClick={() => setCategory(key)}
              >
                {label}
              </FilterChip>
            ))}

            {/* Divider */}
            <span className="mx-1 h-4 w-px flex-shrink-0 bg-ph-border" aria-hidden />

            {/* Sort chips */}
            {SORT_OPTIONS.map(({ key, label }) => (
              <FilterChip
                key={key}
                active={sortKey === key}
                onClick={() => setSortKey(key)}
              >
                {label}
              </FilterChip>
            ))}
          </div>

          {/* Row 2: price range */}
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
              Price
            </span>
            {PRICE_RANGES.map(({ key, label }) => (
              <FilterChip
                key={key}
                active={priceFilter === key}
                onClick={() => setPriceFilter(key)}
                accent
              >
                {label}
              </FilterChip>
            ))}

            {/* Active filter clear */}
            {(category !== "All" || sortKey !== "featured" || priceFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto flex-shrink-0 rounded-ph-pill border border-ph-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-ph-text-muted hover:text-ph-text-sec ph-transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <main className="mx-auto max-w-screen-xl px-4 py-8 pb-28 sm:px-6">

        {/* ── Featured banner (All tab only) ── */}
        {featuredPack && (
          <section className="mb-8" aria-label="Featured pack">
            <FeaturedBanner pack={featuredPack} />
          </section>
        )}

        {/* ── Pack grid ── */}
        {gridPacks.length > 0 ? (
          <section aria-label="Pack catalog">
            <SectionHeader
              eyebrow={category === "All" ? "All Packs" : category}
              title={
                category === "All"
                  ? "Full catalog"
                  : `${category} packs`
              }
              lead={
                sortKey === "low_stock"
                  ? "Sorted by remaining inventory — grab these before they're gone."
                  : sortKey === "price_asc"
                  ? "Sorted by price, lowest first."
                  : sortKey === "price_desc"
                  ? "Sorted by price, highest first."
                  : "Curated featured packs first."
              }
              className="mb-5"
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {gridPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  onClick={() => router.push(`/pack-detail?packId=${pack.id}`)}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState onReset={resetFilters} />
        )}

        {/* ── Trust strip ── */}
        <section
          className="mt-16 flex flex-wrap justify-center gap-3"
          aria-label="Trust indicators"
        >
          {TRUST_ITEMS.map((item) => (
            <TrustBadge key={item.label} icon={item.icon} label={item.label} />
          ))}
        </section>

        {/* ── Pull count social proof ── */}
        <div className="mt-8 text-center">
          <p className="text-xs text-ph-text-muted">
            2,000,000+ packs opened by 100,000+ collectors ·{" "}
            <Link
              href="/"
              className="underline hover:text-ph-text-sec ph-transition-colors"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
