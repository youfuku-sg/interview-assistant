## MODIFIED Requirements

### Requirement: main ブランチ運用下でも生成物が draft の GitHub Release に添付される
`v<version>` タグ push によって起動したビルド（CI 成功かつタグが `main` 上にある場合）が成功した場合、Windows インストーラを draft 状態の GitHub Release に添付しなければならない (SHALL)。あわせて、Tauri updater 用のマニフェスト(`latest.json` 相当)を生成し、同じ Release に添付しなければならない (SHALL)。

#### Scenario: タグ push 由来のビルド成功後に draft Release ができる
- **WHEN** `main` へのマージ後に push した `v<version>` タグによって CI・ビルドが正常に完了する
- **THEN** GitHub の Releases に draft 状態の新しい Release が作成され、Windows インストーラ（NSIS/MSI）が添付されている

#### Scenario: updater 用マニフェストが添付される
- **WHEN** ワークフローが正常に完了する
- **THEN** Release に Tauri updater 用のマニフェスト(`latest.json` 相当)が添付されており、Windows インストーラの署名情報を含んでいる

## ADDED Requirements

### Requirement: Tauri updater 署名鍵を GitHub Actions secrets で管理する
ワークフローは updater 用マニフェストの署名にあたり、リポジトリの GitHub Actions secrets に保存された Tauri updater 専用の署名鍵ペア(秘密鍵・鍵パスワード)を使用しなければならない (SHALL)。この鍵は Windows のコード署名証明書とは別物であり、`Windows インストーラを未設定 secret に依存せず生成できる` 要件が対象とする Pluely 由来 secret やコード署名証明書には該当しない。秘密鍵の値がワークフローのログや成果物に出力されてはならない (SHALL NOT)。

#### Scenario: 署名鍵 secrets を用いてマニフェストが生成される
- **WHEN** `TAURI_SIGNING_PRIVATE_KEY` と `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` が GitHub Actions secrets に設定された状態でタグ push によるビルドが成功する
- **THEN** 生成される updater マニフェストが、対応する公開鍵(`tauri.conf.json` の `plugins.updater.pubkey`)で検証可能な署名を含む

#### Scenario: 秘密鍵の値がログに出力されない
- **WHEN** ワークフローの実行ログを確認する
- **THEN** `TAURI_SIGNING_PRIVATE_KEY` および `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` の値が平文でログに出力されていない
