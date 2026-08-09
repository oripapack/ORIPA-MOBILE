# App Store release provenance

更新日: 2026-08-10

## Purpose

App Storeへ提出するiOS binaryが、TestFlightで確認したGit commitと同一であることを機械的に証明する。`main`へのmerge有無ではなく、EAS build recordと現在の`HEAD`の一致を基準にする。

## Workflow

1. 提出候補branchのtracked filesがcleanであることを確認する。
2. `npm run release:ios` でproduction EAS buildを作成する。
3. 完了したbuildのIDを記録する。

```bash
npm run record:app-store-build -- <EAS_BUILD_ID>
```

4. `app-store/release/provenance.local.json` が生成される。このファイルはGitへ追加せず、審査完了まで安全に保管する。
5. TestFlight QA後に次を実行する。

```bash
npm run check:app-store-build
npm run prepare:app-store-submit
```

## Enforced invariants

- EAS project IDが`app.json`と一致
- platformがiOS、distributionがStore、profileがproduction
- build statusがfinished
- app versionが`app.json`と一致
- EASのfull Git commit hashが現在の`HEAD`と完全一致
- build後にtracked fileが変更されていない
- build numberと完了時刻が記録されている
- `.env.app-store.local`のEAS build ID / TestFlight build numberが証跡と一致

証跡の記録・検査はread-onlyの`eas build:view`だけを使い、build開始、TestFlight upload、App Store submitは行わない。
