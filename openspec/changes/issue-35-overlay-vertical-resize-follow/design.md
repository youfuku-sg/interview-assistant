## Context

`src/pages/app/index.tsx` はトップバー（オーバーレイ）ウィンドウのルートコンポーネント。外枠 `<div className="w-screen h-screen flex overflow-hidden justify-center items-start ...">` の中に `<Card className="w-full flex flex-row gap-2 p-2">` を1つ配置し、その中に左カラム（アイコン縦並び、固定幅）と右エリア（上段・中段・下段、各 `flex-1`）を持つ。

ウィンドウの高さは `src/hooks/useWindow.ts` の `useWindowResize` から `set_window_height`（`src-tauri/src/window.rs`）を呼び出すことで、collapsed 時 240px・expanded 時 600px に切り替わる。幅は `tauri.conf.json` で 600px 固定、`resizable: false` のため OS 側のドラッグリサイズは発生しない。

Flexbox の既定では `align-items: stretch` によりクロス軸（縦方向）の子要素が親の高さいっぱいに引き伸ばされるが、外枠に明示的な `items-start` が指定されているため `Card` は内容に応じた高さしか持たず、`h-screen` で追従するウィンドウ実高さまで伸びない。一方 `Card` には `w-full` が明示されているため横幅は常に親いっぱいに広がり、結果として「横は追従するが縦は追従しない」という issue の症状と一致する。

この症状と原因診断は #34 で一度提案（`issue-34-overlay-vertical-resize-follow`）されていたが、当時の `build/<name>` ミラーブランチ方式が廃止されたため実装に進めず、提案のみで終わっていた。#35 はその再テストであり、現在のコード（本変更作成時点の `feature/35` ブランチ）でも `items-start` は未修正のまま残っており、診断内容は引き続き有効である。

## Goals / Non-Goals

**Goals:**
- `Card` および内部の上段・中段・下段パネルが、collapsed(240px)/expanded(600px) いずれのウィンドウ高さでも実際の高さいっぱいに伸縮すること。
- 既存の横幅方向の挙動（`w-full` による追従）を変えないこと。
- `top-bar-ui` スペックの「上段・中段・下段の高さが均等に分配される」要件が、高さ切り替え後も引き続き成立すること。

**Non-Goals:**
- ウィンドウの実サイズ自体（240px/600pxという値、または将来的なリサイズ手段の追加）を変更すること。
- OS 側のユーザードラッグによる自由リサイズを可能にすること（`resizable: false` のまま）。
- ダッシュボードウィンドウ（`src-tauri/src/window.rs` の `create_dashboard_window`、`src/layouts/DashboardLayout.tsx` 等）のレイアウトを変更すること。

## Decisions

- **外枠コンテナの `items-start` を削除し、既定のストレッチ挙動に戻す。**
  代替案として `Card` に `h-full` を追加する方法も検討したが、`items-start` を消してストレッチに戻す方が変更差分が小さく、かつ `justify-center`（メイン軸=横方向の中央寄せ）はそのまま活かせるため、こちらを採用する。`items-start` を消すと縦方向は stretch になり `Card` が `h-screen` いっぱいに広がる。
- `Card` 自体（`src/components/ui/card.tsx`）は共有 UI コンポーネントであり複数箇所から使われるため変更しない。高さの制約は呼び出し側（`src/pages/app/index.tsx`）のクラスでのみ調整する。
- 上段・中段・下段の `flex-1` はそのまま維持する。親（右カラムの `div`, `Card`, 外枠）の高さが正しく実ウィンドウ高さに伝播すれば、既存の `flex-1` 構成で均等分配は自動的に成立する。

## Risks / Trade-offs

- [Risk] `items-start` を外すことで、左カラムのアイコン縦並び（`w-10 flex flex-col items-center gap-2 py-1 shrink-0`）も `Card` の全高までストレッチされ、アイコン間の余白や配置が意図せず変わる可能性がある → Mitigation: 左カラムの子要素は `shrink-0` で個々のサイズは変わらないため、ストレッチされるのはコンテナの高さのみ。手動確認（collapsed/expanded 双方）で見た目のリグレッションがないことを確認する。
- [Risk] `Card` の高さが伸びることで `py-6`（Card 既定の縦パディング）と内部パネルの `overflow-hidden` の組み合わせによりレイアウト崩れが起きる可能性がある → Mitigation: 既存の `overflow-hidden` は上段・中段・下段それぞれに個別に設定済みのため、Card 全体の高さが変わっても各段のスクロール/クリップ挙動は変わらない想定。手動確認で崩れがないか確認する。

## Migration Plan

- CSS クラスのみの変更のため、DB マイグレーションやデータ移行は不要。
- ロールバック: `items-start` を戻すだけで即座に旧挙動に復帰可能。

## Open Questions

- なし（フロントエンドのレイアウトクラス修正のみで完結する見込み）。
