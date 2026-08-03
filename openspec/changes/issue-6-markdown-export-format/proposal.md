## Why

Issue #6 asks for the conversation-history export feature to support a human-readable Markdown format, since the requester believes the current export is JSON-only. Investigating `src/hooks/useHistory.ts` and `src/pages/chats/components/View.tsx` shows the opposite is actually true today: the only export path is the "ダウンロード" button on a single conversation's detail view, and it already writes Markdown (`generateConversationMarkdown` in `useHistory.ts`) — there is no JSON export anywhere in the codebase. The underlying, still-valid need behind the issue is that the export feature offers no format choice and no way to get a structured, machine-readable copy of a conversation (e.g. for re-import, scripting, or backup) — so this proposal adds a JSON export option alongside the existing Markdown one, giving users the choice the issue was asking for either way.

## What Changes

- Add a format choice (Markdown / JSON) to the existing per-conversation download action in `src/pages/chats/components/View.tsx`, replacing the single "ダウンロード" button with a small format picker (e.g. dropdown menu) that offers both options.
- Add a `generateConversationJson` helper alongside the existing `generateConversationMarkdown` in `src/hooks/useHistory.ts`, producing a structured JSON representation of the conversation (title, timestamps, messages with role/content/timestamp).
- Preserve existing Markdown output and filename/download behavior exactly as-is; only add the new JSON path and the picker UI.
- No changes to storage, the SQLite schema, or any Tauri command — this is a purely client-side, presentation-layer export change.

## Capabilities

### New Capabilities
- `conversation-export`: Export of a single conversation from the chat detail view, in either Markdown or JSON format, chosen by the user at download time.

### Modified Capabilities
(none — no existing spec covers conversation export today)

## Impact

- `src/hooks/useHistory.ts`: add `generateConversationJson`, extend `handleDownloadConversation`/`handleDownload` to accept a format argument.
- `src/pages/chats/components/View.tsx`: replace the single download `Button` with a format-choice control (e.g. `DropdownMenu` from `src/components/ui/dropdown-menu.tsx`, already used elsewhere in the app).
- No backend/Rust changes, no new dependencies, no migration required.
