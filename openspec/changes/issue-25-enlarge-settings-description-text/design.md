## Context

設定画面(`src/pages/settings/`)の説明文は2箇所に分かれて描画されている。

1. 各セクション見出しの直下(共通 `Header` コンポーネント、`src/components/Header/index.tsx`)。`isMainTitle` が真のとき `text-xs lg:text-sm`、偽のとき `text-[10px] lg:text-xs` を description に適用する。`Header` は `descriptionClassName` prop を既に持っており、`cn()`(clsx + tailwind-merge)経由でデフォルトクラスの後に結合されるため、同じユーティリティグループ(フォントサイズ)を上書き指定すれば tailwind-merge が後勝ちでデフォルトを無効化する。
2. 各トグル項目のラベル直下にある個別の `<p className="text-xs text-muted-foreground mt-1">`(または `Theme.tsx` の透明度ヒントのように `text-xs text-muted-foreground/70`)。これらは `Header` を経由せず、各コンポーネント(`Theme.tsx`, `AutostartToggle.tsx`, `AppIconToggle.tsx`, `AlwaysOnTopToggle.tsx`)内に直接ハードコードされている。

`Header` と `PageLayout` は設定画面専用ではなく、`src/pages/` 配下のほぼ全画面(ダッシュボード、チャット、音声、スクリーンショット、ショートカット、応答、Dev Space など)で共有されている。Issue #25 は設定画面に限定した要望であるため、共有コンポーネントのデフォルト値そのものを変更することはできない。

## Goals / Non-Goals

**Goals:**
- 設定画面の各項目の説明文(グレーの小さいテキスト)を、Tailwind のテキストサイズスケールで一段階引き上げる。
- 共有コンポーネント(`Header`, `PageLayout`)のデフォルトの見た目は変更せず、設定画面以外の画面には影響を与えない。
- 追加の共通スタイル定義や新規コンポーネントを増やさず、既存の `descriptionClassName` prop の仕組みをそのまま使う。

**Non-Goals:**
- 説明文以外のテキスト(項目タイトル、ボタンラベル、削除確認ダイアログの見出しなど)のフォントサイズ変更。
- `Header` コンポーネントや `PageLayout` コンポーネントのデフォルトサイズそのものの変更(設定画面以外にも影響するため対象外)。
- 削除確認ダイアログ(`DeleteChats.tsx` 内、`text-sm text-muted-foreground` のモーダル本文)の変更。これは「設定画面の各項目の説明文」ではなくモーダル内の確認メッセージであり、Issue の指す対象外と判断する。
- レスポンシブブレークポイント設計そのものの見直し(既存の `lg:` パターンを踏襲し、値のみ一段階引き上げる)。

## Decisions

- **`Header` の `descriptionClassName` prop を設定画面側から渡すことで上書きする**。理由: `Header` は既にこの prop を持っており(`src/components/Header/index.tsx`)、`cn()` 経由でデフォルトクラスの後ろに結合されるため、フォントサイズ関連のクラスを渡せば tailwind-merge が既存の `text-xs lg:text-sm` 等を打ち消して置き換える。新しい prop や条件分岐を `Header` 自体に追加する必要がない。
  - 検討した代替案: (a) `Header` のデフォルトサイズ自体を引き上げる — 設定画面以外の全画面に影響するため却下。(b) 設定画面専用の `Header` ラッパーコンポーネントを新設する — 既存 prop で表現できる変更のために新規抽象化を増やすのは過剰(YAGNI)であるため却下。
- **フォントサイズは Tailwind スケールで隣接する1段階のみ引き上げる**: `text-[10px]` → `text-xs`、`text-xs` → `text-sm`。`lg:` 修飾がある箇所も同様に1段階引き上げる(`lg:text-xs` → `lg:text-sm`、`lg:text-sm` → `lg:text-base`)。理由: Issue の要望が「一段階大きくしたい」という穏やかな調整であり、既存のレスポンシブ設計(ブレークポイントごとに1段階のスケール差を持たせる方針)とも整合する。
- **`PageLayout` に `descriptionClassName` をオプション prop として追加し、`Header` へ橋渡しする**。理由: 設定画面のページ全体の説明文(「設定 / アプリの設定を管理します」)も `Header` の description であり、`Settings` コンポーネント(`src/pages/settings/index.tsx`)は `PageLayout` 経由でしか `Header` に到達できないため。`PageLayout` を呼び出す他の画面はこの prop を渡さないため未指定時は既存動作のまま(後方互換)。
- **個別の `<p>` 説明文は各コンポーネント内で直接 `text-xs` → `text-sm` に書き換える**。理由: これらは `Header` を経由しない、設定画面のコンポーネント固有のマークアップであり、既に設定画面のコンポーネント内にスコープされているため、上書き用の仕組みを介さず直接変更しても他画面への影響がない。

## Risks / Trade-offs

- [`descriptionClassName` に依存した上書きは、`Header` 側の `cn()` 実装(tailwind-merge によるクラス競合解決)が前提となる] → 現状の `Header` 実装は既にこのユースケース(呼び出し元からのデフォルト上書き)を想定して `descriptionClassName` prop を用意しており、他の呼び出し元(例: `DashboardLayout.tsx` 等)でも同様の上書きパターンが使われていないか実装時に確認する。
- [設定画面のみフォントサイズが他画面と異なることになり、画面間で視覚的な一貫性がやや崩れる] → Issue の要望自体が設定画面限定であり、意図した差分である。将来的に他画面にも同様の要望が出た場合は、`settings-ui` capability とは別に横断的な変更として扱う。
- [`PageLayout` への prop 追加は共有コンポーネントの変更である] → 追加する prop はオプションかつデフォルト未指定時は既存動作を保つため、設定画面以外の呼び出し元には影響しない。

## Migration Plan

- 単一ブランチでの実装・動作確認後、既存のリリースフローに従って `main` へ反映する。CSS/Tailwindクラスの変更のみでデータ・状態・API に影響しないため、データマイグレーションやロールバック時の特別な考慮は不要(直前コミットに戻すのみで復元可能)。
