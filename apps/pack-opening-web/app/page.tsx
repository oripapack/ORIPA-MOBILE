"use client";

/**
 * Pull Hub — Home / Lobby
 *
 * Direction A+B:
 *   A = Phygitals premium dark showroom — physical product staging, cinematic
 *   B = US collectible marketplace transparency — StockX/Fanatics/Arena Club style
 *       price, return rate, floor value, top hit all visible on every pack card
 *
 * Structure:
 *   1. Header       — dark glass, logo, credits, navigation
 *   2. Hero         — full-viewport featured pack with spotlight staging
 *   3. Pack market  — 2-col product grid, full transparency metadata
 *   4. Live activity — recent pulls social proof
 *   5. Bottom nav   — Shop / Vault / Home / Activity / Profile
 */

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Tokens (mirrors globals.css — keeping inline avoids Tailwind scan complexity)
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:          "#080809",
  surface:     "#0d0d10",
  surfaceHigh: "#131318",
  surfaceRaise:"#19191f",
  border:      "rgba(255,255,255,0.06)",
  borderMd:    "rgba(255,255,255,0.10)",
  borderHigh:  "rgba(255,255,255,0.17)",
  text:        "#F5F5F5",
  textSec:     "#A0A0AA",
  textMuted:   "#606068",
  green:       "#10b981",
  greenHover:  "#059669",
  greenSoft:   "rgba(16,185,129,0.10)",
  greenBorder: "rgba(16,185,129,0.24)",
  greenInk:    "#022c22",
  gold:        "#c9a96e",
  goldSoft:    "rgba(201,169,110,0.10)",
  goldBorder:  "rgba(201,169,110,0.24)",
  red:         "#dc2626",
  redSoft:     "rgba(220,38,38,0.09)",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Mock pack catalog  (extended with US marketplace transparency fields)
// ─────────────────────────────────────────────────────────────────────────────

interface Pack {
  id:               string;
  name:             string;
  category:         string;
  price:            number;       // $USD
  returnRate:       number;       // avg % return on price (mock)
  floorValue:       number;       // guaranteed minimum card value (mock)
  topHit:           string;       // top prize card name
  topHitValue:      number;       // top prize max value
  buybackRate:      number;       // buyback % guarantee
  remainingFraction:number;       // 0–1 inventory remaining
  tagline:          string;
  isFeatured?:      boolean;
  isLowStock?:      boolean;
}

const PACKS: Pack[] = [
  {
    id: "platinum-legacy",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    returnRate: 84,
    floorValue: 5,
    topHit: "Charizard ex SAR",
    topHitValue: 649,
    buybackRate: 80,
    remainingFraction: 0.80,
    tagline: "PSA graded · Verified · Alt-arts · Trophy promos",
    isFeatured: true,
  },
  {
    id: "obsidian-flames",
    name: "Obsidian Flames Chase",
    category: "Pokémon TCG",
    price: 60,
    returnRate: 91,
    floorValue: 8,
    topHit: "Charizard ex SAR",
    topHitValue: 649,
    buybackRate: 80,
    remainingFraction: 0.43,
    tagline: "High-stakes — chase tier guaranteed on premium pulls",
    isLowStock: true,
  },
  {
    id: "one-piece-op09",
    name: "OP-09 Mythic Seal",
    category: "One Piece TCG",
    price: 25,
    returnRate: 78,
    floorValue: 4,
    topHit: "Monkey D. Luffy SR",
    topHitValue: 120,
    buybackRate: 75,
    remainingFraction: 0.91,
    tagline: "New arrival · 9th series secret rares in prize pool",
  },
  {
    id: "evolving-skies",
    name: "Evolving Skies Premium",
    category: "Pokémon TCG",
    price: 50,
    returnRate: 96,
    floorValue: 6,
    topHit: "Umbreon VMAX Alt Art",
    topHitValue: 380,
    buybackRate: 80,
    remainingFraction: 0.29,
    tagline: "Highest-demand Evolving Skies pulls — limited remaining",
    isLowStock: true,
  },
  {
    id: "prizm-basketball",
    name: "Prizm Basketball Elite",
    category: "Sports Cards",
    price: 45,
    returnRate: 88,
    floorValue: 5,
    topHit: "Wembanyama Prizm Auto RC",
    topHitValue: 450,
    buybackRate: 80,
    remainingFraction: 0.55,
    tagline: "Panini Prizm auto rookies · PSA-graded veterans",
  },
  {
    id: "yugioh-25th",
    name: "25th Anniversary Vault",
    category: "Yu-Gi-Oh!",
    price: 20,
    returnRate: 72,
    floorValue: 3,
    topHit: "Blue-Eyes QC Secret Rare",
    topHitValue: 85,
    buybackRate: 70,
    remainingFraction: 0.66,
    tagline: "Quarter century secret rare reprints — complete set pulls",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Category foil palette — physical / dark charcoal, NOT vivid neon
// ─────────────────────────────────────────────────────────────────────────────

interface Foil {
  packGrad:  string;   // pack body gradient
  artBorder: string;   // art window border
  spot:      string;   // spotlight color behind pack
  shadow:    string;   // drop shadow color
  rimTint:   string;   // rim light tint
}

function getFoil(category: string): Foil {
  const c = category.toLowerCase();
  if (c.includes("pokémon") || c.includes("pokemon"))
    return {
      packGrad:  "linear-gradient(168deg, #12111e 0%, #1b1930 52%, #0e0d18 100%)",
      artBorder: "rgba(140,125,210,0.14)",
      spot:      "rgba(130,110,200,0.06)",
      shadow:    "rgba(80,60,160,0.28)",
      rimTint:   "rgba(140,125,210,0.20)",
    };
  if (c.includes("one piece"))
    return {
      packGrad:  "linear-gradient(168deg, #0d141e 0%, #152030 52%, #090e16 100%)",
      artBorder: "rgba(80,120,200,0.14)",
      spot:      "rgba(60,100,180,0.06)",
      shadow:    "rgba(30,70,160,0.26)",
      rimTint:   "rgba(80,120,200,0.18)",
    };
  if (c.includes("sports"))
    return {
      packGrad:  "linear-gradient(168deg, #14100e 0%, #1e1614 52%, #0e0c0b 100%)",
      artBorder: "rgba(190,80,70,0.14)",
      spot:      "rgba(160,60,50,0.05)",
      shadow:    "rgba(160,40,40,0.24)",
      rimTint:   "rgba(190,80,70,0.18)",
    };
  if (c.includes("yu-gi") || c.includes("yugioh"))
    return {
      packGrad:  "linear-gradient(168deg, #131008 0%, #1c1810 52%, #0e0c08 100%)",
      artBorder: "rgba(200,160,60,0.14)",
      spot:      "rgba(160,130,50,0.05)",
      shadow:    "rgba(160,120,30,0.22)",
      rimTint:   "rgba(200,160,60,0.20)",
    };
  return {
    packGrad:  "linear-gradient(168deg, #111114 0%, #191920 52%, #0d0d10 100%)",
    artBorder: "rgba(180,180,200,0.10)",
    spot:      "rgba(150,150,170,0.04)",
    shadow:    "rgba(80,80,110,0.20)",
    rimTint:   "rgba(180,180,200,0.12)",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Showroom pack  — physical product staging with spotlight + reflection
// ─────────────────────────────────────────────────────────────────────────────

interface ShowroomPackProps {
  pack: Pack;
  size?: "hero" | "card";
  tilt?: boolean;
}

function ShowroomPack({ pack, size = "card", tilt = false }: ShowroomPackProps) {
  const f = getFoil(pack.category);
  const w = size === "hero" ? 220 : 140;
  const h = size === "hero" ? 308 : 196;
  const artH = size === "hero" ? 168 : 108;
  const fs1 = size === "hero" ? 14 : 10;
  const fs2 = size === "hero" ? 11 : 8;
  const pad = size === "hero" ? 16 : 11;
  const r = size === "hero" ? 11 : 8;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Soft product spotlight behind pack */}
      <div style={{
        position: "absolute",
        inset: "-40% -50%",
        background: `radial-gradient(ellipse 70% 60% at 50% 42%, ${f.spot} 0%, transparent 72%)`,
        pointerEvents: "none",
      }} />

      {/* Pack object */}
      <div style={{
        position: "relative",
        width:  w,
        height: h,
        borderRadius: r,
        background: f.packGrad,
        /* Rim light: bright top-left edge, dark bottom-right */
        boxShadow: `
          inset 0 0 0 1px rgba(255,255,255,0.10),
          inset 1px 1px 0 rgba(255,255,255,0.08),
          0 2px 8px   rgba(0,0,0,0.55),
          0 12px 36px rgba(0,0,0,0.65),
          0 32px 80px ${f.shadow}
        `,
        transform: tilt
          ? "perspective(700px) rotateY(-7deg) rotateX(2deg)"
          : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Diagonal foil shimmer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(130deg, rgba(255,255,255,0.08) 0%, transparent 38%, rgba(255,255,255,0.04) 55%, transparent 100%)",
        }} />

        {/* Sealed top strip */}
        <div style={{
          height: size === "hero" ? 22 : 14,
          background: "rgba(255,255,255,0.04)",
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
          flexShrink: 0,
        }} />

        {/* Card art window */}
        <div style={{
          flexShrink: 0,
          margin: `${pad * 0.6}px ${pad}px`,
          height: artH,
          background: "rgba(0,0,0,0.50)",
          borderRadius: r * 0.5,
          border: `1px solid ${f.artBorder}`,
          /* Subtle inner light at top of art window */
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }} />

        {/* Pack info strip */}
        <div style={{ flex: 1, padding: `${pad * 0.3}px ${pad}px ${pad}px`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <p style={{ fontSize: fs2, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            {pack.category}
          </p>
          <p style={{ fontSize: fs1, fontWeight: 900, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {pack.name}
          </p>
        </div>
      </div>

      {/* Ground shadow / reflection */}
      <div style={{
        position: "absolute",
        bottom: -16,
        left: "8%", right: "8%",
        height: 28,
        background: `linear-gradient(to bottom, ${f.shadow} 0%, transparent 100%)`,
        filter: "blur(10px)",
        opacity: 0.45,
        pointerEvents: "none",
        transform: tilt ? "perspective(700px) rotateY(-7deg) scaleY(-0.4) translateY(100%)" : "scaleY(-0.5) translateY(50%)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pack marketplace card  (US transparency: price, return rate, floor, top hit)
// ─────────────────────────────────────────────────────────────────────────────

function PackMarketCard({ pack }: { pack: Pack }) {
  const isLowStock = pack.isLowStock || pack.remainingFraction < 0.35;
  const returnColor = pack.returnRate >= 90 ? C.green : pack.returnRate >= 80 ? "#a3e635" : C.textSec;

  return (
    <Link href="/opening" style={{ display: "block", textDecoration: "none" }}>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
          transition: "transform 160ms ease-out, border-color 160ms ease-out, box-shadow 160ms ease-out",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-3px)";
          el.style.borderColor = C.borderMd;
          el.style.boxShadow = `0 16px 48px rgba(0,0,0,0.50)`;
        }}
        onMouseOut={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "";
          el.style.borderColor = C.border;
          el.style.boxShadow = "";
        }}
      >
        {/* Visual area */}
        <div style={{
          position: "relative",
          background: getFoil(pack.category).packGrad,
          padding: "28px 0 20px",
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: 220,
        }}>
          {/* Spotlight */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 70% 60% at 50% 44%, ${getFoil(pack.category).spot} 0%, transparent 72%)`,
          }} />

          {/* Featured / Low Stock badge */}
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            {pack.isFeatured && (
              <span style={{ fontSize: 9, fontWeight: 800, color: C.gold, background: C.goldSoft, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Featured
              </span>
            )}
            {isLowStock && (
              <span style={{ fontSize: 9, fontWeight: 800, color: C.red, background: C.redSoft, border: `1px solid rgba(220,38,38,0.24)`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Low Stock
              </span>
            )}
          </div>

          <ShowroomPack pack={pack} size="card" />
        </div>

        {/* Info — US marketplace transparency */}
        <div style={{ padding: "16px 18px 18px" }}>

          {/* Category + Name */}
          <p style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            {pack.category}
          </p>
          <p style={{ fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>
            {pack.name}
          </p>

          {/* Stats row — price + return rate */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Price</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>${pack.price}</p>
            </div>

            <div style={{ width: 1, height: 36, background: C.border, flexShrink: 0 }} />

            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Avg Return</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: returnColor, letterSpacing: "-0.02em", lineHeight: 1 }}>{pack.returnRate}%</p>
            </div>

            <div style={{ width: 1, height: 36, background: C.border, flexShrink: 0 }} />

            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 2 }}>Floor</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: C.textSec, letterSpacing: "-0.02em", lineHeight: 1 }}>${pack.floorValue}</p>
            </div>
          </div>

          {/* Top hit */}
          <div style={{
            padding: "8px 12px",
            background: C.surfaceHigh,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <p style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                Top Hit
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSec, letterSpacing: "-0.01em" }}>
                {pack.topHit}
              </p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 900, color: C.gold, letterSpacing: "-0.02em", flexShrink: 0 }}>
              up to ${pack.topHitValue.toLocaleString()}
            </p>
          </div>

          {/* Remaining inventory */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: C.textMuted, letterSpacing: "0.10em", textTransform: "uppercase" }}>
                Inventory
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isLowStock ? C.red : C.textMuted }}>
                {Math.round(pack.remainingFraction * 100)}% remaining
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
              <div style={{
                height: "100%",
                width: `${(pack.remainingFraction * 100).toFixed(1)}%`,
                background: isLowStock ? C.red : C.green,
                borderRadius: 1,
                transition: "width 0.3s ease-out",
              }} />
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1,
              padding: "12px 0",
              background: C.green,
              borderRadius: 8,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 800,
              color: C.greenInk,
              letterSpacing: "0.02em",
              boxShadow: `0 0 24px rgba(16,185,129,0.16)`,
            }}>
              Open Pack · ${pack.price}
            </div>
            <div style={{
              padding: "12px 14px",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              color: C.textMuted,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              Details
            </div>
          </div>

          {/* Buyback note */}
          <p style={{ fontSize: 10, color: C.greenSoft.replace("0.10","0.6"), marginTop: 8, fontWeight: 600 }}>
            {pack.buybackRate}% instant buyback guaranteed
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent pull feed
// ─────────────────────────────────────────────────────────────────────────────

const RARITY_COLOR: Record<string, string> = {
  common:    "#9ca3af",
  rare:      "#60a5fa",
  epic:      "#a78bfa",
  legendary: "#c9a96e",
  mythic:    "#f472b6",
};

const RECENT_PULLS = [
  { id:"r1", username:"trainer_alex",   card:"Charizard ex SAR",      rarity:"mythic",    value:"$649", timeAgo:"2m"  },
  { id:"r2", username:"casey_m",        card:"Umbreon VMAX Alt Art",  rarity:"legendary", value:"$380", timeAgo:"5m"  },
  { id:"r3", username:"ryu_tcg",        card:"Iono Full Art Trainer", rarity:"rare",      value:"$22",  timeAgo:"9m"  },
  { id:"r4", username:"mika_pulls",     card:"Mew ex Full Art",       rarity:"epic",      value:"$55",  timeAgo:"12m" },
  { id:"r5", username:"jake_collector", card:"Pikachu VMAX Rainbow",  rarity:"legendary", value:"$280", timeAgo:"15m" },
  { id:"r6", username:"sam_r",          card:"Arceus VSTAR Gold",     rarity:"epic",      value:"$75",  timeAgo:"20m" },
];

function PullFeedCard({ pull }: { pull: typeof RECENT_PULLS[0] }) {
  const rc = RARITY_COLOR[pull.rarity] ?? RARITY_COLOR.common;
  return (
    <div style={{
      flexShrink: 0,
      width: 188,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 7,
    }}>
      {/* Rarity pill + time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 9, fontWeight: 800, color: rc,
          background: `${rc}14`, border: `1px solid ${rc}28`,
          borderRadius: 4, padding: "2px 7px",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {pull.rarity}
        </span>
        <span style={{ fontSize: 10, color: C.textMuted }}>{pull.timeAgo} ago</span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>
        {pull.card}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <span style={{ fontSize: 11, color: C.textMuted }}>@{pull.username}</span>
        <span style={{ fontSize: 14, fontWeight: 900, color: C.green, letterSpacing: "-0.02em" }}>{pull.value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom navigation
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Shop",     href: "/packs",       icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6h14l-1.5 9H4.5L3 6z" stroke="currentColor" strokeWidth={active ? 0 : 1.4} fill={active ? "currentColor" : "none"} strokeLinejoin="round"/>
      <path d="M7 6V4.5a3 3 0 016 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )},
  { label: "Vault",    href: "/packs",       icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 6.5v5.5c0 3.5 3 6.5 7 6.5s7-3 7-6.5V6.5L10 2z" stroke="currentColor" strokeWidth="1.4" fill={active ? "currentColor" : "none"} strokeLinejoin="round"/>
      {!active && <path d="M7 10l2.2 2L13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>}
      {active && <path d="M7 10l2.2 2L13 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  )},
  { label: "Home",     href: "/",            icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 9L10 3l7 6v8a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth={active ? 0 : 1.4} fill={active ? "currentColor" : "none"} strokeLinejoin="round"/>
      {!active && <path d="M7 17v-5h6v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>}
    </svg>
  )},
  { label: "Activity", href: "/",            icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 10h3l2 4 4-8 2 4h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { label: "Profile",  href: "/",            icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.4" fill={active ? "currentColor" : "none"}/>
      <path d="M3.5 17c0-3 2.9-5.5 6.5-5.5S16.5 14 16.5 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )},
] as const;

function BottomNav({ active }: { active: string }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(8,8,9,0.94)",
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.label === active;
        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0 12px",
              textDecoration: "none",
              color: isActive ? C.green : C.textMuted,
              transition: "color 150ms ease-out",
              gap: 4,
            }}
          >
            {item.icon(isActive)}
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: "0.04em" }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{
                position: "absolute",
                bottom: "calc(100% + env(safe-area-inset-bottom) + 2px)",
                width: 20, height: 2,
                background: C.green,
                borderRadius: 1,
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const CATS = ["All", "Pokémon", "One Piece", "Sports", "Yu-Gi-Oh!"];
  const visible = activeCategory === "All"
    ? PACKS
    : PACKS.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const featured = PACKS.find((p) => p.isFeatured) ?? PACKS[0]!;

  return (
    <div style={{ background: C.bg, minHeight: "100dvh", color: C.text, overflowX: "hidden" }}>

      {/* ── Header ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,8,9,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: "none", fontSize: 17, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", flexShrink: 0 }}>
          Pull<span style={{ color: C.green }}>Hub</span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Credits pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: C.surfaceHigh,
          border: `1px solid ${C.border}`,
          borderRadius: 999,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke={C.green} strokeWidth="1.2"/>
            <path d="M6 3.5v5M4 5.5l2-2 2 2" stroke={C.green} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>12,500</span>
          <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>cr</span>
        </div>

        <Link href="/opening" style={{
          textDecoration: "none",
          padding: "8px 18px",
          background: C.green,
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          color: C.greenInk,
          letterSpacing: "0.02em",
          boxShadow: `0 0 20px rgba(16,185,129,0.18)`,
          whiteSpace: "nowrap",
        }}>
          Open a Pack
        </Link>
      </header>

      {/* ── Hero ── */}
      <section style={{
        minHeight: "100dvh",
        paddingTop: 64,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient stage glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 60% at 65% 42%, rgba(130,110,200,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 18% 72%, rgba(16,185,129,0.03) 0%, transparent 60%)
          `,
        }} />

        <div style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "60px 28px 80px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}>
          {/* Left — text */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: C.textMuted, textTransform: "uppercase", marginBottom: 24 }}>
              US Trusted · Verified Inventory · Ships Worldwide
            </p>
            <h1 style={{
              fontSize: "clamp(44px, 6vw, 88px)",
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 0.96,
              color: C.text,
              marginBottom: 28,
            }}>
              Rip packs.<br />
              <span style={{ color: C.green }}>Pull graded<br />cards.</span>
            </h1>
            <p style={{ fontSize: 16, color: C.textSec, lineHeight: 1.75, marginBottom: 40, maxWidth: 420 }}>
              Hold, trade, redeem, or sell back at up to{" "}
              <strong style={{ color: C.text, fontWeight: 700 }}>80% value</strong>.
              Every card is real, authenticated, and insured from the moment you pull it.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
              <Link href="/opening" style={{
                textDecoration: "none",
                padding: "17px 44px",
                background: C.green,
                color: C.greenInk,
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.02em",
                boxShadow: `0 0 48px rgba(16,185,129,0.24)`,
              }}>
                Browse Packs
              </Link>
              <Link href="/opening" style={{
                textDecoration: "none",
                padding: "17px 28px",
                background: "transparent",
                color: C.textSec,
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                border: `1px solid ${C.border}`,
              }}>
                Try Demo Pull
              </Link>
            </div>

            {/* Trust stats — StockX style */}
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { num: "100K+", label: "Collectors" },
                { num: "2M+",   label: "Packs opened" },
                { num: "80%",   label: "Avg buyback" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{stat.num}</p>
                  <p style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — staged packs */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", minHeight: 400 }}>
            {/* Back pack */}
            <div style={{ position: "absolute", right: "4%", bottom: "10%", opacity: 0.45, filter: "blur(0.5px)", transform: "rotate(8deg) scale(0.82)" }}>
              <ShowroomPack pack={PACKS[1]!} size="hero" />
            </div>
            {/* Front pack */}
            <div style={{ position: "relative", zIndex: 2, transform: "rotate(-4deg)" }}>
              <ShowroomPack pack={featured} size="hero" tilt />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pack marketplace ── */}
      <section style={{ padding: "80px 28px 100px", maxWidth: 1180, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: C.textMuted, textTransform: "uppercase", marginBottom: 10 }}>
              Mystery Packs
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Available now
            </h2>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATS.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    border: active ? `1px solid ${C.borderHigh}` : `1px solid ${C.border}`,
                    background: active ? C.surfaceHigh : "transparent",
                    color: active ? C.text : C.textMuted,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 140ms ease-out",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 18,
        }}>
          {visible.map((pack) => (
            <PackMarketCard key={pack.id} pack={pack} />
          ))}
          {visible.length === 0 && (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: C.textMuted }}>
              No packs in this category.
            </p>
          )}
        </div>
      </section>

      {/* ── Recent pulls ── */}
      <section style={{ padding: "0 28px 140px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>
              Live from the vault
            </p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, color: C.text, letterSpacing: "-0.025em" }}>
              Recent Pulls
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>Live</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {RECENT_PULLS.map((pull) => <PullFeedCard key={pull.id} pull={pull} />)}
        </div>
      </section>

      {/* ── Bottom Nav ── */}
      <BottomNav active="Home" />
    </div>
  );
}
