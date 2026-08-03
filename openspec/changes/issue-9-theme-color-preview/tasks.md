## 1. Theme context preview state

- [ ] 1.1 Add `previewTheme: Theme | null` state and a `previewTheme(theme: Theme | null): void` setter to `ThemeProviderContext` in `src/contexts/theme.context.tsx`.
- [ ] 1.2 Update the `applyTheme`/`updateTheme` effect to derive the effective displayed theme as `previewTheme ?? theme` instead of `theme` alone, so a preview overrides the persisted theme without changing it.
- [ ] 1.3 Clear `previewTheme` (set to `null`) inside `setTheme` when a real selection commits, so the dropdown closing doesn't flicker through a stale preview.
- [ ] 1.4 Expose `previewTheme` state and setter through the context value and `useTheme()` return type.

## 2. Dropdown preview wiring

- [ ] 2.1 In `src/pages/settings/components/Theme.tsx`, add `onMouseEnter`/`onFocus` handlers to each theme `DropdownMenuItem` that call `previewTheme(optionValue)`.
- [ ] 2.2 Add `onMouseLeave`/`onBlur` handlers to each item that call `previewTheme(null)`.
- [ ] 2.3 Add an `onOpenChange` handler on the `DropdownMenu` that calls `previewTheme(null)` when the menu closes (covers Escape/outside-click paths that don't fire item blur).

## 3. Verification

- [ ] 3.1 Manually run the app (`npm run tauri dev`), open Settings > テーマのカスタマイズ, and confirm hovering/focusing ライト/ダーク/システム previews the appearance change and reverts when hover/focus leaves without a click.
- [ ] 3.2 Confirm clicking an option still persists it (reload the app / check `localStorage` for the theme key) exactly as before this change.
- [ ] 3.3 Run `npm run typecheck` and `npm run lint`.
