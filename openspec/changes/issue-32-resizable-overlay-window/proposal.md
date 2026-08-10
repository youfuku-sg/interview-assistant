## Why

常時表示のオーバーレイウィンドウ（トップバー）は `src-tauri/tauri.conf.json` で `"resizable": false`、幅は `600`px 固定であり、高さもポップオーバーの開閉に連動して `240`/`600` の2値をアプリ側が自動で切り替えるだけで、ユーザーがウィンドウ端をドラッグして任意にサイズ変更することはできない。Issue #32「枠を自由にサイズ変更できるようにしたい」は、この「枠」（オーバーレイウィンドウ）をユーザーが自由にリサイズできるようにしてほしいという要望である。

## What Changes

- `src-tauri/tauri.conf.json` のメインウィンドウ設定を `"resizable": true` にし、OS標準のウィンドウ端ドラッグによる手動リサイズを許可する。手動でリサイズ不能なほど小さく/大きくならないよう最小・最大サイズ制約を設定する。
- `src-tauri/src/window.rs` の `set_window_height` コマンド（ポップオーバー開閉時に高さを自動切り替えする既存の仕組み）が、幅を `600.0` に固定で上書きしている実装を修正し、現在のウィンドウ幅を保持したまま高さのみを変更するようにする。これを直さないと、ユーザーが手動で幅を変更した直後に既存の自動高さ調整（`src/hooks/useWindow.ts` の `MutationObserver` 等）が発火し、幅が `600`px に巻き戻ってしまう。
- 上記以外の自動高さ切り替え（collapsed=240px / expanded=600px）のロジック自体は変更しない。手動リサイズ機能の追加であり、既存の自動調整の動作は維持する。

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `top-bar-ui`: 「Top bar layout structure」要件に、ウィンドウがユーザーによる手動リサイズ（ドラッグ）を許可すること、および最小・最大サイズ制約、手動リサイズ後の幅が自動高さ調整で巻き戻らないことを追記する。

## Impact

- 影響コード: `src-tauri/tauri.conf.json`（`resizable`・最小/最大サイズ設定）、`src-tauri/src/window.rs`（`set_window_height` コマンド）。
- 間接的な影響: `src/hooks/useWindow.ts`（`resizeWindow` が呼び出す `set_window_height` の挙動が変わるため、幅を指定しない呼び出し方のままで動作する想定だが、実機での回帰確認が必要）。
- フロントエンドのレイアウト（`src/pages/app/index.tsx` 他）は `w-screen h-screen` / `flex-1` 等の相対指定で構成されており、固定 600px 幅への依存はないため、追加のCSS修正は不要と見込む。
- API・データモデル・永続化への影響なし。ウィンドウサイズをアプリ再起動をまたいで記憶する永続化は本changeのスコープ外とする（design.md参照）。
