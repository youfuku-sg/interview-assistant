## 1. データベース

- [ ] 1.1 `src-tauri/src/db/migrations/app-launches.sql` を作成し、`app_launches(id INTEGER PRIMARY KEY AUTOINCREMENT, launched_at TEXT NOT NULL DEFAULT (datetime('now')))` テーブルを定義する
- [ ] 1.2 `src-tauri/src/db/main.rs` の `migrations()` に `version: 3` として新しいマイグレーションを追加する（既存の 1, 2 は変更しない）

## 2. バックエンド（起動記録・取得コマンド）

- [ ] 2.1 `src-tauri/src/lib.rs` の `run()` 内 `setup()` クロージャで、アプリ起動時に `app_launches` へ1行 INSERT する処理を追加する（ウィンドウ生成処理より前後どちらでもよいが、1起動につき1回のみ実行されることを確認する）
- [ ] 2.2 直近の起動履歴を新しい順で返す Tauri コマンド（例: `get_app_launch_history`、`limit: Option<i64>` 省略時は10件）を実装する
- [ ] 2.3 新しいコマンドを `lib.rs` の `invoke_handler!` に登録する

## 3. フロントエンド（設定画面）

- [ ] 3.1 `src/pages/settings/components/` に起動履歴セクションの新規コンポーネント（例: `LaunchHistory.tsx`）を作成し、マウント時に新しいコマンドを `invoke` で呼び出して直近10件を表示する
- [ ] 3.2 履歴が0件の場合に、エラーにならず「履歴がありません」等の表示になることを確認する
- [ ] 3.3 `src/pages/settings/components/index.ts` に新コンポーネントをエクスポート追加する
- [ ] 3.4 `src/pages/settings/index.tsx` の既存セクション（テーマ、自動起動、アプリアイコン、常に最前面表示）の下に新セクションを追加する

## 4. 検証

- [ ] 4.1 `npm run typecheck` と `npm run lint` を実行する
- [ ] 4.2 `src-tauri` で `cargo fmt --check` と `cargo clippy` を実行する
- [ ] 4.3 ローカルでアプリを起動し、`app_launches` に1行だけ追加されること、設定画面最下部に起動履歴（最大10件、新しい順）が表示されることを手動確認する
- [ ] 4.4 複数回起動し、11件目以降でも一覧が最新10件のみ表示されることを手動確認する
