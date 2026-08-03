## 1. データベース

- [x] 1.1 `src-tauri/src/db/migrations/app-launches.sql` を作成し、既存の履歴テーブルと同じ Unix 秒形式の `app_launches(id INTEGER PRIMARY KEY AUTOINCREMENT, launched_at INTEGER NOT NULL DEFAULT (unixepoch()))` テーブルを定義する
- [x] 1.2 `src-tauri/src/db/main.rs` の `migrations()` に `version: 3` として新しいマイグレーションを追加する（既存の 1, 2 は変更しない）

## 2. バックエンド（起動記録・取得コマンド）

- [x] 2.0 `src-tauri/Cargo.toml` に `sqlx`（`sqlite` feature のみ。`tauri-plugin-sql` 経由の間接依存としてバージョンは既に解決済み・`Cargo.lock` 記載の 0.8.6 系を使う）を直接依存として追加する。**（本レビューラウンドで修正）** 独自に `sqlx::SqlitePool` を新規に開く必要はない。`tauri-plugin-sql`（`Cargo.lock` で `2.3.0` 固定、`sql-v2.3.0` タグのソースで確認済み）は起動時にプリロード・マイグレーション済みの接続プールを `pub struct DbInstances(pub tokio::sync::RwLock<HashMap<String, DbPool>>)` として `app.manage()` 済みであり、`pub enum DbPool { Sqlite(sqlx::SqlitePool), .. }` はクレートルートで再エクスポートされているため、アプリ側コードから `app.state::<tauri_plugin_sql::DbInstances>()` 経由でこの既存プールをそのまま再利用できる。よって `app_config_dir()`/`app_data_dir()` のパス解決をアプリ側で再現する必要も、2本目の接続を開く必要もない
- [x] 2.1 `src-tauri/src/lib.rs` の `run()` 内 `setup()` クロージャで、`tauri::async_runtime::block_on` 内から `app.state::<tauri_plugin_sql::DbInstances>()` を `.0.read().await`（`tokio::sync::RwLock` のため非同期コンテキストが必要）し、キー `"sqlite:pluely.db"` に対応する `DbPool::Sqlite(pool)` を取得して `app_launches` へ1行 INSERT する。検索・プール種別・SQL の失敗は `setup()` から伝播させ、INSERT のコミット後にのみ起動を続行する（1起動につき1回のみ実行されることを確認する）。`src-tauri/tauri.conf.json` の既存 `plugins.sql.preload` と、`.plugin(tauri_plugin_sql::Builder::default()...)` の登録が `.setup()` より前である現状の順序を維持し、プリロードによる DB ロードとマイグレーション適用が `setup()` より先に完了することも確認する
- [x] 2.2 直近の起動履歴を `ORDER BY launched_at DESC, id DESC LIMIT 10` で決定的な新しい順に最大10件返す、引数なしの Tauri コマンド（例: `get_app_launch_history`）を実装する。呼び出しごとに 2.1 と同じ方法（`app.state::<tauri_plugin_sql::DbInstances>()` 経由）でプールを取得し、新たな接続は開かない
- [x] 2.3 新しいコマンドを `lib.rs` の `invoke_handler!` に登録する

## 3. フロントエンド（設定画面）

- [x] 3.1 `src/pages/settings/components/` に起動履歴セクションの新規コンポーネント（例: `LaunchHistory.tsx`）を作成し、マウント時に新しいコマンドを `invoke` で呼び出して直近10件を表示する。`launched_at` は Unix 秒なので、JavaScript の `Date` を作る前に 1,000 倍してミリ秒へ変換する
- [x] 3.2 履歴が0件の場合に、エラーにならず「履歴がありません」等の表示になることを確認する
- [x] 3.3 `src/pages/settings/components/index.ts` に新コンポーネントをエクスポート追加する
- [x] 3.4 `src/pages/settings/index.tsx` の既存セクション（テーマ、自動起動、アプリアイコン、常に最前面表示）の下に新セクションを追加する

## 4. 検証

- [x] 4.1 `npm run typecheck` と `npm run lint` を実行する
- [ ] 4.2 `src-tauri` で `cargo fmt --check` と `cargo clippy` を実行する
- [ ] 4.3 ローカルでアプリを起動し、`app_launches` に1行だけ追加されること、設定画面最下部に起動履歴（最大10件、新しい順）が表示されることを手動確認する
- [ ] 4.4 複数回起動し、11件目以降でも一覧が最新10件のみ表示されることを手動確認する
