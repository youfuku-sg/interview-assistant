---
type: プロジェクトガイド
title: Interview-Pilot クイックスタート
description: Interview-Pilot に取り組むエンジニア向けの入口。React と TypeScript の UI、ローカルの会話ストレージ、音声文字起こし、スクリーンショットキャプチャ、設定可能な AI プロバイダーを備えた、ローカルファーストの Tauri デスクトップアプリケーション。
tags: [interview-pilot, quickstart, tauri, react, typescript]
---

# Interview-Pilot クイックスタート

Interview-Pilot は、Tauri、Rust、React 19、TypeScript を基盤とする GPL-3.0 のデスクトップアプリケーションです。インタビュー準備と会話支援のための、フォーク由来のローカルファーストなアシスタントです。現在の実装では、常時利用可能な小型オーバーレイと、チャット、プロンプト、設定、音声、スクリーンショット、応答、ショートカット、プロバイダー設定のためのダッシュボードを組み合わせています。

## ここから始める

```bash
npm install
npm run tauri dev
```

前提条件は Node.js 18 以降、安定版 Rust、npm または yarn、および Tauri に必要なプラットフォーム依存関係です。`npm run tauri build` でインストーラーを生成できます。バンドルは `src-tauri/target/release/bundle/` 以下に出力されます。

ランタイム境界とモジュールの責務については、[アーキテクチャ概要](architecture/overview.md) を読んでください。主なユーザー向けフローについては、[音声と文字起こしのワークフロー](workflows/audio-and-transcription.md) を読んでください。永続化と設定については [データと設定](domain/data-and-settings.md) で説明しています。外部 AI/STT とネイティブキャプチャについては [プロバイダーとキャプチャ](integrations/providers-and-capture.md) で扱っています。運用上のリリースとプライバシーに関する注意事項は [リリースとプライバシーのランブック](operations/release-and-privacy.md) に、検証に関する期待事項は [テストガイダンス](testing/testing-guidance.md) に記載されています。

## どこを変更するか

| 対象 | まず確認する場所 |
| --- | --- |
| オーバーレイ、ダッシュボード、またはルート UI | `src/pages/`, `src/layouts/`, `src/routes/index.tsx` |
| 共有 React 状態とグローバルな動作 | `src/contexts/`, `src/hooks/`, `src/config/` |
| チャットストリーミング、文字起こし、モデル、プロンプト | `src-tauri/src/api.rs` と `src/lib/functions/` |
| ウィンドウのライフサイクル、スクリーンショット、ショートカット | `src-tauri/src/window.rs`、`capture.rs`、`shortcuts.rs` |
| システム音声と VAD | `src/hooks/useSystemAudio.ts`、`src-tauri/src/speaker/` |
| 会話とプロンプトの永続化 | `src-tauri/src/db/migrations/`、`src-tauri/src/db/`、`src/lib/` |
| リリースまたは CI の動作 | `src-tauri/tauri.conf.json`、`.github/workflows/`、`docs/仕様/CI.md` |

[ソースマップ](source-map.md) ではこの表を拡張し、信頼できるドキュメントを特定しています。製品の意図とポリシー上の境界については `docs/仕様/要求仕様書.md` を、変更の受け入れ条件については `openspec/` 以下の該当する OpenSpec ファイルを参照してください。

## 現在の製品境界

リポジトリでは会話履歴と設定を意図的にローカルへ保存しますが、一部の AI および STT リクエストは設定されたプロバイダーへ直接送信されます。API キーは、対応している場合、安全な OS ストレージに保存することを想定しています。README と要求仕様書には、上流由来で未解決の PostHog およびライセンス関連コードについても記録されています。現在の実装を確認せずに、この製品をテレメトリーなしと説明しないでください。

最近の履歴からは、音声機能が重点的に進化していることが分かります。STT 専用モード（`389382a`）、セッションの累積文字起こし（`0cd3fac`）、トップバーの文字起こし概要パネル（`8adcd54`）がその例です。文字起こしの状態やトップバーの表示を変更する際は、これらの変更から始めるのが最適です。

## エンジニアリングループ

1. [アーキテクチャページ](architecture/overview.md) で、関連する React フックまたはページと、それに対応する Tauri コマンドを特定します。
2. 動作を変更する前に、対応するソースと `openspec/` 以下の OpenSpec 提案または仕様を確認します。
3. `npm run typecheck` と `npm run lint` を実行します。Rust を変更した場合は、`src-tauri` から `cargo fmt --check` と `cargo clippy` を実行します。
4. 影響を受けるデスクトップフローを手動で実行します。特に OS の権限とウィンドウの動作を確認してください。
5. パッケージング、CI、またはプロバイダー／セキュリティの動作を変更する前に、[リリースとプライバシーのランブック](operations/release-and-privacy.md) を読んでください。リポジトリ Wiki の定期更新と PR 作成は `.github/workflows/openwiki-update.yml` が担います。

## バックログ

- **プロバイダー契約リファレンス** — `src-tauri/src/api.rs` と Dev Space の設定。リクエストテンプレートとプロバイダー固有の解析は範囲が広く変更されやすいため、先送りされています。
- **フルスクリーンキャプチャのワークフロー** — `src/hooks/useChatCompletion.ts`、`useCompletion.ts`、`src-tauri/src/capture.rs`。初期の Wiki では現在の音声中心の変更に焦点を当てるため、先送りされています。
- **詳細なビジネス要件** — `docs/仕様/要求仕様書.md`。初期ページでは製品の境界を記録していますが、すべてのポリシー上の判断までは網羅していません。
