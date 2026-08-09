## Why

トップバー右エリアの3段（文字起こし／要約／AI回答）を区切る境界線は `border-b border-border/40`（`border-border` トークンの40%不透明度）と薄く、実際の画面では段の境目がほとんど視認できない。`top-bar-ui` spec の「各段の境界が視覚的に区別できる」という要件を満たすには、現状の薄さでは不十分なため、境界線をより強調した見た目に変更する。

## What Changes

- `src/pages/app/index.tsx` の `top-panel` / `middle-panel` の境界線を、現行の `border-border/40` より視認性の高いスタイルに変更する（不透明度を上げる、またはより濃いカラートークンを使う）。
- `bottom-panel`（最下段）にも上端の境界線を追加するか検討し、3段すべての境目が一貫して視認できるようにする。
- `top-bar-ui` spec の「各段の境界が視覚的に区別できる」シナリオを、具体的な視認性基準（不透明度・カラートークン等）を伴う記述に更新する。

## Capabilities

### New Capabilities
（なし）

### Modified Capabilities
- `top-bar-ui`: 「Top bar right panel layout」要件のうち、段境界の視認性に関するシナリオ（各段の境界が視覚的に区別できる）を、より強調された境界線であることが分かる基準に更新する。

## Impact

- Affected code: `src/pages/app/index.tsx`（`top-panel` / `middle-panel` / `bottom-panel` の className）
- Affected spec: `openspec/specs/top-bar-ui/spec.md`
- 視覚的な変更のみで、ロジック・データフローへの影響なし。
