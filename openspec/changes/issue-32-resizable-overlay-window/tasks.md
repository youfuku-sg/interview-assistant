## 1. ウィンドウ設定

- [x] 1.1 `src-tauri/tauri.conf.json` のメインウィンドウ設定の `"resizable"` を `false` から `true` に変更する
- [x] 1.2 同じウィンドウ設定に `minWidth: 320`, `minHeight: 180` を追加する（`maxWidth`/`maxHeight` は設定しない）

## 2. バックエンド（`set_window_height`）

- [x] 2.1 `src-tauri/src/window.rs` の `set_window_height` を、幅を `600.0` に固定するのではなく、呼び出し時点のウィンドウの実際の幅（`window.inner_size()` を `window.scale_factor()` で論理サイズに変換したものの幅）を維持したまま高さのみ変更するように修正する
- [x] 2.2 `window.scale_factor()` / `window.inner_size()` の取得に失敗した場合は既存の `Result<(), String>` の枠組みでエラーを返す（呼び出し元の `try/catch` に処理を委ねる）

## 3. CI確認

- [x] 3.1 `npm run typecheck` と `npm run lint` を実行し、フロントエンドに変更がなくクリーンであることを確認する
- [ ] 3.2 `src-tauri` で `cargo fmt --check` と `cargo clippy` を実行し、Rust側の変更がクリーンであることを確認する

## 4. 動作確認

- [x] 4.1 `npm run tauri dev` を起動し、トップバーウィンドウの端をドラッグして幅・高さを自由にリサイズできることを目視確認する
- [ ] 4.2 `minWidth`/`minHeight` を下回るサイズにリサイズできないことを確認する
- [ ] 4.3 ウィンドウ幅を手動でリサイズした後、音声入力パネル等のポップオーバーを開閉し、既存の自動高さ調整（collapsed/expanded の切り替え）が発生しても手動で設定した幅が `600px` に巻き戻らないことを確認する
- [ ] 4.4 リサイズ後も左カラム（アイコン縦並び）・右エリア3段パネルのレイアウトが崩れないことを確認する

## 5. 動作検証で見つかった不具合の修正（追加）

ユーザー動作検証（4.1相当）で、横方向のリサイズは問題ないが、縦方向にドラッグリサイズしても直後に高さが巻き戻り、透明な余白が生じる不具合が見つかった。原因は `src/hooks/useWindow.ts` の `MutationObserver`（`document.body` の変化を検知するたびに、ポップオーバーが開いていなければ `resizeWindow(false)`＝高さを `240px` に強制する）が、手動リサイズ後の高さも構わず上書きしていたこと。本 change のスコープ（design.md）では幅の巻き戻り防止のみを想定しており、高さ自体が同じ仕組みで巻き戻ることは見落としていた。

- [x] 5.1 `useWindow.ts` に、`window.onResized` を使ってプログラム側（`resizeWindow` 経由）の変更かユーザーの手動ドラッグかを区別する仕組みを追加し、手動リサイズ後は `MutationObserver` 由来の自動 collapse（`resizeWindow(false)`）を抑制するようにする。ポップオーバーの開閉など明示的な `resizeWindow` 呼び出しがあれば自動調整に制御を戻す
- [x] 5.2 `npm run typecheck` / `npm run lint` を実行し、クリーンであることを確認する
