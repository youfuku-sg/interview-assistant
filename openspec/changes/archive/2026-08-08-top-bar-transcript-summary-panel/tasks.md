## 1. useSystemAudio: 要約生成ロジックの追加

- [x] 1.1 `sessionSummary: string` と `isSummaryProcessing: boolean` の状態を `useSystemAudio.ts` に追加し、`UseSystemAudioReturn` 型に含める
- [x] 1.2 要約専用のシステムプロンプト定数（例: `SUMMARY_SYSTEM_PROMPT`）を新設する
- [x] 1.3 `generateSummary(sessionTranscript: string[])` 関数を実装する。`fetchAIResponse` を `userMessage: sessionTranscript.join("\n")`、`history` なし、専用システムプロンプトで呼び出し、`sessionSummary` をストリーミング更新する
- [x] 1.4 要約リクエスト用に専用の `summaryAbortControllerRef` を新設し、新規リクエスト開始時に前回分を `abort()` する
- [x] 1.5 `speech-detected` ハンドラ内、`setSessionTranscript` 直後・`processWithAI` と並行して `generateSummary` を呼び出す
- [x] 1.6 AIプロバイダー未設定時（`!selectedAIProvider.provider && !usePluelyAPI` 相当）は要約リクエストを送信せず終了する
- [x] 1.7 `startCapture` と `startNewConversation` で `sessionSummary` と `isSummaryProcessing` をリセットする

## 2. SummaryPanel コンポーネントの新規作成

- [x] 2.1 `src/pages/app/components/SummaryPanel.tsx` を `AIResponsePanel.tsx` と同じ表示パターン（`aiReady` が false なら null、処理中はローディング表示、要約があれば `Markdown` 表示）で作成する。Props: `summary: string`, `isSummaryProcessing: boolean`, `aiReady: boolean`
- [x] 2.2 `src/pages/app/components/index.ts`（または相当のエクスポートファイル）に `SummaryPanel` を追加する

## 3. トップバー右エリアのレイアウト組み替え

- [x] 3.1 `src/pages/app/index.tsx` の中段（`data-slot="middle-panel"`）を `AIResponsePanel` から `SummaryPanel` に置き換え、`summary={systemAudio.sessionSummary}` `isSummaryProcessing={systemAudio.isSummaryProcessing}` `aiReady={aiReady}` を渡す
- [x] 3.2 下段のレンダリングを `CompletionInput` から `AIResponsePanel`（`lastAIResponse` / `isAIProcessing` / `aiReady`）に置き換える
- [x] 3.3 下段コンテナのクラスを `shrink-0` から `flex-1 border-b border-border/40 overflow-hidden`（上段・中段と同様）に変更し、3段が均等な高さになるようにする
- [x] 3.4 `CompletionInput` のレンダリングをトップバーから削除する（コンポーネント自体・`useCompletion` フックは削除しない）

## 4. スペック同期・動作確認

- [x] 4.1 `openspec validate top-bar-transcript-summary-panel --strict` を実行しエラーがないことを確認する
- [x] 4.2 `npm run typecheck` を実行し TypeScript エラーがないことを確認する
- [ ] 4.3 アプリを起動し、複数発話後に中段へ要約が表示され、発話ごとに更新されることを確認する
- [ ] 4.4 下段に直近発話へのAI回答が表示され、テキスト入力欄が表示されないことを確認する
- [ ] 4.5 AIプロバイダー未設定状態で中段・下段が空欄になり、エラー表示が出ないことを確認する
- [ ] 4.6 新規キャプチャ開始・新規会話開始で中段の要約表示が空にリセットされることを確認する
