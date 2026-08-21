## Why

Issue #35（#34の再テスト。develop起点・build/<name>廃止後の新方式で再実行）: 「アプリのウィンドウサイズを変更した際、中のデザイン（レイアウト・要素サイズ）もそれに追従して変更されるようにしてほしい」という要望。#34で同じ症状が報告され `issue-34-overlay-vertical-resize-follow` として一度提案されたが、当時利用していた `build/<name>` ミラーブランチ方式が廃止されたことで実装まで進まず、コードは未修正のまま現在のブランチ戦略（`feature/<N>` を直接ビルド）に引き継がれている。現在の `src/pages/app/index.tsx` を確認したところ、外枠コンテナに `items-start` が残っており、トップバー（オーバーレイ）ウィンドウは `useWindowResize`/`set_window_height` により collapsed(約240px)/expanded(約600px) へ高さが切り替わるが、右エリア（`Card` および内部の上段・中段・下段パネル）は横幅には追従する一方、縦方向には追従しない不具合が今も再現する。

## What Changes

- `src/pages/app/index.tsx` の外枠コンテナ（`w-screen h-screen flex overflow-hidden justify-center items-start ...`）から、縦方向のストレッチを妨げている `items-start` を除去し、`Card` および内部の上段・中段・下段パネル（`flex-1`）がウィンドウの実際の高さ（240px / 600px、および将来的な他の高さ）に追従して伸縮するようにする。
- 横幅方向の追従（`w-full` による現状の挙動）は変更しない。
- 変更対象は CSS/レイアウトのみで、`useWindowResize` や `set_window_height` などの高さ切り替えロジック自体は変更しない。

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `top-bar-ui`: 「上段・中段・下段の高さが均等に分配される」という既存要件が、ウィンドウの高さが変化した場合（collapsed⇔expanded の切り替えなど）にも維持されることを明示する要件・シナリオを追加する。

## Impact

- Affected code: `src/pages/app/index.tsx`（外枠コンテナのレイアウトクラス）。必要に応じて `src/components/ui/card.tsx` の利用箇所（当該箇所限定のクラス調整）。
- Affected specs: `openspec/specs/top-bar-ui/spec.md`。
- No backend (`src-tauri/`) changes expected; `set_window_height` / `useWindowResize` の高さ値(240/600)はそのまま。
- No DB migrations, no new dependencies。
