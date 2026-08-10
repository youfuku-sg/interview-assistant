---
name: codex-implement
description: Delegate OpenSpec change implementation to the Codex CLI instead of editing code directly. Use during the Issue駆動開発フロー dev phase (docs/仕様/Issue駆動開発フロー.md §5.1), where Codex is the designated primary implementer.
license: MIT
---

Implement an OpenSpec change's tasks by delegating the actual code editing to Codex, not by editing files yourself.

**Steps**

1. Identify the OpenSpec change under `openspec/changes/issue-<N>-*/` (there should be exactly one on this branch). Read `tasks.md` to see the pending work.

2. Build a single prompt for Codex that includes:
   - The change name and a pointer to `openspec/changes/<name>/` (`proposal.md`, `design.md`, `tasks.md`, `specs/*/spec.md`)
   - An instruction to implement every pending (`- [ ]`) task, keeping changes minimal and scoped to what each task describes
   - An instruction to mark each task's checkbox (`- [ ]` → `- [x]`) in `tasks.md` as it is completed
   - An instruction to run `npm run typecheck` and `npm run lint`, and (if Rust under `src-tauri/` was touched) `cargo fmt --check` and `cargo clippy` from `src-tauri/`, fixing anything flagged
   - An instruction not to commit or push — this workflow handles that afterward

3. Run Codex non-interactively with write access to the workspace:
   ```
   codex exec -s workspace-write < <promptfile>
   ```

4. After Codex finishes, review the resulting diff yourself (`git diff`, `git status`). Confirm it matches the tasks described and doesn't contain anything obviously wrong. If you find a small, clear-cut issue, fix it directly rather than re-invoking Codex. If the diff is empty or clearly incomplete, note that in your status output rather than treating the run as successful.

5. Leave the changes uncommitted — committing and pushing is the calling workflow's responsibility, not this skill's.

**Guardrails**
- Do not implement the tasks yourself before trying Codex — Codex is the primary implementer here, you are the reviewer/coordinator.
- Do not push. This skill only produces a working tree diff.
- If Codex fails to run at all (crash, auth error), report that clearly rather than silently falling back to implementing everything yourself.
