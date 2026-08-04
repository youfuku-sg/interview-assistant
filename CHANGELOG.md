# Changelog

このファイルは [Keep a Changelog](https://keepachangelog.com/) 形式に準ずる。過去のリリース（v0.1.10 より前）は遡って記載しない。形式・運用方針は `docs/仕様/ブランチ・リリース戦略.md` 4.3節を参照。

## [0.6.1] - 2026-08-05

### Changed

- Issue駆動開発フローをspec/dev 2フェーズ構成に再設計し、specフェーズを実装した（`.github/workflows/issue-spec-phase.yml`が`issue-propose.yml`を置き換え）。Issue起票→`spec/<Issue番号>`ブランチ作成→OpenSpec提案作成→Claude Code・Codex・qwenによる並列AIレビュー（Issueコメント経由、最大3ラウンド）→レビューゲート用PR作成、までを自動化した。アプリ本体の挙動に変更はない

## [0.6.0] - 2026-08-04

### Changed

- アプリの製品識別名を `Interview-Pilot` から `interview-assistant`（表示名 `Interview-Assistant`）へ全面リネーム（GitHubリポジトリ名との一致）。`package.json`、`src-tauri/Cargo.toml`、`tauri.conf.json`（productName/identifier/ウィンドウタイトル）、UI表示文言、`CLAUDE.md`/`AGENTS.md`/`README.md`/`SECURITY.md`/`docs/仕様/*.md` を更新（Issue #11）
- Claude/Codex用GitHub Actionsの認証方式を、従量課金APIキー（`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`）からサブスクリプションベースの認証（`CLAUDE_CODE_OAUTH_TOKEN`/ChatGPTログインの`auth.json`）に変更

## [0.5.18] - 2026-07-23

### Changed

- トップバー右エリアの中段を「直近発話へのAI回答」から「セッション累積発話（`sessionTranscript`）をAIプロバイダーで要約したテキスト」の表示に変更した（`SummaryPanel` を新設）
- 既存の「直近発話へのAI回答」表示（`AIResponsePanel`）は下段に移動した
- 下段のテキスト入力欄（`CompletionInput`）はデフォルトで非表示にした

## [0.5.17] - 2026-07-09

### Changed

- 音声パネルポップオーバー（ヘッドフォンボタン）の文字起こし表示を `lastTranscription`（直近1件）から `sessionTranscript`（セッション全発話の累積配列）に変更した。セッション中の過去の発話がポップオーバー内で消えなくなった（`ResultsSection` の props 変更、`SystemAudio` で `sessionTranscript` を渡すよう変更）
- 音声パネルポップオーバーの通常モード・会話モード双方から「システム：」プレフィックス表示を削除した

## [0.5.16] - 2026-07-09

### Changed

- STT セッション中の全発話を蓄積表示するように変更した。VAD が無音を検知するたびに発話を上書きしていた挙動を、セッション開始〜停止まで改行区切りで全発話をパネルに追記する方式に改めた（`useSystemAudio` に `sessionTranscript: string[]` ステート追加、`TranscriptionPanel` の表示ソースを `lastTranscription` から `sessionTranscript` に変更）
- セッション開始（`startCapture`）および新規会話（`startNewConversation`）時に `sessionTranscript` をリセットする
- AI 処理トリガーとして `lastTranscription` を内部で引き続き使用する（外部への影響なし）

## [0.5.15] - 2026-07-09

### Changed

- 音声パネル（ヘッドフォンボタン）を STT 専用表示にシンプル化した。AI プロバイダー未設定時にエラーを出さず文字起こし結果のみ表示する（`src/hooks/useSystemAudio.ts`）
- 音声パネル内の結果セクションタイトルを「AIの回答」から「文字起こし」に変更し、アイコンを `SparklesIcon` → `FileTextIcon` に差し替えた（`src/pages/app/components/speech/ResultsSection.tsx`）
- トップバー中段の「AIプロバイダーが選択されていません」警告表示を削除。AI 未設定時はパネルを非表示にする（`src/pages/app/components/AIResponsePanel.tsx`）

## [0.5.14] - 2026-07-09

### Changed

- 音声パネル内のスクリーンショットボタンと新規（会話）ボタンを非表示にした。面接支援用途では不要なUIのため削除（`src/pages/app/components/speech/index.tsx`）

## [0.5.13] - 2026-07-08

### Fixed

- STT の multipart/form-data リクエストで明示的な言語指定がない場合に `language=ja` を追加し、長い日本語発話が provider 側の自動判定で英語として認識される問題を抑制した
- 既存の `language` / `languageCode` / `language_code` / URL query / provider 固有 config 内の言語指定は上書き・重複追加しないようにした

### Changed

- 同梱 STT provider の curl テンプレートと Dev Space のカスタム STT provider 例を日本語向け（`ja` / `ja-JP`）に更新した
- 完了した OpenSpec change `force-japanese-stt-language` をアーカイブし、`stt-transcription-language` capability spec を追加した

## [0.5.12] - 2026-07-08

### Fixed

- 上段の文字起こし表示が AudioVisualizer / StatusIndicator に押し出されて見えない問題を修正した。文字起こし結果が存在する場合は TranscriptionPanel を優先表示し、AudioVisualizer / StatusIndicator は文字起こし前のみ表示するよう変更した
- TranscriptionPanel の表示優先順位を「文字起こし結果 > 処理中表示」に変更し、結果が届いた後は処理中ステータスに隠されないようにした

## [0.5.11] - 2026-07-08

### Fixed

- 文字起こし結果が上段パネルに一切表示されなかったバグを修正した。原因は2点: (1) `capturing` 中は TranscriptionPanel が排他的に非表示になっていた → キャプチャ中も TranscriptionPanel を常時表示するよう変更、(2) `stopCapture` が `setLastTranscription("")` で結果をリセットしていた → 停止後もパネルに結果が残るよう削除した

## [0.5.10] - 2026-07-08

### Fixed

- 音声キャプチャ中（`capturing` が true）に `TranscriptionPanel` が表示されなかったバグを修正した。右エリアの `capturing ? <AudioVisualizer> : <3段パネル>` という排他分岐を廃止し、3段構造を常時表示するよう変更した。上段ではキャプチャ中は AudioVisualizer + StatusIndicator を、停止中は TranscriptionPanel を表示する

## [0.5.9] - 2026-07-08

### Added

- トップバー右エリアの上段に `TranscriptionPanel` コンポーネントを追加した。`useSystemAudio` が返す最新の文字起こし結果をリアルタイム表示し、STT プロバイダー未設定時はオレンジ色のエラーメッセージ、処理中はローディングスピナーを表示する
- トップバー右エリアの中段に `AIResponsePanel` コンポーネントを追加した。AI 回答を `Markdown` コンポーネントでレンダリングし、AI プロバイダー未設定時はオレンジ色のエラーメッセージ、処理中はローディングスピナーを表示する
- `sttReady` / `aiReady` フラグを `selectedSttProvider`・`selectedAIProvider`・`pluelyApiEnabled` から算出し、Pluely API 有効時はエラーを表示しない

## [0.5.7] - 2026-07-08

### Changed

- トップバーの collapsed 時の縦幅を 160px から 240px（約1.5倍）に拡大した
- 左カラムに終了ボタン（PowerIcon）を追加した。設定ボタンの下、ドラッグハンドルの上に配置し、押下でアプリを即時終了する（`exit_app` Tauri コマンド経由）

## [0.5.6] - 2026-07-08

### Changed

- トップバーのレイアウトを横1行から「左カラム（アイコン縦並び）＋右エリア（テキスト入力）」の2カラム構成に変更した。縦幅を約160pxに拡大し、SystemAudio・マイク・設定ボタン・ドラッグハンドルを左カラムに縦並びで配置、テキスト入力欄を右エリアに配置した。音声キャプチャ中も同2カラム構造に合わせて調整した

## [0.5.5] - 2026-07-08

### Changed

- トップバーの設定ボタンのアイコンを ✨（SparklesIcon）から ⚙️（Settings）に変更した。ボタンの目的（設定を開く）が一目で伝わるようになった。あわせてボタンの `title` 属性を「開発者スペースを開く」から「設定を開く」に変更した

## [0.5.4] - 2026-07-07

### Changed

- トップバーのスクリーンショットボタンおよびファイル添付ボタンを非表示にした。Interview-Pilot の主要ユースケース（面接支援・テキスト質問応答）では使用しないため、UIをシンプル化した。コンポーネントファイル自体（`Screenshot.tsx` / `Files.tsx`）は将来の再利用に備えて保持している

## [0.5.3] - 2026-07-07

### Notes

- コード変更なし。OpenSpec変更 `update-dependencies-minor-patch`(v0.5.1/v0.5.2で実施した依存関係更新の計画・仕様)をアーカイブした。`tasks.md` は実際の完了状況(npm更新・typecheck/lint/build・CI経由のtauriビルド確認は完了、cargo未導入によるRust依存更新・手動回帰確認・メジャー更新の別チケット化は未実施)に合わせて更新済み。delta spec `dependency-currency` はRust側要件が未達のためmain specへは同期していない

## [0.5.2] - 2026-07-07

### Fixed

- **hotfix**: v0.5.1 で更新した `@tauri-apps/api` / `@tauri-apps/plugin-opener` / `@tauri-apps/plugin-sql` が、対応する Rust 側crate(`tauri` 2.8.2、`tauri-plugin-opener` 2.4.0、`tauri-plugin-sql` 2.3.0)より大きく先行してしまい、`tauri build` のバージョン不一致チェックでCIビルドが失敗していた(GitHub Releaseは未作成)。作業環境に Rust ツールチェーン(`cargo`)が無く Rust 側を追従更新できないため、この3パッケージのみ更新前のバージョン(2.8.0 / 2.4.0 / 2.3.0)に戻して整合を保った

### Notes

- 次回 cargo が使える環境で `cargo update` を実行し、`@tauri-apps/*` npmパッケージも合わせて追従更新することを推奨する
- typecheck・lint・build・`npm ci`・GitHub Actions publish-tauriビルドで回帰がないことを確認済み

## [0.5.1] - 2026-07-06

### Changed

- npm依存パッケージを既存の`package.json`のセマンティックバージョン範囲(`^`)内でマイナー・パッチレベルに更新した(`npm update`)。メジャーバージョンアップ(`lucide-react`、`recharts`、`typescript`、`vite` 8系、`@vitejs/plugin-react` 6系など)は互換性への影響が大きいため対象外とした

### Notes

- 作業環境に Rust ツールチェーン(`cargo`)が無く、`src-tauri/`(Cargo依存関係)の更新は今回未実施
- typecheck・lint・buildで回帰がないことを確認済み(GitHub Actions publish-tauriビルドはRust側とのバージョン不一致により失敗。[0.5.2]で修正)

## [0.5.0] - 2026-07-06

### Removed

- **BREAKING**: Pluely から継承していたアプリ内自動アップデート機能を完全に削除した。対象: 更新確認・ダウンロード・インストールUI(`Updater`コンポーネント)、`tauri-plugin-updater` / `@tauri-apps/plugin-updater` のプラグイン登録・依存関係、`tauri.conf.json` の `plugins.updater`(Pluely の更新サーバーエンドポイント・公開鍵)設定、`bundle.createUpdaterArtifacts`、両capabilitiesファイルの `updater:default` 権限。他で未使用だった `@tauri-apps/plugin-process` 依存も合わせて削除した
- 本フォークは第三者への再配布を予定しておらず、独自のリリースワークフローも更新マニフェスト(updater JSON)を生成しない方針のため、Pluely本家の更新サーバーを参照し続ける当該機能は死んだコード、あるいは誤ってPluely本家のリリースに誘導しかねない不整合な残留物だった。今後、新バージョンの入手は GitHub Releases からの手動ダウンロードのみとなる(`openspec/specs/manual-update-distribution/spec.md` に方針を明記)

### Notes

- `src-tauri/`(Rust/Tauriバックエンド)の変更を含む。作業環境に Rust ツールチェーン(`cargo`)が無く、`cargo build` / `cargo fmt --check` / `cargo clippy` を実行できなかったため、`Cargo.toml`/`Cargo.lock` はバージョン・依存関係の記述のみ手動更新した。次回 cargo が使える環境でのビルド時に整合性を再確認すること
- 詳細は `openspec/changes/remove-pluely-updater/` を参照

## [0.4.0] - 2026-07-06

### Changed

- **BREAKING**: これまで `hasActiveLicense`(このフォークには存在しないライセンスサーバー由来のフラグで、常に `false`)によってロックされていた製品機能を、常に利用可能にした。対象: メインオーバーレイのマウスドラッグ、テーマ/ウィンドウ透過度、応答の長さ・言語・自動スクロール設定、Pluelyプロンプトプリセット、AIプロンプト生成、サイドバーの「サポートに問い合わせ」メニュー項目、スクリーンショット範囲選択キャプチャモード、チャット入力エリア(添付・マイク・スクリーンショット・送信)、音声ポップオーバーのスクリーンショット添付ボタン、キーボードショートカットの再割り当て(`move_window` を除く)
- ライセンス購入・登録の導線を削除した: `GetLicense` CTAの各呼び出し箇所、ダッシュボードのライセンスCTA・宣伝文言、`PluelyApiSetup.tsx`(ライセンスキー入力・有効化/無効化・「Pluely API 有効化」トグル・Pluelyホストモデル選択)を削除した

### Notes

- `src-tauri/`(Rust/Tauriバックエンド)には一切手を入れていない。矢印キー `move_window` ショートカットの `LicenseState` ゲート、および Pluely SaaS プロキシバックエンド(`activate.rs`、`api.rs`)は、このフォークで既に非機能のまま意図的に維持している
- `GetLicense.tsx`・`Promote.tsx` コンポーネント自体、および `pluely.api.ts` 等のバックエンド連携ロジックは削除せず、到達不能なコードとして残している(呼び出し箇所のみ削除)
- 詳細は `openspec/changes/personal-fork-ux-fixes/` を参照

## [0.3.0] - 2026-07-04

### Changed

- `package.json` / `src-tauri/Cargo.toml` の name、`src-tauri/tauri.conf.json` の `productName` / `identifier` を fork元の `pluely` / `Pluely` / `com.srikanthnani.pluely` から `interview-pilot` / `Interview-Pilot` / `com.interview-pilot.app` に変更した
- ネイティブウィンドウタイトル(`window.rs`、`tauri.conf.json` の `app.windows[0].title`)を `Interview-Pilot` 表記・日本語化した
- Windows インストーラの言語設定を日本語化した(`bundle.windows.wix.language: ["ja-JP"]`、`bundle.windows.nsis.languages: ["Japanese"]`)。次回ビルドから MSI ファイル名が `_ja-JP` サフィックスになり、MSI/NSIS インストール中のウィザード文言も日本語表示になる見込み(実機検証はこのリリースのビルドで確認する)
- アプリ内UIのユーザー向け表示文言に残っていた「Pluely」ブランド表記(サイドバーロゴ、エラー画面、ダッシュボード、設定画面、権限案内、ショートカット説明、footer メニュー等)を `Interview-Pilot` または汎用名(「クラウドAPI」「推奨プロンプト」等)に置き換えた。関数名・コンポーネント名・ファイル名・localStorage キー名・コード内コメントは対象外とし、既存ローカルデータへの影響を避けた
- `Contribute`/`Promote` コンポーネントや `support@pluely.com` など、実際に pluely.com 本家サービスを指す文言は実態と乖離させないため置き換え対象外とした

### Notes

- `identifier` の変更により、既存インストール環境では旧 Pluely 名義のインストールが残る可能性がある(未検証、次回リリースで確認)
- `src-tauri/Cargo.lock` はこの作業環境に Rust ツールチェーンが無く `cargo` を実行できなかったため、`name`/`version` フィールドのみ手動更新した。次回 Rust 環境でのビルド時に整合性を再確認すること

## [0.2.0] - 2026-07-03

### Added

- アプリUI全体を日本語化した。`src/layouts`・`src/components`・`src/pages`(app/audio/screenshot/settings/system-prompts/shortcuts/dashboard/responses/chats/dev)配下の英語のハードコード文字列を日本語に置き換え、実行時の言語切り替え機能は導入せず単一の日本語UIとした
- サイドバーのナビゲーションラベル(`useMenuItems.tsx`)、ショートカット名・説明(`config/shortcuts.ts`)、回答の長さ・言語選択の選択肢(`lib/response-settings.constants.ts`)、UIに表示されるエラーメッセージ(hooks/lib内)も日本語化した
- Tauriのネイティブウィンドウタイトルを日本語化した
- `moment.locale("ja")` をアプリ起動時にグローバル設定し、相対時刻表示(`fromNow()`)などが日本語で表示されるようにした

### Notes

- Pluely由来のライセンスキー課金・紹介マーケティング機能(Contribute/Promote/GetLicense/PluelyApiSetup)は削除せず、文言のみ日本語化した。削除の要否は別途検討する
- コードコメント・ログ出力・内部識別子は対象外(英語のまま)

## [0.1.19] - 2026-07-03

### Changed

- `docs/仕様/GitHub Actions リリース手順.md` に v0.1.17/v0.1.18 の検証結果(`publish.yml` 削除漏れによる二重ビルドと `hotfix/v0.1.18` での修正、および `gh` CLI・REST/GraphQL API の Release 反映遅延が想定より長く続きうることの実地確認)を記録した
- `merge-ci-publish-workflow` change のタスク記録に、アーカイブ後に判明したインシデントと解決結果を追記した

## [0.1.18] - 2026-07-03

### Fixed

- v0.1.17 リリース作業で `.github/workflows/publish.yml` を `rm` した後、`git add` にこのファイルを含め忘れたため削除がコミットされておらず、`main` に旧 `publish.yml`(CI 成功をゲートしない版)が残存していた。そのため `v0.1.17` タグ push で `ci.yml` と `publish.yml` の両方が起動し、Windows ビルドが二重に実行され、`v0.1.17` の draft Release にインストーラが重複アップロードされた。本リリースで `publish.yml` の削除を正しくコミットし、単一ワークフロー(`ci.yml`)構成に修正した

## [0.1.17] - 2026-07-03

### Changed

- `.github/workflows/ci.yml` と `.github/workflows/publish.yml` を1つのワークフローファイル(`ci.yml`)に統合した。`publish-tauri`(Windows インストーラビルド・draft Release 作成)ジョブは `frontend`(型チェック・lint)と `rust`(`cargo fmt --check`・`clippy`)の CI ジョブが成功し、かつタグが `main` 上にある場合のみ実行されるようになった(`needs: [frontend, rust, verify-tag-on-main]` / `if: success() && needs.verify-tag-on-main.outputs.on_main == 'true'`)。従来は CI とビルド・Release作成が独立したワークフローで同時に走っており、CI が失敗するコードにタグを打ってもビルド・Release作成が完走してしまっていた
- `.github/workflows/publish.yml` を削除した
- `frontend` / `rust` の CI ジョブが `workflow_dispatch`(手動実行)でも起動するようにした

## [0.1.16] - 2026-07-03

### Changed

- `README.md` を Pluely upstream 由来の英語・商用マーケティング文言(寄付/雇用勧誘バッジ、作者個人SNSリンク、`pluely.com` ダウンロードリンク・バッジ、ライセンス販売訴求)から、Interview-Pilot(個人利用前提の面接支援アプリ)向けの日本語説明に全面的に書き直した。`docs/仕様/要求仕様書.md` 8.6節の倫理方針に反する「ステルス」「検知されない」訴求表現も中立的な説明に置き換えた
- `SECURITY.md` を日本語化し、upstream リポジトリ・連絡先への参照を本リポジトリ向けの内容に置き換えた
- 完了済みの OpenSpec change(`rebrand-readme-security-ja`, `enrich-agent-skills-and-config`)を `openspec/changes/archive/` にアーカイブし、対応する capability spec を `openspec/specs/` に同期した

### Fixed

- `.github/workflows/publish.yml` の起動条件を `main` push OR `v<version>` タグ push から、`v<version>` タグ push かつそのタグの指すコミットが `main` の履歴に含まれる場合のみ（AND条件）に変更した。`release/v<version>` を `main` にマージした直後に対応するタグを push すると、同一コミットに対してビルドが2回（main push分・タグ push分）走ってしまう問題を解消した
- 判定用に `verify-tag-on-main` ジョブ（`ubuntu-latest`）を追加し、`git merge-base --is-ancestor` でタグが `main` 上にあるかを確認してから Windows ビルドジョブを実行するようにした。`main` に含まれないタグ push（例: `release/*` ブランチ上での誤タグ）ではビルドをスキップする。`workflow_dispatch`（手動実行）はこの判定の対象外とする

## [0.1.15] - 2026-07-03

### Added

- Claude Code / Codex CLI 向けの案件固有エージェントスキル4件（`pluely-cleanup-checklist`, `tauri-rust-conventions`, `interview-support-domain`, `local-llm-stt-integration`）を `.claude/skills/` と `.codex/skills/` に追加
- プロジェクト概要・技術スタック・ディレクトリ構成・OpenSpecワークフローをまとめた `CLAUDE.md` を新設
- チーム/リポジトリ共通で安全な許可ルールを収録する `.claude/settings.json`（git管理下）を新設

### Changed

- `.claude/skills/` にのみ存在していた4スキル（`building-components`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`）を `.codex/skills/` にミラーし、パリティを回復
- `.claude/settings.local.json` から、読み取り専用・定型コマンドの許可ルールを `.claude/settings.json` に移動

### Fixed

- `package.json` / `src-tauri/Cargo.toml` のみバージョンを更新し `src-tauri/tauri.conf.json` / `package-lock.json` の更新を漏らしたため、実際のアプリバージョンが `0.1.13` のままビルドされ、既存の `v0.1.13` draft release に誤ってインストーラがアップロードされる問題があった。`v0.1.14` は正式リリースされておらず欠番とし、本リリースで全バージョンフィールドを揃えて修正した

## [0.1.13] - 2026-07-03

### Changed

- `feature/*` を安定ブランチへ直接マージすることを禁止し、`main` へのあらゆる push（ドキュメント整理や OpenSpec アーカイブを含む）は必ず `release/v<version>` を経由するよう `docs/仕様/ブランチ・リリース戦略.md` と `branch-release-strategy` スキルを更新

## [0.1.12] - 2026-07-03

### Added

- GitHub Actions で lint / 型チェックを実行する `ci` ワークフローを新設（push全ブランチ + main向けPRで起動）
- ESLint を導入（TypeScript + React 向け最小構成）

### Changed

- `src-tauri/src/speaker/linux.rs` の import 順序を `cargo fmt` に合わせて修正

## [0.1.11] - 2026-07-03

### Added

- `CHANGELOG.md` を新設し、Keep a Changelog 風の形式で運用を開始

### Changed

- `publish` ワークフローの GitHub Release 本文を、固定文言から `CHANGELOG.md` の該当バージョンのエントリを抽出する方式に変更（該当エントリがない場合は従来の固定文言にフォールバック）

## [0.1.10] - 2026-07-02

### Added

- GitHub Actions で Windows 向けインストーラをビルドし、draft の GitHub Release に添付する `publish` ワークフローを整備
- `branch-release-strategy` スキルを Claude Code / Codex に登録

### Changed

- `.github/workflows/publish.yml` の起動条件を `main` push / `v<version>` タグ push / 手動実行に変更
- Pluely 由来の secret 依存・署名依存・updater JSON 生成をビルドから除去（署名なしビルドで開始）
