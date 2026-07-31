---
type: Project Guide
title: Interview-Pilot Quickstart
description: Entry point for engineers working on Interview-Pilot, a local-first Tauri desktop application with a React and TypeScript UI, local conversation storage, audio transcription, screenshot capture, and configurable AI providers.
tags: [interview-pilot, quickstart, tauri, react, typescript]
---

# Interview-Pilot Quickstart

Interview-Pilot is a GPL-3.0 desktop application built on Tauri, Rust, React 19, and TypeScript. It is a fork-derived, local-first assistant for interview preparation and conversation support. The current implementation combines a small always-available overlay with a dashboard for chats, prompts, settings, audio, screenshots, responses, shortcuts, and provider configuration.

## Start here

```bash
npm install
npm run tauri dev
```

Prerequisites are Node.js 18+, stable Rust, npm or yarn, and the platform dependencies required by Tauri. Produce an installer with `npm run tauri build`; bundles are emitted under `src-tauri/target/release/bundle/`.

For the runtime boundary and module ownership, read [Architecture overview](architecture/overview.md). For the main user-facing path, read [Audio and transcription workflow](workflows/audio-and-transcription.md). Persistence and settings are described in [Data and settings](domain/data-and-settings.md), while external AI/STT and native capture are covered by [Providers and capture](integrations/providers-and-capture.md). Operational delivery and privacy caveats are in [Release and privacy runbook](operations/release-and-privacy.md), and verification expectations are in [Testing guidance](testing/testing-guidance.md).

## What to change where

| Concern | Start with |
| --- | --- |
| Overlay, dashboard, or route UI | `src/pages/`, `src/layouts/`, `src/routes/index.tsx` |
| Shared React state and global behavior | `src/contexts/`, `src/hooks/`, `src/config/` |
| Chat streaming, transcription, models, prompts | `src-tauri/src/api.rs` and `src/lib/functions/` |
| Window lifecycle, screenshots, shortcuts | `src-tauri/src/window.rs`, `capture.rs`, `shortcuts.rs` |
| System audio and VAD | `src/hooks/useSystemAudio.ts`, `src-tauri/src/speaker/` |
| Conversation and prompt persistence | `src-tauri/src/db/migrations/`, `src-tauri/src/db/`, `src/lib/` |
| Release or CI behavior | `src-tauri/tauri.conf.json`, `.github/workflows/`, `docs/仕様/CI.md` |

The [Source map](source-map.md) expands this table and identifies authoritative documentation. For product intent and policy boundaries, consult `docs/仕様/要求仕様書.md`; for change acceptance, consult the relevant OpenSpec files under `openspec/`.

## Current product boundaries

The repository deliberately stores conversation history and settings locally, but selected AI and STT requests go directly to the configured provider. API keys are intended for secure OS storage where supported. The README and requirements documents also record unresolved upstream-derived PostHog and license-related code; do not describe the product as telemetry-free without checking current implementation.

Recent history shows a focused audio evolution: STT-only mode (`389382a`), accumulated session transcript (`0cd3fac`), and a top-bar transcript summary panel (`8adcd54`). Those changes are the best starting points when modifying transcription state or top-bar presentation.

## Engineering loop

1. Identify the relevant React hook/page and its Tauri command in the [architecture page](architecture/overview.md).
2. Check the corresponding source and any OpenSpec proposal/spec under `openspec/` before changing behavior.
3. Run `npm run typecheck` and `npm run lint`; for Rust changes run `cargo fmt --check` and `cargo clippy` from `src-tauri`.
4. Exercise the affected desktop flow manually, especially OS permissions and window behavior.
5. Read [Release and privacy runbook](operations/release-and-privacy.md) before changing packaging, CI, or provider/security behavior.

## Backlog

- **Provider contract reference** — `src-tauri/src/api.rs` and Dev Space configuration; deferred because request templates and provider-specific parsing are broad and changeable.
- **Full screen-capture workflow** — `src/hooks/useChatCompletion.ts`, `useCompletion.ts`, and `src-tauri/src/capture.rs`; deferred to keep the initial wiki focused on the current audio-led changes.
- **Detailed business requirements** — `docs/仕様/要求仕様書.md`; the initial pages capture product boundaries but not every policy decision.
