## 1. 署名鍵の準備

- [ ] 1.1 `tauri signer generate` で Tauri updater 用の署名鍵ペア(minisign)を生成する
- [ ] 1.2 生成した公開鍵を控え、秘密鍵・鍵パスワードをローカルの一時ファイルに残さず GitHub リポジトリの Actions secrets (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) に登録する

## 2. Rust / Tauri 設定

- [ ] 2.1 `src-tauri/Cargo.toml` に `tauri-plugin-updater` と `tauri-plugin-process` を追加する
- [ ] 2.2 `src-tauri/src/lib.rs` で両プラグインを登録する
- [ ] 2.3 `src-tauri/capabilities/cross-platform.json` と `default.json` に updater / process の permission (`updater:default`, `process:allow-restart` 等、必要な最小権限) を追加する
- [ ] 2.4 `src-tauri/tauri.conf.json` に `plugins.updater` (エンドポイント `https://github.com/<owner>/<repo>/releases/latest/download/latest.json`、生成した公開鍵) を追加する

## 3. フロントエンド実装

- [ ] 3.1 `package.json` に `@tauri-apps/plugin-updater` と `@tauri-apps/plugin-process` を追加する
- [ ] 3.2 アプリ起動時(`main` ウィンドウのマウント時)に更新チェックを行うフック/モジュールを実装する(失敗時は握りつぶし、ログのみ出力)
- [ ] 3.3 新バージョン検出時に `src/components/ui/dialog.tsx` を用いた確認ダイアログ(「更新しますか?」)を実装する
- [ ] 3.4 承認時にダウンロード・インストールを実行し、完了後に `relaunch()` でアプリを再起動する処理を実装する
- [ ] 3.5 拒否時は何もせず起動を継続し、次回起動時に再度チェックが行われることを確認する

## 4. CI ワークフロー更新

- [ ] 4.1 `.github/workflows/ci.yml` の `publish-tauri` job に署名鍵 secrets (`TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) を env として渡す
- [ ] 4.2 `includeUpdaterJson: false` を `true` に変更する
- [ ] 4.3 秘密鍵の値がワークフローログに出力されないことを確認する

## 5. 検証

- [ ] 5.1 ローカルビルドで、更新確認 → ダイアログ表示 → 承認 → ダウンロード・インストール・再起動のフローを手動検証する(テスト用に一時的に古いバージョン番号で起動するなどして新バージョンありの状態を再現する)
- [ ] 5.2 draft のままの Release は更新確認で検出されないことを確認する
- [ ] 5.3 Release を Published に切り替えた後、起動時に検出されることを確認する
- [ ] 5.4 オフライン状態で起動しても更新確認エラーが表示されず通常起動できることを確認する
- [ ] 5.5 実際に `v<version>` タグ push で CI を走らせ、Release に updater マニフェストが添付されることを確認する

## 6. ドキュメント更新

- [ ] 6.1 `docs/仕様/ブランチ・リリース戦略.md` の updater JSON / 署名に関する決定事項を更新する
- [ ] 6.2 `docs/仕様/GitHub Actions リリース手順.md` の該当箇所(「updater 用 JSON は生成しない」「コード署名は当面設定しない」の記載)を更新する
- [ ] 6.3 `docs/仕様/TODO.md` の関連項目を更新する

## 7. OpenSpec 反映

- [ ] 7.1 `/opsx:archive` で `manual-update-distribution` の撤回と `auto-update` / `installer-release-workflow` の delta を `openspec/specs/` にマージする
