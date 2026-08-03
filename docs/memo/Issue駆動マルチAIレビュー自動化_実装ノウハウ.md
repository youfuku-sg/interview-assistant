# Issue駆動マルチAIレビュー自動化 実装ノウハウ

GitHub Issueの起票をトリガーに、Claude Code・Codex・ローカルLLM（Aider経由）の3つのAIが自動でOpenSpec提案を作成し、合意するまで議論し続けるGitHub Actionsワークフローを実装した際のノウハウ。他プロジェクトでも同じ構成を組む可能性があるため、汎用的な知見として残す。

参照実装は本リポジトリの `.github/workflows/issue-propose.yml`。このメモはその中身を逐一転記するのではなく、実装中にハマった点・決定の理由をまとめたもの。詳細は実際のワークフローファイルを読むこと。

## 1. 全体構成

```
Issue作成 (issues: opened)
  ↓
create-branch  ... AI不要・機械的に feature/<issue番号> を作成・push（ubuntu-latest）
  ↓
propose        ... Claude Codeがopenwiki参照 → OpenSpec提案作成（自己ホストランナー）
  ↓
ai-review      ... Claude Code / Codex / ローカルLLM(Aider)が合意するまでレビューをループ（自己ホストランナー）
  ↓
comment        ... 結果をIssueにコメント（ubuntu-latest）
```

ジョブを機能ごとに分け、AIが不要な決定論的な処理（ブランチ作成、コメント投稿）は`ubuntu-latest`、AIを使う処理だけ自己ホストランナーに乗せている。

## 2. なぜ自己ホストランナーか

- Claude Code / CodexともにAPIキーを別途契約せず、**そのPCに既にログイン済みのセッション（サブスクリプション認証）をそのまま使う**ため
- ローカルLLM（LM Studio）は`localhost`経由でしか到達できず、GitHub提供のホスト型ランナーからは原理的にアクセス不可能なため

構築手順は `docs/仕様/セルフホストランナー構築手順.md` を参照（Organization単位での登録、ログオンアカウントの設定など）。

## 3. ハマったポイントと対処

### 3.1 `issues:` トリガーは default branch 上のワークフローしか見ない

`workflow_dispatch`と同様、`issues`や`issue_comment`など特定のrefに紐づかないイベントは、**リポジトリのdefault branch（main）にあるワークフロー定義**でしか発火判定されない。featureブランチにワークフローを置いただけでは動かない。検証時はやむを得ずmainへ直接pushしたが、本来は既存のブランチ・リリース戦略に従うべき点として認識しておく。

### 3.2 ブランチ作成とAIの命名判断を分離する

最初は「Claude CodeにOpenSpec変更名を考えさせ、そのままブランチ名にも使う」設計にしていたが、後に「Issue番号だけで機械的に`feature/<N>`を即座に作る」ジョブを独立させた。理由:

- AIのステップが失敗・タイムアウトしても、少なくともブランチは存在する
- GitHubの「Development」欄にIssueとブランチが即座に紐づく
- OpenSpec変更名（`issue-<N>-<説明>`）は人間が読んで分かりやすい名前をAIに任せたいが、ブランチ名はそこに依存させる必要がない

### 3.3 Issueのタイトル・本文はenv経由で渡さない（文字化けする）

GitHub Actionsの`${{ github.event.issue.body }}`をそのまま`env:`に渡し、Windows PowerShellの中で使うと、**日本語などの非ASCII文字がコンソールのコードページ（cp932）で化ける**。実際、Claude自身が「env経由の文字が読めなかったので`event.json`から復旧した」と自己申告してきたことで発覚した。

対処: `$env:GITHUB_EVENT_PATH`（GitHub Actionsが必ず用意するイベントペイロードJSONファイル）をAIに直接読ませる。ファイルはUTF-8で書かれておりコンソールのコードページに影響されない。

### 3.4 PowerShellの `$変数名:` はスコープ修飾子と誤解釈される

```powershell
"Write to $statusFilePath: either ..."   # NG: パースエラー
"Write to $statusFilePath`: either ..."  # OK: バッククォートでコロンをエスケープ
```

`$env:`のようにコロンは変数のスコープ指定に使われる文字のため、任意の変数名の直後にコロンを続けると`InvalidVariableReferenceWithDrive`エラーになる。ヒアドキュメント（`@"..."@`）内で変数の直後に日本語以外の記号を続ける際は要注意。

### 3.5 Claude Codeを無人実行するには `--dangerously-skip-permissions` が要る

このリポジトリの`.claude/settings.json`の`permissions.allow`は`git status`など読み取り系のごく一部しか許可しておらず、`git commit`・`openspec new change`・ファイル編集などは対話的な承認が必要になる。CIには承認できる人間がいないため、`claude -p --dangerously-skip-permissions`で許可プロセスそのものをスキップする。

個人のprivateリポジトリで、Issueを起票できるのが本人だけという前提だからこそ許容できる設定である点に注意。

### 3.6 ワークスペースの信頼設定 (`~/.claude.json`)

Claude Codeは初回、そのワークスペースパス（自己ホストランナーの作業ディレクトリ）が信頼されていないと`permissions.allow`を無視する。`~/.claude.json`の`projects["<path>"].hasTrustDialogAccepted`を`true`にすれば解消する。この設定ファイルは認証情報も含むため、**書き換え前に必ずバックアップを取り、書き換え後に他のトップレベルキーが消えていないか検証する**（`ConvertTo-Json`はデフォルトの`-Depth`が浅く、ネストしたオブジェクトを平気で切り詰めるため`-Depth`を十分に大きくする必要がある）。

### 3.7 Codex CLIはデフォルトsandboxが`read-only`

`codex exec`はファイル編集をさせるには `-s workspace-write` の指定が必要（デフォルトは`read-only`）。プロンプトは`-`を渡してstdin経由にすると、コマンドライン引数のエスケープ問題を避けられる。出力は `-o <file>` で直接ファイルに書き出せる。

### 3.8 Aider (ローカルLLM) はPython 3.13非対応

`aider-chat`は執筆時点で`Requires-Python <3.13`。Windows実行環境が3.13だと、pipが黙って大昔の互換バージョン（0.16.0等）を解決してしまい、依存パッケージのビルドが壊れる。`winget install --id Python.Python.3.12`で3.12を別途入れ、`py -3.12 -m pip install aider-chat` / `py -3.12 -m aider` のように明示的にバージョン指定する。

### 3.9 AiderをLM Studioに繋ぐ

環境変数 `LM_STUDIO_API_KEY`（ダミー値でよい）と`LM_STUDIO_API_BASE=http://localhost:1234/v1`を設定し、`--model lm_studio/<LM StudioのモデルID>`を指定する。プロンプトは`--message`ではなく`--message-file <path>`でファイル経由にすると、他のAIの回答（引用符やバッククォートを含みうる）をそのまま安全に渡せる。

### 3.10 Windowsコンソールの文字コード (cp932) でAider自体がクラッシュすることがある

Aiderが自分のUI表示に使う記号（`►`等）がcp932で表現できずクラッシュする。`chcp 65001`に加えて`$env:PYTHONUTF8="1"` / `$env:PYTHONIOENCODING="utf-8"`を設定する。

### 3.11 ローカルLLMはVRAM次第で複数モデル同時ロードに弱い

同一ジョブ内で2つ以上のローカルモデルを切り替えて呼び出すと、GPU VRAMを使い切って`Engine protocol predict request failed: fetch failed`や`Failed to load model`のようなエラーになることがある。単純なraw API呼び出しで再現するかを確認すれば、エージェントツール側の問題かLM Studio側の問題かを切り分けられる。**1ジョブ内でローカルモデルは1つだけ使う**設計にするのが無難。

### 3.12 他AIの出力ファイルを読み戻すときは `-Encoding utf8` を明示する

Claude/Codex/Aiderそれぞれの回答を次のAIへのプロンプトに引き継ぐ際、`codex exec -o <file>`やAiderが直接書き出したファイルを`Get-Content -Raw`で読み戻すと、**Windows PowerShell 5.1のデフォルトエンコーディング推定に引きずられて文字化けする**ことがある（自分で`Set-Content -Encoding utf8`したファイルは無事だが、他プロセスが書いたファイルを読む側は明示しないと化ける）。自分で書いたファイルだけでなく、**外部プロセスが書いたファイルを読むときも`Get-Content -Raw -Encoding utf8`を明示する**こと。文字化けした内容を次のAIに渡すと、AI側がその文字化けを解釈しようとして異常終了することもある（Aiderが`NativeCommandError`でクラッシュした実例あり）。

### 3.13 gitignore対象ディレクトリへのオーケストレーション側の `git add` にも `-f` が要る

`openspec/`は`.gitignore`に含まれているため、AI（Claude/Codex）は自分で編集した後`git add -f`を使うが、**オーケストレーション用のPowerShellスクリプト側で「変更があったらまとめてcommitする」処理を書く場合も同様に`-f`を忘れると、警告が出るだけで実際には何もステージされず、後続のcommitが空振りする**。`git status --porcelain`自体はgitignore済みでも既に追跡されているファイルの変更を検出できるため一見動いているように見えるが、`git add`だけ`-f`忘れで無言の失敗をする点に注意。

### 3.14 ネイティブコマンドの出力は `*>` ファイルリダイレクトではなくパイプラインで受ける

`py -3.12 -m aider ... *> file.txt` のように`*>`（全ストリームをファイルへ）を使うと、Windows PowerShell 5.1上で`NativeCommandError`（`RemoteException`、メッセージ空欄）という原因の特定しづらい終端エラーが不定期に発生した。`claude -p`や`codex exec -o <file>`と同じように、**パイプライン経由で文字列としてキャプチャする**（`$output = (py ... 2>&1 | Out-String)`のように書き、その後`Set-Content`で自分でファイルに保存する）方が安定する。それでも完全には解消しない可能性があるため、この手のネイティブコマンド呼び出しは`try/catch`で包み、失敗しても他のAIのラウンドを止めないようにしておくと安全（実際、この対策後もqwen呼び出しは時折同じ例外を吐いたが、`try/catch`のおかげでジョブ全体は完走した）。

### 3.15 reasoningモデルは判定文言を「独り言」の中で複数回言うことがある

qwenのような思考過程を出力するモデルに`「応答の最後に必ずVERDICT: AGREE か VERDICT: REQUEST_CHANGESを書け」`と指示しても、最終行以外の思考の途中で「AGREEと言うべきか、REQUEST_CHANGESと言うべきか」のように両方の文言を検討する文章を出力することがある。単純な部分一致（`$output -match "VERDICT:\s*AGREE"`）では、最初にヒットした方（＝本当の結論ではないかもしれない）を拾ってしまい、判定を誤る。**必ず「最後に出現したVERDICT行」を採用する**（`[regex]::Matches(...)`で全マッチを取り、配列の最後の要素を使う）。

## 4. AIレビューループの設計

3体のAI（Claude Code → Codex → ローカルLLM の順）に、直前のAIの回答を渡しながら順番にレビューさせる。各AIには:

1. 現在の提案ファイルを自分で読み直す（他AIの発言だけを信用しない）
2. 問題があれば直接ファイルを編集する
3. 応答の最後に必ず `VERDICT: AGREE` または `VERDICT: REQUEST_CHANGES` の1行を書かせる

というプロンプトを与える。オーケストレーション側（PowerShellスクリプト）は各AIの発言後に`git status --porcelain`で実際に変更があったかを確認し、変更があればコミットする。**全員がAGREEかつ誰も変更していないラウンドがあった時点で合意成立**とみなしループを打ち切る（上限ラウンド数を設けておく。今回は3）。

検証時、1ラウンド目で3体とも実際に指摘・修正を行い、2ラウンド目で全員AGREE・無変更となり正しく収束することを確認済み。

## 5. 実際に確認できた成果物の質

Claude Codeは単に雛形を作るだけでなく、実際のコード（`useSystemAudio.ts`のエラーハンドリング等）まで読みに行き、既存実装に即したOpenSpec提案を生成した。ローカルLLM/Aiderもgitリポジトリとして認識し、`AGENTS.md`を自動的にコンテキストへ取り込んだ。

## 6. 未解決・今後の課題

- AIレビューループの上限ラウンド数は暫定値（3）。実運用でチューニングが必要
- qwen（Aider）呼び出しはtry/catchで保護しているが、根本原因（NativeCommandErrorが時折再発する条件）は完全には特定できていない。失敗時はそのラウンドのqwenの意見なしで進む
- OpenCode（LM Studio + Claude Code類似のエージェント）はWindows上のヘッドレス実行が不安定と判明したため今回は不採用。Aiderの方が安定している

Claude Code・Codex・qwen(Aider)の3AI体制でのレビューループは、複数のIssueで実際に合意成立（2ラウンドで収束）まで完走することを確認済み。
