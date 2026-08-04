# Interview-Assistant

[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-blue)](https://github.com/youfuku-sg/interview-assistant)
[![Tauri](https://img.shields.io/badge/Built%20with-Tauri-orange)](https://tauri.app/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)

## 概要

Interview-Assistant は、面接準備・回答補助のためのローカルファーストなデスクトップアプリです。オープンソースの AI アシスタントアプリ [Pluely](https://github.com/iamsrikanthnani/pluely)(Cluely のオープンソース版)を fork し、個人利用の面接支援用途に作り替えています。

本プロジェクトは開発者本人の個人利用のみを想定しており、第三者への配布や商用提供は現時点で行いません(詳細は [`docs/仕様/要求仕様書.md`](docs/仕様/要求仕様書.md) を参照してください)。また、経歴の捏造や「面接官に検知されずに使う」ことを価値として訴求することは方針として避けています(同仕様書 8.6 節)。ここで紹介する機能は、あくまで自分の経験を整理し、回答を準備・補助するためのものです。

Tauri (Rust) + React 19 / TypeScript で実装されており、会話履歴・設定はすべてローカルの SQLite データベースおよび端末内ストレージに保存されます。

---

## 機能

### 音声・画面の取り込み

**システム音声取得**
PC が再生している音声(会議・動画など)をリアルタイムで取り込み、選択した音声認識(STT)プロバイダで文字起こしできます。音声区間検出・リアルタイムの波形表示・処理状況インジケーターに対応しています。ショートカット: `Cmd+Shift+M` (macOS) / `Ctrl+Shift+M` (Windows/Linux)。

**音声入力**
マイクからの発話を録音し、STT プロバイダでテキスト化します。OpenAI Whisper、ElevenLabs、Groq Whisper のほか、カスタムプロバイダにも対応しています。ショートカット: `Cmd+Shift+A` (macOS) / `Ctrl+Shift+A` (Windows/Linux)。

**スクリーンショット**
画面全体を1クリックで取得する「スクリーンショットモード」と、範囲を選択して取得する「選択モード」があります。取得した画像は添付ファイルとして手動で送信する「マニュアルモード」と、あらかじめ設定したプロンプトで即座に AI へ送信する「自動モード」を選択できます。ショートカット: `Cmd+Shift+S` (macOS) / `Ctrl+Shift+S` (Windows/Linux)。

**ファイル添付**
ドラッグ&ドロップまたは添付ボタンから、複数のファイル(ドキュメント・画像・コードなど)を会話に添付できます。

### オーバーレイウィンドウ

Interview-Assistant は半透明のオーバーレイウィンドウを常時最前面に表示し、キーボードショートカットひとつで表示・非表示や位置移動ができます。このオーバーレイは画面共有や録画に映り込みにくい特性を持ちますが、これは面接官を欺くための機能ではなく、自分の手元でメモや準備内容をすぐに参照できるようにするための表示上の特性です。経歴の捏造や、理解していない回答をそのまま読み上げるような使い方は想定していません。

### ダッシュボード

`Cmd+Shift+D` (macOS) / `Ctrl+Shift+D` (Windows/Linux) でダッシュボードを開き、以下の各設定・機能にサイドバーからアクセスできます。

**チャット**
会話履歴を日付ごとに一覧表示し、タイトルやメッセージ数で検索できます。各会話は詳細ページで続きのやり取り・ファイル添付・Markdown 形式でのエクスポート・削除が可能です。

**システムプロンプト**
AI の応答方針を定義するシステムプロンプトを作成・編集・削除・切り替えできます。名前や内容での検索、AI によるプロンプト生成補助にも対応しています。

**アプリ設定**
テーマ(ライト/ダーク/システム)、自動起動、Dock/タスクバーへのアイコン表示、常に最前面表示のオン/オフ、チャット履歴の一括削除を設定できます。

**回答設定**
回答の長さ(短め・普通・長め・自動)、回答言語(29言語から選択、対応状況は選択した LLM プロバイダに依存)、自動スクロールの有無を設定できます。
> 補足: 現時点ではこの画面に upstream の Pluely 由来のライセンス確認機構(ライセンスが有効でない場合に一部設定がロック表示される仕組み)が残っています。本プロジェクトはライセンス販売を行わないため、この制限は本来の趣旨に沿っておらず、別途整理する予定です([`docs/仕様/要求仕様書.md`](docs/仕様/要求仕様書.md) 13.1節)。

**スクリーンショット設定**
キャプチャ方式(全画面/選択範囲)と処理モード(マニュアル/自動)、自動モード時のデフォルトプロンプトを設定できます。

**オーディオ設定**
マイク・システム音声の入力デバイスを選択できます。検出済みのデバイス一覧と状態がリアルタイムに表示されます。

**カーソル & ショートカット**
カーソル表示(非表示 / 標準 / 自動、非表示は Linux 非対応)を切り替えられるほか、以下のグローバルショートカットをすべて再設定できます。

| 操作 | 既定のショートカット |
| --- | --- |
| ダッシュボードの表示/非表示 | `Cmd+Shift+D` / `Ctrl+Shift+D` |
| オーバーレイウィンドウの表示/非表示 | `Cmd+\` / `Ctrl+\` |
| 入力欄へフォーカス | `Cmd+Shift+I` / `Ctrl+Shift+I` |
| ウィンドウの移動(矢印キー併用) | `Cmd` / `Ctrl` を押しながら |
| システム音声取得の切り替え | `Cmd+Shift+M` / `Ctrl+Shift+M` |
| 音声入力の開始 | `Cmd+Shift+A` / `Ctrl+Shift+A` |
| スクリーンショット取得 | `Cmd+Shift+S` / `Ctrl+Shift+S` |

**Dev Space**
開発者・上級ユーザー向けに、AI / STT プロバイダをカスタム設定できる画面です。

- あらかじめ OpenAI、Anthropic Claude、Google Gemini、xAI Grok、Mistral AI、Cohere、Perplexity、Groq、OpenRouter、Ollama が組み込みプロバイダとして用意されています。
- 上記以外の LLM / STT サービスも、curl コマンド形式でエンドポイント・認証・レスポンスパスを指定することで追加できます。ローカル LLM(Ollama, LM Studio 等)やローカル STT(whisper.cpp, faster-whisper 等)との接続もこの仕組みで設定します。詳細は [`.claude/skills/local-llm-stt-integration/SKILL.md`](.claude/skills/local-llm-stt-integration/SKILL.md) を参照してください。
- `{{TEXT}}` `{{IMAGE}}` `{{SYSTEM_PROMPT}}` `{{MODEL}}` `{{API_KEY}}`(AI用)、`{{AUDIO}}` `{{API_KEY}}` `{{LANGUAGE}}`(STT用)などの変数をリクエストに埋め込めます。
- ストリーミング/非ストリーミングの切り替えにも対応しています。

### データの保存先

会話履歴・添付ファイルの情報は端末内の SQLite データベースに保存されます。AI/STT プロバイダ設定、システムプロンプト、キーボードショートカットなどの設定値は端末内のストレージに保存され、いずれも外部には送信されません。API キーなどの秘密情報は OS のセキュアストレージ(可能な場合)を利用します。AI への問い合わせは、選択したプロバイダへ直接送信されます。

> 補足: 現状、upstream 由来の PostHog 解析呼び出し(アプリ起動イベント等)とライセンス購入導線のコードが一部残っており、「解析・テレメトリなし」を完全に達成できていません。この整理は要求仕様書 8.4 節・13.1 節に基づく別タスクとして扱います。

---

## セットアップ

### 前提条件

- **Node.js** (v18 以上)
- **Rust** (最新の stable)
- **npm** または **yarn**
- Tauri の実行に必要な OS 別の依存パッケージ(Linux の WebKitGTK など)。詳細は [Tauri Prerequisites & Dependencies](https://v2.tauri.app/start/prerequisites/) を参照してください。

### 開発

```bash
# リポジトリを取得
git clone https://github.com/youfuku-sg/interview-assistant.git
cd interview-assistant

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run tauri dev
```

### ビルド

```bash
npm run tauri build
```

`src-tauri/target/release/bundle/` 配下に、OS ごとのインストーラ(macOS: `.dmg`、Windows: `.msi` / `.exe`、Linux: `.deb` / `.rpm` / `.AppImage`)が生成されます。

ブランチ運用・リリース手順については [`docs/仕様/ブランチ・リリース戦略.md`](docs/仕様/ブランチ・リリース戦略.md) を参照してください。

---

## ライセンス

本プロジェクトは **GNU General Public License v3.0** の下で公開されています。詳細は [LICENSE](LICENSE) を参照してください。fork 元である Pluely も GPL-3.0 で提供されています。

個人利用・検証目的での改修は自由に行えますが、配布や商用利用を行う場合は GPL-3.0 の条件に従う必要があります(詳細は [`docs/仕様/要求仕様書.md`](docs/仕様/要求仕様書.md) 8.7節)。

---

## 謝辞

- **[Pluely](https://github.com/iamsrikanthnani/pluely)** — 本プロジェクトの fork 元であり、実装の技術的基盤
- **[Cluely](https://cluely.com/)** — Pluely が UI コンセプトの参考にしたプロダクト
- **[Tauri](https://tauri.app/)** — デスクトップアプリフレームワーク
- **[tauri-nspanel](https://github.com/ahkohd/tauri-nspanel)** — macOS ネイティブパネル統合
- **[shadcn/ui](https://ui.shadcn.com/)** — UI コンポーネント
- **[@ricky0123/vad-react](https://github.com/ricky0123/vad)** — 音声区間検出(VAD)
- **[OpenAI](https://openai.com/)** — GPT モデル・Whisper API
- **[Anthropic](https://anthropic.com/)** — Claude モデル
- **[xAI](https://x.ai/)** — Grok モデル
- **[Google](https://gemini.google.com/)** — Gemini モデル
