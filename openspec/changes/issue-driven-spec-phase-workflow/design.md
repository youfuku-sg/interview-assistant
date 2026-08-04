## Context

`docs/仕様/Issue駆動開発フロー.md` §2・§4 が正の仕様。現行の `issue-propose.yml` は単一の自己ホスト（Windows）ジョブの中で PowerShell の `for` ループが Claude Code → Codex → qwen(Aider) を順番に呼び出し、各AIがブランチへ直接ファイル編集・commit する方式になっている。これを次の2点で作り直す。

1. spec フェーズ専用の `spec/<Issue番号>` ブランチに分離する（旧: `feature/<name>` 単一ブランチ）
2. 3AIのレビューを「別ジョブで並列に指摘収集 → Issue コメントへ投稿 → Claude Code が全コメントを読んで逐次反映」という方式に変える（旧: 1ジョブ内で順番に呼び出し、各AIが直接ファイルを編集）

この change は spec フェーズのみを対象とする。dev フェーズ・release 自動化・`claude.yml`/`codex.yml` の Issue コメント無効化は別 change。

## Goals / Non-Goals

**Goals:**
- Issue 起票から spec フェーズの検証専用 PR 作成までを GitHub Actions で自動化する
- 3AI（Claude Code・Codex・qwen）のレビューを本当の意味で並列実行する（1台の自己ホストランナーが逐次呼び出す現行方式からの脱却）
- レビューのやり取りを Issue コメントという人間にも見える場所に残す
- ループを GitHub Actions のネイティブな `push` トリガーの再帰で実現し、専用のポーリング/待機ロジックを持たない

**Non-Goals:**
- dev フェーズ・release フェーズの自動化（別 change）
- `@claude`/`@codex` 汎用メンショントリガーの制限（別 change）
- 3AI以外のレビュアー追加（将来の A2A 化は本 change の対象外）

## Decisions

### D1. ジョブ構成: レビュアーごとに別ジョブ、Issue コメント経由で合流

`spec-review.yml`(仮称) を新設し、`on: push: branches: ["spec/**"]` と `issues: opened`(初回のブランチ作成用)をトリガーにする。ジョブ構成:

```
create-branch-and-propose (Issue opened時のみ。self-hosted。Claude Codeが一次作成)
  ↓ (push to spec/<N>)
determine-round (ubuntu-latest。ラウンド数を計算、上限チェック)
  ├─ claude-review (ubuntu-latest, CLAUDE_CODE_OAUTH_TOKEN)   ┐
  ├─ codex-review  (ubuntu-latest, CODEX_AUTH_JSON)           ├─ 並列実行、各自 Issue コメント投稿
  └─ qwen-review   (self-hosted Windows, Aider+LM Studio)     ┘
       ↓ (needs: 上記3ジョブ)
synthesize (self-hosted。全コメント読了 → 全員AGREE or ラウンド上限なら何もしない/PR作成へ。それ以外はClaude Codeが逐次反映してpush)
       ↓ (pushがあれば同じワークフローを再トリガー、なければ↓へ)
create-pr (ubuntu-latest。base=main, head=spec/<Issue番号> のPRを作成。既存PRがあれば何もしない)
comment (ubuntu-latest。Issueへステータスコメント)
```

**代替案として検討したもの**: 1ジョブ内でバックグラウンドプロセスとして3AIを同時起動する案。GitHub Actions の1ジョブは1ランナー・1シェルなので、真の並列実行には `&`（バックグラウンド実行）とプロセス管理が必要になり複雑。別ジョブに分ければ GitHub Actions のジョブ並列実行をそのまま使えるため、こちらを採用した。

### D2. ラウンド管理: commit メッセージから逆算する（状態ファイルを持たない）

`synthesize` ジョブが提案を更新して commit する際、メッセージを `AI review round <N> (synthesis): <summary>` の形式に固定する。`determine-round` ジョブは `git log --oneline --grep="^AI review round "` の件数 + 1 を現在のラウンド番号とする。上限（3）を超えたら `synthesize` はファイルを編集せず push もしない。

**代替案**: 専用の状態ファイル（例 `openspec/changes/<name>/.review-state.json`）を持つ案も検討したが、commit ログから逆算する方式は追加の状態ファイルを持たずブランチの履歴だけで完結し、シンプルなため採用した。

### D3. AI 間の合意判定: Issue コメントに機械可読マーカーを埋め込む

各レビュージョブが投稿する Issue コメントの先頭に、レンダリングされない HTML コメントでラウンド番号とエージェント名を埋め込む:

```
<!-- ai-review round=2 agent=codex issue=11 -->
(レビュー本文)
VERDICT: AGREE
```

`synthesize` ジョブは `gh api repos/:owner/:repo/issues/:number/comments` で全コメントを取得し、`<!-- ai-review round=<現ラウンド> agent=(claude|codex|qwen) -->` にマッチする直近3件を今回のレビューとして扱う。3件とも `VERDICT: AGREE`（既存実装と同じく最後にマッチした `VERDICT:` 行を採用）であれば合意とみなす。

### D4. ランナー割り当て

| ジョブ | ランナー | 理由 |
| --- | --- | --- |
| `create-branch-and-propose` | self-hosted (Windows) | 既存 `claude` CLI のログイン済みセッションを再利用（現行踏襲） |
| `determine-round` | ubuntu-latest | git 履歴を読むだけで AI 呼び出しなし |
| `claude-review` | ubuntu-latest | `CLAUDE_CODE_OAUTH_TOKEN` で認証可能、ローカル資源不要 |
| `codex-review` | ubuntu-latest | `CODEX_AUTH_JSON` で認証可能、ローカル資源不要 |
| `qwen-review` | self-hosted (Windows) | Aider が `http://localhost:1234`(LM Studio) に接続する必要があり、ユーザーのマシン上でしか到達できない |
| `synthesize` | self-hosted (Windows) | 既存 `claude` CLI ログイン済みセッションを使い、提案ファイルの再編集・push を行う |
| `create-pr` / `comment` | ubuntu-latest | GitHub API 呼び出しのみ |

qwen(セルフホスト)と claude-review/codex-review(GitHubホスト)は別ランナーなので、3ジョブは互いにブロックせず並列に走る。

### D5. PR ゲート

`create-pr` は `base=main, head=spec/<Issue番号>` の PR を作成する。既存 `issue-implement.yml` の `pr` ジョブと同様、**自動マージしない**。PR 本文に「これはレビューゲートであり、承認は次の dev フェーズへ進んでよいという合図」である旨を明記する。既に同じ head branch の PR が存在する場合は作成をスキップする（ラウンドを重ねるたびに `create-pr` が誤って重複実行されないようにするため）。

## Risks / Trade-offs

- [Risk] 自己再帰トリガー（push → 同ワークフロー再実行）がバグると無限ループしうる → [Mitigation] `determine-round` でラウンド数を毎回計算し3で打ち切る。加えて `concurrency: group: spec-review-${{ github.event.issue.number || github.ref }}` を設定し、同一 Issue の多重実行を防ぐ
- [Risk] qwen(セルフホスト)がオフライン、または LM Studio 未起動の場合、`qwen-review` ジョブが失敗し `synthesize` が `needs` で待ち続ける → [Mitigation] 既存実装と同様 `qwen-review` は例外を握りつぶし「(qwen/Aider failed to run this round)」を Issue コメントとして投稿する。この場合 VERDICT は REQUEST_CHANGES 扱いとし、ジョブ自体は成功終了させる(`synthesize` がブロックされないようにする)
- [Risk] Issue コメントのマーカーパース(D3)が壊れると合意判定ができなくなる → [Mitigation] `synthesize` は3件のマーカーが見つからない場合、エラーとして Issue にコメントし人間に委ねる(無限に再試行しない)
- [Risk] 1台のセルフホストランナーに複数 Issue の `qwen-review`/`synthesize`/`create-branch-and-propose` が同時に来ると詰まる → [Mitigation] 個人利用規模では許容する既知の制約として明記するに留める(§8 未決事項と同様の位置づけ)

## Migration Plan

1. 新ワークフロー(`spec-review.yml` 相当、複数ファイルに分割される可能性あり)を追加する
2. 既存 `issue-propose.yml` を削除する(置き換え。ロールバックは git revert で復元可能)
3. 実際の Issue で試験運用し、`docs/仕様/Issue駆動開発フロー.md` §8 未決事項に記載の通り、動作確認しながら調整する

## Open Questions

- ワークフローファイルを1つにまとめるか、ジョブの性質(GitHubホスト/セルフホスト)ごとに分割するか
- `concurrency` グループの正確なキー設計(Issue番号ベースか、ブランチ名ベースか)
- Issue コメントのマーカー形式(`<!-- ai-review ... -->`)がユーザーの目に触れた際に見づらくならないか、要実運用確認
