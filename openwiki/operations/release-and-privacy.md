---
type: Operations Runbook
title: Development, Release, and Privacy Runbook
description: Practical commands and cautions for local development, static checks, Tauri packaging, release branches, permissions, telemetry, and sensitive local data.
tags: [operations, release, privacy, tauri, runbook]
---

# Development, Release, and Privacy Runbook

## Local development

Prerequisites are Node.js 18+, stable Rust, npm or yarn, and OS dependencies required by Tauri (for example WebKitGTK on Linux). Typical commands:

```bash
npm install
npm run tauri dev
npm run tauri build
```

Packaged artifacts are emitted under `src-tauri/target/release/bundle/`. Release branch and tag conventions are documented in `docs/仕様/ブランチ・リリース戦略.md`; the current repository is at version `0.5.18` according to `package.json`.

## CI and release checks

`.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, and `npm run lint` on Ubuntu, plus Windows Rust `cargo fmt --check` and `cargo clippy`. Tag publishing first verifies that the tag commit is an ancestor of `origin/main`, then builds a Windows installer as a draft release. The workflow does not publish updater JSON and does not currently build macOS or Linux artifacts. Change this behavior together with `docs/仕様/CI.md` and `docs/仕様/ブランチ・リリース戦略.md`.

## Privacy and operational hazards

Conversation data and settings are intended to remain local, but configured AI/STT calls leave the device. Secure storage is used for secrets where supported; never print keys or inspect `.env` files. `src-tauri/src/lib.rs` still initializes the PostHog plugin with an optional `POSTHOG_API_KEY`, while product docs note upstream telemetry and license-related code that require future cleanup. Treat “local-first” and “no telemetry” as different claims. Also verify the actual implementation before documenting secret handling as fully keychain-backed: `src-tauri/src/api.rs` contains license-related persistence code that deserves an end-to-end security review.

Audio capture needs OS permission and may leave native capture or provider work running if cleanup is broken. When debugging, check permission state, capture status, provider response, and abort behavior in that order. Do not use the untracked `001-sibutomo.mp3` as evidence of product behavior or commit it without an explicit data decision.

The [Testing guidance](../testing/testing-guidance.md) lists checks for capture, provider, persistence, and release changes. [Runtime architecture](../architecture/overview.md) explains why target-OS testing remains necessary, and [Providers and capture](../integrations/providers-and-capture.md) explains the network and permission boundary.