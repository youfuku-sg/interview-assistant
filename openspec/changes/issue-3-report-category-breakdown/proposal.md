## Why

Issue #3: 「面接後レポートに使用した質問カテゴリの内訳を追加したい」。要求仕様書 §7.9（面接後レポート）は「各質問の意図分類」の表示を求め、TODO.md Phase 13 にも「質問カテゴリ別に見返せるようにする」という項目が既に存在するが、いずれも未実装であり、面接後レポート自体が存在しない。ユーザーは面接終了後に、今回の面接で技術質問・行動質問・カルチャーフィット質問などがどのような比率で出たかを一目で振り返りたい。

## What Changes

- 会話（`conversations`）に紐づく形で、面接中に出た質問を「質問」として記録できるようにする（新規 `interview_questions` テーブル）。各質問には要求仕様書 §7.6 の固定カテゴリ一覧（経歴確認/技術経験/技術深掘り/転職理由/志望動機/強み/弱み/チーム開発/トラブル対応/マネジメント経験/キャリアプラン/条件確認/逆質問/その他）から手動でカテゴリを選択する。
- 会話詳細画面に「面接レポート」表示を追加し、その会話に記録された質問一覧と、カテゴリ別の件数内訳（件数・割合）を表示する。
- **Non-Goals**（今回は対象外。TODO.md の別フェーズで扱う）:
  - 文字起こしログからの質問候補の自動抽出（Phase 10）
  - ローカル LLM によるカテゴリの自動分類（Phase 10）
  - レポートのその他項目（回答方針の振り返り、ユーザーメモ、次回準備項目、職務経歴書への追記提案。要求仕様書 §7.9 の残り、TODO.md Phase 13 の残タスク）
  - 独立した「面接セッション」データモデル（Phase 8）。今回は既存の `conversations` を面接の単位として流用する

## Capabilities

### New Capabilities
- `interview-report-category-breakdown`: 会話に質問とカテゴリを手動で記録し、面接後レポート画面でカテゴリ別内訳を表示する機能

### Modified Capabilities
(none — no existing spec covers conversations/report today)

## Impact

- `src-tauri/src/db/migrations/` — 新規マイグレーションで `interview_questions` テーブルを追加し、`src-tauri/src/db/main.rs::migrations()` に登録
- `src/lib/database/` — 既存の `chat-history.action.ts` と同様に `@tauri-apps/plugin-sql`（`getDatabase()`）を直接呼び出す質問 CRUD ヘルパーを追加（新規 Tauri コマンドは不要）
- `src/pages/chats/` — 会話詳細画面に質問記録 UI とレポート表示を追加（新規コンポーネント）
- `src/types/` — 質問・カテゴリのフロントエンド型を追加
- 影響範囲は会話詳細まわりに限定され、音声キャプチャ・AI プロバイダー設定など既存フローには影響しない
