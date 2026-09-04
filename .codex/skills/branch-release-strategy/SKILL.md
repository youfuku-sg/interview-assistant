---
name: branch-release-strategy
description: Follow the repository branch and release strategy when starting work, creating branches, preparing releases, choosing versions, updating VERSION/CHANGELOG, always creating v-version release tags, or ensuring incidental repository diffs such as OpenSpec files are committed before release.
license: MIT
metadata:
  author: Interview-Assistant
  version: "1.5"
  sourceDocument: "docs/仕様/ブランチ・リリース戦略.md"
---

Use this skill whenever work touches branch creation, branch naming, release preparation, versioning, changelog work, GitHub Release creation, or release tags.

Details and the latest source of truth live in `docs/仕様/ブランチ・リリース戦略.md`. Read that document when the task depends on current release policy or an unresolved decision.

## Core Rules

- Treat `main` as the recommended stable branch in guidance, while remembering that the current `master` to `main` migration is not finalized.
- Use `develop` as the branch point for `feature/*`. It carries the full AI-tooling file set (`.claude`, `.codex`, `openspec`, `openwiki`, `docs`, `AGENTS.md`, `CLAUDE.md`) and is kept current by `release.yml` merging each release branch back into it after version/CHANGELOG updates. `main` never carries these files.
- Use `integration` as the dev PR merge target and OpenSpec archive location — a fixed branch that is created once from `develop` and then never deleted or recreated per issue. `feature/*` branches from `develop`, not `integration`; `develop` and `integration` are two separate branches with separate jobs.
- Use `feature/<name>` for normal development, branched from `develop` (not `main`, not `integration`). Open its dev PR (base=`integration`) as a draft at the same time the branch is created, then attach the build artifact and mark it ready for review once a build passes.
- Use `release/v<version>` for release preparation.
- There is no emergency/hotfix branch type. Urgent fixes go through the same Issue-driven flow as everything else (open an Issue, work on `feature/<N>`, merge to `integration`, let `release.yml` cut the release) — see [Issue駆動開発フロー](../../../docs/仕様/Issue駆動開発フロー.md).
- Use semantic versions in `MAJOR.MINOR.PATCH` form.
- Always create and push a `v<version>` tag for every release. A release is not complete without the version tag.
- `.github/workflows/release.yml` automates most of the release flow (bump-type judgment via Claude Code CLI, version-file sync, CHANGELOG update, merging the result into `develop`, dev-file strip, merge to `main`, tag, and dispatching `ci.yml`'s build/publish). It is dispatched automatically by `issue-driven-dev.yml`'s `archive-on-merge` job right after a dev PR merges into `integration` and its OpenSpec change is archived there. Prefer letting that automation run; only intervene manually (editing the generated `release/v<version>` branch, or re-dispatching `release.yml` by hand) when something in that pipeline fails.
- **Any push to the stable branch (`main`) triggers CI's build/publish.** Treat every merge into `main` as a release, with no exception for "just docs" or "just an archive/cleanup commit". Never merge a `feature/*` branch straight into `main`; always route it through a `release/v<version>` branch with a version bump, a `CHANGELOG.md` entry, and a pushed `v<version>` tag, even when the change looks purely administrative (OpenSpec archiving, skill updates, verification records). If a `main` push already happened without a matching tag, treat it as a compliance gap to fix immediately: cut `release/v<version>` from the current `main`, bump the version, and tag it before doing anything else.
- Keep one feature focused on one purpose where practical.
- Do not leave incidental diffs or untracked files behind during release work. Commit them before release/tag operations even when they are not part of the main code change.
- After merging `release/*` into the stable branch, delete the release branch.

## Starting Normal Work

Before changing implementation files for ordinary development:

1. Check the current branch with `git branch --show-current`.
2. If already on an appropriate `feature/<name>` branch, continue there.
3. If on `develop`, `integration`, or the stable branch (`main`/`master`), create a focused `feature/<name>` branch from `develop`.
4. If on an unrelated branch, pause and ask the user whether to switch, create a new feature branch, or continue intentionally.

Prefer branch names that describe the work, for example `feature/japanese-ui`, `feature/personal-docs`, or `feature/release-workflow`.

## Incidental Diffs

Before creating a `release/*` branch, merging into the stable branch, creating a release tag, or declaring release work complete:

1. Run `git status --short`.
2. Identify diffs and untracked files that are not part of the primary implementation, such as OpenSpec artifacts, planning docs, release notes, skill files, or verification records.
3. Commit those files unconditionally instead of leaving them unstaged or untracked. Prefer a separate focused commit, for example `Record release verification plan` or `Update release strategy skill`.
4. Include generated/planning files when they explain, validate, or complete the work, especially files under `openspec/`.
5. Do not commit build outputs, secrets, local environment files, or dependency directories that should be ignored. If such files appear, report them and leave them uncommitted.

This repository favors a clean release history over leaving supporting artifacts outside git. Do not pause to ask whether to commit incidental OpenSpec or documentation diffs; commit them.

## Release Preparation

Use `release/v<version>` for release preparation. `release.yml` runs this automatically once a dev PR merges into `integration` (see Core Rules); the steps below are what it does, and what to do manually if you need to intervene:

1. Finish the focused work on `feature/<name>` and merge its dev PR into `integration` (per [Issue駆動開発フロー](../../../docs/仕様/Issue駆動開発フロー.md)). OpenSpec gets archived directly on `integration` right after.
2. Create `release/v<version>` from the current stable branch (`main`), then merge `integration` into it — do not branch `release/*` off of `integration` directly, since another release may have reached `main` first. `integration` is not deleted or reset by this; it keeps accumulating for the next cycle.
3. Determine the version bump (major/minor/patch) from the commit log; update `package.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`, and `CHANGELOG.md` accordingly.
4. Merge the release branch (at this point — version/CHANGELOG updated, dev files still present) into `develop`, so `develop` stays current with the archived OpenSpec change, the version bump, and the CHANGELOG entry for the next `feature/*` to branch from.
5. Strip AI-tooling files (`.claude`, `.codex`, `openspec`, `openwiki`, `AGENTS.md`, `CLAUDE.md`, `docs`) from the release branch before merging to `main` (`.github/workflows/` and `CHANGELOG.md` are exempt). This only affects the `main`-bound copy — `develop` already has the full file set from step 4.
6. Merge the release branch into the stable branch.
7. Create and push the `v<version>` tag for the release. Do this for every release.
8. Dispatch the build/publish workflow (`ci.yml`) explicitly — pushes made with the default `GITHUB_TOKEN` do not trigger other workflow runs.
9. Delete the `release/*` branch after merge.
10. Install and verify the produced artifact, then publish the draft GitHub Release if it looks good. This final verification and publish step is not automated.

Do not report a release as complete until `git tag --list "v<version>"` shows the tag locally and the tag has been pushed to the remote.

Because `integration` is a persistent, reused branch rather than a per-feature one, a release can end up bundling more than one feature if multiple dev PRs land there before `release.yml` runs. That is expected under this design (not a bug to avoid) — `1 release = 1 feature` is no longer a hard rule.

## Unresolved Decisions

Do not decide these items independently. If a task requires one of them, ask the user and record or follow their answer:

- Whether and when to switch the stable branch from `master` to `main`.
- How to handle the existing `master` branch.
- Whether to create a root `VERSION` file.
- Whether GitHub Releases should be draft, prerelease, or public.
- Whether to build Windows first or all three OS targets together.
- Whether to produce Tauri updater JSON.
- Whether unsigned builds are acceptable for the current release.

## Agent Behavior

- Mention this strategy before creating or changing branches.
- Keep branch and release guidance aligned with `docs/仕様/ブランチ・リリース戦略.md`.
- When the document says an item is a recommendation or candidate rather than a final decision, present it that way.
- If the current repository state conflicts with the recommended strategy, explain the conflict and ask before making branch-level changes.
