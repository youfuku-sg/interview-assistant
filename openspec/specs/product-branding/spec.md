## Purpose

アプリ内でユーザーに表示されるブランド名表記(ロゴ、タイトル、セクション見出し、説明文等)に関する要件を定義する。

## Requirements

### Requirement: アプリ内UIのブランド名表記が統一されている
アプリ内のユーザー向けUI(サイドバーのロゴ、エラー画面、ダッシュボードのタイトル・説明文、設定画面、権限案内、ショートカット説明、footer メニュー等)に表示されるブランド名表記は、fork元である Pluely の名称ではなく、決定した新しいブランド名で統一されなければならない (SHALL)。ただし、Pluely 本家のクラウドサービスに実際に接続する機能(例: Pluely API)の扱いについては、表示名の変更のみか機能自体の見直しかをユーザーが個別に判断する (MAY)。

#### Scenario: サイドバー・エラー画面のロゴ表記
- **WHEN** ユーザーがサイドバーまたはエラー画面を表示する
- **THEN** ロゴ文字列は決定した新しいブランド名で表示され、fork元の「Pluely」表記ではない

#### Scenario: ダッシュボード・設定画面等の説明文
- **WHEN** ユーザーがダッシュボード・設定画面・権限案内・ショートカット説明を表示する
- **THEN** それらの説明文中のブランド名表記は決定した新しいブランド名で統一されている

#### Scenario: Pluely本家サービスに接続する機能名の扱い
- **WHEN** ユーザーが Pluely API 等、Pluely 本家のクラウドサービスに接続する機能に関する画面を表示する
- **THEN** その機能名の表示は、ユーザーが決定した方針(表示名のみ変更 / 機能自体の見直し)に従っている

### Requirement: 製品識別名が GitHub リポジトリ名と一致している
アプリの製品識別名(`src-tauri/tauri.conf.json` の `productName`、`package.json` の `name`、`src-tauri/Cargo.toml` の `[package] name`)は、GitHub リポジトリ名(`interview-assistant`)に対応する名称でなければならない (SHALL)。GitHub 上でリポジトリ名が変更された場合、アプリ側の製品識別名がそれと乖離した状態(例: リポジトリ名は `interview-assistant` だがアプリの `productName` は `Interview-Pilot` のまま)を放置してはならない (SHALL NOT)。

#### Scenario: リポジトリ名とアプリの製品識別名が一致する
- **WHEN** ユーザーが `package.json` の `name`、`src-tauri/Cargo.toml` の `[package] name`、`src-tauri/tauri.conf.json` の `productName` を確認する
- **THEN** いずれも GitHub リポジトリ名(`interview-assistant`)に対応する名称になっており、fork元(`Pluely`)や旧ブランド名(`Interview-Pilot`)のままではない

#### Scenario: リポジトリ名変更後に製品識別名の乖離が残らない
- **WHEN** GitHub 上のリポジトリ名が変更され、対応する OpenSpec change が承認・アーカイブされる
- **THEN** アプリの `productName` / パッケージ名 / ネイティブウィンドウタイトルが新しいリポジトリ名を反映した名称に更新されている
