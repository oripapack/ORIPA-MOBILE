"use client";

/**
 * Pull Hub — Home Screen
 *
 * Sections (top → bottom):
 *   1. AppHeader  (sticky)
 *   2. Hero       — headline, CTA, trust line
 *   3. Featured Packs — category chips + pack grid
 *   4. Recent Pulls   — live social proof feed
 *   5. How It Works   — 3-step explainer
 *   6. Trust strip    — credibility section
 *   7. Dev footer     — Pack Opening Engine link (preserved for dev)
 *
 * Design references:
 *   Phygitals          → hero layout, pack grid, recent pulls, how-it-works cards
 *   Nihon Toreca Center → category tabs, campaign structure, featured sections
 */

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "../components/layout/AppHeader";
import { Button } from "../components/ui/Button";
import { SurfaceCard } from "../components/ui/SurfaceCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { RarityBadge, TrustBadge, BuybackBadge } from "../components/ui/Badge";
import { PackCard } from "../components/pack/PackCard";
import { cn } from "../components/utils/cn";
import type { PackCardData } from "../components/pack/PackCard";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — no real API wired yet
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Pokémon", "One Piece", "Yu-Gi-Oh!", "Sports Cards"];

const FEATURED_PACKS: PackCardData[] = [
  {
    id: "platinum-legacy",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    buybackRate: 80,
    isFeatured: true,
    remainingFraction: 0.80,
    tagline: "Graded slabs, alt-arts, trophy promos",
  },
  {
    id: "obsidian-flames",
    name: "Obsidian Flames Chase",
    category: "Pokémon TCG",
    price: 60,
    buybackRate: 80,
    remainingFraction: 0.43,
    tagline: "Charizard ex SAR in the pool",
  },
  {
    id: "one-piece-op09",
    name: "OP-09 Mythic Seal",
    category: "One Piece TCG",
    price: 25,
    buybackRate: 75,
    remainingFraction: 0.91,
    tagline: "Luffy & Zoro secret rares",
  },
  {
    id: "evolving-skies",
    name: "Evolving Skies Premium",
    category: "Pokémon TCG",
    price: 50,
    buybackRate: 80,
    remainingFraction: 0.29,
    tagline: "Umbreon VMAX Alt Art chase",
  },
  {
    id: "yugioh-25th",
    name: "25th Anniversary Vault",
    category: "Yu-Gi-Oh!",
    price: 20,
    buybackRate: 70,
    remainingFraction: 0.66,
    tagline: "Quarter century secret rares",
  },
  {
    id: "sports-prizm",
    name: "Prizm Basketball Elite",
    category: "Sports Cards",
    price: 45,
    buybackRate: 80,
    isFeatured: true,
    remainingFraction: 0.55,
    tagline: "Prizm auto rookies in the mix",
  },
];

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

interface RecentPull {
  id: string;
  username: string;
  card: string;
  rarity: Rarity;
  pack: string;
  value: string;
  timeAgo: string;
}

const RECENT_PULLS: RecentPull[] = [
  { id: "r1", username: "trainer_alex",    card: "Charizard ex SAR",      rarity: "mythic",    pack: "Platinum Legacy",      value: "$649", timeAgo: "2m ago"  },
  { id: "r2", username: "casey_m",         card: "Umbreon VMAX Alt Art",  rarity: "legendary", pack: "Evolving Skies",        value: "$380", timeAgo: "5m ago"  },
  { id: "r3", username: "ryu_tcg",         card: "Iono Full Art",         rarity: "rare",      pack: "Paldea Evolved",        value: "$22",  timeAgo: "9m ago"  },
  { id: "r4", username: "mika_pulls",      card: "Mew ex Full Art",       rarity: "epic",      pack: "Paldea Evolved",        value: "$55",  timeAgo: "12m ago" },
  { id: "r5", username: "jake_collector",  card: "Pikachu VMAX Rainbow",  rarity: "legendary", pack: "Vivid Voltage",         value: "$280", timeAgo: "15m ago" },
  { id: "r6", username: "sam_r",           card: "Arceus VSTAR Gold",     rarity: "epic",      pack: "Crown Zenith",          value: "$75",  timeAgo: "20m ago" },
  { id: "r7", username: "blastoise_bro",   card: "Trainer Gallery Rare",  rarity: "rare",      pack: "Crown Zenith Galarian", value: "$48",  timeAgo: "24m ago" },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Open a pack",
    body: "Choose from Pokémon, One Piece, sports cards, and more. Every pack contains a random graded card with live odds and transparent pulls powered by verified inventory.",
    cta: "Browse packs",
    href: "/pack-detail",
  },
  {
    step: "02",
    title: "Reveal your card",
    body: "Tap to reveal what you pulled. Every card is real — sourced from PSA, Fanatics, and Alt — and fully insured from the moment you own it.",
    cta: "See the opening flow",
    href: "/pack-detail",
  },
  {
    step: "03",
    title: "Keep, ship, or cash out",
    body: "Hold your card in the vault, flip it on the marketplace, or redeem — and we'll ship the physical slab to your door. Up to 80% instant buyback.",
    cta: "Ships worldwide",
    href: "/pack-detail",
  },
];

const TRUST_BADGES = [
  { icon: "✓", label: "Verified inventory" },
  { icon: "◎", label: "Transparent odds" },
  { icon: "🏛", label: "Vault storage" },
  { icon: "📦", label: "Ships worldwide" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Horizontal scrollable pack row — mobile-first */
function PackRow({ packs }: { packs: PackCardData[] }) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4"
      style={{ scrollbarWidth: "none" }}
    >
      {packs.map((pack) => (
        <div key={pack.id} className="w-44 flex-shrink-0 sm:w-auto">
          <PackCard
            pack={pack}
            onClick={() => {
              // In production: navigate to /pack/[id]
              // For demo: go to pack-detail prototype
              window.location.href = "/pack-detail";
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** Single recent pull card */
function RecentPullCard({ pull }: { pull: RecentPull }) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-48",
        "rounded-ph-xl border border-ph-border bg-ph-surface",
        "p-3 flex flex-col gap-2",
      )}
    >
      {/* Rarity + time */}
      <div className="flex items-center justify-between gap-1">
        <RarityBadge rarity={pull.rarity} />
        <span className="text-[10px] text-ph-text-muted">{pull.timeAgo}</span>
      </div>

      {/* Card name */}
      <p className="text-xs font-bold leading-snug text-ph-text line-clamp-2">
        {pull.card}
      </p>

      {/* Pack name */}
      <p className="text-[10px] text-ph-text-muted line-clamp-1">{pull.pack}</p>

      {/* User + value */}
      <div className="mt-auto flex items-center justify-between gap-1">
        <span className="text-[10px] text-ph-text-muted truncate">@{pull.username}</span>
        <span className="text-sm font-black text-ph-text tracking-tight">{pull.value}</span>
      </div>
    </div>
  );
}

/** How It Works step card */
function StepCard({
  step,
  title,
  body,
  cta,
  href,
}: (typeof HOW_IT_WORKS_STEPS)[0]) {
  return (
    <SurfaceCard padding="lg" className="flex flex-col gap-4">
      {/* Step number */}
      <p className="text-[10px] font-black uppercase tracking-widest text-ph-text-muted">
        Step {step}
      </p>

      {/* Visual placeholder — represents the card art / pack art */}
      <div
        className={cn(
          "w-full rounded-ph-lg bg-ph-surface-high",
          "flex items-center justify-center",
          "border border-ph-border",
          "h-28",
        )}
        aria-hidden
      >
        <div className="h-16 w-12 rounded-ph-md border border-ph-border-md bg-ph-surface-raise opacity-70" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-black tracking-tight text-ph-text">{title}</h3>
        <p className="text-sm leading-relaxed text-ph-text-sec">{body}</p>
      </div>

      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-ph-text-muted hover:text-ph-text-sec ph-transition-colors group"
      >
        {cta}
        <span className="transition-transform duration-ph-fast group-hover:translate-x-0.5">→</span>
      </Link>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visiblePacks =
    activeCategory === "All"
      ? FEATURED_PACKS
      : FEATURED_PACKS.filter((p) => {
          if (activeCategory === "Pokémon") return p.category.toLowerCase().includes("pokémon");
          if (activeCategory === "One Piece") return p.category.toLowerCase().includes("one piece");
          if (activeCategory === "Yu-Gi-Oh!") return p.category.toLowerCase().includes("yu-gi-oh");
          if (activeCategory === "Sports Cards") return p.category.toLowerCase().includes("sports");
          return true;
        });

  return (
    <div className="min-h-dvh bg-ph-bg text-ph-text">
      {/* ── Sticky header ── */}
      <AppHeader credits={12_500} />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ═════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        aria-label="Hero"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(34,197,94,0.06) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-screen-xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="flex flex-col gap-6 lg:max-w-2xl">

            {/* Eyebrow */}
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
              US Trusted · Verified Inventory · Ships Worldwide
            </p>

            {/* Headline — Phygitals tone: direct, bold */}
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-ph-text sm:text-5xl lg:text-6xl">
              Rip packs.{" "}
              <span className="text-ph-green">Pull graded cards.</span>
            </h1>

            {/* Sub-headline */}
            <p className="max-w-md text-base leading-relaxed text-ph-text-sec sm:text-lg">
              Choose to hold, trade, redeem, or sell back to us at up to{" "}
              <strong className="font-bold text-ph-text">80% value</strong>. Every
              card is real, authenticated, and yours from the moment you pull it.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => { window.location.href = "/pack-detail"; }}
              >
                Browse Packs
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => { window.location.href = "/pack-detail"; }}
              >
                Try a Demo Pull
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <BuybackBadge rate={80} />
              <span className="text-xs text-ph-text-muted">
                100,000+ collectors · No tricks, full odds disclosure
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to bottom, transparent, var(--ph-bg))" }}
          aria-hidden
        />
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PACKS
      ═════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6" aria-label="Featured Packs">
        <SectionHeader
          eyebrow="Open Packs"
          title="Featured right now"
          lead="Sourced from verified distributors. Live odds, transparent pool."
          action={
            <span className="text-xs font-semibold text-ph-text-muted">
              80–90% instant buyback →
            </span>
          }
          className="mb-5"
        />

        {/* Category chips */}
        <div
          className="mb-5 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Pack categories"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 rounded-ph-pill px-4 py-2 text-xs font-semibold ph-transition-colors",
                  "border outline-none focus-visible:ring-2 focus-visible:ring-ph-green",
                  isActive
                    ? "border-ph-border-high bg-ph-surface-raise text-ph-text"
                    : "border-ph-border bg-ph-surface text-ph-text-muted hover:border-ph-border-md hover:text-ph-text-sec",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Pack grid / scroll */}
        {visiblePacks.length > 0 ? (
          <PackRow packs={visiblePacks} />
        ) : (
          <SurfaceCard padding="lg" className="text-center">
            <p className="text-sm text-ph-text-muted">
              No packs in this category yet. Check back soon.
            </p>
          </SurfaceCard>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════
          RECENT PULLS — social proof
      ═════════════════════════════════════════════════════════ */}
      <section
        className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6"
        aria-label="Recent Pulls"
      >
        <SectionHeader
          eyebrow="Live from the vault"
          title="Recent Pulls"
          lead="See what collectors are pulling right now."
          action={
            <span className="flex items-center gap-1.5 text-xs text-ph-text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ph-green" />
              Live
            </span>
          }
          className="mb-5"
        />

        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {RECENT_PULLS.map((pull) => (
            <RecentPullCard key={pull.id} pull={pull} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ═════════════════════════════════════════════════════════ */}
      <section
        className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6"
        aria-label="How it works"
      >
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <SectionHeader eyebrow="Get started" title="How It Works" />
          <Link
            href="/pack-detail"
            className="flex-shrink-0 text-xs font-semibold text-ph-text-muted hover:text-ph-text-sec ph-transition-colors"
          >
            Learn more →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <StepCard key={step.step} {...step} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST / CREDIBILITY
      ═════════════════════════════════════════════════════════ */}
      <section
        className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6"
        aria-label="Trust and credibility"
      >
        <SurfaceCard padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            {/* Left copy */}
            <div className="sm:max-w-xs">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ph-text-muted">
                Why Pull Hub
              </p>
              <h2 className="text-xl font-black tracking-tight text-ph-text">
                Built for collectors. Not casinos.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ph-text-sec">
                Transparent odds on every pack. Real authenticated cards. Up to
                80% buyback. No tricks, no fine print.
              </p>
            </div>

            {/* Right trust grid */}
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
              {TRUST_BADGES.map((badge) => (
                <TrustBadge
                  key={badge.label}
                  icon={badge.icon}
                  label={badge.label}
                  className="justify-center text-center sm:flex-col sm:py-3"
                />
              ))}
            </div>
          </div>
        </SurfaceCard>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS BAR
      ═════════════════════════════════════════════════════════ */}
      <section
        className="border-y border-ph-border bg-ph-surface py-8"
        aria-label="Platform stats"
      >
        <div className="mx-auto grid max-w-screen-xl grid-cols-3 gap-4 px-4 sm:px-6">
          {[
            { value: "100K+", label: "Collectors" },
            { value: "2M+",   label: "Packs opened" },
            { value: "80%",   label: "Avg buyback rate" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <p className="text-2xl font-black tracking-tight text-ph-text sm:text-3xl">
                {stat.value}
              </p>
              <p className="text-xs text-ph-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
      ═════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 text-center sm:px-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ph-text-muted">
          Ready to pull?
        </p>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-ph-text sm:text-4xl">
          Open your first pack today.
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base text-ph-text-sec">
          Join 100,000+ collectors. Verified cards, real grades, transparent
          odds.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => { window.location.href = "/pack-detail"; }}
        >
          Browse Packs
        </Button>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DEV FOOTER — Pack Opening Engine preserved for dev use
      ═════════════════════════════════════════════════════════ */}
      <footer className="border-t border-ph-border bg-ph-surface">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-black tracking-tight text-ph-text">
              Pull<span className="text-ph-green">Hub</span>
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/pack-detail"
                className="text-xs text-ph-text-muted hover:text-ph-text-sec ph-transition-colors"
              >
                Pack Detail →
              </Link>
              {/* Dev-only link to the original pack opening engine demo */}
              <span
                className="rounded-ph-sm border border-ph-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ph-text-muted"
                title="Development reference — Pack Opening Engine"
              >
                Engine: /
              </span>
            </div>

            <p className="text-xs text-ph-text-muted">
              © 2026 Pull Hub · Demo build
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
