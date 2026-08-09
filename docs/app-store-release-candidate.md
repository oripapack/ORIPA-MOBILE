# Pull Hub — App Store release candidate

更新日: 2026-08-10
対象ブランチ: `codex/app-store-release-prep`
Bundle ID: `com.pullhub.app`
Expo project: `@yoshitake/tcg-mystery-pack`

## 結論

App Store へ提出するソースは `main` である必要はない。TestFlight を通すリリース候補をこのブランチで固定し、審査提出後に同じ commit を `main` へ merge する。審査対象の build と Git commit を一致させること。

現時点では **iOS bundle は生成可能だが、提出不可**。UI の問題ではなく、下記の本番サービスと事業データが未接続だからである。未接続機能を動作するように見せる fixture や仮確率は使わない。

## 自動検査の現在地

- [x] Expo project を作成し `app.json` に project ID を設定
- [x] `com.pullhub.app` / version `1.0.0` / build `1` を設定
- [x] iPhone-only に設定し、未検証の iPad 対応を外した
- [x] iOS Hermes export 成功
- [x] production Web export (`__DEV__` 無効) 成功
- [x] release対象の TypeScript 検査成功
- [x] 17 locale の構造検査成功
- [x] C-5 / C-13 表示文言検査成功
- [x] 440×956 / en-US で onboarding、Home、Pack detail、Shop、Vault、Friends、Player を自動操作
- [x] production surface で console error 0 / HTTP failure 0 / document overflow 0
- [x] Web 初回 coach の透明入力レイヤーと下部ナビへの潜り込みを修正
- [x] アプリ内アカウント削除導線とDB削除 migration を実装
- [x] カメラ用途を QR 読み取りに限定し、不要なマイク権限を除外
- [ ] Supabase migration / Edge Functions を本番へ deploy
- [ ] Clerk production instance と Apple sign-in を実機検証
- [ ] 実在庫・実オッズ・実 listed value を投入
- [ ] StoreKit Points 商品とサーバー検証を実装
- [ ] 実機で主要フローを通し、TestFlight QA を完了
- [ ] App Store Connect の app record / privacy / age rating / review account を完成

## 現在不足している本番値

`.env` は Clerk test key のみ。次が揃うまで production build を開始しない。

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_`)
- `EXPO_PUBLIC_PACK_RING_WEB_URL` (HTTPS)

値は `.env.production` に置き、Gitへ追加しない。`npm run release:ios` は placeholder / test Clerk key / release検査失敗時に停止する。

## 提出前ブロッカー

### Product / backend

1. `KNOWN_ISSUES.md` #4 / #13: 開封前commitと有限在庫の原子的減算。
2. 実際の pack inventory、tier、listed value、公開 odds。出典のない仮値は禁止。
3. `KNOWN_ISSUES.md` #7: App Store Connect の Points 商品ID、StoreKit、receipt / transaction検証、restore / refund処理。
4. `KNOWN_ISSUES.md` #1 / #2: 白画面と旧opening frameの実機再現試験。
5. Result 画面を実際の opening result へ接続し、mock result が production で到達不能なことを確認。

### Accounts / operations

1. Supabase project を復旧し CLI login、migration deploy、smoke test。
2. Clerk production instance、Apple / Google provider、redirect URL、production email delivery。
3. 監視される `support@pullhub.app` と公開 Support URL。
4. Privacy Policy URL とデータ保持・削除方針の法務確認。
5. 決済情報を持たない App Review 用アカウント。審査メモにログイン手順を記載し、パスワードはこのrepoへ保存しない。

`https://pullhub.com/privacy` と `https://pullhub.com/support` は 2026-08-10 時点でHTTP 200を返すが、本文は `/lander` へ送るドメイン駐車ページ。審査URLとして登録せず、実際の公開本文へ置き換える。

### App Store Connect

1. Bundle ID `com.pullhub.app` の app record を作成し Apple ID (`ascAppId`) を `eas.json` に追加。
2. Agreements / Tax / Banking と Points IAP 商品を完成。
3. App Privacy は Clerk、Supabase、配送、決済、analytics の実際の収集・用途に合わせて回答。
4. Age Rating ではランダムな virtual item / loot box 相当の質問へ実装どおり回答し、公開 odds を審査可能にする。
5. 暗号輸出回答は `ITSAppUsesNonExemptEncryption=false` の根拠を最終確認。

## en-US metadata / screenshots

実装にない効果・価値・在庫は主張しない。文字数制限を含む構造化ドラフトと撮影仕様:

- `app-store/metadata/en-US.json`
- `docs/app-store/metadata-en-US.md`
- `docs/app-store/screenshot-capture-plan.md`
- `docs/app-store/release-provenance.md`

ドラフトは意図的に `draft-do-not-upload` としており、公開法務URL、Copyright、カテゴリ判断、実機スクリーンショットが揃うまで提出ゲートを通らない。

## App Review notes draft

プライバシー収集表と年齢レーティング・審査条件の詳細:

- `docs/app-store/privacy-data-map.md`
- `docs/app-store/review-and-age-rating.md`

`.env.app-store.local`の実データから`npm run render:app-store-review-notes`で生成する。passwordは生成物やrepoへ保存しない。

## Release commands

```bash
npm run check:release
node scripts/check-app-store-readiness.mjs
npm run check:app-store-metadata
npm run release:ios
npm run record:app-store-build -- <EAS_BUILD_ID>
npm run prepare:app-store-submit
```

`release:ios` は EAS production build までで止まる。`prepare:app-store-submit` は外部送信せず、公開法務情報・review account・IAP・公平抽選・本番deploy・TestFlight承認の宣言を検証する。まず TestFlight で実機QAし、合格した同じ build のみを submit する。
