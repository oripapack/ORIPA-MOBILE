# HANDOFF — Pack Opening Redesign (ORIPA-MOBILE / Pull Hub)

> このドキュメント1枚で新セッションが迷わず再開できるように書いています。
> 対象作業: `prototypes/next-ui-lab/app/sandbox/pack-opening/PackRingScene.tsx` の
> パック開封演出（3D / R3F + GSAP）の段階的リメイク（Phase A〜F）＋モバイルレイアウト調整。
> 最終更新: 2026-07-07

---

## 1. 現在地（Phase 進捗）

開封演出は Phase A〜F の計画で進行中。**全て単一ファイル** `PackRingScene.tsx` 内。

| Phase | 内容 | 状態 |
|-------|------|------|
| **A** | パック分割の土台 + interior light（tear から漏れる光）。bottom-half 台座メッシュ（現状 opacity 0 で待機） | 🟡 実装済だが **stash@{0} に退避**（working tree には無い） |
| **B** | tear gap emissive + 3層 tear line（core/halo/bloom）+ warm-white パレット `TEAR` + rarity tint 30% | 🟡 実装済だが **stash@{0} に退避**（working tree には無い） |
| **C** | 画面フラッシュ（フラップ分離の瞬間、中央収束型）+ `prefers-reduced-motion` で無効化 | ⬜ **未着手（次の演出Phase）** |
| **D** | カードの light passthrough。interior light を card 上昇と連動 dim、bottom-half 台座を可視化、本 PackRing の選択パックをフェードして台座へハンドオフ。**Phase A の“死に時間”（interior light が単独では見えない件）をここで解消** | ⬜ 未着手 |
| **E** | rarity 本演出。interior light / tear gap tint を rarity 色へさらに寄せる（現状 tint 30% → 強める）。warm white→rarity 色への滲みを完成 | ⬜ 未着手 |
| **F** | インタラクション（カルーセルsnap / 購入確定フロー / confirmPurchase モック）。**仕様確定済**（下記4章 & メモリ `project_pack_opening_phase_f.md`） | ⬜ 未着手（仕様のみ確定） |

**現在の HEAD / working tree:** `009ddcc Add pack-opening skill`（ブランチ `ui-update`）。
`git stash` で戻した結果、**`PackRingScene.tsx` は HEAD (`009ddcc`) と完全一致（差分ゼロ）＝リワーク前・オリジナルの動作するリング**。中央パックは小さいが崩れなし。route `/sandbox/pack-opening` は 200。

⚠️ **重要（2026-07-07）:** Phase A/B・モバイル望遠レイアウト・flap・床修正の実装は、
**レイアウト崩れ（中央パック不在・ズームはみ出し・カード背面巨大化）があったため git stash に退避しました。**
- **崩れた WIP（339行差分）は `stash@{0}` に保全**: `pack-opening WIP (Phase A+B, mobile telephoto, flap, floor — broken layout 2026-07-07)`。復元可能。
- 中間 commit は存在しない（reflog 確認済。過去の「Phase A commit した」は実際には行われていなかった）。「mobileレイアウトが効いていた瞬間」を指す git checkpoint は**無い**（good も broken も同じ stash に混在）。
- したがって再開は **stash を取り出して fix-forward**（下記6章）になる。現 baseline には Phase A/B の演出もモバイル望遠構図も**表示されない**（stash 内にのみ存在）。

---

## 直近の事故（2026-07-07）と再発防止

**経緯:** フラップ飛翔の修正 → リング背景の横帯（光源）の調査・照明調整、と**複数の変更を続けて重ねた**結果、モバイルのリング画面レイアウトが崩れた（中央パック不在・ズームはみ出し・カード背面巨大化）。どこの変更が引き金かを切り分けようにも、Phase A から床修正までが**未commitの1差分に混在**しており、git で「良かった時点」に戻せなかった。最終的に WIP 全体を `stash@{0}` に退避し、working tree を最後のクリーンな commit `009ddcc` に戻して事なきを得た。

**根本原因:** ①変更をこまめに commit していなかったため復元点が無かった。②1つのプロンプトで複数の見た目変更（フラップ＋照明＋床）を重ね、回帰の切り分けが不能になった。③モバイル実機確認を挟まずに次の変更へ進んだ。

**再発防止ルール（次セッションは厳守）:**
1. **1プロンプト = 1つの意味変更**。フラップ・照明・レイアウトを同じターンで混ぜない。
2. **変更ごとにモバイル縦（440×956）で目視確認**してから次へ進む（`npx tsc --noEmit` → route 200 → DevTools 縦）。
3. **良くなったら即 commit**（論理単位で小さく）。「後でまとめて」は禁止。復元点を常に持つ。
4. 崩れたら**まず `git stash` で退避**してからクリーン状態で切り分ける（`git restore` は復元不可なので避ける）。

---

## 未解決課題（stash 復元後に対応）

> 下記のうち①②は**修正コードが stash@{0} 内に存在するが、レイアウト崩れと同じ差分に混在しているため未確定**。fix-forward 後に単独で再検証・commit すること。

1. **フラップの駐車問題**: 分離後にフラップが画面上部で停留して残る。→ 修正案は「画面外まで fling（x+2.6/y+3.4, 0.45s）＋飛行中に opacity フェード（~1.18s で消滅）」を stash 内に実装済。**要再検証**。
2. **背景の横帯光源の特定**: パック背後の薄明るい横帯は **反射床（Floor）の地平線**と特定済み。望遠カメラ（地平線が画面中央に来る）＋ `ringAmbient` 引き上げで顕在化していた。→ 修正案「`ringAmbient 0.20` に下げ・`ringKey 7.5` で局所補光・`floorMixStrength 13`」を stash 内に実装済。**要再検証**（現 baseline では未適用のため横帯は再び出る可能性）。
3. **死に時間（Phase D 待ち）**: Phase A の interior light は、emissive gap やカードの light passthrough が無い状態では**単独では見えにくい“死に時間”**が残る。これは設計通り **Phase D で解消予定**（interior light を card 上昇と連動 dim ＋ bottom-half 台座の可視化）。Phase B の gap でいくらか緩和済だが、完全解消は D。

---

## 2. working tree と stash の状態

`git status`（現在）:
```
 M .claude/settings.json
?? HANDOFF.md
?? prototypes/next-ui-lab/app/lp/         (page.tsx — 新規、開封と無関係)
```
→ **`PackRingScene.tsx` は working tree から外れ、クリーンな 009ddcc の状態**。

`git stash list`:
```
stash@{0}  pack-opening WIP (Phase A+B, mobile telephoto, flap, floor — broken layout 2026-07-07)  ← 今回の全リワーク（339行差分）
stash@{1}  On feat/ui-redesign: ...   ← 無関係（古い別ブランチ）
stash@{2}  WIP on mvppacks: ...        ← 無関係（古い別ブランチ）
```
**再開時は `git stash show -p stash@{0}` で中身確認 → `git stash apply stash@{0}`（pop でなく apply 推奨、保全のため）。**

### 2-1. `stash@{0}` に入っている `PackRingScene.tsx` の変更内容
Phase A + B + モバイル望遠レイアウト + リング照明 + フラップ修正 + 床の帯修正が**1つの差分に全て入っている**。主な追加/変更（すべて `S` 定数 or GSAP timeline）:

- **Phase A**: `OPEN.interiorPeak: 2.6` / `bottomRef`（台座、opacity 0）/ `interiorLightRef`（tear の warm light、追加ライト1灯・shadowなし）。timeline で flap 分離(0.8s)→bloom、card 上昇(1.3s)→収束。
- **Phase B**: `TEAR` パレット（`coreColor #FFF4E6` / `glowColor #FFE6C2` / `gapColor #FFEACB` / `rarityTint 0.30` / `gapH 0.16` / emissive 各種）。3層 tear line group + emissive gap（高さ 0→1）。gap emissive を rarity 色へ 30% lerp（黒 diffuse + emissive）。
- **モバイル望遠レイアウト**: `ringRadiusM 1.2`（desktop `ringRadius 3.1` は据置き＝開封ステージZ兼用）/ 望遠カメラ `camYM 0.56 / camZM 9.0 / camFovM 24 / camLAYM 0.40 / camLAZM 1.20` / `portraitLo 0.55 / portraitHi 0.90` / `minDepthScaleM 0.85` / `minDepthOpacityM 0.05`。`mobileBlend(aspect)` ヘルパー。PackRing の useFrame で responsive 半径＋**選択パックを zoom時 z=3.1(ステージ)へ lerp**（desktop は no-op）。ZoomController のリング端点を responsive 化。位置ドット（`frontIdx` state、ring mode の「次がある」示唆）。
- **リング照明**: `ringAmbient 0.20 / ringKey 7.5`。`LightModulator` が zoomT で ring↔zoom の明るさを補間（ring は明るく product 可視、zoom/開封は暗転）。追加ライトなし（既存 ambient/key を変調）。
- **フラップ修正**: 画面外まで飛ばし切る（x+2.6 / y+3.4 / dur 0.45 / rot z-1.6）+ 飛行中フェード（opacity 0.28 @0.9s、~1.18s で消滅）。滞空0.5s以内。
- **床の帯修正**: `floorMixStrength 20→13`（反射を地平線の帯でなく足元プールに）。上記 `ringAmbient` 引き下げと合わせて、パック背後の明るい横帯（＝反射床の地平線）を除去。

### 2-2. `.claude/settings.json`
権限許可を1行追加（`curl ... http://localhost:3001/sandbox/pack-opening` の route チェック）。実害なし。

### 2-3. `prototypes/next-ui-lab/app/lp/page.tsx`（新規・未追跡）
`/frontend-design` スキルで作った **Pull Hub LP のヒーローセクション**。パック開封の作業とは**独立**。被写界深度ファン表示 + ライブプル ticker + How it works + Final CTA。テスト URL `http://localhost:3001/lp`。開封アークとは別枠なので、commit するなら分けてよい。

---

## 3. 進行中タスク: モバイルリング画面レイアウト（ポケポケ構図）

**目的:** モバイル縦（ポートレート）のリング選択画面を Pokémon Pocket 風に。

**確定した数値目標（投影計算で導出済）:**
- 中央パック: 幅 = 画面幅の **約45%**、垂直中心 = 画面高さの **約45%（やや上）**
- 左右の隣接パック: 画面端から **約11%** 覗く（望遠圧縮で見せる）。中央よりやや小さい（foreshorten）
- 奥側パックはほぼ不可視（opacity 落とす）

**確定した実装値（440×956 で検証）:** `R=1.2 / camZ=9 / fov=24 / lookAt(0, 0.40, 1.2)` → 幅45%・高さ29%・垂直中心45%・peek 11%。

**重要な設計判断:** 8パックのリング（隣接±45°）では**通常カメラでは peek 不可能**（隣接の水平スクリーン角がスケール不変）。→ **望遠圧縮（遠カメラ+狭FOV+小半径）**で解決。opening/zoom を壊さないため **「選択パックはタップ時に固定ステージ z=3.1 へ glide」** 方式（desktop は R=3.1=stage で完全無変更）。

**状態:** 実装済だが**レイアウトが崩れて `stash@{0}` に退避中**（working tree には無い）。数値目標そのものは投影計算で妥当性確認済なので、fix-forward では「望遠値は活かしつつ、崩れの原因（stage-lerp / responsive camera の opening 側への漏れ等）を直す」方針。desktop は `mobileBlend`=0 で無変更。

---

## 4. 確定済みの仕様と制約

### 4-1. Phase F 仕様（確定・未実装）
詳細はメモリ `.../memory/project_pack_opening_phase_f.md` に格納。要約:
- **F-1 カルーセル snap**: 慣性減衰後、最寄りパックを中央（angle 0）へ吸着。`settled` ref で「中央のみタップ可能」を実装。
- **F-2 購入確定フロー**: zoomed に「購入して開封」ボタン。**押下＝購入確定点**。以降 Back/Buy を非表示化（キャンセル不可）。開封演出は確定後のプレゼンとして再生。zoomed（購入前）は Back で選び直し可。
- **F-3 confirmPurchase() モック**: `async confirmPurchase(packId): Promise<PullResult>`（`{rarity, cardId, cardImage, drawId?, serverSeedHash?}`）。クライアント抽選をやめ**戻り値の rarity を消費**。**順序制約: Buy→await→rarity確定→その後 opening 開始**（Phase B/E の rarity tint を初フレームから正しく駆動するため）。本番で Yutaka の在庫decrement+抽選API に差し替え（`provably-fair` の commit-reveal と整合）。

### 4-2. 恒久制約
- **追加ライトは interior light の1灯まで**（WebGL Context Lost 対策）。**シャドウ無効**。Phase C 以降で新規ライトを足さない（既存ライトの変調で対応）。
- **`prefers-reduced-motion` 対応**: Phase C の画面フラッシュは reduced-motion ユーザーには無効化する（確定要件）。他の演出も reduced-motion を尊重する方針。
- **レアリティ色の段階的リビール方針**: 演出は **warm white（tungsten）→ rarity 色への“滲み”** で表現。Phase B で gap emissive を rarity 色へ 30% lerp 済（準備）。Phase E で本格化。casino/ネオン/派手グラデ回避（CLAUDE.md 準拠）。
- **R6シージ参考の光の形状方針**: ユーザー指定の参照方向として「光の形状（＝開封時の漏れ光/シャフトの形）」に Rainbow Six Siege を参考にする、との指示あり。ただし**具体パラメータは本セッションでは未確定**。Phase C/D の光演出を実装する前に**ユーザーに具体像（volumetric shaft か soft bloom か、角度/広がり等）を確認すること**。現状の tear gap + interior light は soft bloom 寄り。

### 4-3. アニメーション規約（CLAUDE.md）
- Max duration 300ms、easing ease-out 基本（開封シーケンスは演出上これ超の tween あり、ただし各アクションは短く）。
- `npm run build` は叩かない（.next 破損回避）。型チェックは `npx tsc --noEmit`。
- 2D Layer に GSAP を混ぜない / 3D の GSAP tween は必ず cleanup（kill）。

---

## 5. 環境の注意点

- **起動コマンド（重要）**: ルートの `npm run dev` は **Expo（モバイル）が起動する**。Web プロトタイプではない。
  Web プロトタイプ（今回の作業対象）は:
  ```bash
  # ルートから
  npm run prototype:web
  # または
  cd prototypes/next-ui-lab && npm run dev
  ```
- **現在このセッションで起動中のサーバー**: `cd prototypes/next-ui-lab && npm run dev -- --port 3001`（**ポート3001**）。
- **テスト URL**:
  - 開封 sandbox: `http://localhost:3001/sandbox/pack-opening`
  - LP（別作業）: `http://localhost:3001/lp`
- **.next キャッシュ破損の回避**:
  ```bash
  cd prototypes/next-ui-lab
  rm -rf .next
  npm run dev
  ```
  古い型/コンポーネントを参照し続ける挙動が出たら上記でクリア。
- **SSR 落とし穴**: `sandbox/pack-opening/page.tsx` は `dynamic(() => import('./PackRingScene'), { ssr: false })` で SSR 除外済（window/WebGL のため必須）。触らないこと。
- **確認フロー**: 編集後は `npx tsc --noEmit`（型）→ route の HTTP 200 確認 → DevTools デバイスモード（iPhone 縦、440×956 等）で目視。desktop はウィンドウ横長で確認。

---

## 6. 次にやるべきこと（優先順）

0. **【最優先】stash@{0} を復元し、レイアウト崩れを fix-forward**
   working tree はクリーン（009ddcc）。リワークは stash に退避済み。再開手順:
   ```bash
   git stash show -p stash@{0}          # 差分を確認
   git stash apply stash@{0}            # working tree に戻す（pop でなく apply）
   ```
   その上で**3つの崩れ症状を特定して修正**する（原因は望遠リワークにある可能性が高い）:
   - **リング画面の中央パック不在**: 望遠 stage-lerp（選択パックを z=3.1 へ glide）/ responsive camera（`camZM 9.0 / camFovM 24`）/ `mobileBlend` 周辺を疑う。
   - **ズームのはみ出し**: zoomed 端点と mobile ring 端点の lerp（ZoomController）、または stage z との不整合。
   - **カード背面の巨大化**: OpeningSequence のカード位置/スケールと mobile stage(z=3.1) の整合。opening は device 非依存のはずなので、responsive 値が opening 側に漏れていないか確認。
   - 疑わしければ、まず望遠リワーク分だけ戻して **mobile Option A**（`camYM 0.82 / camZM 4.90 / camFovM 44`、peek無しで中央大）に一旦落とすのも手（stash 内に痕跡あり）。
   - 直ったら **論理単位で commit**（例: `feat: pack opening Phase A+B`, `feat: mobile ring framing + lighting`, `fix: flap fling + floor band`）。LP は別 commit。末尾に `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。
1. **視覚確認**（fix後）: モバイル縦（440×956）で中央パック~45%/隣接peek~11%/床の帯なし/明るさ、開封でフラップ飛び切り・tear gap の warm light。desktop 横長で従来構図維持。
2. **Phase C 実装**（画面フラッシュ + `prefers-reduced-motion` 無効化）。**着手前に「R6シージ参考の光の形状」の具体像をユーザーに確認**（4-2 参照）。
3. **Phase D 実装**（card light passthrough / bottom-half 台座の可視化 / 本 pack フェード。Phase A の死に時間をここで解消）。
4. **Phase E 実装**（rarity 本演出、tint を強める）。
5. **Phase F 実装**（snap → 購入確定 → confirmPurchase モック。opening 演出が固まってから）。
6. LP ヒーローセクション（`/lp`）は独立タスク。必要なら別途継続。

---

## 参照
- 作業ファイル: `prototypes/next-ui-lab/app/sandbox/pack-opening/PackRingScene.tsx`
- スキル: `.claude/skills/pack-opening/SKILL.md`（起動/キャッシュ/GSAP/SSR の詳細）, `.claude/skills/provably-fair/SKILL.md`
- メモリ: `.../memory/MEMORY.md`（索引）, `project_pack_opening_phase_f.md`（F仕様）, `project_pull_hub_economy.md`（経済モデル）
- 設計原則: ルート `CLAUDE.md`（UI Redesign Mode / dark premium / 8pt / アニメ規約）, `ORIPA-MOBILE/CLAUDE.md`（アーキ/コマンド）
