/**
 * Pull Hub UI Redesign — "Stage & Gallery" token sheet + Home static mock.
 * Lab-only prototype (not product code). Approved values will be documented in
 * docs/design-spec.md and then ported to src/tokens/.
 */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Schibsted+Grotesk:wght@400;500;700&family=Spline+Sans+Mono:wght@500;600&display=swap');

:root {
  /* ── Stage (最暗: 開封劇場) ── */
  --stage-bg: #0B0B0E;
  /* ── Showroom (チャコール: 商品展示) ── */
  --show-bg: #141518;
  --show-surface: #1B1C21;
  --show-raised: #222329;
  --show-line: #2E2F36;
  --show-text: #F2F0EB;
  --show-text-mut: #A7A49C;
  /* ── Gallery (明るいニュートラル: 取引・所有) ── */
  --gal-bg: #F5F3EF;
  --gal-surface: #FFFFFF;
  --gal-line: #E4E0D8;
  --gal-ink: #1A1918;
  --gal-ink-mut: #6E6A62;
  /* ── 共通アクセント ── */
  --shu: #C73E3A;          /* 朱 — 1画面1要素 */
  --shu-deep: #A93330;
  --on-shu: #FFF8F4;
  --gold: #C9A96E;         /* シャンパンゴールド (3Dシーン packBorder と同値) */
  --gold-deep: #8F7442;
  --gold-metal: linear-gradient(160deg, #E3C98F 0%, #C9A96E 45%, #8F7442 100%);
  --jade: #3D8B6E;         /* 金銭ポジティブ専用 (Trade-In / listed value up) */
  --jade-bright: #5FB08F;
  /* ── 型 ── */
  --f-display: 'Fraunces', serif;
  --f-body: 'Schibsted Grotesk', sans-serif;
  --f-data: 'Spline Sans Mono', monospace;
  /* ── 影 (Gallery のみ実影、ダーク側は線と面差で表現) ── */
  --shadow-gal: 0 8px 24px rgba(26,25,24,0.08);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0E0E11; color: var(--show-text); font-family: var(--f-body); }

.rd-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px; }
@media (max-width: 500px) {
  .rd-wrap { padding: 24px 0 64px; }
  .rd-wrap > .rd-label, .rd-h1, .rd-sub { padding-left: 16px; padding-right: 16px; }
  .rd-section { margin-top: 40px; }
  .rd-section .rd-label, .rd-section h2 { padding-left: 16px; padding-right: 16px; }
  .rd-grid, .spec { margin-left: 16px; margin-right: 16px; }
  .phone { border-radius: 0; border-left: none; border-right: none; }
}
.rd-h1 { font-family: var(--f-display); font-weight: 600; font-size: 28px; letter-spacing: 0.01em; }
.rd-sub { color: var(--show-text-mut); font-size: 14px; margin-top: 8px; }
.rd-section { margin-top: 64px; }
.rd-label { font-family: var(--f-data); font-size: 12px; letter-spacing: 0.14em; color: var(--gold); text-transform: uppercase; }
.rd-section h2 { font-family: var(--f-display); font-weight: 500; font-size: 20px; margin-top: 8px; }
.rd-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; }

/* ── Swatches ── */
.sw { width: 132px; border-radius: 12px; overflow: hidden; border: 1px solid var(--show-line); }
.sw-chip { height: 64px; }
.sw-meta { padding: 8px 10px; background: var(--show-surface); }
.sw-name { font-size: 12px; font-weight: 500; }
.sw-hex { font-family: var(--f-data); font-size: 11px; color: var(--show-text-mut); }

/* ── Type specimens ── */
.spec { border-left: 2px solid var(--show-line); padding-left: 20px; margin-top: 24px; }
.spec + .spec { margin-top: 32px; }
.spec-role { font-family: var(--f-data); font-size: 11px; letter-spacing: 0.12em; color: var(--show-text-mut); text-transform: uppercase; }

/* ═══════════════ PHONE ARTBOARD (440×956) ═══════════════ */
.phone {
  width: 440px; max-width: 100%; height: 956px; margin: 24px auto 0;
  background: var(--show-bg); border-radius: 24px;
  border: 1px solid var(--show-line);
  overflow-y: auto; overflow-x: hidden; position: relative;
  scrollbar-width: none;
}
.phone::-webkit-scrollbar { display: none; }

/* Top bar */
.tb { display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 0; }
.tb-logo { font-family: var(--f-display); font-weight: 600; font-size: 18px; letter-spacing: 0.02em; }
.tb-coins {
  display: flex; align-items: center; gap: 8px;
  background: var(--show-surface); border: 1px solid var(--show-line);
  border-radius: 999px; padding: 6px 14px 6px 8px;
}
.tb-coin-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--gold-metal); }
.tb-coins span { font-family: var(--f-data); font-size: 13px; font-weight: 600; }

/* Hero */
.hero { position: relative; padding: 40px 24px 32px; overflow: hidden; }
.hero-wave { position: absolute; left: -40px; right: -40px; top: 96px; opacity: 0.5; pointer-events: none; }
.hero-spot {
  position: absolute; left: 50%; top: 20px; width: 360px; height: 360px;
  transform: translateX(-50%);
  background: radial-gradient(closest-side, rgba(227,201,143,0.13), rgba(227,201,143,0.0) 70%);
  pointer-events: none;
}
.hero-eyebrow { text-align: center; font-family: var(--f-data); font-size: 11px; letter-spacing: 0.18em; color: var(--gold); }
.hero-pack-zone { position: relative; display: flex; justify-content: center; margin-top: 24px; }
.pack {
  width: 148px; height: 208px; border-radius: 10px; position: relative;
  background: linear-gradient(170deg, #22232B 0%, #17181D 70%);
  border: 1px solid rgba(201,169,110,0.55);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);
}
.pack::before { /* クリンプ(圧着ギザ) */
  content: ''; position: absolute; left: 8px; right: 8px; top: 7px; height: 6px;
  background: repeating-linear-gradient(90deg, rgba(201,169,110,0.4) 0 2px, transparent 2px 5px);
}
.pack::after { /* 箔のシーン(斜光) */
  content: ''; position: absolute; inset: 0; border-radius: 10px;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.09) 44%, transparent 58%);
}
.pack-emblem {
  position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%);
  width: 64px; height: 64px; border-radius: 50%;
  border: 1.5px solid rgba(201,169,110,0.8);
  display: flex; align-items: center; justify-content: center;
}
.pack-emblem span { font-family: var(--f-display); font-size: 13px; color: var(--gold); letter-spacing: 0.04em; }
.pack-name-strip { position: absolute; bottom: 14px; left: 0; right: 0; text-align: center;
  font-family: var(--f-data); font-size: 9px; letter-spacing: 0.22em; color: var(--show-text-mut); }
.pack-shadow {
  position: absolute; left: 50%; bottom: -18px; transform: translateX(-50%);
  width: 180px; height: 24px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,0.55), transparent);
}
.hero-title { text-align: center; font-family: var(--f-display); font-weight: 600; font-size: 32px; line-height: 1.15; margin-top: 32px; }
.hero-meta { display: flex; justify-content: center; align-items: baseline; gap: 12px; margin-top: 10px; }
.hero-meta .coins { font-family: var(--f-data); font-size: 15px; font-weight: 600; color: var(--gold); }
.hero-meta .slots { font-family: var(--f-data); font-size: 12px; color: var(--show-text-mut); }
.slots-bar { width: 200px; height: 2px; background: var(--show-line); border-radius: 2px; margin: 10px auto 0; }
.slots-bar i { display: block; height: 2px; width: 43%; background: var(--gold); border-radius: 2px; }

/* CTA — 朱はこの1要素のみ */
.cta {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin: 24px 0 0; padding: 16px; border-radius: 12px;
  background: var(--shu); color: var(--on-shu);
  font-size: 16px; font-weight: 700; letter-spacing: 0.01em;
  border: none; width: 100%; cursor: pointer;
}
.cta:active { background: var(--shu-deep); }
.demo-link { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--show-text-mut); text-decoration: underline; text-underline-offset: 3px; }

/* Trust strip */
.trust { display: flex; margin: 28px 24px 0; border-top: 1px solid var(--show-line); border-bottom: 1px solid var(--show-line); }
.trust div { flex: 1; padding: 14px 8px; text-align: center; }
.trust div + div { border-left: 1px solid var(--show-line); }
.trust b { display: block; font-size: 12px; font-weight: 700; }
.trust span { display: block; font-size: 10px; color: var(--show-text-mut); margin-top: 3px; line-height: 1.4; }

/* Just Pulled */
.sec-head { display: flex; align-items: baseline; justify-content: space-between; padding: 32px 24px 0; }
.sec-head h3 { font-family: var(--f-display); font-weight: 500; font-size: 18px; }
.sec-head a { font-family: var(--f-data); font-size: 11px; color: var(--show-text-mut); text-decoration: none; letter-spacing: 0.08em; display: inline-flex; align-items: center; gap: 6px; }
/* 発光はStage層の演出とLIVEインジケータのみ許可 (改訂ルール) */
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 6px 1px rgba(201,169,110,0.7);
  animation: live-pulse 2.4s ease-out infinite;
}
@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 4px 0px rgba(201,169,110,0.5); }
  50% { box-shadow: 0 0 9px 2px rgba(201,169,110,0.85); }
}
@media (prefers-reduced-motion: reduce) {
  .live-dot { animation: none; }
}
.jp-row { display: flex; gap: 12px; padding: 16px 24px 4px; overflow-x: auto; scrollbar-width: none; }
.jp-row::-webkit-scrollbar { display: none; }
.jp-card {
  min-width: 150px; background: var(--show-surface); border: 1px solid var(--show-line);
  border-radius: 12px; padding: 10px;
}
.slab { height: 96px; border-radius: 6px; background: #E9E7E1; position: relative; overflow: hidden; }
.slab-label { position: absolute; top: 6px; left: 6px; right: 6px; height: 16px; border-radius: 3px;
  background: #23242A; color: #E9E7E1; font-family: var(--f-data); font-size: 7.5px;
  display: flex; align-items: center; justify-content: center; letter-spacing: 0.08em; }
.slab-art { position: absolute; top: 28px; left: 18px; right: 18px; bottom: 8px; border-radius: 3px; }
.jp-name { font-size: 12px; font-weight: 500; margin-top: 10px; line-height: 1.3; }
.jp-meta { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; }
.jp-value { font-family: var(--f-data); font-size: 12px; font-weight: 600; color: var(--jade-bright); }
.jp-value small { display: block; font-size: 8.5px; color: var(--show-text-mut); font-weight: 500; letter-spacing: 0.05em; }
.jp-time { font-family: var(--f-data); font-size: 10px; color: var(--show-text-mut); }

/* Pack shelf */
.shelf { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 24px 0; }
.shelf-card { background: var(--show-surface); border: 1px solid var(--show-line); border-radius: 16px; padding: 16px 14px 14px; text-align: center; }
.shelf-card .pack { width: 96px; height: 134px; margin: 0 auto; border-radius: 8px; }
.shelf-card .pack-emblem { width: 42px; height: 42px; }
.shelf-card .pack-emblem span { font-size: 9px; }
.shelf-name { font-size: 14px; font-weight: 700; margin-top: 14px; }
.shelf-price { font-family: var(--f-data); font-size: 13px; font-weight: 600; color: var(--gold); margin-top: 4px; }
.shelf-slots { font-family: var(--f-data); font-size: 10px; color: var(--show-text-mut); margin-top: 6px; }

/* Footer */
.foot { margin-top: 40px; padding: 24px; border-top: 1px solid var(--show-line); }
.foot-fair { display: flex; align-items: center; gap: 10px; }
.foot-fair .shield { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--show-line);
  display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 13px; }
.foot-fair b { font-size: 13px; }
.foot-fair span { display: block; font-size: 11px; color: var(--show-text-mut); }
.foot-legal { font-size: 9.5px; color: #6B6862; line-height: 1.6; margin-top: 16px; }

/* ── Gallery mini-panel (token sheet 用) ── */
.gal-panel { background: var(--gal-bg); color: var(--gal-ink); border-radius: 16px; padding: 24px; max-width: 440px; }
.gal-panel h4 { font-family: var(--f-display); font-weight: 600; font-size: 18px; }
.gal-cardrow { display: flex; gap: 12px; margin-top: 16px; }
.gal-choice { flex: 1; background: var(--gal-surface); border: 1px solid var(--gal-line); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-gal); }
.gal-choice small { font-family: var(--f-data); font-size: 10px; letter-spacing: 0.1em; color: var(--gal-ink-mut); }
.gal-choice .v { font-family: var(--f-data); font-size: 18px; font-weight: 600; margin-top: 6px; }
.gal-choice .v.jade { color: var(--jade); }
.gal-choice p { font-size: 11px; color: var(--gal-ink-mut); margin-top: 4px; }

/* Metal sample */
.metal { width: 220px; height: 56px; border-radius: 12px; background: var(--gold-metal);
  display: flex; align-items: center; justify-content: center;
  color: #241C0E; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; }
`;

/* 浮世絵様式の波 — オリジナル線画 (低彩度・stroke のみ) */
function Wave({ stroke = '#34363E' }: { stroke?: string }) {
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
  stage: [
    { n: 'stage/bg', v: '#0B0B0E' },
  ],
  showroom: [
    { n: 'showroom/bg', v: '#141518' },
    { n: 'showroom/surface', v: '#1B1C21' },
    { n: 'showroom/raised', v: '#222329' },
    { n: 'showroom/line', v: '#2E2F36' },
    { n: 'text/on-dark', v: '#F2F0EB' },
    { n: 'text/on-dark-muted', v: '#A7A49C' },
  ],
  gallery: [
    { n: 'gallery/bg', v: '#F5F3EF' },
    { n: 'gallery/surface', v: '#FFFFFF' },
    { n: 'gallery/line', v: '#E4E0D8' },
    { n: 'gallery/ink', v: '#1A1918' },
    { n: 'gallery/ink-muted', v: '#6E6A62' },
  ],
  accent: [
    { n: 'shu 朱 (CTA/和シグナル)', v: '#C73E3A' },
    { n: 'shu/pressed', v: '#A93330' },
    { n: 'gold (3Dシーンと同値)', v: '#C9A96E' },
    { n: 'gold/deep', v: '#8F7442' },
    { n: 'jade (金銭ポジ専用)', v: '#3D8B6E' },
    { n: 'jade/on-dark', v: '#5FB08F' },
  ],
};

const pulls = [
  { name: 'Umbreon Gold Star Holo', grade: 'GRADED · GEM 9.5', value: '$4,120', time: '3m', art: 'linear-gradient(160deg,#2E2A45,#57518A)' },
  { name: 'Charizard 1st Ed. Base', grade: 'GRADED · MINT 9', value: '$12,800', time: '11m', art: 'linear-gradient(160deg,#4A2B22,#8A4A31)' },
  { name: 'Rayquaza ★ Clash Blue Sky', grade: 'GRADED · NM-MT 8', value: '$15,742', time: '26m', art: 'linear-gradient(160deg,#1F3A32,#3E6E5A)' },
  { name: 'Pikachu Illustrator Promo', grade: 'GRADED · EX 5', value: '$38,000', time: '1h', art: 'linear-gradient(160deg,#4A4022,#8A7A31)' },
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
        <div className="rd-label">Pull Hub UI Redesign — Proposal 01</div>
        <h1 className="rd-h1">Stage &amp; Gallery</h1>
        <p className="rd-sub">
          輝度3層(Stage 開封劇場 / Showroom 商品展示 / Gallery 取引・所有)+ 朱の落款 + 浮世絵線画。
          下のモックはホーム(Showroom 層)を 440×956 で組んだもの。
        </p>

        {/* ═══ 1. Home mock ═══ */}
        <div className="rd-section">
          <div className="rd-label">01 — Home Mock (Showroom, 440×956)</div>
          <div className="phone">
            <div className="tb">
              <div className="tb-logo">Pull Hub</div>
              <div className="tb-coins"><i className="tb-coin-dot" /><span>12,500</span></div>
            </div>

            <div className="hero">
              <div className="hero-spot" />
              <div className="hero-wave"><Wave /></div>
              <div className="hero-eyebrow">JAPANESE EXCLUSIVES — DIRECT FROM TOKYO</div>
              <div className="hero-pack-zone">
                <div className="pack">
                  <div className="pack-emblem"><span>PH</span></div>
                  <div className="pack-name-strip">KANTO ORIGINS</div>
                </div>
                <div className="pack-shadow" />
              </div>
              <h1 className="hero-title">Kanto Origins</h1>
              <div className="hero-meta">
                <span className="coins">2,500 Coins</span>
                <span className="slots">214 / 500 left</span>
              </div>
              <div className="slots-bar"><i /></div>
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
                    <div className="jp-time">{p.time} ago</div>
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
                  <span>Verify any pull with its seed hash — see how it works</span>
                </div>
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
          <div className="rd-label">02 — Palette (輝度3層 + 共通アクセント)</div>
          <h2>Stage → Showroom → Gallery</h2>
          {(['stage', 'showroom', 'gallery', 'accent'] as const).map((k) => (
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
          <div className="rd-label">03 — Typography</div>
          <h2>3つの声</h2>
          <div className="spec">
            <div className="spec-role">Display — Fraunces 600 (見出し・パック名)</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 600, marginTop: 8 }}>Kanto Origins</div>
          </div>
          <div className="spec">
            <div className="spec-role">Body — Schibsted Grotesk 400/500/700 (本文・UI)</div>
            <div style={{ fontSize: 15, marginTop: 8, maxWidth: 560 }}>
              Each pack contains one graded Japanese card. Don&apos;t like your pull?
              Trade it back instantly for 100% of listed value, in Coins.
            </div>
          </div>
          <div className="spec">
            <div className="spec-role">Data — Spline Sans Mono 500/600 (価格・オッズ・残口数。数値は全てこれ)</div>
            <div style={{ fontFamily: 'var(--f-data)', fontSize: 18, fontWeight: 600, marginTop: 8 }}>
              2,500 Coins · 214/500 · 80.0% · $15,742.71
            </div>
          </div>
        </div>

        {/* ═══ 4. 質感・Gallery プレビュー ═══ */}
        <div className="rd-section">
          <div className="rd-label">04 — 質感 & Gallery 層 (結果画面の二択の例)</div>
          <h2>金属・影・明るい取引画面</h2>
          <div className="rd-grid" style={{ alignItems: 'flex-start' }}>
            <div className="metal">CHAMPAGNE METAL</div>
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

        {/* ═══ 5. Spacing / radius ═══ */}
        <div className="rd-section">
          <div className="rd-label">05 — Spacing 8pt / Radius / 実行ルール</div>
          <h2>規律</h2>
          <p className="rd-sub" style={{ maxWidth: 640, lineHeight: 1.8 }}>
            Spacing: 4 / 8 / 16 / 24 / 32 / 48 / 64。Radius: chip 999 · button 12 · card 16 · slab 6。
            朱は1画面1要素(このホームでは CTA のみ)。和モチーフは1画面1つ(このホームでは波のみ)。
            影は Gallery 層のみ実影、ダーク側は面の明度差と線で表現。
            数値は必ず Spline Sans Mono + 単位ラベル(Coins / listed value)。
            漢字の刻印表現は不採用。
            ネオン管・ネオングリッド等の都市的表現は不可 — 発光(グロー)は Stage 層の演出と
            LIVE インジケータ(上の Just Pulled の金のドット)に限り可。
          </p>
        </div>
      </div>
    </>
  );
}
