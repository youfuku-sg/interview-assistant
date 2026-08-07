## Why

Issue #25: 設定画面(Settings, `src/pages/settings/`)の各項目の説明文(グレーの小さいテキスト)が読みにくいので、フォントサイズを一段階大きくしたいというユーザーからの指摘がある。設定画面の各項目(テーマ、自動起動、アプリアイコン、常に最前面表示)は共通の `Header` コンポーネント(`src/components/Header/index.tsx`)の `description` と、各コンポーネント内で個別に描画している `text-xs text-muted-foreground` 系の `<p>` を組み合わせて説明文を表示しているが、これらは他の多くの画面(`src/layouts/PageLayout.tsx` 経由でダッシュボード・チャット・音声・スクリーンショット・ショートカット・応答・Dev Space など)でも共有されているため、Header コンポーネント自体のデフォルトサイズを変更すると設定画面以外にも影響が及んでしまう。Issue の要望はあくまで設定画面に限定されているため、設定画面のみを対象にフォントサイズを引き上げる必要がある。

## What Changes

- 設定画面(`src/pages/settings/index.tsx` および `src/pages/settings/components/` 配下の `Theme.tsx`, `AutostartToggle.tsx`, `AppIconToggle.tsx`, `AlwaysOnTopToggle.tsx`)で表示される、各項目の説明文(グレーの小さいテキスト)のフォントサイズを Tailwind のテキストサイズスケールで一段階引き上げる。`src/pages/settings/components/DeleteChats.tsx` は存在するが `src/pages/settings/index.tsx` からインポート・描画されておらず、現状のSettings画面には表示されないため対象外とする。
  - セクション見出し直下の説明文(`Header` コンポーネントの `description`): `text-xs lg:text-sm` → `text-sm lg:text-base`(メインタイトル)、`text-[10px] lg:text-xs` → `text-xs lg:text-sm`(サブタイトル、`Theme.tsx` の「ウィンドウの透明度」のみ該当)
  - 各トグル項目のラベル直下にある個別の説明文(`text-xs text-muted-foreground mt-1` などの `<p>`): `text-xs` → `text-sm`
- `Header` コンポーネント自体のデフォルトサイズは変更せず、既存の `descriptionClassName` prop を使って設定画面側からのみサイズを上書きする。これにより設定画面以外の画面(ダッシュボード、チャット、音声、スクリーンショット、ショートカット、応答、Dev Space など)の見た目は変更しない。
- `src/layouts/PageLayout.tsx` に、既存の `Header` が持つ `descriptionClassName` prop をオプションとして追加で受け取り `Header` へそのまま橋渡しする変更を加える(未指定時は既存動作のまま)。これにより設定画面のページ全体の説明文(`設定 / アプリの設定を管理します`)にも同じ上書きを適用できるようにする。
- 具体的なクラス名・サイズの決定は `design.md` で扱う。

## Capabilities

### New Capabilities
- `settings-ui`: 設定画面(Settings)固有の表示要件を定義する新規capability。今回は「各項目の説明文が読みやすいフォントサイズで表示される」という要件を追加する。設定画面のUI要件を今後追加する際の受け皿にもなる。

### Modified Capabilities
(none)

## Impact

- `src/pages/settings/index.tsx`: `PageLayout` に説明文サイズ上書き用の `descriptionClassName` を渡す。
- `src/pages/settings/components/Theme.tsx`: メインの `Header` とサブの `Header`(「ウィンドウの透明度」)双方に `descriptionClassName` を渡し、テーマ切り替えの個別説明文(`text-xs`)と透明度のヒントテキスト(`text-xs text-muted-foreground/70`)を `text-sm` に変更する。
- `src/pages/settings/components/AutostartToggle.tsx`, `AppIconToggle.tsx`, `AlwaysOnTopToggle.tsx`: 各 `Header` に `descriptionClassName` を渡し、個別の説明文(`text-xs text-muted-foreground mt-1`)を `text-sm` に変更する。
- `src/pages/settings/components/DeleteChats.tsx`: 変更しない。`src/pages/settings/index.tsx` からインポート・描画されておらず、現状のSettings画面には表示されない未使用コンポーネントであるため、この変更のスコープ外とする。
- `src/layouts/PageLayout.tsx`: `descriptionClassName` をオプションで受け取り `Header` へ橋渡しする(既存の呼び出し元は未指定のままなので、設定画面以外への影響はない)。
- `src/components/Header/index.tsx`: 変更なし(既存の `descriptionClassName` prop をそのまま利用する)。
- 挙動・データフローへの影響はなく、見た目(CSS/Tailwindクラス)の調整のみ。破壊的変更ではない。
