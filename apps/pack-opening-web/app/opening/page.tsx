"use client";

/**
 * Pull Hub — Opening Flow  (/opening)
 *
 * Phygitals-inspired full-screen cinematic staged reveal.
 * Reference: docs/references/phygitals/ screenshots
 *
 * 4 stages — each takes the full viewport:
 *   1. select   — centered pack carousel on pure black
 *   2. hidden   — PSA slab back, "Tap to reveal" (staging the suspense)
 *   3. metadata — text-only reveal: YEAR / CATEGORY / GRADE / RARITY
 *   4. result   — PSA slab face-up, card name, value, CTAs
 *
 * No reel animation. No boxed container. No casino effects.
 * Animations ≤ 250ms, ease-out.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { RevealRarity } from "../../components/pack-opening/types";
import { formatUsd } from "../../components/pack-opening/formatUsd";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Stage = "select" | "hidden" | "metadata" | "result";

interface Pack {
  id: string;
  name: string;
  category: string;
  price: number;
  buybackRate: number;
  rarity: RevealRarity;
  cardName: string;
  value: number;
  grade: string;
  year: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock pack catalog
// ─────────────────────────────────────────────────────────────────────────────

const PACKS: Pack[] = [
  {
    id: "welcome",
    name: "Welcome Pack",
    category: "Multi TCG",
    price: 5,
    buybackRate: 90,
    rarity: "rare",
    cardName: "Full Art Supporter",
    value: 22,
    grade: "PSA 9",
    year: "2023",
  },
  {
    id: "platinum",
    name: "Platinum Legacy",
    category: "Pokémon TCG",
    price: 30,
    buybackRate: 80,
    rarity: "ultra",
    cardName: "Alt Art Secret Rare",
    value: 380,
    grade: "PSA 9",
    year: "2020",
  },
  {
    id: "ultra-chase",
    name: "Ultra Chase",
    category: "Pokémon TCG",
    price: 100,
    buybackRate: 80,
    rarity: "chase",
    cardName: "Trophy Promo 1st Edition",
    value: 649,
    grade: "PSA 10",
    year: "2004",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rarity tokens
// ─────────────────────────────────────────────────────────────────────────────

const R_LABEL: Record<RevealRarity, string> = {
  common: "COMMON",
  rare:   "RARE",
  ultra:  "ULTRA RARE",
  chase:  "CHASE",
};

const R_COLOR: Record<RevealRarity, string> = {
  common: "#9CA3AF",
  rare:   "#60A5FA",
  ultra:  "#A855F7",
  chase:  "#F59E0B",
};

/** Dark gradient for card art area — [top, bottom] */
const R_GRADIENT: Record<RevealRarity, [string, string]> = {
  common: ["#1e293b", "#0f172a"],
  rare:   ["#1e3a5f", "#0c1a2e"],
  ultra:  ["#2d1b4e", "#130a24"],
  chase:  ["#3d2a0a", "#1a1204"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Visual: Booster-pack shape (Stage 1 carousel)
// ─────────────────────────────────────────────────────────────────────────────

function PackShape({
  pack,
  scale = 1,
}: {
  pack: Pack;
  scale?: number;
}) {
  const [from, to] = R_GRADIENT[pack.rarity];
  const color = R_COLOR[pack.rarity];
  const w = Math.round(200 * scale);
  const h = Math.round(280 * scale);
  const r = Math.round(14 * scale);
  const fs1 = Math.round(14 * scale);
  const fs2 = Math.round(10 * scale);
  const fs3 = Math.round(18 * scale);
  const pad = Math.round(18 * scale);

  return (
    <div
      style={{
        width: w,
        height: h,
        background: `linear-gradient(158deg, ${from} 0%, ${to} 100%)`,
        borderRadius: r,
        border: `1.5px solid ${color}${scale === 1 ? "30" : "16"}`,
        boxShadow:
          scale === 1
            ? `0 48px 120px rgba(0,0,0,0.85), 0 16px 48px rgba(0,0,0,0.7), 0 0 64px ${color}0a, inset 0 1px 0 rgba(255,255,255,0.07)`
            : `0 20px 60px rgba(0,0,0,0.7)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${pad}px ${Math.round(pad * 0.85)}px`,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 250ms ease-out",
      }}
    >
      {/* Top sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 38%)",
          borderRadius: r,
          pointerEvents: "none",
        }}
      />

      {/* Category label */}
      <p
        style={{
          fontSize: fs2,
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {pack.category}
      </p>

      {/* Art window — central dark area */}
      <div
        style={{
          width: "78%",
          flex: 1,
          margin: "10px 0",
          background: "rgba(0,0,0,0.38)",
          borderRadius: Math.round(8 * scale),
          border: `1px solid ${color}16`,
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Pack name + price */}
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <p
          style={{
            fontSize: fs1,
            fontWeight: 900,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {pack.name}
        </p>
        {scale === 1 && (
          <p
            style={{
              fontSize: fs3,
              fontWeight: 900,
              color,
              marginTop: 6,
              letterSpacing: "-0.03em",
            }}
          >
            ${pack.price}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual: PSA slab back (Stage 2 — hidden card)
// ─────────────────────────────────────────────────────────────────────────────

function SlabBack({ pack }: { pack: Pack }) {
  const color = R_COLOR[pack.rarity];
  return (
    <div
      style={{
        width: 264,
        height: 368,
        background: "#111111",
        border: "1.5px solid rgba(255,255,255,0.13)",
        borderRadius: 10,
        boxShadow: `0 64px 140px rgba(0,0,0,0.94), 0 24px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Slab top bar */}
      <div
        style={{
          height: 40,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
          }}
        >
          Pull Hub
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.08em",
          }}
        >
          AUTHENTICATED
        </span>
      </div>

      {/* Card back — near-black with subtle rarity hint */}
      <div
        style={{
          flex: 1,
          margin: "10px 10px 8px",
          background: "#080808",
          borderRadius: 5,
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Barely visible rarity ambient — whisper of what's inside */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${color}06 0%, transparent 100%)`,
          }}
        />
        {/* Question mark — very faint */}
        <span
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "rgba(255,255,255,0.035)",
            letterSpacing: -4,
            userSelect: "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          ?
        </span>
      </div>

      {/* Slab bottom bar */}
      <div
        style={{
          height: 28,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Secure Vault Storage
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual: PSA slab front (Stage 4 — result)
// ─────────────────────────────────────────────────────────────────────────────

function SlabFront({ pack }: { pack: Pack }) {
  const [from, to] = R_GRADIENT[pack.rarity];
  const color = R_COLOR[pack.rarity];
  return (
    <div
      style={{
        width: 280,
        height: 390,
        background: "#111111",
        border: "1.5px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        boxShadow: `0 64px 140px rgba(0,0,0,0.94), 0 24px 60px rgba(0,0,0,0.75), 0 0 80px ${color}0e, inset 0 1px 0 rgba(255,255,255,0.08)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Grade top bar */}
      <div
        style={{
          height: 40,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.55)",
            textTransform: "uppercase",
          }}
        >
          Pull Hub
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color,
            letterSpacing: "0.06em",
          }}
        >
          {pack.grade}
        </span>
      </div>

      {/* Card face — gradient representing the card's rarity */}
      <div
        style={{
          flex: 1,
          margin: "10px 10px 8px",
          borderRadius: 5,
          overflow: "hidden",
          background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 14px",
          position: "relative",
        }}
      >
        {/* Top sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.06) 0%, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        {/* Card art area */}
        <div
          style={{
            width: "82%",
            flex: 1,
            background: "rgba(0,0,0,0.36)",
            borderRadius: 4,
            border: `1px solid ${color}18`,
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* Card name */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            letterSpacing: "0.01em",
            lineHeight: 1.35,
            paddingTop: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          {pack.cardName}
        </p>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: 28,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {pack.year} · Verified · Authenticated
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: full-screen shell (black background)
// ─────────────────────────────────────────────────────────────────────────────

function FullScreen({
  children,
  motionKey,
}: {
  children: React.ReactNode;
  motionKey: string;
}) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — Pack selection
// ─────────────────────────────────────────────────────────────────────────────

function SelectStage({
  selectedIdx,
  onSelect,
  onOpen,
  onShuffle,
}: {
  selectedIdx: number;
  onSelect: (i: number) => void;
  onOpen: () => void;
  onShuffle: () => void;
}) {
  const pack = PACKS[selectedIdx]!;
  const leftIdx  = (selectedIdx - 1 + PACKS.length) % PACKS.length;
  const rightIdx = (selectedIdx + 1) % PACKS.length;

  return (
    <FullScreen motionKey="select">
      {/* Back link */}
      <div style={{ position: "absolute", top: 20, left: 24 }}>
        <Link
          href="/"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.32)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          ← Back
        </Link>
      </div>

      {/* Page label */}
      <p
        style={{
          position: "absolute",
          top: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.28)",
          textTransform: "uppercase",
        }}
      >
        Pack Opening
      </p>

      {/* Three-pack display */}
      <div
        style={{
          position: "relative",
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 640,
          marginBottom: 40,
        }}
      >
        {/* Left pack */}
        <motion.button
          type="button"
          onClick={() => onSelect(leftIdx)}
          style={{
            position: "absolute",
            left: "50%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            outline: "none",
            transform: "translateX(calc(-50% - 150px)) scale(0.62)",
            transformOrigin: "center center",
            opacity: 0.38,
          }}
          whileHover={{ opacity: 0.55 }}
          transition={{ duration: 0.18 }}
          aria-label={`Select ${PACKS[leftIdx]!.name}`}
        >
          <PackShape pack={PACKS[leftIdx]!} scale={0.62} />
        </motion.button>

        {/* Center pack */}
        <motion.button
          type="button"
          onClick={onOpen}
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            outline: "none",
            zIndex: 10,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-label={`Open ${pack.name}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <PackShape pack={pack} scale={1} />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Right pack */}
        <motion.button
          type="button"
          onClick={() => onSelect(rightIdx)}
          style={{
            position: "absolute",
            left: "50%",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            outline: "none",
            transform: "translateX(calc(-50% + 150px)) scale(0.62)",
            transformOrigin: "center center",
            opacity: 0.38,
          }}
          whileHover={{ opacity: 0.55 }}
          transition={{ duration: 0.18 }}
          aria-label={`Select ${PACKS[rightIdx]!.name}`}
        >
          <PackShape pack={PACKS[rightIdx]!} scale={0.62} />
        </motion.button>
      </div>

      {/* Pack info */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${selectedIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {pack.category}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              {pack.name}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
              {pack.buybackRate}% buyback guaranteed
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {/* Open Pack button */}
        <button
          type="button"
          onClick={onOpen}
          style={{
            background: "var(--ph-green)",
            border: "none",
            borderRadius: 999,
            padding: "16px 48px",
            fontSize: 15,
            fontWeight: 800,
            color: "var(--ph-green-ink)",
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: "0 0 40px rgba(34,197,94,0.22)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          Open Pack
          <span
            style={{
              background: "rgba(0,0,0,0.18)",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            ${pack.price}
          </span>
        </button>

        {/* Shuffle */}
        <button
          type="button"
          onClick={onShuffle}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "8px 24px",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Shuffle
        </button>

        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          Tap to select a pack to open
        </p>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          display: "flex",
          gap: 6,
        }}
      >
        {PACKS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            style={{
              width: i === selectedIdx ? 20 : 6,
              height: 6,
              borderRadius: 999,
              background:
                i === selectedIdx
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 220ms ease-out",
            }}
            aria-label={`Select pack ${i + 1}`}
          />
        ))}
      </div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — Hidden card / slab back
// ─────────────────────────────────────────────────────────────────────────────

function HiddenStage({
  pack,
  onReveal,
}: {
  pack: Pack;
  onReveal: () => void;
}) {
  return (
    <FullScreen motionKey="hidden">
      {/* "1 of 1" counter */}
      <p
        style={{
          position: "absolute",
          top: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
        }}
      >
        {pack.name}
      </p>

      {/* Slab back — main visual */}
      <motion.button
        type="button"
        onClick={onReveal}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        aria-label="Tap to reveal your card"
      >
        <SlabBack pack={pack} />
      </motion.button>

      {/* Tap to reveal prompt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.35, ease: "easeOut" }}
        style={{ marginTop: 40, textAlign: "center" }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
          }}
        >
          Tap to reveal
        </p>
      </motion.div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3 — Metadata reveal (text-only, staggered)
// ─────────────────────────────────────────────────────────────────────────────

const STAGGER_DELAY = 260; // ms between each metadata line

function MetadataStage({
  pack,
  onComplete,
}: {
  pack: Pack;
  onComplete: () => void;
}) {
  const color = R_COLOR[pack.rarity];

  const items = [
    { label: "YEAR",     value: pack.year,     isLarge: true  },
    { label: "CATEGORY", value: pack.category,  isLarge: false },
    { label: "GRADE",    value: pack.grade,     isLarge: true  },
  ];

  // Auto-advance after all items have appeared + brief pause
  useEffect(() => {
    const totalMs = items.length * STAGGER_DELAY + 1_200;
    const t = setTimeout(onComplete, totalMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullScreen motionKey="metadata">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          padding: "0 32px",
        }}
      >
        {/* Text metadata lines */}
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: i * (STAGGER_DELAY / 1000),
              ease: "easeOut",
            }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: item.isLarge ? 52 : 36,
                fontWeight: 900,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: item.isLarge ? "-0.04em" : "-0.02em",
                lineHeight: 1.0,
              }}
            >
              {item.value}
            </p>
          </motion.div>
        ))}

        {/* Rarity badge — appears last */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.22,
            delay: items.length * (STAGGER_DELAY / 1000),
            ease: "easeOut",
          }}
          style={{ textAlign: "center" }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            RARITY
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 999,
              background: `${color}18`,
              border: `1.5px solid ${color}40`,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                color,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {R_LABEL[pack.rarity]}
            </span>
          </div>
        </motion.div>
      </div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4 — Result (slab face-up + value + CTAs)
// ─────────────────────────────────────────────────────────────────────────────

function ResultStage({
  pack,
  onContinue,
  onOpenAnother,
}: {
  pack: Pack;
  onContinue: () => void;
  onOpenAnother: () => void;
}) {
  const color = R_COLOR[pack.rarity];

  return (
    <FullScreen motionKey="result">
      {/* Slab face-up */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <SlabFront pack={pack} />
      </motion.div>

      {/* Card info + value */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.18, ease: "easeOut" }}
        style={{ textAlign: "center", marginTop: 28, marginBottom: 32 }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.32)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {pack.category} · {pack.grade} · {pack.year}
        </p>
        <p
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.025em",
            marginBottom: 14,
          }}
        >
          {pack.cardName}
        </p>

        {/* Rarity badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 999,
            background: `${color}14`,
            border: `1px solid ${color}35`,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {R_LABEL[pack.rarity]}
          </span>
        </div>

        {/* Estimated value */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.28)",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Estimated value
        </p>
        <p
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "var(--ph-green)",
            letterSpacing: "-0.04em",
          }}
        >
          {formatUsd(pack.value)}
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.32, ease: "easeOut" }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          width: "100%",
          maxWidth: 280,
        }}
      >
        {/* Primary CTA */}
        <button
          type="button"
          onClick={onContinue}
          style={{
            width: "100%",
            background: "var(--ph-green)",
            border: "none",
            borderRadius: 999,
            padding: "15px 0",
            fontSize: 14,
            fontWeight: 800,
            color: "var(--ph-green-ink)",
            cursor: "pointer",
            letterSpacing: "0.03em",
            boxShadow: "0 0 40px rgba(34,197,94,0.20)",
          }}
        >
          Continue
        </button>

        {/* Secondary actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={onContinue}
            style={{
              flex: 1,
              background: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "11px 0",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Add to Vault
          </button>
          <button
            type="button"
            onClick={onOpenAnother}
            style={{
              flex: 1,
              background: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "11px 0",
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Open Another
          </button>
        </div>
      </motion.div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OpeningPage() {
  const [stage,       setStage]       = useState<Stage>("select");
  const [selectedIdx, setSelectedIdx] = useState(1); // Platinum Legacy default
  const [chosenPack,  setChosenPack]  = useState<Pack | null>(null);

  const handleOpen = useCallback(() => {
    setChosenPack(PACKS[selectedIdx]!);
    setStage("hidden");
  }, [selectedIdx]);

  const handleShuffle = useCallback(() => {
    setSelectedIdx((i) => (i + 1) % PACKS.length);
  }, []);

  const handleReveal = useCallback(() => {
    setStage("metadata");
  }, []);

  const handleMetaComplete = useCallback(() => {
    setStage("result");
  }, []);

  const handleContinue = useCallback(() => {
    setStage("select");
    setChosenPack(null);
  }, []);

  const handleOpenAnother = useCallback(() => {
    setStage("select");
    setChosenPack(null);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {stage === "select" && (
        <SelectStage
          selectedIdx={selectedIdx}
          onSelect={setSelectedIdx}
          onOpen={handleOpen}
          onShuffle={handleShuffle}
        />
      )}

      {stage === "hidden" && chosenPack && (
        <HiddenStage pack={chosenPack} onReveal={handleReveal} />
      )}

      {stage === "metadata" && chosenPack && (
        <MetadataStage pack={chosenPack} onComplete={handleMetaComplete} />
      )}

      {stage === "result" && chosenPack && (
        <ResultStage
          pack={chosenPack}
          onContinue={handleContinue}
          onOpenAnother={handleOpenAnother}
        />
      )}
    </AnimatePresence>
  );
}
