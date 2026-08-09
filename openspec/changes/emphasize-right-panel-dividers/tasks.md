## 1. スタイル変更

- [x] 1.1 `src/pages/app/index.tsx` の `top-panel` / `middle-panel` の `border-border/40` を `border-border/70` に変更する
- [x] 1.2 `bottom-panel` に境界線（`border-t border-border/70`、または `middle-panel` の `border-b` のみで表現する方針に統一）を追加し、中段・下段の境目も視認できるようにする

## 2. 確認

- [ ] 2.1 `npm run dev` でアプリを起動し、トップバー右エリアの3段（上段・中段・下段）の境界線が、外枠より弱く従来より明確に視認できることを目視確認する
- [ ] 2.2 音声キャプチャあり／なし、AIプロバイダー設定あり／なしの各状態で境界線の見え方に問題がないか確認する
- [x] 2.3 `npm run lint` と `npm run typecheck` を実行する
