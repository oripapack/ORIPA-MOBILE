"use client";

/**
 * Pull Hub — Home / Lobby
 *
 * Mobile-first layout mirroring the Expo HomeScreen:
 *   Discover mode: featured hero + pack grid + recent pulls
 *   Browse mode:   category chips + sort chips + full pack list
 *
 * Data: shared catalog (data/catalog.ts → shared/mock/catalog.ts)
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { CATALOG_PACKS, RECENT_PULLS, getFeaturedPack } from "@/data/catalog";
import type { CatalogPack, CatalogCategoryFilter, RarityTier } from "@/data/catalog";
import { BottomNav } from "@/components/layout/BottomNav";
import { WebCreditsPill } from "@/components/WebCreditsPill";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens (inline for portability — mirrors globals.css --ph-* vars)
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  bg:           "var(--ph-bg)",
  surface:      "var(--ph-surface)",
  surfaceHigh:  "var(--ph-surface-high)",
  border:       "var(--ph-border)",
  borderMd:     "var(--ph-border-md)",
  text:         "var(--ph-text)",
  textSec:      "var(--ph-text-sec)",
  textMuted:    "var(--ph-text-muted)",
  green:        "var(--ph-green)",
  greenSoft:    "var(--ph-green-soft)",
  greenBorder:  "var(--ph-green-border)",
  greenInk:     "var(--ph-green-ink)",
  gold:         "var(--ph-gold)",
  goldSoft:     "var(--ph-gold-soft)",
  goldBorder:   "var(--ph-gold-border)",
  red:          "var(--ph-red)",
  redSoft:      "var(--ph-red-soft)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Category foil palette — physical / dark charcoal
// ─────────────────────────────────────────────────────────────────────────────

interface Foil { packGrad: string; artBorder: string; spot: string; shadow: string; }

function getFoil(category: string): Foil {
  const c = category.toLowerCase();
  if (c.includes("pokémon") || c.includes("pokemon"))
    return { packGrad: "linear-gradient(168deg,#12111e 0%,#1b1930 52%,#0e0d18 100%)", artBorder: "rgba(140,125,210,0.14)", spot: "rgba(130,110,200,0.06)", shadow: "rgba(80,60,160,0.28)" };
  if (c.includes("one piece"))
    return { packGrad: "linear-gradient(168deg,#0d141e 0%,#152030 52%,#090e16 100%)", artBorder: "rgba(80,120,200,0.14)", spot: "rgba(60,100,180,0.06)", shadow: "rgba(30,70,160,0.26)" };
  if (c.includes("sports"))
    return { packGrad: "linear-gradient(168deg,#14100e 0%,#1e1614 52%,#0e0c0b 100%)", artBorder: "rgba(190,80,70,0.14)", spot: "rgba(160,60,50,0.05)", shadow: "rgba(160,40,40,0.24)" };
  if (c.includes("yu-gi") || c.includes("yugioh"))
    return { packGrad: "linear-gradient(168deg,#131008 0%,#1c1810 52%,#0e0c08 100%)", artBorder: "rgba(200,160,60,0.14)", spot: "rgba(160,130,50,0.05)", shadow: "rgba(160,120,30,0.22)" };
  return { packGrad: "linear-gradient(168deg,#111114 0%,#191920 52%,#0d0d10 100%)", artBorder: "rgba(180,180,200,0.10)", spot: "rgba(150,150,170,0.04)", shadow: "rgba(80,80,110,0.20)" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ShowroomPack — physical pack object (used in hero + cards)
// ─────────────────────────────────────────────────────────────────────────────

function ShowroomPack({ pack, size = "card" }: { pack: CatalogPack; size?: "hero" | "card" }) {
  const f = getFoil(pack.category);
  const w = size === "hero" ? 180 : 120;
  const h = size === "hero" ? 252 : 168;
  const artH = size === "hero" ? 136 : 90;
  const fs1 = size === "hero" ? 13 : 9;
  const fs2 = size === "hero" ? 10 : 7;
  const pad = size === "hero" ? 14 : 10;
  const r = size === "hero" ? 10 : 7;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        position: "absolute", inset: "-40% -50%", pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 60% at 50% 42%,${f.spot} 0%,transparent 72%)`,
      }} />
      <div style={{
        position: "relative", width: w, height: h, borderRadius: r,
        background: f.packGrad,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.10),inset 1px 1px 0 rgba(255,255,255,0.08),0 2px 8px rgba(0,0,0,0.55),0 12px 36px rgba(0,0,0,0.65),0 32px 80px ${f.shadow}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(130deg,rgba(255,255,255,0.08) 0%,transparent 38%,rgba(255,255,255,0.04) 55%,transparent 100%)" }} />
        <div style={{ height: size === "hero" ? 18 : 12, background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }} />
        <div style={{ flexShrink: 0, margin: `${pad * 0.6}px ${pad}px`, height: artH, background: "rgba(0,0,0,0.50)", borderRadius: r * 0.5, border: `1px solid ${f.artBorder}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }} />
        <div style={{ flex: 1, padding: `0 ${pad}px ${pad}px`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <p style={{ fontSize: fs2, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>{pack.category}</p>
          <p style={{ fontSize: fs1, fontWeight: 900, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{pack.name}</p>
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: -14, left: "8%", right: "8%", height: 24,
        background: `linear-gradient(to bottom,${f.shadow} 0%,transparent 100%)`,
        filter: "blur(10px)", opacity: 0.4, pointerEvents: "none",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero — featured pack (Discover mode)
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ pack }: { pack: CatalogPack }) {
  const f = getFoil(pack.category);
  const isLowStock = pack.remainingFraction < 0.35;

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: f.packGrad,
      borderRadius: 16,
      margin: "0 16px",
    }}>
      {/* Stage spotlight */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 80% 65% at 50% 40%,${f.spot} 0%,transparent 70%)` }} />

      <div style={{ position: "relative", padding: "28px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 6, alignSelf: "flex-start" }}>
          {pack.isFeatured && (
            <span style={{ fontSize: 9, fontWeight: 800, color: T.gold, background: T.goldSoft, border: `1px solid ${T.goldBorder}`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.10em", textTransform: "uppercase" }}>Featured</span>
          )}
          {pack.buybackRate && (
            <span style={{ fontSize: 9, fontWeight: 800, color: T.green, background: T.greenSoft, border: `1px solid ${T.greenBorder}`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.10em", textTransform: "uppercase" }}>{pack.buybackRate}% Buyback</span>
          )}
          {isLowStock && (
            <span style={{ fontSize: 9, fontWeight: 800, color: T.red, background: T.redSoft, border: "1px solid rgba(220,38,38,0.24)", borderRadius: 4, padding: "2px 8px", letterSpacing: "0.10em", textTransform: "uppercase" }}>Low Stock</span>
          )}
        </div>

        {/* Pack visual */}
        <ShowroomPack pack={pack} size="hero" />

        {/* Pack info */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.40)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>{pack.category}</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>{pack.name}</p>
          <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55, marginBottom: 20 }}>{pack.tagline}</p>

          {/* Inventory bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.10em", textTransform: "uppercase" }}>Inventory</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: isLowStock ? T.red : T.textMuted }}>{Math.round(pack.remainingFraction * 100)}% remaining</span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }}>
              <div style={{ height: "100%", width: `${(pack.remainingFraction * 100).toFixed(1)}%`, background: isLowStock ? T.red : T.green, borderRadius: 1 }} />
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/opening?packId=${pack.id}`}
              style={{
                flex: 1, display: "block", textAlign: "center",
                padding: "14px 0", background: T.green, borderRadius: 999,
                fontSize: 14, fontWeight: 800, color: T.greenInk,
                letterSpacing: "0.02em", textDecoration: "none",
                boxShadow: "0 0 32px rgba(16,185,129,0.18)",
              }}
            >
              Open Pack · ${pack.price}
            </Link>
            <Link
              href={`/pack-detail?packId=${pack.id}`}
              style={{
                padding: "14px 18px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999,
                fontSize: 13, fontWeight: 700, color: T.textSec,
                textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PackRow — single horizontal pack card (used in Discover grid + Browse list)
// ─────────────────────────────────────────────────────────────────────────────

function PackRow({ pack }: { pack: CatalogPack }) {
  const f = getFoil(pack.category);
  const isLowStock = pack.remainingFraction < 0.35;
  const topCardName = pack.topCard.replace(/ — \$[\d,]+$/, "").trim();
  const topCardValueMatch = pack.topCard.match(/\$([\d,]+)/);
  const topCardValue = topCardValueMatch ? topCardValueMatch[1] : null;

  return (
    <Link href={`/pack-detail?packId=${pack.id}`} style={{ display: "block", textDecoration: "none" }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: "hidden", display: "flex",
        transition: "border-color 150ms ease-out",
      }}>
        {/* Visual strip */}
        <div style={{
          width: 96, flexShrink: 0, position: "relative",
          background: f.packGrad,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px 0",
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 70% at 50% 44%,${f.spot} 0%,transparent 70%)`, pointerEvents: "none" }} />
          <ShowroomPack pack={pack} size="card" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: "14px 14px 14px 12px", minWidth: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>{pack.category}</p>
          <p style={{ fontSize: 15, fontWeight: 900, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 5 }}>{pack.name}</p>
          <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{pack.tagline}</p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>${pack.price}</span>
              {pack.buybackRate && (
                <span style={{ fontSize: 9, fontWeight: 700, color: T.green }}>{pack.buybackRate}% buyback</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {isLowStock && (
                <span style={{ fontSize: 8, fontWeight: 700, color: T.red, background: T.redSoft, border: "1px solid rgba(220,38,38,0.24)", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Low</span>
              )}
              {pack.isNew && (
                <span style={{ fontSize: 8, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,0.09)", border: "1px solid rgba(96,165,250,0.20)", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>New</span>
              )}
            </div>
          </div>

          {topCardValue && (
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>
              Top hit: <span style={{ color: T.gold, fontWeight: 700 }}>{topCardName}</span>{" "}
              <span style={{ color: T.textMuted }}>${topCardValue}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent pulls ticker
// ─────────────────────────────────────────────────────────────────────────────

const RARITY_COLOR: Record<RarityTier, string> = {
  common:    "var(--ph-rarity-common)",
  rare:      "var(--ph-rarity-rare)",
  epic:      "var(--ph-rarity-epic)",
  legendary: "var(--ph-rarity-legendary)",
  mythic:    "var(--ph-rarity-mythic)",
};

function RecentPullsTicker() {
  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: 4 }}>Live from the vault</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: "-0.02em" }}>Recent Pulls</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted }}>Live</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {RECENT_PULLS.map((pull) => {
          const rc = RARITY_COLOR[pull.rarity] ?? RARITY_COLOR.common;
          return (
            <div key={pull.id} style={{
              flexShrink: 0, width: 160,
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "12px 12px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: rc, background: `${rc}18`, border: `1px solid ${rc}28`, borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {pull.rarity}
                </span>
                <span style={{ fontSize: 9, color: T.textMuted }}>{pull.timeAgo}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{pull.card}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>@{pull.username}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: T.green, letterSpacing: "-0.02em" }}>{pull.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode switch bar (Discover / Browse)
// ─────────────────────────────────────────────────────────────────────────────

function ModeSwitchBar({ mode, onChange }: { mode: "discover" | "browse"; onChange: (m: "discover" | "browse") => void }) {
  return (
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{
        display: "flex", borderRadius: 999, padding: 3,
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        {(["discover", "browse"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 999,
                border: active ? `1px solid ${T.borderMd}` : "1px solid transparent",
                background: active ? T.surfaceHigh : "transparent",
                color: active ? T.text : T.textMuted,
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: "pointer", transition: "all 150ms ease-out",
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category + sort chips (Browse mode)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: { key: CatalogCategoryFilter; label: string }[] = [
  { key: "All",          label: "All Packs"  },
  { key: "Pokémon TCG",  label: "Pokémon"    },
  { key: "One Piece TCG",label: "One Piece"  },
  { key: "Yu-Gi-Oh!",   label: "Yu-Gi-Oh!"  },
  { key: "Sports Cards", label: "Sports"     },
];

type SortKey = "featured" | "price_asc" | "price_desc" | "low_stock";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured",   label: "Featured" },
  { key: "price_asc",  label: "Price ↑"  },
  { key: "price_desc", label: "Price ↓"  },
  { key: "low_stock",  label: "Low Stock" },
];

function ChipRow<T extends string>({ options, active, onSelect }: {
  options: { key: T; label: string }[];
  active: T;
  onSelect: (k: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "8px 16px", scrollbarWidth: "none" }}>
      {options.map(({ key, label }) => {
        const sel = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 999,
              border: sel ? `1px solid ${T.borderMd}` : `1px solid ${T.border}`,
              background: sel ? "var(--ph-green-soft)" : "transparent",
              color: sel ? T.green : T.textMuted,
              fontSize: 12, fontWeight: sel ? 700 : 500,
              cursor: "pointer", whiteSpace: "nowrap" as const,
              transition: "all 140ms ease-out",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mode, setMode] = useState<"discover" | "browse">("discover");
  const [category, setCategory] = useState<CatalogCategoryFilter>("All");
  const [sort, setSort] = useState<SortKey>("featured");

  const featured = useMemo(() => getFeaturedPack(), []);

  const gridPacks = useMemo(() => {
    const base = CATALOG_PACKS.filter((p) => p.id !== featured.id).slice(0, 6);
    return base;
  }, [featured]);

  const filteredPacks = useMemo(() => {
    let arr = category === "All"
      ? [...CATALOG_PACKS]
      : CATALOG_PACKS.filter((p) => p.category === category);
    switch (sort) {
      case "price_asc":  arr = arr.sort((a, b) => a.price - b.price); break;
      case "price_desc": arr = arr.sort((a, b) => b.price - a.price); break;
      case "low_stock":  arr = arr.sort((a, b) => a.remainingFraction - b.remainingFraction); break;
      default:           arr = arr.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)); break;
    }
    return arr;
  }, [category, sort]);

  return (
    <div style={{ background: T.bg, minHeight: "100dvh", color: T.text, paddingBottom: 80 }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,9,0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 17, fontWeight: 900, color: T.text, letterSpacing: "-0.03em", flexShrink: 0 }}>
          Pull<span style={{ color: T.green }}>Hub</span>
        </Link>
        <div style={{ flex: 1 }} />
        <WebCreditsPill />
        <Link href="/packs" style={{
          textDecoration: "none", padding: "7px 14px",
          border: `1px solid ${T.border}`, borderRadius: 999,
          fontSize: 12, fontWeight: 600, color: T.textSec,
          whiteSpace: "nowrap",
        }}>
          Browse
        </Link>
      </header>

      {/* ── Mode toggle ── */}
      <ModeSwitchBar mode={mode} onChange={setMode} />

      {mode === "discover" ? (
        <>
          {/* ── Hero ── */}
          <div style={{ marginTop: 16 }}>
            <HeroSection pack={featured} />
          </div>

          {/* ── Open packs section ── */}
          <div style={{ padding: "24px 16px 8px" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: "-0.02em", marginBottom: 4 }}>Open packs</p>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Tap any pack to view details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {gridPacks.map((pack) => <PackRow key={pack.id} pack={pack} />)}
            </div>
          </div>

          {/* ── Recent pulls ── */}
          <div style={{ paddingTop: 24, paddingBottom: 8 }}>
            <RecentPullsTicker />
          </div>
        </>
      ) : (
        <>
          {/* ── Browse mode ── */}
          <div style={{ padding: "16px 16px 4px" }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: "-0.02em", marginBottom: 2 }}>All packs</p>
            <p style={{ fontSize: 12, color: T.textMuted }}>{filteredPacks.length} packs available</p>
          </div>

          <ChipRow options={CATEGORIES} active={category} onSelect={setCategory} />
          <ChipRow options={SORT_OPTIONS} active={sort} onSelect={setSort} />

          <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredPacks.length > 0 ? (
              filteredPacks.map((pack) => <PackRow key={pack.id} pack={pack} />)
            ) : (
              <p style={{ textAlign: "center", padding: "48px 0", color: T.textMuted, fontSize: 13 }}>
                No packs in this category.
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}
