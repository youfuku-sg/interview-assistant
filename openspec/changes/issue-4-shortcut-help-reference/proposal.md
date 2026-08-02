## Why

Users cannot easily find or understand the full list of keyboard shortcuts. The only place shortcuts are shown today is the `/shortcuts` settings page (menu label "カーソル・ショートカット"), where the shortcut list is mixed with cursor-selection settings and each row is presented as an edit control (toggle + "変更" button) rather than a clear, scannable reference. There is no Help screen at all, so a user who wants a quick "what are all the shortcuts" answer has no dedicated place to look. Issue #4 asks for the list to be checkable from either the settings screen or a help screen.

## What Changes

- Add a dedicated, read-only keyboard shortcuts reference view that lists every shortcut action with its name, description, and current key binding, grouped/ordered for easy scanning (no toggles or edit affordances in this view).
- Surface that reference from the existing Settings area: the current `/shortcuts` page (`src/pages/shortcuts`) gains a clearly labeled, always-visible read-only summary of the full shortcut list (independent of whether the user opens an editor row), so "the list" is visible without any interaction.
- Introduce a new in-app Help screen (new `/help` route, new sidebar entry) whose primary content is the same read-only shortcut reference, giving users a second, more discoverable entry point that isn't nested under cursor/shortcut editing settings.
- Reuse existing shortcut data/helpers (`getAllShortcutActions`, `getShortcutsConfig`, `formatShortcutKeyForDisplay`) to build the reference view; do not change shortcut storage, editing, recording, or backend (`update_shortcuts`) behavior.
- No changes to how shortcuts are triggered, recorded, or persisted — this is purely an additive, read-only presentation feature for discoverability.

## Capabilities

### New Capabilities
- `shortcut-help-reference`: Provides a read-only, easy-to-scan list of all keyboard shortcut actions and their current key bindings, viewable from both the Settings screen and a new Help screen.

### Modified Capabilities
- (none — no existing OpenSpec capability currently covers the shortcuts settings page or app navigation, so this is additive only)

## Impact

- `src/pages/shortcuts/` — add a read-only shortcut list section/component alongside the existing `ShortcutManager` editor.
- `src/pages/help/` (new) — new Help page hosting the shortcut reference.
- `src/routes/index.tsx` — register the new `/help` route.
- `src/hooks/useMenuItems.tsx` — add a "ヘルプ" sidebar entry pointing at `/help`.
- `src/lib/storage/shortcuts.storage.ts`, `src/types/shortcuts.ts` — read-only consumers only, no interface changes expected.
- No Rust/Tauri backend changes (`src-tauri/src/shortcuts.rs` untouched).
