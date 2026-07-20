# Known Issues

未解決の既知バグの申し送り台帳。解決したら該当エントリを「Resolved」に移して commit hash を添える。

## Open

### 1. Home の「Open Pack」→ 白画面になるケースがある
- **記録日**: 2026-07-18(UI redesign Step 3 検証中に観測)
- **症状**: Home(Urushi 版)の Open Pack から開封フローに入ると、画面全体が白になることがある。再現条件は未特定(毎回ではない)。
- **切り分けメモ**: Home 側の変更は `openPack(pack)` を呼ぶところまでで、それ以降は開封フロー(`src/components/pack/opening/` / PackOpeningModal)の領域。白画面はフロー遷移後に発生するため開封側の可能性が高い。
- **担当**: Yutaka に申し送り済み(2026-07-18)。UI リデザイン側では調査しない。

### 2. 稀に旧デモの 3D 開封アニメーションが一瞬表示される
- **記録日**: 2026-07-18
- **症状**: 開封開始時、現行の開封演出の前に旧デモ実装の 3D アニメーションらしきものが1フレーム〜一瞬映り込むことがある。
- **切り分けメモ**: 旧/新の開封実装が混在(ring 移植: `src/components/pack/opening/ring/PackRingScene.web.tsx` と旧経路)しているため、初期化順序かフォールバック分岐の疑い。開封フロー側(Yutaka 域)。
- **担当**: Yutaka に申し送り済み(2026-07-18)。

## Resolved

- (なし)
