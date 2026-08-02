## 1. Shared reference component

- [ ] 1.1 Create `ShortcutReference` component in `src/pages/shortcuts/components/shortcuts/` that takes `actions: ShortcutAction[]` and `bindings: Record<string, ShortcutBinding>` (defaulting to `getAllShortcutActions()` / `getShortcutsConfig()` when not provided) and renders a compact, read-only list (name, description, `formatShortcutKeyForDisplay` key chord) with no toggles or edit buttons.
- [ ] 1.2 Export `ShortcutReference` from `src/pages/shortcuts/components/shortcuts/index.tsx` and `src/pages/shortcuts/components/index.ts`.

## 2. Settings page integration

- [ ] 2.1 Add the read-only `ShortcutReference` section to `src/pages/shortcuts/index.tsx`, clearly headed (e.g. "ショートカット一覧") and visible without any interaction, alongside the existing `CursorSelection` and `ShortcutManager`.

## 3. Help screen

- [ ] 3.1 Create `src/pages/help/index.tsx` using `PageLayout`, rendering `ShortcutReference` as its primary content.
- [ ] 3.2 Export the new Help page from `src/pages/index.ts`.
- [ ] 3.3 Register the `/help` route in `src/routes/index.tsx` under `DashboardLayout`, alongside the other dashboard routes.
- [ ] 3.4 Add a "ヘルプ" entry (icon + `/help` href) to the `menu` array in `src/hooks/useMenuItems.tsx`.

## 4. Verification

- [ ] 4.1 Run `npm run typecheck` and `npm run lint`.
- [ ] 4.2 Manually run the app (`npm run tauri dev`), confirm the sidebar shows "ヘルプ", `/help` renders the shortcut list, `/shortcuts` shows the new read-only section above/alongside the editor, and changing a shortcut key in `ShortcutManager` is reflected after reopening `/help`.
