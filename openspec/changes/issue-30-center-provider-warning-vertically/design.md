## Context

`ProviderWarning`（`src/pages/app/components/ProviderWarning.tsx`）は、STT/AI いずれのプロバイダーが未設定かを示す警告メッセージを表示する共有コンポーネントで、`TranscriptionPanel`（上段）と `SummaryPanel`（中段）の両方から使われている。

```tsx
export const ProviderWarning = ({ message }: Props) => (
  <div
    role="alert"
    className="flex items-center justify-center gap-2 px-3 py-2 text-center text-destructive"
  >
    <AlertCircleIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
    <span className="text-sm font-semibold">{message}</span>
  </div>
);
```

`items-center justify-center` は、この `div` 自身のボックス内でアイコンとテキストを中央寄せするだけであり、`div` には高さの指定（`h-full` 等）がない。そのため `div` は `px-3 py-2` によるコンテンツサイズの高さしか持たず、親パネル（`src/pages/app/index.tsx` の `data-slot="top-panel"` / `data-slot="middle-panel"`、いずれも `flex-1 overflow-hidden` でパネル全体の高さを確保している）の高さいっぱいには広がらない。結果として、警告メッセージは親パネルの左右中央には来るが、上寄りに表示され、縦方向には中央にならない。

## Goals / Non-Goals

**Goals:**
- `ProviderWarning` が表示される枠（親パネル）の中で、警告メッセージを縦方向にも中央配置する。
- 既存の横方向の中央配置・アイコン・文言・表示条件（`sttReady` / `aiReady` による出し分け）は変更しない。

**Non-Goals:**
- `top-bar-transcript-summary` の既存仕様（AIプロバイダー未設定時は中段に「何も表示しない」）と実装（`ProviderWarning` を表示している）の不整合を解消すること。これは本 Issue（#30）の依頼範囲外であり、別途 Issue化を検討する。
- 警告メッセージの文言・アイコン・色（`text-destructive`）などのビジュアルデザインを変更すること。
- `TranscriptionPanel` / `SummaryPanel` 側のロジック（`sttReady` / `aiReady` の判定）を変更すること。

## Decisions

- **`ProviderWarning` のルート `div` に `h-full` を付与する。** これにより `div` が親パネル（`flex-1 overflow-hidden` の `top-panel` / `middle-panel`）の高さいっぱいに広がり、既存の `items-center` がパネル全体の高さに対して働くようになる。
  - 代替案: 親側（`TranscriptionPanel.tsx` / `SummaryPanel.tsx` の呼び出し箇所、または `index.tsx` のパネル `div`）に `flex items-center justify-center` を追加する案も検討したが、`ProviderWarning` 自体が「枠内に自己を中央配置する」という自己完結した見た目の責務を持つコンポーネントであるため、コンポーネント自身の CSS を直すほうが呼び出し側（2箇所）を個別に触らずに済み、修正範囲が最小になる。
  - 親パネル（`top-panel` / `middle-panel`）は既に `overflow-hidden` かつ高さが `flex-1` で確定しているため、`h-full` を追加しても他の兄弟要素（ローディング表示・文字起こしテキスト等、他の分岐で返される JSX）のレイアウトには影響しない（`ProviderWarning` はそれらと排他的に表示される分岐のため）。

## Risks / Trade-offs

- [Risk] `h-full` は親要素に明示的な高さ（または `flex-1` 等で解決される高さ）がないと効果がない → 親パネル（`top-panel` / `middle-panel`）は既に `flex-1` でトップバー全体のレイアウト内で高さが確定しているため、このリスクは顕在化しない（実装時に実機で見た目を確認して裏取りする）。
- [Trade-off] `top-bar-transcript-summary` 側の spec/実装不整合には触れないため、AIプロバイダー未設定時の中段表示について「そもそも表示すべきか」という論点は未解決のまま残る → 本 Issue の依頼はレイアウトのみのため許容し、必要であれば別 Issue で扱う。

## Migration Plan

- CSS クラスの追加のみであり、データ移行・後方互換性の考慮は不要。
- 変更後、`npm run typecheck` / `npm run lint` に加え、実機（`npm run tauri dev`）で以下を目視確認する:
  - STTプロバイダー未選択時、上段の警告メッセージが枠内で縦横中央に表示される。
  - AIプロバイダー未設定時、中段の警告メッセージが枠内で縦横中央に表示される。
