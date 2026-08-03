## Context

`ThemeProviderContext` (`src/contexts/theme.context.tsx`) owns the persisted `theme` (`"light" | "dark" | "system"`) and `transparency` state, and is the only place that adds/removes the `light`/`dark` class on `document.documentElement`. `Theme.tsx` renders the current theme in a `DropdownMenu`, with one `DropdownMenuItem` per option; clicking an item calls `setTheme(theme)` immediately, which writes `localStorage` and re-runs the `applyTheme` effect. There is currently no intermediate state between "menu closed" and "theme applied and persisted" — every click is a real, saved change.

## Goals / Non-Goals

**Goals:**
- Let the user see the visual effect of `light`/`dark`/`system` before committing, by hovering/focusing an option in the existing dropdown.
- Keep the persisted `theme` and `localStorage` value untouched until the user actually clicks/selects an option (Enter on a focused item).
- Revert to the real, persisted theme when the preview ends without a selection (mouse leaves the item, or the dropdown closes via Escape/outside click).

**Non-Goals:**
- No new color palettes, accent colors, or custom theme editor — the only options remain `light`/`dark`/`system`, as today.
- No preview for the transparency slider (out of scope for this issue; transparency changes already apply live as the slider moves).
- No persistence/schema changes — `STORAGE_KEYS.THEME` and its stored values are unchanged.

## Decisions

- **Preview lives in `ThemeProviderContext`, not local component state.** The class toggle on `document.documentElement` already lives in the context's effect; duplicating that logic in `Theme.tsx` would create two places that can flip the `light`/`dark` class and risk them fighting each other. Instead, add a `previewTheme: Theme | null` piece of state to the context and derive the *effective displayed* theme as `previewTheme ?? theme` inside the existing `applyTheme` effect. This effect's dependency array is currently `[theme]` — it must become `[theme, previewTheme]`, otherwise the effect won't re-run when only `previewTheme` changes and hovering an option will silently do nothing. The `if (theme === "system") { mediaQuery.addEventListener(...) }` guard (and its cleanup counterpart) must use the same `previewTheme ?? theme` value so the OS-preference listener is (de)registered correctly while "system" is being previewed.
- **`previewTheme(theme | null)` setter, not a separate "commit" flag.** Hover-in calls `previewTheme("light" | "dark" | "system")`; hover-out / menu-close calls `previewTheme(null)`, which falls back to the real `theme`. Clicking an item still calls the existing `setTheme(theme)` (which persists) and additionally clears any pending preview (`previewTheme(null)`) so the dropdown closing doesn't cause a flicker back through the old theme before the new persisted one re-applies.
- **Wire preview via `onMouseEnter`/`onFocus`/`onMouseLeave`/`onBlur` on each `DropdownMenuItem`**, not a new custom component — keeps the change localized to `Theme.tsx` and the existing Radix-based `DropdownMenu` primitives already in use.
- **`system` preview resolves via the existing `mediaQuery.matches` check** already computed in the context (no new logic needed) — previewing "system" shows whatever the OS preference currently is, same as selecting it for real.

## Risks / Trade-offs

- [Flicker/jank from rapid hover across options] → Effective theme is derived synchronously in the same effect that already runs on `theme`/`previewTheme` change; no debouncing needed since applying a CSS class swap is cheap and synchronous.
- [Preview state leaking if the dropdown is closed via a code path that doesn't fire `onMouseLeave`/`onBlur` (e.g. programmatic close)] → Also clear `previewTheme` on the `DropdownMenu`'s `onOpenChange(false)` callback, so any close path resets to the real theme.
- [Keyboard users navigating with arrow keys between items] → Radix `DropdownMenuItem` fires `onFocus` when arrow-key navigation moves highlight between items, so keyboard preview works the same way as mouse hover.

## Open Questions

None — scope is limited to the existing light/dark/system dropdown in Settings.
