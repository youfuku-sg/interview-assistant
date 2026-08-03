## ADDED Requirements

### Requirement: Theme option preview before selection
The Settings > テーマのカスタマイズ theme dropdown SHALL let the user preview the visual effect of a `light`, `dark`, or `system` theme option before it is applied and persisted.

#### Scenario: Hovering an option previews it without persisting
- **WHEN** the user hovers or keyboard-focuses a theme option in the dropdown that differs from the currently selected theme
- **THEN** the application's appearance (the `light`/`dark` class on the document root) SHALL switch to reflect the hovered/focused option
- **AND** the persisted theme value in storage SHALL remain unchanged

#### Scenario: Ending preview without selecting reverts to the real theme
- **WHEN** the user stops hovering/focusing a previewed option without clicking or pressing Enter on it (e.g. moves the pointer away, or closes the dropdown via Escape or an outside click)
- **THEN** the application's appearance SHALL revert to the previously persisted theme

#### Scenario: Selecting an option commits it as before
- **WHEN** the user clicks a theme option, or presses Enter while it is focused
- **THEN** that theme SHALL be persisted to storage and applied, exactly as it is applied today when no preview is active
- **AND** any pending preview SHALL be cleared so the dropdown closing does not flicker back through a stale previewed theme

#### Scenario: Previewing "system" reflects the current OS preference
- **WHEN** the user hovers/focuses the "システム" option
- **THEN** the previewed appearance SHALL match whatever the OS dark/light preference currently resolves to, consistent with selecting "システム" for real
