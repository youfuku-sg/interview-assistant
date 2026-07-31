---
type: 運用ランブック
title: 開発、リリース、プライバシーのランブック
description: ローカル開発、静的チェック、Tauri パッケージング、リリースブランチ、権限、テレメトリー、ローカルの機密データに関する実用的なコマンドと注意事項。
tags: [operations, release, privacy, tauri, runbook]
---

# 開発、リリース、プライバシーのランブック

## ローカル開発

前提条件は Node.js 18 以降、安定版 Rust、npm または yarn、および Tauri に必要な OS 依存関係（Linux の WebKitGTK など）です。一般的なコマンドは次のとおりです。

```bash
npm install
npm run tauri dev
npm run tauri build
```

パッケージ化された成果物は `src-tauri/target/release/bundle/` 以下に出力されます。リリースブランチとタグの規約は `docs/仕様/ブランチ・リリース戦略.md` に記載されています。現在のリポジトリのバージョンは、`package.json` によると `0.5.18` です。

## CI とリリースチェック

`.github/workflows/ci.yml` は Ubuntu 上で `npm ci`、`npm run typecheck`、`npm run lint` を実行し、さらに Windows では Rust の `cargo fmt --check` と `cargo clippy` を実行します。タグの公開時には、まずタグのコミットが `origin/main` の祖先であることを検証し、その後、ドラフトリリースとして Windows インストーラーをビルドします。このワークフローではアップデーター JSON を公開せず、現在のところ macOS または Linux の成果物もビルドしません。この動作を変更する場合は、`docs/仕様/CI.md` と `docs/仕様/ブランチ・リリース戦略.md` も同時に変更してください。

## OpenWiki の自動更新

`.github/workflows/openwiki-update.yml` は手動実行または毎日 08:00 UTC のスケジュールで `ubuntu-latest` 上の OpenWiki 更新を実行します。Node.js 22 をセットアップし、`openwiki@0.2.5` と Mermaid 検証用の `mermaid@11.16.0`、`jsdom@29.1.1` をインストールしたうえで `openwiki code --update --print` を呼び出します。更新後は `openwiki/update` ブランチに `openwiki` などを含むプルリクエストを自動作成します。

このジョブには OpenRouter の `OPENROUTER_API_KEY` が必要です。LangSmith のコードモード取得を使う設定では `OPENWIKI_LANGSMITH_API_KEY` も必要で、実行自体のトレースを有効にする場合は `LANGSMITH_API_KEY`、`LANGCHAIN_PROJECT`、`LANGCHAIN_TRACING_V2` が使われます。これらは GitHub Actions の secrets と環境変数で管理し、値をリポジトリや Wiki に記録しないでください。ワークフローの権限は `contents: write` と `pull-requests: write` なので、生成された PR をレビューしてから取り込む運用にします。

## プライバシーと運用上の危険

会話データと設定はローカルに保持される想定ですが、設定された AI/STT 呼び出しによってデバイス外へ送信されます。サポートされている環境では秘密情報の保管にセキュアストレージを使用します。キーを出力したり、`.env` ファイルを調査したりしてはいけません。`src-tauri/src/lib.rs` では、任意の `POSTHOG_API_KEY` を使用して PostHog プラグインを初期化する処理が依然として存在します。一方、プロダクトドキュメントでは、今後の整理が必要な上流テレメトリーおよびライセンス関連のコードについて記載されています。「ローカルファースト」と「テレメトリーなし」は異なる主張として扱ってください。また、秘密情報の取り扱いを完全にキーチェーン対応としてドキュメント化する前に、実装を実際に確認してください。`src-tauri/src/api.rs` にはライセンス関連の永続化コードがあり、エンドツーエンドのセキュリティレビューが必要です。

音声キャプチャには OS の権限が必要であり、クリーンアップが壊れている場合は、ネイティブキャプチャやプロバイダー処理が実行中のまま残る可能性があります。デバッグ時は、権限の状態、キャプチャの状態、プロバイダーの応答、アボートの動作をこの順序で確認してください。未追跡の `001-sibutomo.mp3` をプロダクトの動作の証拠として使用したり、明示的なデータ取り扱いの決定なしにコミットしたりしないでください。

[テストに関するガイダンス](../testing/testing-guidance.md) には、キャプチャ、プロバイダー、永続化、リリースの変更に関するチェック項目が記載されています。[ランタイムアーキテクチャ](../architecture/overview.md) では対象 OS でのテストが引き続き必要な理由を説明し、[プロバイダーとキャプチャ](../integrations/providers-and-capture.md) ではネットワークと権限の境界について説明しています。