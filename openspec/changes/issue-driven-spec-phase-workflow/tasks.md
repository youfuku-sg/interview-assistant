## 1. 共通基盤

- [ ] 1.1 新ワークフローファイル（例: `.github/workflows/issue-spec-phase.yml`）を作成する。`on: issues: [opened]` と `on: push: branches: ["spec/**"]` の両方をトリガーにする
- [ ] 1.2 `concurrency: group: spec-review-${{ github.event.issue.number }}` (または相当のキー) を設定し、同一 Issue に対する多重実行を防ぐ
- [ ] 1.3 Issue コメントのレビューマーカー形式 `<!-- ai-review round=<N> agent=<claude|codex|qwen> issue=<Issue番号> -->` を各ジョブで共通利用できる形（テンプレート文字列 or 共通スクリプト）で用意する
- [ ] 1.4 ラウンド番号算出ロジック（`git log --oneline --grep="^AI review round "` の件数 + 1）を `determine-round` ジョブとして実装する。上限 3 を超えたら以降のレビュージョブを起動しない

## 2. spec ブランチ作成 + OpenSpec 提案作成

- [ ] 2.1 `create-branch-and-propose` ジョブ（self-hosted, Windows）を実装する。`main` から `spec/<Issue番号>` を作成し push する
- [ ] 2.2 同ジョブ内で Claude Code に OpenSpec 提案（`openspec new change`、proposal/design/tasks、必要なら specs 差分）を一次作成させ、`spec/<Issue番号>` へコミットする（既存 `issue-propose.yml` の該当プロンプトを踏襲・移植する）
- [ ] 2.3 提案作成後 `git push` する（この push が後続の `determine-round` を起動する）

## 3. AI レビュー（並列ジョブ）

- [ ] 3.1 `claude-review` ジョブ（ubuntu-latest, `CLAUDE_CODE_OAUTH_TOKEN`）を実装する。`spec/<Issue番号>` の現在の提案内容を読み、指摘を 1.3 のマーカー形式で Issue コメントとして投稿する。ファイルは編集しない
- [ ] 3.2 `codex-review` ジョブ（ubuntu-latest, `CODEX_AUTH_JSON`）を実装する。3.1 と同様の内容を Codex で行う
- [ ] 3.3 `qwen-review` ジョブ（self-hosted, Windows, Aider + LM Studio）を実装する。既存 `issue-propose.yml` の Aider セットアップ手順（Python 3.12 インストール、`aider-chat` インストール）を移植する。3.1 と同様の内容を qwen で行う
- [ ] 3.4 qwen 呼び出しが失敗した場合に例外を握りつぶし、「(qwen/Aider failed to run this round)」を投稿したうえでジョブを成功終了させるフォールバックを実装する（既存実装のフォールバックを踏襲）
- [ ] 3.5 3 ジョブとも `needs: determine-round` のみとし、互いに `needs` を持たせず並列実行させる

## 4. レビュー集約・反映（synthesize）

- [ ] 4.1 `synthesize` ジョブ（self-hosted, Windows）を実装する。`needs: [claude-review, codex-review, qwen-review]` とする
- [ ] 4.2 `gh api` で Issue の全コメントを取得し、現在のラウンドに対応する 3 件（claude/codex/qwen）のマーカー付きコメントを抽出するロジックを実装する。3 件揃わない場合はエラーとして Issue にコメントし、以降の処理を止める
- [ ] 4.3 各コメント本文から最後に出現する `VERDICT: (AGREE|REQUEST_CHANGES)` を抽出する（既存 `Get-Verdict` 相当のロジックを移植）
- [ ] 4.4 3 件全てが `AGREE` の場合、ファイルを編集せず push もしないで正常終了する
- [ ] 4.5 3 件のいずれかが `REQUEST_CHANGES` かつラウンド ≤ 3 の場合、Claude Code に 3 AI 分の指摘を渡して提案ファイルを更新させ、`AI review round <N> (synthesis): <summary>` の commit メッセージでコミットし `spec/<Issue番号>` へ push する
- [ ] 4.6 ラウンドが 3 に達していて合意なしの場合、ファイルを編集・push せず、未合意である旨を後続ステップに伝える出力（`GITHUB_OUTPUT`）を設定する

## 5. PR 作成・ステータス通知

- [ ] 5.1 `create-pr` ジョブ（ubuntu-latest）を実装する。`synthesize` の出力（合意 or 上限到達）を条件に起動する
- [ ] 5.2 `gh pr list` 等で `head=spec/<Issue番号>` の既存 PR の有無を確認し、なければ `base=main, head=spec/<Issue番号>` の PR を作成する。本文にレビューゲートである旨・自動マージしない旨・未合意の場合はその旨を明記する
- [ ] 5.3 `comment` ジョブ（ubuntu-latest）を実装する。Issue にラウンド数・合意状況・PR リンクを含むステータスコメントを投稿する（既存 `issue-propose.yml` の `comment` ジョブを踏襲）

## 6. 既存ファイルの整理

- [ ] 6.1 既存 `.github/workflows/issue-propose.yml` を削除する（新ワークフローに置き換え）
- [ ] 6.2 `docs/仕様/Issue駆動開発フロー.md` の該当ワークフローファイル名への言及があれば整合させる

## 7. 検証

- [ ] 7.1 実際に GitHub Issue を 1 件起票し、spec ブランチ作成 → 3AI 並列レビュー → Issue コメント投稿 → 合意 or 上限到達 → PR 作成、まで一連の流れが動作することを確認する
- [ ] 7.2 qwen(Aider/LM Studio)が意図的に応答しない状態でも、他の 2AI の結果でループが止まらず進行することを確認する
- [ ] 7.3 3 ラウンドで合意に至らないケースを作り、無限ループにならず PR が作成されることを確認する
