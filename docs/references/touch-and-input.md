# タッチ・マルチタッチ・HUD 重畳入力のベストプラクティス

スマートフォン向けブラウザゲーム（特にマルチタッチ操作や DOM HUD 重畳を伴うタイトル）で発生しやすいポインタ競合・解放漏れ・ブラウザ既定動作の誤爆を防ぐための設計指針です。

---

## 1. 設計上の勘所

### ポインタ状態は最初から `Map<number, ...>` で管理する
- 単一の `activePointerId` で設計すると、後から 2 本目以降の指（ピンチ、両手操作、複数ハンドル操作）に対応した際に破綻しやすい。
- `Map<pointerId, GrabTarget>` として、指 ID と操作対象の対応を一元管理する。

### すでに別の指が掴んでいる対象をヒットテストから除外する
- 複数の操作対象（ハンドルやボタン領域）が近接している場合、2 本目の指の `pointerdown` が「別の指がすでに掴んでいる対象」を誤って奪ってしまうことがある。
- ヒットテスト時に `Map.values()` に含まれる対象（またはその識別子）を候補から除外し、1 対象 1 ポインタの排他を保つ。

### 終了イベントは `pointerup` / `pointercancel` / `lostpointercapture` をすべて拾う
- iOS / Android Safari では、通知やシステムジェスチャ、画面端スワイプ等で `pointerup` が発火せず `pointercancel` になるケースが多い。
- `setPointerCapture` を使う場合も含め、`pointerup`・`pointercancel`・`lostpointercapture` の 3 系統で必ず `Map.delete(pointerId)` を行い、指が残り続ける（幽霊タッチ）を防ぐ。

### Core 側の状態遷移と Shell 側のポインタ Map を同期する
- ポーズ（`isPaused = true`）やフェーズ遷移（リザルト・リトライ等）で Core 側が操作を強制終了した際、Shell 側のローカル `Map` だけ古いエントリが残ると復帰直後に誤作動する。
- Core のフェーズ変化や `isPaused` 遷移を検知したら Shell 側の `Map.clear()`（および必要なら `releasePointerCapture`）を走らせる。
- 入力コントローラは `Element` 等を直接握り込まず、ハンドラ関数や最小インターフェースを分離しておくと、`tests/shell/` でイベントモックを使った単体テストが容易になる。

### HUD とキャンバスのイベント透過分離
- `#hud-root` 自体は `pointer-events: none` のまま維持し、ゲームプレイ中のタッチを背面 `#game-canvas` へ素通りさせる。
- ボタン・スライダー・デバッグパネルなど、**操作可能な DOM 要素にだけ** `pointer-events: auto` を指定する。
- `#game-canvas` には `touch-action: none`、`#game-stage` には `overflow: hidden` を指定し、ブラウザのピンチズーム・スクロールやステージ外へのはみ出しを防ぐ（テンプレートの `index.html` に設定済み）。

---

## 2. 最小コード指針

```ts
// Shell 側のポインタ管理イメージ（テスト可能な純粋関数・小さなクラスへ切り出す）
const activePointers = new Map<number, string>(); // pointerId -> targetId

function onPointerDown(pointerId: number, x: number, y: number): void {
  const occupiedTargets = new Set(activePointers.values());
  const hit = hitTest(x, y, occupiedTargets); // 掴まれている対象は除外
  if (!hit) return;
  activePointers.set(pointerId, hit.id);
}

function releasePointer(pointerId: number): void {
  activePointers.delete(pointerId);
}

// pointerup / pointercancel / lostpointercapture のすべてで releasePointer を呼ぶ
// state.isPaused やフェーズ遷移時にも activePointers.clear() を実行する
```

---

## 3. 実装チェックリスト

- [ ] 入力管理が単一 ID ではなく `Map<pointerId, ...>` になっているか
- [ ] 新規 `pointerdown` のヒットテストで、他の指が掴んでいる対象を除外しているか
- [ ] `pointerup` / `pointercancel` / `lostpointercapture` のすべてで解放処理が呼ばれるか
- [ ] ポーズ・ゲームオーバー・フェーズ遷移時に Shell 側のポインタ `Map` がクリアされるか
- [ ] `#hud-root` は `pointer-events: none`、操作対象 DOM のみ `pointer-events: auto` になっているか
- [ ] 入力マッピングや解放ロジックの単体テストが `tests/shell/` にあるか
