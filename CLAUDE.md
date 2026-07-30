# Pull Hub — agent rules & context

このファイルがルールの正本(バージョン管理下)。親ディレクトリの `../CLAUDE.md` はここへのポインタのみで、そこに何も追加しない。

## 最初に読むもの

- **実装前に必ず `docs/design-system-n2.md` を読むこと。デザインの唯一の正はこのファイル**(現在 v2.5)。
  ユーザー指示や他ドキュメントと矛盾したらハンドオフが勝ち、矛盾箇所を報告する。
- `docs/archive/` 配下は**参照禁止**(旧 Urushi Archive。履歴保存のみ)。Phygitals / Nihon Toreca Center も参照しない。
- `KNOWN_ISSUES.md` — 未解決の申し送り台帳。リリース前ブロッカー(#4 オッズ実データ、#5 レアリティ語彙、#6 鑑定状態未確認)を含む。

## 用語(§13 用語集に従う)

- 通貨は **Points**。Coins / Credits / Cash / Tokens は使わない。
- 交換は **Trade in**。buyback / buy back / cash out / cash in は使わない。
- 基準は **listed value**(market value / retail value は使わない)。
- ティアは **MYTHIC / LEGENDARY / EPIC / BASE の4段のみ**(+ 判定不能は UNKNOWN = 装飾なし)。
  UI ラベルは "TIER"。"RARITY" はカードの印刷レアリティ(SR / SAR 等)専用で、必ず別欄。
- ※ 既存コードには Coins / Credits が残っている。新規コードは §13 に従い、既存分の置換は専用タスクで行う。

## 禁止事項(§5 の9項目は新規コードにも適用される)

- 特に: **絵文字禁止**(§5-4)、**出典の言えない事実の主張の禁止**(§5-9)。
- **金額・確率・パックの中身・鑑定に関する文言は、出典が無いなら書かない。**
  仮の値を置く場合は §5-9 の3点セットを必ず全て行う:
  定数名に MOCK / ファイル先頭に「実データ待ち。外部に見せないこと」/ KNOWN_ISSUES に記録。
- 数値の但し書きは本文に入れる。「100%」単独は不可 →「100% of listed value, in Points」。

## アーキテクチャ

- **Frontend:** `src/`(Expo 54, React Native)。iOS / Android / web(`react-native-web`)。
- **Shared:** `shared/` — 型、`shared/api/`、モック。`shared/` から `src/` を import しない。
- **Backend:** `backend/supabase/` — migrations / Edge Functions。
- **開封演出:** `src/components/pack/opening/`(ring は :3000 の Vite が配信)— 開封フロー担当の領域。指示なく触らない。
- `prototypes/` と `marketing/` はプロダクトコードとして扱わない。

## コマンド

- `npm start`(= `npm run dev`)— `scripts/dev.mjs`: pack-ring Vite(:3000)+ Expo(:8081)を同時起動。開封演出を見るにはこちら。
- `npm run start:expo-only` — Expo 単体(開封の ring シーンは出ない)。
- `npm run demo:ring` — 開封リング単体デモ(:3000)。
- `npm run prototype:web` — pack-ring の Vite(**旧 next-ui-lab ではなくなった**)。
- 型検査は `npx tsc --noEmit`(`apps/` / `backend/` / `prototypes/` の既存エラーは別件として除外して判断)。

## Env

ルート `.env` に `EXPO_PUBLIC_*` キー。

## 作業ルール

- 変更前に対象ファイルを確認し、広範囲・リスクのある変更は計画を提示して承認を待つ。
- 既存のビジネスロジック・ルート・モックデータ・データ構造・認証/チェックアウトを指示なく変えない。無関係ファイルを触らない。
- コミットは変更ファイルを**明示的に `git add`**(`git add -A` を使わない)。型検査が通らないままコミットしない。
- 独自の判断をした場合は必ず報告する。黙って決めない。
