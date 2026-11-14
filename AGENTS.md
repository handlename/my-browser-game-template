# AI エージェント向け開発ガイドライン (AGENTS.md)

本ドキュメントは、本リポジトリでゲームの開発・改修を行う AI エージェントおよびエンジニアに対する共通指示書です。

---

## 1. アーキテクチャ原則 (Functional Core, Imperative Shell)

本プロジェクトは、テスト容易性・堅牢性・高速なイテレーションを両立するため、**Functional Core / Imperative Shell** パターンを厳格に適用します。

- **`src/core/` (Functional Core)**:
  - ゲームの純粋ロジック、状態遷移、ルール計算を担当します。
  - **純粋関数**と**不変（`readonly` / `Object.freeze`）データ構造**のみで実装してください。
  - **副作用の禁止**: DOM 操作、Canvas 描画、Web Audio、LocalStorage、および直接の `Math.random()` 呼び出しは厳禁です（乱数が必要な場合は注入された `rng: () => number` を使用してください）。
  - すべての Core モジュールは、ブラウザ環境なし（Vitest）で単体テストが完結するように作成します。

- **`src/shell/` (Imperative Shell)**:
  - Canvas 2D / WebGL 描画、ユーザー入力（タッチ、キーボード、ジャイロセンサー等）、Web Audio 再生、LocalStorage 永続化、画面共有（Web Share API）などの副作用をカプセル化します。
  - Core 層から受け取った `GameState` を画面や音へ投影し、外部イベントを Core 層への入力へ変換します。
  - ただし、`src/shell/` 内の処理であっても、ジオメトリ構築や純粋計算のように DOM / WebGL から切り離せる部分は極力純粋関数化し、`tests/shell/` 配下に Vitest 単体テストを書いてください。

- **`src/main.ts`**:
  - アプリケーションのエントリポイント。シェルとコアを結合し、`requestAnimationFrame` ループを駆動します。

---

## 2. インゲームバージョン確認規約

- **画面内表示の義務付け**:
  - ゲーム画面（タイトル、HUD、リザルト、または設定画面等）から、常に現在動作しているゲームのバージョンを確認できるようにしてください。
  - バージョン情報は `package.json` の `version` を単一の真実（Single Source of Truth）とし、Vite の `__APP_VERSION__` 定数経由で参照します。
  - 新機能追加やバグ修正によるバージョン更新時は、`package.json` のバージョンをインクリメントしてください。

---

## 3. ADR (Architecture Decision Record) の記録運用規約

アーキテクチャ上の重要な判断を行った際は、必ず ADR として記録を残してください。

- **管理ツール**: [joshrotenberg/adrs](https://github.com/joshrotenberg/adrs) を使用します（`aqua` 経由で管理）。
- **記録対象の例**:
  - ディレクトリ構造やモジュール責務の変更
  - 外部ライブラリ（物理演算、音声合成、フォント等）の採否
  - ゲームの基本ループ・固定アスペクト比スケーリング方式の変更
  - セーブデータ構造や破壊的スキーマ変更
- **ADR 作成コマンド**:
  ```bash
  adrs new "決定のタイトル"
  ```
  `doc/adr/` 配下に新規 Markdown が作成されます。コンテキスト（背景）、決定（選択した方針）、結果（得られるメリットとトレードオフ）を記述してください。
  - **フォールバック**: `adrs` コマンドが実行環境の `PATH` に見つからない場合は、`doc/adr/0001-record-architecture-decisions.md` と同一書式で `doc/adr/` 配下に連番ファイルを手動作成して構いません。

---

## 4. 設計〜実装のドキュメント運用とセッション引き継ぎ

- **正本ドキュメントの集約と同期更新**:
  - 最終仕様および意思決定は、リポジトリ直下の正本ドキュメント（`REQUIREMENTS.md` / `DESIGN.md` / `UI_DESIGN.md` / `GLOSSARY.md` / `README.md`）と `doc/adr/` に集約します（`docs/superpowers/` や `.superpowers/` 等の AI 作業用ドキュメントと二重管理しないこと）。
  - 設計承認および ADR 記録のタイミングで、リポジトリ直下の正本ドキュメントも必ず同期更新してください。
- **ジャンル別ベストプラクティス (`docs/references/`)**:
  - `docs/references/` には、過去のゲーム開発・実機検証から得られたジャンル別の実装ノウハウ・チェックリストを集約しています（個別ノウハウで本ファイルを肥大化させないための参照先です）。
  - 該当領域の設計・実装・検証を行う際は、必ず対象ドキュメントを確認してください。
    - [タッチ・マルチタッチ・HUD 重畳入力](docs/references/touch-and-input.md)
    - [実機チューニング・自動プレイ検証](docs/references/playtest-and-debugging.md)
- **セッション引き継ぎ**:
  - 設計・計画セッションと実装セッションを分ける場合は、次セッションへ渡す指示に以下を必ず明記してください。
    - **参照ファイル一覧**: 実装前に確認すべきドキュメント・ADR・対象ファイル
    - **今回スコープの非ゴール**: 当該セッションで意図的に実装しない範囲
    - **検証コマンド**: 完了確認に用いるコマンド（`bun run build`, `bun run test` 等）

---

## 5. スマートフォン実機検証 & 開発環境

スマートフォンを主対象とするブラウザゲームでは、PC のシミュレータだけでなく実機での操作感・センサー挙動・パフォーマンスの検証が極めて重要です。

- **ランタイム・ツール**:
  - 言語ランタイム（Bun）: `mise.toml` で管理（`/Users/handlename/.local/share/mise/shims/bun` 等）。
  - CLI ツール（`adrs` 等）: `aqua.yaml` で管理。
- **実機検証用開発サーバー (HTTP / HTTPS)**:
  - 通常のタッチ操作や画面表示を LAN / Tailscale 経由のスマホ実機から手早く確認する場合は、HTTP で外部公開する `bun run dev:host` を使用できます。
  - iOS Safari 等でジャイロセンサー（`DeviceMotionEvent` / `DeviceOrientationEvent`）や Web Share API を動作させるにはセキュアコンテキスト（HTTPS）が必須です。
  - プロジェクトルートに `certs/key.pem` と `certs/cert.pem` を配置し、HTTPS サーバーを起動できます:
    ```bash
    bun run dev:https
    ```
  - エージェントが検証用サーバーを起動する際は、バックグラウンドタスク（Daemon）として常駐させ、ホットリロードにより即時確認できるようにします。

---

## 6. コマンドリファレンス

- **開発サーバー起動 (HTTP / localhost)**: `bun run dev`
- **実機向け開発サーバー起動 (HTTP / LAN・Tailscale)**: `bun run dev:host`
- **実機向け開発サーバー起動 (HTTPS)**: `bun run dev:https`
- **単体テスト実行**: `bun run test`
- **型検査 & 本番ビルド**: `bun run build`
- **プレビューサーバー**: `bun run preview`
- **GitHub Actions 依存ロック更新**: `gh actions-lock`
