"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — mirrors globals.css --ph-* vars
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
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Mock live pull data
// ─────────────────────────────────────────────────────────────────────────────

const LIVE_PULLS = [
  { user: "trainer_j",  card: "Charizard ex SAR",              value: "$480", rarity: "legendary", timeAgo: "just now" },
  { user: "cardvault",  card: "Shohei Ohtani RC PSA 10",       value: "$320", rarity: "epic",      timeAgo: "1m ago"   },
  { user: "pullking",   card: "Luffy Manga STR",               value: "$210", rarity: "rare",      timeAgo: "2m ago"   },
  { user: "slabsonly",  card: "Blue-Eyes White Dragon 1st Ed", value: "$550", rarity: "legendary", timeAgo: "4m ago"   },
  { user: "holo_haul",  card: "Pikachu Illustrator Reprint",   value: "$90",  rarity: "rare",      timeAgo: "6m ago"   },
] as const;

const RARITY_COLOR: Record<string, string> = {
  common:    "var(--ph-rarity-common)",
  rare:      "var(--ph-rarity-rare)",
  epic:      "var(--ph-rarity-epic)",
  legendary: "var(--ph-rarity-legendary)",
  mythic:    "var(--ph-rarity-mythic)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Pack foil palette
// ─────────────────────────────────────────────────────────────────────────────

function getPackStyle(variant: "pokemon" | "sports" | "onepiece"): {
  grad: string;
  glow: string;
  artBorder: string;
} {
  if (variant === "pokemon")
    return {
      grad:      "linear-gradient(168deg,#12111e 0%,#1b1930 52%,#0e0d18 100%)",
      glow:      "rgba(130,110,200,0.35)",
      artBorder: "rgba(140,125,210,0.14)",
    };
  if (variant === "sports")
    return {
      grad:      "linear-gradient(168deg,#14100e 0%,#1e1614 52%,#0e0c0b 100%)",
      glow:      "rgba(190,70,60,0.32)",
      artBorder: "rgba(190,80,70,0.14)",
    };
  return {
    grad:      "linear-gradient(168deg,#0d141e 0%,#152030 52%,#090e16 100%)",
    glow:      "rgba(60,100,190,0.32)",
    artBorder: "rgba(80,120,200,0.14)",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroPack — single stylised pack object
// ─────────────────────────────────────────────────────────────────────────────

interface HeroPackProps {
  variant:  "pokemon" | "sports" | "onepiece";
  label:    string;
  rotate?:  number;
  scale?:   number;
  blur?:    number;
  opacity?: number;
  zIndex?:  number;
}

function HeroPack({
  variant, label,
  rotate  = 0,
  scale   = 1,
  blur    = 0,
  opacity = 1,
  zIndex  = 0,
}: HeroPackProps) {
  const s = getPackStyle(variant);

  return (
    <div style={{
      position:        "absolute",
      width:           112,
      height:          158,
      transform:       `rotate(${rotate}deg) scale(${scale})`,
      filter:          blur > 0 ? `blur(${blur}px)` : undefined,
      opacity,
      zIndex,
      transformOrigin: "bottom center",
    }}>
      {/* Cast shadow / glow beneath pack */}
      <div style={{
        position:   "absolute",
        bottom:     -18,
        left:       "8%",
        right:      "8%",
        height:     28,
        background: `linear-gradient(to bottom, ${s.glow} 0%, transparent 100%)`,
        filter:     "blur(14px)",
        opacity:    0.7,
      }} />

      {/* Pack body */}
      <div style={{
        width:          "100%",
        height:         "100%",
        borderRadius:   9,
        background:     s.grad,
        boxShadow:      `inset 0 0 0 1px rgba(255,255,255,0.10),
                         inset 1px 1px 0 rgba(255,255,255,0.07),
                         0 4px 12px rgba(0,0,0,0.60),
                         0 16px 48px rgba(0,0,0,0.72)`,
        display:        "flex",
        flexDirection:  "column",
        overflow:       "hidden",
        position:       "relative",
      }}>
        {/* Gloss shimmer */}
        <div style={{
          position:   "absolute",
          inset:      0,
          background: "linear-gradient(130deg, rgba(255,255,255,0.09) 0%, transparent 36%, rgba(255,255,255,0.04) 54%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {/* Top bar */}
        <div style={{ height: 10, background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }} />
        {/* Art area */}
        <div style={{
          margin:       "8px 10px 6px",
          flex:         1,
          background:   "rgba(0,0,0,0.48)",
          borderRadius: 4,
          border:       `1px solid ${s.artBorder}`,
          boxShadow:    "inset 0 1px 0 rgba(255,255,255,0.04)",
        }} />
        {/* Label */}
        <div style={{ padding: "0 10px 10px" }}>
          <p style={{ fontSize: 7,  fontWeight: 700, color: "rgba(255,255,255,0.32)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>
            Mystery Pack
          </p>
          <p style={{ fontSize: 9,  fontWeight: 900, color: "rgba(255,255,255,0.80)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PackStage — fanned pack display with depth-of-field (signature element)
//
// Design risk: side packs are blurred + dimmed like a shallow-focus photograph.
// This makes the visual feel like a physical collectibles shoot, not a game UI.
// ─────────────────────────────────────────────────────────────────────────────

function PackStage() {
  return (
    <div style={{ position: "relative", width: 220, height: 240, margin: "0 auto" }}>
      {/* Spotlight from above — green tint, very faint */}
      <div style={{
        position:    "absolute",
        top:         -48,
        left:        "50%",
        transform:   "translateX(-50%)",
        width:       200,
        height:      200,
        background:  "radial-gradient(ellipse at top, rgba(16,185,129,0.07) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* Left pack — shallow focus out */}
      <div style={{ position: "absolute", left: 2, bottom: 0 }}>
        <HeroPack variant="sports"   label="Sports Icons"   rotate={-19} scale={0.87} blur={1.5} opacity={0.52} zIndex={1} />
      </div>

      {/* Right pack — shallow focus out */}
      <div style={{ position: "absolute", right: 2, bottom: 0 }}>
        <HeroPack variant="onepiece" label="One Piece STR"  rotate={19}  scale={0.87} blur={1.5} opacity={0.52} zIndex={1} />
      </div>

      {/* Center pack — in focus, full brightness */}
      <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
        <HeroPack variant="pokemon"  label="Pokémon Vintage" rotate={0}  scale={1}    blur={0}   opacity={1}    zIndex={2} />
      </div>

      {/* Floor reflection */}
      <div style={{
        position:   "absolute",
        bottom:     -8,
        left:       "10%",
        right:      "10%",
        height:     16,
        background: "linear-gradient(to bottom, rgba(16,185,129,0.06), transparent)",
        filter:     "blur(6px)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LivePullBadge — cycles through recent pulls with fade transition
// ─────────────────────────────────────────────────────────────────────────────

function LivePullBadge() {
  const [idx,     setIdx]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIdx(i => (i + 1) % LIVE_PULLS.length);
        setVisible(true);
      }, 290);
      return () => clearTimeout(swap);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const pull = LIVE_PULLS[idx];
  const rc   = RARITY_COLOR[pull.rarity] ?? RARITY_COLOR.common;

  return (
    <div style={{
      display:       "flex",
      alignItems:    "center",
      gap:           10,
      background:    T.surface,
      border:        `1px solid ${T.border}`,
      borderRadius:  10,
      padding:       "10px 14px",
      opacity:       visible ? 1 : 0,
      transform:     visible ? "translateY(0)" : "translateY(4px)",
      transition:    "opacity 280ms ease-out, transform 280ms ease-out",
    }}>
      {/* Live dot */}
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: T.green, flexShrink: 0,
        boxShadow: "0 0 6px rgba(16,185,129,0.55)",
      }} />

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 8, fontWeight: 800, color: rc,
            background: `${rc}18`, border: `1px solid ${rc}28`,
            borderRadius: 3, padding: "1px 5px",
            letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0,
          }}>
            {pull.rarity}
          </span>
          <span style={{ fontSize: 9, color: T.textMuted }}>{pull.timeAgo}</span>
        </div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: T.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          @{pull.user} pulled {pull.card}
        </p>
      </div>

      <span style={{ fontSize: 13, fontWeight: 900, color: T.green, letterSpacing: "-0.02em", flexShrink: 0 }}>
        {pull.value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TrustRow — three platform pillars, grid-style
// ─────────────────────────────────────────────────────────────────────────────

function TrustRow() {
  const pillars = [
    { label: "Provably Fair",          note: "Every draw verified before you pay"  },
    { label: "Ships All 50 States",    note: "Real cards to your door"              },
    { label: "70% Free Buyback",       note: "Cash back on any card, any time"     },
  ];

  return (
    <div style={{
      display:      "flex",
      borderTop:    `1px solid ${T.border}`,
      borderBottom: `1px solid ${T.border}`,
    }}>
      {pillars.map((p, i) => (
        <div key={p.label} style={{
          flex:        1,
          padding:     "16px 10px",
          textAlign:   "center",
          borderRight: i < pillars.length - 1 ? `1px solid ${T.border}` : undefined,
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 3, letterSpacing: "-0.01em" }}>
            {p.label}
          </p>
          <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.45 }}>
            {p.note}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HowItWorks — three-step sequential explainer
// ─────────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Choose a pack",
      body:  "Browse packs by TCG, price range, or rarity pool. Every pack shows the full prize list before you commit.",
    },
    {
      step: "02",
      title: "Open and reveal",
      body:  "Your draw is seeded on-chain before you pay — provably fair, independently verifiable. Open and watch your card appear.",
    },
    {
      step: "03",
      title: "Keep, ship, or sell",
      body:  "Hold the card digitally, request physical delivery anywhere in the US, or get 70% cash buyback instantly.",
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: "52px 24px", maxWidth: 440, margin: "0 auto" }}>
      <p style={{
        fontSize: 9, fontWeight: 800, color: T.textMuted,
        letterSpacing: "0.22em", textTransform: "uppercase",
        marginBottom: 12, textAlign: "center",
      }}>
        The process
      </p>
      <h2 style={{
        fontSize: 26, fontWeight: 900, color: T.text,
        letterSpacing: "-0.03em", marginBottom: 36, textAlign: "center",
      }}>
        How it works
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {steps.map(({ step, title, body }) => (
          <div key={step} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <span style={{
              fontSize: 11, fontWeight: 900, color: T.green,
              letterSpacing: "0.06em", flexShrink: 0, minWidth: 24,
              marginTop: 2,
            }}>
              {step}
            </span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 5, letterSpacing: "-0.01em" }}>
                {title}
              </p>
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.65 }}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100dvh", color: T.text }}>

      {/* ── Navigation ── */}
      <nav style={{
        position:       "sticky",
        top:            0,
        zIndex:         50,
        background:     "rgba(8,8,9,0.90)",
        backdropFilter: "blur(20px)",
        borderBottom:   `1px solid ${T.border}`,
        padding:        "14px 20px",
        display:        "flex",
        alignItems:     "center",
        gap:            10,
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>
          Pull<span style={{ color: T.green }}>Hub</span>
        </span>
        <div style={{ flex: 1 }} />
        <Link href="/packs" style={{
          fontSize: 13, fontWeight: 600, color: T.textMuted,
          textDecoration: "none", padding: "6px 12px",
        }}>
          Browse packs
        </Link>
        <Link href="/sign-in" style={{
          fontSize: 13, fontWeight: 700, color: T.greenInk,
          background: T.green, borderRadius: 999, padding: "7px 18px",
          textDecoration: "none",
        }}>
          Sign in
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        padding:        "52px 24px 0",
        maxWidth:       440,
        margin:         "0 auto",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        textAlign:      "center",
      }}>
        {/* Eyebrow */}
        <p style={{
          fontSize:      10,
          fontWeight:    800,
          color:         T.green,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom:  18,
        }}>
          Trading Card Mystery Packs
        </p>

        {/* Headline */}
        <h1 style={{
          fontSize:      "clamp(38px, 11vw, 56px)",
          fontWeight:    900,
          color:         T.text,
          letterSpacing: "-0.04em",
          lineHeight:    1.04,
          marginBottom:  18,
        }}>
          Collectors<br />pull here.
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize:     15,
          color:        T.textSec,
          lineHeight:   1.65,
          marginBottom: 44,
          maxWidth:     310,
        }}>
          Mystery packs with real trading cards. Provably fair draws,
          free buyback on every card, ships to your door.
        </p>

        {/* Pack stage — depth-of-field fan display */}
        <PackStage />

        {/* Live pull ticker */}
        <div style={{ marginTop: 30, width: "100%" }}>
          <LivePullBadge />
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 24 }}>
          <Link href="/packs" style={{
            display:        "block",
            textAlign:      "center",
            padding:        "16px 0",
            background:     T.green,
            borderRadius:   999,
            fontSize:       15,
            fontWeight:     800,
            color:          T.greenInk,
            letterSpacing:  "0.01em",
            textDecoration: "none",
            boxShadow:      "0 0 40px rgba(16,185,129,0.22)",
          }}>
            Browse packs
          </Link>
          <a href="#how-it-works" style={{
            display:        "block",
            textAlign:      "center",
            padding:        "15px 0",
            border:         `1px solid ${T.border}`,
            borderRadius:   999,
            fontSize:       14,
            fontWeight:     600,
            color:          T.textSec,
            textDecoration: "none",
          }}>
            See how it works
          </a>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 16, lineHeight: 1.5 }}>
          No subscription required. Free account. Cancel anytime.
        </p>
      </section>

      {/* ── Trust strip ── */}
      <div style={{ marginTop: 52 }}>
        <TrustRow />
      </div>

      {/* ── How it works ── */}
      <HowItWorks />

      {/* ── Divider ── */}
      <div style={{ height: 1, background: T.border, margin: "0 24px" }} />

      {/* ── Final CTA card ── */}
      <div style={{ padding: "48px 24px 72px", maxWidth: 440, margin: "0 auto" }}>
        <div style={{
          background:   T.surface,
          border:       `1px solid ${T.border}`,
          borderRadius: 16,
          padding:      "32px 24px",
          textAlign:    "center",
        }}>
          <p style={{
            fontSize: 22, fontWeight: 900, color: T.text,
            letterSpacing: "-0.03em", marginBottom: 10,
          }}>
            Ready to pull?
          </p>
          <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24, lineHeight: 1.65 }}>
            Create a free account and open your first pack in under two minutes.
          </p>
          <Link href="/sign-up" style={{
            display:        "block",
            textAlign:      "center",
            padding:        "15px 0",
            background:     T.green,
            borderRadius:   999,
            fontSize:       14,
            fontWeight:     800,
            color:          T.greenInk,
            textDecoration: "none",
            boxShadow:      "0 0 32px rgba(16,185,129,0.20)",
          }}>
            Create free account
          </Link>
        </div>
      </div>

    </div>
  );
}
