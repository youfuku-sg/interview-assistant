## 1. 共有コンポーネントへのオプションprop追加

- [ ] 1.1 `src/layouts/PageLayout.tsx` に、既存の `Header` の `descriptionClassName` prop をそのまま橋渡しするオプションの `descriptionClassName` prop を追加する(未指定時は現状動作のまま)。

## 2. 設定画面の説明文フォントサイズ引き上げ

- [ ] 2.1 `src/pages/settings/index.tsx` の `PageLayout` 呼び出しに `descriptionClassName="text-sm lg:text-base"` を渡す。
- [ ] 2.2 `src/pages/settings/components/Theme.tsx` のメイン `Header`(「テーマのカスタマイズ」)に `descriptionClassName="text-sm lg:text-base"` を渡す。
- [ ] 2.3 `src/pages/settings/components/Theme.tsx` のサブ `Header`(「ウィンドウの透明度」)に `descriptionClassName="text-xs lg:text-sm"` を渡す。
- [ ] 2.4 `src/pages/settings/components/Theme.tsx` のテーマ切り替え個別説明文(`text-xs text-muted-foreground mt-1`)を `text-sm text-muted-foreground mt-1` に変更する。
- [ ] 2.5 `src/pages/settings/components/Theme.tsx` の透明度ヒントテキスト(`text-xs text-muted-foreground/70`)を `text-sm text-muted-foreground/70` に変更する。
- [ ] 2.6 `src/pages/settings/components/AutostartToggle.tsx` の `Header` に `descriptionClassName="text-sm lg:text-base"` を渡し、個別説明文(`text-xs text-muted-foreground mt-1`)を `text-sm text-muted-foreground mt-1` に変更する。
- [ ] 2.7 `src/pages/settings/components/AppIconToggle.tsx` の `Header` に `descriptionClassName="text-sm lg:text-base"` を渡し、個別説明文(`text-xs text-muted-foreground mt-1`)を `text-sm text-muted-foreground mt-1` に変更する。
- [ ] 2.8 `src/pages/settings/components/AlwaysOnTopToggle.tsx` の `Header` に `descriptionClassName="text-sm lg:text-base"` を渡し、個別説明文(`text-xs text-muted-foreground mt-1`)を `text-sm text-muted-foreground mt-1` に変更する。

## 3. スペック同期・動作確認

- [ ] 3.1 `openspec validate issue-25-enlarge-settings-description-text --strict` を実行しエラーがないことを確認する
- [ ] 3.2 `npm run typecheck` と `npm run lint` を実行しエラーがないことを確認する
- [ ] 3.3 アプリを起動し、設定画面のページ見出しと各項目(テーマ、自動起動、アプリアイコン、常に最前面表示)の見出し直下の説明文、ラベル直下の状態説明、および透明度のヒントが、それぞれ変更前より Tailwind のテキストサイズスケールで1段階大きく、読みやすくなっていることを確認する
- [ ] 3.4 設定画面以外の画面(ダッシュボード、チャット、音声、スクリーンショット、ショートカット、応答、Dev Space など)の説明文フォントサイズが変更前と変わっていないことを確認する
