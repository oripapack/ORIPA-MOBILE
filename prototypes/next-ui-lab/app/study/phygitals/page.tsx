/**
 * ⚠ MASTER STUDY — Phygitals 模写ループ(学習用)。**出荷禁止・外部公開禁止。**
 * 本ページは docs/design-system-n2.md v3.0 CORE の適用外(クローン練習のため
 * トークン・書体・禁止事項の対象から除外する)。学びの抽出のみが目的。
 *
 * 複製しないもの: ロゴ・社名・実在カードの写真・原文の宣伝コピー。
 * 画像はすべてグレーのプレースホルダー+ダミーラベル、文言は長さを合わせた
 * ダミーに置換(asset-blocked リストは報告書参照)。
 * 参照: reference/phygitals/ref-01〜05.png(幅402pt、換算 display×0.437=論理px)。
 */

const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --pg-bg: #0A0A0B;        /* ページ地 */
  --pg-card: #131315;      /* 大カード面 */
  --pg-card-2: #1B1B1E;    /* 内側タイル/サブカード */
  --pg-btn: #2A2A2E;       /* グレーボタン */
  --pg-line: rgba(255,255,255,0.07);
  --pg-white: #FFFFFF;
  --pg-text: #EDEDEF;
  --pg-sub: #A3A3AA;
  --pg-dim: #8A8A92;
  --pg-ph: #2E2E33;        /* プレースホルダー面 */
  --pg-ph-2: #3A3A40;      /* プレースホルダー強 */
  --f-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
body { background: var(--pg-bg); color: var(--pg-text); font-family: var(--f-ui); }

.pg-wrap { width: 402px; max-width: 100%; margin: 0 auto; padding-bottom: 60px; }

/* ── site header(ref実測: ボタン高38・radius12) ── */
.pg-header { display: flex; align-items: center; gap: 9px; padding: 9px 14px; }
.pg-burger {
  width: 38px; height: 38px; border-radius: 12px;
  background: #1C1C1F; border: 1px solid var(--pg-line);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3.5px;
}
.pg-burger i { display: block; width: 15px; height: 1.8px; border-radius: 1px; background: var(--pg-text); }
.pg-mark { /* ロゴは複製しない — グレープレースホルダー */
  width: 20px; height: 24px; border-radius: 4px; background: var(--pg-ph-2); margin-left: 2px;
}
.pg-header-spacer { flex: 1; }
.pg-help {
  width: 34px; height: 34px; border-radius: 50%;
  background: #1C1C1F; color: var(--pg-text);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}
.pg-login {
  height: 38px; padding: 0 13px; border-radius: 12px;
  background: #1C1C1F; color: var(--pg-text);
  display: flex; align-items: center; gap: 6px;
  font-size: 14.5px; font-weight: 600;
}
.pg-login span.arrow { font-size: 12px; }
.pg-signup {
  height: 38px; padding: 0 14px; border-radius: 12px;
  background: var(--pg-white); color: #0A0A0B;
  display: flex; align-items: center;
  font-size: 14.5px; font-weight: 700;
}

/* ── hero(ref実測: 視覚245h・H1 20px・CTA 40h) ── */
.pg-hero {
  margin: 6px 14px 0; border-radius: 20px; background: var(--pg-card);
  padding: 16px 18px 24px; text-align: center; overflow: hidden;
}
.pg-hero-visual { position: relative; height: 245px; margin: 0 -6px 12px; }
/* 素材待ちプレースホルダー(スラブ扇+破れパック) — 実写が来るまで偽装しない */
.ph-slab {
  position: absolute; border-radius: 6px; background: var(--pg-ph);
  border: 1px solid rgba(255,255,255,0.08);
}
.ph-slab .lbl {
  position: absolute; top: 4px; left: 4px; right: 4px; height: 15px; border-radius: 2px;
  background: var(--pg-ph-2); color: #C9C9CE;
  font-size: 6.5px; letter-spacing: 0.05em; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.ph-slab .win { position: absolute; left: 8px; right: 8px; top: 23px; bottom: 7px; border-radius: 3px; background: #232327; }
.ph-pack {
  position: absolute; border-radius: 5px; background: var(--pg-ph-2);
  border: 1px solid rgba(255,255,255,0.10);
  display: flex; align-items: flex-end; justify-content: center;
  color: #C9C9CE; font-size: 7px; font-weight: 700; letter-spacing: 0.06em; padding-bottom: 6px;
}
.pg-hero-h1 { font-size: 20px; line-height: 1.2; font-weight: 800; letter-spacing: -0.01em; }
.pg-hero-h1 .a { color: var(--pg-white); }
.pg-hero-h1 .b { color: #98989F; }
.pg-hero-sub { margin-top: 8px; font-size: 15.5px; line-height: 1.45; color: #C4C4CA; }
.pg-chip {
  display: inline-block; padding: 0 8px 1px; border-radius: 7px;
  background: #3B3B41; color: var(--pg-white); font-weight: 700;
}
.pg-cta {
  margin: 18px auto 0; height: 40px; padding: 0 19px; border: none; cursor: pointer;
  border-radius: 999px; background: var(--pg-white); color: #0A0A0B;
  font-family: var(--f-ui); font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
}

/* ── section head(ref実測: h2 約24px・1行) ── */
.pg-sec { display: flex; align-items: baseline; justify-content: space-between; padding: 30px 14px 12px; white-space: nowrap; gap: 10px; }
.pg-sec h2 {
  font-size: 24px; font-weight: 800; letter-spacing: -0.01em;
  background: linear-gradient(180deg, #F2F2F4 0%, #A8A8B0 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.pg-sec a { font-size: 13.5px; color: var(--pg-dim); text-decoration: none; white-space: nowrap; }

/* ── category grid ── */
.pg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; padding: 0 14px; }
.pg-cat { border-radius: 16px; background: var(--pg-card); overflow: hidden; padding-bottom: 12px; }
.pg-cat-visual { position: relative; height: 210px; background: #1A1A1D; }
.pg-cat-name { text-align: center; font-size: 16px; font-weight: 700; margin-top: 10px; }
.pg-view {
  margin: 10px 12px 0; height: 40px; border-radius: 12px; border: none; cursor: pointer;
  background: var(--pg-btn); color: #D9D9DD;
  font-family: var(--f-ui); font-size: 14.5px; font-weight: 600; width: calc(100% - 24px);
}

/* ── recent pulls(ref実測: タイトル約26px・カード幅198) ── */
.pg-kicker {
  margin-top: 38px; text-align: center;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.38em; color: #86868D;
}
.pg-recent-title {
  text-align: center; font-size: 26px; font-weight: 800; letter-spacing: -0.005em; margin-top: 5px;
  background: linear-gradient(180deg, #F2F2F4 0%, #A8A8B0 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.pg-recent-sub { text-align: center; font-size: 15px; color: var(--pg-sub); margin-top: 6px; }
.pg-pulls { display: flex; gap: 14px; padding: 18px 14px 0; overflow-x: auto; scrollbar-width: none; }
.pg-pulls::-webkit-scrollbar { display: none; }
.pg-pull { min-width: 198px; border-radius: 16px; background: #141416; overflow: hidden; padding-bottom: 12px; }
.pg-pull-visual { position: relative; height: 200px; background: #101012; }
.pg-justnow {
  position: absolute; top: 10px; right: 10px; z-index: 2;
  height: 24px; padding: 0 11px; border-radius: 999px;
  background: rgba(240,240,244,0.92); color: #101013;
  font-size: 12.5px; font-weight: 600; display: flex; align-items: center;
}
/* 台座は写真素材(asset-blocked) — フラットなダミー楕円のみ置く */
.ph-pedestal { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); width: 120px; height: 18px; border-radius: 50%; background: var(--pg-ph); }
.pg-pull-title { padding: 11px 12px 0; font-size: 15px; font-weight: 700; }
.pg-pull-sub {
  margin: 9px 12px 0; border-radius: 11px; background: var(--pg-card-2);
  display: flex; align-items: center; gap: 9px; padding: 7px 9px;
}
.ph-thumb { width: 30px; height: 40px; border-radius: 4px; background: var(--pg-ph-2); }
.pg-pull-sub b { display: block; font-size: 13.5px; font-weight: 600; }
.pg-pull-sub span { display: block; font-size: 12px; color: var(--pg-dim); margin-top: 1px; }
`;

/** 素材待ちスラブ(グレー枠+ダミーラベル)。実写が来るまで CSS で質感を偽装しない。 */
function PhSlab({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <div className="ph-slab" style={style}>
      <div className="lbl">{label}</div>
      <div className="win" />
    </div>
  );
}

export default function PhygitalsStudy() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="pg-wrap">
        {/* header */}
        <div className="pg-header">
          <div className="pg-burger"><i /><i /><i /></div>
          <div className="pg-mark" />
          <div className="pg-header-spacer" />
          <div className="pg-help">?</div>
          <div className="pg-login"><span className="arrow">→]</span> Login</div>
          <div className="pg-signup">Sign Up</div>
        </div>

        {/* hero */}
        <div className="pg-hero">
          <div className="pg-hero-visual">
            <PhSlab style={{ left: 60, top: 56, width: 92, height: 156, transform: 'rotate(-8deg)' }} label="DUMMY SLAB 02" />
            <PhSlab style={{ right: 60, top: 56, width: 92, height: 156, transform: 'rotate(8deg)' }} label="DUMMY SLAB 03" />
            <PhSlab style={{ left: '50%', top: 8, width: 129, height: 200, transform: 'translateX(-50%)' }} label="DUMMY SLAB 01" />
            <div className="ph-pack" style={{ left: '50%', bottom: 4, width: 86, height: 120, transform: 'translateX(-84%) rotate(-4deg)' }}>DUMMY PACK</div>
            <div className="ph-pack" style={{ left: '50%', bottom: 8, width: 86, height: 120, transform: 'translateX(-16%) rotate(3deg)' }}>DUMMY PACK</div>
          </div>
          <h1 className="pg-hero-h1"><span className="a">Study copy.</span> <span className="b">Dummy grade text.</span></h1>
          <p className="pg-hero-sub">
            Placeholder body line for spacing,<br />
            sized to match at up to <span className="pg-chip">XX% value.</span>
          </p>
          <button className="pg-cta">Open Packs <span>→</span></button>
        </div>

        {/* open packs */}
        <div className="pg-sec">
          <h2>Open Packs</h2>
          <a href="#">XX–XX% dummy metric →</a>
        </div>
        <div className="pg-grid">
          {['Football', 'One Piece', 'Baseball', 'Yu-Gi-Oh!'].map((name, i) => (
            <div className="pg-cat" key={name}>
              <div className="pg-cat-visual">
                <PhSlab style={{ left: '50%', top: 6, width: 148, height: 198, transform: 'translateX(-50%)' }} label={`DUMMY SLAB 0${i + 1}`} />
                <div className="ph-pack" style={{ left: '50%', bottom: 4, width: 96, height: 132, transform: 'translateX(-50%)' }}>DUMMY PACK</div>
              </div>
              <div className="pg-cat-name">{name}</div>
              <button className="pg-view">View Packs</button>
            </div>
          ))}
        </div>

        {/* recent pulls */}
        <div className="pg-kicker">LIVE FROM THE LAB</div>
        <div className="pg-recent-title">Recent Pulls</div>
        <div className="pg-recent-sub">See what the study rig is rendering now.</div>
        <div className="pg-pulls">
          {[
            { title: '2099 Study Item One…', pack: 'Dummy Pack A' },
            { title: '2099 Study Item Two…', pack: 'Dummy Pack B' },
          ].map((p) => (
            <div className="pg-pull" key={p.title}>
              <div className="pg-pull-visual">
                <div className="pg-justnow">Just now</div>
                <div className="ph-pedestal" />
                <PhSlab style={{ left: '50%', top: 18, width: 96, height: 150, transform: 'translateX(-50%)' }} label="DUMMY SLAB" />
              </div>
              <div className="pg-pull-title">{p.title}</div>
              <div className="pg-pull-sub">
                <div className="ph-thumb" />
                <div>
                  <b>{p.pack}</b>
                  <span>Just revealed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
