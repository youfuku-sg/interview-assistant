## 1. データベースマイグレーション

- [ ] 1.1 `src-tauri/src/db/migrations/interview-questions.sql` を新規作成し、`interview_questions` テーブル（id / conversation_id / question_text / category / created_at / updated_at）と `conversation_id`・`(conversation_id, category)` のインデックスを定義する
- [ ] 1.2 `src-tauri/src/db/main.rs::migrations()` に次のバージョン番号で新規マイグレーションを登録する（既存マイグレーションは変更しない）

## 2. フロントエンド型とデータアクセス

- [ ] 2.1 `src/types/` に固定カテゴリ一覧（要求仕様書 §7.6 の14カテゴリ）の定数・型と `InterviewQuestion` 型を追加する
- [ ] 2.2 `src/lib/database/interview-question.action.ts` を新規作成し、`@tauri-apps/plugin-sql` の `getDatabase()` を使って質問の作成・会話単位の一覧取得・カテゴリ別件数集計（`GROUP BY category`）を行う関数を実装する（既存 `chat-history.action.ts` のパターンに合わせる）
- [ ] 2.3 `src/lib/` の公開エクスポート（`index.ts` 等）に新規関数を追加する

## 3. 質問記録UI

- [ ] 3.1 `src/pages/chats/components/InterviewReport.tsx` を新規作成し、質問テキスト入力欄・カテゴリ選択ドロップダウン・追加ボタンからなる質問記録フォームを実装する
- [ ] 3.2 カテゴリ未選択時は追加操作をブロックし、カテゴリ選択が必要であることを表示する
- [ ] 3.3 質問一覧（質問文・カテゴリ）を表示する

## 4. カテゴリ内訳表示

- [ ] 4.1 `InterviewReport.tsx` にカテゴリ別件数・割合の内訳表示を実装する（1件以上あるカテゴリのみ表示、既存デザイントークンに合わせたリストまたは横バー表現）
- [ ] 4.2 質問が1件も記録されていない場合の空状態表示を実装する
- [ ] 4.3 レポート内容（質問一覧＋カテゴリ内訳）をMarkdown相当のテキストとしてクリップボードにコピーする機能を実装する

## 5. 画面統合

- [ ] 5.1 `src/pages/chats/components/View.tsx` に `InterviewReport` セクションを組み込む
- [ ] 5.2 `src/pages/chats/components/index.ts` に `InterviewReport` を export に追加する

## 6. 動作確認

- [ ] 6.1 `npm run dev` でアプリを起動し、会話詳細画面から質問をカテゴリ付きで追加できることを確認する
- [ ] 6.2 複数カテゴリの質問を追加し、カテゴリ内訳の件数・割合が正しく表示されることを確認する
- [ ] 6.3 質問未記録の会話でレポートセクションが空状態になることを確認する
- [ ] 6.4 レポートのテキストコピー機能が動作することを確認する
- [ ] 6.5 `npm run typecheck` と `npm run lint` がエラーなしで通ることを確認する
