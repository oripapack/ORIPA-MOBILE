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

### 4. オッズ表 — ライブ3パックは DB 接続済み、残りはフォールバック
- **記録日**: 2026-07-25 / **2026-08-06 Step 2–3**
- **解決済み(ライブ3パック)**: `welcome-pack` / `grail-edition` / `charizard-chase` — Supabase 接続時 `pack_pool_items` weight から確率算出。UI に transparent odds 文言復活(Step 3)。
- **デプロイ**: `cd backend && npm run deploy:catalog` → migrations + `seed.sql`。検証: `npm run smoke:live-packs`(root)。
- **ブロッカー(2026-08-06)**: ホスト Supabase プロジェクト `akfxxfthwpylpwdnjzcy` が **paused** — Dashboard で unpause 後に deploy + smoke を実行すること。
- **未解決(残カタログ)**: ライブ `packVersionId` なしパックは静的 N2 フォールバック。
- **担当**: 残カタログ pool 定義(バックエンド)。**ライブ3パックは unpause + seed 後リリース可。**

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

### 7. 【ブロッカー】Points の App Store 課金接続と商品審査が未完了
- **記録日**: 2026-08-07
- **内容**: 旧実装は仮バンドル価格を表示し、決済なしでローカル残高を増やしていたため公開不可。CreditsPurchaseSection は仮価格を全撤去し、課金接続完了まで安全な購入停止画面に変更済み。Production build ではライブ在庫に接続されていないパックのローカル抽選も拒否する。
- **リリース条件**: App Store Connect の Points 商品定義、StoreKit/IAP 実装、サーバー側レシート検証、返金/復元方針、商品価格の実データ接続を完了すること。完了まで購入導線を有効化しない。
- **担当**: 決済/バックエンド/ストア申請。

### 8. 【ブロッカー】Marketplace の実在庫・販売者・配送・決済データが未接続
- **記録日**: 2026-08-07
- **内容**: 現行の listing / seller / price / shipping 文言はローカルUI fixtureで、実在の販売者在庫ではない。本番ビルドでは fixture を表示せず、検証済み在庫の接続待ち画面に切り替えた。`EXPO_PUBLIC_MARKETPLACE_LIVE=1` は販売者在庫、配送地域、在庫更新、server-created checkout が接続・検証されるまで設定しない。
- **リリース条件**: Marketplace API、販売者審査、地域別配送条件、在庫競合制御、Stripe server PaymentIntent と注文台帳を接続すること。
- **担当**: Marketplace / 決済 / バックエンド。

### 9. 【ブロッカー】Membership と Promotions のサーバー権利台帳が未接続
- **記録日**: 2026-08-07
- **内容**: 旧実装は端末内シミュレーションで会員Tier・Points・free packを付与できた。本番ビルドでは Membership / Tier Benefits / Promo code / Referral reward を接続待ち状態にし、ローカル付与を停止した。
- **リリース条件**: App Store商品、レシート検証、membership entitlement、promo/referral grant のサーバー台帳、取消・返金時の権利更新を実装すること。完了後のみ `EXPO_PUBLIC_MEMBERSHIP_LIVE=1` / `EXPO_PUBLIC_PROMOTIONS_LIVE=1` を設定する。
- **担当**: Membership / Promotions / 決済 / バックエンド。

### 10. Friends / activity / leaderboard の検証済みソーシャルデータが未接続
- **記録日**: 2026-08-07
- **内容**: 現行の友達候補・アクティビティ・ランキングはUI fixtureで、実在アカウントのデータではない。本番ビルドではソーシャル面を接続待ち画面に切り替え、fixture のプロフィールやランキングを表示しない。
- **リリース条件**: ユーザー公開範囲、友達承認、ブロック/通報、アクティビティの出典、ランキング集計と不正対策をサーバー側で接続・検証すること。完了後のみ `EXPO_PUBLIC_SOCIAL_LIVE=1` を設定する。
- **担当**: Social / Trust & Safety / バックエンド。

### 11. 【ブロッカー】Clerk 認証が development instance のまま
- **記録日**: 2026-08-07
- **内容**: 440×956 の本番相当Web export検証で、Clerkから development key の使用警告を確認した。UIのサインインウォールと導線は動作確認済みだが、このキーには利用制限があり公開用ではない。
- **リリース条件**: Clerk production instance を作成し、production publishable/secret key、OAuth redirect、Apple/Google設定、許可オリジン、メール配信を本番環境で検証すること。
- **担当**: Auth / インフラ。

### 12. 【ブロッカー】配送・問い合わせ・高度なアカウントサービスの本番接続が未完了
- **記録日**: 2026-08-07
- **内容**: 配送先、問い合わせ、外部ウォレット、本人確認、支払先、外部アカウント連携は、提供地域・データ保持・復旧・監視を含む本番運用が未検証。本番ビルドでは未監視の連絡先やローカル保存フォームを表示せず、設定導線と直接遷移先を接続待ち状態にした。
- **リリース条件**: 配送業者/API、地域別住所と料金、PII 保持方針、監視済みサポート窓口、本人確認/支払先/外部アカウントの各プロバイダーと復旧手順を接続・検証すること。完了した面だけ `EXPO_PUBLIC_SHIPPING_LIVE=1` / `EXPO_PUBLIC_SUPPORT_LIVE=1` / `EXPO_PUBLIC_ADVANCED_ACCOUNT_SERVICES_LIVE=1` を設定する。
- **担当**: Fulfillment / Support / Compliance / Backend。

## タスク登録(2026-07-31 デザインルール棚卸し docs/design-rules-inventory.md の選別結果)

コード挙動を変えるタスクは登録のみで未実行。R-xxx は inventory の ID。

- **T1** Coins→Points の全面移行(アプリ文言・コード・17ロケール)(R-001/R-078)
- **T2** Vault 実装をルール(C-13)に整合: `VAULT_HOLD_DAYS`/`processVaultExpiries` の期限・自動変換廃止、WonPrizesModal を Vault 既定化(R-011/R-081/R-082)。**2026-08-07 実施済み(本ブランチ)**
- **T3** 旧5値 rarity enum(common〜mythic ほか)→ 4段ティアへの統一(R-080。上記 #5 と統合して扱う)
- **T4** legacy トークン(ph/colors.ts・Outfit/brandFont・spacing.ts)の移行完了と撤去(R-021/R-039/R-062)。**新規実装での使用は 2026-07-31 付で禁止**(C-10 収録済み)
- **T5** 開封領域の掃除: 絵文字モックカードと PSA/実在商品モックを中立コードへ置換(R-044/R-083。上記 #6 関連)。**2026-08-07 実施済み(本ブランチ)**
- **T6** sgVault.ts コメント「buyback surfaces」→「trade-in surfaces」— **2026-07-31 実施済み**
- **T7** バナー再調理(上記 #3 を再定義済み。和方針 J-1)(R-073)
- **T8** lab /redesign 既定テーマの N2 化+Urushi 実装の退避(R-030/R-056)— **2026-07-31 前倒しで実施済み**(Urushi 露出事故を受け人間承認。既定=N2、原本は docs/archive/next-ui-lab-redesign-urushi-DEPRECATED.tsx へ退避。スキンブランチは rebase で追従)
- **T9 — 2026-08-10 実施済み** P-1(旧§9 物理)+C-7 組版詳細の RN 換算表を `docs/rn-ui-calibration.md` に作成し、共通コントロールへ反映(R-037/R-048〜052)
- **T10** 「docs/opening-spec 2.md」(複製ファイル)の削除 — **2026-07-31 実施済み**
- **T11** C-5/C-12 チェックの grep スクリプト化(R-098)。**2026-08-07 `npm run audit:release-copy` として実施済み(本ブランチ)**
- **T12** 【T8後続】lab 旧世代ページ(`/`・`/packs`・`/pack-detail`)の掃除または削除(2026-08-03 登録)。buybackRate 削除起因の既存 tsc エラー10件を含む — **修理不要と決定済み**(参照・流用禁止対象のため。CLAUDE.md)。掃除時は /vault・/lp・/opening の扱いも同時に判断
- **T13** /redesign 実寸監査(2026-08-03 登録・**実行は別途指示**)。master study の換算知見(`docs/design-notes-master-study.md`)に基づき、タイポスケール・余白・コントロール寸法を実機基準(402pt・実測)で校正する。**ただし 1px line 文法・radius 体系(13/10/6)・書体は N2 のまま変更しない**

## 既知のギャップ(ブロッカーではない)

- **Result 画面は開封フロー未接続(2026-07-29)**: `src/screens/ResultScreen.tsx` は task1-result-screen-spec.md どおり実装済みだが、開封演出(Yutaka 域)からの遷移は未配線。パラメータ無しでは `mockResultPull.ts` の MOCK データを表示する(レビュー用。`EXPO_PUBLIC_DEV_SCREEN=Result` で直接起動可)。`pullIds` が渡されれば finalizePendingFulfillment に接続済み。カードのティアは全て UNKNOWN(#4 のため — 実装不足ではなくデータ不在)。文言は仕様指定の英語ハードコードで、17ロケール展開は配線時。
- **カタログ説明文は全パック仮(2026-07-29)**: `shared/mock/catalog.ts` の tagline / description / topCard は実在するパックの中身を反映していないデモコピー(「Charizard ex SAR in the prize pool」等)。**実データ接続時に、全パックの説明文を実際の中身に基づいて書き直すこと**。それまで外部に見せない(ファイル先頭にも同コメントあり)
- CTA サブ文の Trans タグ(数値の等幅化)が en/ja/zh/zht の4ロケールのみ。残り13ロケールは等幅未適用(描画は正常)
- `bulkStockBody` はネイティブ Alert のためスタイル不可
- パック個別の guarantee 文の文中数値が等幅未対応(17ロケールへのタグ展開が必要)
- 鳥居・富士のバナーアートが再調理待ち(上記 #3、和方針 J-1)

## Resolved

- (なし)
