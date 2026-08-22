## 1. レイアウト修正

- [x] 1.1 `src/pages/app/index.tsx` の外枠コンテナ（`w-screen h-screen flex overflow-hidden justify-center items-start ...`）から `items-start` を除去し、既定のクロス軸ストレッチ（`items-stretch`）で `Card` がウィンドウ実高さいっぱいに伸縮するようにする。
- [x] 1.2 左カラム（アイコン縦並び、`w-10 flex flex-col items-center gap-2 py-1 shrink-0`）が、`Card` の高さがストレッチされても意図しない間延び等を起こさないことを確認し、必要であれば `shrink-0`/`justify-*` の調整のみ行う。

## 2. 動作確認

- [x] 2.1 `npm run tauri dev` でオーバーレイウィンドウを起動し、collapsed(約240px) 状態で上段・中段・下段が均等な高さで表示されることを確認する。
- [x] 2.2 ポップオーバー（音声/入力パネル等）を開閉して collapsed⇔expanded(約240px⇔約600px) に切り替え、右エリア（上段・中段・下段）がウィンドウの新しい高さいっぱいに追従して伸縮し、3段が引き続き均等分配されることを目視確認する。
- [x] 2.3 左カラムのアイコン群（SystemAudio・マイク・設定・終了・ドラッグハンドル）の配置・余白に、修正前と比べた意図しない見た目の変化がないことを確認する。
- [x] 2.4 `npm run typecheck` と `npm run lint` を実行し、エラーがないことを確認する。

## 3. スペック同期

- [x] 3.1 実装確認後、`openspec/changes/issue-35-overlay-vertical-resize-follow/specs/top-bar-ui/spec.md` のデルタを `openspec/specs/top-bar-ui/spec.md` に同期する（`/opsx:sync` または `openspec-sync-specs` スキル経由）。
- [ ] 3.2 完了後、変更を `openspec/changes/archive/` にアーカイブする（`/opsx:archive` または `openspec-archive-change` スキル経由）。
