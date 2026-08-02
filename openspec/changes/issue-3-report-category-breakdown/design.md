## Context

現状、面接支援ドメイン（要求仕様書 §7.3〜§7.9: 面接セッション、質問抽出、意図分類、面接後レポート）は未実装であり、TODO.md の Phase 8（面接セッション機能）・Phase 10（質問抽出と意図分類）・Phase 13（面接後振り返り）はいずれも未着手。既存の実装は Pluely 由来のチャット機能（`conversations` / `messages` テーブル、`src/pages/chats/`）と音声文字起こし（`useSystemAudio`）のみで、「質問」や「カテゴリ」という概念はデータモデルにもUIにも存在しない。

Issue #3 は面接後レポートのうち「質問カテゴリの内訳表示」だけを求めている。フルスコープ（Phase 8+10+13）を一度に実装するのは単一 Issue の範囲を超えるため、本 change では以下を最小の縦スライスとして実装する。

- 会話（`conversations`）を面接セッションの単位として流用する（新規の面接セッション概念は導入しない）
- 質問の自動抽出・自動カテゴリ分類（ローカル LLM）は行わず、ユーザーが会話内の質問を手動で記録し、固定カテゴリ一覧から手動でカテゴリを選ぶ
- 会話詳細画面に、記録済み質問の一覧とカテゴリ別内訳（件数・割合）を表示する「面接レポート」セクションを追加する

これにより Issue の要求（カテゴリ内訳表示）を独立して実装・レビュー可能な単位に保ちつつ、後続の Phase 10（自動抽出・自動分類）が実装された際は `interview_questions` テーブルへの書き込み元を差し替えるだけで済むようにする。

## Goals / Non-Goals

**Goals:**
- 会話に紐づく質問をカテゴリ付きで手動記録できる（`interview_questions` テーブル、要求仕様書 §7.6 の固定 14 カテゴリを使用）
- 会話詳細画面で、記録済み質問一覧とカテゴリ別の件数・割合の内訳を表示する
- カテゴリ内訳は質問が 1 件も記録されていない会話では空状態を表示する
- Markdown 相当のテキストとしてコピーできるようにする（要求仕様書 §7.9「画面表示と Markdown 相当のテキストコピーを優先する」に整合）

**Non-Goals:**
- 文字起こしログからの質問候補の自動抽出（Phase 10、別 change）
- ローカル LLM によるカテゴリの自動分類（Phase 10、別 change）— 本 change では手動選択のみ
- 独立した `interview_sessions` テーブルの新規作成（Phase 8、別 change）— 本 change では既存 `conversations` を流用
- 回答方針の振り返り・ユーザーメモ・次回準備項目・職務経歴書への追記提案など、要求仕様書 §7.9 の他の表示項目（別 change）
- PDF 出力（要求仕様書 §7.9 で MVP 対象外と明記）

## Decisions

### 面接セッションの単位として既存 `conversations` を流用する

新規に `interview_sessions` テーブルを作るのではなく、既存の `conversations`（`src-tauri/src/db/migrations/chat-history.sql`）をそのまま「1 回の面接」の単位として扱う。

- 理由: Phase 8（面接セッション機能）は本 Issue の範囲外であり、別途データモデル設計が必要な大きな変更。`conversations` は既に「ひとまとまりのやり取り」を表す ID を持っており、`interview_questions.conversation_id` で紐づけるだけで会話単位のレポートが実現できる。
- 代替案: 新規 `interview_sessions` テーブルを作り `conversations` とは別に管理する → Phase 8 の設計を先取りすることになり、後で重複・統合コストが発生するため見送り。

### `interview_questions` テーブルの新規追加

要求仕様書 §10.5 の `InterviewQuestion` ドラフト定義（id / session_id / transcript_segment_id / question_text / category / confidence / user_note / created_at / updated_at）を参考に、本 change のスコープに合わせて最小化する。

```sql
CREATE TABLE IF NOT EXISTS interview_questions (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_conversation_id ON interview_questions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_conversation_category ON interview_questions(conversation_id, category);
```

- `transcript_segment_id` / `confidence` は本 change では使わない（自動抽出が無いため）。Phase 10 実装時に別マイグレーションで追加する。
- `user_note` は要求仕様書上は質問メモ用だが、本 change の表示スコープには含めないため見送る。
- `category` は CHECK 制約ではなく `TEXT` として保存し、固定カテゴリ一覧はフロントエンド側の定数（`src/types/` または `src/lib/`）として定義する。理由: 既存の `messages.role` は CHECK 制約を使っているが、カテゴリ一覧は将来調整される可能性があるドメイン知識であり、マイグレーション変更なしで一覧を調整できるようにする。

マイグレーションは `tauri-rust-conventions` スキルに従い、`src-tauri/src/db/migrations/interview-questions.sql` を新規追加し、`src-tauri/src/db/main.rs::migrations()` に次のバージョン番号で登録する（既存マイグレーションは変更しない）。

### フロントエンドは既存パターン（`plugin-sql` 直接呼び出し）を踏襲する

`src/lib/database/chat-history.action.ts` は Rust コマンドを介さず `@tauri-apps/plugin-sql` の `getDatabase()` を直接呼び出して SQL を実行している。新規に Tauri コマンドを作るのではなく、同じパターンで `src/lib/database/interview-question.action.ts`（仮）を追加し、質問の作成・一覧取得・カテゴリ別集計を行う。

- 理由: 既存コードとの一貫性。新規 Rust コマンドを追加すると `capabilities/*.json` の権限設定なども必要になり、本 change のスコープに対して過剰。
- カテゴリ別集計は `SELECT category, COUNT(*) FROM interview_questions WHERE conversation_id = ? GROUP BY category` で取得し、フロントエンド側で固定カテゴリ一覧の順序に整列させる（0 件のカテゴリも一覧に含めるかは UI 実装時に判断、既定は「1 件以上あるカテゴリのみ表示」とする）。

### UI 配置: 会話詳細画面 (`src/pages/chats/components/View.tsx`) に「面接レポート」セクションを追加

質問一覧・カテゴリ内訳・質問の手動追加フォームを新規コンポーネント（例: `src/pages/chats/components/InterviewReport.tsx`）としてまとめ、`View.tsx` から呼び出す。

- 理由: `View.tsx` の肥大化を避けるため、`top-bar-panel-content-integration` の前例（`TranscriptionPanel` / `AIResponsePanel` を独立コンポーネント化）に倣う。
- カテゴリ内訳の可視化は、依存ライブラリを増やさないため棒グラフ的な横バー（Tailwind の `div` 幅で表現）または単純なリスト＋件数・割合のテキスト表示とする。新規チャートライブラリの追加は本 change では行わない。

## Risks / Trade-offs

- **リスク: `conversations` を面接セッションとして流用すると、雑談的なチャットとの区別がつかない** → 緩和: 本 change では質問を 1 件も記録していない会話にはレポートセクションを表示しない（空状態のみ）ため、通常のチャット利用への影響は表示上ゼロに抑える。会話と面接を区別する明示的なフラグは Phase 8 で検討する。
- **トレードオフ: カテゴリを手動選択にすることで、Issue が本来期待する「自動でカテゴリが付く」体験にはならない** → 要求仕様書 §7.6 も「heuristic + AI + manual」の併用と過抽出前提のユーザー編集を許容しており、手動選択は仕様上妥当な MVP スコープ。Phase 10 実装後、自動分類結果を同じ `category` カラムに書き込むだけで UI 側の変更は不要。
- **リスク: 質問記録 UI を新規に作ることで、想定より実装コストが膨らむ** → 緩和: 質問追加は「テキスト入力 + カテゴリ選択ドロップダウン + 追加ボタン」の最小フォームに限定し、文字起こしパネルとの自動連携は行わない。

## Open Questions

- カテゴリ内訳の表示形式（横棒 / 円グラフ相当 / 単純リスト）は実装時に UI 実装者が既存デザイントークンに合わせて決定する（本 change では単純リスト+割合を既定とする）。
- 0 件カテゴリを内訳に含めるかどうかは、実装時にユーザビリティを見ながら判断する。
