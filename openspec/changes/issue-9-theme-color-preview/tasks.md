## 1. Theme context preview state

- [ ] 1.1 Add internal `previewedTheme: Theme | null` state to `ThemeProviderContext` in `src/contexts/theme.context.tsx`, with a `setPreviewedTheme` state setter.
- [ ] 1.2 Update the `applyTheme`/`updateTheme` effect to derive the effective displayed theme as `previewedTheme ?? theme` instead of `theme` alone, so a preview overrides the persisted theme without changing it. This includes changing the effect's dependency array from `[theme]` to `[theme, previewedTheme]` (otherwise the effect won't re-run on hover) and applying `previewedTheme ?? theme` to the `mediaQuery` "system" change-listener guard/cleanup as well as `applyTheme`/`updateTheme` themselves.
- [ ] 1.3 Clear `previewedTheme` (set it to `null`) inside `setTheme` when a real selection commits, so the dropdown closing doesn't flicker through a stale preview.
- [ ] 1.4 Expose a `previewTheme(theme: Theme | null): void` action through the context value and `useTheme()` return type, implemented by `setPreviewedTheme`. Keep `previewedTheme` internal because consumers do not need to read transient preview state.

## 2. Dropdown preview wiring

- [ ] 2.1 In `src/pages/settings/components/Theme.tsx`, add `onMouseEnter`/`onFocus` handlers to each theme `DropdownMenuItem` that call `previewTheme(optionValue)`.
- [ ] 2.2 Add `onMouseLeave`/`onBlur` handlers to each item that call `previewTheme(null)`.
- [ ] 2.3 Add an `onOpenChange` handler on the `DropdownMenu` that calls `previewTheme(null)` when the menu closes (covers Escape/outside-click paths that don't fire item blur).

## 3. Verification

- [ ] 3.1 Manually run the app (`npm run tauri dev`), open Settings > テーマのカスタマイズ, and confirm hovering/focusing ライト/ダーク/システム previews the appearance change and reverts when hover/focus leaves without a click.
- [ ] 3.2 Confirm clicking an option still persists it (reload the app / check `localStorage` for the theme key) exactly as before this change.
- [ ] 3.3 Run `npm run typecheck` and `npm run lint`.
