"use client";

/**
 * PackCard — physical product tile  (A+B direction)
 *
 * A = Phygitals showroom: CSS pack object with spotlight, rim light, shadow depth
 * B = US marketplace transparency: price, avg return, floor value, top hit all visible
 *
 * Used on /packs and the home page grid.
 * Data interface extended with transparency fields; new fields are optional
 * so existing callers that omit them still render without error.
 */

export interface PackCardData {
  id:                string;
  name:              string;
  category:          string;
  price:             number;       // $USD — always shown prominently
  buybackRate?:      number;       // buyback % guarantee
  isFeatured?:       boolean;
  remainingFraction?:number;       // 0–1 inventory fraction
  tagline?:          string;
  // ── US marketplace transparency fields (new) ──────────────────────────
  returnRate?:       number;       // avg % return on price (e.g. 84 = 84%)
  floorValue?:       number;       // guaranteed minimum pull value $USD
  topHit?:           string;       // top prize card name
  topHitValue?:      number;       // top prize max $USD value
}

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens (mirrors globals.css — inline for portability)
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:          "#080809",
  surface:     "#0d0d10",
  surfaceHigh: "#131318",
  border:      "rgba(255,255,255,0.06)",
  borderMd:    "rgba(255,255,255,0.10)",
  text:        "#F5F5F5",
  textSec:     "#A0A0AA",
  textMuted:   "#606068",
  green:       "#10b981",
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
// Category → dark charcoal foil palette  (physical, not vivid neon)
// ─────────────────────────────────────────────────────────────────────────────

interface Foil {
  packGrad:  string;
  artBorder: string;
  spot:      string;
  shadow:    string;
}

function getFoil(category: string): Foil {
  const c = category.toLowerCase();
  if (c.includes("pokémon") || c.includes("pokemon"))
    return {
      packGrad:  "linear-gradient(168deg, #12111e 0%, #1b1930 52%, #0e0d18 100%)",
      artBorder: "rgba(140,125,210,0.14)",
      spot:      "rgba(130,110,200,0.06)",
      shadow:    "rgba(80,60,160,0.28)",
    };
  if (c.includes("one piece"))
    return {
      packGrad:  "linear-gradient(168deg, #0d141e 0%, #152030 52%, #090e16 100%)",
      artBorder: "rgba(80,120,200,0.14)",
      spot:      "rgba(60,100,180,0.06)",
      shadow:    "rgba(30,70,160,0.26)",
    };
  if (c.includes("sports"))
    return {
      packGrad:  "linear-gradient(168deg, #14100e 0%, #1e1614 52%, #0e0c0b 100%)",
      artBorder: "rgba(190,80,70,0.14)",
      spot:      "rgba(160,60,50,0.05)",
      shadow:    "rgba(160,40,40,0.24)",
    };
  if (c.includes("yu-gi") || c.includes("yugioh"))
    return {
      packGrad:  "linear-gradient(168deg, #131008 0%, #1c1810 52%, #0e0c08 100%)",
      artBorder: "rgba(200,160,60,0.14)",
      spot:      "rgba(160,130,50,0.05)",
      shadow:    "rgba(160,120,30,0.22)",
    };
  return {
    packGrad:  "linear-gradient(168deg, #111114 0%, #191920 52%, #0d0d10 100%)",
    artBorder: "rgba(180,180,200,0.10)",
    spot:      "rgba(150,150,170,0.04)",
    shadow:    "rgba(80,80,110,0.20)",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pack object  — physical showroom product presentation
// ─────────────────────────────────────────────────────────────────────────────

function PackObject({ pack, foil }: { pack: PackCardData; foil: Foil }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      {/* Soft product spotlight */}
      <div style={{
        position: "absolute",
        inset: "-35% -40%",
        background: `radial-gradient(ellipse 65% 58% at 50% 44%, ${foil.spot} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Pack body */}
      <div style={{
        position: "relative",
        width: 128,
        height: 179,
        borderRadius: 9,
        background: foil.packGrad,
        boxShadow: `
          inset 0 0 0 1px rgba(255,255,255,0.09),
          inset 1px 1px 0 rgba(255,255,255,0.07),
          0 2px 8px rgba(0,0,0,0.50),
          0 10px 32px rgba(0,0,0,0.62),
          0 28px 64px ${foil.shadow}
        `,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Diagonal foil shimmer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(130deg, rgba(255,255,255,0.08) 0%, transparent 36%, rgba(255,255,255,0.04) 54%, transparent 100%)",
        }} />

        {/* Sealed top strip */}
        <div style={{
          height: 16,
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }} />

        {/* Art window */}
        <div style={{
          flex: 1,
          margin: "8px 10px",
          background: "rgba(0,0,0,0.50)",
          borderRadius: 5,
          border: `1px solid ${foil.artBorder}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }} />

        {/* Bottom label strip */}
        <div style={{ padding: "0 10px 10px", flexShrink: 0 }}>
          <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>
            {pack.category}
          </p>
          <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {pack.name}
          </p>
        </div>
      </div>

      {/* Ground shadow / soft reflection */}
      <div style={{
        width: "76%",
        height: 18,
        background: `linear-gradient(to bottom, ${foil.shadow}, transparent)`,
        filter: "blur(8px)",
        opacity: 0.4,
        marginTop: -6,
        borderRadius: "50%",
        flexShrink: 0,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PackCard
// ─────────────────────────────────────────────────────────────────────────────

interface PackCardProps {
  pack:      PackCardData;
  onClick?:  () => void;
  className?: string;
}

export function PackCard({ pack, onClick }: PackCardProps) {
  const foil       = getFoil(pack.category);
  const isLowStock = (pack.remainingFraction ?? 1) < 0.35;
  const hasReturn  = pack.returnRate !== undefined;
  const hasFloor   = pack.floorValue !== undefined;
  const hasTopHit  = pack.topHit !== undefined && pack.topHitValue !== undefined;

  // Return rate color: emerald ≥90, warm green 80–89, neutral <80
  const returnColor =
    (pack.returnRate ?? 0) >= 90 ? C.green :
    (pack.returnRate ?? 0) >= 80 ? "#a3e635" :
    C.textSec;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        transition: "transform 160ms ease-out, border-color 160ms ease-out, box-shadow 160ms ease-out",
      }}
      onMouseOver={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform    = "translateY(-3px)";
        el.style.borderColor  = C.borderMd;
        el.style.boxShadow    = "0 14px 48px rgba(0,0,0,0.48)";
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform    = "";
        el.style.borderColor  = C.border;
        el.style.boxShadow    = "";
      }}
    >
      {/* ── Visual area: pack object on dark stage ── */}
      <div style={{
        position: "relative",
        background: foil.packGrad,
        padding: "28px 0 16px",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        minHeight: 220,
      }}>
        {/* Stage spotlight */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 60% at 50% 44%, ${foil.spot} 0%, transparent 72%)`,
        }} />

        {/* Status badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {pack.isFeatured && (
            <span style={{ fontSize: 8, fontWeight: 800, color: C.gold, background: C.goldSoft, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.10em", textTransform: "uppercase" }}>
              Featured
            </span>
          )}
          {isLowStock && (
            <span style={{ fontSize: 8, fontWeight: 800, color: C.red, background: C.redSoft, border: `1px solid rgba(220,38,38,0.24)`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.10em", textTransform: "uppercase" }}>
              Low Stock
            </span>
          )}
        </div>

        <PackObject pack={pack} foil={foil} />
      </div>

      {/* ── Info: US marketplace transparency ── */}
      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Category + Name */}
        <p style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
          {pack.category}
        </p>
        <p style={{ fontSize: 15, fontWeight: 900, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
          {pack.name}
        </p>

        {/* Tagline */}
        {pack.tagline && (
          <p style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55, marginBottom: 12 }}>
            {pack.tagline}
          </p>
        )}

        {/* Stats row — price / return / floor */}
        <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
          {/* Price — always visible */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Price</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>${pack.price}</p>
          </div>

          {/* Return rate — if data exists */}
          {hasReturn && (
            <>
              <div style={{ width: 1, background: C.border, margin: "0 10px", alignSelf: "stretch" }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Avg Return</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: returnColor, letterSpacing: "-0.02em", lineHeight: 1 }}>{pack.returnRate}%</p>
              </div>
            </>
          )}

          {/* Floor value — if data exists */}
          {hasFloor && (
            <>
              <div style={{ width: 1, background: C.border, margin: "0 10px", alignSelf: "stretch" }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Floor</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: C.textSec, letterSpacing: "-0.02em", lineHeight: 1 }}>${pack.floorValue}</p>
              </div>
            </>
          )}
        </div>

        {/* Top hit — if data exists */}
        {hasTopHit && (
          <div style={{
            padding: "7px 10px",
            background: C.surfaceHigh,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 7, fontWeight: 700, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Top Hit</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pack.topHit}
              </p>
            </div>
            <p style={{ fontSize: 13, fontWeight: 900, color: C.gold, letterSpacing: "-0.02em", flexShrink: 0 }}>
              up to ${pack.topHitValue!.toLocaleString()}
            </p>
          </div>
        )}

        {/* Inventory bar */}
        {pack.remainingFraction !== undefined && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: C.textMuted, letterSpacing: "0.10em", textTransform: "uppercase" }}>Inventory</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: isLowStock ? C.red : C.textMuted }}>
                {Math.round(pack.remainingFraction * 100)}% left
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
              <div style={{
                height: "100%",
                width: `${(pack.remainingFraction * 100).toFixed(1)}%`,
                background: isLowStock ? C.red : C.green,
                borderRadius: 1,
              }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
          <div style={{
            flex: 1,
            padding: "11px 0",
            background: C.green,
            borderRadius: 7,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 800,
            color: C.greenInk,
            letterSpacing: "0.02em",
            boxShadow: `0 0 20px rgba(16,185,129,0.14)`,
          }}>
            Open Pack · ${pack.price}
          </div>
        </div>

        {/* Buyback note */}
        {pack.buybackRate !== undefined && (
          <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(16,185,129,0.55)", marginTop: 6 }}>
            {pack.buybackRate}% instant buyback
          </p>
        )}
      </div>
    </div>
  );
}
