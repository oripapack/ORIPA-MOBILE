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
 * Design reference:
 *   Phygitals          → large product visuals, clean grid, dark premium
 *   Nihon Toreca Center → category tabs, filter chips, remaining qty, sort
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "../../components/layout/AppHeader";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { BuybackBadge, StatusBadge, TrustBadge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { PackCard } from "../../components/pack/PackCard";
import { cn } from "../../components/utils/cn";
import type { PackCardData } from "../../components/pack/PackCard";

// ─────────────────────────────────────────────────────────────────────────────
// Extended type — page-local only; shared PackCard still uses PackCardData
// ─────────────────────────────────────────────────────────────────────────────

interface PacksPageData extends PackCardData {
  description: string;
  topCard: string;
  pullCount: number;
  isNew?: boolean;
  isLimitedTime?: boolean;
  priceRange: "budget" | "mid" | "premium";
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock catalog — 12 packs across all categories
// ─────────────────────────────────────────────────────────────────────────────

const ALL_PACKS: PacksPageData[] = [
  {
    id: "welcome-pack",
    name: "Welcome Pack",
    category: "Multi TCG",
    price: 5,
    buybackRate: 90,
    isFeatured: true,
    isNew: true,
    remainingFraction: 0.99,
    returnRate: 107,
    floorValue: 5,
    topHit: "Random Holo Rare",
    topHitValue: 28,
    tagline: "Perfect first pull · 90% buyback guaranteed",
    description: "Designed for first-time collectors. Guaranteed value above pack price with 90% instant buyback. No tricks, no pressure.",
    topCard: "Random Holo Rare",
    pullCount: 8_241,
    priceRange: "budget",
  },
  {
    id: "platinum-legacy",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    buybackRate: 80,
    isFeatured: true,
    remainingFraction: 0.80,
    returnRate: 84,
    floorValue: 5,
    topHit: "Charizard ex SAR",
    topHitValue: 649,
    tagline: "Graded slabs · alt-arts · trophy promos",
    description: "Sourced from verified distributors. Graded slabs, Japanese alt-arts, and trophy promos. PSA-authenticated from the moment you pull.",
    topCard: "Charizard ex SAR — $649",
    pullCount: 24_183,
    priceRange: "mid",
  },
  {
    id: "obsidian-flames",
    name: "Obsidian Flames Chase",
    category: "Pokémon TCG",
    price: 60,
    buybackRate: 80,
    remainingFraction: 0.43,
    returnRate: 91,
    floorValue: 8,
    topHit: "Charizard ex SAR",
    topHitValue: 649,
    tagline: "Charizard ex SAR in the prize pool",
    description: "High-stakes pulls from Obsidian Flames. Charizard ex SAR, Tyranitar ex SAR, and Iron Hands ex alt-art all in pool.",
    topCard: "Charizard ex SAR — $649",
    pullCount: 31_560,
    priceRange: "mid",
  },
  {
    id: "crown-zenith",
    name: "Crown Zenith Galarian",
    category: "Pokémon TCG",
    price: 15,
    buybackRate: 75,
    remainingFraction: 0.87,
    returnRate: 76,
    floorValue: 3,
    topHit: "Arceus VSTAR Gold",
    topHitValue: 75,
    tagline: "Galarian Gallery · VSTAR Universe",
    description: "Gallery rares, VSTAR Universe promos, and trainer gallery hits across the Crown Zenith set.",
    topCard: "Arceus VSTAR Gold — $75",
    pullCount: 12_047,
    priceRange: "budget",
  },
  {
    id: "evolving-skies",
    name: "Evolving Skies Premium",
    category: "Pokémon TCG",
    price: 50,
    buybackRate: 80,
    remainingFraction: 0.29,
    returnRate: 96,
    floorValue: 6,
    topHit: "Umbreon VMAX Alt Art",
    topHitValue: 380,
    isLimitedTime: true,
    tagline: "Umbreon VMAX Alt Art chase · Low stock",
    description: "The highest-demand Evolving Skies pulls available. Umbreon VMAX Alt Art, Rayquaza VMAX Alt Art, and more. 29% remaining.",
    topCard: "Umbreon VMAX Alt Art — $380",
    pullCount: 42_781,
    priceRange: "mid",
  },
  {
    id: "paldea-evolved",
    name: "Paldea Evolved Chase",
    category: "Pokémon TCG",
    price: 40,
    buybackRate: 80,
    remainingFraction: 0.52,
    returnRate: 82,
    floorValue: 5,
    topHit: "Mew ex Full Art",
    topHitValue: 55,
    tagline: "Iono Full Art · Mew ex Full Art",
    description: "Full-art trainers including Iono, Miriam, and Arven. Mew ex Full Art as the chase slot.",
    topCard: "Mew ex Full Art — $55",
    pullCount: 18_325,
    priceRange: "mid",
  },
  {
    id: "one-piece-op09",
    name: "OP-09 Mythic Seal",
    category: "One Piece TCG",
    price: 25,
    buybackRate: 75,
    remainingFraction: 0.91,
    returnRate: 78,
    floorValue: 4,
    topHit: "Monkey D. Luffy SR",
    topHitValue: 120,
    isNew: true,
    tagline: "Luffy & Zoro secret rares · New set",
    description: "Latest One Piece TCG set with Leaders and Secret Rares from the Nine Pirates arc. Newly added to Pull Hub.",
    topCard: "Monkey D. Luffy SR — $120",
    pullCount: 3_210,
    priceRange: "budget",
  },
  {
    id: "one-piece-op07",
    name: "OP-07 500-Year Future",
    category: "One Piece TCG",
    price: 35,
    buybackRate: 75,
    remainingFraction: 0.74,
    returnRate: 79,
    floorValue: 4,
    topHit: "Rob Lucci P-SAR",
    topHitValue: 95,
    tagline: "Egghead arc · Vegapunk leaders",
    description: "Top-tier leaders from the Egghead arc. Vegapunk-era leaders, Stussy Secret Rares, and Zoro parallel foils.",
    topCard: "Rob Lucci P-SAR — $95",
    pullCount: 9_412,
    priceRange: "mid",
  },
  {
    id: "yugioh-25th",
    name: "25th Anniversary Vault",
    category: "Yu-Gi-Oh!",
    price: 20,
    buybackRate: 70,
    remainingFraction: 0.66,
    returnRate: 72,
    floorValue: 3,
    topHit: "Blue-Eyes QC Secret Rare",
    topHitValue: 85,
    tagline: "Quarter century secret rares",
    description: "Exclusive 25th Anniversary reprints with quarter-century secret rare treatment. Blue-Eyes, Dark Magician, and Exodia sets.",
    topCard: "Blue-Eyes QCSR — $85",
    pullCount: 7_834,
    priceRange: "budget",
  },
  {
    id: "yugioh-duelist-nexus",
    name: "Duelist Nexus Ultra",
    category: "Yu-Gi-Oh!",
    price: 55,
    buybackRate: 70,
    isFeatured: false,
    remainingFraction: 0.95,
    returnRate: 68,
    floorValue: 4,
    topHit: "Purrely Delicious Memory",
    topHitValue: 140,
    isNew: true,
    tagline: "Prismatic Secret Rares · Ultra Rares",
    description: "Duelist Nexus complete set pulls. Ghost Rare and Prismatic Secret Rare slots. New stock — plentiful supply.",
    topCard: "Purrely Delicious Memory — $140",
    pullCount: 1_203,
    priceRange: "mid",
  },
  {
    id: "prizm-basketball",
    name: "Prizm Basketball Elite",
    category: "Sports Cards",
    price: 45,
    buybackRate: 80,
    isFeatured: true,
    remainingFraction: 0.55,
    returnRate: 88,
    floorValue: 5,
    topHit: "Wembanyama Prizm Auto RC",
    topHitValue: 450,
    tagline: "Prizm auto rookies · PSA graded",
    description: "Panini Prizm Basketball with rookie auto Prizms and PSA-graded veteran stars. Wembanyama and Spida Mitchell in pool.",
    topCard: "Wembanyama Prizm Auto RC — $450",
    pullCount: 15_629,
    priceRange: "mid",
  },
  {
    id: "prizm-football",
    name: "2023 Prizm Football",
    category: "Sports Cards",
    price: 30,
    buybackRate: 80,
    remainingFraction: 0.38,
    returnRate: 83,
    floorValue: 4,
    topHit: "CJ Stroud Prizm Auto RC",
    topHitValue: 200,
    tagline: "CJ Stroud · Bryce Young rookies",
    description: "2023 class rookie auto Prizms and veteran superstars. Silver Prizms, RPA autos, and graded Patrick Mahomes in pool.",
    topCard: "CJ Stroud Prizm Auto RC — $200",
    pullCount: 22_910,
    priceRange: "mid",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Filter / sort configuration
// ─────────────────────────────────────────────────────────────────────────────

type Category = "All" | "Pokémon TCG" | "One Piece TCG" | "Yu-Gi-Oh!" | "Sports Cards";
type SortKey  = "featured" | "price_asc" | "price_desc" | "low_stock";
type PriceRange = "all" | "budget" | "mid" | "premium";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "All",         label: "All Packs" },
  { key: "Pokémon TCG", label: "Pokémon"   },
  { key: "One Piece TCG",label: "One Piece" },
  { key: "Yu-Gi-Oh!",  label: "Yu-Gi-Oh!" },
  { key: "Sports Cards",label: "Sports"    },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured",   label: "Featured"  },
  { key: "price_asc",  label: "Price ↑"   },
  { key: "price_desc", label: "Price ↓"   },
  { key: "low_stock",  label: "Low Stock" },
];

const PRICE_RANGES: { key: PriceRange; label: string }[] = [
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

function FeaturedBanner({ pack, onOpen }: { pack: PacksPageData; onOpen: () => void }) {
  const urgency = pack.remainingFraction !== undefined && pack.remainingFraction < 0.35;

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
              {pack.buybackRate !== undefined && (
                <BuybackBadge rate={pack.buybackRate} />
              )}
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
            {pack.remainingFraction !== undefined && (
              <ProgressBar
                value={pack.remainingFraction}
                label="Remaining inventory"
                sublabel={`${Math.round(pack.remainingFraction * 100)}% left · ${pack.pullCount.toLocaleString("en-US")} pulled`}
                color={urgency ? "red" : "green"}
              />
            )}

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
              <Button
                variant="primary"
                size="md"
                onClick={onOpen}
                className="flex-1 sm:flex-none"
              >
                Open Pack
              </Button>
              <Button variant="secondary" size="md" onClick={onOpen}>
                Details
              </Button>
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
  const [category,   setCategory]   = useState<Category>("All");
  const [sortKey,    setSortKey]    = useState<SortKey>("featured");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filteredPacks = useMemo<PacksPageData[]>(() => {
    let packs = ALL_PACKS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (priceRange !== "all" && p.priceRange !== priceRange) return false;
      return true;
    });

    switch (sortKey) {
      case "price_asc":  packs = [...packs].sort((a, b) => a.price - b.price); break;
      case "price_desc": packs = [...packs].sort((a, b) => b.price - a.price); break;
      case "low_stock":  packs = [...packs].sort((a, b) => (a.remainingFraction ?? 1) - (b.remainingFraction ?? 1)); break;
      default:           packs = [...packs].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
    }

    return packs;
  }, [category, sortKey, priceRange]);

  const featuredPack = useMemo<PacksPageData | undefined>(
    () => (category === "All" ? ALL_PACKS.find((p) => p.isFeatured && p.id === "platinum-legacy") : undefined),
    [category],
  );

  const gridPacks = useMemo<PacksPageData[]>(
    () => filteredPacks.filter((p) => !(category === "All" && p.id === featuredPack?.id)),
    [filteredPacks, featuredPack, category],
  );

  const resetFilters = () => {
    setCategory("All");
    setSortKey("featured");
    setPriceRange("all");
  };

  const openPack = () => {
    window.location.href = "/pack-detail";
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
            {/* Category chips */}
            {CATEGORIES.map(({ key, label }) => (
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
                active={priceRange === key}
                onClick={() => setPriceRange(key)}
                accent
              >
                {label}
              </FilterChip>
            ))}

            {/* Active filter count badge */}
            {(category !== "All" || sortKey !== "featured" || priceRange !== "all") && (
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
      <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">

        {/* ── Featured banner (All tab only) ── */}
        {featuredPack && (
          <section className="mb-8" aria-label="Featured pack">
            <FeaturedBanner pack={featuredPack} onOpen={openPack} />
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
                  onClick={openPack}
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
    </div>
  );
}
