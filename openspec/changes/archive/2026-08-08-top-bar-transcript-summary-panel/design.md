## Context

トップバー右エリアは`src/pages/app/index.tsx`で3段固定レイアウト（上段=文字起こし、中段=AI回答、下段=テキスト入力）として実装されている。AI回答は`useSystemAudio.ts`の`processWithAI`が`speech-detected`イベント（STT結果確定時）ごとに1回呼ばれ、`fetchAIResponse`（`src/lib/functions/ai-response.function.ts`）でストリーミング取得し`lastAIResponse`に格納、`AIResponsePanel`が表示する。今回、中段の役割を「セッション全体の要約」に置き換え、既存のAI回答表示は下段へ、下段にあったテキスト入力は非表示にする。

## Goals / Non-Goals

**Goals:**
- `sessionTranscript`（累積発話配列）をAIプロバイダーで要約し、中段に表示する。
- 既存の「直近発話へのAI回答」機能（`processWithAI`／`AIResponsePanel`）はロジックを変更せず、表示位置のみ下段に移す。
- テキスト入力欄をデフォルトで非表示にする。
- セッションリセット時（`startCapture`／`startNewConversation`）に要約状態もクリアする。

**Non-Goals:**
- 要約のデバウンス・スロットリングは行わない（毎発話ごとに即時再生成する方針をユーザーが選択済み）。
- テキスト入力欄の再表示トグルは設けない（レンダリングから外すのみ）。
- 要約対象テキストの切り詰め（トークン数対策としての要約対象ウィンドウ化）は今回のスコープ外。

## Decisions

- **要約生成の呼び出し元**: `useSystemAudio.ts`内、`speech-detected`ハンドラで`setSessionTranscript`直後・`processWithAI`と並行して新規`generateSummary(nextSessionTranscript)`を呼ぶ。理由: 既存の発話確定タイミングを流用でき、`sessionTranscript`の最新値をそのまま渡せる。
- **要約用の状態**: `sessionSummary: string`と`isSummaryProcessing: boolean`を`useSystemAudio`に新設し、`UseSystemAudioReturn`型に追加して`app/index.tsx`へ公開する。理由: 既存の`lastAIResponse`/`isAIProcessing`と対称的な構造にし、`AIResponsePanel`と同じ表示パターンを新規`SummaryPanel`コンポーネントで再利用できるようにする。
- **AIプロバイダー呼び出し**: 既存の`fetchAIResponse`をそのまま使用する。`userMessage`は`sessionTranscript.join("\n")`、`history`は渡さない（要約は会話履歴に依存しない単発の変換処理のため）。システムプロンプトは既存の面接回答用プロンプト（`effectiveSystemPrompt`）とは別に、要約専用の固定プロンプト（例:「以下の発言内容を簡潔に日本語で要約してください」）を新設する。理由: 面接回答生成と要約生成は目的が異なり、同じプロンプトを流用すると要約が回答文になってしまう。
- **リクエストの競合制御**: 要約用に専用の`AbortController`（`summaryAbortControllerRef`）を新設し、新しい要約リクエスト開始時に前回分を中断する。理由: 発話が連続すると前回の要約ストリームが完了する前に次の要約が始まり得るため、`processWithAI`が使う`abortControllerRef`と混在させると回答生成側のリクエストも誤って中断してしまう。
- **AIプロバイダー未設定時の扱い**: `AIResponsePanel`と同じ方針（`aiReady`が`false`なら`null`を返し、エラー表示はしない）を`SummaryPanel`にも適用する。理由: 既存UIパターンとの一貫性、要件`top-bar-ui`の「AIプロバイダー未設定時は空欄」を踏襲。
- **テキスト入力欄の非表示**: `app/index.tsx`の下段から`CompletionInput`のレンダリングを削除し、`AIResponsePanel`を配置する。`CompletionInput`コンポーネント自体や`useCompletion`フックは削除せず、他画面（Dev Space等）で利用可能な状態を維持する。理由: 今回のスコープはトップバー右エリアの表示切替のみで、入力機能自体の廃止ではない。
- **下段の高さ配分**: 下段のコンテナを、従来のテキスト入力用`shrink-0`から、上段・中段と同じ`flex-1`に変更し、3段が均等（各1/3）の高さになるようにする。理由: `AIResponsePanel`はMarkdown形式の回答文を表示するため、1行分の高さしかない`shrink-0`ではスクロール表示すらできない。

## Risks / Trade-offs

- [毎発話ごとに要約APIを呼ぶため、AIプロバイダーへのリクエスト数・コストが従来比で倍増する] → ユーザー承認済みのトレードオフ。将来的にデバウンスや差分要約が必要になった場合は別changeで対応する。
- [セッションが長くなるほど`sessionTranscript.join("\n")`のトークン数が増加し、要約リクエストのレイテンシ・コストが線形に増える] → 今回は非対応。既存の「直近発話へのAI回答」も同様に`conversation.messages`全体を履歴として送っており、同種の制約が既にあるため許容する。
- [中段の役割変更は`top-bar-ui`スペックへの破壊的変更であり、既存の「中段=直近発話へのAI回答」を期待する挙動は失われる] → 個人利用フォークであり、ユーザー本人の合意のもとでの変更。

## Migration Plan

- 単一ブランチでの実装・動作確認後、mainへリリース（既存のブランチ・リリース戦略に従う）。DBスキーマ変更は伴わないためデータマイグレーションは不要。
- ロールバック時は、`app/index.tsx`の中段・下段レンダリングとuseSystemAudioの要約関連コードを直前コミットに戻すのみで復元可能。
