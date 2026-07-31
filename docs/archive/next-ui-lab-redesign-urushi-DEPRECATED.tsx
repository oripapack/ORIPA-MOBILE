/**
 * ⛔ DEPRECATED — 廃止済み(2026-07-31 退避)。参照禁止(docs/archive/README.md)。
 * lab /redesign の旧 Urushi Archive 既定テーマ原本。T8 前倒しで N2 ベースに
 * 書き換えた際の退避コピー。和方針(v3.0 第2部)の NG レジスターに該当。
 *
 * Pull Hub UI Redesign — "Stage & Gallery" token sheet + Home static mock.
 * Palette revision: "Urushi Archive" (2026-07-14).
 * Lab-only prototype (not product code).
 */

/** 和モチーフ退避フラグ — 削除ではなくオフ。1つずつ戻して比較する。 */
const SHOW_JAPANESE_MOTIFS = false;

/** 約1.8%のモノクロノイズ (soft-light) — SVG turbulence の data URI */
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Schibsted+Grotesk:wght@400;500;700&family=Spline+Sans+Mono:wght@500;600&display=swap');

:root {
  /* ── sumi 墨 (暗部4層) ── */
  --sumi0: #090A0A;   /* Stage */
  --sumi1: #111313;   /* Showroom bg */
  --sumi2: #171918;   /* satin surface */
  --sumi3: #1D201F;   /* raised surface */
  --text: #E8E5DE;    /* 純白は使わない */
  --text-mut: #9A968D;
  /* ── washi 和紙 (Gallery) ── */
  --washi-bg: #F2EFE8;
  --washi-surface: #F8F6F1;
  --ink: #201F1C;
  --ink-mut: #6E6960;
  /* ── アクセント ── */
  --shu: #A63B32;
  --shu-hover: #AF4036;
  --on-shu: #F5EFE9;
  --brass: #A88B58;     /* レアリティ・装飾線・細部のみ。ボタン禁止 */
  --jade: #33705C;      /* テキスト/ステータスのみ */
  --jade-dark: #4E8F76; /* 暗部上の jade (派生値) */
  /* ── 型 ── */
  --f-display: 'Fraunces', serif;
  --f-body: 'Schibsted Grotesk', sans-serif;
  --f-data: 'Spline Sans Mono', monospace;
  /* ── 質感 ── */
  --satin-top: rgba(255,255,255,0.05);
  --shadow-washi: 0 8px 24px rgba(32,31,28,0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0C0D0D; color: var(--text); font-family: var(--f-body); }

.rd-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px; }
@media (max-width: 500px) {
  .rd-wrap { padding: 24px 0 64px; }
  .rd-wrap > .rd-label, .rd-h1, .rd-sub { padding-left: 16px; padding-right: 16px; }
  .rd-section { margin-top: 40px; }
  .rd-section .rd-label, .rd-section h2 { padding-left: 16px; padding-right: 16px; }
  .rd-grid, .spec { margin-left: 16px; margin-right: 16px; }
  .phone { border-radius: 0; }
}
.rd-h1 { font-family: var(--f-display); font-weight: 600; font-size: 28px; letter-spacing: 0.01em; }
.rd-sub { color: var(--text-mut); font-size: 14px; margin-top: 8px; }
.rd-section { margin-top: 64px; }
.rd-label { font-family: var(--f-body); font-weight: 500; font-size: 11px; letter-spacing: 0.16em; color: var(--brass); text-transform: uppercase; }
.rd-section h2 { font-family: var(--f-body); font-weight: 700; font-size: 19px; margin-top: 8px; }
.rd-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }

/* ── Swatches ── */
.sw { width: 132px; border-radius: 12px; overflow: hidden; background: var(--sumi2); }
.sw-chip { height: 64px; }
.sw-meta { padding: 8px 10px; box-shadow: inset 0 1px 0 var(--satin-top); }
.sw-name { font-size: 12px; font-weight: 500; }
.sw-hex { font-family: var(--f-data); font-size: 11px; color: var(--text-mut); }

/* ── Type specimens ── */
.spec { border-left: 2px solid var(--sumi3); padding-left: 20px; margin-top: 24px; }
.spec + .spec { margin-top: 32px; }
.spec-role { font-size: 11px; letter-spacing: 0.12em; color: var(--text-mut); text-transform: uppercase; font-weight: 500; }

/* ═══════════════ PHONE ARTBOARD (440×956) ═══════════════ */
.phone {
  width: 440px; max-width: 100%; height: 956px; margin: 24px auto 0;
  border-radius: 24px;
  overflow-y: auto; overflow-x: hidden; position: relative;
  scrollbar-width: none;
  /* 照明: 上中央の暖色スポット1灯 + 下方向へ暗くなる縦グラデ (マット地) */
  background:
    radial-gradient(420px 380px at 50% 40px, rgba(255,250,238,0.085), transparent 70%),
    linear-gradient(180deg, var(--sumi1) 0%, var(--sumi1) 55%, #0D0F0E 100%);
}
.phone::-webkit-scrollbar { display: none; }
/* 暗部全面 約1.8% モノクロノイズ */
.noise {
  position: sticky; top: 0; height: 0; z-index: 5; pointer-events: none;
}
.noise::after {
  content: ''; position: absolute; left: 0; right: 0; top: 0; height: 956px;
  background-image: ${'NOISE_PLACEHOLDER'};
  mix-blend-mode: soft-light; opacity: 0.018;
}

/* Top bar */
.tb { display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 0; position: relative; }
.tb-logo { font-family: var(--f-display); font-weight: 600; font-size: 18px; letter-spacing: 0.02em; }
.tb-coins {
  display: flex; align-items: center; gap: 8px;
  background: var(--sumi2); box-shadow: inset 0 1px 0 var(--satin-top);
  border-radius: 999px; padding: 6px 14px 6px 8px; /* pill = ステータスチップ */
}
.tb-coin-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--brass); }
.tb-coins span { font-family: var(--f-data); font-size: 13px; font-weight: 600; }

/* Hero */
.hero { position: relative; padding: 40px 24px 32px; overflow: hidden; }
.hero-wave { position: absolute; left: -40px; right: -40px; top: 96px; opacity: 0.5; pointer-events: none; }
.hero-eyebrow { text-align: center; font-size: 11px; font-weight: 500; letter-spacing: 0.2em; color: var(--brass); }
.hero-pack-zone { position: relative; display: flex; justify-content: center; margin-top: 24px; }
.pack {
  width: 148px; height: 208px; border-radius: 10px; position: relative;
  background: linear-gradient(170deg, #1E211F 0%, #141615 70%);
  box-shadow: inset 0 0 0 1px rgba(168,139,88,0.45), 0 14px 28px rgba(0,0,0,0.5);
}
.pack::before { /* クリンプ(圧着ギザ) — 装飾線 = brass 可 */
  content: ''; position: absolute; left: 8px; right: 8px; top: 7px; height: 6px;
  background: repeating-linear-gradient(90deg, rgba(168,139,88,0.4) 0 2px, transparent 2px 5px);
}
.pack::after { /* 箔の固定斜め反射1本 (グロス・アニメ不可) */
  content: ''; position: absolute; inset: 0; border-radius: 10px;
  background: linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.07) 45%, transparent 56%);
}
.pack-emblem {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: 64px; height: 64px; border-radius: 50%;
  border: 1.5px solid rgba(168,139,88,0.7);
  display: flex; align-items: center; justify-content: center;
}
.pack-emblem span { font-family: var(--f-display); font-size: 13px; color: var(--brass); letter-spacing: 0.04em; }
.pack-name-strip { position: absolute; bottom: 14px; left: 0; right: 0; text-align: center;
  font-size: 9px; font-weight: 500; letter-spacing: 0.24em; color: var(--text-mut); }
.pack-shadow {
  position: absolute; left: 50%; bottom: -18px; transform: translateX(-50%);
  width: 180px; height: 24px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,0.6), transparent);
}
/* パック名 = Fraunces 許可対象 */
.hero-title { text-align: center; font-family: var(--f-display); font-weight: 600; font-size: 32px; line-height: 1.15; margin-top: 32px; }
.hero-set { text-align: center; font-size: 12px; color: var(--text-mut); margin-top: 6px; }
.hero-meta { display: flex; justify-content: center; align-items: baseline; gap: 14px; margin-top: 12px; }
.hero-meta .coins { font-family: var(--f-data); font-size: 15px; font-weight: 600; }
.hero-meta .slots { font-family: var(--f-data); font-size: 12px; color: var(--text-mut); }
/* 残口数: 極細ヘアライン + 中立色 */
.slots-bar { width: 200px; height: 2px; background: rgba(232,229,222,0.14); border-radius: 1px; margin: 10px auto 0; }
.slots-bar i { display: block; height: 2px; width: 43%; background: rgba(232,229,222,0.55); border-radius: 1px; }
/* オッズ要約1行 — 常時表示 (法務要件) */
.odds-line { text-align: center; margin-top: 12px; font-size: 12px; color: var(--text-mut); }
.odds-line b { font-family: var(--f-data); font-weight: 600; color: var(--text); }

/* CTA — 朱・半光沢。ベタ塗り禁止 */
.cta {
  display: flex; align-items: center; justify-content: center;
  margin: 24px 0 0; padding: 16px; border-radius: 8px; /* control = 8px */
  background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 55%), var(--shu);
  color: var(--on-shu);
  font-family: var(--f-body); font-size: 16px; font-weight: 700; letter-spacing: 0.02em;
  border: none; width: 100%; cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(0,0,0,0.35);
}
.cta:hover { background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 55%), var(--shu-hover); }
.demo-link { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--text-mut); text-decoration: underline; text-underline-offset: 3px; }

/* Trust strip — 区切りは中立ヘアライン */
.trust { display: flex; margin: 28px 24px 0; border-top: 1px solid rgba(232,229,222,0.08); border-bottom: 1px solid rgba(232,229,222,0.08); }
.trust div { flex: 1; padding: 14px 8px; text-align: center; }
.trust div + div { border-left: 1px solid rgba(232,229,222,0.08); }
.trust b { display: block; font-size: 12px; font-weight: 700; }
.trust span { display: block; font-size: 10px; color: var(--text-mut); margin-top: 3px; line-height: 1.4; }

/* Section head — 見出しは Schibsted */
.sec-head { display: flex; align-items: baseline; justify-content: space-between; padding: 32px 24px 0; }
.sec-head h3 { font-family: var(--f-body); font-weight: 700; font-size: 16px; letter-spacing: 0.02em; }
.sec-head a { font-size: 11px; font-weight: 500; color: var(--text-mut); text-decoration: none; letter-spacing: 0.12em; display: inline-flex; align-items: center; gap: 6px; }
/* 発光は LIVE インジケータのみ許可 (単一光源ルールの唯一の例外) */
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--brass);
  box-shadow: 0 0 6px 1px rgba(168,139,88,0.6);
  animation: live-pulse 2.4s ease-out infinite;
}
@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 4px 0px rgba(168,139,88,0.45); }
  50% { box-shadow: 0 0 9px 2px rgba(168,139,88,0.75); }
}
@media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }

/* Just Pulled — カードはサテン(ボーダーなし・上辺ハイライトのみ) */
.jp-row { display: flex; gap: 12px; padding: 16px 24px 4px; overflow-x: auto; scrollbar-width: none; }
.jp-row::-webkit-scrollbar { display: none; }
.jp-card {
  min-width: 150px; background: var(--sumi2); box-shadow: inset 0 1px 0 var(--satin-top);
  border-radius: 12px; padding: 10px; /* card = 12px */
}
/* スラブ画像 = グロス: 多層影 + 固定斜め反射1本 */
.slab { height: 96px; border-radius: 7px; background: #E9E6DF; position: relative; overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.3); }
.slab::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 38%, rgba(255,255,255,0.16) 47%, transparent 55%);
}
.slab-label { position: absolute; top: 6px; left: 6px; right: 6px; height: 16px; border-radius: 3px;
  background: #201F1C; color: #E9E6DF; font-size: 7.5px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; letter-spacing: 0.1em; }
.slab-art { position: absolute; top: 28px; left: 18px; right: 18px; bottom: 8px; border-radius: 3px; }
.jp-name { font-size: 12px; font-weight: 500; margin-top: 10px; line-height: 1.3; }
.jp-meta { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; }
.jp-value { font-family: var(--f-data); font-size: 12px; font-weight: 600; color: var(--jade-dark); }
.jp-value small { display: block; font-family: var(--f-data); font-size: 8.5px; color: var(--text-mut); font-weight: 500; letter-spacing: 0.05em; }
.jp-time { font-size: 10px; color: var(--text-mut); }

/* Pack shelf */
.shelf { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 24px 0; }
.shelf-card { background: var(--sumi2); box-shadow: inset 0 1px 0 var(--satin-top); border-radius: 12px; padding: 16px 14px 14px; text-align: center; }
.shelf-card .pack { width: 96px; height: 134px; margin: 0 auto; border-radius: 8px; }
.shelf-card .pack-emblem { width: 42px; height: 42px; }
.shelf-card .pack-emblem span { font-size: 9px; }
.shelf-name { font-size: 14px; font-weight: 700; margin-top: 14px; }
.shelf-price { font-family: var(--f-data); font-size: 13px; font-weight: 600; margin-top: 4px; }
.shelf-slots { font-family: var(--f-data); font-size: 10px; color: var(--text-mut); margin-top: 6px; }

/* Footer */
.foot { margin-top: 40px; padding: 24px; border-top: 1px solid rgba(232,229,222,0.08); }
.foot-fair { display: flex; align-items: center; gap: 10px; }
.foot-fair .shield { width: 28px; height: 28px; border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(168,139,88,0.4);
  display: flex; align-items: center; justify-content: center; color: var(--brass); font-size: 13px; }
.foot-fair b { font-size: 13px; }
.foot-fair span { display: block; font-size: 11px; color: var(--text-mut); }
.fair-record { margin-top: 16px; background: var(--sumi2); box-shadow: inset 0 1px 0 var(--satin-top); border-radius: 12px; padding: 12px 14px; }
.fair-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; }
.fair-row span { font-size: 11px; color: var(--text-mut); }
.fair-row b { font-family: var(--f-data); font-size: 11px; font-weight: 500; }
.fair-row a { font-size: 11px; font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: 0.06em; }
.foot-legal { font-size: 9.5px; color: #706C63; line-height: 1.6; margin-top: 16px; }

/* ── Gallery mini-panel (washi) ── */
.gal-panel { background: var(--washi-bg); color: var(--ink); border-radius: 16px; padding: 24px; max-width: 440px; }
.gal-panel h4 { font-family: var(--f-body); font-weight: 700; font-size: 17px; }
.gal-cardrow { display: flex; gap: 12px; margin-top: 16px; }
.gal-choice { flex: 1; background: var(--washi-surface); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-washi); }
.gal-choice small { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; color: var(--ink-mut); }
.gal-choice .v { font-family: var(--f-data); font-size: 18px; font-weight: 600; margin-top: 6px; }
.gal-choice .v.jade { color: var(--jade); }
.gal-choice p { font-size: 11px; color: var(--ink-mut); margin-top: 4px; }

/* Brass sample — 装飾線・レアリティ用 */
.brass-rule { width: 220px; height: 1px; background: linear-gradient(90deg, transparent, var(--brass), transparent); margin-top: 8px; }
.rarity-line { font-family: var(--f-data); font-size: 12px; font-weight: 600; color: var(--brass); letter-spacing: 0.14em; }
`.replace("${'NOISE_PLACEHOLDER'}", NOISE_URI);

/* 浮世絵様式の波 — 退避中 (SHOW_JAPANESE_MOTIFS で復帰) */
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
    { n: 'sumi/0 — Stage', v: '#090A0A' },
    { n: 'sumi/1 — Showroom bg', v: '#111313' },
    { n: 'sumi/2 — surface', v: '#171918' },
    { n: 'sumi/3 — raised', v: '#1D201F' },
    { n: 'text/on-dark', v: '#E8E5DE' },
  ],
  washi: [
    { n: 'washi/bg', v: '#F2EFE8' },
    { n: 'washi/surface', v: '#F8F6F1' },
    { n: 'ink', v: '#201F1C' },
  ],
  accent: [
    { n: 'shu 朱 (CTA専用)', v: '#A63B32' },
    { n: 'shu/hover', v: '#AF4036' },
    { n: 'brass 真鍮 (装飾のみ)', v: '#A88B58' },
    { n: 'jade (ステータス文字のみ)', v: '#33705C' },
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
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rd-wrap">
        <div className="rd-label">Pull Hub UI Redesign — Urushi Archive</div>
        <h1 className="rd-h1">Stage &amp; Gallery</h1>
        <p className="rd-sub">
          漆黒4層(sumi)+和紙(washi)+朱の半光沢CTA+真鍮の細部。単一光源・素材差・約1.8%ノイズ。
          和モチーフは退避中(フラグでオフ)。下のモックはホーム(Showroom 層)440×956。
        </p>

        {/* ═══ 1. Home mock ═══ */}
        <div className="rd-section">
          <div className="rd-label">01 — Home Mock (Showroom, 440×956)</div>
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
              {pulls.map((p) => (
                <div className="jp-card" key={p.name}>
                  <div className="slab">
                    <div className="slab-label">{p.grade}</div>
                    <div className="slab-art" style={{ background: p.art }} />
                  </div>
                  <div className="jp-name">{p.name}</div>
                  <div className="jp-meta">
                    <div className="jp-value">{p.value}<small>LISTED VALUE</small></div>
                    <div className="jp-time">{p.time}</div>
                  </div>
                </div>
              ))}
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
          <div className="rd-label">02 — Palette (sumi 4層 + washi + アクセント)</div>
          <h2>Urushi Archive</h2>
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
          <div className="rd-label">03 — Typography (役割制限つき)</div>
          <h2>3つの声と使用範囲</h2>
          <div className="spec">
            <div className="spec-role">Display — Fraunces 600。ブランドステートメント・パック名・開封結果のカード名のみ</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 600, marginTop: 8 }}>Kanto Origins</div>
          </div>
          <div className="spec">
            <div className="spec-role">Body — Schibsted Grotesk。ナビ・セクション見出し・CTA・本文・日付</div>
            <div style={{ fontSize: 15, marginTop: 8, maxWidth: 560 }}>
              <b style={{ fontWeight: 700 }}>Just Pulled</b> — Each pack contains one graded Japanese card.
              Trade it back instantly for 100% of listed value, in Coins. · 3m ago
            </div>
          </div>
          <div className="spec">
            <div className="spec-role">Data — Spline Sans Mono。価格・オッズ・在庫・コイン数・ハッシュのみ</div>
            <div style={{ fontFamily: 'var(--f-data)', fontSize: 18, fontWeight: 600, marginTop: 8 }}>
              2,500 Coins · 214/500 · 1.2% · a41f8c…9c2e
            </div>
          </div>
        </div>

        {/* ═══ 4. 質感・washi プレビュー ═══ */}
        <div className="rd-section">
          <div className="rd-label">04 — 質感 & Gallery 層 (結果画面の二択)</div>
          <h2>真鍮の細部・washi の取引画面</h2>
          <div className="rd-grid" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="rarity-line">MYTHIC · 1 OF 4</div>
              <div className="brass-rule" />
              <p className="rd-sub" style={{ maxWidth: 220 }}>真鍮はレアリティ表示・装飾線・細部のみ。ボタンには使わない。</p>
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
          <div className="rd-label">05 — 実行ルール (Urushi Archive)</div>
          <h2>規律</h2>
          <p className="rd-sub" style={{ maxWidth: 680, lineHeight: 1.9 }}>
            照明: 画面上中央の暖色スポット1灯+下方向へ暗くなる縦グラデ。個別発光は禁止(LIVE ドットのみ例外)。
            素材: 背景マット / UIカードはサテン(上辺insetハイライトのみ、全要素への1pxボーダー禁止) /
            実物カード画像はグロス(多層影+固定斜め反射1本・アニメ不可) / CTAは半光沢。
            暗部全面に約1.8%のモノクロノイズ(soft-light)。
            角丸: control 8 / card 12 / panel 16 / image 7。pill はステータスチップのみ。
            朱は1画面1要素・CTA専用。真鍮はボタン禁止。jade はステータス文字のみ。純白不使用。
            残口数はヘアライン+中立モノスペース(赤・点滅禁止)。オッズ要約1行は常時表示。
            和モチーフは退避中(SHOW_JAPANESE_MOTIFS=false)。漢字刻印は不採用。
          </p>
        </div>
      </div>
    </>
  );
}
