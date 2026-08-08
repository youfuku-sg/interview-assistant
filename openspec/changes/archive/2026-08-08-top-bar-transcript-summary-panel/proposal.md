## Why

トップバー右エリアの上段（文字起こしパネル）は発話が増えるほど分量が増え、面接中に読み返して要点を掴むのが難しくなる。中段には現在、直近1発話へのAI回答（`AIResponsePanel`）が表示されているが、セッション全体の流れを俯瞰できる要約は存在しない。中段をセッション全体の要約表示に置き換え、既存のAI回答表示は下段へ移すことで、話した内容の要点を常時確認できるようにする。

## What Changes

- 中段（`data-slot="middle-panel"`）の表示内容を、既存の「直近1発話へのAI回答」から「上段の`sessionTranscript`（セッション累積発話）をAIプロバイダーで要約したテキスト」に置き換える。**BREAKING**（中段の役割変更）
- 新規発話が`sessionTranscript`に追加されるたび（`speech-detected`イベントごと）に、既存の`fetchAIResponse`（`src/lib/functions/ai-response.function.ts`）を使って要約を即時再生成する（デバウンスなし）。
- 既存の「直近1発話へのAI回答」表示（`AIResponsePanel`、`lastAIResponse`/`isAIProcessing`/`aiReady`）は下段へ移動する。
- 下段のテキスト入力欄（`CompletionInput`）はデフォルトで非表示にする。
- AIプロバイダー未設定時は、要約パネル・AI回答パネルともに何も表示しない（既存のAI回答パネルと同じ「エラーを出さず空欄」方針を踏襲）。
- セッションのリセット（`startCapture`／`startNewConversation`によるセッション再開始）に合わせて要約状態もクリアする。

## Capabilities

### New Capabilities
- `top-bar-transcript-summary`: セッション累積発話（`sessionTranscript`）をAIプロバイダーで要約し、トップバー中段に表示する機能。要約のトリガー条件、AIプロバイダー未設定時の扱い、ローディング表示、セッションリセット時のクリアを定義する。

### Modified Capabilities
- `top-bar-ui`: 「Top bar right panel layout」要件を変更し、中段の役割を「AI回答パネル」から「要約パネル」に置き換え、下段を「テキスト入力欄」から「AI回答パネル」に置き換える（テキスト入力欄はデフォルト非表示）。「Top bar layout structure」要件のうち、テキスト入力欄が右エリア幅いっぱいに表示されるとしていたシナリオを、デフォルト非表示である旨に更新する。

## Impact

- `src/pages/app/index.tsx`: 中段・下段のレンダリング内容を入れ替え（中段に新規`SummaryPanel`相当のコンポーネント、下段に`AIResponsePanel`、テキスト入力を非表示化）。
- `src/hooks/useSystemAudio.ts`: `sessionTranscript`更新時に要約生成をトリガーする処理を追加（`fetchAIResponse`呼び出し、要約用の状態・ローディングフラグを新設）。
- `src/pages/app/components/`: 要約表示用の新規コンポーネントを追加。既存`AIResponsePanel`・`TranscriptionPanel`はProps変更なしで流用。
- `openspec/specs/top-bar-ui/spec.md`: 「Top bar right panel layout」「Top bar layout structure」要件を更新。
- 新規AI呼び出しが発話ごとに追加されるため、既存の「直近発話へのAI回答」呼び出しと合わせてAPI呼び出し回数が増える（コスト・レイテンシ面の影響）。
