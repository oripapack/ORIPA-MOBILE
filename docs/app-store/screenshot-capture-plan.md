# App Store screenshot capture plan

更新日: 2026-08-10
対象: en-US / iPhone 6.9-inch / portrait

## 出力仕様

- 基準サイズ: **1320×2868 px** PNG、透過なし。
- 保存先: `app-store/screenshots/en-US/6.9-inch/`
- 1〜10枚。初回提出は次の6枚を推奨。
- ブラウザ枠、macOS Dock、デバッグ表示、fixture、未公開機能を含めない。
- 実カード画像・商標・第三者素材は権利確認済みのものだけを使う。
- 画像上の説明文は実際の画面を隠さず、提出 build で動かない機能を約束しない。

## Shot list

1. **Home / catalog** — ログイン後の pack 一覧。実在庫と公開状態が分かる画面。
2. **Pack detail / odds** — 購入または開封操作より前に disclosed odds と pack details が確認できる画面。
3. **Opening / reveal** — TestFlight build の実際の開封演出。結果を加工・差し替えない。
4. **Pull result / Vault** — 同じ開封結果が Vault へ入ったことが確認できる画面。
5. **Next action** — eligible pull に対する physical fulfillment または Trade in for Points の選択画面。
6. **Trust / control** — fairness record、Privacy / Support、または account deletion のうち、審査で重要な実画面。

## Capture procedure

1. `codex/app-store-release-prep` の提出候補 commit を固定する。
2. production services と StoreKit sandbox を接続して EAS production build を作る。
3. 同じ build を TestFlight へ配布し、決済情報を持たない review account で全フローを通す。
4. 6.9-inch iPhone実機または正規 Simulator で、英語ロケール・実データの画面を撮影する。
5. 画像を上記保存先へ入れ、`npm run check:app-store-metadata -- --submission` で寸法・透過・枚数を検査する。

## 現在の制約

ローカルの440×956 Web画像はレイアウトQA用であり、App Store提出画像には使わない。現在のMacには完全なXcodeとiOS Simulatorがないため、最終画像はXcode導入後か実機TestFlightで取得する。
