"use client";

/**
 * Pull Hub — Home
 *
 * Three sections only. Product-led, not SaaS-generic.
 *
 * 1. HERO        — full-viewport, giant type, large pack visual
 * 2. OPEN PACKS  — 2-col product grid, browsable
 * 3. ACTIVITY    — live recent pulls feed (social proof)
 *
 * Phygitals reference:
 *   home-hero-01.png      — large product visual + direct headline + single CTA
 *   home-recent-pulls-03  — horizontal activity feed, "Live from the Claw"
 */

import { useState } from "react";
import Link from "next/link";
import { RarityBadge } from "../components/ui/Badge";
import { cn } from "../components/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const PACKS = [
  {
    id: "platinum-legacy",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    buybackRate: 80,
    remainingFraction: 0.80,
    tagline: "Graded slabs · Alt-arts · Trophy promos",
    rarityTier: "epic"   as const,
    isFeatured: true,
  },
  {
    id: "obsidian-flames",
    name: "Obsidian Flames Chase",
    category: "Pokémon TCG",
    price: 60,
    buybackRate: 80,
    remainingFraction: 0.43,
    tagline: "Charizard ex SAR in prize pool",
    rarityTier: "legendary" as const,
  },
  {
    id: "one-piece-op09",
    name: "OP-09 Mythic Seal",
    category: "One Piece TCG",
    price: 25,
    buybackRate: 75,
    remainingFraction: 0.91,
    tagline: "Luffy & Zoro secret rares",
    rarityTier: "rare" as const,
  },
  {
    id: "evolving-skies",
    name: "Evolving Skies",
    category: "Pokémon TCG",
    price: 50,
    buybackRate: 80,
    remainingFraction: 0.29,
    tagline: "Umbreon VMAX Alt Art chase",
    rarityTier: "mythic" as const,
  },
  {
    id: "prizm-basketball",
    name: "Prizm Basketball Elite",
    category: "Sports Cards",
    price: 45,
    buybackRate: 80,
    remainingFraction: 0.55,
    tagline: "Auto rookie Prizms · PSA graded",
    rarityTier: "epic" as const,
  },
  {
    id: "yugioh-25th",
    name: "25th Anniversary Vault",
    category: "Yu-Gi-Oh!",
    price: 20,
    buybackRate: 70,
    remainingFraction: 0.66,
    tagline: "Quarter century secret rares",
    rarityTier: "rare" as const,
  },
];

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

const RECENT_PULLS = [
  { id: "r1", username: "trainer_alex",   card: "Charizard ex SAR",     rarity: "mythic"    as Rarity, value: "$649", timeAgo: "2m ago"  },
  { id: "r2", username: "casey_m",        card: "Umbreon VMAX Alt Art", rarity: "legendary" as Rarity, value: "$380", timeAgo: "5m ago"  },
  { id: "r3", username: "ryu_tcg",        card: "Iono Full Art Trainer",rarity: "rare"      as Rarity, value: "$22",  timeAgo: "9m ago"  },
  { id: "r4", username: "mika_pulls",     card: "Mew ex Full Art",      rarity: "epic"      as Rarity, value: "$55",  timeAgo: "12m ago" },
  { id: "r5", username: "jake_collector", card: "Pikachu VMAX Rainbow", rarity: "legendary" as Rarity, value: "$280", timeAgo: "15m ago" },
  { id: "r6", username: "sam_r",          card: "Arceus VSTAR Gold",    rarity: "epic"      as Rarity, value: "$75",  timeAgo: "20m ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pack visual (CSS booster pack shape — no real images)
// ─────────────────────────────────────────────────────────────────────────────

const RARITY_FOIL: Record<string, { top: string; mid: string; bot: string; border: string }> = {
  common:    { top: "#1e293b", mid: "#334155", bot: "#1e293b", border: "rgba(148,163,184,0.22)" },
  rare:      { top: "#0f2040", mid: "#1e4080", bot: "#0f2040", border: "rgba(96,165,250,0.32)"  },
  epic:      { top: "#1a0f30", mid: "#3d1e6e", bot: "#1a0f30", border: "rgba(168,85,247,0.36)"  },
  legendary: { top: "#281400", mid: "#5c3000", bot: "#1a0d00", border: "rgba(245,158,11,0.40)"  },
  mythic:    { top: "#200d18", mid: "#5c1a38", bot: "#200d18", border: "rgba(236,72,153,0.38)"  },
};

function PackVisual({
  name,
  category,
  rarity,
  size = "md",
}: {
  name: string;
  category: string;
  rarity: string;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const f = RARITY_FOIL[rarity] ?? RARITY_FOIL.common;
  const dims = {
    sm:   { w: 120, h: 170, r: 8,  fs1: 10, fs2: 8,  pad: 10, artH: 80  },
    md:   { w: 180, h: 252, r: 12, fs1: 13, fs2: 9,  pad: 14, artH: 130 },
    lg:   { w: 240, h: 336, r: 14, fs1: 15, fs2: 10, pad: 18, artH: 180 },
    hero: { w: 320, h: 448, r: 18, fs1: 18, fs2: 11, pad: 22, artH: 250 },
  }[size];

  return (
    <div
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.r,
        border: `1.5px solid ${f.border}`,
        background: `linear-gradient(168deg, ${f.top} 0%, ${f.mid} 48%, ${f.bot} 100%)`,
        boxShadow: size === "hero"
          ? `0 60px 140px rgba(0,0,0,0.9), 0 0 80px ${f.border}40, inset 0 1px 0 rgba(255,255,255,0.09)`
          : `0 28px 80px rgba(0,0,0,0.75), 0 0 40px ${f.border}28, inset 0 1px 0 rgba(255,255,255,0.07)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${dims.pad}px ${Math.round(dims.pad * 0.9)}px`,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Foil shimmer sweep */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 42%, rgba(255,255,255,0.05) 58%, transparent 100%)",
      }} />

      {/* Top sealed strip */}
      <div style={{
        width: "100%", height: Math.round(dims.pad * 0.55),
        background: "rgba(255,255,255,0.05)", borderRadius: 2, flexShrink: 0,
      }} />

      {/* Card art window */}
      <div style={{
        width: "82%", height: dims.artH,
        background: "rgba(0,0,0,0.40)",
        borderRadius: Math.round(dims.r * 0.42),
        border: `1px solid ${f.border}50`,
        flexShrink: 0,
      }} />

      {/* Name area */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <p style={{ fontSize: dims.fs2, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
          {category}
        </p>
        <p style={{ fontSize: dims.fs1, fontWeight: 900, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.015em", lineHeight: 1.2 }}>
          {name}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero pack — tilted flagship visual
// ─────────────────────────────────────────────────────────────────────────────

function HeroPack() {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Shadow behind packs */}
      <div style={{
        position: "absolute",
        width: 340, height: 200,
        background: "radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)",
        bottom: -40, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }} />

      {/* Back pack (tilted right) */}
      <div style={{ position: "absolute", right: -70, transform: "rotate(6deg) translateY(10px)", opacity: 0.45, filter: "blur(0.5px)" }}>
        <PackVisual name="Obsidian Flames" category="Pokémon TCG" rarity="legendary" size="lg" />
      </div>

      {/* Front pack (tilted left, main) */}
      <div style={{ position: "relative", transform: "rotate(-4deg)", zIndex: 2 }}>
        <PackVisual name="Platinum Legacy" category="Pokémon TCG" rarity="epic" size="hero" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pack product tile
// ─────────────────────────────────────────────────────────────────────────────

function PackTile({ pack }: { pack: typeof PACKS[0] }) {
  const isLowStock = pack.remainingFraction < 0.35;

  return (
    <Link
      href="/opening"
      style={{ display: "block", textDecoration: "none" }}
    >
      <div
        style={{
          background: "#0e0e12",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 180ms ease-out, border-color 180ms ease-out",
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-4px)";
          el.style.borderColor = "rgba(255,255,255,0.14)";
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        {/* Visual area — dominant */}
        <div style={{ padding: "24px 24px 16px", display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.01)" }}>
          <PackVisual name={pack.name} category={pack.category} rarity={pack.rarityTier} size="md" />
        </div>

        {/* Info */}
        <div style={{ padding: "0 20px 20px" }}>
          {/* Category */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", marginBottom: 6 }}>
            {pack.category}
          </p>

          {/* Name */}
          <p style={{ fontSize: 17, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 4, lineHeight: 1.2 }}>
            {pack.name}
          </p>

          {/* Tagline */}
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 16, lineHeight: 1.5 }}>
            {pack.tagline}
          </p>

          {/* Remaining bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
                {isLowStock ? "LOW STOCK" : "REMAINING"}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isLowStock ? "#EF4444" : "rgba(255,255,255,0.35)" }}>
                {Math.round(pack.remainingFraction * 100)}%
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }}>
              <div style={{
                height: "100%",
                width: `${pack.remainingFraction * 100}%`,
                background: isLowStock ? "#EF4444" : "#22C55E",
                borderRadius: 1,
              }} />
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
              ${pack.price}
            </span>
            <span style={{ flex: 1 }} />
            <div style={{
              padding: "8px 20px",
              background: "#22C55E",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              color: "#052e16",
              letterSpacing: "0.02em",
            }}>
              Open Pack
            </div>
          </div>

          {/* Buyback */}
          <p style={{ fontSize: 10, color: "rgba(34,197,94,0.7)", marginTop: 8, fontWeight: 600 }}>
            {pack.buybackRate}% instant buyback guaranteed
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent pull card
// ─────────────────────────────────────────────────────────────────────────────

function RecentPullCard({ pull }: { pull: typeof RECENT_PULLS[0] }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 200,
      background: "#0e0e12",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <RarityBadge rarity={pull.rarity} small />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>{pull.timeAgo}</span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
        {pull.card}
      </p>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>@{pull.username}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#22C55E", letterSpacing: "-0.025em" }}>{pull.value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const CATEGORIES = ["All", "Pokémon", "One Piece", "Yu-Gi-Oh!", "Sports"];

  const visiblePacks = activeCategory === "All"
    ? PACKS
    : PACKS.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div style={{ background: "#050507", minHeight: "100dvh", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Minimal nav ────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(5,5,7,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
          Pull<span style={{ color: "#22C55E" }}>Hub</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/packs" style={{ textDecoration: "none", fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Packs</Link>
          <Link href="/opening" style={{ textDecoration: "none", fontSize: 13, fontWeight: 700, color: "#052e16", background: "#22C55E", padding: "8px 20px", borderRadius: 999, letterSpacing: "0.01em" }}>
            Open a Pack
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100dvh",
        paddingTop: "80px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle background gradients */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "15%", left: "55%",
            width: 600, height: 600,
            background: "radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 65%)",
            transform: "translate(-50%, -50%)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
            background: "linear-gradient(to top, #050507, transparent)",
          }} />
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48, position: "relative", zIndex: 1 }}>

          {/* Left: text */}
          <div style={{ flex: 1, maxWidth: 560 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 28 }}>
              US Trusted · Verified Inventory · Ships Worldwide
            </p>

            <h1 style={{
              fontSize: "clamp(52px, 7vw, 96px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#ffffff",
              marginBottom: 28,
            }}>
              Rip packs.<br />
              <span style={{ color: "#22C55E" }}>Pull graded<br />cards.</span>
            </h1>

            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.48)", lineHeight: 1.75, marginBottom: 44, maxWidth: 460 }}>
              Choose to hold, trade, redeem, or sell back at up to{" "}
              <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>80% value</strong>.
              Every card is real, authenticated, and insured from the moment you pull it.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/opening" style={{
                textDecoration: "none",
                display: "inline-block",
                background: "#22C55E",
                color: "#052e16",
                padding: "18px 48px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.02em",
                boxShadow: "0 0 48px rgba(34,197,94,0.25)",
              }}>
                Browse Packs
              </Link>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px",
                border: "1px solid rgba(34,197,94,0.28)",
                borderRadius: 999,
                background: "rgba(34,197,94,0.07)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#22C55E" }}>80% Buyback</span>
              </div>
            </div>

            {/* Trust line */}
            <div style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
              {["Verified inventory", "Full odds disclosure", "Ships worldwide"].map((item) => (
                <span key={item} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 900 }}>✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: pack visual */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HeroPack />
          </div>
        </div>
      </section>

      {/* ── OPEN PACKS ─────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 12 }}>
              Open Packs
            </p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.0 }}>
              Available now
            </h2>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.07)",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    color: active ? "#ffffff" : "rgba(255,255,255,0.38)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pack grid — 2 cols on all sizes for product focus */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {visiblePacks.map((pack) => (
            <PackTile key={pack.id} pack={pack} />
          ))}
        </div>

        {visiblePacks.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)" }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No packs in this category yet.</p>
          </div>
        )}
      </section>

      {/* ── RECENT PULLS ───────────────────────────────────────────────── */}
      <section style={{ padding: "0 32px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 8 }}>
              Live from the vault
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
              Recent Pulls
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>Live</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {RECENT_PULLS.map((pull) => (
            <RecentPullCard key={pull.id} pull={pull} />
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section style={{
        margin: "0 32px 80px",
        maxWidth: "calc(1200px - 64px)",
        marginLeft: "auto",
        marginRight: "auto",
        background: "#0e0e12",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "64px 48px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 16 }}>
          Start collecting
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.035em", marginBottom: 16, lineHeight: 1.05 }}>
          Open your first pack today.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          Verified cards, real grades, transparent odds. 100,000+ collectors. No tricks.
        </p>
        <Link href="/opening" style={{
          textDecoration: "none",
          display: "inline-block",
          background: "#22C55E",
          color: "#052e16",
          padding: "18px 56px",
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "0.02em",
          boxShadow: "0 0 48px rgba(34,197,94,0.22)",
        }}>
          Browse Packs
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
          Pull<span style={{ color: "#22C55E" }}>Hub</span>
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Packs", "/packs"], ["Open", "/opening"], ["Detail", "/pack-detail"]].map(([label, href]) => (
            <Link key={href} href={href} style={{ textDecoration: "none", fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>
              {label}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>© 2026 Pull Hub · Demo build</p>
      </footer>
    </div>
  );
}
