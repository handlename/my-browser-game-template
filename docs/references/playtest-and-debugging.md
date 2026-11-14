# 実機チューニング・自動プレイ検証のベストプラクティス

スマートフォン実機での手触り調整（イテレーション速度）と、ブラウザサブエージェントや自動 E2E テストによる検証容易性を高めるための設計指針です。

---

## 1. 設計上の勘所

### 折りたたみ式 `DEBUG` パネルでビルドなしの即時調整を可能にする
- 実機検証では、判定余裕・猶予時間・速度・操作モード等の数値を少し変えて何度も試す必要がある。
- 画面隅に小さなトグルボタン（`DEBUG` 等）を置き、折りたたみ式の調整パネルを `#hud-root` 内に用意しておくと、コード変更・再ビルドなしで実機上で手触りを詰められる。
- デバッグ設定値のデフォルトや適用ロジックは、本番用の定数・型と乖離しないよう設定オブジェクトとして整理しておく。

### パネル表示中は `isPaused` で進行・入力を止め、背面へイベントを漏らさない
- `DEBUG` パネルを開いている間は `setPaused(state, true)` などで `GameState.isPaused` を `true` にし、`stepGame` の進行およびゲーム側の入力処理を停止する。
- パネル要素には `pointer-events: auto` を指定し、必要に応じて `pointerdown` 等の `stopPropagation()` を行って、スライダーやボタン操作が背面の `#game-canvas` へ漏れるのを防ぐ。

### Canvas / WebGL だけでなく `#hud-root` に検証用 DOM テキストを出す
- ブラウザサブエージェントや Playwright 等の自動 E2E 検証では、Canvas 2D / WebGL 内部に描かれたピクセル文字を直接読み取りにくい。
- 現在のステージ（またはフェーズ）・状態・操作ヒント・リザルト等の要点を `#hud-root` 内の軽量な DOM テキスト（または `aria-label` / `data-*` 属性付き要素）としても出力しておくと、視覚的なレイアウトを崩さずに自動検証やアクセシビリティ確認が格段に安定する。

### 実機確認サーバーの使い分け
- 通常のタッチ操作・HUD 表示の検証は、HTTP で起動できる `bun run dev:host`（LAN / Tailscale 経由ですぐ開ける）が手早い。
- ジャイロセンサー（`DeviceMotionEvent` / `DeviceOrientationEvent`）や Web Share API などセキュアコンテキストが必須の機能を確認する場合のみ `bun run dev:https` を使用する。

---

## 2. 最小コード指針

```ts
// DEBUG パネル開閉と GameState.isPaused の連動イメージ
function toggleDebugPanel(isOpen: boolean): void {
  debugPanel.hidden = !isOpen;
  state = setPaused(state, isOpen);
  if (isOpen) {
    clearActivePointers(); // Shell 側の進行中タッチも同時に解放する
  }
}
```

```html
<!-- #hud-root 内に状態テキストと操作可能 UI を分離して配置する例 -->
<div id="hud-root">
  <div id="hud-status" aria-live="polite">STAGE 1 / PLAYING</div>
  <button id="debug-toggle" type="button" style="pointer-events: auto;">DEBUG</button>
  <aside id="debug-panel" hidden style="pointer-events: auto;">...</aside>
</div>
```

---

## 3. 実装チェックリスト

- [ ] 実機調整したい主要パラメータ（判定幅・速度・猶予時間・操作モード等）を画面上の `DEBUG` パネルから切り替えられるか
- [ ] `DEBUG` パネル表示中に `isPaused` が `true` になり、背面キャンバスへの誤操作が起きないか
- [ ] 現在のフェーズ・スコア・操作ヒント・結果が `#hud-root` の DOM テキストとしても取得できるか
- [ ] セキュアコンテキスト不要の確認は `bun run dev:host`、センサー等は `bun run dev:https` と使い分けられているか
