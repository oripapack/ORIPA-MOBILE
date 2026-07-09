---
name: pack-opening
description: ORIPA-MOBILE のパック開封演出（components/pack-opening/ の Layer 群、opening ページ、sandbox の 3D シーン）を実装・修正するときに使う。web プロトタイプの起動、.next キャッシュ破損の回避、framer-motion と GSAP の使い分け、GSAP tween のリーク防止、新レアリティ追加時の修正箇所、SSR / 'use client' の落とし穴を扱う。pack opening / reveal / reel / rarity / framer-motion / gsap / three / R3F / Next.js prototype に関わる作業で発動。
---

# パック開封演出・実装規約（ORIPA-MOBILE）

このリポジトリ固有の落とし穴をまとめたもの。憶測ではなく実コードから確認した事実に基づく。
「要確認」と書かれた項目は未検証なので、作業前に該当ファイルを読むこと。

## アーキテクチャの前提

- 本番の開封演出は `components/pack-opening/` の 2D Layer 群。**全て framer-motion**（GSAP は使っていない）。
  - `PackOpeningEngine.tsx` … ステージ全体のオーケストレーター
  - `IntroLayer` → `ReelLayer` → `StopLayer` → `RevealLayer` → `CardBackLayer` → `ControlsLayer` → `ResultLayer`
  - `RarityEffects.tsx` … レアリティ別エフェクト
  - `usePackOpening.ts` … 開封フローのステート管理フック（framer-motion の `animate()` のみ使用）
  - `types.ts`（`RevealRarity` 等）/ `rarityConfig.ts`（色・演出パラメータ）が設定・型の単一ソース
- 3D は `app/sandbox/pack-opening/PackRingScene.tsx` **だけ**。three + R3F + drei + GSAP。sandbox 扱い。

## 1. 起動コマンド（間違えやすい）

- `npm run dev` は **Expo（モバイル）が起動する**。Web プロトタイプではない。
- Web プロトタイプの正しい起動：
  ```bash
  # ルートから
  npm run prototype:web
  # または next-ui-lab に入って
  cd prototypes/next-ui-lab && npm run dev
  ```

## 2. .next キャッシュ破損の回避

- **`npm run build` は実行しない**（CLAUDE.md のルール。.next 破損を避けるため）。
- 型チェックは `npx tsc --noEmit` で代替する。
- キャッシュが古い型を参照し続けやすい条件：
  - `shared/` 配下の型定義変更後（`data/catalog.ts` が `../../../shared/` を path で直参照しているため）
  - `tailwind.config.ts` / `globals.css` の CSS 変数変更
- 復旧手順：
  ```bash
  cd prototypes/next-ui-lab
  rm -rf .next
  npm run dev
  ```

## 3. framer-motion と GSAP の使い分け（混ぜない）

| レイヤー | ライブラリ | 対象 |
|---|---|---|
| `components/pack-opening/`（2D） | framer-motion のみ | `useMotionValue` + `animate()` でリール translate・カードフリップ・フラッシュ・バッジスケール |
| `PackRingScene.tsx`（3D） | GSAP のみ | Three.js オブジェクト（`position.y` / `rotation.y` / `material.opacity`）の tweening |

- 同一 Layer で両方を混ぜない。「どちらが値を所有するか」で競合する。
- 3D シーンでは `useFrame` が XZ を所有し GSAP が Y を所有する分担になっている（PackRingScene 内コメント参照）。
- 2D DOM 要素は framer-motion の `MotionValue`（React 状態と連動、宣言的に props へ）。
- Three.js の plain object を直接 mutate するのは GSAP。

## 4. GSAP tween のリーク防止（PackRingScene.tsx）

GSAP を触るのは 3D シーンだけだが、既知のリーク箇所がある。

- **entry animation の useEffect**：`setTimeout` の中で `gsap.to()` を張り、cleanup は `clearTimeout` のみ。
  `setTimeout` がキャンセルされても既に fire していれば tween が走り続ける。
- **card reveal/flip の useEffect**：`gsap.to()` の cleanup が無く、アンマウント時に既に dispose された
  マテリアルへ書き続けるリスク。

正しい cleanup パターン：
```ts
useEffect(() => {
  if (!cardRef.current) return;
  const tween = gsap.to(cardRef.current.position, { y: targetY, duration: 0.5 });
  return () => {
    tween.kill();                       // 単発 tween
    // または gsap.killTweensOf(cardRef.current);  // そのオブジェクトの全 tween
    // timeline なら tl.kill();
  };
}, [dep]);
```
- zoom/unzoom は既に `gsap.killTweensOf()` を呼んでから新 tween を張る正しいパターンになっている（参考実装）。

## 5. 新レアリティ追加時の修正箇所

`RevealRarity` は `types.ts` の union 型。追加すると **TypeScript エラーで守られるのは2ファイルだけ**：

- `types.ts` … `RevealRarity` union に追加
- `rarityConfig.ts` … `RARITY_PROFILE` と `RARITY_VISUAL` の Record に追加（`Record<RevealRarity, ...>` なので型エラーになる）

**型エラーにならず silent フォールバックする＝手動で追わないと壊れる箇所**：

| ファイル | 箇所 | 症状 |
|---|---|---|
| `ReelLayer.tsx` | `RARITY_TINT: Record<string, string>` | string キーなのでエラーにならず、新レアが `RARITY_TINT.common` にフォールバック |
| `RevealLayer.tsx` | `RARITY_CLASSES: Record<string, ...>` | `?? RARITY_CLASSES.common` にフォールバック |
| `ResultLayer.tsx` | `RARITY_LABEL` / `RARITY_BADGE` | `?? RARITY_BADGE.common` にフォールバック |
| `RarityEffects.tsx` | `rarity === 'chase'` の if-else | 新レアは最後の else（common 扱いの gray glow）になる |
| `mockCards.ts` | reel strip 生成 | 要確認。mock データに新レアのカードを追加しないと reel に出現しない |

→ 追加時は上記6ファイルを必ず手動チェック。型に頼れるのは types.ts + rarityConfig.ts のみ。

## 6. SSR / 'use client' の落とし穴

正しくできている対応：
- `sandbox/pack-opening/page.tsx` … Three.js + R3F は `dynamic(() => import('./PackRingScene'), { ssr: false })` で SSR から除外。これが無いと `window` / WebGL 参照でビルドがクラッシュする。
- `PackOpeningEngine.tsx` の `window.dispatchEvent` は `typeof window !== 'undefined'` でガード済み。
- `useSearchParams()` は Suspense で包む（pack-detail 系で対応済み）。

壊れやすい箇所：
- `usePackOpening` の `useLayoutEffect`、`PackOpeningEngine.tsx` の `useLayoutEffect`（ResizeObserver）は
  Server Component から呼ぼうとした瞬間に壊れる。`'use client'` を外さない。
- 新しく `window` / WebGL / `useLayoutEffect` を使うコンポーネントを Three.js 経路に足すときは
  必ず `dynamic(..., { ssr: false })` かガードを付ける。
- 要確認：`mockCards.ts` が `crypto` / `Math.random` などサーバー/クライアントで挙動が違うものを
  使っていないか（乱数は provably-fair 側の規約に従うべき。ファイル未読のため要確認）。

## レビュー時チェックリスト

- [ ] 起動は `npm run prototype:web`（`npm run dev` は Expo）
- [ ] `npm run build` を叩いていない。型チェックは `tsc --noEmit`
- [ ] 2D Layer に GSAP を混ぜていない / 3D の GSAP tween に cleanup（kill）がある
- [ ] 新レアリティを足したら silent フォールバック6ファイルを手動確認した
- [ ] Three.js / useLayoutEffect / window を足したら SSR ガードした
