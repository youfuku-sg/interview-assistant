## Context

現在の識別子・名称関連の設定(2026-08-04 時点):

- `package.json`: `"name": "interview-pilot"`、`"homepage"` / `"repository.url"` / `"bugs.url"` は fork元 `iamsrikanthnani/pluely` のまま(前回 change のスコープ外だった残存箇所)
- `src-tauri/Cargo.toml`: `[package] name = "interview-pilot"`、`[lib] name = "interview_pilot_lib"`、`repository`/`homepage`/`documentation` も `iamsrikanthnani/pluely` のまま
- `src-tauri/tauri.conf.json`: `"productName": "Interview-Pilot"`、`"identifier": "com.interview-pilot.app"`
- `src-tauri/tauri.conf.json` の `app.windows[0].title`: `"Interview-Pilot - AIアシスタント"`
- `src-tauri/src/window.rs`: メインダッシュボードウィンドウの `.title("Interview-Pilot - ダッシュボード")`(前回 change で Pluely から置き換え済み)
- `src-tauri/tauri.conf.json` の `bundle.resources` に `"pluely.desktop"`、`bundle.windows.wix.language` は `["ja-JP"]`、`bundle.windows.nsis.languages` は `["Japanese"]`(前回 change で日本語化済み、今回変更不要)
- `src-tauri/tauri.conf.json` の `plugins.sql.preload` が `"sqlite:pluely.db"` を指定しており、DB ファイル名自体が `pluely.db` のまま(前回 change・`localize-ui-japanese` のいずれでもスコープ外だった残存箇所)
- `.github/workflows/ci.yml` の `releaseName: "Interview-Pilot v__VERSION__"` が GitHub Release のタイトルとして「Interview-Pilot」を表示しており、`src/`・`src-tauri/` のみを対象とした grep(前回 change・design.md 双方の想定範囲)では見落とされる。今回のリネームでは `.github/` も grep 対象に含める(tasks.md 2.7)
- Git リモート(`origin`)はすでに `https://github.com/youfuku-sg/interview-assistant` を指しており、GitHub 上のリポジトリ名は `interview-assistant` に変更済み。今回の Issue #11 はこのリポジトリ名とアプリ内の製品名(`Interview-Pilot`)の不一致を解消したいという要望である
- 実際に Tauri アプリを起動できない作業環境(Rust ツールチェーン・GUI なし)であるため、アプリ内UIに「Interview-Pilot」表記が実際に残っているかは、前回 change のアーカイブ内容(`openspec/changes/archive/2026-07-04-rebrand-product-identity/`)と grep による確認に頼る。前回 change の Impact に列挙された箇所(`src/components/Sidebar.tsx` 等)はすべて「Interview-Pilot」に置き換え済みのはずだが、実装時に改めて `grep -rn "Interview-Pilot\|interview-pilot" src/ src-tauri/ --include="*.tsx" --include="*.ts" --include="*.rs" --include="*.json" --include="*.toml"` で網羅的に洗い出す必要がある

`openspec/specs/product-branding/spec.md` の既存要件(「アプリ内UIのブランド名表記が統一されている」)は、fork元「Pluely」の名称ではなく「決定した新しいブランド名」で統一することを一般的に規定しており、ブランド名が何であるかを固定していない。同様に `openspec/specs/installer-release-workflow/spec.md` の「生成物のファイル名がアプリの productName に追従する」要件も `productName` の値そのものを固定していない。そのため、`Interview-Pilot` → `interview-assistant` への再リネーム自体はこれら既存要件の枠組みの中で実施でき、`installer-release-workflow` 側の要件文言変更は不要と判断する。一方で、Issue #11 は単なる「内部で名称が統一されていること」ではなく「GitHub リポジトリ名と製品識別名を一致させたい」という、従来の `product-branding` 要件より一段具体的な要望であるため、`product-branding` capability にこの観点を新しい requirement として追加する(proposal.md の Capabilities セクション参照)。

## Goals / Non-Goals

**Goals:**
- `productName` / パッケージ名 / `identifier` を `interview-assistant` 系列に変更する場合の具体的な値と、変更範囲(ファイル一覧)を確定する
- `identifier` 変更に伴うリスク(既存インストール環境との互換性)を、前回 change での知見を踏まえて再整理する
- アプリ内UIに残る可能性のある「Interview-Pilot」表記の置き換え候補を洗い出す
- 今回のリネームと合わせて対応すべきか判断が必要な残存箇所(`pluely.desktop` リソース名、`pluely.db` の DB ファイル名、`package.json`/`Cargo.toml` の fork元 URL)を明示し、スコープに含めるかどうかの方針を示す

**Non-Goals:**
- アプリアイコン・ロゴなど新規ビジュアルアセットの制作(前回 change から継続して対象外)
- ライセンス変更(GPL-3.0 のまま)
- macOS / Linux 向けの `identifier` 挙動の実機検証(前回 change 同様、Windows インストーラのみを対象とし、他OSは将来のリリース時に確認)
- 既存の `pluely.db` に保存されたローカルデータ(会話履歴・設定)のマイグレーション設計(DB ファイル名変更をスコープに含めると決めた場合でも、データ移行の詳細設計は別 change に切り出すことを検討する)

## Decisions

1. **`productName` / パッケージ名の変更**
   - 決定: `interview-assistant` に統一する。GitHub リポジトリ名(`youfuku-sg/interview-assistant`)とアプリの製品名を一致させることが Issue #11 の主旨であるため、前回のような Title-Case 表記(`Interview-Pilot`)ではなく、Issue 本文の表記(`interview-assistant`)をそのまま採用する
   - `package.json` の `name`: `"interview-assistant"`
   - `src-tauri/Cargo.toml` の `[package] name`: `"interview-assistant"`、`[lib] name`: Windows 上でのバイナリ名衝突回避のため `"interview_assistant_lib"`(前回の `interview_pilot_lib` と同じ命名規則)。`src-tauri/src/main.rs` は `interview_pilot_lib::run()` としてこのクレート名を直接参照しているため、`[lib] name` の変更と同時にこの呼び出しも `interview_assistant_lib::run()` に更新する必要がある(更新しないと `cargo build` がクレート名不一致でエラーになる)
   - `src-tauri/tauri.conf.json` の `productName`: `"Interview-Assistant"`(前回 change が `productName` に Title-Case ハイフン区切り(`Interview-Pilot`)を採用しており、インストーラファイル名等の表示に適した形式のため踏襲する)
   - 代替案として `productName` を `"interview-assistant"`(全小文字)にする案も検討したが、Windows インストーラ名(`interview-assistant_<version>_x64_ja-JP.msi`)の視認性が前回より下がるため採用しない

2. **`identifier` の変更**
   - 決定: `com.interview-pilot.app` から `com.interview-assistant.app` に変更する
   - リスク: 前回 change と同様、Tauri は `identifier` をアプリの一意識別に使うため、変更により OS 側(Windows のインストール済みアプリ一覧、将来的な updater)で別アプリとして扱われる可能性がある。開発機に `com.interview-pilot.app` 名義でインストール済みの場合、新しい identifier でのインストール前にアンインストールしておくことを次回リリース手順に記載する(前回 change の Decisions と同じ対応方針)

3. **ネイティブウィンドウタイトルの扱い**
   - 決定: 上記1と連動して置き換える。`window.rs` の `"Interview-Pilot - ダッシュボード"` を `"Interview-Assistant - ダッシュボード"` に、`tauri.conf.json` の `app.windows[0].title`(`"Interview-Pilot - AIアシスタント"`)を `"Interview-Assistant - AIアシスタント"` に変更する

4. **アプリ内UIの「Interview-Pilot」表記の置き換え**
   - 決定: 前回 change の踏襲として、ユーザー向け表示文言(JSX にレンダリングされる文字列)のみを「Interview-Assistant」に置き換える。関数名・コンポーネント名・ファイル名・localStorage キー名・コード内コメント・`console.*` ログは対象外とする(前回 change の決定と同じ理由: 表示文言のみのリネームに留め、差分と既存ローカルデータへの影響を最小化する)
   - 実装時に `grep -rn "Interview-Pilot\|interview-pilot" src/` で網羅的に洗い出し、対象箇所をリストアップしてから置き換える

5. **`bundle.resources` の `pluely.desktop`、`plugins.sql.preload` の `pluely.db`、fork元 URL(`iamsrikanthnani/pluely`)の扱い**
   - 決定: 今回のスコープには含めない
     - `pluely.desktop`: Linux 向け `.desktop` エントリのリソースファイル名。前回 change でも対象外とされており、変更するにはファイル自体のリネームと動作確認(Linux 環境)が必要なため、今回も見送る
     - `pluely.db`: 既存ローカルインストールのデータベースファイル名を変更すると、会話履歴・設定を含む既存データの移行処理が必要になる。今回の Issue はブランド名・識別子のリネームが主旨であり、データ移行を伴う変更は影響範囲・リスクが大きく別 change として扱うべきと判断する
     - `package.json` / `Cargo.toml` の `repository`/`homepage`/`bugs`/`documentation` URL: fork元 `iamsrikanthnani/pluely` から現在の実リポジトリ `youfuku-sg/interview-assistant` への更新は、今回のブランド名リネームと直接の依存関係はなく、独立して対応可能なドキュメント整合性の問題である。ユーザーへの確認事項として tasks.md に残すが、必須実装項目とはしない

## Risks / Trade-offs

- [Risk] `identifier` を変更すると、既存インストール環境(開発機など)で二重インストール状態になる可能性がある → [Mitigation] 変更前に既存インストールをアンインストールする手順を `docs/仕様/GitHub Actions リリース手順.md` 等に記載する(前回 change の Risk と同じ)
- [Risk] `productName` 変更後、初回ビルドで生成物名が変わることに伴う周知漏れ(過去のインストーラ名を前提にした手順書等) → [Mitigation] `docs/仕様/GitHub Actions リリース手順.md` の記載を更新する
- [Trade-off] `pluely.desktop` / `pluely.db` / fork元 URL を今回のスコープに含めないため、リネーム後も一部のファイル名・URL に旧ブランド名が残る。ユーザーへの説明が必要
- [Risk] 実際に Tauri アプリを起動して「Interview-Pilot」表記の置き換えを目視確認できる作業環境がない(前回 change と同じ制約) → [Mitigation] grep による網羅確認と `npm run typecheck` / `npm run build` の成功確認に留め、実機での目視確認はユーザー側の動作検証(Issue駆動開発フロー 4.11)に委ねる

## Open Questions

- `pluely.desktop` / `pluely.db` / fork元 URL(`iamsrikanthnani/pluely`)を今回のリネームに含めるべきか、次回以降の別 change に先送りしてよいか(Decisions 5 で「含めない」と一旦判断したが、ユーザーの意向を tasks.md の確認ステップで再確認する)
- `productName` を Title-Case(`Interview-Assistant`)にするか、Issue 本文どおり全小文字(`interview-assistant`)にするか(Decisions 1 で Title-Case を仮決定したが、ユーザーの意向を tasks.md の確認ステップで再確認する)
