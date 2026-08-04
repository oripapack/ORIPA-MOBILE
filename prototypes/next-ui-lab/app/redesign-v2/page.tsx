/**
 * Pull Hub Home mock v2 — 「骨格=実寸・肌=N2」統合実験(design/skeleton-n2)。
 * 骨格(セクション構成・寸法・余白・コントロール寸法)は master study の実寸知見
 * (docs/design-notes-master-study.md)を移植。肌は docs/design-system-n2.md v3.0
 * CORE を全適用: N2 トークン・Fraunces/Schibsted/Spline Mono・1px line +
 * radius 13/10/6(参照系のボーダーレス大Rは不採用)。コピーは /redesign の実
 * コピーと C-13 語彙を流用(Coins 表記は T1 待ちのまま)。
 * 信頼シャーシ(トラストストリップ / オッズ要約1行+VERIFY / listed value)込み。
 * スラブ実写は docs/asset-spec.md の自動検出(readSlabAssets)を流用。
 * Lab-only prototype (not product code)。実寸監査 T13 は本実験に吸収。
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * 実写アセットの自動検出(docs/asset-spec.md — /redesign と同一規約)。
 * public/assets/slabs/ の slab-NN.png / wrap-NN.png / stage-01.png を自動で拾い、
 * 無いスロットは CSS プレースホルダーへフォールバック。
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

/** ノイズ用 data URI — N2 既定では不使用。neo-tokyo スキンのグレインのみが参照する。 */
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Schibsted+Grotesk:wght@400;500;700&family=Spline+Sans+Mono:wght@400;500;600&family=Space+Grotesk:wght@700&family=Noto+Sans+JP:wght@700&display=swap');

:root {
  /* N2 基層(C-3 verbatim — /redesign と同値) */
  --bg: #000000;
  --surface: #101013;
  --surface-2: #17171C;
  --line: #27272E;
  --text: #F0EEE8;
  --muted: #8E8C85;
  --gold: #D4AF37;
  --gold-hover: #E8CE7E;
  --on-gold: #000000;
  --neon: #FF4A38;
  --neon-glow: rgba(255,74,56,0.32);
  --f-display: 'Fraunces', serif;
  --f-body: 'Schibsted Grotesk', sans-serif;
  --f-data: 'Spline Sans Mono', monospace;
  --radius-panel: 13px;
  --radius-btn: 10px;
  --radius-tag: 6px;
  --shadow-hero: 0 20px 48px rgba(0,0,0,0.65); /* 主役1要素のみ */
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font-family: var(--f-body); }

/* 骨格: ページ左右パディング14・実機幅基準(検証は440) */
.v2-wrap { width: 440px; max-width: 100%; margin: 0 auto; padding-bottom: 64px; }

/* ── Top bar(骨格: コントロール高38・ヘッダーパディング9/14) ── */
.v2-tb { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; }
.v2-logo { font-family: var(--f-display); font-weight: 500; font-size: 18px; letter-spacing: 0.02em; }
.v2-coins {
  display: flex; align-items: center; gap: 8px; height: 38px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 999px; padding: 0 14px 0 9px; /* pill = ステータスチップのみ可 */
}
.v2-coin-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--gold); }
.v2-coins span { font-family: var(--f-data); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* ── Hero(骨格: カード化・ビジュアル245h・中央129:脇92・CTA h40コンパクト) ── */
.v2-hero {
  margin: 6px 14px 0; border-radius: var(--radius-panel);
  background: var(--surface); border: 1px solid var(--line);
  padding: 16px 18px 22px; text-align: center; overflow: hidden;
}
.v2-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.2em; color: var(--muted); }
.v2-hero-visual { position: relative; height: 245px; margin: 10px -6px 12px; }
.v2-pack {
  position: absolute; border-radius: var(--radius-btn);
  background: linear-gradient(170deg, var(--surface-2) 0%, var(--surface) 70%);
  box-shadow: inset 0 0 0 1px var(--line);
}
.v2-pack--hero { box-shadow: inset 0 0 0 1px var(--line), var(--shadow-hero); } /* shadow-hero はこの1箇所のみ */
.v2-pack::before { /* クリンプ(圧着ギザ) — 装飾は line 明度のみ */
  content: ''; position: absolute; left: 7px; right: 7px; top: 6px; height: 5px;
  background: repeating-linear-gradient(90deg, var(--line) 0 2px, transparent 2px 5px);
}
.v2-pack::after { /* 箔の固定斜め反射1本(静的) */
  content: ''; position: absolute; inset: 0; border-radius: var(--radius-btn);
  background: linear-gradient(115deg, transparent 32%, rgba(240,238,232,0.06) 45%, transparent 56%);
}
.v2-emblem {
  position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%);
  border: 1px solid var(--line); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.v2-emblem span { font-family: var(--f-display); color: var(--muted); letter-spacing: 0.04em; }
.v2-pack-strip { position: absolute; bottom: 11px; left: 0; right: 0; text-align: center;
  font-size: 8px; font-weight: 500; letter-spacing: 0.22em; color: var(--muted); }
.v2-pack-shadow {
  position: absolute; left: 50%; bottom: 2px; transform: translateX(-50%);
  width: 170px; height: 20px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,0.6), transparent);
}
/* 骨格: H1 実寸スケール(20px級)。Fraunces はセリフのため 22px で同格 */
.v2-title { font-family: var(--f-display); font-weight: 500; font-size: 22px; line-height: 1.2; }
.v2-set { font-size: 12px; color: var(--muted); margin-top: 5px; }
.v2-meta { display: flex; justify-content: center; align-items: baseline; gap: 14px; margin-top: 10px; }
.v2-meta .coins { font-family: var(--f-data); font-size: 15px; font-weight: 600; color: var(--gold); font-variant-numeric: tabular-nums; }
.v2-meta .slots { font-family: var(--f-data); font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.v2-slots-bar { width: 200px; height: 2px; background: var(--line); border-radius: 1px; margin: 9px auto 0; }
.v2-slots-bar i { display: block; height: 2px; width: 43%; background: var(--muted); border-radius: 1px; }
/* 信頼シャーシ: オッズ要約1行+VERIFY(C-9 常時表示) */
.v2-odds { margin-top: 11px; font-size: 12px; color: var(--muted); }
.v2-odds b { font-family: var(--f-data); font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
.v2-odds a { font-size: 11px; font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: 0.06em; margin-left: 8px; }
/* CTA — 金・黒文字・1画面1つ。骨格: h40・コンテンツ幅(全幅にしない)・ラベル14 */
.v2-cta {
  margin: 16px auto 0; height: 40px; padding: 0 19px; border: none; cursor: pointer;
  border-radius: var(--radius-btn); background: var(--gold); color: var(--on-gold);
  font-family: var(--f-body); font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
  display: flex; align-items: center; justify-content: center;
}
.v2-cta:hover { background: var(--gold-hover); }
.v2-demo { display: block; margin-top: 12px; font-size: 13px; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }

/* ── Trust strip(信頼シャーシ — 区切りは 1px line) ── */
.v2-trust { display: flex; margin: 22px 14px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.v2-trust div { flex: 1; padding: 13px 8px; text-align: center; }
.v2-trust div + div { border-left: 1px solid var(--line); }
.v2-trust b { display: block; font-size: 12px; font-weight: 700; }
.v2-trust span { display: block; font-size: 10px; color: var(--muted); margin-top: 3px; line-height: 1.4; }

/* ── Section head(骨格: 上30/横14/下12・h2 24px) ── */
.v2-sec { display: flex; align-items: baseline; justify-content: space-between; padding: 30px 14px 12px; }
.v2-sec h2 { font-family: var(--f-body); font-weight: 700; font-size: 24px; letter-spacing: -0.01em; }
.v2-sec a { font-size: 11px; font-weight: 500; color: var(--muted); text-decoration: none; letter-spacing: 0.12em; }

/* ── Pack shelf(骨格: 2列 gap11・ビジュアル210h) ── */
.v2-shelf { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; padding: 0 14px; }
.v2-shelf-card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-panel); padding: 0 12px 14px; text-align: center;
}
.v2-shelf-visual { position: relative; height: 210px; }
.v2-shelf-visual .v2-pack { left: 50%; top: 18px; width: 118px; height: 166px; transform: translateX(-50%); }
.v2-shelf-visual .v2-emblem { width: 46px; height: 46px; }
.v2-shelf-visual .v2-emblem span { font-size: 10px; }
.v2-shelf-name { font-size: 16px; font-weight: 700; }
.v2-shelf-price { font-family: var(--f-data); font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--gold); font-variant-numeric: tabular-nums; }
.v2-shelf-slots { font-family: var(--f-data); font-size: 11px; color: var(--muted); margin-top: 5px; font-variant-numeric: tabular-nums; }

/* ── Just Pulled(骨格: 中央キッカー+26px見出し・カード198・ビジュアル200h) ── */
.v2-kicker {
  margin-top: 36px; display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.38em; color: var(--muted); text-indent: 0.38em;
}
/* LIVE ドット — neon + グロー(C-8 の常時明滅例外・1.6s) */
.v2-live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--neon);
  box-shadow: 0 0 6px 1px var(--neon-glow);
  animation: v2-live-pulse 1.6s ease-out infinite;
}
@keyframes v2-live-pulse {
  0%, 100% { box-shadow: 0 0 4px 0px var(--neon-glow); }
  50% { box-shadow: 0 0 10px 2px var(--neon-glow); }
}
@media (prefers-reduced-motion: reduce) { .v2-live-dot { animation: none; } }
.v2-recent-title { text-align: center; font-family: var(--f-body); font-weight: 700; font-size: 26px; letter-spacing: -0.005em; margin-top: 5px; }
.v2-pulls { display: flex; gap: 14px; padding: 18px 14px 0; overflow-x: auto; scrollbar-width: none; }
.v2-pulls::-webkit-scrollbar { display: none; }
.v2-pull {
  min-width: 198px; background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-panel); overflow: hidden; padding-bottom: 12px;
}
.v2-pull-visual { position: relative; height: 200px; }
/* 経過時間ピル = ステータスチップ(pill 可) */
.v2-time-pill {
  position: absolute; top: 10px; right: 10px; z-index: 3;
  height: 24px; padding: 0 11px; border-radius: 999px;
  background: var(--surface-2); border: 1px solid var(--line); color: var(--muted);
  font-size: 11px; font-weight: 500; display: flex; align-items: center;
}
/* スラブ枠 — 暗い面(surface-2 + 1px line)。白系のUI面は廃止(最明は text)。 */
.v2-slab { /* top 30 = 経過時間ピル(h24+余白)とラベルの重なり回避 */
  position: absolute; left: 50%; top: 30px; transform: translateX(-50%);
  width: 110px; height: 160px; border-radius: var(--radius-tag);
  background: var(--surface-2); border: 1px solid var(--line); overflow: hidden;
}
.v2-slab::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 38%, rgba(240,238,232,0.10) 47%, transparent 55%);
}
.v2-slab-label { position: absolute; top: 6px; left: 6px; right: 6px; height: 16px; border-radius: 3px;
  background: var(--surface); color: var(--text); font-family: var(--f-data); font-size: 7.5px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; letter-spacing: 0.1em; z-index: 3; }
.v2-slab-art { position: absolute; top: 28px; left: 14px; right: 14px; bottom: 10px; border-radius: 3px; }
/* 実写レイヤー(public/assets/slabs — docs/asset-spec.md)。無ければ CSS フォールバック */
.v2-stage { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.v2-photo, .v2-wrap-img {
  position: absolute; left: 50%; top: 12px; transform: translateX(-50%);
  width: 62%; height: calc(100% - 24px); object-fit: contain;
}
.v2-photo { z-index: 1; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.55)); }
.v2-wrap-img { z-index: 2; }
.v2-pull-visual--photo .v2-slab { display: none; } /* 実写時は擬似スラブを消す(偽装しない) */
.v2-pull-visual--photo::before { /* 台座+反射のCSS簡易受け皿(stage-01.png があれば画像が主) */
  content: ''; position: absolute; left: 25%; right: 25%; bottom: 8px; height: 10px;
  border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,0.55), transparent); z-index: 0;
}
.v2-pull-name { padding: 0 12px; font-size: 14px; font-weight: 700; line-height: 1.3; }
/* 信頼シャーシ: listed value 表示(金=価値) */
.v2-pull-meta { display: flex; justify-content: space-between; align-items: baseline; padding: 7px 12px 0; }
.v2-pull-value { font-family: var(--f-data); font-size: 13.5px; font-weight: 600; color: var(--gold); font-variant-numeric: tabular-nums; }
.v2-pull-value small { display: block; font-family: var(--f-data); font-size: 8.5px; color: var(--muted); font-weight: 500; letter-spacing: 0.05em; }

/* ── Footer(信頼シャーシ: fairness record + VERIFY) ── */
.v2-foot { margin-top: 36px; padding: 22px 14px 0; border-top: 1px solid var(--line); }
.v2-fair { display: flex; align-items: center; gap: 10px; }
.v2-fair .shield { width: 28px; height: 28px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--line);
  display: flex; align-items: center; justify-content: center; color: #6FBF8F; font-size: 13px; }
.v2-fair b { font-size: 13px; }
.v2-fair span { display: block; font-size: 11px; color: var(--muted); }
.v2-record { margin-top: 14px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-panel); padding: 12px 14px; }
.v2-record-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; }
.v2-record-row span { font-size: 11px; color: var(--muted); }
.v2-record-row b { font-family: var(--f-data); font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; }
.v2-record-row a { font-size: 11px; font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: 0.06em; }
.v2-legal { font-size: 9.5px; color: var(--muted); line-height: 1.6; margin-top: 14px; }

/* ═══════════════ NEO-TOKYO v2 SKIN — [data-theme] スコープ ═══════════════
   design/neo-tokyo-v2(/redesign 用)から v2 構造へ移植。S-2 の差し替え可能
   範囲のみ(トークン上書き・背景・グロー・疑似要素装飾)・DOM 変更なし。
   N2 既定は完全不変。有効化: /redesign-v2?theme=neo-tokyo
   ネオンは3箇所固定: ①縦書きカタカナ看板 ②LIVE ③MYTHIC 表示。
   ③は v2 ホームモックに MYTHIC 表示要素が無いためアンカー無し(ルール不要)。
   金・success・error・warning は N2 のまま上書きなし(信頼シャーシ C-9)。
   JAPAN ELEMENTS(J-1): 富士フラットシルエット+赤鳥居ミニアイコンの2点。
   元スキンの .noise DOM(グレイン/ビネット)は v2 に無いため、DOM を足さず
   body::before/::after の固定オーバーレイで代替。 */
[data-theme="neo-tokyo"] {
  --bg: #05070C; --surface: #0C1018; --surface-2: #131A24; --line: #1F2937;
  --text: #E9EEF2; --muted: #8393A3;
  --neon: #4FD8E8; --neon-mid: rgba(79,216,232,0.45); --neon-far: rgba(79,216,232,0.16);
  --neon-plate: rgba(79,216,232,0.07); --neon-edge: rgba(79,216,232,0.35);
  --neon-glow: rgba(79,216,232,0.32);
  --neon-2: #E85FA8; /* 予約: MYTHIC 開封演出のみ。本スキンの常設UIでの使用0件 */
  --torii: #FF4A38; /* J-1 鳥居アイコン用フラット朱(N2 朱の再利用・グロー無し) */
  --fuji: #0D1420; --bldg: #0A0E16; --sky-glow: rgba(79,216,232,0.05);
  --vig: rgba(0,0,0,0.35); --spot: rgba(233,238,242,0.04);
  --f-display: 'Space Grotesk', sans-serif; /* 見出しのみ。本文・等幅はブランドのまま */
}
[data-theme="neo-tokyo"] .v2-logo, [data-theme="neo-tokyo"] .v2-title { font-weight: 700; letter-spacing: 0; }
/* ページ地: 夜空(青みの暗闇)+冷スポット(元 .phone 背景の移植) */
[data-theme="neo-tokyo"] body {
  background:
    radial-gradient(420px 380px at 50% 40px, var(--spot), transparent 70%),
    linear-gradient(180deg, var(--surface) 0%, var(--bg) 60%, var(--bg) 100%);
}
/* フィルムグレイン 0.05 / レンズビネット 0.35 — 固定オーバーレイで代替 */
[data-theme="neo-tokyo"] body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 40;
  background: radial-gradient(130% 85% at 50% 42%, transparent 55%, var(--vig) 100%);
}
[data-theme="neo-tokyo"] body::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 41;
  background-image: ${NOISE_URI}; opacity: 0.05;
}
/* ═ ネオン②: LIVE(C-8 の常時明滅例外・3層グロー。周期は基底の 1.6s を継承) ═ */
[data-theme="neo-tokyo"] .v2-live-dot {
  background: var(--neon);
  box-shadow: 0 0 2px var(--neon), 0 0 12px var(--neon-mid), 0 0 42px var(--neon-far);
  animation-name: nt2-live-pulse;
}
@keyframes nt2-live-pulse {
  0%, 100% { box-shadow: 0 0 2px var(--neon), 0 0 10px var(--neon-mid), 0 0 34px var(--neon-far); }
  50% { box-shadow: 0 0 3px var(--neon), 0 0 14px var(--neon-mid), 0 0 48px var(--neon-far); }
}
/* ヒーロー: CSS夜景 — 暗青グラデ+富士フラットシルエット(J-1 ①)+ビル群。
   コピー・レイアウト不変(背景のみ)。v2-hero 幅412にビル5本がちょうど収まる。
   データURI内の色はトークン値(%230D1420=--fuji, %234FD8E8=--neon) */
[data-theme="neo-tokyo"] .v2-hero {
  position: relative; /* 疑似要素(看板)のアンカー。レイアウト影響なし */
  background-image:
    linear-gradient(var(--bldg), var(--bldg)),
    linear-gradient(var(--bldg), var(--bldg)),
    linear-gradient(var(--bldg), var(--bldg)),
    linear-gradient(var(--bldg), var(--bldg)),
    linear-gradient(var(--bldg), var(--bldg)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 108'%3E%3Cpath d='M0 108 L84 22 Q92 12 100 22 L112 34 L124 22 Q132 12 140 22 L240 108 Z' fill='%230D1420' stroke='%234FD8E8' stroke-opacity='0.35' stroke-width='1.5'/%3E%3C/svg%3E"),
    radial-gradient(70% 45% at 68% 0%, var(--sky-glow), transparent 70%),
    linear-gradient(180deg, var(--surface-2) 0%, var(--bg) 78%);
  background-repeat: no-repeat;
  background-position: 18px bottom, 84px bottom, 158px bottom, 262px bottom, 348px bottom, left 70px bottom, top, top;
  background-size: 54px 96px, 62px 148px, 88px 74px, 70px 122px, 64px 88px, 280px 112px, 100% 100%, 100% 100%;
}
/* J-1 ②: 赤鳥居ミニアイコン(フラット単色・グロー無し) */
[data-theme="neo-tokyo"] .v2-eyebrow::before {
  content: ''; display: inline-block; width: 14px; height: 12px;
  margin-right: 8px; vertical-align: -1px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 20'%3E%3Cpath d='M1 3.4 Q12 0.4 23 3.4 L23 6 Q12 3.4 1 6 Z' fill='%23FF4A38'/%3E%3Crect x='3.4' y='8.6' width='17.2' height='2.2' fill='%23FF4A38'/%3E%3Crect x='5' y='5' width='2.4' height='15' fill='%23FF4A38'/%3E%3Crect x='16.6' y='5' width='2.4' height='15' fill='%23FF4A38'/%3E%3C/svg%3E") center / contain no-repeat;
}
/* ═ ネオン①: 縦書きカタカナ看板 — 主役級(3層グロー+細ボーダー+面発光)。
   装飾テキストは事実主張なし ═ */
[data-theme="neo-tokyo"] .v2-hero::before {
  content: 'トーキョー';
  position: absolute; right: 18px; top: 40px;
  writing-mode: vertical-rl;
  font-family: 'Noto Sans JP', sans-serif; font-size: 40px; font-weight: 700;
  letter-spacing: 0.18em; line-height: 1;
  color: var(--neon);
  text-shadow: 0 0 2px var(--neon), 0 0 12px var(--neon-mid), 0 0 42px var(--neon-far);
  padding: 14px 8px;
  border: 1px solid var(--neon-edge); border-radius: 4px;
  background: var(--neon-plate);
  box-shadow: 0 0 12px var(--neon-far);
  animation: nt2-ignite 0.9s steps(9, end) 1 both; /* 点灯は1回だけ・ループ禁止 */
  pointer-events: none;
}
/* 濡れた路面の反射 — 看板直下に1箇所のみ */
[data-theme="neo-tokyo"] .v2-hero::after {
  content: 'トーキョー';
  position: absolute; right: 18px; top: 330px;
  writing-mode: vertical-rl;
  font-family: 'Noto Sans JP', sans-serif; font-size: 40px; font-weight: 700;
  letter-spacing: 0.18em; line-height: 1;
  padding: 14px 8px;
  color: var(--neon);
  text-shadow: 0 0 2px var(--neon), 0 0 12px var(--neon-mid);
  transform: scaleY(-1); filter: blur(6px); opacity: 0.12;
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0) 10%, #000 60%);
  mask-image: linear-gradient(to top, rgba(0,0,0,0) 10%, #000 60%);
  pointer-events: none;
}
@keyframes nt2-ignite {
  0% { opacity: 0.15; } 18% { opacity: 1; } 26% { opacity: 0.3; }
  38% { opacity: 1; } 47% { opacity: 0.5; } 60% { opacity: 1; }
  74% { opacity: 0.85; } 100% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  [data-theme="neo-tokyo"] .v2-hero::before { animation: none; }
  [data-theme="neo-tokyo"] .v2-hero::after { display: none; }
  [data-theme="neo-tokyo"] .v2-live-dot { animation: none; }
}
`;

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

export default function RedesignV2() {
  const assets = readSlabAssets(pulls.length);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* スキン切替(第4部 S-4): /redesign-v2?theme=xxx で有効化。無指定は N2 既定のまま(/redesign と同じ基盤フック) */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=new URLSearchParams(location.search).get('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}",
        }}
      />
      <div className="v2-wrap">
        <div className="v2-tb">
          <div className="v2-logo">Pull Hub</div>
          <div className="v2-coins"><i className="v2-coin-dot" /><span>12,500</span></div>
        </div>

        {/* Hero — 骨格: カード面+ビジュアル245h(中央129:脇92の扇)+コンパクトCTA */}
        <div className="v2-hero">
          <div className="v2-eyebrow">JAPANESE EXCLUSIVES — DIRECT FROM TOKYO</div>
          <div className="v2-hero-visual">
            <div className="v2-pack" style={{ left: 64, top: 46, width: 92, height: 130, transform: 'rotate(-8deg)' }} />
            <div className="v2-pack" style={{ right: 64, top: 46, width: 92, height: 130, transform: 'rotate(8deg)' }} />
            <div className="v2-pack-shadow" />
            <div className="v2-pack v2-pack--hero" style={{ left: '50%', top: 12, width: 129, height: 182, transform: 'translateX(-50%)' }}>
              <div className="v2-emblem" style={{ width: 56, height: 56 }}><span style={{ fontSize: 12 }}>PH</span></div>
              <div className="v2-pack-strip">KANTO ORIGINS</div>
            </div>
          </div>
          <h1 className="v2-title">Kanto Origins</h1>
          <div className="v2-set">Base Set era · 1999 · Japanese</div>
          <div className="v2-meta">
            <span className="coins">2,500 Coins</span>
            <span className="slots">214 / 500 left</span>
          </div>
          <div className="v2-slots-bar"><i /></div>
          <div className="v2-odds">
            Top hit odds: <b>1.2%</b> — full table on pack page
            <a href="#">VERIFY →</a>
          </div>
          <button className="v2-cta">Open Pack</button>
          <a className="v2-demo" href="#">Try a free demo pull — no coins needed</a>
        </div>

        <div className="v2-trust">
          <div><b>Zero-fee</b><span>trade-in, always</span></div>
          <div><b>100% listed value</b><span>back in Coins</span></div>
          <div><b>Free shipping</b><span>on orders $100+</span></div>
        </div>

        {/* Pack shelf — 骨格: 見出し24px+右リンク、2列 gap11、ビジュアル210h */}
        <div className="v2-sec">
          <h2>All Packs</h2>
          <a href="#">VIEW ALL ›</a>
        </div>
        <div className="v2-shelf">
          {shelf.map((s) => (
            <div className="v2-shelf-card" key={s.name}>
              <div className="v2-shelf-visual">
                <div className="v2-pack">
                  <div className="v2-emblem"><span>PH</span></div>
                </div>
              </div>
              <div className="v2-shelf-name">{s.name}</div>
              <div className="v2-shelf-price">{s.price} Coins</div>
              <div className="v2-shelf-slots">{s.slots} left</div>
            </div>
          ))}
        </div>

        {/* Just Pulled — 骨格: 中央キッカー+26px見出し+横スクロール198カード */}
        <div className="v2-kicker"><i className="v2-live-dot" />LIVE</div>
        <div className="v2-recent-title">Just Pulled</div>
        <div className="v2-pulls">
          {pulls.map((p, i) => {
            const slot = assets.slots[i];
            return (
              <div className="v2-pull" key={p.name}>
                <div className={slot.slab ? 'v2-pull-visual v2-pull-visual--photo' : 'v2-pull-visual'}>
                  <div className="v2-time-pill">{p.time}</div>
                  <div className="v2-slab">
                    <div className="v2-slab-label">{p.grade}</div>
                    <div className="v2-slab-art" style={{ background: p.art }} />
                  </div>
                  {slot.slab ? (
                    <>
                      {assets.stage ? <img className="v2-stage" src={assets.stage} alt="" /> : null}
                      <img className="v2-photo" src={slot.slab} alt="" />
                      {slot.wrap ? <img className="v2-wrap-img" src={slot.wrap} alt="" /> : null}
                    </>
                  ) : null}
                </div>
                <div className="v2-pull-name">{p.name}</div>
                <div className="v2-pull-meta">
                  <div className="v2-pull-value">{p.value}<small>LISTED VALUE</small></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="v2-foot">
          <div className="v2-fair">
            <div className="shield">✓</div>
            <div>
              <b>Provably Fair</b>
              <span>Every pull is verifiable — fairness record below</span>
            </div>
          </div>
          <div className="v2-record">
            <div className="v2-record-row"><span>Server commitment</span><b>a41f8c…9c2e</b></div>
            <div className="v2-record-row"><span>Client seed</span><b>7b03aa…d114</b></div>
            <div className="v2-record-row"><span>Opening #</span><b>287</b></div>
            <div className="v2-record-row"><span></span><a href="#">VERIFY →</a></div>
          </div>
          <p className="v2-legal">
            18+. Pull Hub is not affiliated with, sponsored by, or endorsed by Nintendo,
            Creatures Inc., GAME FREAK, or The Pokémon Company. Card values shown are listed
            values in Coins, not cash amounts. Odds are published on every pack page.
          </p>
        </div>
      </div>
    </>
  );
}
