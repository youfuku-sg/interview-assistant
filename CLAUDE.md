# CLAUDE.md

Interview-Pilot is a personal-use fork of [Pluely](https://github.com/iamsrikanthnani/pluely), being repurposed into a local-first interview-preparation and answer-assist desktop app. GPL-3.0 licensed (inherited from Pluely); no third-party redistribution is planned — see `docs/仕様/要求仕様書.md` §8.7.

## Tech stack

- Frontend: React 19 + TypeScript, built with Vite (`npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`).
- Backend: Tauri v2 (Rust), source under `src-tauri/`.
- Storage: SQLite via `tauri-plugin-sql`, migrations in `src-tauri/src/db/`.
- Package/binary name, `productName`, and `identifier` are `interview-pilot` / `Interview-Pilot` / `com.interview-pilot.app` (renamed from Pluely's `pluely` / `Pluely` / `com.srikanthnani.pluely`) — see [rebrand-product-identity](openspec/changes/rebrand-product-identity/).

## Directory structure

- `src/` — React frontend (pages, components, hooks, `src/pages/dev/` = Dev Space settings including AI/STT custom provider config).
- `src-tauri/` — Rust/Tauri backend. See [tauri-rust-conventions](.claude/skills/tauri-rust-conventions/SKILL.md) skill for module layout, OS-specific `cfg` patterns, and migrations.
- `docs/仕様/` — the authoritative Japanese spec documents for this project. Key files:
  - `要求仕様書.md` — requirements spec (functional/non-functional requirements, data model, ethics/license policy). Primary source of truth for product behavior.
  - `ブランチ・リリース戦略.md` — branch/release/versioning policy (see [branch-release-strategy](.claude/skills/branch-release-strategy/SKILL.md) skill).
  - `面接支援アプリ.md`, `Pluely機能把握メモ.md`, `初期マイルストーン.md`, `TODO.md`, `CI.md`, `GitHub Actions リリース手順.md` — supporting design notes, migration tracking, CI/release runbooks.
  - Read the relevant file directly for details rather than expecting this file to duplicate its content.
- `openspec/` — spec-driven change workflow. `openspec/changes/<name>/` holds in-progress change proposals (`proposal.md`, `design.md`, `tasks.md`, `specs/`); `openspec/changes/archive/` holds completed ones; `openspec/specs/` holds the current merged capability specs. Invoke via `/opsx:propose`, `/opsx:apply`, `/opsx:sync`, `/opsx:archive`, `/opsx:explore`.

## Agent skills

Skills live in both `.claude/skills/<name>/` (Claude Code) and `.codex/skills/<name>/` (Codex CLI), mirrored with identical content per skill. **When adding or updating a skill, update both directories in the same change** — do not let them drift. Project-specific skills relevant here: [pluely-cleanup-checklist](.claude/skills/pluely-cleanup-checklist/SKILL.md), [tauri-rust-conventions](.claude/skills/tauri-rust-conventions/SKILL.md), [interview-support-domain](.claude/skills/interview-support-domain/SKILL.md), [local-llm-stt-integration](.claude/skills/local-llm-stt-integration/SKILL.md).

## Claude Code configuration

- `.claude/settings.json` (git-tracked) holds permission rules safe to share across the team/repo — read-only or narrowly-scoped commands (`git status`, `openspec status *`, `npm run *`, etc.).
- `.claude/settings.local.json` (gitignored, personal) holds broad or environment-specific permissions (e.g. `Bash(*)`). Do not move broad allowances into `settings.json`.

<!-- OPENWIKI:START -->

## OpenWiki

This repository uses OpenWiki for recurring code documentation. Start with `openwiki/quickstart.md`, then follow its links to architecture, workflows, domain concepts, operations, integrations, testing guidance, and source maps.

The scheduled OpenWiki GitHub Actions workflow refreshes the repository wiki. Do not hand-edit generated OpenWiki pages unless explicitly asked; prefer updating source code/docs and letting OpenWiki regenerate.

<!-- OPENWIKI:END -->
