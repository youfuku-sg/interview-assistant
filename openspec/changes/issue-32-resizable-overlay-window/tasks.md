## 1. ウィンドウ設定

- [ ] 1.1 `src-tauri/tauri.conf.json` のメインウィンドウ設定の `"resizable"` を `false` から `true` に変更する
- [ ] 1.2 同じウィンドウ設定に `minWidth: 320`, `minHeight: 180` を追加する（`maxWidth`/`maxHeight` は設定しない）

## 2. バックエンド（`set_window_height`）

- [ ] 2.1 `src-tauri/src/window.rs` の `set_window_height` を、幅を `600.0` に固定するのではなく、呼び出し時点のウィンドウの実際の幅（`window.inner_size()` を `window.scale_factor()` で論理サイズに変換したものの幅）を維持したまま高さのみ変更するように修正する
- [ ] 2.2 `window.scale_factor()` / `window.inner_size()` の取得に失敗した場合は既存の `Result<(), String>` の枠組みでエラーを返す（呼び出し元の `try/catch` に処理を委ねる）

## 3. CI確認

- [ ] 3.1 `npm run typecheck` と `npm run lint` を実行し、フロントエンドに変更がなくクリーンであることを確認する
- [ ] 3.2 `src-tauri` で `cargo fmt --check` と `cargo clippy` を実行し、Rust側の変更がクリーンであることを確認する

## 4. 動作確認

- [ ] 4.1 `npm run tauri dev` を起動し、トップバーウィンドウの端をドラッグして幅・高さを自由にリサイズできることを目視確認する
- [ ] 4.2 `minWidth`/`minHeight` を下回るサイズにリサイズできないことを確認する
- [ ] 4.3 ウィンドウ幅を手動でリサイズした後、音声入力パネル等のポップオーバーを開閉し、既存の自動高さ調整（collapsed/expanded の切り替え）が発生しても手動で設定した幅が `600px` に巻き戻らないことを確認する
- [ ] 4.4 リサイズ後も左カラム（アイコン縦並び）・右エリア3段パネルのレイアウトが崩れないことを確認する
