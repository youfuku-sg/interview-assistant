## ADDED Requirements

### Requirement: Issue 起票で spec ブランチが自動作成される
GitHub Issue が新規作成されたとき、GitHub Actions は `main` から `spec/<Issue番号>` ブランチを作成し、Claude Code が一次作成者として `openspec/changes/issue-<Issue番号>-<name>/` に OpenSpec 提案（proposal/design/tasks、必要な場合は specs 差分）を作成しなければならない (SHALL)。

#### Scenario: Issue 起票でブランチと提案が作成される
- **WHEN** GitHub Issue が新規に opened される
- **THEN** `spec/<Issue番号>` ブランチが `main` から作成され、Claude Code が作成した OpenSpec 提案がそのブランチにコミットされる

### Requirement: AI レビュー(提案)は Claude Code・Codex・qwen を別ジョブで並列実行する
`spec/<Issue番号>` への push をトリガーに、Claude Code・Codex・qwen(Aider 経由のローカル LLM) それぞれのレビュージョブが `needs` による依存関係なしに並列実行されなければならない (SHALL)。各ジョブは同一ブランチのファイルを直接編集してはならず (SHALL NOT)、レビュー結果を GitHub Issue のコメントとして投稿しなければならない (SHALL)。

#### Scenario: 3AI のレビューが並列に実行される
- **WHEN** `spec/<Issue番号>` に OpenSpec 提案の commit が push される
- **THEN** Claude Code・Codex・qwen のレビュージョブが同時に起動し、互いの完了を待たずに実行される

#### Scenario: レビュージョブはファイルを編集しない
- **WHEN** Claude Code・Codex・qwen のいずれかのレビュージョブが提案内容に問題を見つける
- **THEN** そのジョブは `openspec/changes/` 配下のファイルを編集せず、指摘内容を Issue コメントとして投稿するのみを行う

### Requirement: レビューコメントには機械可読なラウンド・エージェント識別子を含む
各 AI のレビュージョブが投稿する Issue コメントは、後続の集約処理が機械的に識別できるよう、ラウンド番号とエージェント名を含む識別子（例: `<!-- ai-review round=<N> agent=<claude|codex|qwen> -->`）をコメント本文の先頭に含めなければならない (SHALL)。コメントの末尾には `VERDICT: AGREE` または `VERDICT: REQUEST_CHANGES` のいずれか一方を含めなければならない (SHALL)。

#### Scenario: レビューコメントにラウンドとエージェントが識別できる
- **WHEN** Codex のレビュージョブが 2 ラウンド目のレビューを Issue コメントとして投稿する
- **THEN** コメント本文からラウンド番号が 2、エージェントが codex であることが機械的に判定できる

#### Scenario: 複数の VERDICT 記述がある場合は最後の記述を採用する
- **WHEN** レビューコメント本文中に `VERDICT: REQUEST_CHANGES` と `VERDICT: AGREE` の両方の文字列が含まれる(モデルが思考過程で両方に言及した場合)
- **THEN** 集約処理はコメント中で最後に出現した `VERDICT:` の値を、そのラウンドにおけるそのエージェントの最終判定として採用する

### Requirement: 全 AI 合意まで最大 3 ラウンドまで指摘収集・反映をループする
Claude Code は、同一ラウンドの Claude Code・Codex・qwen 3 件のレビューコメントが揃った後、提案ファイルへの反映を行わなければならない (SHALL)。反映は 1 体（Claude Code）が逐次的に行い、複数エージェントが同時に同一ブランチへ書き込んではならない (SHALL NOT)。このレビュー・反映サイクルは、3 AI 全てのその時点の最新コメントが `VERDICT: AGREE` になるか、ラウンド数が 3 に達するまで繰り返されなければならない (SHALL)。3 ラウンドに達しても合意に至らない場合、それ以上ファイルを編集・push してはならない (SHALL NOT)。

#### Scenario: 合意に至るまでループする
- **WHEN** ラウンド 1 で Codex が `VERDICT: REQUEST_CHANGES` を返す
- **THEN** Claude Code は Codex を含む全指摘を反映して `spec/<Issue番号>` へ push し、これがラウンド 2 のレビューを再トリガーする

#### Scenario: 3AI 合意でループが終了する
- **WHEN** あるラウンドで Claude Code・Codex・qwen の 3 件全てが `VERDICT: AGREE` である
- **THEN** Claude Code は提案ファイルを編集せず、ループはそれ以上 push を発生させずに終了する

#### Scenario: 上限ラウンドで合意なく終了する
- **WHEN** 3 ラウンド目のレビューでも 3 AI 全ての合意が得られない
- **THEN** Claude Code はそれ以上ファイルを編集・push せず、後続の PR 作成ステップに未合意である旨とともに進む

### Requirement: レビュー・反映ループは push イベントの再帰によって進行する
ラウンドの進行は、専用のポーリングや待機ループを持つ単一ジョブではなく、Claude Code による反映 commit の push が同一ワークフローを再トリガーすることによって実現しなければならない (SHALL)。ラウンド番号は `spec/<Issue番号>` ブランチの commit 履歴から算出しなければならない (SHALL)。

#### Scenario: push がワークフローを再トリガーする
- **WHEN** Claude Code がラウンド 1 の指摘を反映した commit を `spec/<Issue番号>` へ push する
- **THEN** その push が `spec-review` ワークフローを再度起動し、ラウンド 2 のレビュージョブが開始する

#### Scenario: push がない場合は再トリガーされない
- **WHEN** あるラウンドで 3 AI 全てが合意し、Claude Code が新たな commit を push しない
- **THEN** ワークフローは再トリガーされず、ループはそのラウンドで終了する

### Requirement: qwen レビューはセルフホストランナー、Claude Code・Codex レビューは GitHub ホストランナーで実行する
qwen のレビュージョブは、ローカル LM Studio（`http://localhost:1234`）への接続を必要とするため、セルフホストランナー上で実行しなければならない (SHALL)。Claude Code・Codex のレビュージョブは、ローカル資源への依存がないため GitHub ホストランナー上で実行してよい (MAY)。

#### Scenario: qwen レビューはセルフホストで実行される
- **WHEN** qwen のレビュージョブが起動する
- **THEN** セルフホスト(Windows)ランナー上で実行され、ローカルの LM Studio に接続してレビューを行う

#### Scenario: Claude Code・Codex レビューは GitHub ホストで実行される
- **WHEN** Claude Code または Codex のレビュージョブが起動する
- **THEN** GitHub ホストランナー(`ubuntu-latest`)上で、既存の `CLAUDE_CODE_OAUTH_TOKEN` または `CODEX_AUTH_JSON` を用いて認証し実行される

### Requirement: spec フェーズの完了時にレビューゲート専用の PR を作成する
AI レビューループが合意または上限ラウンドで終了した後、GitHub Actions は `base=main`, `head=spec/<Issue番号>` の Pull Request を作成しなければならない (SHALL)。この PR は自動でマージしてはならない (SHALL NOT)。同一の head ブランチに対して既に開いている PR が存在する場合、重複して作成してはならない (SHALL NOT)。

#### Scenario: レビュー完了後に検証用 PR が作成される
- **WHEN** spec フェーズの AI レビューループが終了する
- **THEN** `base=main, head=spec/<Issue番号>` の PR が作成され、自動マージはされない

#### Scenario: 既存 PR がある場合は再作成しない
- **WHEN** `spec/<Issue番号>` に対する PR が既に開いている状態でループがもう一周した場合
- **THEN** 新しい PR は作成されず、既存の PR がそのまま維持される
