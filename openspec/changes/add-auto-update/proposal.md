## Why

Interview-Pilot は現在、新しいバージョンを GitHub Releases から手動でダウンロード・インストールする運用になっている（`manual-update-distribution`）。これはフォーク初期に「Pluely 由来の secret・署名鍵に依存せずビルドを完走させる」ことを優先して暫定的に決めた方針であり、恒久的な設計原則ではない。個人利用アプリとして継続運用していく上で、起動のたびに手動でバージョン確認・ダウンロードする手間をなくし、アプリ起動時に新バージョンを検知して確認の上で自動更新できるようにする。

## What Changes

- アプリ起動時に GitHub Releases の最新バージョンを確認する処理を追加する
- 新しいバージョンが検出された場合、「更新しますか？」という確認ダイアログを表示する
- ユーザーが更新を承認した場合、`tauri-plugin-updater` を用いて新バージョンをダウンロード・インストールし、アプリを再起動する
- ユーザーが更新を拒否した場合、そのまま既存バージョンで起動を継続する（次回起動時に再度確認する）
- **BREAKING**: `manual-update-distribution` の「自動更新を一切行わない」という要件を撤回し、置き換える
- リリースビルド (CI) で Tauri updater 用の署名鍵ペアを新規生成し、秘密鍵と鍵パスワードを GitHub Actions secrets に保存する
- CI (`publish-tauri` job) で updater 用マニフェスト (`latest.json` 相当) を生成し、GitHub Release に添付する（現状の `includeUpdaterJson: false` を変更）
- `tauri.conf.json` に `updater` プラグイン設定（エンドポイント・公開鍵）を追加する
- Release の draft 運用と updater のチェック対象（公開済み Release のみを見る）の整合を取る

## Capabilities

### New Capabilities
- `auto-update`: アプリ起動時の更新チェック、確認ダイアログ、ダウンロード・インストール・再起動という自動更新フローそのものの振る舞いを定義する

### Modified Capabilities
- `manual-update-distribution`: 「自動更新を一切行わない」という既存要件を撤回し、`auto-update` capability に置き換える（このスペックは実質的に無効化される）
- `installer-release-workflow`: updater 用マニフェスト生成・署名鍵の取り扱い・Release 公開状態と updater チェックの整合に関する要件を追加する

## Impact

- `src-tauri/Cargo.toml` / `src-tauri/src/lib.rs`: `tauri-plugin-updater`（および再起動用に `tauri-plugin-process`）の追加・登録
- `src-tauri/capabilities/*.json`: updater / process プラグインの permission 追加
- `src-tauri/tauri.conf.json`: `plugins.updater` 設定（エンドポイント、公開鍵）追加
- `package.json` / フロントエンド: `@tauri-apps/plugin-updater`、`@tauri-apps/plugin-process` 追加、起動時チェック・確認ダイアログ UI の実装
- `.github/workflows/ci.yml`: `publish-tauri` job で updater 用署名・マニフェスト生成を追加、新規 secrets（署名鍵・パスワード）参照を追加
- `openspec/specs/manual-update-distribution/spec.md`: 要件撤回
- `openspec/specs/installer-release-workflow/spec.md`: updater 関連要件の追加
- `docs/仕様/ブランチ・リリース戦略.md` / `GitHub Actions リリース手順.md` / `TODO.md`: 決定事項の更新（updater JSON を生成する方針への変更）
