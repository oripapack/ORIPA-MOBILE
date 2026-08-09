# App Store metadata — en-US

更新日: 2026-08-10
構造化データ: `app-store/metadata/en-US.json`

## 状態

`draft-do-not-upload`。文言の長さは自動検査済みだが、実際の本番フローと法務確認が終わるまで App Store Connect へ登録しない。

提出時は次の全条件を満たしてから JSON の `status` と `category.status` を `approved` に変更する。

1. 公開 odds、実在庫、StoreKit、開封結果、Vault、Trade in、physical fulfillment の対象範囲が TestFlight で確認済み。
2. 説明文の各機能が提出 build から到達可能。
3. 正式な法人名、Copyright、Privacy URL、Support URL が確定済み。
4. チャンスモデルの法務判断と App Store の age rating 回答が確定済み。

## 方針

- 日本発の差別化は `inspired by Japan's pack-opening culture` と表現する。法人所在地や製造国を断定しない。
- 実装にない marketplace、cash payout、コミュニティ機能は記載しない。
- `Trade in for Points` と明記し、Points を現金として説明しない。
- physical fulfillment は eligible pulls / regions に限定する。
- 特定カード、価値、確率、在庫量をメタデータで保証しない。

## Category provisional recommendation

第一候補は **Games > Card**、第二候補は **Shopping**。ただし、これは開封体験が主要価値で、physical fulfillment が本番で実際に提供される場合のみ。チャンスモデルの法的分類と審査回答が確定するまで暫定とする。

## Validation

```bash
npm run check:app-store-metadata
npm run check:app-store-metadata -- --submission
```

通常モードは文字数と形式を検査し、未確定項目を warning にする。`--submission` は未承認ステータス、空の公開URL、空のCopyright、未作成スクリーンショットを blocker として停止する。
