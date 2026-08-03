## Context

The app already persists local data via `tauri-plugin-sql` (`sqlite:pluely.db`), with migrations registered in `src-tauri/src/db/main.rs` and applied at startup through the plugin builder in `src-tauri/src/lib.rs`. There is no existing table or command for tracking app starts. There is also no login/auth concept in this fork (`openspec/specs/personal-fork-ux/spec.md` confirms `hasActiveLicense` is always `false` and no activation flow exists), so "ログイン履歴" in Issue #10 is treated as a synonym for "app launch history."

The Settings page (`src/pages/settings/index.tsx`) is a flat list of section components (`Theme`, `AutostartToggle`, `AppIconToggle`, `AlwaysOnTopToggle`) rendered inside `PageLayout`. Existing sections follow a simple pattern: a small component in `src/pages/settings/components/`, exported via `index.ts`, rendered at the page level.

## Goals / Non-Goals

**Goals:**
- Record a timestamp every time the Tauri backend process starts (app launch), independent of dashboard/overlay window show/hide.
- Persist these timestamps locally in SQLite so history survives across restarts.
- Expose the most recent entries (default/most recent 10) to the frontend via a Tauri command.
- Show this history as a new read-only section at the bottom of the Settings page.

**Non-Goals:**
- No authentication/login system is being introduced; this only tracks process starts.
- No UI to delete/clear individual launch entries (out of scope for this issue; existing `DeleteChats` pattern is not extended to this table).
- No unbounded retention guarantees beyond "recent history" — see Decisions for capping behavior.
- No telemetry/analytics reporting of this data to any external service; it stays in local SQLite only, consistent with the rest of the app's local-first model.

## Decisions

- **New table `app_launches(id INTEGER PRIMARY KEY AUTOINCREMENT, launched_at INTEGER NOT NULL DEFAULT (unixepoch()))`.** A dedicated table (rather than reusing `conversations`/`messages` or a generic key-value settings store) keeps this concern isolated and matches the existing per-concept migration pattern (`chat-history.sql`, `system-prompts.sql`). An integer Unix timestamp also matches the existing chat-history timestamp columns and avoids treating SQLite's UTC `datetime('now')` text (`YYYY-MM-DD HH:MM:SS`, without a timezone marker) as local time when the frontend formats it.
- **Record the launch inside `run()`'s `.setup()` closure in `src-tauri/src/lib.rs`**, once per process start. This fires exactly once per app launch regardless of how many windows (overlay/dashboard) are created afterward — recording on window creation would risk double-counting since `setup` already pre-creates the dashboard window.
  - **Correction (found during this review round):** the previous round's plan to open a second, independently-managed `sqlx::SqlitePool` against `app.path().app_config_dir()?.join("pluely.db")` is unnecessary and must not be done. `tauri-plugin-sql` is pinned at `2.3.0` in `Cargo.lock`, and at that exact version (verified against the `sql-v2.3.0` tag of `tauri-apps/plugins-workspace`) the plugin publicly exposes the pool it already opens and migrates: it `.manage()`s `pub struct DbInstances(pub tokio::sync::RwLock<HashMap<String, DbPool>>)`, and `pub enum DbPool { Sqlite(sqlx::SqlitePool), .. }` is re-exported at the crate root (`pub use wrapper::DbPool;`). Because `src-tauri/tauri.conf.json`'s `plugins.sql.preload: ["sqlite:pluely.db"]` causes the plugin to open and migrate that exact pool during the plugin's own `.plugin(tauri_plugin_sql::Builder::default()...)` registration (already ordered in `lib.rs` before the app's own `.setup()` closure runs), the already-open, already-migrated pool for key `"sqlite:pluely.db"` is directly reachable from inside `.setup()` via `app.state::<tauri_plugin_sql::DbInstances>()` — no second connection, and no need to re-derive the db file path (`app_config_dir()` vs `app_data_dir()`) in application code at all, since the plugin already resolved it once.
  - **Concrete approach:** inside `.setup()`, spawn an async task with `tauri::async_runtime::spawn` (the map is behind a `tokio::sync::RwLock`, so reading it requires an async context, not the sync closure body itself); within that task, fetch `app.state::<tauri_plugin_sql::DbInstances>()`, `.0.read().await`, look up key `"sqlite:pluely.db"`, and match `DbPool::Sqlite(pool) => ..` to obtain the live `&sqlx::SqlitePool`; then run `sqlx::query("INSERT INTO app_launches DEFAULT VALUES").execute(pool).await`. `sqlx` still needs to move from a transitive to a **direct** `Cargo.toml` dependency (matching the already-resolved `0.8.6` line in `Cargo.lock`; only the `sqlite` feature is needed, not a runtime/connection feature) purely so app code can call `sqlx::query(..)` against the borrowed pool — it opens nothing itself.
- **New Tauri command `get_app_launch_history(limit: Option<i64>) -> Vec<AppLaunchEntry>`**, defaulting to 10 when `limit` is omitted, returning entries ordered newest-first. Added alongside existing simple commands (e.g. near `get_app_version` in `lib.rs`, or in a small new `src-tauri/src/app_launch.rs` module if `lib.rs` is judged too cluttered by the time of implementation) rather than piggy-backing on `api.rs`, since `api.rs` is reserved for chat/STT/provider concerns per the OpenWiki "where to change things" table. This command looks up the same borrowed `&sqlx::SqlitePool` from `app.state::<tauri_plugin_sql::DbInstances>()` on each invocation (via the `AppHandle`/`State` argument Tauri injects into commands) the same way as the startup insert, rather than holding or opening any pool of its own.
- **No pruning job in this change.** Given "last 10" is the only stated need and this is a personal, low-volume app (at most a few launches per day), unbounded row growth in `app_launches` is not a practical concern within this issue's scope. If retention becomes a concern later, a follow-up change can add capped retention or pruning.
- **Frontend fetches on Settings page mount** via a new small component (e.g. `LaunchHistory.tsx`) that calls the new command directly through `@tauri-apps/api` `invoke`, following the existing pattern of settings components owning their own data fetching (no new shared hook needed for a single read-only list).

## Risks / Trade-offs

- [Ambiguous issue wording ("起動・ログイン履歴") could later be read as wanting two separate concepts] → Mitigated by grounding the interpretation in `personal-fork-ux` spec (no auth exists) and stating the single-concept interpretation explicitly in the proposal; if the issue author intended something else, follow-up on the issue can adjust scope before/at review (step 4.5 of the Issue-driven flow).
- [Recording every launch forever grows the table indefinitely] → Accepted as low-risk for personal use at this scale; explicitly called out as a Non-Goal/limitation rather than silently addressed.
- [Migration ordering] → New migration must use `version: 3` (after existing 1 and 2) in `src-tauri/src/db/main.rs`, appended, never renumbering existing migrations.
- [No prior art in this codebase for running SQL from Rust against `pluely.db`; all existing access is frontend-only via `@tauri-apps/plugin-sql`] → This change introduces that pattern for the first time, but by reusing the plugin's own already-open, already-migrated pool (`app.state::<tauri_plugin_sql::DbInstances>()` → `DbPool::Sqlite(pool)`) rather than opening a second, independently-managed connection to the same file. This removes the earlier draft's risk of the two connections' resolved db-file paths diverging, since there is only ever one pool for `pluely.db`.

## Migration Plan

1. Add `src-tauri/src/db/migrations/app-launches.sql` creating the `app_launches` table.
2. Register it as migration `version: 3` in `src-tauri/src/db/main.rs`.
3. Insert a row on startup in `lib.rs` `setup()`.
4. Add the Tauri command and register it in `invoke_handler!`.
5. Add the Settings UI section and wire it in.

No rollback beyond standard migration semantics is needed since this only adds a new table (no existing schema is touched).

## Open Questions

- Exact display format for timestamps in the Settings list (relative "◯分前" vs. absolute local datetime) — left to implementation to match existing date formatting conventions used elsewhere in the app (e.g. chat list timestamps), if any exist.
