## Context

Interview-Pilot は個人利用・非配布の Tauri v2 デスクトップアプリで、現状は Windows 向けインストーラのみを `v<version>` タグ push で draft の GitHub Release にビルド・添付している（`installer-release-workflow`）。署名 secret・Pluely 由来 secret に依存しないビルドを優先したため、`manual-update-distribution` として「アプリはネットワーク越しの更新チェックや自動インストールを一切行わない」ことが明文化されていた。これはフォーク初期の暫定方針であり、今回これを撤回して Interview-Pilot 自身の運用として自動更新を導入する。

アプリはフレームレス・常時最前面ではない透過オーバーレイの `main` ウィンドウと、設定等を扱う `dashboard` ウィンドウを持つ（`src-tauri/tauri.conf.json`, `src/pages/dashboard`）。既存の `src/components/ui/dialog.tsx` を確認ダイアログの土台として使う。

## Goals / Non-Goals

**Goals:**
- アプリ起動時に GitHub Releases 上の最新バージョンを確認する
- 新バージョンがある場合、ユーザーに確認ダイアログを出し、承認後に自動でダウンロード・インストール・再起動まで行う
- Windows ビルド（現状の唯一の配布対象）で動作させる
- 既存の「draft Release を作ってから内容を確認して公開する」運用フローを維持したまま、updater は公開済み Release のみを見るようにする

**Non-Goals:**
- macOS / Linux 向け updater 対応（インストーラ自体が現状対象外のため）
- サイレント・強制アップデート（ユーザーの同意なしに更新するフローは作らない）
- エンタープライズ向けの鍵ローテーション運用や複数チャンネル(stable/beta)配信
- 差分更新・ロールバック機能

## Decisions

### 1. `tauri-plugin-updater` + GitHub Releases をエンドポイントに使う
Tauri 公式の updater プラグインを使い、エンドポイントは GitHub の「最新の公開 Release」に対応する固定 URL (`https://github.com/<owner>/<repo>/releases/latest/download/latest.json`) を指す。自前の配信サーバーを持たずに済み、既存の Release ベースの運用と一貫する。

代替案として自前サーバーでのバージョン管理も考えられるが、個人利用規模でインフラを増やす理由がないため採用しない。

### 2. draft Release は updater から見えない状態を維持し、「公開」を更新の解禁トリガーにする
GitHub の `releases/latest` エンドポイントは draft を対象にしない。既存の「ビルド後にインストーラを手動確認してから公開する」フローをそのまま活かせるため、CI 側の draft 作成方針は変更しない。運用者が Release を draft から Published に切り替えた時点で、既存ユーザーのアプリが次回起動時に更新を検知できるようになる。

### 3. 署名鍵は Tauri updater 専用の鍵ペア(minisign ベース)を新規生成し、GitHub Actions secrets に保存する
`tauri signer generate` で生成した秘密鍵・パスワードを `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` として GitHub Actions secrets に登録する。公開鍵は `tauri.conf.json` の `plugins.updater.pubkey` にコミットする。これは Windows コードサイニング証明書とは別物で、Tauri updater が改ざん検知のために独自に要求する署名であり、`installer-release-workflow` の「コード署名は当面設定しない」方針とは独立に導入できる。

### 4. CI (`publish-tauri` job) で `includeUpdaterJson: true` に切り替え、署名 env を追加する
`tauri-apps/tauri-action` は署名鍵 env が設定されていれば自動的に updater 用マニフェストを生成し、Release に添付できる。ワークフロー変更は環境変数追加とフラグ変更のみで、ビルドの他の挙動(draft, releaseBody 等)は変えない。

### 5. 更新チェック・確認ダイアログは `main` ウィンドウのフロントエンドで行う
起動時（`main` ウィンドウのマウント時）に `@tauri-apps/plugin-updater` の `check()` を呼び、新バージョンが見つかった場合は既存の `src/components/ui/dialog.tsx` を使った確認ダイアログを表示する。承認後は `downloadAndInstall()` を呼び、完了後に `@tauri-apps/plugin-process` の `relaunch()` でアプリを再起動する。拒否した場合は何もせず起動を継続し、次回起動時に再度チェックする（既読管理や「次回から確認しない」等の永続化は行わない）。

### 6. 更新チェック失敗はサイレントに無視する
オフラインや GitHub API 不達の場合、更新チェックはエラーを握りつぶし通常起動を継続する。ユーザーに毎回エラーダイアログを出すと個人利用アプリの体験として煩わしいため、失敗時は何も表示しない（ログ出力のみ）。

## Risks / Trade-offs

- [Risk] 秘密鍵を紛失すると、以後の Release を既存インストール済みアプリが検証できなくなり更新が届かなくなる → Mitigation: 秘密鍵・パスワードは GitHub Actions secrets にのみ保存し、生成時にローカルの一時ファイルを残さない。紛失時は鍵を再生成し `pubkey` を更新した上で、既存ユーザーには一度だけ手動インストールを案内する（`manual-update-distribution` 時代のフォールバック経路として残る）。
- [Risk] draft Release を作成した直後、公開前に誤って古いバージョンより先に draft を「公開」してしまうと、ユーザーが未検証のビルドを受け取る → Mitigation: 既存の「公開前に手動確認する」運用手順をそのまま維持し、ドキュメントに明記する。
- [Risk] 起動のたびに GitHub API を呼ぶため、レートリミットやネットワーク遅延が起動体験に影響する可能性 → Mitigation: チェックは非同期・バックグラウンドで行い、起動そのものをブロックしない。失敗時は無視する(Decision 6)。
- [Trade-off] macOS/Linux は対象外のままなので、将来これらの OS 向けビルドを追加する際に updater 対応も追加で必要になる。

## Migration Plan

1. `tauri signer generate` で鍵ペアを生成し、公開鍵を `tauri.conf.json` に追加、秘密鍵・パスワードを GitHub Actions secrets に登録する
2. Rust 側に `tauri-plugin-updater` / `tauri-plugin-process` を追加・登録し、capabilities に permission を追加する
3. フロントエンドに起動時チェック・確認ダイアログ・ダウンロード/インストール/再起動フローを実装する
4. CI (`ci.yml`) の `publish-tauri` job を `includeUpdaterJson: true` にし、署名 env を追加する
5. `openspec/specs/manual-update-distribution` を撤回し、`installer-release-workflow` に updater 関連要件を追加する delta を適用する
6. 次回リリースで実機検証: 旧バージョンを起動 → 新バージョンを draft のまま公開せず放置 → 検知されないことを確認 → 公開 → 起動時に確認ダイアログが出てダウンロード・再起動できることを確認する
7. `docs/仕様` の関連ドキュメント(`ブランチ・リリース戦略.md`, `GitHub Actions リリース手順.md`, `TODO.md`)を更新する

ロールバックが必要な場合は `tauri.conf.json` の `plugins.updater` を削除し、プラグイン登録を外し、CI を `includeUpdaterJson: false` に戻せば `manual-update-distribution` 相当の状態に戻せる。

## Open Questions

- 確認ダイアログの文言・UI 配置(`main` ウィンドウ vs `dashboard` ウィンドウ)は実装時に確定する
- ダウンロード進捗の可視化(プログレスバー等)を初期実装に含めるかは tasks 側で判断する
