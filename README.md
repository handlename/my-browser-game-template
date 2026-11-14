# my-browser-game-template

スマートフォン向けブラウザゲームを素早く開発・公開するためのテンプレートリポジトリです。
AI エージェント（Claude, Gemini 等）との協働開発に最適化されており、堅牢なアーキテクチャと CI/CD セキュリティを備えています。

## 特徴

- **高速な開発サイクル**: [Bun](https://bun.sh/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Functional Core / Imperative Shell**: ゲームロジック（純粋関数）と描画・I/O（副作用）を明確に分離
- **厳格なテスト体制**: [Vitest](https://vitest.dev/) によるロジックの単体テスト
- **ツール & ランタイム宣言管理**:
  - 言語ランタイム: [mise](https://mise.jdx.dev/) (`mise.toml`)
  - CLI ツール: [aqua](https://aquaproj.github.io/) (`aqua.yaml`)
- **ADR (Architecture Decision Record)**: [adrs](https://github.com/joshrotenberg/adrs) による意思決定ログ
- **GitHub Pages デプロイ & セキュリティ**:
  - main ブランチへの push で GitHub Pages へ自動デプロイ
  - `gh actions-lock` による GitHub Actions 依存関係のコミット SHA 固定
- **インゲームバージョン表示**: ビルド時に `package.json` のバージョンを画面内へ自動注入
- **スマホ実機検証**: 自己署名 HTTPS 開発サーバー設定を標準同梱

---

## 前提条件・セットアップ

### 1. ツール & ランタイムのセットアップ
```bash
# ランタイムのインストール (Bun)
mise install

# 開発用ツールのインストール (adrs 等)
aqua install

# npm 依存パッケージのインストール
bun install
```

---

## 開発コマンド

```bash
# 開発サーバー起動 (HTTP)
bun run dev

# スマホ実機検証用 HTTPS 開発サーバー起動
bun run dev:https

# 単体テスト実行 (Vitest)
bun run test

# 型検査 & 本番ビルド (dist/ 出力)
bun run build

# ビルド成果物のローカルプレビュー
bun run preview
```

---

## プロジェクト構成

```text
.
├── .github/
│   └── workflows/
│       ├── actions.lock          # GitHub Actions 依存ロックファイル
│       ├── ci.yml                # CI ワークフロー (test, build)
│       └── deploy-pages.yml      # GitHub Pages デプロイワークフロー
├── doc/
│   └── adr/                      # Architecture Decision Records
│       └── 0001-record-architecture-decisions.md
├── src/
│   ├── core/                     # Functional Core (純粋関数・副作用なし)
│   │   ├── types.ts              # ゲーム状態・解像度の型定義
│   │   └── game.ts               # 初期化と状態進行ロジック
│   ├── shell/                    # Imperative Shell (描画・入出力)
│   │   └── renderer.ts           # Canvas 2D 描画 (バージョン表示含む)
│   ├── main.ts                   # エントリポイント・RAF ループ
│   └── vite-env.d.ts             # Vite グローバル型定義 (__APP_VERSION__)
├── tests/
│   └── core/
│       └── game.test.ts          # Core ロジックの単体テスト
├── AGENTS.md                     # AI エージェント向け開発ガイドライン
├── REQUIREMENTS.md               # 要件定義書 (テンプレート)
├── DESIGN.md                     # 設計書 (テンプレート)
├── UI_DESIGN.md                  # UIデザイン仕様書 (テンプレート)
├── GLOSSARY.md                   # 用語集 (テンプレート)
├── aqua.yaml                     # aqua ツール設定
├── mise.toml                     # mise ランタイム設定
├── package.json
└── vite.config.ts
```

---

## ドキュメントの活用

新しくゲームを制作する際は、以下のファイルを仕様に合わせて記述してください。

- `REQUIREMENTS.md`: どんなゲームか、何が面白いか、機能要件
- `DESIGN.md`: データモデル、数理・判定計算、モジュール分割
- `UI_DESIGN.md`: 画面レイアウト、HUD、カラーパレット
- `GLOSSARY.md`: ゲーム固有のルール用語や登場オブジェクトの定義
