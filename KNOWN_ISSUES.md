# Known Issues

未解決の既知バグの申し送り台帳。解決したら該当エントリを「Resolved」に移して commit hash を添える。

## Open

### 1. Home の「Open Pack」→ 白画面になるケースがある
- **記録日**: 2026-07-18(UI redesign Step 3 検証中に観測)
- **症状**: Home(リデザイン版)の Open Pack から開封フローに入ると、画面全体が白になることがある。再現条件は未特定(毎回ではない)。
- **切り分けメモ**: Home 側の変更は `openPack(pack)` を呼ぶところまでで、それ以降は開封フロー(`src/components/pack/opening/` / PackOpeningModal)の領域。白画面はフロー遷移後に発生するため開封側の可能性が高い。
- **担当**: Yutaka に申し送り済み(2026-07-18)。UI リデザイン側では調査しない。

### 2. 稀に旧デモの 3D 開封アニメーションが一瞬表示される
- **記録日**: 2026-07-18
- **症状**: 開封開始時、現行の開封演出の前に旧デモ実装の 3D アニメーションらしきものが1フレーム〜一瞬映り込むことがある。
- **切り分けメモ**: 旧/新の開封実装が混在(ring 移植: `src/components/pack/opening/ring/PackRingScene.web.tsx` と旧経路)しているため、初期化順序かフォールバック分岐の疑い。開封フロー側(Yutaka 域)。
- **担当**: Yutaka に申し送り済み(2026-07-18)。

### 3. 鳥居・富士のバナーアートは「再調理」待ち(和方針 J-1 / T7)
- **記録日**: 2026-07-25 / **2026-07-31 再定義**: 和方針(design-system-n2.md 第2部)により「差し替え必須」から「**再調理**」へ
- **内容**: 旧規定(伝統和記号の全面禁止)では差し替え必須としていたが、和方針で鳥居・富士シルエットは OK レジスター(インバウンド記号)になった。ただし現行アートは「ムーディー写真」調理で NG 側(荘厳・写実)のため、**フラット/ネオン/ポップへの再調理**が必要(例: 富士シルエット+ネオン)。バナー上のコピーとレイアウトは維持。
- **該当アセット**:
  - `assets/home/banners/banner-01.webp`(横長鳥居)
  - `assets/home/banners/banner-02.webp`(夕闇の鳥居 — 渋谷夜景系に差し替え予定)
  - `assets/home/banners/banner-03.webp`(桜と富士)
  - 同フォルダの元 PNG `banner-01〜03.png`(.gitignore 対象。**WebP から再生成できないため、元 PNG は必ずリポジトリ外で保管すること**)
- **参照箇所**: `src/components/home/sg/SgBannerCarousel.tsx` の `SLIDES`(3件の `require(...)`)のみ。差し替えはこの1ファイルの画像参照交換で完結する。
- **担当**: 再調理アセット支給待ち(デザイン)。

### 4. 【ブロッカー】オッズ表が実データに紐づいていない
- **記録日**: 2026-07-25
- **内容**: オッズ行は自由文の `examples` のみを持ち、カード個体を段に割り当てるデータ構造が存在しない。開示している確率を検証する手段が無い状態。バックエンドの pack_versions / provably-fair 側で「カード ↔ オッズ段」の対応を定義する必要がある。
- **表示中の確率は仮の値(2026-07-29 追記)**: オッズ表の確率は仮の値。実データ未接続。スクリーンショットを外部に出さないこと。4段(MYTHIC 0.5% / LEGENDARY 2% / EPIC 5.5% / BASE 92%)は `mockPackOdds.ts` の MOCK 定数。
- **「transparent odds」文言は一時削除(2026-07-29)**: オッズが仮のため Guarantee から外した(現在は「Instant 100% trade-in (listed value)」のみ)。**オッズが実データに接続された時点で戻す**(catalogAdapter.ts にも同メモあり)。
- **担当**: バックエンド(Yutaka 域)。**リリース前必須。**

### 5. 【ブロッカー】レアリティの語彙が3系統ある
- **記録日**: 2026-07-25
- **内容**: 現在レアリティの語彙が3系統併存している(2026-07-29 更新):
  1. ティア(オッズ段): MYTHIC / LEGENDARY / EPIC / BASE(`mockPackOdds.ts` — §6 v2.3 の4段に統一済み。ただし確率は仮 → #4)
  2. カード enum: mythic / legendary / epic / rare / common(`shared/types/pack.ts` RarityTier)— ティアとほぼ同名だが**別物**(カード側の旧MTG系語彙)。RECENT_PULLS のフィールドと表示は削除済み。`pack.rarityTier` と isChase 導出に残存
  3. TopHitRarity: Secret Rare / Alt Art など(`mockTopHits.ts`)— カードの印刷レアリティ側の語彙。ティアとして扱わない
- 2 はマジック・ザ・ギャザリング系の語彙でポケモンカードには存在しない。日本版ポケカの実際の表記(SR / SAR / AR / UR / RR / CHR 等)に統一する必要がある。**統一されるまで、カードのレアリティから表示ティアを導出することはできない**(現状はティア UNKNOWN として装飾なしで表示)。
- **担当**: データモデル定義(バックエンドと合同)。**リリース前必須。**

### 6. 【未解決】取り扱うカードが鑑定済みかどうかが未確認
- **記録日**: 2026-07-29
- **内容**: アプリ内の複数箇所が PSA 鑑定を前提とした表現になっている:
  - ティアの説明文(PSA 10 / PSA 9+)— 2026-07-29 に一般表現へ置換済み(前提未確認の記録としてここに残す)
  - 開封アニメーションのスラブ描画(GEM MINT 10 表記、PSA 風のラベル体裁)
  - カタログ説明文(`shared/mock/catalog.ts` — 「PSA-graded veteran stars」「Graded slabs」等)
  - 休眠中のロケールキー `packCatalog.1〜9.guarantee`(17ロケール、「PSA 8+ 保証」等。現行パックIDと不一致で非表示だが、IDが一致すれば復活する)
- 実際に PSA 鑑定済みのカードを扱うのか、生カードなのかが未確認。生カードの場合、上記の表現は全て誤りであり、開封アニメーションのスラブ演出も成立しない。**確認が取れるまで、鑑定に関する表現を新規に増やさないこと。**
- **担当**: 事業判断(要確認)。

## タスク登録(2026-07-31 デザインルール棚卸し docs/design-rules-inventory.md の選別結果)

コード挙動を変えるタスクは登録のみで未実行。R-xxx は inventory の ID。

- **T1** Coins→Points の全面移行(アプリ文言・コード・17ロケール)(R-001/R-078)
- **T2** Vault 実装をルール(C-13)に整合: `VAULT_HOLD_DAYS`/`processVaultExpiries` の期限・自動変換廃止、WonPrizesModal を Vault 既定化(R-011/R-081/R-082)。**人間決定済み — ルールが正、実装が誤り**
- **T3** 旧5値 rarity enum(common〜mythic ほか)→ 4段ティアへの統一(R-080。上記 #5 と統合して扱う)
- **T4** legacy トークン(ph/colors.ts・Outfit/brandFont・spacing.ts)の移行完了と撤去(R-021/R-039/R-062)。**新規実装での使用は 2026-07-31 付で禁止**(C-10 収録済み)
- **T5** 【開封担当への申し送り】開封領域の掃除: 絵文字モックカード(mockRevealCards の 🌟🔮👑)と PSA 表現の除去(R-044/R-083。上記 #6 関連)
- **T6** sgVault.ts コメント「buyback surfaces」→「trade-in surfaces」— **2026-07-31 実施済み**
- **T7** バナー再調理(上記 #3 を再定義済み。和方針 J-1)(R-073)
- **T8** lab /redesign 既定テーマの N2 化+Urushi 実装の退避(R-030/R-056)。**neo-tokyo 比較の判定後に実施**
- **T9** P-1(旧§9 物理)+C-7 組版詳細の RN 換算表作成 — PLANNED 着手時の最初のタスク(R-037/R-048〜052)
- **T10** 「docs/opening-spec 2.md」(複製ファイル)の削除 — **2026-07-31 実施済み**
- **T11** C-5/C-12 チェックの grep スクリプト化(R-098)

## 既知のギャップ(ブロッカーではない)

- **Result 画面は開封フロー未接続(2026-07-29)**: `src/screens/ResultScreen.tsx` は task1-result-screen-spec.md どおり実装済みだが、開封演出(Yutaka 域)からの遷移は未配線。パラメータ無しでは `mockResultPull.ts` の MOCK データを表示する(レビュー用。`EXPO_PUBLIC_DEV_SCREEN=Result` で直接起動可)。`pullIds` が渡されれば finalizePendingFulfillment に接続済み。カードのティアは全て UNKNOWN(#4 のため — 実装不足ではなくデータ不在)。文言は仕様指定の英語ハードコードで、17ロケール展開は配線時。
- **カタログ説明文は全パック仮(2026-07-29)**: `shared/mock/catalog.ts` の tagline / description / topCard は実在するパックの中身を反映していないデモコピー(「Charizard ex SAR in the prize pool」等)。**実データ接続時に、全パックの説明文を実際の中身に基づいて書き直すこと**。それまで外部に見せない(ファイル先頭にも同コメントあり)
- CTA サブ文の Trans タグ(数値の等幅化)が en/ja/zh/zht の4ロケールのみ。残り13ロケールは等幅未適用(描画は正常)
- `bulkStockBody` はネイティブ Alert のためスタイル不可
- パック個別の guarantee 文の文中数値が等幅未対応(17ロケールへのタグ展開が必要)
- 鳥居・富士のバナーアートが再調理待ち(上記 #3、和方針 J-1)

## Resolved

- (なし)
