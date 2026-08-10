# Pull Hub — Company and App Store account readiness

更新日: 2026-08-10

## 目的

Apple Developer Program の法人登録、App Store Connect の契約・税務・銀行設定、初回審査に必要な会社側作業を、ソースコードのリリース作業と分離して管理する。

会社書類の原本・写し、EIN、住所、署名、銀行情報、株式情報は Git、issue、チャット、`.env` に保存しない。Apple、Dun & Bradstreet、銀行、税務・法務専門家の正式な提出画面だけで扱う。

## 手元書類の判定

### Appleの法人確認に使える

- Delaware Secretary of State の認証付き Certificate of Incorporation
  - 法人の成立、法的名称、Delaware corporation であることを示せる。
  - D-U-N-S の確認や Apple の legal entity / compliance review で提出を求められた場合の第一候補。
- Certificate of Incorporation の本文写し
  - 認証付き写しと同じ法人名であることを確認済み。

Apple と D&B には、Certificate of Incorporation に記載された法的名称 `Pull Hub, Inc.` をそのまま使用する。ブランド表記やスペースを除いた別表記を legal entity name として使わない。

### 補助資料だが、正式EIN確認書ではない

- IRS EIN Unit の EIN assignment notice
  - 現在のPDF本文には「official EIN verification document ではない」「CP 575を別途送付する」と明記されている。
  - App Store Connect の W-9 入力には法人のEINが必要。Apple、銀行、決済事業者などが証明を求めた場合に備え、IRSの **CP 575** または正式な **147C letter** を取得・保管する。

### Apple提出には通常使わない社内・株式資料

- Employee Confidential Information and Inventions Assignment Agreement
- Restricted Stock Purchase Agreement
- Common Stock Certificate
- Section 83(b) election と filing proof
- Joint Escrow Instructions
- Stock Assignment Separate from Certificate
- Indemnification Agreement

これらは雇用、知的財産、株式、税務、役員保護の社内記録として保管する。Appleから明示的に求められない限りアップロードしない。

## 本人が行う作業 — 最短順

### P0: Apple法人アカウントを成立させる

- [ ] `Pull Hub, Inc.` の D-U-N-S Number を Apple の lookup から確認する。未登録なら無料申請する。
- [ ] D&B の legal entity name、headquarters address、mailing address、電話番号を会社資料と一致させる。
- [ ] 会社ドメインのメールアドレスを用意し、Apple Account の2要素認証を有効にする。
- [ ] 公開され、実際の会社・サービス内容がある企業サイトを用意する。ドメイン駐車ページやSNSだけでは不可。
- [ ] 法人を拘束する権限がある本人を Account Holder として Apple Developer Program へ法人登録する。
- [ ] 年会費を支払い、Apple Developer Program License Agreement を承認する。

現在の `pullhub.com` は審査用のPrivacy / Support本文になっていない。企業サイト、Privacy Policy、Supportを公開するまでApple登録・審査URLに使わない。

### P0: 販売とPoints IAPの契約を有効にする

- [ ] Account Holder が App Store Connect の Paid Apps Agreement を承認する。
- [ ] 法人名義の銀行口座を登録する。口座名義はApple Developer Programの法人と一致させる。
- [ ] App Store Connect が提示する税務フォームを入力する。米国法人として扱われる場合はW-9とEINが必要。
- [ ] 正式なCP 575または147C letterを取得し、確認要求に備える。
- [ ] Business画面で Agreements / Tax / Banking がすべて有効になったことを確認する。

銀行口座番号、routing number、EIN、税務フォームは Codex に送らず、App Store Connect へ本人が直接入力する。

### P0: 審査前に事業・法務を確定する

- [ ] 米国の販売対象州を決める。
- [ ] 購入Points、ランダム結果、物理カード、Trade in、配送を組み合わせたモデルについて、対象州の弁護士から書面で承認を得る。
- [ ] Terms of Service、Privacy Policy、返品・返金、配送、年齢制限、対象地域、odds表示の方針を承認する。
- [ ] カード画像、ブランド、商品名、価格・listed valueデータの利用権を確認する。

この判断が終わるまで、App Store Connect の Gambling / Simulated Gambling と販売地域を推測で確定しない。

### P1: App Store Connectを提出可能にする

- [ ] App Store Connect でBundle ID `com.pullhub.app` のNew Appを作成する。
- [ ] 作成後のApple ID (`ascAppId`) をリリース設定へ追加する。
- [ ] PointsのIn-App Purchase商品を作成し、商品IDを開発側へ渡す。
- [ ] App Privacy、Age Rating、Content Rights、輸出コンプライアンス、DSA status、販売地域を回答する。
- [ ] 監視されるSupportメール、公開Support URL、公開Privacy Policy URLを用意する。
- [ ] 決済情報のない本番App Reviewアカウントを作り、審査期間中に維持する。

Apple Account、App Store Connect、銀行、税務、D&Bのパスワードや秘密鍵は共有しない。Codexが画面作業を補助する場合も、本人がブラウザでログインした状態を使い、契約承認・税務送信・銀行登録・審査提出の直前で確認を取る。

## 開発側が続けられる条件

以下が揃えば、このブランチからTestFlightまで自動化を再開できる。

1. App Store Connectのapp recordと`ascAppId`
2. Apple Developer / EASの接続済みセッション
3. 本番Supabase、Clerk、HTTPS opening hostの公開設定（秘密値は`.env.production`のみ）
4. Points IAPの商品IDとサーバー検証方針
5. 実在庫、実odds、実listed value、配送・Trade inルール
6. 公開Privacy / Support URL
7. 法務承認済みの対象州とage-rating回答
8. 審査用アカウント

その後、production build、TestFlight upload、実機QA、App Store metadata同期、審査前ゲートを同じGit commitに対して実行する。

## Apple公式資料

- 法人登録要件: <https://developer.apple.com/programs/enroll/>
- D-U-N-S: <https://developer.apple.com/help/account/membership/D-U-N-S/>
- Identity verification: <https://developer.apple.com/help/account/membership/identity-verification>
- Compliance review: <https://developer.apple.com/help/app-store-connect/reference/account-management/compliance-review/>
- Paid Apps Agreement: <https://developer.apple.com/help/app-store-connect/manage-agreements/sign-and-update-agreements/>
- Tax: <https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information>
- Banking: <https://developer.apple.com/help/app-store-connect/manage-banking-information/enter-banking-information/>
- App Review: <https://developer.apple.com/app-store/review/>
