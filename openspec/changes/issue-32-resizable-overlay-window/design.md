## Context

オーバーレイウィンドウ（トップバー、Tauriの `main`/`pluely` ウィンドウ）は `src-tauri/tauri.conf.json` で以下のように定義されている。

```json
{
  "width": 600,
  "height": 54,
  "decorations": false,
  "transparent": true,
  "resizable": false,
  ...
}
```

高さは、ポップオーバーの開閉に応じて `src/hooks/useWindow.ts` の `useWindowResize` が `set_window_height`（`src-tauri/src/window.rs`）を呼び出し、`240`（collapsed）/`600`（expanded）の2値で自動的に切り替えている。この `set_window_height` は以下のように幅を `600.0` に固定して上書きしている。

```rust
pub fn set_window_height(window: tauri::WebviewWindow, height: u32) -> Result<(), String> {
    let new_size = LogicalSize::new(600.0, height as f64);
    window.set_size(Size::Logical(new_size))...
}
```

`useWindowResize` は `document.body` に対する `MutationObserver`（`childList`/`subtree`/`attributes: ["data-state"]`）を張っており、DOMの変化（ポップオーバーの開閉、パネル内容の更新等）が起きるたびに `resizeWindow(false)` を呼んで `set_window_height` を実行する。これはかなり高頻度で発火しうる。

Issue #32 は、この「枠」（オーバーレイウィンドウ）をユーザーが自由にリサイズできるようにしてほしいという要望であり、`resizable: false` がその制約になっている。単純に `resizable: true` にするだけでは、ユーザーが手動で幅を変えた直後に上記の自動高さ調整が発火し、`set_window_height` が幅を `600.0` に巻き戻してしまう（`useWindowResize` はDOM変化のたびに発火するため、ユーザー操作からそう遠くないタイミングで巻き戻りが発生する）。

## Goals / Non-Goals

**Goals:**
- オーバーレイウィンドウ（`main`）をOS標準のウィンドウ端ドラッグでユーザーが自由にリサイズできるようにする。
- レイアウトが破綻しない範囲の最小サイズ制約を設ける。
- 既存の自動高さ調整（ポップオーバー開閉時の240/600切り替え）と、ユーザーの手動リサイズが競合して手動リサイズの結果（特に幅）が意図せず巻き戻らないようにする。

**Non-Goals:**
- ウィンドウサイズをアプリ再起動をまたいで記憶・復元すること（`tauri-plugin-window-state` 等の導入は本changeでは行わない。将来の別Issueで検討）。
- リサイズ用の可視的なハンドル（枠線やグリップ等のUI装飾）を追加すること。OS標準の透明なリサイズ端（ヒットエリア）に依存する。
- ポップオーバー開閉時の自動高さ切り替え（240/600px）のロジック自体を変更すること。
- ダッシュボードウィンドウ（`dashboard`）のリサイズ挙動の変更（既にデフォルトでリサイズ可能であり、対象外）。

## Decisions

- **`src-tauri/tauri.conf.json` のメインウィンドウに `"resizable": true` を設定し、`minWidth`/`minHeight` を追加する。** 左カラム（アイコン縦並び、幅約40px + gap）と右エリアの3段パネルが最低限視認・操作できるサイズとして、`minWidth: 320`, `minHeight: 180` を設定する（右エリア3段×最低60px程度 + 左カラム + 余白を想定した値）。`maxWidth`/`maxHeight` は設定しない。Issue の要望が「自由にサイズ変更できるようにしたい」であり、上限を設けると「自由」の趣旨に反するため、最小サイズのみで破綻を防ぎ、上限はOS・モニターサイズに委ねる。
  - 代替案: 最大サイズも制約する案を検討したが、必要性を裏付ける具体的な破綻シナリオがなく、Issue本文（要望のみで詳細なし）からも上限を求める根拠が読み取れないため見送った。
- **`set_window_height`（`src-tauri/src/window.rs`）を、幅を固定値で上書きするのではなく、呼び出し時点の実際のウィンドウ幅を維持したまま高さのみを変更するように修正する。** `window.inner_size()`（物理ピクセル）を `window.scale_factor()` で論理サイズに変換し、その幅と引数の `height` から新しい `LogicalSize` を組み立てる。
  - 代替案: `set_window_height` コマンドに `width: Option<f64>` 引数を追加し、フロントエンド側で呼び出し時に明示的に現在の幅を渡す案も検討したが、呼び出し元（`useWindowResize.resizeWindow`）を変更する必要があり修正範囲が広がる。バックエンド側で「現在の幅を保持する」というデフォルト挙動に倒すほうが、既存の呼び出し方（高さのみ指定）を変えずに済み、修正範囲が最小になる。
- **手動リサイズ検知や「ユーザーが最後に手動設定したサイズ」を記憶する専用の状態は導入しない。** `set_window_height` が常に「呼び出し時点の実際の幅」を尊重するようにすれば、手動リサイズ後に自動高さ調整が発火しても、その時点の幅（＝ユーザーが最後に設定した幅）がそのまま使われるため、追加の状態管理なしで巻き戻りを防げる。

## Risks / Trade-offs

- [Risk] `decorations: false` かつ `transparent: true` のボーダーレスウィンドウでは、OS標準のリサイズ端（ヒットエリア）が視覚的な手がかりなしで数px幅しかなく、ユーザーがリサイズ操作を発見しづらい可能性がある → 本changeでは可視的なリサイズハンドルの追加はNon-Goalとするが、実機（Windows）でリサイズ操作が実際に機能し、最低限операbleであることを動作確認で確認する。発見性が著しく低いと判明した場合は、可視的なグリップの追加を別Issueとして起票する。
- [Risk] `set_window_height` の幅維持ロジックは `window.scale_factor()` の取得に失敗する可能性がある（マルチモニター環境でのDPI変化等） → 取得失敗時はコマンド全体をエラーとして返し（既存の `Result<(), String>` の枠組みをそのまま使う）、呼び出し元の `try/catch`（`useWindowResize.resizeWindow`）が既にエラーをログして握りつぶす実装になっているため、既存のフォールバック挙動を変更せずに済む。
- [Trade-off] 手動リサイズしたウィンドウサイズはアプリ再起動で失われる（`width: 600, height: 54` の初期値に戻る）→ Non-Goalとして許容。必要であれば別Issueで永続化を検討する。

## Addendum (動作検証で発覚した見落とし)

ユーザー動作検証で、縦方向の手動リサイズだけが直後に巻き戻る不具合が見つかった。原因は当初の設計（Decisions）が「幅の巻き戻り防止」しか考慮しておらず、`useWindowResize`（`src/hooks/useWindow.ts`）の `MutationObserver` が `document.body` の変化のたびに（ポップオーバー未展開時）`resizeWindow(false)` を呼び、高さを常に `240px` へ強制していた点を見落としていたため。この呼び出しは幅だけでなく高さそのものも上書きする設計だったので、`resizable: true` にした時点で手動の高さリサイズは原理的に成立しない状態だった。

対応として、`window.onResized` を使い「`resizeWindow` 経由のプログラム的な変更」か「ユーザーのOSレベルドラッグ」かを区別するフラグを追加し、ユーザーが手動リサイズした後は `MutationObserver` 由来の自動 collapse を抑制するようにした（tasks.md §5）。ポップオーバーの開閉など明示的な `resizeWindow` 呼び出しがあれば、その時点で自動調整に制御が戻る。collapsed/expanded の値（240/600px）やその呼び出しトリガー自体は変更していない（Non-Goals を維持）。

## Migration Plan

- 設定ファイル（`tauri.conf.json`）とRustコマンド実装の変更のみで、データ移行は不要。
- 変更後、`npm run typecheck` / `npm run lint`、`cargo fmt --check` / `cargo clippy`（`src-tauri`）に加え、実機（`npm run tauri dev`、Windows）で以下を目視確認する:
  - ウィンドウ端をドラッグして幅・高さを自由に変更できる。
  - リサイズ後、ポップオーバーを開閉する（既存の自動高さ調整をトリガーする）操作を行っても、ユーザーが設定した幅が `600px` に巻き戻らない。
  - `minWidth`/`minHeight` を下回るサイズにはリサイズできない。
