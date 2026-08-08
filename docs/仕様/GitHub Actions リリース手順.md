# GitHub Actions リリース手順

## 1. 目的

この文書は、GitHub Actions の `ci` ワークフロー(`.github/workflows/ci.yml`)のうち、Windows 向けインストーラを作成し draft の GitHub Release に添付する部分(`verify-tag-on-main` / `publish-tauri` ジョブ)の手順をまとめる。`frontend` / `rust` の CI チェックジョブについては `CI.md` を参照。

ブランチ運用、タグ規則、リリース方針は `ブランチ・リリース戦略.md` に従う。

## 2. 前提

- 作業ブランチは `feature/<name>` を使う
- リリース準備が必要な場合は `release/v<version>` を使う
- タグは `v<version>` 形式を使う
- CI(lint・型チェック・fmt・clippy)・ビルド・Release 作成はすべて単一のワークフローファイル `.github/workflows/ci.yml` にまとまっている(`frontend` / `rust` / `verify-tag-on-main` / `publish-tauri` の4ジョブ構成)
- Windows ビルドジョブ(`publish-tauri`)は `v*` タグ push、または手動実行 (`workflow_dispatch`) をトリガーとする
- `main` への通常 push（タグを伴わない）では `publish-tauri` は起動しない(`frontend` / `rust` の CI ジョブのみ実行される)
- タグ push で起動した場合、`verify-tag-on-main` ジョブが `git merge-base --is-ancestor` でタグの指すコミットが `main` の履歴に含まれるか判定する。含まれる場合のみ次の条件へ進み、含まれない場合（例: `release/*` ブランチ上で誤ってタグを打った場合）は `publish-tauri` がスキップされる
- `publish-tauri` は `needs: [frontend, rust, verify-tag-on-main]` により、CI(`frontend` / `rust`)が成功し、かつタグが `main` 上と判定された場合にのみ実行される。CI が失敗した場合、タグが `main` 上にあってもビルドは実行されない
- 手動実行 (`workflow_dispatch`) は `main` 上判定の対象外で、CI が成功すれば常にビルドが実行される
- `main` へのマージ push とその直後の `v<version>` タグ push が同一コミットに対して発生しても、ビルドはタグ push 側の1回のみ実行される
- 当面の成果物は Windows 向けインストーラのみとする
- Release は draft として作成する
- Release 本文は `CHANGELOG.md` の該当バージョンのエントリを自動反映する（該当エントリがない場合は固定文言にフォールバックする）
- Tauri updater 用 JSON は生成しない
- コード署名は当面設定しない

## 3. 手動実行手順

1. GitHub の対象リポジトリを開く
2. `Actions` タブを開く
3. 左側の workflow 一覧から `ci` を選ぶ
4. `Run workflow` を押す
5. 実行対象のブランチを選ぶ
6. `Run workflow` を確定する
7. 実行ログで `frontend` / `rust` / `verify-tag-on-main` / `publish-tauri` の各 job が開始されることを確認する

## 4. タグ push 実行手順

通常のリリースは `release/v<version>` を `main` にマージした後、そのコミットにタグを push する。

1. `main` にマージ済みであることを確認する
2. `v<version>` 形式でタグを作成する
3. タグを GitHub に push する
4. GitHub の `Actions` タブで `ci` ワークフローが起動したことを確認する(`frontend` / `rust` が成功し、`verify-tag-on-main` ジョブがタグを `main` の履歴に含まれると判定した場合のみ、続けて `publish-tauri` ジョブが実行される)

例:

```bash
git tag v0.1.10
git push origin v0.1.10
```

`main` にマージされていないコミット（`feature/*` / `release/*` ブランチ上など）にタグを push した場合、`verify-tag-on-main` ジョブは起動するが `on_main` が `false` と判定され、`publish-tauri` はスキップされる。CI(`frontend` / `rust`)が失敗した場合も、タグが `main` 上であるかどうかに関わらず `publish-tauri` はスキップされる。

## 5. 成功時の確認

ワークフローが成功したら、以下を確認する。

- `frontend` / `rust` / `verify-tag-on-main` / `publish-tauri` の各 job が成功している
- GitHub Releases に draft release が作成されている
- draft release の名前が `Interview-Assistant v<version>` になっている
- Windows 向けインストーラが添付されている
- updater 用 JSON が添付されていない

## 6. 失敗時のログ確認

ワークフローが失敗した場合は、以下の順で原因を追う。

1. GitHub の `Actions` タブを開く
2. 失敗した `ci` の実行を開く
3. 失敗した job(`frontend` / `rust` / `verify-tag-on-main` / `publish-tauri`)を開く
4. 赤いアイコンが付いた失敗ステップを開く
5. ステップ末尾のエラーを確認する
6. 必要に応じて、直前のステップの標準出力も確認する

よく見るポイント:

- `frontend` job: `npm run typecheck` / `npm run lint` のエラー(型エラー・ESLint エラー)
- `rust` job: `cargo fmt --check` のフォーマット崩れ
- `Install frontend deps`（`publish-tauri` 内）: `npm ci` の依存関係エラー
- `Build & publish`: Tauri のビルドエラー、Rust のコンパイルエラー、Release 作成エラー
- `GITHUB_TOKEN` の権限: Release 作成に必要な `contents: write` が有効か
- `publish-tauri` が実行されない場合、まず `frontend` / `rust` が成功しているか、`verify-tag-on-main` の判定結果（ログの `on_main` 出力）を確認する

インストーラのファイル名は `src-tauri/tauri.conf.json` の `productName` / `bundle.windows.wix.language` に由来する。現在の `productName` は `Interview-Assistant`、`wix.language` は `ja-JP` なので、`Interview-Assistant_<version>_x64_ja-JP.msi` / `Interview-Assistant_<version>_x64-setup.exe` のような名前になる想定。次回リリースで実際のファイル名・インストール中のウィザード文言（日本語化されているか）を確認すること。

## 7. 注意点

- 署名なしビルドのため、Windows SmartScreen の警告が出る可能性がある
- draft release の内容を確認してから、必要に応じて公開する
- macOS / Linux 向け成果物は今回の対象外とする
- `gh` CLI（`gh release view` / `gh api repos/<owner>/<repo>/releases` 等）はワークフロー完了直後、実際には Release が作成済みでも一時的に空の結果を返すことがある（反映遅延）。`gh` で確認できない場合は、GitHub の Releases ページをブラウザで直接確認する

## 8. main ブランチ運用下での検証結果（v0.1.11）

`release-installer-verification` change にて、`release/v0.1.11` → `main` マージ → `v0.1.11` タグ push という実際の手順で以下を確認した。

- `main` push（run `28609307222`）: 成功。draft Release が作成され、Windows インストーラが添付された
- `v0.1.11` タグ push（run `28609316798`）: 成功。同一 Release に反映された
- `feature/*` / `release/v<version>` ブランチへの push ではワークフローが起動しないことを確認した
- Release 本文が `CHANGELOG.md` の `## [0.1.11]` エントリを反映するかは、ユーザーによる GitHub Releases ページの目視確認待ち（`gh` CLI 側は反映遅延で未確認）

## 9. main 上タグ限定トリガーの検証結果（v0.1.16）

`publish-trigger-tag-on-main-only` change にて、`release/v0.1.16` → `main` マージ → `v0.1.16` タグ push という実際の手順で AND 条件（タグ push かつ `main` 上）が機能することを確認した。

- `main` push（`release/v0.1.16` マージ後の push）: `publish` ワークフローの新規実行は発生しなかった（`gh run list` で確認）。旧来の二重ビルド（`main` push 分・タグ push 分の2回起動）が解消された
- `v0.1.16` タグ push（run `28619541798`）: `verify-tag-on-main` ジョブが成功（`main` 上と判定）→ `publish-tauri` ジョブが成功し、Windows インストーラ（NSIS/MSI）2点を draft Release にアップロードした
- 検証用タグ `v0.1.16-test-not-on-main`（`main` に含まれないコミットに push、run `28619571245`）: `verify-tag-on-main` ジョブは成功したが `on_main=false` と判定し、`publish-tauri` ジョブは `skipped` になった。検証後、当該タグとコミットのブランチは削除済み
- `workflow_dispatch`（手動実行）の動作は、Claude Code の `gh` トークンに発火権限（`Must have admin rights to Repository`）がなく自動検証できなかった。GitHub の Actions タブからのユーザー自身による確認が必要

## 10. ci.yml への統合とインシデントの検証結果（v0.1.17 / v0.1.18）

`merge-ci-publish-workflow` change にて `.github/workflows/publish.yml` を `.github/workflows/ci.yml` に統合したが、実装時に `rm` したファイルを `git add` し忘れ、削除がコミットされないまま `v0.1.17` としてリリースしてしまった。

- `v0.1.17` タグ push: `ci.yml`（新・CI ゲート付き、run `28620767431`）と `publish.yml`（旧・削除漏れ、run `28620767394`）の両方が起動し、Windows ビルドが二重実行され、同一の draft Release にインストーラが重複アップロードされた
- `hotfix/v0.1.18` で `publish.yml` の削除を正しくコミットし、`main` にマージ・push
- `v0.1.18` の `main` push: CI ジョブ（`frontend`/`rust`）のみ起動し、`publish.yml` は起動しようがなくなった（ファイル自体が存在しないため）
- `v0.1.18` タグ push（run `28621973076`）: `frontend` → `rust` → `verify-tag-on-main` → `publish-tauri` の4ジョブすべてが成功
- Release の実在確認: `gh api repos/<owner>/<repo>/releases`・`gh release list`・GraphQL (`releases { totalCount }`)・認証なし `curl` のいずれも一時的に `0`件・空を返したが、ユーザーがブラウザで GitHub Releases ページを直接確認したところ Release は実在し、CHANGELOG 本文も反映されていた。`gh` CLI・REST/GraphQL API の反映遅延は、想定していたよりも長く続く場合がある（数分〜十数分単位で解消しないことがある）。Release の存在確認は API に頼らず、疑わしい場合はブラウザで直接確認すること
