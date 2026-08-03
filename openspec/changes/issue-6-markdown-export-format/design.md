## Context

The chat detail view (`src/pages/chats/components/View.tsx`) has a single "ダウンロード" button wired to `useHistory().handleDownload`. That calls `handleDownloadConversation` in `src/hooks/useHistory.ts`, which always builds a Markdown string via `generateConversationMarkdown` and triggers a browser download of a `.md` file. There is no JSON export anywhere in the app today, despite Issue #6's premise. The export is entirely client-side (blob + `<a download>`); no Tauri command or DB access is involved, and `ChatConversation`/`ChatMessage` (`src/types/completion.ts`) are already plain serializable objects, so a JSON export is a small, local addition.

## Goals / Non-Goals

**Goals:**
- Let the user choose Markdown or JSON when downloading a single conversation from the chat detail view.
- Keep the existing Markdown output byte-for-byte identical to today's behavior (no regressions for anyone already relying on it).
- Keep the change confined to `useHistory.ts` and `View.tsx`; no new dependencies, no backend changes.

**Non-Goals:**
- Bulk/multi-conversation export (exporting all conversations at once) — out of scope, not requested by the issue.
- Re-import of an exported JSON file back into the app.
- Changing the export entry point's location (still the per-conversation detail view, not the conversation list).

## Decisions

- **Format picker UI**: Replace the single download `Button` with a `DropdownMenu` (`src/components/ui/dropdown-menu.tsx`, already used elsewhere, e.g. `src/components/Header/index.tsx`) offering "Markdown (.md)" and "JSON (.json)" items, instead of a second button or a settings toggle. A dropdown keeps the action a single click-target in the header row and matches the existing icon-button styling, whereas a persistent second button would crowd the already-dense header `rightSlot` row (attach/download/delete).
- **JSON shape**: `generateConversationJson` serializes `{ id, title, createdAt, updatedAt, messages: [{ id, role, content, timestamp }] }` — i.e. the same fields `generateConversationMarkdown` already reads off `ChatConversation`/`ChatMessage`, via `JSON.stringify(conversation, null, 2)` on the conversation object as loaded (it is already this shape; no remapping needed). This keeps the JSON a faithful, re-usable structured dump rather than inventing a new schema.
- **Filename/extension**: Reuse `generateFilename(title)` for the base name, parameterized by extension (`.md` vs `.json`) instead of hardcoding `.md`, so both formats share the existing sanitization logic.
- **State/handlers**: `handleDownloadConversation` and `handleDownload` take an added `format: "markdown" | "json"` argument (defaulting behavior preserved by callers always passing it explicitly from the dropdown item's `onClick`); `isDownloaded`/`downloadedConversations` success-state bookkeeping is unchanged since it doesn't depend on format.

## Risks / Trade-offs

- [Adding a dropdown changes the header row's visual layout] → Low risk: the app already uses `DropdownMenu` elsewhere with the same icon/button sizing conventions (`text-[10px] lg:text-sm h-6 lg:h-8`), so it's a drop-in style match, not a new pattern.
- [`JSON.stringify` on the full conversation object could leak internal fields not meant for export] → Mitigated by explicitly picking the fields listed above in `generateConversationJson` rather than stringifying the raw object wholesale.

## Open Questions

- None — the issue's stated premise (JSON-only today) doesn't match the code, but the concrete, still-valid ask (format choice including Markdown) is unambiguous and covered by this design.
