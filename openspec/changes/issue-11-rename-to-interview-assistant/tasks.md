## 1. 方針確認(ユーザー判断待ち)

- [x] 1.1 `productName` を Title-Case ハイフン区切り(`"Interview-Assistant"`、design.md Decisions 1 の仮決定)にするか、Issue 本文どおり全小文字(`"interview-assistant"`)にするかをユーザーに確認する
- [x] 1.2 `identifier` を `com.interview-pilot.app` から `com.interview-assistant.app` に変更してよいかをユーザーに確認する(design.md Decisions 2)。開発機に旧 identifier でインストール済みの場合、新 identifier でのインストール前にアンインストールが必要になる可能性がある旨も合わせて確認する

## 2. 実装(1章の決定内容に基づく)

- [x] 2.1 `package.json` の `name` を更新する(`"interview-assistant"`)
- [x] 2.2 `src-tauri/Cargo.toml` の `[package] name` / `[lib] name` を更新する(`"interview-assistant"` / `"interview_assistant_lib"`)。あわせて `src-tauri/src/main.rs` の `interview_pilot_lib::run()` 呼び出しを `interview_assistant_lib::run()` に更新する(`[lib] name` を変更した場合、この参照を合わせて更新しないと `cargo build` がクレート名不一致でエラーになる)
- [x] 2.3 `src-tauri/tauri.conf.json` の `productName` を 1.1 の決定に基づき更新する
- [x] 2.4 `src-tauri/tauri.conf.json` の `identifier` を 1.2 の決定に基づき更新する
- [x] 2.5 `src-tauri/src/window.rs` のウィンドウタイトル(`"Interview-Pilot - ダッシュボード"` 等、複数OS分岐箇所)を `"Interview-Assistant - ダッシュボード"` に更新する
- [x] 2.6 `src-tauri/tauri.conf.json` の `app.windows[0].title`(`"Interview-Pilot - AIアシスタント"`)を `"Interview-Assistant - AIアシスタント"` に更新する
- [x] 2.7 `grep -rn "Interview-Pilot\|interview-pilot\|interview_pilot" src/ src-tauri/ .github/ --include="*.tsx" --include="*.ts" --include="*.rs" --include="*.json" --include="*.toml" --include="*.yml"` で網羅的に洗い出し、ユーザー向け表示文言(JSX にレンダリングされる文字列)のみを「Interview-Assistant」に置き換える。関数名・コンポーネント名・ファイル名・localStorage キー名・コード内コメント・`console.*` ログは対象外とする(design.md Decisions 4)。`.github/workflows/ci.yml` の `releaseName: "Interview-Pilot v__VERSION__"`(GitHub Release タイトルとしてユーザーに表示される)も置き換え対象に含める
- [x] 2.8 `package-lock.json` を `npm install` で再生成する。`Cargo.lock` はビルド環境で `cargo check` 等を実行し、`name` フィールドの整合性を確認する
- [x] 2.9 `package.json` / `src-tauri/Cargo.toml` の `repository` / `homepage` / `bugs` / `documentation` URL を `youfuku-sg/interview-assistant` に更新する。`pluely.desktop` / `pluely.db` は互換性維持のため変更しない
- [x] 2.10 `src/hooks/useMenuItems.tsx` の upstream 問い合わせ先・Web・GitHub・作者支援リンクを現在のプロジェクトに有効な導線へ置換し、代替がない項目は削除する。README の fork 元クレジットは維持する

## 3. ドキュメント整備

- [x] 3.1 `docs/仕様/GitHub Actions リリース手順.md` に、インストーラファイル名が新しい `productName` に由来する旨と、新しいファイル名の例を記載する
- [x] 3.2 `CLAUDE.md` の「Package/binary name, productName, and identifier are interview-pilot / Interview-Pilot / com.interview-pilot.app」の記述を新しい名称に更新する。同じ行のリンク `[rebrand-product-identity](openspec/changes/rebrand-product-identity/)` は当該 change がすでに `openspec/changes/archive/2026-07-04-rebrand-product-identity/` にアーカイブ済みで現在リンク切れになっているため、この行を編集する機会にあわせてアーカイブ後のパスに修正する
- [x] 3.3 `docs/仕様/要求仕様書.md` 等、製品名に言及している仕様書があれば該当箇所を更新する(実装時に `grep -rln "Interview-Pilot" docs/` で確認する)
- [x] 3.4 `README.md` のタイトル・本文・バッジ・clone 手順を `Interview-Assistant` / `youfuku-sg/interview-assistant` に更新し、`SECURITY.md` の脆弱性報告 URL も現在のリポジトリへ更新する
- [x] 3.5 `README.md`、`SECURITY.md`、`CLAUDE.md`、`docs/`、`src/`、`src-tauri/`、`.github/` を対象に旧名称・旧リポジトリ URL の残存を検索する。`CHANGELOG.md` の履歴と自動生成される `openwiki/` は手動置換の対象外とする
- [x] 3.6 `openspec/specs/` を検索し、`top-bar-ui` / `manual-update-distribution` / `project-documentation` の Purpose や説明文など旧製品名を固定したテキストを新名称へ更新する。要件の意味は変えない
- [x] 3.7 `pluely-cleanup-checklist` の検索を実行し、README の fork 元クレジットや互換性維持の内部名を除いて、製品メタデータ・ユーザー向けコピー・リンクに不要な upstream identity/contact/marketing residue がないことを確認する

## 4. 検証

- [x] 4.1 `npm run typecheck` / `npm run build` / `npm run lint` が成功することを確認する
- [ ] 4.2 Rust ツールチェーンが使える環境で `cargo fmt --check` / `cargo clippy` / `cargo check` が成功することを確認する
- [ ] 4.3 次回ビルド(`build/<name>` への push、またはリリースビルド)で、生成される Windows インストーラのファイル名が新しい `productName` を反映していることを確認する
- [ ] 4.4 `identifier` を変更した場合、既存インストール環境でのアンインストール・新規インストールの動作を確認する
- [ ] 4.5 アプリを起動し、ダッシュボード・サイドバー・エラー画面・設定画面・権限案内・ウィンドウタイトル等、2.7 で洗い出した箇所すべてで「Interview-Pilot」表記が「Interview-Assistant」に置き換わっていることを目視確認する(ユーザーによる動作検証、Issue駆動開発フロー 4.11)
