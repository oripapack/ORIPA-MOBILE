"use client";

/**
 * Vault Screen  (/vault)
 *
 * Shows the user's collected cards with fulfillment status.
 * Mirrors the mobile Vault/Collection screen.
 * Uses mock data until connected to real backend.
 */

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNav } from "../../components/layout/BottomNav";
import { SurfaceCard } from "../../components/ui/SurfaceCard";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { RarityBadge, StatusBadge } from "../../components/ui/Badge";
import { cn } from "../../components/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
type FulfillStatus = "vaulted" | "shipping" | "delivered" | "sold";

interface VaultItem {
  id: string;
  card: string;
  set: string;
  rarity: Rarity;
  value: string;
  pulledAt: string;
  status: FulfillStatus;
  packName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock vault items
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_VAULT: VaultItem[] = [
  {
    id: "v1",
    card: "Charizard ex SAR",
    set: "Obsidian Flames",
    rarity: "mythic",
    value: "$649",
    pulledAt: "2 hours ago",
    status: "vaulted",
    packName: "Platinum Legacy",
  },
  {
    id: "v2",
    card: "Umbreon VMAX Alt Art",
    set: "Evolving Skies",
    rarity: "legendary",
    value: "$380",
    pulledAt: "Yesterday",
    status: "shipping",
    packName: "Evolving Skies Premium",
  },
  {
    id: "v3",
    card: "Mew ex Full Art",
    set: "Paldea Evolved",
    rarity: "epic",
    value: "$55",
    pulledAt: "3 days ago",
    status: "vaulted",
    packName: "Paldea Evolved Chase",
  },
  {
    id: "v4",
    card: "Iono Full Art Trainer",
    set: "Paldea Evolved",
    rarity: "rare",
    value: "$22",
    pulledAt: "5 days ago",
    status: "delivered",
    packName: "Paldea Evolved Chase",
  },
  {
    id: "v5",
    card: "Arceus VSTAR Gold",
    set: "Crown Zenith",
    rarity: "epic",
    value: "$75",
    pulledAt: "1 week ago",
    status: "sold",
    packName: "Crown Zenith Galarian",
  },
  {
    id: "v6",
    card: "Rob Lucci P-SAR",
    set: "OP-07",
    rarity: "legendary",
    value: "$95",
    pulledAt: "1 week ago",
    status: "vaulted",
    packName: "OP-07 500-Year Future",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rarity class maps
// ─────────────────────────────────────────────────────────────────────────────

const RARITY_CARD_BORDER: Record<Rarity, string> = {
  common:    "border-ph-common-border",
  rare:      "border-ph-rare-border",
  epic:      "border-ph-epic-border",
  legendary: "border-ph-legendary-border",
  mythic:    "border-ph-mythic-border",
};

const RARITY_TOP_LINE: Record<Rarity, string> = {
  common:    "bg-ph-common",
  rare:      "bg-ph-rare",
  epic:      "bg-ph-epic",
  legendary: "bg-ph-legendary",
  mythic:    "bg-ph-mythic",
};

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FulfillStatus, { label: string; variant: "success" | "warning" | "neutral" | "featured" }> = {
  vaulted:   { label: "In Vault",  variant: "neutral"  },
  shipping:  { label: "Shipping",  variant: "warning"  },
  delivered: { label: "Delivered", variant: "success"  },
  sold:      { label: "Sold",      variant: "featured" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Vault card
// ─────────────────────────────────────────────────────────────────────────────

function VaultCard({ item }: { item: VaultItem }) {
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <SurfaceCard
      padding="none"
      className={cn("overflow-hidden border", RARITY_CARD_BORDER[item.rarity])}
    >
      {/* Rarity accent line */}
      <div className={cn("h-0.5 w-full opacity-60", RARITY_TOP_LINE[item.rarity])} />

      <div className="flex flex-col gap-2.5 p-4">
        {/* Rarity + status */}
        <div className="flex items-start justify-between gap-2">
          <RarityBadge rarity={item.rarity} />
          <StatusBadge variant={statusCfg.variant}>{statusCfg.label}</StatusBadge>
        </div>

        {/* Card name */}
        <p className="text-sm font-bold leading-snug text-ph-text">{item.card}</p>
        <p className="text-xs text-ph-text-muted">{item.set}</p>

        {/* Value + pack */}
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
              Est. Value
            </p>
            <p className="text-lg font-black tracking-tight text-ph-text">{item.value}</p>
          </div>
          <p className="text-right text-[10px] leading-relaxed text-ph-text-muted">
            {item.packName}
            <br />
            {item.pulledAt}
          </p>
        </div>

        {/* Action row */}
        {item.status === "vaulted" && (
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-ph-md border border-ph-green-border bg-ph-green-soft py-2 text-xs font-bold text-ph-green transition-colors duration-[150ms] ease-out hover:bg-ph-green/20"
            >
              Cash Out
            </button>
            <button
              type="button"
              className="flex-1 rounded-ph-md border border-ph-border bg-ph-surface-high py-2 text-xs font-semibold text-ph-text-sec transition-colors duration-[150ms] ease-out hover:border-ph-border-md hover:text-ph-text"
            >
              Ship
            </button>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────────────────────────────────────

type VaultFilter = "all" | "vaulted" | "shipping" | "delivered" | "sold";

const VAULT_FILTERS: { key: VaultFilter; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "vaulted",   label: "Vaulted"   },
  { key: "shipping",  label: "Shipping"  },
  { key: "delivered", label: "Delivered" },
  { key: "sold",      label: "Sold"      },
];

// ─────────────────────────────────────────────────────────────────────────────
// Summary stats
// ─────────────────────────────────────────────────────────────────────────────

function VaultStats({ items }: { items: VaultItem[] }) {
  const totalValue = items
    .filter((i) => i.status !== "sold")
    .reduce((sum, i) => sum + Number(i.value.replace(/[$,]/g, "")), 0);

  const vaultedCount  = items.filter((i) => i.status === "vaulted").length;
  const shippingCount = items.filter((i) => i.status === "shipping").length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Total Value",  value: `$${totalValue.toLocaleString("en-US")}` },
        { label: "In Vault",     value: String(vaultedCount)  },
        { label: "In Transit",   value: String(shippingCount) },
      ].map((stat) => (
        <SurfaceCard key={stat.label} padding="none" className="p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ph-text-muted">
            {stat.label}
          </p>
          <p className="mt-1 text-xl font-black text-ph-text">{stat.value}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const [filter, setFilter] = useState<VaultFilter>("all");

  const filtered = filter === "all"
    ? MOCK_VAULT
    : MOCK_VAULT.filter((i) => i.status === filter);

  return (
    <div className="min-h-dvh bg-ph-bg text-ph-text">
      <AppHeader
        crumbs={[{ label: "Vault" }]}
        credits={12_500}
      />

      <div className="mx-auto max-w-screen-xl px-4 py-8 pb-28 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-6">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ph-text-muted">
            My Collection
          </p>
          <h1 className="text-3xl font-black tracking-tight text-ph-text sm:text-4xl">
            Vault
          </h1>
          <p className="mt-1.5 text-sm text-ph-text-sec">
            {MOCK_VAULT.length} card{MOCK_VAULT.length !== 1 ? "s" : ""} · Cash out, ship, or hold
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="mb-8">
          <VaultStats items={MOCK_VAULT} />
        </div>

        {/* ── Filter tabs ── */}
        <div
          className="mb-6 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {VAULT_FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={cn(
                  "flex-shrink-0 rounded-ph-pill px-4 py-1.5 text-xs font-semibold outline-none",
                  "border transition-colors duration-[150ms] ease-out",
                  "focus-visible:ring-2 focus-visible:ring-ph-green",
                  active
                    ? "border-ph-border-high bg-ph-surface-raise text-ph-text"
                    : "border-ph-border bg-ph-surface text-ph-text-muted hover:border-ph-border-md hover:text-ph-text-sec",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Card grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <VaultCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <SurfaceCard padding="lg" className="py-16 text-center">
            <p className="mb-2 text-3xl font-black text-ph-text-muted">—</p>
            <p className="mb-1 text-base font-bold text-ph-text">Nothing here yet</p>
            <p className="mb-6 text-sm text-ph-text-sec">
              Open packs to start building your collection.
            </p>
            <Link
              href="/packs"
              className="inline-flex items-center rounded-ph-xl bg-ph-green px-6 py-3 text-sm font-bold text-ph-green-ink shadow-ph-cta transition-all duration-[150ms] ease-out hover:bg-ph-green-hover"
            >
              Browse Packs
            </Link>
          </SurfaceCard>
        )}

        {/* ── Empty state CTA if has items ── */}
        {filtered.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/packs"
              className="text-sm font-semibold text-ph-text-muted underline underline-offset-2 transition-colors duration-[150ms] ease-out hover:text-ph-text-sec"
            >
              Open more packs
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
