# 開封3Dプロトタイプ 移植メモ

対象: `pullhub-pack-3d_13.html`(このディレクトリ、原文のまま・無改変)

## 配線状況 (2026-08-01)

**本番 x1 開封は WebView/iframe で HTML を載せる方針で配線済み。**

- 出荷コピー: `pack-ring-server/opening-3d.html`（embed bridge / skip / N2 tier ラベル適用）
- 入口: `RingPackOpenFlow` → `http(s)://{host}:3000/opening-3d.html?embed=1&tier=&card=`
- 完了: flip 後 `postMessage({ type: 'revealDone' })` → `PackOpeningModal`
- Skip: 親が `skip` message / `__PH_SKIP_OPEN__()` を呼ぶ

原文 `prototypes/opening-3d/pullhub-pack-3d_13.html` は無改変のまま保持。

## 何か

Three.js r128 (CDN) 製の開封アニメーション。ブラウザで単体動作する。
シーケンス: flapOpen → openPack → packExit → emerge → centerCard → flip

## 方針

react-native-webview でこのHTMLをそのまま載せる。
実績を見てから expo-gl + expo-three への正式移植を判断する。
つまりこのファイルは捨てるプロトタイプではなく、出荷するアセットになる。
配線時に assets/ 配下へ移動する想定。

## 正式移植する場合の障害(WebViewなら発生しない)

- テクスチャ13種が Canvas 2D (`getContext('2d')`) で生成されている。
  RN に DOM canvas は無い。PNG に焼くか react-native-skia で描き直しが必要。
  対象: texFront / texBack / texCrimp / texTorn / texDash / texCardBack /
  texCardFront / texGlow / texDot / texLabel / texLabelBack / texChamber / texRay
- 音が Web Audio API (AudioContext)。expo-av で書き直しが必要。
  対象: audio / tone / tick / chime / buzz

## 配線前に直すこと

### ティア(§6 の6段に合わせる)

CARD_DATA.rarityLabels の5段階 (N/R/SR/SSR/UR) を廃止し、
docs/design-system-n2.md §6 の6段に置き換える:
MYTHIC / LEGENDARY / EPIC / RARE / UNCOMMON / COMMON

漏れ光の色は6色にしない。色を持つのは上位3段のみ:

- MYTHIC = neon #FF4A38 + グロー
- LEGENDARY = gold #D4AF37
- EPIC = gold #D4AF37
- RARE / UNCOMMON / COMMON = 無彩色

ラベルは "RARITY" ではなく "TIER"。
カードに印刷されているレアリティ(SR / SAR 等)はティアとは別物なので、
表示する場合は別の欄に出す。

### 色

マゼンタ #ff3fd8 / シアン #37e6ff / 紫 #b26bff / 白 #ffffff が使われており、
§5-1 と §5-2 に抵触する。
ただし §8 で開封演出のみ演出全開が許可されているため、
**当面はこのまま残す。配線時に判断する。**
上位3段の漏れ光だけは、他画面と色の意味がズレるため §6 に合わせること。

## 未確認事項

- §9 の中断可能性(タップでスキップして結果へ)が実装されているか
- ドラッグが1:1追従か、コミット判定が離した位置でなく速度の符号か
- スラブ描画の GEM MINT 10 と赤帯 #c8102e が PSA の体裁。
  実際に鑑定済みか、表示してよいかの確認が必要

## 依存関係

react-native-webview が必要になる。配線タスクまで package.json は変更しない。
