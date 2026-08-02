## Context

The dashboard shell (`DashboardLayout` + `Sidebar`) renders a fixed `menu` list from `useMenuItems()` and routes them through `src/routes/index.tsx`. `useMenuItems` also exposes a separate `footerItems` list (mailto/GitHub/quit links, rendered as external `<a>` tags) and `footerLinks` (icon-only external links). The shortcuts settings page (`src/pages/shortcuts/index.tsx`) currently renders `CursorSelection` followed by `ShortcutManager`, and is reached only via the single sidebar entry labeled "カーソル・ショートカット". `ShortcutManager` treats every row as an editor: a `Switch`, the key `code` badge, and a "変更" button that swaps the row into `ShortcutRecorder`. There is no summarized, non-interactive view of "all shortcuts at a glance", and no Help concept anywhere in the app (`useMenuItems`, routes, and pages have no help-related entries).

Shortcut data already has a clean read-only source: `getAllShortcutActions()` returns the full `ShortcutAction[]` (id, name, description, per-platform default key) and `getShortcutsConfig()` returns current `bindings`. `formatShortcutKeyForDisplay` and `getPlatformDefaultKey` already handle presentation. No new state, storage, or Tauri commands are needed to render a reference list.

## Goals / Non-Goals

**Goals:**
- Give users one obvious, read-only place per surface (Settings, Help) to see the full current shortcut list without entering edit mode on anything.
- Make the Help screen a real, minimal but extensible entry point (new route + sidebar item), not just a modal bolted onto Settings.
- Reuse existing shortcut helpers/types as-is; the reference view is a pure consumer of `getAllShortcutActions` + `getShortcutsConfig`.

**Non-Goals:**
- Changing how shortcuts are recorded, validated, persisted, or applied to the backend (`ShortcutRecorder`, `update_shortcuts`, `src-tauri/src/shortcuts.rs` are untouched).
- Building a general-purpose help/FAQ system. The Help screen's scope in this change is the shortcut reference; other help content is future work.
- Reworking the existing `ShortcutManager` editor UX (toggle/edit rows stay as they are).
- Any overlay (`src/pages/app`) changes — the issue asks for Settings/Help, which are dashboard-only surfaces today.

## Decisions

- **Extract a shared, presentation-only `ShortcutReference` component** (in `src/pages/shortcuts/components/shortcuts/`, exported alongside `ShortcutManager`) that takes the same `actions`/`bindings` shape and renders a compact, grouped, read-only list (name, description, formatted key chord). Both the Settings page and the Help page render this component, so the "list" the user sees is identical in both places and there is a single implementation to keep in sync.
  - The component must visually distinguish rows where `binding.enabled === false` (e.g. dimmed styling plus a "無効" label), mirroring how `ShortcutManager` dims disabled rows today. Otherwise the reference would misrepresent a disabled shortcut as currently active, defeating the feature's purpose of being a trustworthy "what shortcuts currently work" answer.
  - The component must replicate `ShortcutManager`'s `move_window` special case (appending `+ (← ↑ ↓ →)` to the formatted key) so the reference doesn't silently drop that detail for the one action where the key chord alone is incomplete.
  - Alternative considered: duplicate a simplified list inline in the Help page. Rejected — would drift from the settings view and double the maintenance surface for something as small as a shortcut row.
  - Alternative considered: make `ShortcutManager` itself double as the reference (just don't show edit controls in a "view mode" prop). Rejected — `ShortcutManager` owns editing state (`editingAction`, `conflicts`, `isApplying`) that a pure reference view doesn't need; a small dedicated component is simpler and cannot accidentally trigger `update_shortcuts` calls.
- **New top-level `/help` route and page** (`src/pages/help/index.tsx`), registered in `src/routes/index.tsx` under `DashboardLayout` next to the other dashboard routes, using the existing `PageLayout` wrapper for visual consistency with other settings pages.
- **New sidebar entry "ヘルプ"** added to the `menu` array in `useMenuItems.tsx` (not `footerItems`), so it behaves like a normal in-app page (internal navigation, active-route highlighting) rather than an external link — `footerItems`/`footerLinks` are reserved for outbound links and the quit action.
- **No change to the existing `/shortcuts` menu label or route**, to avoid an unrelated churn/rename; instead the read-only reference is added as a clearly headed section on that same page so "the list" is visible immediately, above or beside the existing editor, without requiring the user to interact with any row.

## Risks / Trade-offs

- [Two visual representations of "the same shortcut" (compact reference row vs. editable `ShortcutManager` row) could look inconsistent] → Both consume the same `formatShortcutKeyForDisplay` output and the same `actions`/`bindings` data, and the reference component is intentionally simple (name, description, key chord) so it reads as a subset/summary of the editor rather than a divergent design.
- [Adding a new sidebar item increases navigation surface for a fork with only a handful of users] → Scope is deliberately kept to a single-purpose Help page (shortcut reference) rather than a broader help system, minimizing added surface.
- [Custom shortcut actions (`config.customActions`) are currently unused/commented out in the UI (`ShortcutManager`'s "New" button is commented out) but `getAllShortcutActions` already includes them] → The reference view uses the same `getAllShortcutActions()` call, so if custom actions are ever re-enabled, both views pick them up automatically with no extra work.

## Migration Plan

Purely additive: new component, new page, new route, new sidebar entry. No data migration, no backend changes, no feature flag needed — ship behind normal code review since there's no risk to existing shortcut editing/storage behavior.
