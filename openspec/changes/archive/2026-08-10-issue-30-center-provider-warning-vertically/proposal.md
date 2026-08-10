## Why

トップバー右エリアの上段（文字起こしパネル）・中段（要約パネル）に表示される「STTプロバイダーが選択されていません」「AIプロバイダーが設定されていません」という警告メッセージは、共有コンポーネント `ProviderWarning` の `flex items-center justify-center` により枠内で左右方向には中央配置されているが、コンポーネント自身が親パネルの高さいっぱいに広がっていないため、縦方向には枠の中央にならず上寄りに表示されている。Issue #30（#29 の再テスト）でこの見た目のズレを解消したいという要望が出ている。

## What Changes

- `ProviderWarning` コンポーネント（`src/pages/app/components/ProviderWarning.tsx`）のルート要素を親パネルの高さいっぱいに広げ（例: `h-full` を付与）、`items-center` が枠全体の縦方向中央に対して効くようにする。
- これにより、`TranscriptionPanel`（STTプロバイダー未選択時）と `SummaryPanel`（AIプロバイダー未設定時）の両方で、警告メッセージが表示枠内で縦横ともに中央配置される。
- 純粋な見た目（CSS/レイアウト）の修正であり、警告メッセージの表示条件・文言・表示/非表示ロジックは変更しない。

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `top-bar-transcription-panel`: 「STTプロバイダー未設定時にエラーを表示する」シナリオに、警告メッセージが表示枠内で縦方向にも中央配置される旨を追記する。

## Impact

- 影響コード: `src/pages/app/components/ProviderWarning.tsx`（共有コンポーネント、CSS クラスのみ変更）。
- 間接的な利用箇所: `src/pages/app/components/TranscriptionPanel.tsx`、`src/pages/app/components/SummaryPanel.tsx`（`ProviderWarning` を呼び出しているのみで、これらのファイル自体の変更は不要な見込み）。`ProviderWarning` は共有コンポーネントのため、CSS 修正は両パネルでの表示に等しく適用される。
- `top-bar-transcript-summary` の既存仕様（AIプロバイダー未設定時は中段に「何も表示しない／エラーメッセージは表示しない」）と、実装（`SummaryPanel.tsx` は `!aiReady` のとき `ProviderWarning` を表示している）の間には、本 Issue 以前から存在する不整合がある。本 Issue の依頼はレイアウト（縦方向の中央配置）のみであり、この表示可否の不整合を解消することはスコープ外とする（design.md 参照）。そのため `top-bar-transcript-summary` の spec delta はこの change には含めない。
- API・データモデル・永続化への影響なし。
