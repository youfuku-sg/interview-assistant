---
type: Source Map
title: Interview-Pilot Source Map
description: Navigation map from major product concerns to the repository files, specifications, and operational documents that define them.
tags: [source-map, navigation, repository]
---

# Source Map

Use this map to choose the smallest authoritative slice before editing. Generated wiki pages summarize behavior; source and OpenSpec remain authoritative for implementation and acceptance details.

| Area | Primary source anchors | Related concept |
| --- | --- | --- |
| Application entry and routes | `src/main.tsx`, `src/routes/index.tsx`, `src/pages/index.ts` | [Runtime architecture](architecture/overview.md) |
| Overlay and dashboard layout | `src/pages/app/`, `src/layouts/`, `src/pages/dashboard/` | [Runtime architecture](architecture/overview.md) |
| Shared state and provider UX | `src/contexts/`, `src/hooks/`, `src/config/`, `src/pages/settings/`, `src/pages/dev/` | [Providers and capture](integrations/providers-and-capture.md) |
| AI, STT, and prompt API | `src-tauri/src/api.rs`, `src/lib/functions/`, `src/pages/system-prompts/` | [Providers and capture](integrations/providers-and-capture.md) |
| Audio, VAD, and transcript panel | `src/hooks/useSystemAudio.ts`, `src-tauri/src/speaker/`, `src/pages/app/components/speech/`, `TranscriptionPanel.tsx`, `SummaryPanel.tsx` | [Audio workflow](workflows/audio-and-transcription.md) |
| Screenshots and windows | `src-tauri/src/capture.rs`, `src-tauri/src/window.rs`, `src/pages/screenshot/` | [Runtime architecture](architecture/overview.md) |
| Global shortcuts | `src-tauri/src/shortcuts.rs`, `src/hooks/useGlobalShortcuts.ts`, `src/pages/shortcuts/` | [Runtime architecture](architecture/overview.md) |
| Durable data | `src-tauri/src/db/migrations/`, `src-tauri/src/db/`, `src/lib/` | [Data and settings](domain/data-and-settings.md) |
| Native bootstrap | `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/` | [Runtime architecture](architecture/overview.md) |
| Quality and delivery | `package.json`, `eslint.config.js`, `.github/workflows/`, `docs/仕様/CI.md`, `docs/仕様/ブランチ・リリース戦略.md` | [Testing guidance](testing/testing-guidance.md) and [Runbook](operations/release-and-privacy.md) |
| Behavioral history | `openspec/specs/`, `openspec/changes/`, `CHANGELOG.md` | [Audio workflow](workflows/audio-and-transcription.md) |

## History anchors

The recent transcript feature sequence is visible in git as `389382a` (STT-only), `0cd3fac` (session accumulation), and `8adcd54` (summary panel). Before changing those surfaces, compare current code with the active proposal at `openspec/changes/top-bar-transcript-summary-panel/` and the synchronized specs.

The working tree also contains uncommitted documentation/automation changes and an untracked audio file at initialization. Those are not treated as application behavior by this map.

This map points to the [quickstart](quickstart.md), which routes engineers through the [architecture](architecture/overview.md), [workflows](workflows/audio-and-transcription.md), [data model](domain/data-and-settings.md), [integrations](integrations/providers-and-capture.md), [operations](operations/release-and-privacy.md), and [testing](testing/testing-guidance.md) concepts.
