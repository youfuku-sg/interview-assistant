## ADDED Requirements

### Requirement: 製品識別名が GitHub リポジトリ名と一致している
アプリの製品識別名(`src-tauri/tauri.conf.json` の `productName`、`package.json` の `name`、`src-tauri/Cargo.toml` の `[package] name`)は、GitHub リポジトリ名(`interview-assistant`)に対応する名称でなければならない (SHALL)。GitHub 上でリポジトリ名が変更された場合、アプリ側の製品識別名がそれと乖離した状態(例: リポジトリ名は `interview-assistant` だがアプリの `productName` は `Interview-Pilot` のまま)を放置してはならない (SHALL NOT)。

#### Scenario: リポジトリ名とアプリの製品識別名が一致する
- **WHEN** ユーザーが `package.json` の `name`、`src-tauri/Cargo.toml` の `[package] name`、`src-tauri/tauri.conf.json` の `productName` を確認する
- **THEN** いずれも GitHub リポジトリ名(`interview-assistant`)に対応する名称になっており、fork元(`Pluely`)や旧ブランド名(`Interview-Pilot`)のままではない

#### Scenario: リポジトリ名変更後に製品識別名の乖離が残らない
- **WHEN** GitHub 上のリポジトリ名が変更され、対応する OpenSpec change が承認・アーカイブされる
- **THEN** アプリの `productName` / パッケージ名 / ネイティブウィンドウタイトルが新しいリポジトリ名を反映した名称に更新されている
