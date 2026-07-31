---
type: テストガイド
title: テストと変更に関するガイダンス
description: リポジトリで利用可能な静的チェックと、フロントエンド、Rust コマンド、音声キャプチャ、永続化、プロバイダー、リリースを対象とした変更指向の検証マトリクスを提供します。
tags: [testing, ci, lint, typecheck, rust]
---

# テストと変更に関するガイダンス

現在のソースインベントリには、専用のユニットテストスイートは見当たりません。信頼性は主に、TypeScript のコンパイル、ESLint、Rust のフォーマットと Clippy、対象デスクトップ環境での手動チェック、および最近の製品変更に関する OpenSpec の受け入れ記録によって確認します。

## 必須の静的チェック

```bash
npm run typecheck
npm run lint
cd src-tauri
cargo fmt --check
cargo clippy
```

CI では、フロントエンドのチェックを Ubuntu 上で、Rust のチェックを Windows 上で実行します。これは、バックエンドに Windows 固有のコードが含まれているためです。Clippy の警告は報告されますが、失敗として扱う設定にはなっていません。一方、typecheck、lint のエラー、およびフォーマットの失敗はジョブを失敗させます。リリースまたは Tauri の設定を変更する場合は、`npm run tauri build` によるパッケージングも別途確認してください。

## 変更マトリクス

| 変更した領域 | 最低限の検証 |
| --- | --- |
| React のルート、コンポーネント、フック | `npm run typecheck`、`npm run lint` を実行し、その後、影響を受けるルートまたはオーバーレイを手動で操作する |
| Tauri コマンドのシグネチャまたは登録 | フロントエンドのチェック、`cargo fmt --check`、`cargo clippy`、およびエンドツーエンドのデスクトップ呼び出し |
| 音声、VAD、権限、またはネイティブキャプチャ | Rust のチェックに加え、対象 OS での権限拒否からの復旧、デバイス選択、開始/停止、連続モード、アンマウント時のクリーンアップ |
| SQLite のマイグレーションまたは保存ロジック | Rust のチェックに加え、会話と添付ファイルの作成、更新、削除に関するリグレッションチェック |
| プロバイダーのテンプレートまたはストリーミング | TypeScript のチェックに加え、設定済みの代表的なプロバイダー、エラー、アボート、非ストリーミングのケース |
| リリース設定またはワークフロー | 静的チェックに加え、対象環境での `npm run tauri build` と `docs/仕様/CI.md` のレビュー |

## 動作に関する証拠

最新のトランスクリプト作業は、`openspec/specs/stt-session-transcript/spec.md` と `openspec/specs/top-bar-transcription-panel/spec.md` に規定されており、進行中の設計とタスクは `openspec/changes/top-bar-transcript-summary-panel/` にあります。累積トランスクリプト、要約、またはトップバーの動作を変更する場合は、これらの仕様を受け入れ基準として使用してください。スクリーンショットやコンポーネント名だけに依存しないでください。

[音声と文字起こしのワークフロー](../workflows/audio-and-transcription.md) は、[ランタイムアーキテクチャ](../architecture/overview.md) のコマンド構成に依存しています。一方、永続化に関する変更は、[ローカルデータと設定](../domain/data-and-settings.md) に関連付けてください。[開発、リリース、プライバシー](../operations/release-and-privacy.md) には、提供上の制限が記録されています。現在の CI では、ハードウェア権限、画面キャプチャ、マイグレーション、プロバイダーのコントラクト、パッケージ化されたインストール、エンドツーエンドの UI 動作はカバーされていません。