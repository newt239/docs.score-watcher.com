# 形式ドキュメント生成 playbook

このドキュメントは、Score Watcher の各「形式（ルール）」について、**スクリーンショット込みの完全な操作ドキュメント**を Playwright MCP を使って安定再現的に生成するための手順書です。
ユーザーから「`nomx` の形式ドキュメントを作って」のように形式名を指示されたら、この手順に従って 1 ページを生成します。

---

## 0. 前提と環境

| 項目 | 値 |
| --- | --- |
| 撮影対象アプリ（本番） | Score Watcher 本番サイト → `https://score-watcher.com/` |
| テキスト一次ソース | アプリ本体リポジトリ `next-score-watcher`（各自のクローン先。`docs/rules/*.md`・`src/utils/rules.ts`） |
| ドキュメント | このリポジトリ（Astro Starlight） → `http://localhost:4321` |
| ブラウザ操作 | Playwright MCP（`.mcp.json` に登録済み。**Claude Code 再起動でロードされる**） |
| 撮影専用プロファイル | `docs_shooting`（自分の本番プロファイルのデータを汚さないため） |
| サンプル問題CSV | `authoring/fixtures/quiz-sample.csv`（ヘッダー無し3列 `番号,問題文,答え`・100問） |
| サンプルプレイヤーCSV | `authoring/fixtures/players-sample.csv`（`氏名,説明,所属`・5名固定） |
| 問題セット名 | `docs-sample`（取り込み時に入力する固定名） |

### サーバー起動（ドキュメントのプレビュー用）

撮影対象は本番サイト `https://score-watcher.com/` を直接開くため、アプリ本体をローカルで起動する必要はありません。生成結果のプレビューだけ、このリポジトリで起動します。

```bash
# このリポジトリのルートで（生成結果のプレビュー）
pnpm install && pnpm run dev   # :4321
```

> 本番サイトには開発用のフローティングボタン等は表示されないため、撮影前は §3 のアニメーション無効化だけ適用すれば十分です。

---

## 1. 形式名 → 内部名 対応表

指示された形式名を、アプリ内部のルールキー（`/rules` の「作る」対象・mdx ファイル名・アセット名に使う）へ変換します。正準はアプリ本体リポジトリ（`next-score-watcher`）の `src/utils/rules.ts`。

| 表示名 | 内部名（キー） | デフォルト設定 | 固有オプション |
| --- | --- | --- | --- |
| スコア計算 | `normal` | — | なし |
| N○M✕ | `nomx` | win_point 7 / lose_point 3 | なし |
| 連答つきN○M✕ | `nomx-ad` | win 7 / lose 3 | `streak_over3`(初期true) |
| NewYork（NY） | `ny` | win_point 10 | なし |
| N○M休 | `nomr` | win 7 / lose 3 | なし |
| NbyN | `nbyn` | win 5 / lose 5 | なし |
| Nupdown | `nupdown` | win 5 / lose 2 | なし |
| Divide | `divide` | win 100 / correct_me 10 | なし |
| Swedish10 | `swedish10` | win 10 / lose 10 | なし |
| Backstream | `backstream` | win 10 / lose -10 | なし |
| アタックサバイバル | `attacksurvival` | 初期15 / 勝抜3 / 自正0 自誤-2 他正-1 他誤0 | なし |
| SquareX | `squarex` | win_point(X) 16 | なし |
| Z | `z` | — | なし |
| freezeX | `freezex` | win_point 7 | なし |
| エンドレスチャンス | `endless-chance` | win 7 / lose 3 | `use_r`(初期false) |
| Variables | `variables` | win_point 30 | プレイヤーごと変動値N |
| AQL | `aql` | — | `left_team`/`right_team` |
| アタック25 | `attack25` | — | `attack_chance`(初期true) |

---

## 2. 初回データ投入（プロファイル `docs_shooting`・初回セッションのみ）

IndexedDB はブラウザに永続するため、一度投入すれば同一プロファイルでは再投入不要です（ただしオリジンごとに別管理なので、本番サイトには本番サイト上で投入する必要があります）。

1. 本番サイト（`https://score-watcher.com/`）を開く。
2. 撮影専用プロファイルに切替（Playwright MCP の `browser_evaluate` で）:
   ```js
   () => { localStorage.setItem('scorew_current_profile', JSON.stringify('docs_shooting')); location.reload(); }
   ```
   （プロファイルキーは `next-score-watcher/src/utils/current-profile.ts` の `scorew_current_profile`。値は JSON 文字列で保存される。）
3. プレイヤー投入: `/players` → 「インポート」タブ → `authoring/fixtures/players-sample.csv` をアップロード（または貼り付け）→ 追加。5名（あかね/みどり/しろう/あおい/きいろ）が登録される。
4. 問題投入: `/quizes` → セット名に `docs-sample` を入力 → 「インポート」タブ → `authoring/fixtures/quiz-sample.csv` をアップロード → 追加。

---

## 3. 撮影共通設定（毎セッション）

撮影の直前に Playwright MCP で実行する固定設定：

1. ビューポート固定: `browser_resize` 1280 × 800。
2. アニメーション無効化（`browser_evaluate`）:
   ```js
   () => {
     const s = document.createElement('style');
     s.textContent = `*{transition:none!important;animation:none!important}`;
     document.head.appendChild(s);
   }
   ```
3. 撮影は原則フルページ（`browser_take_screenshot` の fullPage）。ボードの一部だけ欲しい場合は要素指定。
4. 状態を作る操作は **キーボードショートカット**で決定的に行う（座標クリック依存を避ける）:
   - 数字キー `1`〜`9`,`0`: そのプレイヤーを **正解**
   - `Shift`+数字キー: そのプレイヤーを **誤答**
   - `.`（ピリオド）: スルー
   - `,`（カンマ）または `Ctrl+Z`: 一つ戻す

---

## 4. ゲーム作成 → ボード到達のUI操作

1. `/rules` を開く。
2. 対象形式（表示名）のカードの **「作る」** ボタンをクリック → `/games/{game_id}/config` に遷移。
3. config 画面:
   - **問題セット**: 「形式設定」内で問題セット `docs-sample` を選択。
   - **プレイヤー**: 「プレイヤー設定」タブ → 「プレイヤーを選択」→ 既存の5名を選択して追加（attack25 は4名、aql は10名など形式の要求人数に合わせる。§6参照）。
   - **形式固有オプション**: §1 のデフォルトで基本OK。特定状態を見せたい場合のみ変更。
4. （`config` 状態のスクショが必要ならここで撮影）
5. **「ゲーム開始」** ボタン → `/games/{game_id}/board` に遷移。

---

## 5. 撮影バリエーションの作り方（共通レシピ）

各形式について、最低限 `default` を撮り、形式特性に応じて追加します。命名は `rule-{内部名}-{状態}.webp`。

| 状態 | 作り方 | 撮る形式 |
| --- | --- | --- |
| `default` | board 到達直後そのまま | 全形式（必須） |
| `config` | `/games/{id}/config` で固有オプション欄が見える状態 | 固有オプションのある形式中心 |
| `playing` | 数字キーで数問正解・`Shift`+数字で誤答を入れた進行中 | 全形式（推奨） |
| `win` | 1人が勝ち抜け条件を満たすまで正解（例 nomx は同じ数字キーを7回） | 勝ち抜け概念のある形式 |
| `lose` | 1人が失格条件を満たすまで誤答（例 nomx は `Shift`+同じ数字を3回） | 失格概念のある形式 |

> 勝敗概念の無い `normal`（スコア計算）は `default` のみで可。
> `attack25` は盤面が埋まる `playing`、`aql` はチームスコア表示の `playing` を重視。

### 形式別レシピ例（nomx）

- config: デフォルト（win 7 / lose 3）のまま。
- `default`: board 到達直後。
- `playing`: `1` `2` `1` `3`（あかね2正解, みどり1正解, しろう1正解）→ 撮影。
- `win`: `1` を7回 → あかね勝ち抜け（金色・順位表示）→ 撮影。
- `lose`: `Shift+2` を3回 → みどり失格（グレーアウト・LOSE表示）→ 撮影。

他形式は §1 のルール（rules.ts）と `next-score-watcher/docs/rules/{内部名}.md` の計算ロジックを読み、勝ち抜け/失格に必要な操作回数を導出する。

---

## 6. 形式ごとの必要人数・特記

- 通常形式: 5名（サンプルそのまま）。
- `attack25`: 4名（盤面 5×5）。
- `aql`: 10名・2チーム（`left_team`/`right_team`）。プレイヤー追加時にチーム割当を確認。
- `variables`: プレイヤーごとに変動値Nを設定するUIがあるため、config/プレイヤー設定でNを見せる。

---

## 7. PNG → WebP 変換とアセット保存

Playwright MCP は PNG を出力します。`src/assets/` には webp で保存します（既存資産が webp）。

```bash
# 例: cwebp（Homebrew: brew install webp）
cwebp -q 85 /tmp/rule-nomx-default.png -o src/assets/rule-nomx-default.webp
# または sharp（このリポジトリは sharp 同梱）
npx --yes sharp-cli -i /tmp/rule-nomx-default.png -o src/assets/rule-nomx-default.webp
```

- 保存先: `src/assets/rule-{内部名}-{状態}.webp`
- mdx からの参照: `../../../assets/rule-{内部名}-{状態}.webp`（`src/content/docs/rules/` からの相対）

---

## 8. mdx 本文の生成

`src/content/docs/rules/{内部名}.mdx` を以下テンプレートで作成/更新します。本文はアプリ本体リポジトリ（`next-score-watcher`）の `docs/rules/{内部名}.md`（詳細仕様）と `src/utils/rules.ts`（表示名・初期値）から要約転記します。共通操作は同リポジトリの `docs/common-operations.md` を元に、重複を避けて要点のみ＋リンクで案内。

```mdx
---
title: {rules.ts の name}
description: {short_description を80字以内に}
---

{概要：short_description + description を 1〜2 段落に展開}

## ルール詳細

（勝利条件 / 失格条件 / スコア計算の要点を平易に。docs/rules/{内部名}.md の「基本ルール」「計算ロジック」を要約）

## 変更可能なオプション

### {オプション名（例: 勝ち抜け正解数）}

{初期値と意味・入力範囲。docs/rules/{内部名}.md の「設定可能パラメータ」参照。
 オプションが無い形式は「この形式に固有の設定オプションはありません。」と記載}

### 限定問題数の設定

出題する問題数を制限できます（共通設定）。

## 操作手順

1. [形式一覧](/rules/)で「{name}」の「作る」をクリックします。
2. プレイヤーと問題セットを設定します（詳しくは[最初のゲームを作ろう](/guides/example/)）。
3. 得点表示画面で、各プレイヤーの正解／誤答ボタン（またはキーボードの数字キー／Shift＋数字キー）で採点します。

## スクリーンショット

### 初期状態

![{name}の得点表示画面（初期状態）](../../../assets/rule-{内部名}-default.webp)

### プレイ中

![{name}のプレイ中の様子](../../../assets/rule-{内部名}-playing.webp)

（勝ち抜け・失格・設定画面など、撮影したバリエーションぶん見出しと画像を追加）
```

---

## 9. sidebar 登録（生成のたび追加）

`astro.config.mjs` の `label: '形式'` セクションの `items` 配列に、生成した形式の行を追加します（既にあれば不要）。順序は `rules.ts` の定義順に合わせると差分が見やすい。

```js
{ label: '{name}', link: 'rules/{内部名}' },
```

---

## 10. 検証

```bash
# このリポジトリのルートで
pnpm run build   # astro check 込み。リンク切れ・画像・frontmatter を検証
```

- `:4321/rules/{内部名}` を開き、画像が表示され文章が読めることを目視確認。

---

## 生成チェックリスト（1形式ぶん）

- [ ] 形式名 → 内部名 を §1 で確定
- [ ] （初回のみ）プロファイル `docs_shooting` にプレイヤー・問題を投入
- [ ] 撮影共通設定（resize / Dev Tools 非表示 / アニメ無効）を適用
- [ ] `default` ＋ 形式特性に応じたバリエーションを撮影
- [ ] PNG → webp 変換し `src/assets/rule-{内部名}-{状態}.webp` に保存
- [ ] `src/content/docs/rules/{内部名}.mdx` をテンプレで生成
- [ ] `astro.config.mjs` sidebar に追加
- [ ] `pnpm run build` 成功・プレビュー目視
