## Why

Issue #10 (`ログイン履歴を設定画面から確認できるようにしたい`) requests being able to check "app launch / login history" from the bottom of the Settings screen, with roughly the last 10 entries being enough. This is a personal-use app for interview preparation, and the user wants a simple, at-a-glance record of when they actually opened and used the app (e.g. to recall how many practice sessions they've done recently), without needing to dig through OS logs.

Per `openspec/specs/personal-fork-ux/spec.md`, this fork has no license activation or authentication flow (`hasActiveLicense` is always `false`). There is no concept of "logging in" distinct from starting the app. The issue's wording ("起動・ログイン履歴") is therefore interpreted as a single concept: **app launch history** — a local, timestamped record of each time the app process starts.

## What Changes

- Add a new `app_launches` SQLite table (new migration) that records one row per app process start, with a timestamp.
- Record a launch entry once during Tauri backend startup (in `src-tauri/src/lib.rs` `setup`), independent of window show/hide or dashboard open/close events.
- Add a new Tauri command to fetch the most recent launch history rows (default/most recent 10, newest first).
- Add a new read-only "起動履歴" (Launch History) section at the bottom of the Settings page (`src/pages/settings/index.tsx`) listing the most recent 10 launch timestamps (formatted for local display), fetched via the new command.
- No deletion/editing UI is in scope; this is a read-only history list (existing `DeleteChats` pattern is for chat history only and is not extended to cover this new table).

## Capabilities

### New Capabilities
- `app-launch-history`: Recording each app process start to local SQLite storage and displaying the most recent entries (default 10) in a read-only list at the bottom of the Settings page.

### Modified Capabilities
(none — no existing capability's requirements change; this only adds a new table, command, and Settings section)

## Impact

- **Backend**: new migration file under `src-tauri/src/db/migrations/`, registered in `src-tauri/src/db/main.rs`; new Tauri command (e.g. in `src-tauri/src/api.rs` or a new small module) registered in `src-tauri/src/lib.rs`'s `invoke_handler`.
- **Frontend**: new Settings section component under `src/pages/settings/components/`, wired into `src/pages/settings/index.tsx`.
- **Data**: adds a new local-only table; no data leaves the device and no existing table schema changes.
- **No changes** to license/activation code, provider settings, or existing chat/system-prompt tables.
