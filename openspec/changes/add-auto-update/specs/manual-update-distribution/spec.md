## REMOVED Requirements

### Requirement: The application SHALL NOT perform automatic update checks or installs
**Reason**: この要件はフォーク初期に「Pluely 由来の secret・署名鍵に依存せずビルドを完走させる」ことを優先して定めた暫定方針であり、Interview-Pilot の恒久的な設計原則ではなかった。個人利用アプリとしての継続運用を踏まえ、起動時の自動更新チェック・確認ダイアログ・承認後の自動インストールを導入する `auto-update` capability に置き換える。
**Migration**: 更新の入手手段は手動の GitHub Releases ダウンロードから、アプリ起動時の自動更新チェック + ユーザー承認によるダウンロード・インストールに移行する。詳細は `auto-update` capability を参照。

The application SHALL NOT contain any client-side mechanism (UI, background check, or bundled updater plugin) that queries a remote endpoint for new versions, downloads an update, or installs it automatically. Users obtain new builds manually from the project's own GitHub Releases, consistent with `installer-release-workflow`, which SHALL NOT publish an updater manifest.

#### Scenario: App does not query any update endpoint on launch
- **WHEN** the application starts
- **THEN** no network request is made to check for a new version, and no update-related UI is rendered

#### Scenario: No updater plugin is bundled
- **WHEN** inspecting the Tauri configuration and Rust plugin registrations
- **THEN** no updater plugin (e.g. `tauri-plugin-updater`) is configured or registered, and no `updater` endpoint/pubkey is present in `tauri.conf.json`

#### Scenario: Users update by installing a new release manually
- **WHEN** a new version is published as a draft GitHub Release per `installer-release-workflow`
- **THEN** users download and run the new installer themselves; the application provides no in-app path to do this automatically
