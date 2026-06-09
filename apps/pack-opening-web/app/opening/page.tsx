"use client";

/**
 * Pull Hub — Opening Flow  (/opening)
 *
 * 5-stage staged reveal per CLAUDE.md design spec:
 *   Stage 1: Pack selection — choose from 3 pack types
 *   Stage 2: Intro + reel   — PackOpeningEngine handles intro → spinning → landing
 *   Stage 3: Hidden card    — card face-down, "Tap to reveal" (CardBackLayer)
 *   Stage 4: Metadata       — card name/rarity shown briefly before flip
 *   Stage 5: Full reveal + result CTA — 3D flip + Vault / Convert buttons
 *
 * Design: Phygitals premium dark tone; no casino effects; < 300ms transitions.
 */

import { useMemo, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { Button } from "../../components/ui/Button";
import { PackOpeningEngine } from "../../components/pack-opening/PackOpeningEngine";
import type { RevealCard, RevealRarity } from "../../components/pack-opening/types";
import { cn } from "../../components/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Mock pack options
// ─────────────────────────────────────────────────────────────────────────────

interface PackOption {
  id: string;
  name: string;
  category: string;
  price: number;
  buybackRate: number;
  description: string;
  rarityRange: string;
  /** Rarity of the winning card this pack produces for demo */
  demoRarity: RevealRarity;
  demoCard: Omit<RevealCard, "id">;
  accentColor: string;
  taglineItems: string[];
}

const PACK_OPTIONS: PackOption[] = [
  {
    id: "welcome",
    name: "Welcome Pack",
    category: "Multi TCG",
    price: 5,
    buybackRate: 90,
    description:
      "Designed for first-time collectors. Guaranteed value above pack price with 90% instant buyback.",
    rarityRange: "Common – Rare",
    demoRarity: "rare",
    demoCard: {
      name: "Full Art V",
      image: "",
      rarity: "rare",
      value: 22,
      color: "#38bdf8",
    },
    accentColor: "#38bdf8",
    taglineItems: ["90% buyback", "Guaranteed value", "1 per account"],
  },
  {
    id: "platinum",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    buybackRate: 80,
    description:
      "PSA-graded slabs, Japanese alt-arts, and trophy promos from verified distributor stock.",
    rarityRange: "Rare – Chase",
    demoRarity: "ultra",
    demoCard: {
      name: "Alt Art Secret",
      image: "",
      rarity: "ultra",
      value: 380,
      color: "#a78bfa",
    },
    accentColor: "#a78bfa",
    taglineItems: ["PSA graded", "Alt-arts", "Trophy promos"],
  },
  {
    id: "ultra-chase",
    name: "Ultra Chase",
    category: "Pokémon TCG",
    price: 100,
    buybackRate: 80,
    description:
      "High-stakes vault pulls. Trophy slabs and ultra-rare hits. Chase-tier guaranteed every time.",
    rarityRange: "Ultra – Chase",
    demoRarity: "chase",
    demoCard: {
      name: "Grail Chase",
      image: "",
      rarity: "chase",
      value: 649,
      color: "#fbbf24",
    },
    accentColor: "#fbbf24",
    taglineItems: ["Chase guaranteed", "$100+ floor", "PSA 10 pool"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pack selection card (Stage 1)
// ─────────────────────────────────────────────────────────────────────────────

function PackOptionCard({
  pack,
  onSelect,
}: {
  pack: PackOption;
  onSelect: () => void;
}) {
  return (
    <SurfaceCard
      padding="none"
      className="group cursor-pointer overflow-hidden ph-transition hover:-translate-y-0.5 hover:shadow-ph-card-hover"
      onClick={onSelect}
    >
      {/* Art area */}
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(155deg, ${pack.accentColor}18, var(--ph-surface))`,
        }}
      >
        {/* Decorative pack shape */}
        <div
          className="h-20 w-14 rounded-ph-xl border border-ph-border-md opacity-70"
          style={{
            background: `linear-gradient(155deg, ${pack.accentColor}30, var(--ph-surface-raise))`,
          }}
        />
        <div
          className="absolute bottom-2 left-2 rounded-ph-pill border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{
            borderColor: `${pack.accentColor}44`,
            color: pack.accentColor,
            background: `${pack.accentColor}12`,
          }}
        >
          {pack.rarityRange}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ph-text-muted">
          {pack.category}
        </p>
        <p className="text-sm font-black tracking-tight text-ph-text">{pack.name}</p>
        <p className="text-xs leading-relaxed text-ph-text-muted line-clamp-2">
          {pack.description}
        </p>

        {/* Tagline chips */}
        <div className="mt-1 flex flex-wrap gap-1">
          {pack.taglineItems.map((t) => (
            <span
              key={t}
              className="rounded-ph-sm border border-ph-border bg-ph-surface-high px-1.5 py-px text-[9px] text-ph-text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Price + CTA row */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-lg font-black tracking-tight text-ph-text">
            ${pack.price}
          </p>
          <button
            type="button"
            className="rounded-ph-pill bg-ph-green px-4 py-1.5 text-xs font-black text-ph-green-ink shadow-ph-cta ph-transition hover:bg-ph-green-hover"
          >
            Open Pack
          </button>
        </div>

        {/* Buyback note */}
        <p className="text-[10px] text-ph-text-muted">
          {pack.buybackRate}% instant buyback guaranteed
        </p>
      </div>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-result summary (after Stage 5)
// ─────────────────────────────────────────────────────────────────────────────

function ResultSummary({ pack, onOpenAnother }: { pack: PackOption; onOpenAnother: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 text-center">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ph-text-muted">
          Pull complete
        </p>
        <h2 className="text-2xl font-black tracking-tight text-ph-text">
          Card added to your Vault
        </h2>
      </div>

      <SurfaceCard padding="md" className="w-full max-w-xs text-left">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
          From
        </p>
        <p className="font-bold text-ph-text">{pack.name}</p>
        <p className="mt-0.5 text-xs text-ph-text-muted">{pack.category}</p>
      </SurfaceCard>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={onOpenAnother}>
          Open Another Pack
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => { window.location.href = "/pack-detail"; }}
        >
          View Pack Details
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={() => { window.location.href = "/"; }}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type FlowStage = "select" | "opening" | "done";

export default function OpeningFlowPage() {
  const [stage, setStage]         = useState<FlowStage>("select");
  const [chosenPack, setChosenPack] = useState<PackOption | null>(null);
  const [salt, setSalt]           = useState(1);

  const winningCard = useMemo<RevealCard | null>(() => {
    if (!chosenPack) return null;
    return {
      id: `demo-${chosenPack.id}-${salt}`,
      ...chosenPack.demoCard,
    };
  }, [chosenPack, salt]);

  const handleSelectPack = (pack: PackOption) => {
    setChosenPack(pack);
    setSalt((s) => s + 1);
    setStage("opening");
  };

  const handleOpenAnother = () => {
    setChosenPack(null);
    setStage("select");
  };

  return (
    <div className="min-h-dvh bg-ph-bg text-ph-text">
      <AppHeader
        crumbs={
          stage === "select"
            ? [{ label: "Open a Pack" }]
            : [
                { label: "Packs",          href: "/packs"    },
                { label: chosenPack?.name ?? "Opening"        },
              ]
        }
        credits={12_500}
      />

      {/* ── Stage 1: Pack selection ── */}
      {stage === "select" && (
        <div className="mx-auto max-w-screen-md px-4 py-10 sm:px-6">
          <div className="mb-8">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
              Pack opening
            </p>
            <h1 className="text-3xl font-black tracking-tight text-ph-text">
              Choose your pack
            </h1>
            <p className="mt-1.5 text-sm text-ph-text-sec">
              Transparent odds · Verified inventory · Up to 90% buyback
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PACK_OPTIONS.map((pack) => (
              <PackOptionCard
                key={pack.id}
                pack={pack}
                onSelect={() => handleSelectPack(pack)}
              />
            ))}
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-ph-border pt-6">
            {[
              "✓ Verified inventory",
              "◎ Full odds disclosure",
              "→ Ships worldwide",
            ].map((item) => (
              <span key={item} className="text-xs font-semibold text-ph-text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Stages 2–5: Opening engine ── */}
      {stage === "opening" && winningCard ? (
        <div className="mx-auto max-w-screen-sm px-4 py-6 sm:px-6">
          {/* Pack name header */}
          <div className="mb-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ph-text-muted">
              Opening
            </p>
            <p className="text-lg font-black tracking-tight text-ph-text">
              {chosenPack?.name}
            </p>
          </div>

          {/* Engine handles stages 2–5 internally */}
          <PackOpeningEngine
            key={winningCard.id}
            winningCard={winningCard}
            sessionSalt={salt}
            showDevControls={false}
            onComplete={() => {
              // Allow user to see result for 2s then show summary
              setTimeout(() => setStage("done"), 2_500);
            }}
          />

          {/* Skip to pack selection */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleOpenAnother}
              className="text-xs font-semibold text-ph-text-muted hover:text-ph-text-sec ph-transition-colors"
            >
              ← Choose a different pack
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Post-result summary ── */}
      {stage === "done" && chosenPack ? (
        <div className="mx-auto max-w-sm">
          <ResultSummary pack={chosenPack} onOpenAnother={handleOpenAnother} />
        </div>
      ) : null}
    </div>
  );
}
