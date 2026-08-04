## Why

`docs/仕様/Issue駆動開発フロー.md` を spec/dev 2 フェーズ構成に全面改訂した（2026-08-05）。旧来の単一 `feature/<name>` ブランチ + PowerShell 逐次ループ（`issue-propose.yml`）は、Issue #11 実装時に汎用 `@claude`/`@codex` メンショントリガーと混同されて事故を起こしたことの反省を踏まえて設計し直したものである。まずはドキュメントの spec フェーズ（4.1〜4.5）部分だけを実装し、実際の Issue で試してから dev フェーズ・release 自動化に進む。

## What Changes

- `spec/<Issue番号>` ブランチを起点とする spec フェーズを実装する。Issue 起票 → ブランチ作成 → OpenSpec 提案作成（Claude Code が一次作成）→ AI レビュー（Claude Code・Codex・qwen が並列で指摘、Claude Code が逐次反映、最大 3 ラウンド）→ 検証専用 PR（base=main、マージしない）→ Issue へのステータスコメント、までを自動化する
- AI レビューの実行方式を変更する: 参加する 3 AI を別々のジョブに分離し、各 AI の指摘を Issue コメントとして投稿する（`codex.yml` で既に実証済みのパターンを流用）。Claude Code の再編集ジョブが全コメントを読んで提案ファイルを更新し、`spec/<Issue番号>` へ push する。この push が同じワークフローを再トリガーし、次ラウンドが自然に始まる（3 AI 合意または 3 ラウンド到達で新たな push が発生しなくなり、ループが自己終端する）
- ランナー割り当てを見直す: Claude Code・Codex のジョブは GitHub ホストランナー（`ubuntu-latest`）で動かす（`CLAUDE_CODE_OAUTH_TOKEN`・`CODEX_AUTH_JSON` の既存 secret を使用）。qwen（Aider 経由、ローカル LM Studio 接続）のジョブのみ既存のセルフホスト（Windows）ランナーを使う
- 既存 `.github/workflows/issue-propose.yml`（単一ブランチ版の提案+レビュー実装）を置き換える

**対象外（別 change で後日実施）**:
- dev フェーズ（実装、`docs/仕様/Issue駆動開発フロー.md` §5）
- release フェーズの自動化（`release/v<version>` 分岐・バージョン更新・タグ push トリガーのビルド自動化）
- `claude.yml`/`codex.yml` の Issue コメントトリガー無効化（PR コメント限定化）

## Capabilities

### New Capabilities
- `issue-driven-spec-phase`: Issue 起票から spec フェーズ完了（検証専用 PR 作成）までを GitHub Actions で自動化する一連のワークフロー。3 AI（Claude Code・Codex・qwen）による並列レビュー・Issue コメント経由の合議・自己終端ループの仕組みを含む

### Modified Capabilities
（既存 spec に spec レベルの要求変更なし。`ci-lint-workflow`・`installer-release-workflow` は本 change では変更しない）

## Impact

- 新規/変更ファイル: `.github/workflows/issue-propose.yml`（置き換え）、新規ワークフロー分割（提案作成ジョブ、Claude/Codex/qwen 各レビュージョブ、再編集ジョブ、PR 作成ジョブ、コメントジョブ）
- 影響する既存 secret: `CLAUDE_CODE_OAUTH_TOKEN`、`CODEX_AUTH_JSON`（いずれも導入済み）
- 影響するランナー: GitHub ホスト（`ubuntu-latest`）とセルフホスト（Windows、qwen/Aider/LM Studio 用）の両方
- `docs/仕様/Issue駆動開発フロー.md` §4（spec フェーズ）が正となる仕様。本 change のタスクはこの節から逆算する
