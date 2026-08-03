## Why

Issue #9: in Settings, switching the theme (`ライト`/`ダーク`/`システム`) via the dropdown in `src/pages/settings/components/Theme.tsx` applies the change immediately on click (`setTheme` writes to `localStorage` and flips the `light`/`dark` class on `<html>` right away). There is no way to see what a theme looks like before committing to it, so the user has to click through options one at a time and observe the whole app repaint to compare them. A lightweight preview (e.g. on hover/focus of a menu item) would let the user see the effect before confirming.

## What Changes

- Add a preview interaction to the theme dropdown in `Theme.tsx`: hovering/focusing a theme option (`light`/`dark`/`system`) temporarily previews that appearance without persisting it or firing `setTheme`.
- Add preview state/handlers to `ThemeProviderContext` (`src/contexts/theme.context.tsx`): a `previewTheme(theme: Theme | null)` action that applies the `light`/`dark` class transiently, and reverts to the actual persisted `theme` when preview ends (mouse leave / blur / menu close) or when a real selection commits.
- Actual selection (click/Enter) still calls the existing `setTheme`, persisting to `localStorage` as today — no change to persisted behavior.
- No new color palettes/themes are introduced; this only adds a preview step to the existing light/dark/system choice already in the UI.

## Capabilities

### New Capabilities
- `settings-theme-preview`: previewing a theme option's appearance in the Settings > テーマのカスタマイズ dropdown before committing to it.

### Modified Capabilities
(none — no existing spec covers theme selection behavior yet)

## Impact

- `src/contexts/theme.context.tsx` — add transient preview state/handlers alongside the existing persisted `theme` state.
- `src/pages/settings/components/Theme.tsx` — wire hover/focus preview handlers onto the theme `DropdownMenuItem`s.
- No backend/Tauri, database, or provider changes. No new dependencies.
