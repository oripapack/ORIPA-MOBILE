"use client";

/**
 * Pack Detail Screen  (/pack-detail?packId=xxx)
 *
 * Changes from previous version:
 *   - Reads packId from URL search param (useSearchParams)
 *   - Pack data from shared CATALOG_PACKS (same source as mobile app)
 *   - PriceTierSelector replaced with 1/10/100 quantity chip selector
 *     (mirrors mobile PackOpenQuantity component)
 *   - CTA navigates to /opening?packId=xxx
 *   - BottomNav added
 */

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNav } from "../../components/layout/BottomNav";
import { Button } from "../../components/ui/Button";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { RarityBadge, BuybackBadge, StatusBadge, TrustBadge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { cn } from "../../components/utils/cn";
import { CATALOG_PACKS, getFeaturedPack } from "@/data/catalog";
import type { CatalogPack } from "@/data/catalog";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
type DemoPhase = "closed" | "confirming" | "opening" | "result";
type OpenQty = 1 | 10 | 100;

interface PrizeItem {
  id: string; name: string; set: string;
  rarity: Rarity; estimatedValue: string;
  totalQty: number; remaining: number;
}
interface OddsEntry {
  rarity: Rarity; label: string;
  chance: string; valueRange: string; example: string;
}
interface RecentPullItem {
  id: string; username: string; card: string;
  rarity: Rarity; value: string; timeAgo: string;
}
interface DemoCard {
  name: string; set: string; rarity: Rarity;
  value: string; credits: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static mock data — prize pool, odds, recent pulls, demo
// ─────────────────────────────────────────────────────────────────────────────

const PRIZES: PrizeItem[] = [
  { id:"p1", name:"Charizard ex SAR",         set:"Obsidian Flames", rarity:"mythic",    estimatedValue:"$649",   totalQty:2,   remaining:1   },
  { id:"p2", name:"Umbreon VMAX Alt Art",      set:"Evolving Skies",  rarity:"legendary", estimatedValue:"$380",   totalQty:4,   remaining:2   },
  { id:"p3", name:"Pikachu VMAX Rainbow Rare", set:"Vivid Voltage",   rarity:"legendary", estimatedValue:"$280",   totalQty:6,   remaining:4   },
  { id:"p4", name:"Mew ex Full Art",           set:"Paldea Evolved",  rarity:"epic",      estimatedValue:"$55",    totalQty:50,  remaining:38  },
  { id:"p5", name:"Arceus VSTAR Gold Card",    set:"Crown Zenith",    rarity:"epic",      estimatedValue:"$75",    totalQty:30,  remaining:22  },
  { id:"p6", name:"Iono Full Art Trainer",     set:"Paldea Evolved",  rarity:"rare",      estimatedValue:"$22",    totalQty:200, remaining:148 },
  { id:"p7", name:"Sealed Booster Pack",       set:"Various Sets",    rarity:"common",    estimatedValue:"$5–$12", totalQty:500, remaining:412 },
];

const ODDS: OddsEntry[] = [
  { rarity:"mythic",    label:"Mythic",    chance:"0.10%", valueRange:"$500+",       example:"Charizard ex SAR"      },
  { rarity:"legendary", label:"Legendary", chance:"1.00%", valueRange:"$100 – $500", example:"Umbreon VMAX Alt Art"  },
  { rarity:"epic",      label:"Epic",      chance:"4.90%", valueRange:"$25 – $100",  example:"Mew ex Full Art"       },
  { rarity:"rare",      label:"Rare",      chance:"20.0%", valueRange:"$8 – $25",    example:"Iono Full Art Trainer" },
  { rarity:"common",    label:"Common",    chance:"74.0%", valueRange:"$1 – $8",     example:"Sealed Booster Pack"   },
];

const RECENT_PULLS_MOCK: RecentPullItem[] = [
  { id:"r1", username:"trainer_alex",   card:"Charizard ex SAR",      rarity:"mythic",    value:"$649", timeAgo:"2m ago"  },
  { id:"r2", username:"casey_m",        card:"Umbreon VMAX Alt Art",  rarity:"legendary", value:"$380", timeAgo:"5m ago"  },
  { id:"r3", username:"ryu_tcg",        card:"Iono Full Art Trainer", rarity:"rare",      value:"$22",  timeAgo:"8m ago"  },
  { id:"r4", username:"mika_pulls",     card:"Mew ex Full Art",       rarity:"epic",      value:"$55",  timeAgo:"11m ago" },
  { id:"r5", username:"jake_collector", card:"Pikachu VMAX Rainbow",  rarity:"legendary", value:"$280", timeAgo:"14m ago" },
  { id:"r6", username:"sam_r",          card:"Arceus VSTAR Gold",     rarity:"epic",      value:"$75",  timeAgo:"18m ago" },
];

const DEMO_POOL: DemoCard[] = [
  { name:"Charizard ex Full Art", set:"Obsidian Flames", rarity:"epic",      value:"$84",  credits:8_400  },
  { name:"Iono Full Art Trainer", set:"Paldea Evolved",  rarity:"rare",      value:"$22",  credits:2_200  },
  { name:"Sealed Booster Pack",   set:"Various Sets",    rarity:"common",    value:"$8",   credits:800    },
  { name:"Umbreon VMAX Alt Art",  set:"Evolving Skies",  rarity:"legendary", value:"$380", credits:38_000 },
  { name:"Mew ex Full Art",       set:"Paldea Evolved",  rarity:"epic",      value:"$55",  credits:5_500  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rarity static class maps (full class names required for Tailwind JIT)
// ─────────────────────────────────────────────────────────────────────────────

const RARITY_TOP_LINE: Record<Rarity, string> = {
  common:    "bg-ph-common",
  rare:      "bg-ph-rare",
  epic:      "bg-ph-epic",
  legendary: "bg-ph-legendary",
  mythic:    "bg-ph-mythic",
};

const RARITY_CARD_BORDER: Record<Rarity, string> = {
  common:    "border-ph-common-border",
  rare:      "border-ph-rare-border",
  epic:      "border-ph-epic-border",
  legendary: "border-ph-legendary-border",
  mythic:    "border-ph-mythic-border",
};

const RARITY_CARD_BG: Record<Rarity, string> = {
  common:    "bg-ph-common-bg",
  rare:      "bg-ph-rare-bg",
  epic:      "bg-ph-epic-bg",
  legendary: "bg-ph-legendary-bg",
  mythic:    "bg-ph-mythic-bg",
};

const RARITY_AURA: Record<Rarity, string> = {
  common:    "",
  rare:      "",
  epic:      "shadow-ph-aura-epic",
  legendary: "shadow-ph-aura-legendary",
  mythic:    "shadow-ph-aura-mythic",
};

// ─────────────────────────────────────────────────────────────────────────────
// Pack visual — large hero card with decorative art placeholder
// ─────────────────────────────────────────────────────────────────────────────

function PackVisual({ pack, bumped }: { pack: CatalogPack; bumped: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.09) 0%, transparent 68%)",
        }}
        aria-hidden
      />

      {/* Pack card frame */}
      <div
        className={cn(
          "relative w-full max-w-[340px] overflow-hidden rounded-[20px]",
          "border border-ph-border-md",
          "flex flex-col items-center justify-center gap-4",
          "ph-transition",
          bumped ? "-translate-y-1.5 scale-[1.01]" : "translate-y-0 scale-100",
        )}
        style={{
          aspectRatio: "3/4",
          background: "linear-gradient(155deg, #1c1535 0%, #12102a 45%, #0d0c18 100%)",
          boxShadow:
            "0 0 0 1px rgba(168,85,247,0.07), 0 32px 80px rgba(0,0,0,0.65), 0 0 56px rgba(168,85,247,0.07)",
        }}
      >
        {/* Top sheen */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 35%)",
          }}
          aria-hidden
        />

        {/* Card art area */}
        <div
          className="relative overflow-hidden rounded-ph-lg border border-ph-epic-border"
          style={{
            width: "70%",
            aspectRatio: "2.5/3.5",
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.13) 0%, rgba(96,165,250,0.07) 50%, rgba(236,72,153,0.10) 100%)",
          }}
        >
          {/* Holographic sweep */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)",
            }}
            aria-hidden
          />
          {/* Inner decorative content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-20 w-14 rounded-ph-md border border-ph-border bg-ph-surface-raise opacity-70" />
            <div className="rounded-ph-sm border border-ph-epic-border bg-ph-epic-bg px-2.5 py-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-ph-epic">
                {pack.category}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom name strip */}
        <div className="w-full px-5 py-3 text-center">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-widest text-ph-text-muted">
            Pull Hub
          </p>
          <p className="text-base font-extrabold tracking-tight text-ph-text">
            {pack.name}
          </p>
        </div>
      </div>

      {/* Verified badge */}
      <div className="mt-4 flex items-center gap-1.5 rounded-ph-pill border border-ph-border bg-ph-surface px-3.5 py-1.5">
        <span className="text-xs font-bold text-ph-green">✓</span>
        <span className="text-xs font-semibold text-ph-text-sec">
          Verified Inventory · Authenticated Source
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quantity picker — 1 / 10 / 100 chips (mirrors mobile PackOpenQuantity)
// ─────────────────────────────────────────────────────────────────────────────

const QTY_OPTIONS: { qty: OpenQty; label: string; badge?: string }[] = [
  { qty: 1,   label: "Open Pack"      },
  { qty: 10,  label: "Fast Open ×10", badge: "Popular" },
  { qty: 100, label: "Rush ×100"      },
];

function PackOpenQuantity({
  selected,
  onSelect,
}: {
  selected: OpenQty;
  onSelect: (q: OpenQty) => void;
}) {
  return (
    <div className="flex gap-2">
      {QTY_OPTIONS.map(({ qty, label, badge }) => {
        const active = selected === qty;
        return (
          <button
            key={qty}
            type="button"
            onClick={() => onSelect(qty)}
            aria-pressed={active}
            className={cn(
              "relative flex flex-1 flex-col items-center rounded-ph-xl border px-3 py-3 outline-none",
              "transition-colors duration-[150ms] ease-out",
              "focus-visible:ring-2 focus-visible:ring-ph-green",
              active
                ? "border-ph-green bg-ph-green-soft text-ph-text"
                : "border-ph-border bg-ph-surface text-ph-text-muted hover:border-ph-border-md hover:text-ph-text-sec",
            )}
          >
            {badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-ph-pill border border-ph-green-border bg-ph-green-soft px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-ph-green">
                {badge}
              </span>
            )}
            <span className="text-2xl font-black tabular-nums text-ph-text">{qty}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">
              pack{qty > 1 ? "s" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Prize card
// ─────────────────────────────────────────────────────────────────────────────

function PrizeCard({ item }: { item: PrizeItem }) {
  const pct = item.remaining / item.totalQty;
  const isLow = item.remaining <= 2;

  return (
    <SurfaceCard
      padding="none"
      className={cn("overflow-hidden border", RARITY_CARD_BORDER[item.rarity])}
    >
      {/* Rarity accent line */}
      <div className={cn("h-0.5 w-full opacity-60", RARITY_TOP_LINE[item.rarity])} />

      <div className="flex flex-col gap-2 p-3.5">
        <RarityBadge rarity={item.rarity} />

        <p className="text-sm font-bold leading-snug text-ph-text">{item.name}</p>
        <p className="text-xs text-ph-text-muted">{item.set}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-black tracking-tight text-ph-text">
            {item.estimatedValue}
          </span>
          {isLow && (
            <StatusBadge variant="warning">{item.remaining} left</StatusBadge>
          )}
        </div>

        <ProgressBar
          value={pct}
          sublabel={`${item.remaining} / ${item.totalQty} remaining`}
          color={isLow ? "red" : "green"}
        />
      </div>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Odds disclosure accordion
// ─────────────────────────────────────────────────────────────────────────────

function OddsTable({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <SurfaceCard padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ph-green"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-base text-ph-text-muted">◎</span>
          <div className="text-left">
            <p className="text-sm font-bold text-ph-text">Full Odds Disclosure</p>
            <p className="mt-0.5 text-xs text-ph-text-muted">
              All probabilities listed by rarity tier
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex-shrink-0 text-base text-ph-text-muted ph-transition",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open && (
        <>
          <div className="h-px bg-ph-border" />

          <div className="grid grid-cols-[1.2fr_0.7fr_1.1fr_1.6fr] gap-2 px-5 py-2.5">
            {["Tier", "Odds", "Est. Value", "Example"].map((h) => (
              <p key={h} className="text-[9px] font-bold uppercase tracking-widest text-ph-text-muted">
                {h}
              </p>
            ))}
          </div>

          <div className="h-px bg-ph-border" />

          {ODDS.map((row, i) => (
            <div
              key={row.rarity}
              className={cn(
                "grid grid-cols-[1.2fr_0.7fr_1.1fr_1.6fr] items-center gap-2 px-5 py-3",
                i % 2 === 1 ? "bg-white/[0.02]" : "",
              )}
            >
              <RarityBadge rarity={row.rarity} small />
              <p className="text-sm font-bold text-ph-text">{row.chance}</p>
              <p className="text-xs text-ph-text-sec">{row.valueRange}</p>
              <p className="truncate text-xs text-ph-text-muted">{row.example}</p>
            </div>
          ))}
        </>
      )}
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Buyback section
// ─────────────────────────────────────────────────────────────────────────────

function BuybackSection({ rate }: { rate: number }) {
  const options = [
    { label: "Vault & Hold", desc: "Keep it in your digital vault" },
    { label: "Cash Out",     desc: `${rate}% guaranteed buyback`   },
    { label: "Ship It",      desc: "Physical delivery to your door"  },
  ];

  return (
    <div className="flex gap-5 rounded-ph-xl border border-ph-green-border bg-ph-green-soft p-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-ph-lg border border-ph-green-border bg-ph-green-soft">
        <span className="text-xl font-black text-ph-green">$</span>
      </div>

      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold text-ph-text">{rate}% Buyback Guaranteed</p>
          <BuybackBadge rate={rate} />
        </div>

        <p className="mb-4 text-xs leading-relaxed text-ph-text-sec">
          Every pull is eligible for our buyback program. Vault your card and cash out for at
          least{" "}
          <strong className="font-bold text-ph-text">{rate}% of its estimated market value</strong>{" "}
          — no negotiations, no waiting.
        </p>

        <div className="flex flex-wrap gap-6">
          {options.map((opt) => (
            <div key={opt.label}>
              <p className="text-xs font-bold text-ph-green">{opt.label}</p>
              <p className="text-xs text-ph-text-muted">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent pulls row
// ─────────────────────────────────────────────────────────────────────────────

function RecentPullsRow({ pulls }: { pulls: RecentPullItem[] }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Live from the vault"
        title="Recent Pulls"
        action={
          <span className="flex items-center gap-1.5 text-xs text-ph-text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ph-green" />
            Live
          </span>
        }
        className="mb-4"
      />

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {pulls.map((p) => (
          <div
            key={p.id}
            className={cn(
              "flex w-44 flex-shrink-0 flex-col gap-2 rounded-ph-xl border bg-ph-surface p-3.5",
              RARITY_CARD_BORDER[p.rarity],
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <RarityBadge rarity={p.rarity} small />
              <span className="text-[10px] text-ph-text-muted">{p.timeAgo}</span>
            </div>
            <p className="mt-1 text-xs font-bold leading-snug text-ph-text line-clamp-2">
              {p.card}
            </p>
            <div className="mt-auto flex items-center justify-between gap-1">
              <span className="truncate text-[10px] text-ph-text-muted">@{p.username}</span>
              <span className="text-sm font-black tracking-tight text-ph-text">{p.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo modal  (confirm → opening → result)
// ─────────────────────────────────────────────────────────────────────────────

function DemoModal({
  phase,
  card,
  onConfirm,
  onClose,
}: {
  phase: DemoPhase;
  card: DemoCard | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (phase === "closed") return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-[20px] border border-ph-border-md bg-ph-surface-high p-8 shadow-ph-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Confirm ── */}
        {phase === "confirming" && (
          <>
            <div className="mb-6 text-center">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
                Simulation Only
              </p>
              <h2 className="mb-2.5 text-2xl font-black tracking-tight text-ph-text">
                Try a Demo Pull
              </h2>
              <p className="text-sm leading-relaxed text-ph-text-sec">
                This is a simulation. Results do not reflect real inventory odds. No credits
                are spent and cards are not added to your vault.
              </p>
            </div>

            <div className="mb-6 flex justify-center gap-8 border-y border-ph-border py-4">
              {[
                { label: "Credits spent",  val: "0"  },
                { label: "Saved to vault", val: "No" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ph-text-muted">
                    {item.label}
                  </p>
                  <p className="text-xl font-black text-ph-text">{item.val}</p>
                </div>
              ))}
            </div>

            <Button variant="secondary" fullWidth onClick={onConfirm} className="mb-2.5">
              Open Demo Pack →
            </Button>
            <Button variant="ghost" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </>
        )}

        {/* ── Opening ── */}
        {phase === "opening" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 h-14 w-10 rounded-ph-lg border border-ph-border bg-ph-surface-raise" />
            <p className="text-sm font-semibold text-ph-text-sec">Opening pack…</p>
          </div>
        )}

        {/* ── Result ── */}
        {phase === "result" && card && (
          <>
            <div className="mb-6 text-center">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
                Demo Result · Simulation Only
              </p>

              <div
                className={cn(
                  "mx-auto mb-5 flex flex-col items-center justify-center gap-2.5 rounded-ph-xl border-2",
                  RARITY_CARD_BG[card.rarity],
                  RARITY_CARD_BORDER[card.rarity],
                  RARITY_AURA[card.rarity],
                )}
                style={{ width: 160, aspectRatio: "2.5/3.5" }}
              >
                <div className="h-14 w-10 rounded-ph-md border border-ph-border bg-ph-surface-raise opacity-70" />
                <RarityBadge rarity={card.rarity} />
              </div>

              <p className="mb-1 text-lg font-black tracking-tight text-ph-text">{card.name}</p>
              <p className="mb-4 text-xs text-ph-text-muted">{card.set}</p>

              <div className="mx-auto inline-flex gap-6 rounded-ph-lg border border-ph-border bg-ph-surface px-6 py-3">
                {[
                  { label: "Est. Value", val: card.value },
                  { label: "Credits",    val: card.credits.toLocaleString("en-US") },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-6">
                    {i > 0 && <div className="h-6 w-px bg-ph-border" />}
                    <div className="text-center">
                      <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-ph-text-muted">
                        {item.label}
                      </p>
                      <p className="text-xl font-black text-ph-text">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={onClose} className="mb-2.5">
              Open a Real Pack
            </Button>
            <Button variant="secondary" fullWidth onClick={onConfirm} className="mb-2.5">
              Try Demo Again →
            </Button>
            <Button variant="ghost" fullWidth onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust items
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "✓", label: "Verified inventory"  },
  { icon: "◎", label: "Transparent odds"    },
  { icon: "□", label: "Vault storage"       },
  { icon: "→", label: "Physical shipping"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// Inner page — reads searchParams, needs Suspense wrapper
// ─────────────────────────────────────────────────────────────────────────────

function PackDetailInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const packId       = searchParams.get("packId");
  const pack: CatalogPack = packId
    ? (CATALOG_PACKS.find((p) => p.id === packId) ?? getFeaturedPack())
    : getFeaturedPack();

  const [qty,        setQty]        = useState<OpenQty>(1);
  const [oddsOpen,   setOddsOpen]   = useState(false);
  const [demoPhase,  setDemoPhase]  = useState<DemoPhase>("closed");
  const [demoCard,   setDemoCard]   = useState<DemoCard | null>(null);
  const [packBumped, setPackBumped] = useState(false);

  const totalPrice  = pack.price * qty;
  const remaining   = Math.round(pack.remainingFraction * 1_000_000);
  const recentCount = 47;

  const openingHref = `/opening?packId=${pack.id}`;

  const handleOpenPack = useCallback(() => {
    setPackBumped(true);
    setTimeout(() => {
      setPackBumped(false);
      router.push(openingHref);
    }, 300);
  }, [openingHref, router]);

  const handleStartDemo  = useCallback(() => setDemoPhase("confirming"), []);

  const handleConfirmDemo = useCallback(() => {
    setDemoPhase("opening");
    setTimeout(() => {
      const card = DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)]!;
      setDemoCard(card);
      setDemoPhase("result");
    }, 1_100);
  }, []);

  const handleCloseDemo = useCallback(() => {
    setDemoPhase("closed");
    setDemoCard(null);
  }, []);

  return (
    <div className="min-h-dvh bg-ph-bg text-ph-text">
      {/* ── Sticky header ── */}
      <AppHeader
        crumbs={[
          { label: "Packs",     href: "/packs" },
          { label: pack.name                    },
        ]}
        credits={12_500}
      />

      <div className="mx-auto max-w-screen-xl px-4 py-10 pb-28 sm:px-6">

        {/* ══ HERO — two-column on desktop ══════════════════════════════════ */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

          {/* LEFT — pack visual (sticky on desktop) */}
          <div className="lg:sticky lg:top-20">
            {/* Social proof ticker */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-ph-pill border border-ph-red-border bg-ph-red-soft px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ph-red" />
              <span className="text-xs font-semibold" style={{ color: "rgba(252,165,165,0.9)" }}>
                {recentCount} people opened this in the last hour
              </span>
            </div>

            <PackVisual pack={pack} bumped={packBumped} />

            <div className="mt-7">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-ph-text-muted">
                Top value
              </p>
              <p className="text-sm leading-relaxed text-ph-text-sec">
                Up to{" "}
                <strong className="font-bold text-ph-text">{pack.topCard}</strong>
              </p>
            </div>
          </div>

          {/* RIGHT — controls */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {pack.isFeatured    && <StatusBadge variant="featured">Featured Pack</StatusBadge>}
              {pack.isNew         && <StatusBadge variant="success">New</StatusBadge>}
              {pack.isLimitedTime && <StatusBadge variant="warning">Limited Time</StatusBadge>}
              <BuybackBadge rate={pack.buybackRate} />
              <StatusBadge variant="neutral">Mystery Pack</StatusBadge>
            </div>

            {/* Title + description */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ph-text-muted">
                {pack.category}
              </p>
              <h1 className="mb-2.5 text-4xl font-black leading-tight tracking-tight text-ph-text sm:text-5xl">
                {pack.name}
              </h1>
              <p className="text-sm leading-relaxed text-ph-text-sec">{pack.description}</p>
            </div>

            <div className="h-px bg-ph-border" />

            {/* Quantity picker — 1 / 10 / 100 */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ph-text-muted">
                How Many Packs?
              </p>
              <PackOpenQuantity selected={qty} onSelect={setQty} />
            </div>

            <div className="h-px bg-ph-border" />

            {/* Remaining inventory */}
            <ProgressBar
              value={pack.remainingFraction}
              label="Remaining pulls"
              sublabel={`${remaining.toLocaleString("en-US")} pulls remaining · ${pack.pullCount.toLocaleString("en-US")} pulled`}
              color={pack.remainingFraction < 0.35 ? "red" : "green"}
            />

            <div className="h-px bg-ph-border" />

            {/* Price summary */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
                  {qty > 1 ? `${qty} Packs` : "Per Pack"}
                </p>
                <p className="text-3xl font-black tracking-tight text-ph-text">
                  ${totalPrice.toLocaleString("en-US")}
                </p>
              </div>
              {qty > 1 && (
                <p className="text-sm text-ph-text-muted">
                  ${pack.price} / pack
                </p>
              )}
            </div>

            {/* Primary CTA */}
            <Link
              href={openingHref}
              onClick={() => { setPackBumped(true); setTimeout(() => setPackBumped(false), 300); }}
              className="flex w-full items-center justify-between rounded-ph-xl bg-ph-green px-6 py-4 text-base font-bold text-ph-green-ink shadow-ph-cta transition-all duration-[150ms] ease-out hover:bg-ph-green-hover hover:shadow-ph-cta-hover"
            >
              <span>
                {qty === 1 ? "Open Pack" : qty === 10 ? "Fast Open ×10" : "Rush ×100"}
              </span>
              <span className="text-sm font-black opacity-85">
                ${totalPrice.toLocaleString("en-US")}
              </span>
            </Link>

            {/* Secondary CTA — demo pull */}
            <Button variant="secondary" size="lg" fullWidth onClick={handleStartDemo}>
              Try a Demo Pull
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
                Free
              </span>
            </Button>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRUST_ITEMS.map((item) => (
                <TrustBadge
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  className="justify-center"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══ PRIZE POOL ═════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "4.5rem" }}>
          <SectionHeader
            eyebrow="Prize Pool"
            title="Top Hits"
            lead="Exact inventory counts. Updated in real time."
            className="mb-6"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PRIZES.map((item) => (
              <PrizeCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* ══ ODDS ═══════════════════════════════════════════════════════════ */}
        <div className="mt-6">
          <OddsTable open={oddsOpen} onToggle={() => setOddsOpen((o) => !o)} />
        </div>

        {/* ══ BUYBACK ════════════════════════════════════════════════════════ */}
        <div className="mt-4">
          <BuybackSection rate={pack.buybackRate} />
        </div>

        {/* ══ RECENT PULLS ═══════════════════════════════════════════════════ */}
        <div className="mt-16">
          <RecentPullsRow pulls={RECENT_PULLS_MOCK} />
        </div>

        {/* ══ BOTTOM REPEAT CTA ══════════════════════════════════════════════ */}
        <SurfaceCard padding="lg" className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-black tracking-tight text-ph-text">Ready to pull?</p>
          <p className="max-w-sm text-sm text-ph-text-sec">
            {remaining.toLocaleString("en-US")} packs remaining. Every pull is sourced from
            verified, authenticated inventory.
          </p>
          <Link
            href={openingHref}
            className="rounded-ph-xl bg-ph-green px-8 py-4 text-base font-bold text-ph-green-ink shadow-ph-cta transition-all duration-[150ms] ease-out hover:bg-ph-green-hover"
          >
            {qty === 1 ? "Open Pack" : qty === 10 ? "Fast Open ×10" : "Rush ×100"} · ${totalPrice.toLocaleString("en-US")}
          </Link>
          <Button variant="ghost" onClick={handleStartDemo}>
            Try a Demo Pull (Free)
          </Button>
        </SurfaceCard>
      </div>

      {/* ── Demo modal ── */}
      <DemoModal
        phase={demoPhase}
        card={demoCard}
        onConfirm={handleConfirmDemo}
        onClose={handleCloseDemo}
      />

      <BottomNav />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export — wraps inner in Suspense (required for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-dvh bg-ph-bg">
      <div className="mx-auto max-w-screen-xl animate-pulse px-4 py-10">
        <div className="h-8 w-48 rounded-ph-md bg-ph-surface-high" />
        <div className="mt-8 h-64 rounded-ph-2xl bg-ph-surface-high" />
      </div>
    </div>
  );
}

export default function PackDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PackDetailInner />
    </Suspense>
  );
}
