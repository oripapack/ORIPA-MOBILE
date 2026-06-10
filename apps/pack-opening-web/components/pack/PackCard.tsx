"use client";

/**
 * PackCard — premium product tile
 *
 * Visual-first: pack art takes up 65% of the card height.
 * Price, CTA, and remaining bar are clear and unambiguous.
 * No SaaS-generic card pattern — this is a product, not a feature.
 */

export interface PackCardData {
  id: string;
  name: string;
  category: string;
  /** USD price for the default tier */
  price: number;
  /** 0–100 buyback guarantee rate. Omit to hide. */
  buybackRate?: number;
  /** Shows "Featured" pill */
  isFeatured?: boolean;
  /** Remaining as a fraction 0–1 */
  remainingFraction?: number;
  /** Short tagline (1 line max) */
  tagline?: string;
}

/** Foil pack gradient per rarity tier (derived from category keywords) */
function getFoil(category: string): { top: string; mid: string; bot: string; accent: string } {
  const c = category.toLowerCase();
  if (c.includes("pokemon") || c.includes("pokémon"))
    return { top: "#1a0f30", mid: "#3d1e6e", bot: "#1a0f30", accent: "rgba(168,85,247,0.35)" };
  if (c.includes("one piece"))
    return { top: "#0f2040", mid: "#1e4080", bot: "#0f2040", accent: "rgba(96,165,250,0.35)" };
  if (c.includes("sports"))
    return { top: "#200d18", mid: "#5c1a38", bot: "#200d18", accent: "rgba(236,72,153,0.35)" };
  if (c.includes("yu-gi") || c.includes("yugioh"))
    return { top: "#281400", mid: "#5c3000", bot: "#1a0d00", accent: "rgba(245,158,11,0.38)" };
  // Default
  return { top: "#1e293b", mid: "#334155", bot: "#1e293b", accent: "rgba(148,163,184,0.25)" };
}

interface PackCardProps {
  pack: PackCardData;
  onClick?: () => void;
  className?: string;
}

export function PackCard({ pack, onClick }: PackCardProps) {
  const f = getFoil(pack.category);
  const isLowStock = (pack.remainingFraction ?? 1) < 0.35;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      style={{
        background: "#0e0e12",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseOver={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.borderColor = "rgba(255,255,255,0.14)";
        el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.boxShadow = "none";
      }}
    >
      {/* ── Visual area (pack art) ── */}
      <div style={{
        position: "relative",
        background: `linear-gradient(168deg, ${f.top} 0%, ${f.mid} 48%, ${f.bot} 100%)`,
        padding: "28px 24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
        minHeight: 220,
      }}>
        {/* Foil shimmer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 42%, rgba(255,255,255,0.04) 58%, transparent 100%)",
        }} />

        {/* Badges — top right */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          {pack.isFeatured && (
            <div style={{ padding: "3px 10px", background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.32)", borderRadius: 999, fontSize: 9, fontWeight: 800, color: "#c084fc", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Featured
            </div>
          )}
          {pack.buybackRate !== undefined && (
            <div style={{ padding: "3px 10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.28)", borderRadius: 999, fontSize: 9, fontWeight: 800, color: "#22C55E", letterSpacing: "0.08em" }}>
              {pack.buybackRate}% Back
            </div>
          )}
        </div>

        {/* Pack shape — the product visual */}
        <div style={{
          width: 120, height: 168,
          borderRadius: 10,
          border: `1.5px solid ${f.accent}`,
          background: `linear-gradient(168deg, ${f.top}, ${f.mid}, ${f.bot})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 10px",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 32px ${f.accent}40, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>
          {/* Inner shimmer */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)", pointerEvents: "none" }} />
          {/* Sealed top strip */}
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 1, flexShrink: 0 }} />
          {/* Art window */}
          <div style={{ width: "82%", height: 80, background: "rgba(0,0,0,0.38)", borderRadius: 5, border: `1px solid ${f.accent}40`, flexShrink: 0 }} />
          {/* Name */}
          <p style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.85)", textAlign: "center", letterSpacing: "-0.01em", lineHeight: 1.2, position: "relative", zIndex: 1 }}>
            {pack.name}
          </p>
        </div>

        {/* Category label below pack shape */}
        <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.32)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 12 }}>
          {pack.category}
        </p>
      </div>

      {/* ── Info strip ── */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Pack name */}
        <p style={{ fontSize: 15, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          {pack.name}
        </p>

        {/* Tagline */}
        {pack.tagline && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            {pack.tagline}
          </p>
        )}

        {/* Remaining */}
        {pack.remainingFraction !== undefined && (
          <div style={{ marginTop: 4 }}>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(pack.remainingFraction * 100).toFixed(1)}%`,
                background: isLowStock ? "#EF4444" : "#22C55E",
                borderRadius: 1,
              }} />
            </div>
            <p style={{ fontSize: 10, color: isLowStock ? "#EF4444" : "rgba(255,255,255,0.25)", marginTop: 4, fontWeight: isLowStock ? 700 : 500 }}>
              {isLowStock ? `Low stock — ${Math.round(pack.remainingFraction * 100)}% left` : `${Math.round(pack.remainingFraction * 100)}% remaining`}
            </p>
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
            ${pack.price}
          </span>
          <span style={{ flex: 1 }} />
          <div style={{
            padding: "7px 16px",
            background: "#22C55E",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            color: "#052e16",
            letterSpacing: "0.02em",
            boxShadow: "0 0 20px rgba(34,197,94,0.15)",
          }}>
            Open
          </div>
        </div>
      </div>
    </div>
  );
}
