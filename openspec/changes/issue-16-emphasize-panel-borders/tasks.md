## 1. トップバー右エリアの境界線スタイル変更

- [ ] 1.1 `src/pages/app/index.tsx` の `data-slot="top-panel"` のクラスを `border-b border-border/40` から `border-b-2 border-border` に変更する
- [ ] 1.2 `src/pages/app/index.tsx` の `data-slot="middle-panel"` のクラスを `border-b border-border/40` から `border-b-2 border-border` に変更する
- [ ] 1.3 `data-slot="bottom-panel"` には境界線を追加しない（変更対象外であることを確認するのみ）
- [ ] 1.4 並行して未アーカイブの `top-bar-transcript-summary-panel` が持つ delta spec（`openspec/changes/top-bar-transcript-summary-panel/specs/top-bar-ui/spec.md`）内の「各段の境界が視覚的に区別できる」シナリオを、本提案の delta spec（`specs/top-bar-ui/spec.md`）が定義する強化後のシナリオ（十分なコントラスト、`--border`本来の不透明度、1pxより太い線幅）と同じ内容に更新する。アーカイブ順序に依らずメインspecの境界線シナリオが強化後の内容に保たれるようにするため。

## 2. スペック同期・動作確認

- [ ] 2.1 `openspec validate issue-16-emphasize-panel-borders --strict` を実行しエラーがないことを確認する
- [ ] 2.2 `npm run typecheck` と `npm run lint` を実行しエラーがないことを確認する
- [ ] 2.3 アプリを起動し、ライトモードで上段・中段間の境界線が明確に視認できることを確認する
- [ ] 2.4 ダークモードに切り替え、上段・中段間の境界線が明確に視認できることを確認する
- [ ] 2.5 3段の高さ配分（上段・中段・下段が均等）が境界線の太さ変更後も崩れていないことを確認する
