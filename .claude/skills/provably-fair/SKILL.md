---
name: provably-fair
description: Pull Hub のパック開封における commit-reveal 検証可能乱数を実装・レビューするときに使う。有限在庫からの一様抽選、サーバーシードのコミット/リビール、剰余バイアス除去、抽選と在庫減少の原子性、ユーザー側検証ページのロジックを扱う。pack opening / oripa / randomness / fairness / shuffle / draw に関わる実装で発動。
---

# Provably-Fair（有限在庫・一様抽選）実装規約

Pull Hub の競合優位の核心。ユーザーが開封後に「自分で」結果を検証できることが全て。
このルールから外れた実装はフェアネスの嘘になり、moat が崩れる。レビュー時も実装時もこの不変条件を必ずチェックすること。

## 乱数導出フロー（この順序を厳守）

1. サーバーが server_seed を生成（CSPRNG、32バイト以上）
2. 開封前に commit = SHA256(server_seed) を発行し、append-only で固定・ユーザーに公開
3. ユーザーが client_seed を提供（既定値あり、ユーザー変更可）
4. 開封ごとに nonce（パック単位の連番、リプレイ・巻き戻し禁止）
5. キーストリーム = HMAC-SHA256(key=server_seed, msg=`${client_seed}:${nonce}:${cursor}`)
   - cursor は1パック内で複数枚引くときのカウンタ
6. キーストリームのバイト列から整数を取り出し、rejection sampling で
   現在の在庫 slot 数に対する一様 index を導出
7. その index の slot を在庫配列から除去 → 結果確定
8. 開封後に server_seed をリビール。ユーザーは SHA256(revealed) == commit を検証可能

## 剰余バイアス除去（必須）

slot 数 N が 2 の冪でないとき、大きな整数 % N には剰余バイアスが出る。
均一抽選を名乗る以上、rejection sampling で除くこと。

```ts
function uniformIndex(nextUint32: () => number, N: number): number {
  if (N <= 0) throw new Error("empty inventory");
  const limit = Math.floor(0x100000000 / N) * N;
  let x: number;
  do {
    x = nextUint32();
  } while (x >= limit);
  return x % N;
}
```

- 浮動小数点で index を出さない。整数演算のみ。
- nextUint32 は HMAC キーストリームを4バイトずつ読む決定的関数。Math.random 禁止。

## 抽選と在庫減少の原子性（必須）

「index 導出 → slot 除去 → credit ledger 追記」は同一トランザクションで確定させる。

- 在庫 slot の除去はアトミックに（行ロック or 条件付き UPDATE で残数検証）
- ledger は append-only。残高は ledger の合計から導出
- 同一 nonce の二重実行はユニーク制約で弾く（冪等性）

## 絶対にやってはいけないこと

- リビール前に server_seed をログ・APIレスポンス・エラーメッセージ・スタックトレースに出す
- commit を開封後に差し替え可能にする
- nonce の再利用・巻き戻し・欠番の許容
- 在庫配列を「表示用」と「抽選用」で別ソースにする
- EV / slot 残数の表示値を、実際の抽選に使う在庫と別管理にする

## ユーザー検証ページが満たすべきこと

- 公開済み commit、リビール後の server_seed、自分の client_seed、nonce を入力
- SHA256(server_seed) == commit を表示
- 同じ HMAC + rejection sampling を再実行し、index 列が結果と一致することを表示
- 再現コードはサーバー実装と同一ロジックを共有モジュールから使う

## レビュー時チェックリスト

- [ ] server_seed がリビール前にどこにも漏れていないか（ログ・エラー含む）
- [ ] index 導出に rejection sampling が入っているか
- [ ] 抽選・在庫除去・ledger 追記が同一トランザクションか
- [ ] nonce のユニーク制約・冪等性があるか
- [ ] 検証ページとサーバーが同一ロジックを共有しているか
- [ ] 浮動小数点が乱数経路に紛れていないか