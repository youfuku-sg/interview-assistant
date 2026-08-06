## Why

Issue #16: トップバー右エリアの3段構造（上段=文字起こし、中段=要約、下段=AI回答）を区切る境界線（`src/pages/app/index.tsx` の `border-b border-border/40`）が薄すぎて、段の切れ目が分かりづらいというユーザーからの指摘がある。特にダークモードでは `--border` トークン自体が `oklch(1 0 0 / 10%)` と低不透明度で、そこにさらに Tailwind の `/40` 修飾で追加減衰がかかるため、境界がほぼ視認できない。既存仕様（`top-bar-ui`）には「各段の境界が視覚的に区別できる」という受け入れ基準が既にあるが、具体的な視覚的強調度を定義していないため、今回の指摘のような「区別はできるが弱すぎる」状態を仕様上防げていない。

## What Changes

- `src/pages/app/index.tsx` の2つの境界線（`data-slot="top-panel"` の `border-b` = 上段・中段間の境界、`data-slot="middle-panel"` の `border-b` = 中段・下段間の境界）の視覚的な強調度を高める。具体的な色・不透明度・太さの決定は `design.md` で扱う。
- `openspec/specs/top-bar-ui/spec.md` の「Top bar right panel layout」要件のうち、「各段の境界が視覚的に区別できる」シナリオを、単に「境界線が表示される」だけでなく「背景色に対して十分な視覚的コントラストを持つ境界線が表示される」という具体的な受け入れ基準に強化する。
- ライトモード・ダークモード双方で境界線が視認できることを明文化する。
- 上記に加え、この要件ブロックには境界線とは無関係な陳腐化した記述（中段=AI回答パネル、下段=テキスト入力欄、上段・中段が高さ半分ずつ）が残っていた。これは別変更 `top-bar-transcript-summary-panel`（実装タスクは完了済みだがspec同期・アーカイブが未完了）による組み替え後の実態（中段=要約パネル、下段=AI回答パネル、テキスト入力欄なし、3段均等）を反映できていなかったもの。本提案自身の `Why`/`design.md` の理解とも矛盾するため、境界線シナリオと合わせて実態に合わせて修正する（動作自体の変更ではない）。

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `top-bar-ui`: 「Top bar right panel layout」要件のシナリオ「各段の境界が視覚的に区別できる」を、境界線の視覚的コントラスト（ライト/ダーク両テーマ）を具体的な受け入れ基準として明記する形に強化する。あわせて、同要件内の陳腐化した記述（中段・下段の役割、高さ配分）を実装済みの実態に合わせて修正する。

## Impact

- `src/pages/app/index.tsx`: 上段・中段の `border-b` クラス（2箇所）の色・不透明度を変更する。下段は元々境界線を持たないため対象外。
- `openspec/specs/top-bar-ui/spec.md`: 「Top bar right panel layout」要件のシナリオを更新する（境界線の受け入れ基準強化に加え、陳腐化していた中段・下段の役割説明と高さ配分の記述を実態に合わせて修正）。
- `openspec/changes/top-bar-transcript-summary-panel/specs/top-bar-ui/spec.md`: 同じ要件を対象とする並行変更のdelta specも、境界線シナリオを本提案と同じ強化後の内容に更新する（アーカイブ順序に依らないspec整合性の確保。design.md参照）。
- 挙動・データフローへの影響はなく、見た目（CSS/Tailwindクラス）の調整のみ。破壊的変更ではない。
- spec記述の是正により、以降このrequirementを参照する変更提案が誤った前提（旧レイアウト）を引き継ぐリスクを解消する。
