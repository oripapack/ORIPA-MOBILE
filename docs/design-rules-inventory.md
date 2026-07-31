# デザイン関連ルール棚卸し(design-rules-inventory)

> 対象コミット main `4ba58d7` 時点のスナップショット。判定結果は v3.0 と archive に反映済み。

作成: 2026-07-31 / 対象コミット: main `4ba58d7` + design/neo-tokyo `9b9bcaf`
目的: 積み重なったルールの全量を一覧化し、人間が取捨選択できるようにする。**本書は調査結果であり、いかなるルールの変更・決定も行っていない。**

スキャン対象: CLAUDE.md(リポジトリ内・親ポインタ)/ docs/design-system-n2.md v2.5 §1〜§13 / HANDOFF.md / KNOWN_ISSUES.md / docs/ 配下(COWORKER_UI_GUIDE, opening-spec 等。archive は参照禁止ルールに従い**中身は未読**・存在のみ記載)/ prototypes/next-ui-lab(globals.css の A+B 既定テーマ、/redesign の Urushi 既定+neo-tokyo スキン、和モチーフ退避フラグ)/ RN 本体(src/tokens 7ファイル、共通コンポーネント規約、store の暗黙挙動)/ lint・CI・PRテンプレート(**存在しない**)/ コード内の暗黙の前提。

分類: A=文章・語彙【維持確定・提案なし】 B=色 C=タイポ D=装飾・質感・モーション E=要素・レイアウト・情報設計 F=技術前提 G=プロセス・運用

## 一覧

| ID | ルール内容 | 出典 | 分類 | 実効箇所 | 備考(依存・矛盾)/推奨 |
|---|---|---|---|---|---|
| R-001 | 通貨名は Points(Coins/Credits/Cash/Tokens 禁止) | design-system-n2.md §13 | A | **文書のみ**(アプリ文言・コード・17ロケールは Coins/Credits のまま) | R-078 と矛盾(移行未実施)。§5-9 の例文自体が「in Coins」のまま(doc内不整合) |
| R-002 | 交換は Trade in(buyback/buy back/cash out/cash in 禁止) | §13 / CLAUDE.md | A | catalogAdapter guaranteeText・PackDetails バッジ・SgTrustStrip | sgVault.ts の「buyback surfaces」コメント(R-079)と矛盾 |
| R-003 | 基準は Listed value(market/retail value 禁止) | §13 | A | trust strip・Result・guarantee 文言 | — |
| R-004 | UIラベルは TIER(RARITY はカード印刷レアリティ専用・必ず別欄) | §6 / §13 | A | SgTierTag・PackDetails topHit(別欄実装済み) | — |
| R-005 | ティア語彙は MYTHIC/LEGENDARY/EPIC/BASE の4段のみ | §6 / §13 | A | n2Rarity.ts・mockPackOdds・SgTierTag | 開封側に旧5値enum群が併存(R-080、KNOWN_ISSUES #5) |
| R-006 | 保管先の呼称は Vault(Storage/Locker 禁止) | §13 | A | Vault タブ・画面名 | — |
| R-007 | 「100%」単独禁止。必ず「100% of listed value, in Points」形式・但し書きは本文 | §13 / §5-9 | A | guarantee・disclaimer(現行文言は "in Coins" — R-001 の移行待ち) | — |
| R-008 | 検証不能な誇張コピー禁止(#1/Insane/Don't miss out) | §5-6 | A | 全コピー(grep 運用) | — |
| R-009 | 出典の言えない事実の主張禁止+仮値は MOCK 3点セット(命名/冒頭コメント/KNOWN_ISSUES) | §5-9 / CLAUDE.md | A | mockPackOdds・mockResultPull・catalog.ts 冒頭コメント | — |
| R-010 | 偽の緊急性禁止(実在しないタイマー・在庫) | §5-7 | A | 全画面 | — |
| R-011 | Vault は有効期限なし・放置自動変換禁止・トレードインは明示操作のみ | §13 | A | **文書のみ** | **実装と正面衝突**: useAppStore の processVaultExpiries / VAULT_HOLD_DAYS(期限つき自動変換)、WonPrizesModal の convert 既定(R-081/R-082) |
| R-012 | 画面に出すティアには対応する確率の開示必須 | §6 | A | PackDetails オッズ表(ただし確率は MOCK) | KNOWN_ISSUES #4 に依存 |
| R-013 | NEON BRUTAL スキンで CD Projekt Red の商標・固有フォント・台詞等使用禁止 | §10 | A | 文書のみ(スキン未実装) | — |
| R-014 | 日本語性はカタカナ/和文マイクロコピーを等幅英字と併記して表現 | §1 | A | neo-tokyo 看板(lab)のみ。RN 本体は未使用 | 和方針の OK 側と整合 |
| R-015 | N2 トークンが唯一の色ソース(bg#000/surface#101013/surface2/line/text#F0EEE8/muted/gold#D4AF37/neon#FF4A38/success/error/warning) | §3 | B | src/tokens/sg.ts(verbatim 転記) | 推奨: 残す。R-021(legacy ph)と二重定義状態 |
| R-016 | 金=価値: 価格・主要CTA・Hit(上位ティア)・残高・ロゴアクセントのみ。本文/汎用ボーダー/広い面禁止 | §4 | B | SgButton・SgData(gold)・AppHeader 金予算(Hub+残高のみ) | 推奨: 残す |
| R-017 | 主要CTAは1画面1つ・金地黒文字・価格入りラベル | §4 / §12 | B/E | SgButton gold・Home/PackDetails/Result | 推奨: 残す |
| R-018 | neon=瞬間専用(LIVE/MYTHIC/カウントダウン/開封)。面積2%以下・必ずグロー・CTA/本文/常設ナビ禁止。MYTHIC ティア表示は常設でも可 | §4 | B | SgTierTag(mythic)・SgSectionHeader(LIVE) | 推奨: 残す |
| R-019 | success 緑=検証/在庫/成功のみ(装飾禁止)。エラーは常にフラット(グロー禁止) | §3 / §4 | B | SgData(success)・error トークン | 推奨: 残す |
| R-020 | #FFFFFF 全面禁止(最明色は text #F0EEE8) | §5-1 | B | 全実装(grep 運用) | 推奨: 残す |
| R-021 | legacy ph トークン(Phygitals 黒+緑、colors.ts→shared/tokens/ph) | src/tokens/colors.ts ほか | B | 未移行画面多数(Vault/Marketplace/Friends/認証系ほか) | **暗黙の既定**。R-015 と二重定義。推奨: 削除(移行完了をもって) |
| R-022 | 高彩度2色グラデ禁止(紫→シアン等。例外: MYTHIC 開封最終フレームの虹/ホロのみ) | §5-2 | B | 全実装(grep 運用) | 推奨: 残す |
| R-023 | 金とネオンの同一要素での併用禁止 | §4 | B | 実装慣行 | 推奨: 残す |
| R-024 | ティア色は上位3段のみ・4段に4色を割らない・新色追加禁止 | §6 | B | SgTierTag(boxStyles/textStyles) | 推奨: 残す |
| R-025 | ティアの文脈規定: disclosure=全段同可読(BASE は text 色・opacity1.0)/badge=BASE と UNKNOWN は非表示 | §6 | B/E | SgTierTag(context 必須引数) | 推奨: 残す |
| R-026 | 新規色ペアはコントラスト 4.5:1(通常)/3:1(大型)以上・計算を記録 | §11 / §12 | B/G | プロセス(neo-tokyo で実施済み) | 推奨: 残す |
| R-027 | スキンで差し替え可能なのはアクセント/ネオン色・見出し書体・角・装飾・パック命名のみ | §10 | B/D | sgVault.ts(RN)・neo-tokyo(lab) | 推奨: 残す |
| R-028 | 登録スキン: NEON BRUTAL / VEGAS FELT / FINTECH VAULT(トークン差分のみ) | §10 | B | FINTECH VAULT のみ RN 実装(sgVault.ts)。他2つは文書のみ | 推奨: 保留(実装予定次第) |
| R-029 | lab 既定テーマ=A+B「Phygitals showroom」(emerald CTA・champagne gold・**neon/coin gold/confetti 禁止**) | prototypes/next-ui-lab/app/globals.css | B | lab の / /packs /pack-detail 等 | **N2 と逆方向の禁止リスト**がサンドボックス既定として残存。推奨: 削除(N2 系に置換)or 保留(比較用) |
| R-030 | lab /redesign 既定=Urushi Archive(朱CTA・brass・jade・washi・sumi4層) | prototypes/next-ui-lab/app/redesign/page.tsx | B | lab /redesign(neo-tokyo 比較のベース面) | 廃止済みデザインが比較基準として稼働中。**「URUSHI ARCHIVE」の概念・命名は和方針により置換候補**。推奨: 保留(比較実験終了まで) |
| R-031 | neo-tokyo スキン: 夜空青 #05070C 系+シアン neon #4FD8E8+桃 #E85FA8(演出予約)。§10 準拠・金 CTA 不変 | design/neo-tokyo ブランチ(redesign page 追記) | B | lab /redesign?theme=neo-tokyo のみ。**未マージ** | 推奨: 保留(比較実験の判定待ち) |
| R-032 | 見出しは Fraunces 500(イタリックは1見出し1箇所まで。代替 Newsreader) | §7 | C | sg.font.display(Fraunces_500Medium) | 推奨: 残す |
| R-033 | 本文/UI は Instrument Sans 400/500/600(代替 Schibsted Grotesk/Hanken) | §7 | C | RN は**代替の Schibsted** を採用(第一候補未使用) | 推奨: 残す(どちらを正とするか要決定) |
| R-034 | 数字・データは Spline Sans Mono+tabular-nums(価格/確率/残数/証明書/カウントダウン/残高すべて) | §4 / §7 / §12 | C | SgData・sg.numeric・各画面 | 推奨: 残す |
| R-035 | 日本語書体は Zen Kaku Gothic New 500/700(「引」透かしは 900) | §7 | C | **文書のみ**(RN 未ロード。lab neo-tokyo は Noto Sans JP=代替を使用) | 推奨: 保留(和文UI導入時に決定) |
| R-036 | 禁止書体: Inter/Roboto/Open Sans 単独・Orbitron/Audiowide/Michroma・Playfair Display | §7 | C | grep 運用 | 推奨: 残す |
| R-037 | 組版はサイズ依存(見出し字間 -0.01〜-0.02em/本文 0/等幅ラベル +0.12〜0.17em、行間も段階、rem 基準) | §7 | C | 部分実装(個別 letterSpacing)。体系としては**文書のみ** | 推奨: 残す(§9 翻訳と同時に RN 換算表を作る) |
| R-038 | NEON BRUTAL スキン時の見出しは Chakra Petch 700 大文字(本文・等幅・日本語は不変) | §7 / §10 | C | 文書のみ | 推奨: 保留 |
| R-039 | legacy 書体 Outfit(brandFont)一式 | src/tokens/typography.ts | C | 未移行画面多数 | R-032〜034 と二重定義。§7 の N2 セット外。推奨: 削除(移行完了をもって) |
| R-040 | neo-tokyo 見出しは Space Grotesk 700(letter-spacing 0) | design/neo-tokyo ブランチ | C | lab スキンのみ | 推奨: 保留(R-031 と同運命) |
| R-041 | 区切りは 1px line。影・ハイライトで区切らない | §3 / sg.ts コメント | D | 全 Sg 系(SgCard・タブバー・trust strip) | 推奨: 残す |
| R-042 | shadowHero(0 20 48)は1画面1主役のみ。それ以外に影なし | §3 | D | Home featured card・Result hero | 推奨: 残す |
| R-043 | 装飾 glassmorphism 禁止。機能的クローム(トップバー/シート)のみ rgba(0,0,0,.72)+blur20 まで可・1層・reduced-transparency 対応 | §5-3 / §9 | D | タブバー(rgba+iOS blur) | 推奨: 残す |
| R-044 | 絵文字アイコン禁止 | §5-4 / CLAUDE.md | D | Sg 系は準拠。**開封フロー mockRevealCards.ts に 🌟🔮👑 残存** | R-083 と矛盾(開封域)。推奨: 残す(開封側の掃除タスク要) |
| R-045 | 常時アニメ禁止。例外はフォイルスイープ(5.5s・1画面1箇所)と LIVE ドット明滅(1.6s)のみ | §5-5 / §8 | D | SgSectionHeader live(1.6s・reduced-motion 対応) | 推奨: 残す |
| R-046 | 開封演出のみ演出全開可(スローダウン→色エスカレーション→結果) | §8 | D | opening flow(担当領域) | 推奨: 残す |
| R-047 | 全アニメは prefers-reduced-motion で停止(クロスフェード代替) | §8 / §9 / §12 | D | live dot・neo-tokyo(lab)。開封側は未検証 | 推奨: 残す |
| R-048 | 押下即応(:active scale .97・100ms 以内)・全タップ要素 | §9 / §12 | D | **文書のみ**(RN §9 翻訳未着手) | 推奨: 残す(次期実装) |
| R-049 | 開封は「引く」ジェスチャ・velocity handoff・スプリング既定値(damping1.0/response0.3-0.4、運動量系のみ0.8)・固定duration禁止 | §9 | D | **文書のみ** | 推奨: 残す(次期実装) |
| R-050 | 演出は常に中断可能(タップでスキップ・シートは掴んで戻せる) | §9 / §12 | D | 開封スキップは実装あり。シート物理は文書のみ | 推奨: 残す |
| R-051 | リスト端・シート限界はラバーバンド(漸増抵抗) | §9 | D | 文書のみ | 推奨: 残す |
| R-052 | 触覚/音はティア同期(BASE無し/EPIC・LEGENDARY単発/MYTHIC段階)・視覚と同一フレーム | §9 | D | **文書のみ**(audio 側は旧5値enum・未接続) | R-080 に依存。推奨: 残す |
| R-053 | 開封の色エスカレーション: BASE無彩→LEGENDARY金→MYTHIC朱(虹/ホロは MYTHIC 最終フレームのみ) | §6 | D | **文書のみ**(現行開封は旧配色) | 推奨: 残す |
| R-054 | 漢字1文字「引」の輪郭透かし(ブランド装置) | §1 | D | **文書のみ** | **矛盾**: 「漢字刻印は不採用(確定)」の過去決定(lab /redesign ルール05・記録)。どちらが生きているか要決定。和方針とも関連。推奨: 保留 |
| R-055 | 00:00 JST ドロップを時刻ごとブランド装置に | §1 | D/E | **文書のみ** | 推奨: 残す(機能実装待ち) |
| R-056 | lab /redesign の Urushi 質感規律(単一光源1灯・サテン・約1.8%ノイズ・個別発光禁止・朱は1画面1要素) | redesign page ルール05 | D | lab /redesign 既定テーマのみ | N2 と多数矛盾(廃止済み世界観)。**Urushi 命名は和方針により置換候補**。推奨: 削除(比較実験終了をもって) |
| R-057 | neo-tokyo 質感6点(グレイン.05/3層グロー(LIVE・MYTHICのみ)/濡れ路面反射1箇所/点灯1回 steps/ビネット.35/1px line) | design/neo-tokyo ブランチ | D | lab スキンのみ・未マージ | 推奨: 保留(R-031 と同運命) |
| R-058 | 開封演出はポケポケ5フェーズ構成が「正解」(選択→ホワイトアウト→リング→ズーム→切り裂き) | docs/opening-spec.md | D/E | opening flow(ring 実装の設計原典) | **「opening-spec 2.md」が複製として併存**(二重定義)。推奨: 残す(複製は削除候補) |
| R-059 | 開封 TEAR パレット・rarity tint 30%→強化方針ほか Phase 別仕様 | HANDOFF.md | D | opening flow(担当領域) | 担当外不可侵(R-089)。推奨: 保留(担当者判断) |
| R-060 | 信頼シャーシ不変: bg の暗さ/text 系/金=価格・CTA/等幅数字/オッズ・証明書 UI/§5 禁止事項はスキンでも不変 | §10 / §12 | E | sgVault・neo-tokyo で遵守 | 文言が「買取床値」のまま(R-002 と語彙矛盾)。推奨: 残す(語彙だけ §13 に追従) |
| R-061 | オッズ台帳・監査(Fairness)リンクを全パック導線に露出 | §12 | E | PackDetails(常時オッズ要約+VERIFY)・Home featured | 推奨: 残す |
| R-062 | 8pt スペーシング(4/8/16/24/32/48/64) | sg.space(コメント: N2 は無規定・既存 8pt 継続) | E | sg.space 全面 | spacing.ts(legacy)と二重定義。推奨: 残す(sg.space に一本化) |
| R-063 | 角丸は panel13/btn10/tag6 の3種のみ | §3 | E | sg.radius | 未移行画面に radius.full 等残存。推奨: 残す |
| R-064 | ティア描画は SgTierTag が唯一の経路(独自実装禁止) | SgTierTag/n2Rarity doc コメント | E | PackDetails・PackOddsModal・Result・DevUiGallery | 推奨: 残す |
| R-065 | カード→ティアはデータのみ(名前・金額からの推測禁止)。現状の唯一のリンクは isChase(true→MYTHIC) | n2Rarity.ts / §5-9 | E | tierFromIsChase | KNOWN #4 依存。推奨: 残す |
| R-066 | UNKNOWN≠BASE。データ無しは装飾ゼロで描画(BASE は「判定済みの低段」専用) | n2Rarity.ts | E | SgTierTag(unknown→null) | 推奨: 残す |
| R-067 | SgData は数値専用(商品名・日付は本文書体) | SgData doc コメント | E/C | SgData 全使用箇所 | 推奨: 残す |
| R-068 | コンポーネント配置: ui/=汎用・pack/=ドメイン・home/sg/=画面別・_archive/=退避(参照禁止) | CLAUDE.md / ディレクトリ構成 | E | src/components 全体 | 推奨: 残す |
| R-069 | shared/ から src/ を import しない(層方向) | CLAUDE.md | E/F | packFoil 移設で確立 | 推奨: 残す |
| R-070 | prototypes/・marketing/ はプロダクトコード外(インスピレーションのみ) | CLAUDE.md / COWORKER_UI_GUIDE | E/F | 運用 | 推奨: 残す |
| R-071 | 製品 UI は src/ のみ。「apps/ フォルダは無い(削除済み・探すな)」 | COWORKER_UI_GUIDE.md | E/F | **記述が失効**: apps/pack-opening-web が main に現存 | **現実と矛盾**(stale doc)。推奨: 削除(ガイド更新) |
| R-072 | モバイル検証は 440×956・英語ロケール基準 | 運用慣行(セッションルール) | E/G | 全 UI 検証プロセス | 文書化はされていない(CLAUDE 未収録)。推奨: 残す(明文化) |
| R-073 | 鳥居×富士バナーは N2 §5-8 違反・リリース前差し替え必須(参照は SgBannerCarousel の SLIDES のみ) | KNOWN_ISSUES #3 | E/B | RN Home バナー(現在も表示中) | **和方針により置換候補**(「差し替え」でなく「再調理」= フラット/ネオン化)。推奨: 保留(和方針改定で再定義) |
| R-074 | Result 画面は task1 spec 準拠(ヒーロー1枚+4列グリッド+固定合計行+確認シート+Vault 既定) | task1-result-screen-spec.md(Downloads)/ KNOWN_ISSUES ギャップ | E | ResultScreen(未配線・MOCK 表示) | 推奨: 残す |
| R-075 | Fairness 記録(commit-reveal)を開封導線に露出・検証可能に | §12 / SgFairnessRecord / provably-fair スキル | E | PackDetails(値はモック) | 実データ接続待ち。推奨: 残す |
| R-076 | 「transparent odds」文言はオッズ実データ接続まで封印(接続後に復活) | KNOWN_ISSUES #4 / catalogAdapter コメント | A/E | catalogAdapter(削除済み状態) | 推奨: 残す |
| R-077 | カタログ説明文(tagline/description/topCard)は全パック仮。実データ接続時に全書き直し・外部に見せない | catalog.ts 冒頭 / KNOWN_ISSUES ギャップ | A/E | shared/mock/catalog.ts | 推奨: 残す |
| R-078 | 【暗黙・実装状態】アプリの通貨表示は Coins/Credits(shared/api も credits) | RN 実装全域・17ロケール | A/E | 全画面 | **R-001 と矛盾**(Points 移行が未実施の現状を明示するため収録) |
| R-079 | 【暗黙】sgVault=「Vault/buyback surfaces」向け FINTECH スキン | src/tokens/sgVault.ts | B/A | sgVault 使用画面 | 命名コメントが R-002 違反。推奨: 残す(コメント語彙のみ修正候補) |
| R-080 | 【暗黙】開封・Vault・ソーシャル系は旧5値 rarity enum(common〜mythic)+TopHitRarity で稼働 | audio/packOpeningFeedback・mockUser・socialMock ほか | A/E | 開封フロー・Vault・Marketplace・Friends | KNOWN #5(リリース前ブロッカー)。§13 4段と併存中 |
| R-081 | 【暗黙】WonPrizesModal は「convert(換金)が既定・Vault はオプトイン」 | useAppStore / WonPrizesModal | E | 開封後フロー | **R-011 と正面衝突**(spec は Vault 既定) |
| R-082 | 【暗黙】Vault 保管は VAULT_HOLD_DAYS 期限つきで期限後自動コイン変換(processVaultExpiries) | useAppStore / vaultConstants | E | Vault 運用ロジック | **R-011 と正面衝突** |
| R-083 | 【暗黙】開封フロー内に PSA 表現(PSA 10 Trophy Card 等)+絵文字のモックカードが残存 | mockRevealCards.ts・RecentHitsTicker ほか | A/D | 開封演出・レガシー ticker | KNOWN #6(鑑定未確認)・R-044 と矛盾。担当領域(R-089) |
| R-084 | スタックは Expo 54 RN(iOS/Android/web)。CSS 変数不可のため N2 トークンは TS オブジェクト(sg.ts)で保持・doc の値を verbatim(現地調整禁止) | CLAUDE.md / sg.ts ヘッダ | F | sg.ts | 推奨: 残す |
| R-085 | 色のハードコード HEX 禁止(トークン参照のみ)・§5 は grep で自己検査 | §12 | F/G | 新規実装で運用 | 未移行画面は違反状態のまま。推奨: 残す |
| R-086 | 【暗黙】next-ui-lab=CSS サンドボックス/比較実験場。スキンは [data-theme] スコープ+?theme= クエリで切替(既定テーマ不変) | 役割分担の慣行+neo-tokyo 実装 | F | lab /redesign | 推奨: 残す(明文化候補) |
| R-087 | 開封 ring シーンは :3000 Vite 配信(web=iframe/native=WebView)。`npm start`(dev.mjs)が Vite+Expo を同時起動 | scripts/dev.mjs / packRingWebUrl / RingPackOpenFlow* | F | 開封フロー起動系 | 推奨: 残す |
| R-088 | 3D フラップ開封プロトタイプは未配線。移植は WebView 先行→expo-gl 判断、ティア6段前提の pre-wiring 修正リスト | prototypes/opening-3d/PORTING-NOTES.md | F | **文書のみ**(参照0件) | **6段ティア前提が §6 の4段と不整合**(要更新)。推奨: 残す(数値を4段に更新) |
| R-089 | 開封領域(src/components/pack/opening/・sandbox・:3000 シーン)は担当外不可侵 | CLAUDE.md | G | 運用 | 推奨: 残す |
| R-090 | design-system-n2.md が唯一の正。指示と矛盾したらハンドオフが勝ち・矛盾を報告 | CLAUDE.md / doc ヘッダ | G | 運用(実績あり) | 推奨: 残す |
| R-091 | docs/archive/ は参照禁止(旧 Urushi spec の墓場) | CLAUDE.md | G | 運用 | 推奨: 残す |
| R-092 | 実装前にハンドオフを読む/広範囲変更は計画提示→承認 | CLAUDE.md | G | 運用 | 推奨: 残す |
| R-093 | 変更ファイルは明示 git add(-A 禁止)・型検査(tsc)通過後にコミット・独断は必ず報告 | CLAUDE.md | G | 運用 | 推奨: 残す |
| R-094 | KNOWN_ISSUES は申し送り台帳(解決時は Resolved へ移動・commit hash 添付) | KNOWN_ISSUES.md ヘッダ | G | 運用 | 推奨: 残す |
| R-095 | MOCK 値(オッズ等)のスクリーンショットを外部に出さない | KNOWN_ISSUES #4 / §5-9 | G | 運用 | 推奨: 残す |
| R-096 | スキン比較は専用ブランチ(design/neo-tokyo)+クエリ切替で行い、既定テーマに影響させない | 今回の運用 | G | design/neo-tokyo | 推奨: 残す(明文化候補) |
| R-097 | 【失効候補】リデザイン優先順位リスト(トークン→バナー→§9物理→スキン)は旧親 CLAUDE.md の削除で文書から消滅 | 旧 oripa mobile/CLAUDE.md(現1行ポインタ) | G | **文書から消滅**(記憶・慣行のみ) | 収録先が無い。推奨: 保留(必要なら新 CLAUDE に再収録) |
| R-098 | lint・CI・PR テンプレートに設計関連ルールは存在しない(eslint 設定・.github とも無し) | リポジトリ実査 | G | — | 推奨: 保留(自動 grep 化は §12 の機械化候補) |

## サマリ

### 分類別件数(主分類)

| 分類 | 件数 |
|---|---|
| A 文章・語彙 | 14(R-001〜014)+A側面をもつ R-076〜078, R-080, R-083 |
| B 色 | 17(R-015〜031) |
| C タイポ | 9(R-032〜040) |
| D 装飾・質感・モーション | 19(R-041〜059) |
| E 要素・レイアウト | 23(R-060〜083 の主分類) |
| F 技術前提 | 5(R-084〜088) |
| G プロセス・運用 | 10(R-089〜098) |
| 合計 | **98 ルール** |

### 矛盾している組

1. **R-001 vs R-078** — 通貨 Points(§13)vs 実装は全面 Coins/Credits(未移行)
2. **R-001 vs §5-9 例文** — §13「in Points」vs §5-9 の例「100% of listed value, in Coins」(doc 内不整合)
3. **R-011 vs R-081/R-082** — Vault 期限なし・自動変換禁止(§13)vs 実装の期限つき自動変換+convert 既定
4. **R-002 vs R-060/§12/R-079** — buyback 語彙禁止 vs §10「買取床値」・§12 チェック項目・sgVault コメント
5. **R-054 vs 漢字刻印不採用の過去決定**(lab ルール05)— 「引」透かしはどちらが生きているか未決
6. **R-005 vs R-080** — 4段ティア vs 開封/Vault/ソーシャルの旧5値 enum(KNOWN #5)
7. **R-044 vs R-083** — 絵文字禁止 vs 開封モックの絵文字残存
8. **R-071 vs 現実** — 「apps/ は無い」vs apps/pack-opening-web 現存
9. **R-088 vs R-005** — PORTING-NOTES の6段前提 vs 現行4段
10. **R-029 vs R-015/R-018** — lab 既定 A+B の「neon・coin gold 禁止」vs N2 の neon 朱・gold(サンドボックス限定だが逆方向)
11. **R-030/R-056 vs N2 全般** — lab /redesign の Urushi 既定(朱CTA・サテン・単一光源)は廃止済み世界観のまま稼働
12. **§1 鳥居・富士・和柄禁止(R-073 の根拠)vs 付録の和方針**(アイコン化 OK)— 次回改定で解消予定
13. **§2 の「イベントスキン(§9)」参照** — 実体は §10(参照ズレ、軽微)

### 二重定義(同じことを複数箇所で定義)

- **色トークン**: sg.ts(N2)と colors.ts/phTheme(legacy Phygitals)が並走(R-015/R-021)
- **書体**: sg.font(Fraunces/Schibsted/Spline)と brandFont(Outfit)が並走(R-032〜034/R-039)
- **スペーシング**: sg.space と spacing.ts(R-062)
- **開封仕様書**: opening-spec.md と「opening-spec 2.md」(複製ファイル)
- **用語・MOCK 規定**: §13/§5-9 と CLAUDE.md の再掲(意図的な再掲 — 正は doc 側)
- **ノイズ/グレイン**: lab Urushi(1.8% soft-light)と neo-tokyo(5% normal)— 別テーマの並存(競合ではない)
- **コントラスト表**: §11(N2 パレット)と neo-tokyo 計算(スキン側)— 対象が違うため併存可

### 「文書のみ」で実効していないルール

R-001(Points)/ R-011(Vault 規定)/ R-013(NEON BRUTAL 商標)/ R-028 の2スキン(NEON BRUTAL・VEGAS FELT)/ R-035(Zen Kaku)/ R-037(組版体系)/ R-038(Chakra Petch)/ R-048〜R-052(§9 物理・触覚)/ R-053(開封エスカレーション新配色)/ R-054(「引」透かし)/ R-055(00:00 JST)/ R-088(プロトタイプ移植方針)/ R-097(優先順位リスト — 文書からも消滅)

---

## 付録: 決定済み・次回改定で反映予定(和要素の取り扱い) — 記録のみ・今回は未反映

和要素は「禁止」ではなく「レジスター指定」に変更する。
- NG(本物志向の伝統): 漆・和紙・墨などの工芸素材コンセプト、神社の荘厳な写真表現、わびさび的ミニマリズム、筆文字。米国若年層に読解されず「古く」映るため。既定テーマの URUSHI ARCHIVE という概念・命名はこれに該当するため見直し対象(視覚トークンの黒+金は維持してよい。変えるのは概念語彙)。
- OK(インバウンド記号): 桜、富士山シルエット、赤鳥居のアイコン化、渋谷/東京の夜景、カタカナ、提灯。ステレオタイプであるほど良い。米国客層にとって認識コストゼロの「日本フレックス」として機能する。
- 調理の原則: 記号はフラット/ネオン/ポップに調理し、荘厳・写実・工芸的な調理をしない。例: MYTHIC演出の桜吹雪、バナーの富士シルエット+ネオン、DIRECT FROM TOKYO バッジの鳥居アイコン。
- 現行の鳥居×富士バナーは「差し替え」ではなく「再調理」候補(ムーディー写真→フラット/ネオングラフィック)。

**本方針に抵触し「和方針により置換候補」と注記したルール**: R-030(URUSHI ARCHIVE 命名)、R-054(「引」透かし — 関連)、R-056(Urushi 質感規律の命名)、R-073(鳥居×富士バナー — 差し替え→再調理へ)、および §1/§5-8 の伝統和記号禁止条項そのもの(R-022 系の根拠部分)。
