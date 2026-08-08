## Purpose

Interview-Assistant ships without any in-app auto-update mechanism; new versions are obtained manually from GitHub Releases per `installer-release-workflow`.

## Requirements

### Requirement: The application SHALL NOT perform automatic update checks or installs
The application SHALL NOT contain any client-side mechanism (UI, background check, or bundled updater plugin) that queries a remote endpoint for new versions, downloads an update, or installs it automatically. Users obtain new builds manually from the project's own GitHub Releases, consistent with `installer-release-workflow`, which SHALL NOT publish an updater manifest.

#### Scenario: App does not query any update endpoint on launch
- **WHEN** the application starts
- **THEN** no network request is made to check for a new version, and no update-related UI is rendered

#### Scenario: No updater plugin is bundled
- **WHEN** inspecting the Tauri configuration and Rust plugin registrations
- **THEN** no updater plugin (e.g. `tauri-plugin-updater`) is configured or registered, and no `updater` endpoint/pubkey is present in `tauri.conf.json`

#### Scenario: Users update by installing a new release manually
- **WHEN** a new version is published as a draft GitHub Release per `installer-release-workflow`
- **THEN** users download and run the new installer themselves; the application provides no in-app path to do this automatically
