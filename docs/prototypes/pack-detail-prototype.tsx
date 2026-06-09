"use client";

/**
 * Pack Detail Screen — Visual Prototype
 *
 * Design references:
 *   Phygitals          → premium dark UI, large pack visual hero, two-column
 *                        desktop layout, tier selector grid, buyback badge,
 *                        staged reveal, "Try a free demo spin" secondary CTA
 *   Nihon Toreca Center → remaining qty + progress bar, prize pool tiers,
 *                        demo pull confirm modal, result → repeat flow,
 *                        social proof ticker, coin/credit flow
 *
 * Self-contained: all mock data inline, no external deps beyond React.
 * Assumes a Next.js / Tailwind environment; responsive layout via embedded
 * <style> block so it also works standalone.
 */

import { useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
type DemoPhase = "closed" | "confirming" | "opening" | "result";

interface Tier { id: string; label: string; credits: number; usd: number; badge?: string; }
interface PrizeItem { id: string; name: string; set: string; rarity: Rarity; estimatedValue: string; totalQty: number; remaining: number; }
interface OddsEntry { rarity: Rarity; label: string; chance: string; valueRange: string; example: string; }
interface RecentPull { id: string; username: string; card: string; rarity: Rarity; value: string; timeAgo: string; }
interface DemoCard { name: string; set: string; rarity: Rarity; value: string; credits: number; }

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const PACK = {
  name: "Platinum Legacy",
  category: "Pokémon TCG",
  type: "Mystery Pack",
  buybackRate: 80,
  description: "Sourced exclusively from verified distributors. Every pull is drawn from sealed, authenticated inventory — Japanese and English sets, trophy promos, and PSA-graded slabs.",
  remaining: 196304,
  total: 1000000,
  recentCount: 47,
};

const TIERS: Tier[] = [
  { id: "starter",   label: "Starter",   credits: 500,   usd: 5   },
  { id: "classic",   label: "Classic",   credits: 1200,  usd: 12  },
  { id: "pro",       label: "Pro",       credits: 3000,  usd: 30,  badge: "Popular" },
  { id: "elite",     label: "Elite",     credits: 6000,  usd: 60  },
  { id: "ultra",     label: "Ultra",     credits: 10000, usd: 100 },
  { id: "legendary", label: "Legendary", credits: 25000, usd: 250, badge: "Best Value" },
];

const PRIZES: PrizeItem[] = [
  { id:"p1", name:"Charizard ex SAR",         set:"Obsidian Flames", rarity:"mythic",    estimatedValue:"$649",    totalQty:2,   remaining:1   },
  { id:"p2", name:"Umbreon VMAX Alt Art",      set:"Evolving Skies",  rarity:"legendary", estimatedValue:"$380",    totalQty:4,   remaining:2   },
  { id:"p3", name:"Pikachu VMAX Rainbow Rare", set:"Vivid Voltage",   rarity:"legendary", estimatedValue:"$280",    totalQty:6,   remaining:4   },
  { id:"p4", name:"Mew ex Full Art",           set:"Paldea Evolved",  rarity:"epic",      estimatedValue:"$55",     totalQty:50,  remaining:38  },
  { id:"p5", name:"Arceus VSTAR Gold Card",    set:"Crown Zenith",    rarity:"epic",      estimatedValue:"$75",     totalQty:30,  remaining:22  },
  { id:"p6", name:"Iono Full Art Trainer",     set:"Paldea Evolved",  rarity:"rare",      estimatedValue:"$22",     totalQty:200, remaining:148 },
  { id:"p7", name:"Sealed Booster Pack",       set:"Various Sets",    rarity:"common",    estimatedValue:"$5–$12",  totalQty:500, remaining:412 },
];

const ODDS: OddsEntry[] = [
  { rarity:"mythic",    label:"Mythic",    chance:"0.10%", valueRange:"$500+",       example:"Charizard ex SAR"      },
  { rarity:"legendary", label:"Legendary", chance:"1.00%", valueRange:"$100 – $500", example:"Umbreon VMAX Alt Art"  },
  { rarity:"epic",      label:"Epic",      chance:"4.90%", valueRange:"$25 – $100",  example:"Mew ex Full Art"       },
  { rarity:"rare",      label:"Rare",      chance:"20.0%", valueRange:"$8 – $25",    example:"Iono Full Art Trainer" },
  { rarity:"common",    label:"Common",    chance:"74.0%", valueRange:"$1 – $8",     example:"Sealed Booster Pack"   },
];

const RECENT_PULLS: RecentPull[] = [
  { id:"r1", username:"trainer_alex",    card:"Charizard ex SAR",       rarity:"mythic",    value:"$649", timeAgo:"2m ago"  },
  { id:"r2", username:"casey_m",         card:"Umbreon VMAX Alt Art",   rarity:"legendary", value:"$380", timeAgo:"5m ago"  },
  { id:"r3", username:"ryu_tcg",         card:"Iono Full Art Trainer",  rarity:"rare",      value:"$22",  timeAgo:"8m ago"  },
  { id:"r4", username:"mika_pulls",      card:"Mew ex Full Art",        rarity:"epic",      value:"$55",  timeAgo:"11m ago" },
  { id:"r5", username:"jake_collector",  card:"Pikachu VMAX Rainbow",   rarity:"legendary", value:"$280", timeAgo:"14m ago" },
  { id:"r6", username:"sam_r",           card:"Arceus VSTAR Gold",      rarity:"epic",      value:"$75",  timeAgo:"18m ago" },
];

const DEMO_POOL: DemoCard[] = [
  { name:"Charizard ex Full Art",  set:"Obsidian Flames", rarity:"epic",      value:"$84",  credits:8400  },
  { name:"Iono Full Art Trainer",  set:"Paldea Evolved",  rarity:"rare",      value:"$22",  credits:2200  },
  { name:"Sealed Booster Pack",    set:"Various Sets",    rarity:"common",    value:"$8",   credits:800   },
  { name:"Umbreon VMAX Alt Art",   set:"Evolving Skies",  rarity:"legendary", value:"$380", credits:38000 },
  { name:"Mew ex Full Art",        set:"Paldea Evolved",  rarity:"epic",      value:"$55",  credits:5500  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  bg:           "#0B0B0E",
  surface:      "#111117",
  surfaceHigh:  "#18181F",
  surfaceRaise: "#1E1E27",
  border:       "rgba(255,255,255,0.07)",
  borderMed:    "rgba(255,255,255,0.11)",
  borderHigh:   "rgba(255,255,255,0.18)",
  text:         "#FFFFFF",
  textSec:      "#9CA3AF",
  textMuted:    "#6B7280",
  green:        "#22C55E",
  greenSoft:    "rgba(34,197,94,0.10)",
  greenBorder:  "rgba(34,197,94,0.25)",
  amber:        "#F59E0B",
  red:          "#EF4444",
} as const;

const RARITY_COLOR: Record<Rarity,string> = { common:"#9CA3AF", rare:"#60A5FA", epic:"#A855F7", legendary:"#F59E0B", mythic:"#EC4899" };
const RARITY_BG:    Record<Rarity,string> = { common:"rgba(156,163,175,0.09)", rare:"rgba(96,165,250,0.09)", epic:"rgba(168,85,247,0.11)", legendary:"rgba(245,158,11,0.11)", mythic:"rgba(236,72,153,0.13)" };
const RARITY_BORDER:Record<Rarity,string> = { common:"rgba(156,163,175,0.18)", rare:"rgba(96,165,250,0.20)", epic:"rgba(168,85,247,0.24)", legendary:"rgba(245,158,11,0.26)", mythic:"rgba(236,72,153,0.28)" };
const RARITY_LABEL: Record<Rarity,string> = { common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", mythic:"Mythic" };

// ─────────────────────────────────────────────────────────────────────────────
// Reusable atoms
// ─────────────────────────────────────────────────────────────────────────────

function RarityPill({ rarity, small }: { rarity: Rarity; small?: boolean }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small ? "2px 8px" : "4px 10px", borderRadius:999, background:RARITY_BG[rarity], border:`1px solid ${RARITY_BORDER[rarity]}`, color:RARITY_COLOR[rarity], fontSize: small ? 10 : 11, fontWeight:700, letterSpacing:"0.4px", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius:"50%", background:RARITY_COLOR[rarity], flexShrink:0 }} />
      {RARITY_LABEL[rarity]}
    </span>
  );
}

function Divider({ style }: { style?: React.CSSProperties }) {
  return <div style={{ height:1, background:T.border, width:"100%", ...style }} />;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:T.textMuted, marginBottom:8 }}>{children}</p>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pack visual — large hero card (placeholder for real image)
// ─────────────────────────────────────────────────────────────────────────────

function PackVisual({ bumped }: { bumped: boolean }) {
  return (
    <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
      {/* Ambient purple glow */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.09) 0%, transparent 68%)", pointerEvents:"none" }} />

      {/* Card frame */}
      <div style={{
        position:"relative", width:"100%", maxWidth:340, aspectRatio:"3/4",
        background:"linear-gradient(155deg,#1c1535 0%,#12102a 45%,#0d0c18 100%)",
        borderRadius:20, border:`1.5px solid ${T.borderMed}`,
        boxShadow:"0 0 0 1px rgba(168,85,247,0.07), 0 32px 80px rgba(0,0,0,0.65), 0 0 56px rgba(168,85,247,0.07)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16,
        overflow:"hidden",
        transform: bumped ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Top sheen */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(255,255,255,0.04) 0%,transparent 35%)", borderRadius:"inherit", pointerEvents:"none" }} />

        {/* Inner card art placeholder */}
        <div style={{
          width:"70%", aspectRatio:"2.5/3.5",
          background:"linear-gradient(135deg,rgba(168,85,247,0.13) 0%,rgba(96,165,250,0.07) 50%,rgba(236,72,153,0.10) 100%)",
          borderRadius:10, border:"1px solid rgba(168,85,247,0.18)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10,
          position:"relative",
        }}>
          {/* Holographic sweep */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.06) 45%,rgba(255,255,255,0.10) 50%,rgba(255,255,255,0.06) 55%,transparent 70%)", borderRadius:"inherit", pointerEvents:"none" }} />
          <span style={{ fontSize:52, lineHeight:1 }}>🎴</span>
          <div style={{ padding:"3px 10px", background:"rgba(168,85,247,0.14)", borderRadius:6, border:"1px solid rgba(168,85,247,0.26)" }}>
            <span style={{ fontSize:9, fontWeight:700, color:"#C084FC", letterSpacing:"1.2px", textTransform:"uppercase" }}>Pokémon TCG</span>
          </div>
        </div>

        {/* Bottom label strip */}
        <div style={{ width:"100%", padding:"12px 20px", textAlign:"center" }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase", color:T.textMuted, marginBottom:2 }}>Pull Hub</p>
          <p style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.3px" }}>Platinum Legacy</p>
        </div>
      </div>

      {/* Verified badge */}
      <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:T.surface, borderRadius:999, border:`1px solid ${T.border}` }}>
        <span style={{ fontSize:12, color:T.green, fontWeight:700 }}>✓</span>
        <span style={{ fontSize:12, color:T.textSec, fontWeight:600 }}>Verified Inventory · Authenticated Source</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier grid
// ─────────────────────────────────────────────────────────────────────────────

function TierGrid({ tiers, selected, onSelect }: { tiers: Tier[]; selected: string; onSelect:(id:string)=>void }) {
  return (
    <div className="pd-tier-grid" style={{ display:"grid", gap:8 }}>
      {tiers.map(t => {
        const active = t.id === selected;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            position:"relative", background: active ? T.surfaceRaise : T.surface,
            border:`1.5px solid ${active ? T.borderHigh : T.border}`, borderRadius:10,
            padding:"10px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.12s ease", outline:"none",
          }}>
            {t.badge && (
              <span style={{ position:"absolute", top:-8, right:8, background: t.badge==="Popular" ? T.green : T.amber, color: t.badge==="Popular" ? "#052e16" : "#451a03", fontSize:9, fontWeight:800, letterSpacing:"0.5px", padding:"2px 7px", borderRadius:999, textTransform:"uppercase" }}>
                {t.badge}
              </span>
            )}
            <p style={{ fontSize:10, color: active ? T.textSec : T.textMuted, fontWeight:600, letterSpacing:"0.4px", textTransform:"uppercase", marginBottom:3 }}>{t.label}</p>
            <p style={{ fontSize:18, fontWeight:800, color: active ? T.text : T.textSec, letterSpacing:"-0.4px", lineHeight:1 }}>${t.usd}</p>
            <p style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{t.credits.toLocaleString()} credits</p>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────────────────

function ProgressSection({ remaining, total }: { remaining:number; total:number }) {
  const pct = (remaining / total) * 100;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
        <span style={{ fontSize:13, color:T.textSec, fontWeight:600 }}>Remaining pulls</span>
        <span style={{ fontSize:12, color:T.textMuted }}>{remaining.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div style={{ height:6, background:T.surfaceHigh, borderRadius:999, overflow:"hidden", marginBottom:6 }}>
        <div style={{ height:"100%", width:`${pct.toFixed(1)}%`, background:`linear-gradient(90deg,${T.green},#16A34A)`, borderRadius:999 }} />
      </div>
      <p style={{ fontSize:11, color:T.textMuted }}>{(total-remaining).toLocaleString()} pulled · {pct.toFixed(1)}% remaining</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quantity selector
// ─────────────────────────────────────────────────────────────────────────────

function QuantitySelector({ qty, onMinus, onPlus }: { qty:number; onMinus:()=>void; onPlus:()=>void }) {
  const btn: React.CSSProperties = { width:36, height:36, background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:18, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"6px 12px" }}>
      <span style={{ fontSize:12, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", flex:1 }}>Quantity</span>
      <button style={btn} onClick={onMinus}>−</button>
      <span style={{ fontSize:17, fontWeight:800, color:T.text, minWidth:28, textAlign:"center" }}>{qty}</span>
      <button style={btn} onClick={onPlus}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust strip
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon:"✓",  label:"Verified inventory"  },
  { icon:"◎",  label:"Transparent odds"    },
  { icon:"🏛", label:"Vault storage"       },
  { icon:"📦", label:"Physical shipping"   },
];

function TrustStrip() {
  return (
    <div className="pd-trust-row" style={{ display:"grid", gap:8 }}>
      {TRUST_ITEMS.map(item => (
        <div key={item.label} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px", background:T.surface, borderRadius:8, border:`1px solid ${T.border}` }}>
          <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
          <span style={{ fontSize:11, color:T.textSec, fontWeight:600 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Prize card
// ─────────────────────────────────────────────────────────────────────────────

function PrizeCard({ item }: { item: PrizeItem }) {
  const pct = (item.remaining / item.totalQty) * 100;
  const isLow = item.remaining <= 2;
  return (
    <div style={{ background:T.surface, border:`1px solid ${RARITY_BORDER[item.rarity]}`, borderRadius:12, padding:"14px 14px 12px", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ height:2, width:"100%", background:RARITY_COLOR[item.rarity], borderRadius:999, opacity:0.55, marginBottom:2 }} />
      <RarityPill rarity={item.rarity} small />
      <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.4 }}>{item.name}</p>
      <p style={{ fontSize:11, color:T.textMuted }}>{item.set}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:15, fontWeight:800, color:T.text, letterSpacing:"-0.3px" }}>{item.estimatedValue}</span>
        {isLow && <span style={{ fontSize:9, fontWeight:700, color:T.red, background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:999, padding:"2px 7px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{item.remaining} left</span>}
      </div>
      <div>
        <div style={{ height:3, background:T.surfaceHigh, borderRadius:999, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct.toFixed(0)}%`, background: isLow ? T.red : RARITY_COLOR[item.rarity], borderRadius:999, opacity:0.65 }} />
        </div>
        <p style={{ fontSize:10, color:T.textMuted, marginTop:4 }}>{item.remaining} / {item.totalQty} remaining</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Odds table (accordion)
// ─────────────────────────────────────────────────────────────────────────────

function OddsTable({ open, onToggle }: { open:boolean; onToggle:()=>void }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
      <button onClick={onToggle} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>◎</span>
          <div style={{ textAlign:"left" }}>
            <p style={{ fontSize:14, fontWeight:700, color:T.text }}>Full Odds Disclosure</p>
            <p style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>All probabilities listed by rarity tier</p>
          </div>
        </div>
        <span style={{ fontSize:18, color:T.textMuted, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s", flexShrink:0 }}>⌄</span>
      </button>
      {open && (
        <>
          <Divider />
          <div style={{ padding:"0 0 8px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 0.7fr 1.1fr 1.6fr", padding:"10px 20px", gap:8 }}>
              {["Tier","Odds","Est. Value","Example"].map(h => (
                <p key={h} style={{ fontSize:9, fontWeight:700, letterSpacing:"1px", color:T.textMuted, textTransform:"uppercase" }}>{h}</p>
              ))}
            </div>
            <Divider style={{ margin:"0 0 4px" }} />
            {ODDS.map((row,i) => (
              <div key={row.rarity} style={{ display:"grid", gridTemplateColumns:"1.2fr 0.7fr 1.1fr 1.6fr", padding:"11px 20px", gap:8, background: i%2===1 ? "rgba(255,255,255,0.02)" : "transparent", alignItems:"center" }}>
                <RarityPill rarity={row.rarity} small />
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{row.chance}</p>
                <p style={{ fontSize:12, color:T.textSec }}>{row.valueRange}</p>
                <p style={{ fontSize:11, color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.example}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Buyback card
// ─────────────────────────────────────────────────────────────────────────────

function BuybackCard({ rate }: { rate: number }) {
  return (
    <div style={{ background:T.greenSoft, border:`1px solid ${T.greenBorder}`, borderRadius:14, padding:"20px 24px", display:"flex", gap:20, alignItems:"flex-start" }}>
      <div style={{ width:48, height:48, borderRadius:12, background:"rgba(34,197,94,0.14)", border:`1px solid ${T.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💰</div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
          <p style={{ fontSize:15, fontWeight:800, color:T.text }}>{rate}% Buyback Guaranteed</p>
          <span style={{ fontSize:10, fontWeight:700, color:"#052e16", background:T.green, padding:"2px 8px", borderRadius:999, letterSpacing:"0.4px" }}>{rate}% BACK</span>
        </div>
        <p style={{ fontSize:13, color:T.textSec, lineHeight:1.7, marginBottom:12 }}>
          Every pull is eligible for our buyback program. Vault your card and cash out for at least <strong style={{ color:T.text }}>{rate}% of its estimated market value</strong> — no negotiations, no waiting.
        </p>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          {[{label:"Vault & Hold",desc:"Keep it in your digital vault"},{label:"Cash Out",desc:`${rate}% guaranteed buyback`},{label:"Ship It",desc:"Physical delivery to your door"}].map(item => (
            <div key={item.label}>
              <p style={{ fontSize:12, fontWeight:700, color:T.green }}>{item.label}</p>
              <p style={{ fontSize:11, color:T.textMuted }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent pulls
// ─────────────────────────────────────────────────────────────────────────────

function RecentPullsRow({ pulls }: { pulls: RecentPull[] }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:T.textMuted, letterSpacing:"1.2px", textTransform:"uppercase", marginBottom:4 }}>Live from the vault</p>
          <p style={{ fontSize:20, fontWeight:800, color:T.text, letterSpacing:"-0.4px" }}>Recent Pulls</p>
        </div>
        <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:T.textMuted }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:T.green, display:"inline-block" }} />
          Live
        </span>
      </div>
      <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8, WebkitOverflowScrolling:"touch" }}>
        {pulls.map(p => (
          <div key={p.id} style={{ flexShrink:0, width:176, background:T.surface, border:`1px solid ${RARITY_BORDER[p.rarity]}`, borderRadius:12, padding:"14px 14px 12px", display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <RarityPill rarity={p.rarity} small />
              <span style={{ fontSize:10, color:T.textMuted }}>{p.timeAgo}</span>
            </div>
            <p style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.4, marginTop:4 }}>{p.card}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:2 }}>
              <span style={{ fontSize:11, color:T.textMuted }}>@{p.username}</span>
              <span style={{ fontSize:13, fontWeight:800, color:T.text, letterSpacing:"-0.2px" }}>{p.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo modal (confirm → opening → result)
// ─────────────────────────────────────────────────────────────────────────────

function DemoModal({ phase, card, onConfirm, onClose }: { phase:DemoPhase; card:DemoCard|null; onConfirm:()=>void; onClose:()=>void }) {
  if (phase === "closed") return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", zIndex:9000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surfaceHigh, border:`1px solid ${T.borderMed}`, borderRadius:20, padding:32, maxWidth:440, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>

        {/* Confirm */}
        {phase === "confirming" && (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.4px", textTransform:"uppercase", color:T.textMuted, marginBottom:10 }}>Simulation Only</p>
              <p style={{ fontSize:22, fontWeight:900, color:T.text, letterSpacing:"-0.5px", marginBottom:10 }}>Try a Demo Pull</p>
              <p style={{ fontSize:14, color:T.textSec, lineHeight:1.7 }}>
                This is a simulation. Results do not reflect real inventory odds. No credits are spent and cards are not added to your vault.
              </p>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:32, padding:"16px 0", marginBottom:24, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
              {[{label:"Credits spent",val:"0"},{label:"Saved to vault",val:"No"}].map((item,i) => (
                <div key={item.label} style={{ textAlign:"center" }}>
                  {i > 0 && null}
                  <p style={{ fontSize:10, color:T.textMuted, fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:4 }}>{item.label}</p>
                  <p style={{ fontSize:20, fontWeight:800, color:T.text }}>{item.val}</p>
                </div>
              ))}
            </div>
            <button onClick={onConfirm} style={{ width:"100%", padding:"14px 0", background:T.surface, border:`1.5px solid ${T.borderMed}`, borderRadius:12, color:T.text, fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10 }}>
              Open Demo Pack →
            </button>
            <button onClick={onClose} style={{ width:"100%", padding:"12px 0", background:"none", border:"none", color:T.textMuted, fontSize:14, cursor:"pointer" }}>Cancel</button>
          </>
        )}

        {/* Opening */}
        {phase === "opening" && (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎴</div>
            <p style={{ fontSize:15, color:T.textSec, fontWeight:600 }}>Opening pack…</p>
          </div>
        )}

        {/* Result */}
        {phase === "result" && card && (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.4px", textTransform:"uppercase", color:T.textMuted, marginBottom:10 }}>Demo Result · Simulation Only</p>
              {/* Card frame */}
              <div style={{ margin:"0 auto 20px", width:160, aspectRatio:"2.5/3.5", background:`linear-gradient(135deg,${RARITY_BG[card.rarity]},${T.surface})`, border:`2px solid ${RARITY_BORDER[card.rarity]}`, borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, boxShadow:`0 0 40px ${RARITY_COLOR[card.rarity]}22` }}>
                <span style={{ fontSize:44 }}>🎴</span>
                <RarityPill rarity={card.rarity} />
              </div>
              <p style={{ fontSize:18, fontWeight:800, color:T.text, letterSpacing:"-0.4px", marginBottom:4 }}>{card.name}</p>
              <p style={{ fontSize:12, color:T.textMuted, marginBottom:16 }}>{card.set}</p>
              <div style={{ display:"inline-flex", gap:24, padding:"12px 24px", background:T.surface, borderRadius:12, border:`1px solid ${T.border}` }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:9, color:T.textMuted, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>Est. Value</p>
                  <p style={{ fontSize:20, fontWeight:900, color:T.text }}>{card.value}</p>
                </div>
                <div style={{ width:1, background:T.border }} />
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:9, color:T.textMuted, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>Credits</p>
                  <p style={{ fontSize:20, fontWeight:900, color:T.text }}>{card.credits.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width:"100%", padding:"14px 0", background:T.green, border:"none", borderRadius:12, color:"#052e16", fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:10, letterSpacing:"0.2px" }}>
              Open a Real Pack
            </button>
            <button onClick={onConfirm} style={{ width:"100%", padding:"12px 0", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, color:T.textSec, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10 }}>
              Try Demo Again →
            </button>
            <button onClick={onClose} style={{ width:"100%", padding:"10px 0", background:"none", border:"none", color:T.textMuted, fontSize:13, cursor:"pointer" }}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PackDetailPrototype() {
  const [selectedTier, setSelectedTier] = useState("pro");
  const [quantity, setQuantity]         = useState(1);
  const [oddsOpen, setOddsOpen]         = useState(false);
  const [demoPhase, setDemoPhase]       = useState<DemoPhase>("closed");
  const [demoCard, setDemoCard]         = useState<DemoCard | null>(null);
  const [packBumped, setPackBumped]     = useState(false);

  const currentTier = TIERS.find(t => t.id === selectedTier) ?? TIERS[2]!;
  const totalPrice  = (currentTier.usd * quantity).toFixed(0);

  const handleOpenPack = useCallback(() => {
    setPackBumped(true);
    setTimeout(() => setPackBumped(false), 700);
  }, []);

  const handleStartDemo = useCallback(() => setDemoPhase("confirming"), []);

  const handleConfirmDemo = useCallback(() => {
    setDemoPhase("opening");
    setTimeout(() => {
      const card = DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)]!;
      setDemoCard(card);
      setDemoPhase("result");
    }, 1100);
  }, []);

  const handleCloseDemo = useCallback(() => {
    setDemoPhase("closed");
    setDemoCard(null);
  }, []);

  return (
    <>
      {/* ── Responsive layout rules ── */}
      <style>{`
        body { margin:0; }
        * { box-sizing:border-box; }
        .pd-tier-grid  { grid-template-columns:repeat(2,1fr); }
        .pd-trust-row  { grid-template-columns:repeat(2,1fr); }
        .pd-prizes     { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        .pd-hero       { display:grid; grid-template-columns:1fr; gap:40px; }
        @media(min-width:640px)  { .pd-prizes { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:768px)  { .pd-trust-row { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:1024px) {
          .pd-hero      { grid-template-columns:1.05fr 0.95fr; align-items:start; gap:64px; }
          .pd-tier-grid { grid-template-columns:repeat(3,1fr); }
          .pd-prizes    { grid-template-columns:repeat(4,1fr); }
          .pd-pack-col  { position:sticky; top:80px; }
        }
        ::-webkit-scrollbar       { height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" }}>

        {/* ── Nav ── */}
        <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(11,11,14,0.92)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:17, fontWeight:900, letterSpacing:"-0.3px" }}>
                Pull<span style={{ color:T.green }}>Hub</span>
              </span>
              <span style={{ color:T.border, fontSize:14 }}>›</span>
              <span style={{ fontSize:12, color:T.textMuted }}>Mystery Packs</span>
              <span style={{ color:T.border, fontSize:14 }}>›</span>
              <span style={{ fontSize:12, color:T.textSec, fontWeight:600 }}>Platinum Legacy</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:999 }}>
              <span style={{ fontSize:14 }}>🪙</span>
              <span style={{ fontSize:13, fontWeight:700 }}>12,500</span>
              <span style={{ fontSize:11, color:T.textMuted }}>credits</span>
            </div>
          </div>
        </div>

        {/* ── Page ── */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px 100px" }}>

          {/* ══ HERO GRID ══════════════════════════════════════════════════ */}
          <div className="pd-hero">

            {/* Left — Pack visual */}
            <div className="pd-pack-col">
              {/* Social proof ticker */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:16, padding:"6px 14px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.16)", borderRadius:999 }}>
                <span style={{ fontSize:14 }}>🔥</span>
                <span style={{ fontSize:12, color:"#FCA5A5", fontWeight:600 }}>{PACK.recentCount} people opened this in the last hour</span>
              </div>

              <PackVisual bumped={packBumped} />

              <div style={{ marginTop:28 }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.3px", color:T.textMuted, textTransform:"uppercase", marginBottom:6 }}>Top value</p>
                <p style={{ fontSize:14, color:T.textSec, lineHeight:1.6 }}>
                  Up to <strong style={{ color:T.text }}>$649 per pull</strong> · See prize pool below
                </p>
              </div>
            </div>

            {/* Right — Controls */}
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

              {/* Badges */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                <span style={{ padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:700, background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.22)", color:"#C084FC" }}>✦ Featured Pack</span>
                <span style={{ padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:700, background:T.greenSoft, border:`1px solid ${T.greenBorder}`, color:T.green }}>{PACK.buybackRate}% Buyback</span>
                <span style={{ padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:700, background:T.surface, border:`1px solid ${T.border}`, color:T.textSec }}>{PACK.type}</span>
              </div>

              {/* Title */}
              <div>
                <p style={{ fontSize:11, color:T.textMuted, fontWeight:600, letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:6 }}>{PACK.category}</p>
                <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:900, letterSpacing:"-1px", lineHeight:1.1, marginBottom:10 }}>{PACK.name}</h1>
                <p style={{ fontSize:14, color:T.textSec, lineHeight:1.7 }}>{PACK.description}</p>
              </div>

              <Divider />

              {/* Tier selector */}
              <div>
                <SectionEyebrow>Select Tier</SectionEyebrow>
                <TierGrid tiers={TIERS} selected={selectedTier} onSelect={setSelectedTier} />
              </div>

              <Divider />

              {/* Remaining */}
              <ProgressSection remaining={PACK.remaining} total={PACK.total} />

              <Divider />

              {/* Quantity */}
              <div>
                <SectionEyebrow>How many?</SectionEyebrow>
                <QuantitySelector qty={quantity} onMinus={() => setQuantity(q => Math.max(1,q-1))} onPlus={() => setQuantity(q => Math.min(100,q+1))} />
              </div>

              {/* Primary CTA */}
              <button onClick={handleOpenPack} style={{ width:"100%", padding:"17px 0", background:T.green, border:"none", borderRadius:14, color:"#052e16", fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:"0.1px", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 0 32px rgba(34,197,94,0.18)", transition:"transform 0.12s,box-shadow 0.12s" }}>
                <span style={{ fontSize:18 }}>🎴</span>
                Open {quantity > 1 ? `${quantity} Packs` : "Pack"}
                <span style={{ marginLeft:"auto", fontSize:14, fontWeight:900, opacity:0.85 }}>${totalPrice}</span>
              </button>

              {/* Secondary CTA — Demo */}
              <button onClick={handleStartDemo} style={{ width:"100%", padding:"14px 0", background:"none", border:`1.5px solid ${T.borderMed}`, borderRadius:14, color:T.textSec, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"0.1px", transition:"border-color 0.12s,color 0.12s" }}>
                ▶ Try a Demo Pull
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.5px", color:T.textMuted, textTransform:"uppercase", marginLeft:4 }}>Free</span>
              </button>

              {/* Trust */}
              <TrustStrip />
            </div>
          </div>

          {/* ══ PRIZE POOL ═══════════════════════════════════════════════ */}
          <div style={{ marginTop:72 }}>
            <SectionEyebrow>Prize Pool</SectionEyebrow>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,30px)", fontWeight:900, letterSpacing:"-0.6px", marginBottom:6 }}>Top Hits</h2>
            <p style={{ fontSize:14, color:T.textSec, marginBottom:24 }}>Exact inventory counts. Updated in real time.</p>
            <div className="pd-prizes">
              {PRIZES.map(item => <PrizeCard key={item.id} item={item} />)}
            </div>
          </div>

          {/* ══ ODDS ═════════════════════════════════════════════════════ */}
          <div style={{ marginTop:48 }}>
            <OddsTable open={oddsOpen} onToggle={() => setOddsOpen(o => !o)} />
          </div>

          {/* ══ BUYBACK ══════════════════════════════════════════════════ */}
          <div style={{ marginTop:24 }}>
            <BuybackCard rate={PACK.buybackRate} />
          </div>

          {/* ══ RECENT PULLS ═════════════════════════════════════════════ */}
          <div style={{ marginTop:64 }}>
            <RecentPullsRow pulls={RECENT_PULLS} />
          </div>

          {/* ══ BOTTOM REPEAT CTA ════════════════════════════════════════ */}
          <div style={{ marginTop:72, padding:32, background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center" }}>
            <p style={{ fontSize:22, fontWeight:900, letterSpacing:"-0.5px" }}>Ready to pull?</p>
            <p style={{ fontSize:14, color:T.textSec, maxWidth:400 }}>
              {PACK.remaining.toLocaleString()} packs remaining. Every pull is sourced from verified, authenticated inventory.
            </p>
            <button onClick={handleOpenPack} style={{ padding:"16px 40px", background:T.green, border:"none", borderRadius:999, color:"#052e16", fontSize:15, fontWeight:800, cursor:"pointer", letterSpacing:"0.2px" }}>
              Open {quantity > 1 ? `${quantity} Packs` : "Pack"} · ${totalPrice}
            </button>
            <button onClick={handleStartDemo} style={{ padding:"12px 28px", background:"none", border:`1px solid ${T.border}`, borderRadius:999, color:T.textMuted, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Try a Demo Pull (Free)
            </button>
          </div>
        </div>
      </div>

      {/* ── Demo modal ── */}
      <DemoModal phase={demoPhase} card={demoCard} onConfirm={handleConfirmDemo} onClose={handleCloseDemo} />
    </>
  );
}
