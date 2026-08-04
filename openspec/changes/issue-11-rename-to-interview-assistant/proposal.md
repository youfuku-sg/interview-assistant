## Why

Issue #11（`アプリの名称を変更したい`）にて、ユーザーから「Interview-Pilot で運用していましたが、interview-assistantに全面変更したいです」との要望があった。GitHub リポジトリ自体はすでに `youfuku-sg/interview-assistant`（旧: 不明だが現状のリモートは `interview-assistant`）にリネーム済みだが、アプリ内の識別子・表示名は前回の `rebrand-product-identity` change（2026-07-04 アーカイブ、Pluely → Interview-Pilot）の決定に基づき、依然として `Interview-Pilot` / `interview-pilot` / `com.interview-pilot.app` のままである。リポジトリ名とアプリの製品名が一致しておらず、ユーザーはこれを `interview-assistant` に統一したいと考えている。

## What Changes

- `package.json` の `name`、`src-tauri/Cargo.toml` の `[package] name` / `[lib] name`、`src-tauri/tauri.conf.json` の `productName` / `identifier` を `Interview-Pilot` 系列から `interview-assistant` 系列の名称に変更する方針を検討し、実装タスクに落とし込む
- `identifier`(`com.interview-pilot.app`)の変更要否を検討する。**BREAKING**: `identifier` を変更する場合、既存インストール環境（開発機等）からの自動アップデート・アンインストールに影響する可能性があるため、変更する場合は移行方針も合わせて検討する
- ネイティブウィンドウタイトル(`src-tauri/src/window.rs` の `"Interview-Pilot - ダッシュボード"` 等、および `src-tauri/tauri.conf.json` の `app.windows[0].title`(`"Interview-Pilot - AIアシスタント"`))の扱いを、上記の名称変更と連動して検討する
- アプリ内UIに残る「Interview-Pilot」ブランド名表記(存在すれば、サイドバーのロゴ・エラー画面・ダッシュボードのタイトル・説明文・設定画面・権限案内・ショートカット説明・footer 等)を洗い出し、置き換え候補としてリストアップする。`product-branding` capability の既存要件（`openspec/specs/product-branding/spec.md`）は「fork元である Pluely の名称ではなく、決定した新しいブランド名で統一する」という一般的な規定であり、`Interview-Pilot` → `interview-assistant` の再リネームもこの既存要件の範囲内で扱える（要件文言自体の変更は不要と見込む。design.md で確認する）
- Windows インストーラのファイル名(`Interview-Pilot_<version>_x64_ja-JP.msi` 等)が新しい `productName` に追従することを確認する。`installer-release-workflow` capability の既存要件（`openspec/specs/installer-release-workflow/spec.md` の「生成物のファイル名がアプリの productName に追従する」）も一般的な規定であり、そのまま適用できる見込み(要件文言自体の変更は不要と見込む)
- `package.json` / `src-tauri/Cargo.toml` に残る fork元由来の `repository` / `homepage` / `bugs` URL(`iamsrikanthnani/pluely` のまま)を、現在の実リポジトリ(`youfuku-sg/interview-assistant`)に合わせて更新するかを検討する(今回のリネーム要望と関連するため、design.md で扱う)

**BREAKING**: `identifier` を変更した場合、Windows 上で既存の `Interview-Pilot`(`com.interview-pilot.app`)名義でのインストール状態と新しい identifier のインストールが別アプリとして扱われる可能性がある(前回の `rebrand-product-identity` change でも同様のリスクが指摘されており、design.md で再確認する)。

## Capabilities

### New Capabilities
(なし)

### Modified Capabilities
- `product-branding`: 既存要件(「アプリ内UIのブランド名表記が統一されている」)はブランド名が何であるかを固定しておらず、`Interview-Pilot` → `interview-assistant` への再リネームもその範囲内で扱える(要件文言自体の変更は不要)。ただし今回の Issue #11 は「GitHub リポジトリ名(`interview-assistant`)とアプリの製品識別名を一致させたい」という、従来の「内部で名称が統一されていること」より一段具体的な要望であるため、この観点を新しい requirement として追加する

`installer-release-workflow` の既存要件(「生成物のファイル名がアプリの productName に追従する」)は `productName` の値そのものを固定しておらず、そのまま適用できるため変更しない。

## Impact

- 影響ファイル: `package.json`、`package-lock.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/tauri.conf.json`、`src-tauri/src/window.rs`、`src-tauri/src/main.rs`(`[lib] name` を `interview_assistant_lib` に変更する場合、`interview_pilot_lib::run()` 呼び出しをあわせて更新しないとビルドが失敗する)、`.github/workflows/ci.yml`(`releaseName: "Interview-Pilot v__VERSION__"` として GitHub Release タイトルに表示されている)、および UI 内で「Interview-Pilot」を表示している箇所(前回 change の Impact に列挙された `src/components/Sidebar.tsx` 等を含む、網羅的な洗い出しは design.md / 実装時に grep で再確認する)、`CLAUDE.md`(パッケージ/バイナリ名・identifier の記述)
- 影響システム: GitHub Actions `publish`/`ci` ワークフローが生成するインストーラファイル名・GitHub Release名
- 非対象: ライセンス変更(GPL-3.0 のまま)、アプリアイコン・ロゴ等の新規ビジュアルアセット制作(別スコープ)、README.md / SECURITY.md 以外の外部公開ドキュメント整備(必要になれば別 change)
