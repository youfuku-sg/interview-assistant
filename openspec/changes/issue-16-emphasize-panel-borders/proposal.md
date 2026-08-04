## Why

Issue #16: トップバー右エリアの3段構造（上段=文字起こし、中段=要約、下段=AI回答）を区切る境界線（`src/pages/app/index.tsx` の `border-b border-border/40`）が薄すぎて、段の切れ目が分かりづらいというユーザーからの指摘がある。特にダークモードでは `--border` トークン自体が `oklch(1 0 0 / 10%)` と低不透明度で、そこにさらに Tailwind の `/40` 修飾で追加減衰がかかるため、境界がほぼ視認できない。既存仕様（`top-bar-ui`）には「各段の境界が視覚的に区別できる」という受け入れ基準が既にあるが、具体的な視覚的強調度を定義していないため、今回の指摘のような「区別はできるが弱すぎる」状態を仕様上防げていない。

## What Changes

- `src/pages/app/index.tsx` の上段・中段間の区切り線（`data-slot="top-panel"` と `data-slot="middle-panel"` の `border-b`）の視覚的な強調度を高める。具体的な色・不透明度・太さの決定は `design.md` で扱う。
- `openspec/specs/top-bar-ui/spec.md` の「Top bar right panel layout」要件のうち、「各段の境界が視覚的に区別できる」シナリオを、単に「境界線が表示される」だけでなく「背景色に対して十分な視覚的コントラストを持つ境界線が表示される」という具体的な受け入れ基準に強化する。
- ライトモード・ダークモード双方で境界線が視認できることを明文化する。

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `top-bar-ui`: 「Top bar right panel layout」要件のシナリオ「各段の境界が視覚的に区別できる」を、境界線の視覚的コントラスト（ライト/ダーク両テーマ）を具体的な受け入れ基準として明記する形に強化する。

## Impact

- `src/pages/app/index.tsx`: 上段・中段の `border-b` クラス（2箇所）の色・不透明度を変更する。下段は元々境界線を持たないため対象外。
- `openspec/specs/top-bar-ui/spec.md`: 「Top bar right panel layout」要件のシナリオを更新する。
- 挙動・データフローへの影響はなく、見た目（CSS/Tailwindクラス）の調整のみ。破壊的変更ではない。
