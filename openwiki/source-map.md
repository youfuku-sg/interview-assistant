---
type: ソースマップ
title: インタビュー・パイロットのソースマップ
description: 主な製品上の関心領域から、それらを定義するリポジトリファイル、仕様、運用ドキュメントへのナビゲーションマップです。
tags: [source-map, navigation, repository]
---

# ソースマップ

編集前に、最小限の権威ある範囲を選択するためにこのマップを使用してください。生成された Wiki ページは動作を要約したものであり、実装および受け入れ条件の詳細については、ソースと OpenSpec が引き続き権威となります。

| 領域 | 主なソースアンカー | 関連概念 |
| --- | --- | --- |
| アプリケーションのエントリーポイントとルート | `src/main.tsx`、`src/routes/index.tsx`、`src/pages/index.ts` | [ランタイムアーキテクチャ](architecture/overview.md) |
| オーバーレイとダッシュボードのレイアウト | `src/pages/app/`、`src/layouts/`、`src/pages/dashboard/` | [ランタイムアーキテクチャ](architecture/overview.md) |
| 共有状態とプロバイダー UX | `src/contexts/`、`src/hooks/`、`src/config/`、`src/pages/settings/`、`src/pages/dev/` | [プロバイダーとキャプチャ](integrations/providers-and-capture.md) |
| AI、STT、プロンプト API | `src-tauri/src/api.rs`、`src/lib/functions/`、`src/pages/system-prompts/` | [プロバイダーとキャプチャ](integrations/providers-and-capture.md) |
| オーディオ、VAD、トランスクリプトパネル | `src/hooks/useSystemAudio.ts`、`src-tauri/src/speaker/`、`src/pages/app/components/speech/`、`TranscriptionPanel.tsx`、`SummaryPanel.tsx` | [オーディオワークフロー](workflows/audio-and-transcription.md) |
| スクリーンショットとウィンドウ | `src-tauri/src/capture.rs`、`src-tauri/src/window.rs`、`src/pages/screenshot/` | [ランタイムアーキテクチャ](architecture/overview.md) |
| グローバルショートカット | `src-tauri/src/shortcuts.rs`、`src/hooks/useGlobalShortcuts.ts`、`src/pages/shortcuts/` | [ランタイムアーキテクチャ](architecture/overview.md) |
| 永続データ | `src-tauri/src/db/migrations/`、`src-tauri/src/db/`、`src/lib/` | [データと設定](domain/data-and-settings.md) |
| ネイティブのブートストラップ | `src-tauri/src/lib.rs`、`src-tauri/src/main.rs`、`src-tauri/tauri.conf.json`、`src-tauri/capabilities/` | [ランタイムアーキテクチャ](architecture/overview.md) |
| 品質とデリバリー | `package.json`、`eslint.config.js`、`.github/workflows/`、`docs/仕様/CI.md`、`docs/仕様/ブランチ・リリース戦略.md` | [テストガイダンス](testing/testing-guidance.md)および[ランブック](operations/release-and-privacy.md) |
| 挙動の履歴 | `openspec/specs/`、`openspec/changes/`、`CHANGELOG.md` | [オーディオワークフロー](workflows/audio-and-transcription.md) |

## 履歴アンカー

最近のトランスクリプト機能の変遷は、git 上で `389382a`（STT のみ）、`0cd3fac`（セッションへの蓄積）、`8adcd54`（サマリーパネル）として確認できます。これらの領域を変更する前に、現在のコードと `openspec/changes/top-bar-transcript-summary-panel/` にあるアクティブな提案、および同期済みの仕様を比較してください。

作業ツリーには、コミットされていないドキュメントおよび自動化の変更と、初期化時点から追跡されていないオーディオファイルも含まれています。このマップでは、これらをアプリケーションの挙動として扱いません。

このマップは[クイックスタート](quickstart.md)を指しており、エンジニアを[アーキテクチャ](architecture/overview.md)、[ワークフロー](workflows/audio-and-transcription.md)、[データモデル](domain/data-and-settings.md)、[インテグレーション](integrations/providers-and-capture.md)、[運用](operations/release-and-privacy.md)、[テスト](testing/testing-guidance.md)の各概念へ案内します。