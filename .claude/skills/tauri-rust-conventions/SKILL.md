---
name: tauri-rust-conventions
description: Repository-specific Rust/Tauri conventions for src-tauri/ — module layout, OS-specific cfg(target_os) patterns, plugin registration, DB migrations, and capabilities. Use when adding or editing Rust code, Tauri commands/plugins, or platform-specific behavior in src-tauri/.
license: MIT
metadata:
  author: Interview-Assistant
  version: "1.0"
---

Use this skill whenever a change touches `src-tauri/src/**/*.rs`, `src-tauri/Cargo.toml`, `src-tauri/capabilities/*.json`, or `src-tauri/tauri.conf.json`.

## Module layout

`src-tauri/src/lib.rs` is the composition root: it declares top-level modules (`mod activate; mod api; mod capture; mod db; mod shortcuts; mod window; mod speaker;`), builds the `tauri::Builder`, registers plugins, and exposes `#[tauri::command]` functions via `tauri::generate_handler!`. Keep new top-level features as their own module rather than growing `lib.rs`.

Feature areas as of this writing:
- `api.rs` — largest file (~1200 lines), backend HTTP/AI-provider request handling.
- `capture.rs` — audio capture state (`CaptureState`) and streaming.
- `speaker/` — per-OS system-audio capture, see pattern below.
- `db/` — SQLite migrations (see "Database migrations").
- `window.rs`, `shortcuts.rs`, `activate.rs` — window/panel management, global shortcuts, app activation.

## OS-specific code (`cfg(target_os = ...)`)

The `speaker/` module is the canonical pattern for OS-specific implementations behind a shared interface:

```rust
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
use macos::{SpeakerInput as PlatformSpeakerInput, SpeakerStream as PlatformSpeakerStream};

#[cfg(target_os = "windows")]
mod windows;
// ... same for linux
```

Followed by a shared function that dispatches per-OS inside itself:

```rust
#[cfg(any(target_os = "macos", target_os = "windows", target_os = "linux"))]
pub(crate) fn list_input_devices() -> Result<Vec<AudioDevice>> {
    #[cfg(target_os = "macos")]
    return macos::get_input_devices();
    #[cfg(target_os = "windows")]
    return windows::get_input_devices();
    #[cfg(target_os = "linux")]
    return linux::get_input_devices();
}
```

When adding a new platform-specific feature, follow this shape: one submodule per OS gated with `#[cfg(target_os = "...")]`, a common public function that branches internally, rather than scattering `cfg` attributes through shared logic. Per `docs/仕様/要求仕様書.md` §8.1, Windows is the MVP's primary target — macOS/Linux support should be kept working where practical but Windows behavior takes priority when they conflict.

## Cargo dependency scoping

`Cargo.toml` uses `[target.'cfg(target_os = "...")'.dependencies]` blocks to scope OS-only crates (e.g. `tauri-nspanel`, `cidre` for macOS; `wasapi` for Windows; `libpulse-binding` for Linux). Add new OS-specific crates to the matching block, not to the shared `[dependencies]` section.

Before adding a dependency, check [pluely-cleanup-checklist](../pluely-cleanup-checklist/SKILL.md) — some existing dependencies (`tauri-plugin-posthog`) are Pluely-era telemetry that §8.4 of the requirements doc wants removed or disabled, not used as a precedent for new telemetry.

## Database migrations

Migrations live in `src-tauri/src/db/migrations/*.sql` and are registered in order in `src-tauri/src/db/main.rs::migrations()` as a `Vec<Migration>` with an incrementing `version`, a short `description`, and `sql: include_str!(...)`. Never edit an already-registered migration's SQL after it has shipped — add a new migration with the next version number instead, since `tauri-plugin-sql` tracks applied versions per database file.

## Capabilities / permissions

`src-tauri/capabilities/*.json` (`default.json` for macOS/main window, `cross-platform.json` for others) declare the Tauri permission allowlist. When a new Tauri command or plugin needs frontend access, add the specific permission identifier (e.g. `sql:allow-execute`, `keychain:allow-get-item`) rather than a wildcard, matching the existing narrow-scoped entries.

## Adding a new Tauri command

1. Implement the function in the relevant module, annotated `#[tauri::command]`.
2. Register it in the `tauri::generate_handler![...]` list in `lib.rs`.
3. If it touches a new capability (filesystem, network host, plugin), add the specific permission to the relevant `capabilities/*.json`.
4. If it's OS-specific, follow the `speaker/` module pattern above rather than inlining `cfg` blocks in command bodies.
