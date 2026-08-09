# Pull Hub — App Privacy data map

更新日: 2026-08-10

対象: `codex/app-store-release-prep` / iOS `1.0.0`

用途: App Store Connect の App Privacy 回答と公開 Privacy Policy の事実確認

## 回答の基準

App Privacy は、提出する**正確なバイナリ**と、組み込んだ第三者 SDK の実際の挙動に合わせる。Apple は、端末外へ送信され、リアルタイム処理に必要な時間を超えて開発者または第三者がアクセスできるデータを「収集」と扱う。ユーザーID等で結び付く場合は原則「Linked to the User」とする。

- Apple: <https://developer.apple.com/app-store/app-privacy-details/>
- App Store Connect の入力手順: <https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy>

現行コードでは広告 SDK、行動分析 SDK、ATT、広告IDの読み取りは見つからない。ただし Clerk、Supabase、Expo/EAS、Apple の契約・本番設定・ログ保持を別途確認するまで、最終回答は確定しない。

## 提出対象で収集するデータ

次は、ライブの認証・Points・パック開封を有効にする提出版で申告する保守的な案。目的はすべて `App Functionality`、追跡は `No` を前提とする。広告目的、データブローカー共有、他社データとの広告照合を少しでも行う場合は回答を変更する。

| Apple data type | Linked | 目的 | 保存先 / 第三者 | コード上の根拠 |
|---|---:|---|---|---|
| Contact Info — Name | Yes | プロフィール表示、アカウント運用 | Clerk。プロフィール同期後は Supabase | `ProfileOnboardingScreen.tsx`, `clerkProfile.ts` |
| Contact Info — Email Address | Yes | 認証、確認コード、アカウント連絡 | Clerk | `AuthScreen.tsx`, `ClerkAccountSection.tsx` |
| Identifiers — User ID | Yes | 認証、RLS、Points、Vault、削除 | Clerk IDをSupabaseの所有キーとして利用 | `ClerkProfileSync.tsx`, `supabaseAuthed.ts` |
| User Content — Gameplay Content | Yes | 開封結果、Vault、コレクション状態 | Supabase | `pull_results`, `user_vault_items`, `digital_twins` |
| Purchases — Purchase History | Yes | StoreKit取引、Points台帳、パック消費、返金整合 | Apple / Supabase | `user_credits`, `credit_transactions`; StoreKitは未実装 |

`Payment Info` は、カード番号等をApple側で入力し、運営がアクセスしないStoreKit構成なら申告対象にしない。運営が保持する商品ID、transaction ID、購入履歴は `Purchase History` として申告する。

## 機能を有効にした場合だけ追加するデータ

| Feature flag / 機能 | 追加 data type | Linked | 保存先 | 現在地 |
|---|---|---:|---|---|
| `EXPO_PUBLIC_SHIPPING_LIVE=1` | Name, Physical Address, Phone Number | Yes | Supabase `shipping_addresses`, `shipping_orders` | 収集UIは本番で停止中。地域・保持方針・配送運用未承認 |
| phone verification | Phone Number | Yes | Clerk | `requirePhoneVerification=false` |
| `EXPO_PUBLIC_SOCIAL_LIVE=1` | User ID、Gameplay Content、必要ならOther User Content | Yes | 未確定 | 実プロフィール、通報、ブロック未接続 |
| support intake | Customer Support、添付を許すなら該当User Content | Yes | 未確定 | 監視窓口未接続 |
| `EXPO_PUBLIC_ADVANCED_ACCOUNT_SERVICES_LIVE=1` | Other Financial Infoに該当し得るwallet address、本人確認事業者が収集する各項目 | Yes | Supabase / 未選定KYC事業者 | 本番停止中 |
| Marketplace | Purchase History、配送に必要なContact Info | Yes | Supabase / 決済事業者 | 本番停止中 |

機能を `0` のまま提出する場合、その機能の将来コードがバイナリに存在するだけで申告を増やすのではなく、正確な提出版で実際に収集可能かを確認する。ただし App Store の説明・スクリーンショットで停止中機能を提供中と見せてはいけない。

## 端末内だけで扱う情報

次は現状、端末外へ送信する実装がないため App Privacy の「収集」には含めない。

- 言語・地域: `expo-localization` で読み取り、AsyncStorageへ保存
- 音・触覚・通知表示設定
- onboarding / coach / guest browse の完了フラグ
- クリップボード: 招待文・username・公平性検証値を**書き込むだけ**。読み取りなし
- カメラフレーム: friend QR の端末内スキャン。写真・音声を保存または送信しない
- ローカル検索・閲覧状態: analytics送信なし

## 現行コードで収集しないもの

- Health / Fitness
- Precise / Coarse Location
- Contacts
- Photos or Videos
- Audio Data。`expo-camera` はマイク権限とAndroid録音を明示的に無効化
- Browsing History
- Search History
- Advertising Data
- Device ID、Advertising Identifier
- Tracking。広告SDK、データブローカー共有、クロスアプリ広告照合は実装されていない

「収集しない」は本番プロバイダーの設定確認後にのみ最終確定する。特に Clerk / Supabase / Expo のIPアドレス、device/browser metadata、security logs、diagnostics の保持と目的を契約・dashboard・DPAで確認する。

## 第三者データ処理者の確認表

| Provider | 用途 | 提出前に確認すること |
|---|---|---|
| Clerk | 認証、email、OAuth、session token | production instance、保持期間、security logs、subprocessor、Sign in with Apple削除時のtoken revocation |
| Supabase | app DB、RLS、Edge Functions | region、logs/backups、保持・削除、DPA、account deletion migration |
| Apple / StoreKit | Points IAP | product、transaction検証、refund、purchase history、privacy回答 |
| Expo / EAS | build / update infrastructure | runtimeで収集されるdiagnosticsの有無、OTA update方針 |
| OAuth providers | Apple / Google sign-in | 受け取るscope、provider側の利用目的、credential revocation |

## 保持・削除

- Settings からアカウント削除を開始できる。
- `delete_my_account_data()` は shipping、Vault、ledger、pull、profile を削除し、その後 Clerk identity を削除する設計。
- migrationの本番deploy、実アカウント試験、Sign in with Apple token revocation確認は未完了。
- 法令上保持する必要がある取引・税務・配送記録の範囲と期間は未決定。公開Policyへ具体的に記載するまで提出しない。
- Appleの削除要件: <https://developer.apple.com/support/offering-account-deletion-in-your-app/>

## 最終入力前の承認

1. exact TestFlight build のfeature flagsを記録する。
2. 各providerのproduction設定とDPAを確認する。
3. 公開Privacy Policyとこの表を一致させる。
4. App Store Connectの全回答をスクリーンショットで保存する。
5. `.env.app-store.local` の `APP_STORE_PRIVACY_VENDOR_AUDIT_APPROVED=yes` は上記完了後だけ設定する。

2026-08-10の外部確認では `pullhub.com/privacy` と `pullhub.com/support` は実本文ではなく `/lander` への駐車ページだった。`check-app-store-submission.mjs` はHTTP statusだけでなく、本文の存在と用途語を検査する。
