# Pluely 機能把握メモ

## 1. 目的

この文書は、Interview-Assistant の元になっている Pluely の機能を、実際に運用して把握する前段として整理するメモである。

まずはアプリ本体を大きく改修せず、Pluely が持っている既存機能、設定項目、画面構成、今後日本語化すべき箇所を把握する。

## 2. 現時点の前提

- Pluely は Tauri 2 + React + TypeScript + Rust で作られたデスクトップアプリ
- 画面は大きく「小型オーバーレイ」と「ダッシュボード」に分かれている
- チャット、音声入力、システム音声取得、スクリーンショット、ファイル添付、履歴、プロンプト管理、各種設定がある
- 現状の UI 文言は英語中心
- まずは機能把握のために、日本語化対象を整理する
- 面接支援アプリ化は後段で行う

## 3. 全体構成

### 3.1 メインオーバーレイ

メインオーバーレイは、常時表示できる小型の入力 UI である。

主な機能:

- AI へのテキスト入力
- 音声入力
- システム音声取得の開始/停止
- スクリーンショット添付
- ファイル添付
- ダッシュボードを開く
- ウィンドウ移動
- アップデート確認

主な関連ファイル:

- `src/pages/app/index.tsx`
- `src/pages/app/components`
- `src/components/TextInput`
- `src/components/DragButton.tsx`
- `src/components/updater`

### 3.2 ダッシュボード

ダッシュボードは、履歴、設定、プロンプト、音声、スクリーンショット、ショートカットなどを管理する画面である。

主な関連ファイル:

- `src/layouts/DashboardLayout.tsx`
- `src/components/Sidebar.tsx`
- `src/hooks/useMenuItems.tsx`
- `src/routes/index.tsx`

## 4. 画面一覧

現在のルーティング上、主な画面は以下である。

| パス | 画面 | 用途 |
| --- | --- | --- |
| `/` | メインオーバーレイ | AI 入力、音声、スクリーンショットなどを使う小型 UI |
| `/dashboard` | Dashboard | ライセンス、Pluely API、利用状況 |
| `/chats` | Chats | 会話履歴一覧 |
| `/chats/view/:conversationId` | Chat detail | 会話詳細、継続チャット |
| `/system-prompts` | System Prompts | システムプロンプト管理 |
| `/settings` | App Settings | テーマ、自動起動、アイコン表示、常に手前表示 |
| `/responses` | Responses | 回答長、回答言語、自動スクロール |
| `/screenshot` | Screenshot | スクリーンショット取得方式と処理方式 |
| `/audio` | Audio | マイク、システム音声デバイス選択 |
| `/shortcuts` | Cursor & Shortcuts | カーソル設定、グローバルショートカット |
| `/dev-space` | Dev space | 開発用または検証用画面 |

## 5. 主要機能

### 5.1 AI チャット

ユーザーがテキストを入力し、選択した AI プロバイダに送信して回答を得る。

特徴:

- ストリーミング応答に対応
- システムプロンプトを反映
- 回答長と言語設定を反映
- 会話履歴を SQLite に保存
- 画像入力に対応するプロバイダではスクリーンショットや画像添付を送れる

関連ファイル:

- `src/hooks/useCompletion.ts`
- `src/hooks/useChatCompletion.ts`
- `src/lib/functions/ai-response.function.ts`
- `src/lib/database/chat-history.action.ts`

面接支援化で使えそうな点:

- 回答生成の基盤として使える
- 会話履歴保存を、面接セッション履歴に転用できる
- システムプロンプトを、面接支援用プロンプトに置き換えられる

### 5.2 AI プロバイダ設定

curl テンプレートを使って、複数の AI プロバイダを扱う設計になっている。

既定プロバイダ例:

- OpenAI
- Claude
- Grok
- Gemini
- Mistral
- Cohere
- Groq
- Perplexity
- OpenRouter
- Ollama

関連ファイル:

- `src/config/ai-providers.constants.ts`
- `src/lib/storage/ai-providers.ts`
- `src/lib/curl-validator.ts`

面接支援化で使えそうな点:

- Ollama の OpenAI 互換 API をそのまま使える可能性がある
- LM Studio なども OpenAI 互換エンドポイントで追加できる可能性がある
- 外部 API 前提の既定値は、個人利用・ローカル前提では整理対象になる

### 5.3 音声入力

マイクから録音し、STT プロバイダに送信してテキスト化する。

機能:

- 手動の音声録音
- VAD による自動発話検出
- 録音結果の文字起こし
- 文字起こし結果を AI へ送信
- 入力デバイス選択

関連ファイル:

- `src/pages/app/components/Audio.tsx`
- `src/pages/app/components/AutoSpeechVad.tsx`
- `src/pages/chats/components/AudioRecorder.tsx`
- `src/lib/functions/stt.function.ts`
- `src/config/stt.constants.ts`

注意点:

- 既定 STT は外部 API が多い
- 一部テンプレートでは `language=en` や `languageCode=en-US` が入っている
- 日本語運用では、STT の言語指定を日本語に変える必要がある
- ローカル STT を使う場合、ローカルサーバーまたはCLI連携の設計が必要

### 5.4 システム音声取得

PC の出力音声を取得し、会議や動画などの音声を文字起こし対象にできる。

機能:

- システム音声取得の開始/停止
- 音声デバイス選択
- VAD または音声検出
- 処理状態の表示

関連ファイル:

- `src/hooks/useSystemAudio.ts`
- `src/pages/app/components/SystemAudio.tsx`
- `src/pages/app/components/StatusIndicator.tsx`
- `src/pages/audio/components/AudioSelection.tsx`
- `src-tauri/src/speaker`

面接支援化で使えそうな点:

- Web 会議の面接官音声を拾う土台として有力
- 面接中支援の中核機能になる可能性が高い

注意点:

- OS ごとの差分が大きい
- Windows で安定するか検証が必要
- 要求仕様上、主経路はマイク入力ではなくシステム音声取得とする
- 自分の声は MVP では STT 対象にしない

### 5.5 スクリーンショット

画面全体または選択範囲をキャプチャして AI に送れる。

機能:

- 全画面スクリーンショット
- 範囲選択スクリーンショット
- 手動モード
- 自動モード
- 自動モード用プロンプト

関連ファイル:

- `src/pages/screenshot/components/ScreenshotConfigs.tsx`
- `src/components/Overlay.tsx`
- `src-tauri/src/capture.rs`

面接支援化で使えそうな点:

- 求人票、コーディング問題、画面共有内容の補助解析に使える可能性がある

注意点:

- 面接支援の初期版では優先度を下げてもよい
- スクリーンショット解析はローカル LLM ではモデル選定が難しい可能性がある

### 5.6 ファイル添付

チャットに画像などのファイルを添付できる。

機能:

- ファイル選択
- 添付ファイル一覧
- 添付解除
- AI プロバイダの画像対応有無による制御

関連ファイル:

- `src/pages/app/components/Files.tsx`
- `src/pages/chats/components/ChatFiles.tsx`

面接支援化で使えそうな点:

- 将来的に職務経歴書や求人票の登録 UI に転用できる可能性がある

注意点:

- 現状の添付はチャット送信用であり、資料管理として構造化保存する機能とは別物

### 5.7 会話履歴

AI との会話履歴を保存し、一覧と詳細で見返せる。

機能:

- 会話一覧
- 日付別グルーピング
- 会話検索
- 会話詳細表示
- 会話継続
- Markdown ダウンロード
- 会話削除

関連ファイル:

- `src/pages/chats/index.tsx`
- `src/pages/chats/components/View.tsx`
- `src/lib/database/chat-history.action.ts`
- `src-tauri/src/db/migrations/chat-history.sql`

面接支援化で使えそうな点:

- 面接後の質問履歴や振り返りの土台として使える
- ただし、面接セッション、発話ログ、質問、回答方針は別エンティティとして設計した方がよい

### 5.8 システムプロンプト管理

AI の振る舞いを制御するシステムプロンプトを作成、編集、削除、選択できる。

機能:

- プロンプト一覧
- 検索
- 作成
- 編集
- 削除
- 選択中プロンプトの保存
- Pluely 標準プロンプト取得
- AI によるプロンプト生成

関連ファイル:

- `src/pages/system-prompts/index.tsx`
- `src/pages/system-prompts/CreateEditDialog.tsx`
- `src/pages/system-prompts/Delete.tsx`
- `src/pages/system-prompts/Generate.tsx`
- `src/pages/system-prompts/PluelyPrompts.tsx`
- `src/lib/database/system-prompt.action.ts`
- `src-tauri/src/db/migrations/system-prompts.sql`

面接支援化で使えそうな点:

- 面接支援用プロンプトを登録できる
- 「技術面接」「転職理由」「職務経歴深掘り」などに分けることも可能

注意点:

- Pluely 標準プロンプト取得は外部 API 依存の可能性がある
- 個人利用・ローカル前提では、外部取得機能を無効化または整理する候補

### 5.9 回答設定

AI の回答の長さ、言語、自動スクロールを設定できる。

機能:

- Response Length
- Response Language
- Auto-Scroll

関連ファイル:

- `src/pages/responses`
- `src/lib/response-settings.constants.ts`
- `src/lib/storage/response-settings.storage.ts`

面接支援化で使えそうな点:

- 面接中は短い回答を標準にできる
- 日本語回答を既定にできる

注意点:

- 現状は一部機能がライセンス有効時のみ操作可能な作りになっている
- 個人利用前提ではライセンス制御を整理する候補

### 5.10 アプリ設定

アプリ全体の見た目や起動挙動を設定できる。

機能:

- テーマ
- 透明度
- 自動起動
- Dock / タスクバーアイコン表示
- 常に手前に表示

関連ファイル:

- `src/pages/settings`
- `src/contexts/theme.context.tsx`
- `src/contexts/app.context.tsx`
- `src/lib/storage/customizable.storage.ts`

面接支援化で使えそうな点:

- オーバーレイとして使うための透明度や常に手前表示は重要
- 自動起動は優先度低め

注意点:

- 「stealth」寄りの文言は、面接支援アプリの方針とは合わない

### 5.11 カーソルとショートカット

グローバルショートカットと、アプリ上のカーソル表示を設定できる。

既定ショートカット:

| 機能 | macOS | Windows / Linux |
| --- | --- | --- |
| ダッシュボード表示切替 | `Cmd+Shift+D` | `Ctrl+Shift+D` |
| メインウィンドウ表示切替 | `Cmd+\` | `Ctrl+\` |
| 入力欄へフォーカス | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| ウィンドウ移動 | `Cmd` + 矢印 | `Ctrl` + 矢印 |
| システム音声取得 | `Cmd+Shift+M` | `Ctrl+Shift+M` |
| 音声入力 | `Cmd+Shift+A` | `Ctrl+Shift+A` |
| スクリーンショット | `Cmd+Shift+S` | `Ctrl+Shift+S` |

関連ファイル:

- `src/config/shortcuts.ts`
- `src/pages/shortcuts`
- `src/hooks/useGlobalShortcuts.ts`
- `src-tauri/src/shortcuts.rs`

面接支援化で使えそうな点:

- 面接中にマウス操作を減らせる
- 表示切替、音声取得、回答生成などをショートカット化できる

### 5.12 ライセンス / Pluely API

Pluely 独自のライセンスと API を扱う機能がある。

機能:

- ライセンスキー入力
- ライセンス有効化 / 無効化
- Pluely API の有効化
- Pluely API 用モデル選択
- 利用状況取得

関連ファイル:

- `src/components/GetLicense.tsx`
- `src/pages/dashboard/components/PluelyApiSetup.tsx`
- `src/pages/dashboard/components/Usage.tsx`
- `src/lib/functions/pluely.api.ts`
- `src-tauri/src/activate.rs`
- `src-tauri/src/api.rs`

面接支援化での扱い:

- 個人利用・ローカル LLM 前提では、優先度は低い
- 既存機能把握の段階では残して動作確認してよい
- 将来的には削除または非表示候補

### 5.13 Analytics / Telemetry

PostHog を使ったイベント送信コードが存在する。

確認済みのイベント:

- `app_started`
- `get_license`

関連ファイル:

- `src/lib/analytics.ts`
- `src-tauri/src/lib.rs`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/*.json`

面接支援化での扱い:

- 個人情報や面接内容を扱う方針と相性が悪い
- ローカル利用前提では削除または無効化を優先したい
- ただし、今回の「機能把握」段階では、まず存在を認識しておく

## 6. 日本語化対象

### 6.1 優先度 高

まず運用しながら機能把握するため、以下の UI 文言を日本語化するとよい。

- サイドバーメニュー
- メインオーバーレイのツールチップ
- Dashboard
- Chats
- System Prompts
- App Settings
- Responses
- Screenshot
- Audio
- Cursor & Shortcuts
- エラーメッセージ
- 空状態メッセージ
- 確認ダイアログ

### 6.2 優先度 中

- README
- アプリ名や説明文
- Tauri 設定上のウィンドウタイトル
- デスクトップエントリ
- Rust 側のエラーメッセージ
- ログ文言

### 6.3 優先度 低

- コードコメント
- 開発者向けメッセージ
- GitHub リンクや外部サービス名
- ライセンス関連の原文

## 7. 日本語化時の注意点

### 7.1 まずは直書き翻訳でよい

現時点の目的は多言語対応ではなく、機能を理解しやすくすることである。

そのため、最初から i18n ライブラリを導入せず、まずは UI 文言の直書き翻訳で十分と考える。

後から英語と日本語を切り替えたくなった場合に、辞書化や i18n 化を検討する。

### 7.2 機能名は必要に応じて英語を残す

完全に日本語にすると、元機能との対応が分かりにくくなる場合がある。

例:

- System Audio: システム音声
- System Prompts: システムプロンプト
- Screenshot: スクリーンショット
- Response Length: 回答の長さ
- Auto-Scroll: 自動スクロール

### 7.3 Stealth 系の表現は置き換える

Pluely には stealth / invisible / undetectable 寄りの文脈がある。

面接支援アプリとしては、以下のような表現に置き換える方がよい。

| 元の方向性 | 置き換え方向 |
| --- | --- |
| Stealth | 表示設定 |
| Invisible | 非表示 / カーソル非表示 |
| Undetectable | 使わない |
| Without anyone knowing | 使わない |
| Discretion | 目立たない表示 |

### 7.4 ライセンス制御の文言は暫定扱いにする

現状の Pluely にはライセンスがないと使えない扱いの UI がある。

個人利用・ローカル LLM 前提では、このライセンス制御は将来的に削除または整理する可能性が高い。

日本語化では、まず意味が分かるように訳し、後続の改修で消すか判断する。

## 8. 動作確認で見るべきポイント

### 8.1 基本起動

- アプリが起動するか
- オーバーレイが表示されるか
- ダッシュボードを開けるか
- ショートカットで表示切替できるか

### 8.2 AI 応答

- Ollama などのローカル LLM に接続できるか
- テキスト入力から回答が返るか
- ストリーミング表示されるか
- 回答履歴が保存されるか

### 8.3 音声入力

- マイクデバイスを選べるか
- 手動録音できるか
- VAD が動くか
- ローカル STT と接続できるか
- 日本語音声が文字起こしできるか
- ただし、面接支援 MVP では自分の声の文字起こしは主要件ではない

### 8.4 システム音声

- システム音声デバイスを選べるか
- Web 会議音声を取得できるか
- Windows で安定するか
- 文字起こしまでつながるか
- 相手側の質問を十分な精度と遅延で文字起こしできるか

### 8.5 スクリーンショット

- 全画面キャプチャできるか
- 範囲選択できるか
- 添付として AI に送れるか
- ローカル LLM 側で画像対応が必要か

### 8.6 履歴

- 会話一覧に保存されるか
- 会話詳細を開けるか
- 会話を削除できるか
- Markdown 出力が使えるか

### 8.7 設定

- 設定が保存されるか
- 再起動後も反映されるか
- ショートカットを変更できるか
- テーマや透明度が反映されるか

## 9. 面接支援アプリ化に向けた再利用候補

| Pluely 機能 | 面接支援アプリでの用途 |
| --- | --- |
| オーバーレイ | 面接中の質問意図と回答方針表示 |
| システム音声取得 | 面接官の質問取得 |
| マイク音声入力 | MVP では中核外。将来的な音声メモ用途 |
| STT 連携 | 質問の文字起こし |
| AI チャット | 回答方針生成 |
| システムプロンプト | 面接支援用プロンプト |
| 会話履歴 | 面接セッション履歴 |
| SQLite | 資料、質問、回答方針の保存 |
| ショートカット | 面接中の操作削減 |
| スクリーンショット | 求人票や画面共有内容の補助解析 |

## 10. 整理・削除候補

将来的に面接支援アプリへ寄せる場合、以下は整理候補になる。

- Pluely API
- ライセンス有効化
- 利用状況グラフ
- Buy Me a Coffee などの外部リンク
- Pluely 標準プロンプト取得
- PostHog analytics
- stealth / undetectable 系の文言
- 外部クラウド API を前提にした既定 STT 設定
- 外部クラウド API を前提にした既定 AI プロバイダ設定

## 11. 次のステップ案

1. この文書をベースに、実際に Pluely を起動して動作確認する
2. 動作確認しながら、使えた機能、使えなかった機能、設定が必要な機能を追記する
3. UI の主要文言を日本語化する
4. ローカル LLM / ローカル STT で動く最小構成を決める
5. Pluely 既存機能のうち、面接支援アプリに残すものと消すものを決める

## 12. 変更履歴

- 2026-07-02: 初版作成
