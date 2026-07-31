---
type: Testing Guide
title: Testing and Change Guidance
description: Provides the repository's available static checks and a change-oriented verification matrix for frontend, Rust commands, audio capture, persistence, providers, and releases.
tags: [testing, ci, lint, typecheck, rust]
---

# Testing and Change Guidance

There is no dedicated unit-test suite visible in the current source inventory. Confidence comes primarily from TypeScript compilation, ESLint, Rust formatting and Clippy, targeted manual desktop checks, and OpenSpec acceptance records for recent product changes.

## Required static checks

```bash
npm run typecheck
npm run lint
cd src-tauri
cargo fmt --check
cargo clippy
```

CI runs frontend checks on Ubuntu and Rust checks on Windows because the backend contains Windows-specific code. Clippy warnings are reported but are not configured as failures; typecheck, lint errors, and formatting failures fail their jobs. Packaging should be checked separately with `npm run tauri build` when release or Tauri configuration changes.

## Change matrix

| Area changed | Minimum verification |
| --- | --- |
| React routes, components, hooks | `npm run typecheck`, `npm run lint`, then exercise the affected route or overlay manually |
| Tauri command signature or registration | Frontend checks, `cargo fmt --check`, `cargo clippy`, and an end-to-end desktop invocation |
| Audio, VAD, permissions, or native capture | Rust checks plus permission denial/recovery, device selection, start/stop, continuous mode, and unmount cleanup on target OS |
| SQLite migrations or save logic | Rust checks plus create/update/delete conversation and attachment regression checks |
| Provider templates or streaming | TypeScript checks plus representative configured provider, error, abort, and non-streaming cases |
| Release config or workflows | Static checks plus `npm run tauri build` on the intended target and review of `docs/仕様/CI.md` |

## Behavioral evidence

The latest transcript work is specified in `openspec/specs/stt-session-transcript/spec.md` and `openspec/specs/top-bar-transcription-panel/spec.md`, with active design/tasks under `openspec/changes/top-bar-transcript-summary-panel/`. Use those specs as acceptance criteria when changing accumulated transcript, summary, or top-bar behavior; do not rely only on screenshots or component names.

The [Audio and transcription workflow](../workflows/audio-and-transcription.md) depends on the command composition in [Runtime architecture](../architecture/overview.md), while persistence changes belong with [Local data and settings](../domain/data-and-settings.md). [Development, release, and privacy](../operations/release-and-privacy.md) records the delivery limitations: current CI does not cover hardware permissions, screen capture, migrations, provider contracts, packaged installation, or end-to-end UI behavior.