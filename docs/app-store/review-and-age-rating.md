# Pull Hub — App Review / age rating handoff

更新日: 2026-08-10

対象: iOS `1.0.0` / 米国向け初回リリース候補

## 先に結論

現行のproduction相当UIは安全に停止するが、パック開封・Points IAP・実在庫が停止したままなので、App Storeへはまだ提出しない。Appleは、ログイン付きアプリでは動作するreview accountと稼働中backendを要求し、placeholder・beta・不完全なcore flowを却下対象としている。

- App Review Guidelines 2.1 / Before You Submit: <https://developer.apple.com/app-store/review/guidelines/>
- 検証用には TestFlight を使い、App Store提出はlive core flow完成後に行う。

## Chance model の重大判断

提出版が「購入したPointsでランダムなパックを開け、価値の異なるカードを得て、物理配送またはTrade inを選べる」なら、少なくとも App Store age rating の **Loot Boxes = Yes** として扱う。Apple Guideline 3.1.1は、購入できるランダムitemについて購入前の種類別odds開示を要求する。

ただし、物理賞品・購入Points・chance・Trade inの組合せが、対象州でlottery / gambling / prize promotion等に該当するかはコードから決められない。米国対象地域を確定し、専門家がbusiness modelを承認するまで `Gambling` と `Simulated Gambling` を推測で回答しない。

Apple Guideline 5.3では、real money gamingにIAP通貨を使えず、該当する場合はライセンス・geo restriction・無料配布等が必要になる。この分類は StoreKit実装より前に解決する。

## Age Rating 回答案

App Store Connectの現行questionnaireには `Loot Boxes`、`Gambling`、`Simulated Gambling`、`Contests` 等がある。正確なバイナリに合わせて次を入力する。

| Question | 現時点の回答 | 条件 |
|---|---|---|
| Loot Boxes | **Yes** | 購入可能なランダムパックを提供する提出版 |
| Gambling | **Unresolved — legal approval required** | 米国の対象州と経済設計を固定して判断 |
| Simulated Gambling | **Unresolved — product/legal review** | casino simulationではないがchance mechanicの分類を確認 |
| Contests | None | promotionsを無効のまま提出。実施時はofficial rulesが必要 |
| Messaging and Chat | None | current RCにchatなし |
| User-Generated Content | None | current RCに投稿面なし |
| Unrestricted Web Access | No | OAuth / public policy / supportへの限定遷移のみ |
| Advertising | No | 広告SDK・広告表示なし |
| Age Assurance | No | 現状未実装。法務判断で必要なら実装して回答変更 |

Appleの入力手順: <https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating>

## Review account の合格条件

- 決済情報を登録していない専用production account
- email確認・Apple/Google loginのどちらかで常時ログイン可能
- App Review期間中に無効化・MFA追加・password変更をしない
- review用Pointsは本番サーバーの監査可能なgrantとして付与し、端末mockにしない
- 実在庫のreview packを1つ以上開ける
- odds、fairness record、Vault、Trade in、shipping request、account deletionを審査できる
- passwordはApp Store ConnectのReview Informationだけに入力し、Gitや`.env.app-store.local`へ保存しない

## App Review notes template

下記はcore flowが本当に稼働してから貼り付ける。角括弧を一つでも残さない。

```text
Pull Hub is a trading-card pack experience for collectors. Customers use
Points purchased with Apple In-App Purchase to open packs with disclosed odds.
Each result is recorded in Vault. Eligible cards can be kept for physical
fulfillment or traded in for Points. Points cannot be withdrawn for cash.

Review account
Email: [APP_REVIEW_EMAIL]
Password: supplied in App Store Connect only
No payment method is attached to this account. The account has a server-side
review grant that is used only for App Review.

Review pack: [LIVE_PACK_NAME_AND_ID]
Open flow: [NAVIGATION_STEPS]
Odds before purchase: [NAVIGATION_STEPS]
Fairness record after opening: [NAVIGATION_STEPS]
Vault and Trade in: [NAVIGATION_STEPS]
Physical fulfillment availability: [REGIONS_AND_LIMITATIONS]
Account deletion: Account > Settings > Account deletion > Delete account

Points product IDs: [PRODUCT_IDS]
Chance-model legal classification and release territories: [SUMMARY]
Support contact: [MONITORED_EMAIL]
```

## 提出を許可する受入条件

1. 公平抽選: 開封前commit、有限在庫lock/decrement、ledger/resultの原子性を本番で確認。
2. IAP: StoreKit商品、server transaction検証、refund処理をSandbox/TestFlightで確認。
3. Odds: 購入確定前に、提出packの実データから種類別oddsを表示。
4. Account deletion: Supabase migrationをdeployし、Clerk identity、DB行、Sign in with Apple token revocationを検証。
5. Privacy: 公開URL、in-app link、data map、provider audit、保持・削除方針を一致。
6. Legal: 運営法人、対象州、chance model、Terms、Privacy、fulfillmentを承認。
7. QA: exact production buildを実機iPhone / en-US でfull flow、自動＋手動確認。
8. Review: 専用accountとlive backendを審査期間中維持。

すべて完了したら `.env.app-store.local` を更新し、`npm run prepare:app-store-submit` が0終了することを提出前の機械条件とする。
