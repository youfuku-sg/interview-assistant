## 1. Export logic (`src/hooks/useHistory.ts`)

- [ ] 1.1 Add a `generateConversationJson(conversation: ChatConversation): string` helper that returns a pretty-printed JSON string of `{ id, title, createdAt, updatedAt, messages: [{ id, role, content, timestamp }] }`.
- [ ] 1.2 Parameterize `generateFilename` (or add a sibling helper) so the download extension can be `.md` or `.json` while reusing the same title-sanitization logic.
- [ ] 1.3 Update `handleDownloadConversation` to accept a `format: "markdown" | "json"` argument, branch to build either the Markdown or JSON string/blob accordingly, and use the matching file extension.
- [ ] 1.4 Update `handleDownload` and the `UseHistoryReturn` type to thread the new `format` argument through, keeping `isDownloaded`/`downloadedConversations` bookkeeping unchanged.

## 2. Format picker UI (`src/pages/chats/components/View.tsx`)

- [ ] 2.1 Replace the single download `Button` in the header `rightSlot` with a `DropdownMenu` offering "Markdown (.md)" and "JSON (.json)" items, matching the existing button sizing/styling.
- [ ] 2.2 Wire each dropdown item's `onClick` to call `handleDownload(messages, e, "markdown")` / `handleDownload(messages, e, "json")` respectively.
- [ ] 2.3 Keep the existing "ダウンロード済み" success indicator behavior working for both formats.

## 3. Verification

- [ ] 3.1 Run `npm run typecheck` and `npm run lint`.
- [ ] 3.2 Manually run the app (`npm run tauri dev`), open a conversation with messages, and verify both the Markdown download (content unchanged from before) and the new JSON download (valid JSON, correct fields) work and show the success indicator.
