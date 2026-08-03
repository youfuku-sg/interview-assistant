## 1. DB マイグレーション

- [ ] 1.1 `src-tauri/src/db/migrations/practice-questions.sql` を新規作成し、`practice_questions` テーブル（`id`, `batch_id`, `difficulty`, `question_text`, `category` nullable, `created_at`）を定義する
- [ ] 1.2 `src-tauri/src/db/main.rs` の `migrations()` に、次のバージョン番号・説明付きで新規マイグレーションを登録する

## 2. 質問生成ロジック

- [ ] 2.1 練習質問生成専用のシステムプロンプト定数（難易度=初級/中級/上級ごとの文言を含む）を新設する
- [ ] 2.2 難易度を受け取り `fetchAIResponse`（`src/lib/functions/ai-response.function.ts`）を `history: []` ・専用システムプロンプトで呼び出し、5問の質問生成をリクエストする関数を実装する
- [ ] 2.3 AI レスポンスを改行分割し、先頭の記号・番号を除去して質問配列を得るパーサーを実装する。分割結果が空、または期待件数から大きく外れる場合は生レスポンスを1件として返すフォールバックを実装する
- [ ] 2.4 AI プロバイダー未設定時（`selectedAIProvider.provider` 未設定 かつ Pluely API 無効相当）はリクエストを送信せず、案内表示用のフラグ/メッセージを返す

## 3. 練習ページ UI

- [ ] 3.1 `src/pages/practice/` を新設し、難易度セレクタ（初級/中級/上級）と生成開始ボタンを持つセットアップ画面を実装する
- [ ] 3.2 難易度未選択時は生成開始ボタンを無効化する
- [ ] 3.3 AI プロバイダー未設定時は「設定画面でAIプロバイダーを選択してください」の案内を表示し、生成開始ボタンを無効化する
- [ ] 3.4 生成中はローディングインジケーターを表示する
- [ ] 3.5 生成完了後、質問一覧（各問 + 選択された難易度）を表示するコンポーネントを実装する
- [ ] 3.6 `src/pages/index.ts`（または相当のエクスポートファイル）に新規ページをエクスポート追加する

## 4. 保存処理と配線

- [ ] 4.1 質問生成完了時に、生成された5問を同一 `batch_id` でローカル SQLite（`practice_questions` テーブル）へ保存する処理を実装する
- [ ] 4.2 `src/routes/index.tsx` に `/practice` ルートを追加し、`DashboardLayout` 配下に配置する
- [ ] 4.3 ダッシュボードまたはナビゲーションに「面接練習」への導線を追加する

## 5. スペック同期・動作確認

- [ ] 5.1 `openspec validate issue-8-practice-mode-difficulty-selection --strict` を実行しエラーがないことを確認する
- [ ] 5.2 `npm run typecheck` と `npm run lint` を実行しエラーがないことを確認する
- [ ] 5.3 `src-tauri` から `cargo fmt --check` と `cargo clippy` を実行しエラーがないことを確認する
- [ ] 5.4 アプリを起動し、難易度ごとに質問生成→一覧表示→ローカル保存が行われることを確認する
- [ ] 5.5 AI プロバイダー未設定状態で案内表示が出て生成が行われないことを確認する
