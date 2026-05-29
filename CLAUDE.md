# CLAUDE.md

Score Watcher のヘルプドキュメント（Astro Starlight 製、`https://docs.score-watcher.com`）。

## このリポジトリの構成

- `src/content/docs/**`: ドキュメント本体（mdx/md）。`rules/` に各形式の解説。
- `src/assets/`: 画像。命名は `rule-{内部名}-{状態}.webp`（例 `rule-nomx-default.webp`）。
- `astro.config.mjs`: サイドバーは **手動登録**（autogenerate ではない）。ページを足したら `items` に追記する。
- `authoring/`: ドキュメント生成のための作業資産（ビルド対象外）。
  - `authoring/fixtures/`: スクショ撮影用サンプルデータ（問題CSV・プレイヤーCSV）。
  - `authoring/screenshot-playbook.md`: **形式ドキュメント生成の手順書**。

## コマンド

```bash
pnpm run dev     # 開発サーバー :4321
pnpm run build   # astro check + build（リンク・frontmatter 検証）
pnpm run lint    # eslint --fix
```

## 形式ドキュメントを作るとき

ユーザーから形式名（例「nomx」「アタックサバイバル」）を指示されたら、
**`authoring/screenshot-playbook.md` の手順に必ず従う**こと。要点:

1. 撮影対象は別リポジトリのアプリ本体 `/Users/newt/projects/next-score-watcher`（`pnpm run dev` → :3000）。
2. ブラウザ操作は Playwright MCP（`.mcp.json` 登録済み）。撮影は専用プロファイル `docs_shooting` で行い本番データを汚さない。
3. 本文の一次ソースはアプリ側 `next-score-watcher/docs/rules/{内部名}.md` と `src/utils/rules.ts`。
4. スクショは PNG→webp 変換して `src/assets/rule-{内部名}-{状態}.webp` に保存。
5. ページ `src/content/docs/rules/{内部名}.mdx` を生成し、**`astro.config.mjs` の sidebar に都度追加**。
6. 最後に `pnpm run build` で検証。

## 規約

- 文章は日本語・丁寧な説明調。
- パッケージマネージャは pnpm（`preinstall` で強制）。
