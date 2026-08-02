/**
 * Pull Hub UI Redesign — N2 "Neon Torii" token sheet + Home static mock.
 * 既定テーマ = N2(docs/design-system-n2.md v3.0 CORE)。
 * スキン・派生テーマは [data-theme] 差分のみで重ねる(第4部 S-4)。
 * 旧 Urushi Archive 版は docs/archive/next-ui-lab-redesign-urushi-DEPRECATED.tsx
 * に退避済み(参照禁止)。Lab-only prototype (not product code).
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * 実写アセットの自動検出(docs/asset-spec.md)。
 * public/assets/slabs/ に slab-NN.png / wrap-NN.png / stage-01.png を置くと
 * リロード時に自動で拾う。無いスロットは CSS プレースホルダーへフォールバック。
 * ガードレール: 実在の他社カード写真の流用禁止・自社在庫の実写のみ(C-5-9)。
 */
function readSlabAssets(count: number) {
  const empty = { stage: null as string | null, slots: Array.from({ length: count }, () => ({ slab: null as string | null, wrap: null as string | null })) };
  try {
    const dir = path.join(process.cwd(), 'public', 'assets', 'slabs');
    const files = new Set(fs.readdirSync(dir));
    return {
      stage: files.has('stage-01.png') ? '/assets/slabs/stage-01.png' : null,
      slots: Array.from({ length: count }, (_, i) => {
        const nn = String(i + 1).padStart(2, '0');
        return {
          slab: files.has(`slab-${nn}.png`) ? `/assets/slabs/slab-${nn}.png` : null,
          wrap: files.has(`wrap-${nn}.png`) ? `/assets/slabs/wrap-${nn}.png` : null,
        };
      }),
    };
  } catch {
    return empty;
  }
}

/** 和モチーフ退避フラグ — 浮世絵波は和方針(J-1)の NG レジスター(工芸的)につきオフのまま。 */
const SHOW_JAPANESE_MOTIFS = false;

/** ノイズ用 data URI — N2 既定では不使用(opacity 0)。スキンが opacity を上げて流用する。 */
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Schibsted+Grotesk:wght@400;500;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap');

:root {
  /* ── N2 基層(C-3 verbatim) ── */
  --bg: #000000;        /* 地 = 夜 */
  --surface: #101013;   /* 面 = 夜の中の灯り */
  --surface-2: #17171C; /* 一段上の面 */
  --line: #27272E;      /* 1pxボーダー。区切りは影でなく線 */
  --text: #F0EEE8;      /* #FFFFFF は全面禁止 */
  --muted: #8E8C85;
  /* ── ブランド ── */
  --gold: #D4AF37;
  --gold-hover: #E8CE7E;
  --on-gold: #000000;
  --neon: #FF4A38;
  --neon-glow: rgba(255,74,56,0.32);
  /* ── セマンティック ── */
  --success: #6FBF8F;
  --error: #E5484D;
  --warning: #FFB224;
  /* ── 型(C-7) ── */
  --f-display: 'Fraunces', serif;
  --f-body: 'Schibsted Grotesk', sans-serif;
  --f-data: 'Spline Sans Mono', monospace;
  /* ── 質感(C-3) ── */
  --radius-panel: 13px;
  --radius-btn: 10px;
  --radius-tag: 6px;
  --shadow-hero: 0 20px 48px rgba(0,0,0,0.65); /* 主役1要素のみ */
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font-family: var(--f-body); }

.rd-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px; }
@media (max-width: 500px) {
  .rd-wrap { padding: 24px 0 64px; }
  .rd-wrap > .rd-label, .rd-h1, .rd-sub { padding-left: 16px; padding-right: 16px; }
  .rd-section { margin-top: 40px; }
  .rd-section .rd-label, .rd-section h2 { padding-left: 16px; padding-right: 16px; }
  .rd-grid, .spec { margin-left: 16px; margin-right: 16px; }
  .phone { border-radius: 0; }
}
.rd-h1 { font-family: var(--f-display); font-weight: 500; font-size: 28px; letter-spacing: 0.01em; }
.rd-sub { color: var(--muted); font-size: 14px; margin-top: 8px; }
.rd-section { margin-top: 64px; }
.rd-label { font-family: var(--f-body); font-weight: 500; font-size: 11px; letter-spacing: 0.16em; color: var(--muted); text-transform: uppercase; }
.rd-section h2 { font-family: var(--f-body); font-weight: 700; font-size: 19px; margin-top: 8px; }
.rd-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }

/* ── Swatches — 面は surface + 1px line(サテン・satin ハイライト廃止) ── */
.sw { width: 132px; border-radius: var(--radius-panel); overflow: hidden; background: var(--surface); border: 1px solid var(--line); }
.sw-chip { height: 64px; }
.sw-meta { padding: 8px 10px; border-top: 1px solid var(--line); }
.sw-name { font-size: 12px; font-weight: 500; }
.sw-hex { font-family: var(--f-data); font-size: 11px; color: var(--muted); }

/* ── Type specimens ── */
.spec { border-left: 2px solid var(--line); padding-left: 20px; margin-top: 24px; }
.spec + .spec { margin-top: 32px; }
.spec-role { font-size: 11px; letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase; font-weight: 500; }

/* ═══════════════ PHONE ARTBOARD (440×956) ═══════════════ */
.phone {
  width: 440px; max-width: 100%; height: 956px; margin: 24px auto 0;
  border-radius: 24px;
  overflow-y: auto; overflow-x: hidden; position: relative;
  scrollbar-width: none;
  background: var(--bg); /* N2: 地は漆黒フラット(照明リグ廃止) */
}
.phone::-webkit-scrollbar { display: none; }
/* ノイズ層 — N2 既定は不可視(opacity 0)。DOM/ルールはスキンのフックとして残す */
.noise {
  position: sticky; top: 0; height: 0; z-index: 5; pointer-events: none;
}
.noise::after {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 956px;
  background-image: ${'NOISE_PLACEHOLDER'};
  mix-blend-mode: soft-light; opacity: 0;
}

/* Top bar */
.tb { display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 0; position: relative; }
.tb-logo { font-family: var(--f-display); font-weight: 500; font-size: 18px; letter-spacing: 0.02em; }
.tb-coins {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 999px; padding: 6px 14px 6px 8px; /* pill = ステータスチップのみ可 */
}
.tb-coin-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--gold); }
.tb-coins span { font-family: var(--f-data); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* Hero */
.hero { position: relative; padding: 40px 24px 32px; overflow: hidden; }
.hero-wave { position: absolute; left: -40px; right: -40px; top: 96px; opacity: 0.5; pointer-events: none; }
.hero-eyebrow { text-align: center; font-size: 11px; font-weight: 500; letter-spacing: 0.2em; color: var(--muted); }
.hero-pack-zone { position: relative; display: flex; justify-content: center; margin-top: 24px; }
.pack {
  width: 148px; height: 208px; border-radius: var(--radius-btn); position: relative;
  background: linear-gradient(170deg, var(--surface-2) 0%, var(--surface) 70%);
  box-shadow: inset 0 0 0 1px var(--line), var(--shadow-hero); /* shadow-hero はこの1箇所のみ */
}
.pack::before { /* クリンプ(圧着ギザ) — 装飾は line 明度のみ */
  content: ''; position: absolute; left: 8px; right: 8px; top: 7px; height: 6px;
  background: repeating-linear-gradient(90deg, var(--line) 0 2px, transparent 2px 5px);
}
.pack::after { /* 箔の固定斜め反射1本(静的・アニメ不可) */
  content: ''; position: absolute; inset: 0; border-radius: var(--radius-btn);
  background: linear-gradient(115deg, transparent 32%, rgba(240,238,232,0.06) 45%, transparent 56%);
}
.pack-emblem {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: 64px; height: 64px; border-radius: 50%;
  border: 1px solid var(--line);
  display: flex; align-items: center; justify-content: center;
}
.pack-emblem span { font-family: var(--f-display); font-size: 13px; color: var(--muted); letter-spacing: 0.04em; }
.pack-name-strip { position: absolute; bottom: 14px; left: 0; right: 0; text-align: center;
  font-size: 9px; font-weight: 500; letter-spacing: 0.24em; color: var(--muted); }
.pack-shadow {
  position: absolute; left: 50%; bottom: -18px; transform: translateX(-50%);
  width: 180px; height: 24px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,0.6), transparent);
}
/* パック名 = Fraunces 500 許可対象 */
.hero-title { text-align: center; font-family: var(--f-display); font-weight: 500; font-size: 32px; line-height: 1.15; margin-top: 32px; }
.hero-set { text-align: center; font-size: 12px; color: var(--muted); margin-top: 6px; }
.hero-meta { display: flex; justify-content: center; align-items: baseline; gap: 14px; margin-top: 12px; }
.hero-meta .coins { font-family: var(--f-data); font-size: 15px; font-weight: 600; color: var(--gold); font-variant-numeric: tabular-nums; }
.hero-meta .slots { font-family: var(--f-data); font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
/* 残口数: 極細ヘアライン + 中立色(赤・点滅禁止) */
.slots-bar { width: 200px; height: 2px; background: var(--line); border-radius: 1px; margin: 10px auto 0; }
.slots-bar i { display: block; height: 2px; width: 43%; background: var(--muted); border-radius: 1px; }
/* オッズ要約1行 — 常時表示(C-9 情報開示) */
.odds-line { text-align: center; margin-top: 12px; font-size: 12px; color: var(--muted); }
.odds-line b { font-family: var(--f-data); font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }

/* CTA — 金・フラット・黒文字(1画面1つ) */
.cta {
  display: flex; align-items: center; justify-content: center;
  margin: 24px 0 0; padding: 16px; border-radius: var(--radius-btn);
  background: var(--gold);
  color: var(--on-gold);
  font-family: var(--f-body); font-size: 16px; font-weight: 700; letter-spacing: 0.02em;
  border: none; width: 100%; cursor: pointer;
}
.cta:hover { background: var(--gold-hover); }
.demo-link { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }

/* Trust strip — 区切りは 1px line */
.trust { display: flex; margin: 28px 24px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.trust div { flex: 1; padding: 14px 8px; text-align: center; }
.trust div + div { border-left: 1px solid var(--line); }
.trust b { display: block; font-size: 12px; font-weight: 700; }
.trust span { display: block; font-size: 10px; color: var(--muted); margin-top: 3px; line-height: 1.4; }

/* Section head */
.sec-head { display: flex; align-items: baseline; justify-content: space-between; padding: 32px 24px 0; }
.sec-head h3 { font-family: var(--f-body); font-weight: 700; font-size: 16px; letter-spacing: 0.02em; }
.sec-head a { font-size: 11px; font-weight: 500; color: var(--muted); text-decoration: none; letter-spacing: 0.12em; display: inline-flex; align-items: center; gap: 6px; }
/* LIVE ドット — neon + グロー(C-8 の常時明滅例外・1.6s) */
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 6px 1px var(--neon-glow);
  animation: live-pulse 1.6s ease-out infinite;
}
@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 4px 0px var(--neon-glow); }
  50% { box-shadow: 0 0 10px 2px var(--neon-glow); }
}
@media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }

/* Just Pulled — 面は surface + 1px line */
.jp-row { display: flex; gap: 12px; padding: 16px 24px 4px; overflow-x: auto; scrollbar-width: none; }
.jp-row::-webkit-scrollbar { display: none; }
.jp-card {
  min-width: 150px; background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-panel); padding: 10px;
}
/* スラブ枠 — 暗い面(surface-2 + 1px line)。白系のUI面は廃止(最明は text)。
   実物スラブ写真の導入後は「写真としての白」を許可(照明・影付きの実写に限る。UI面の白は引き続き禁止)。 */
.slab { height: 96px; border-radius: var(--radius-tag); background: var(--surface-2); border: 1px solid var(--line); position: relative; overflow: hidden; }
.slab::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 38%, rgba(240,238,232,0.10) 47%, transparent 55%);
}
.slab-label { position: absolute; top: 6px; left: 6px; right: 6px; height: 16px; border-radius: 3px;
  background: var(--surface); color: var(--text); font-family: var(--f-data); font-size: 7.5px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; letter-spacing: 0.1em; z-index: 3; }
/* ── 実写レイヤー(public/assets/slabs にアセットがある時のみ — docs/asset-spec.md)
   下: ステージ / 中: スラブ実写 / 上: 破れ包装 / 最前: GRADED ラベル。
   アセットが無いスロットは従来の CSS プレースホルダー(.slab-art)に自動フォールバック ── */
.slab-stage { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.slab-photo, .slab-wrap {
  position: absolute; left: 8%; top: 4px;
  width: 84%; height: calc(100% - 10px); object-fit: contain;
}
.slab-photo { z-index: 1; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.55)); }
.slab-wrap { z-index: 2; }
/* 台座+反射(CSS簡易版 — stage-01.png があれば画像側が主、これは薄い受け皿) */
.slab--photo::before {
  content: ''; position: absolute; left: 22%; right: 22%; bottom: 3px; height: 8px;
  border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,0.55), transparent); z-index: 0;
}
/* 実写時は擬似グロスを消す(写真に嘘の光沢を乗せない) */
.slab--photo::after { display: none; }
.slab-art { position: absolute; top: 28px; left: 18px; right: 18px; bottom: 8px; border-radius: 3px; }
.jp-name { font-size: 12px; font-weight: 500; margin-top: 10px; line-height: 1.3; }
.jp-meta { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; }
.jp-value { font-family: var(--f-data); font-size: 12px; font-weight: 600; color: var(--gold); font-variant-numeric: tabular-nums; }
.jp-value small { display: block; font-family: var(--f-data); font-size: 8.5px; color: var(--muted); font-weight: 500; letter-spacing: 0.05em; }
.jp-time { font-size: 10px; color: var(--muted); }

/* Pack shelf */
.shelf { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 24px 0; }
.shelf-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-panel); padding: 16px 14px 14px; text-align: center; }
.shelf-card .pack { width: 96px; height: 134px; margin: 0 auto; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--line); /* 影は hero のみ */ }
.shelf-card .pack-emblem { width: 42px; height: 42px; }
.shelf-card .pack-emblem span { font-size: 9px; }
.shelf-name { font-size: 14px; font-weight: 700; margin-top: 14px; }
.shelf-price { font-family: var(--f-data); font-size: 13px; font-weight: 600; margin-top: 4px; color: var(--gold); font-variant-numeric: tabular-nums; }
.shelf-slots { font-family: var(--f-data); font-size: 10px; color: var(--muted); margin-top: 6px; font-variant-numeric: tabular-nums; }

/* Footer */
.foot { margin-top: 40px; padding: 24px; border-top: 1px solid var(--line); }
.foot-fair { display: flex; align-items: center; gap: 10px; }
.foot-fair .shield { width: 28px; height: 28px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--line);
  display: flex; align-items: center; justify-content: center; color: var(--success); font-size: 13px; }
.foot-fair b { font-size: 13px; }
.foot-fair span { display: block; font-size: 11px; color: var(--muted); }
.fair-record { margin-top: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-panel); padding: 12px 14px; }
.fair-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; }
.fair-row span { font-size: 11px; color: var(--muted); }
.fair-row b { font-family: var(--f-data); font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; }
.fair-row a { font-size: 11px; font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: 0.06em; }
.foot-legal { font-size: 9.5px; color: var(--muted); line-height: 1.6; margin-top: 16px; }

/* ── 結果パネル(surface 層 — 旧 washi 光面は廃止) ── */
.gal-panel { background: var(--surface-2); color: var(--text); border: 1px solid var(--line); border-radius: var(--radius-panel); padding: 24px; max-width: 440px; }
.gal-panel h4 { font-family: var(--f-body); font-weight: 700; font-size: 17px; }
.gal-cardrow { display: flex; gap: 12px; margin-top: 16px; }
.gal-choice { flex: 1; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-btn); padding: 14px; }
.gal-choice small { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; color: var(--muted); }
.gal-choice .v { font-family: var(--f-data); font-size: 18px; font-weight: 600; margin-top: 6px; font-variant-numeric: tabular-nums; }
.gal-choice .v.jade { color: var(--gold); /* 受取額 = 価値 = 金 */ }
.gal-choice p { font-size: 11px; color: var(--muted); margin-top: 4px; }

/* ティア見本 — MYTHIC は neon + グロー(C-6) */
.brass-rule { width: 220px; height: 1px; background: linear-gradient(90deg, transparent, var(--line), transparent); margin-top: 8px; }
.rarity-line { font-family: var(--f-data); font-size: 12px; font-weight: 600; color: var(--neon); letter-spacing: 0.14em; text-shadow: 0 0 16px var(--neon-glow); }
`.replace("${'NOISE_PLACEHOLDER'}", NOISE_URI);

/* 浮世絵様式の波 — 退避中 (SHOW_JAPANESE_MOTIFS で復帰。和方針 J-1 では NG レジスター) */
function Wave({ stroke = '#2A2D2B' }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 880 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
        <path d="M0 150 C 90 130, 130 96, 180 96 C 236 96, 250 130, 234 148 C 222 161, 200 158, 198 142 C 196 129, 210 122, 220 128" />
        <path d="M0 170 C 110 150, 170 118, 240 118 C 320 118, 350 158, 330 180" />
        <path d="M260 150 C 340 116, 400 78, 470 80 C 546 82, 566 124, 546 146 C 530 162, 502 156, 502 138 C 502 122, 520 116, 532 124" />
        <path d="M300 176 C 400 146, 480 108, 560 110 C 640 112, 668 152, 650 178" />
        <path d="M560 140 C 640 110, 690 84, 750 86 C 816 88, 836 122, 820 142 C 806 158, 780 152, 780 136 C 780 122, 796 116, 806 122" />
        <path d="M620 172 C 700 148, 760 122, 830 124 C 866 125, 880 136, 878 150" />
        <path d="M40 186 C 200 166, 400 150, 560 156 C 700 160, 800 172, 878 186" opacity="0.5" />
      </g>
    </svg>
  );
}

const swatches = {
  sumi: [
    { n: 'bg — 夜', v: '#000000' },
    { n: 'surface — 灯り', v: '#101013' },
    { n: 'surface-2 — 一段上', v: '#17171C' },
    { n: 'line — 1px区切り', v: '#27272E' },
    { n: 'text (純白不使用)', v: '#F0EEE8' },
  ],
  washi: [
    { n: 'muted — 補助', v: '#8E8C85' },
    { n: 'success — 検証のみ', v: '#6FBF8F' },
    { n: 'error — フラット', v: '#E5484D' },
  ],
  accent: [
    { n: 'gold — 価値/CTA', v: '#D4AF37' },
    { n: 'gold hover', v: '#E8CE7E' },
    { n: 'neon 朱 — 瞬間のみ', v: '#FF4A38' },
    { n: 'warning', v: '#FFB224' },
  ],
};

const pulls = [
  { name: 'Umbreon Gold Star Holo', grade: 'GRADED · GEM 9.5', value: '$4,120', time: '3m ago', art: 'linear-gradient(160deg,#2E2A45,#57518A)' },
  { name: 'Charizard 1st Ed. Base', grade: 'GRADED · MINT 9', value: '$12,800', time: '11m ago', art: 'linear-gradient(160deg,#4A2B22,#8A4A31)' },
  { name: 'Rayquaza ★ Clash Blue Sky', grade: 'GRADED · NM-MT 8', value: '$15,742', time: '26m ago', art: 'linear-gradient(160deg,#1F3A32,#3E6E5A)' },
  { name: 'Pikachu Illustrator Promo', grade: 'GRADED · EX 5', value: '$38,000', time: '1h ago', art: 'linear-gradient(160deg,#4A4022,#8A7A31)' },
];

const shelf = [
  { name: 'Neo Destiny Chase', price: '5,000', slots: '88 / 300' },
  { name: 'Trainer Vault', price: '1,000', slots: '412 / 800' },
  { name: 'EX Era Relics', price: '3,500', slots: '164 / 400' },
  { name: 'Shining Legends', price: '2,000', slots: '236 / 500' },
];

export default function RedesignTokenSheet() {
  const assets = readSlabAssets(pulls.length);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* スキン切替(第4部 S-4): /redesign?theme=xxx で有効化。無指定は N2 既定のまま */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=new URLSearchParams(location.search).get('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <div className="rd-wrap">
        <div className="rd-label">Pull Hub UI Redesign — N2 Neon Torii (v3.0 CORE)</div>
        <h1 className="rd-h1">Midnight Tokyo</h1>
        <p className="rd-sub">
          漆黒の地+1px line の区切り+金=価値(CTA/価格/残高)+ネオン朱=瞬間のみ。
          既定テーマは N2。スキンは [data-theme] 差分で重ねる(?theme=)。
          下のモックはホーム 440×956。
        </p>

        {/* ═══ 1. Home mock ═══ */}
        <div className="rd-section">
          <div className="rd-label">01 — Home Mock (N2 CORE, 440×956)</div>
          <div className="phone">
            <div className="noise" />
            <div className="tb">
              <div className="tb-logo">Pull Hub</div>
              <div className="tb-coins"><i className="tb-coin-dot" /><span>12,500</span></div>
            </div>

            <div className="hero">
              {SHOW_JAPANESE_MOTIFS ? <div className="hero-wave"><Wave /></div> : null}
              <div className="hero-eyebrow">JAPANESE EXCLUSIVES — DIRECT FROM TOKYO</div>
              <div className="hero-pack-zone">
                <div className="pack">
                  <div className="pack-emblem"><span>PH</span></div>
                  <div className="pack-name-strip">KANTO ORIGINS</div>
                </div>
                <div className="pack-shadow" />
              </div>
              <h1 className="hero-title">Kanto Origins</h1>
              <div className="hero-set">Base Set era · 1999 · Japanese</div>
              <div className="hero-meta">
                <span className="coins">2,500 Coins</span>
                <span className="slots">214 / 500 left</span>
              </div>
              <div className="slots-bar"><i /></div>
              <div className="odds-line">Top hit odds: <b>1.2%</b> — full table on pack page</div>
              <button className="cta">Open Pack</button>
              <a className="demo-link" href="#">Try a free demo pull — no coins needed</a>
            </div>

            <div className="trust">
              <div><b>Zero-fee</b><span>trade-in, always</span></div>
              <div><b>100% listed value</b><span>back in Coins</span></div>
              <div><b>Free shipping</b><span>on orders $100+</span></div>
            </div>

            <div className="sec-head">
              <h3>Just Pulled</h3>
              <a href="#"><i className="live-dot" />LIVE ›</a>
            </div>
            <div className="jp-row">
              {pulls.map((p, i) => {
                const slot = assets.slots[i];
                return (
                <div className="jp-card" key={p.name}>
                  <div className={slot.slab ? 'slab slab--photo' : 'slab'}>
                    <div className="slab-label">{p.grade}</div>
                    {slot.slab ? (
                      <>
                        {assets.stage ? <img className="slab-stage" src={assets.stage} alt="" /> : null}
                        <img className="slab-photo" src={slot.slab} alt="" />
                        {slot.wrap ? <img className="slab-wrap" src={slot.wrap} alt="" /> : null}
                      </>
                    ) : (
                      <div className="slab-art" style={{ background: p.art }} />
                    )}
                  </div>
                  <div className="jp-name">{p.name}</div>
                  <div className="jp-meta">
                    <div className="jp-value">{p.value}<small>LISTED VALUE</small></div>
                    <div className="jp-time">{p.time}</div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="sec-head">
              <h3>All Packs</h3>
              <a href="#">VIEW ALL ›</a>
            </div>
            <div className="shelf">
              {shelf.map((s) => (
                <div className="shelf-card" key={s.name}>
                  <div className="pack">
                    <div className="pack-emblem"><span>PH</span></div>
                  </div>
                  <div className="shelf-name">{s.name}</div>
                  <div className="shelf-price">{s.price} Coins</div>
                  <div className="shelf-slots">{s.slots} left</div>
                </div>
              ))}
            </div>

            <div className="foot">
              <div className="foot-fair">
                <div className="shield">✓</div>
                <div>
                  <b>Provably Fair</b>
                  <span>Every pull is verifiable — fairness record below</span>
                </div>
              </div>
              <div className="fair-record">
                <div className="fair-row"><span>Server commitment</span><b>a41f8c…9c2e</b></div>
                <div className="fair-row"><span>Client seed</span><b>7b03aa…d114</b></div>
                <div className="fair-row"><span>Opening #</span><b>287</b></div>
                <div className="fair-row"><span></span><a href="#">VERIFY →</a></div>
              </div>
              <p className="foot-legal">
                18+. Pull Hub is not affiliated with, sponsored by, or endorsed by Nintendo,
                Creatures Inc., GAME FREAK, or The Pokémon Company. Card values shown are listed
                values in Coins, not cash amounts. Odds are published on every pack page.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ 2. Palette ═══ */}
        <div className="rd-section">
          <div className="rd-label">02 — Palette (N2 基層+セマンティック+ブランド)</div>
          <h2>N2 Neon Torii</h2>
          {(['sumi', 'washi', 'accent'] as const).map((k) => (
            <div className="rd-grid" key={k}>
              {swatches[k].map((s) => (
                <div className="sw" key={s.n}>
                  <div className="sw-chip" style={{ background: s.v }} />
                  <div className="sw-meta">
                    <div className="sw-name">{s.n}</div>
                    <div className="sw-hex">{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ═══ 3. Type ═══ */}
        <div className="rd-section">
          <div className="rd-label">03 — Typography (C-7)</div>
          <h2>3つの声と使用範囲</h2>
          <div className="spec">
            <div className="spec-role">Display — Fraunces 500。パック名・開封結果のカード名のみ(イタリックは1見出し1箇所まで)</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 500, marginTop: 8 }}>Kanto Origins</div>
          </div>
          <div className="spec">
            <div className="spec-role">Body — Schibsted Grotesk(第一候補)。ナビ・セクション見出し・CTA・本文</div>
            <div style={{ fontSize: 15, marginTop: 8, maxWidth: 560 }}>
              <b style={{ fontWeight: 700 }}>Just Pulled</b> — Each pack contains one graded Japanese card.
              Trade it back instantly for 100% of listed value, in Coins. · 3m ago
            </div>
          </div>
          <div className="spec">
            <div className="spec-role">Data — Spline Sans Mono + tabular-nums。価格・オッズ・在庫・コイン数・ハッシュのみ</div>
            <div style={{ fontFamily: 'var(--f-data)', fontSize: 18, fontWeight: 600, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
              2,500 Coins · 214/500 · 1.2% · a41f8c…9c2e
            </div>
          </div>
        </div>

        {/* ═══ 4. ティアと結果パネル ═══ */}
        <div className="rd-section">
          <div className="rd-label">04 — ティア(C-6)と結果パネル(surface 層)</div>
          <h2>MYTHIC は neon+グロー・結果は暗い面で</h2>
          <div className="rd-grid" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="rarity-line">MYTHIC · 1 OF 4</div>
              <div className="brass-rule" />
              <p className="rd-sub" style={{ maxWidth: 220 }}>ティア描画は SgTierTag が唯一の経路。neon は MYTHIC / LIVE / カウントダウンのみ(面積2%以下)。</p>
            </div>
            <div className="gal-panel">
              <h4>Your pull is in the vault</h4>
              <div className="gal-cardrow">
                <div className="gal-choice">
                  <small>CONVERT TO COINS</small>
                  <div className="v jade">14,483</div>
                  <p>100% of listed value, in Coins. Instant.</p>
                </div>
                <div className="gal-choice">
                  <small>SHIP TO ME</small>
                  <div className="v">$0</div>
                  <p>Free shipping — this order is over $100.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 5. ルール ═══ */}
        <div className="rd-section">
          <div className="rd-label">05 — 実行ルール (N2 CORE digest)</div>
          <h2>規律</h2>
          <p className="rd-sub" style={{ maxWidth: 680, lineHeight: 1.9 }}>
            区切りは 1px line と明度差のみ。影は主役1要素の shadow-hero だけ。
            CTA は金・黒文字・1画面1つ。neon 朱は「瞬間」専用(LIVE / MYTHIC / カウントダウン / 開封)・
            面積2%以下・必ずグロー付き。金と neon の同一要素での併用禁止。
            数字は全て Spline Mono + tabular-nums。#FFFFFF 不使用。純白なし。
            角丸は panel 13 / btn 10 / tag 6。pill はステータスチップのみ。
            残口数はヘアライン+中立色(赤・点滅禁止)。オッズ要約1行は常時表示。
            禁止事項は C-5 の9項目(grep 対象)。和要素は第2部 JAPAN ELEMENTS のレジスター指定に従う。
          </p>
        </div>
      </div>
    </>
  );
}
