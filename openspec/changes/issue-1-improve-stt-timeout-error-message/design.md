## Context

`src/hooks/useSystemAudio.ts` races `fetchSTT()` (from `src/lib/functions/stt.function.ts`) against a 30-second timeout and, on failure, calls `setError(sttError.message || "Failed to transcribe audio")` (~line 309-312). `fetchSTT` and the curl-based custom-provider path it wraps throw a small, largely closed set of `Error` messages:

- `"Speech transcription timed out (30s)"` — from the timeout race in `useSystemAudio.ts` itself.
- `` `Network error: ${...}` `` — `fetch`/`tauriFetch` rejected (e.g. local whisper.cpp server not running or unreachable).
- `` `HTTP ${status}: ${errMsg}` `` — non-2xx response from the STT endpoint (e.g. `504` from a slow local server, or a provider-specific error body).
- `"プロバイダーが指定されていません" / "選択されたプロバイダーが指定されていません"` / `"音声ファイルが必要です"` / `"音声ファイルが空です"` — precondition failures, already in Japanese.
- `` `Failed to parse curl: ${...}` `` — malformed provider curl template (a Dev Space configuration bug, not a runtime STT failure).
- Whatever `fetchPluelySTT` or an arbitrary provider's JSON error body produce, when the Pluely path or a custom provider returns `response.error` / free text instead of throwing.

Per the [local-llm-stt-integration](.claude/skills/local-llm-stt-integration/SKILL.md) skill, local whisper.cpp is wired in as a curl-based custom STT provider (no dedicated Rust integration), so from the frontend's perspective a "local STT timeout" is indistinguishable in kind from any other custom-provider timeout — it's just the 30s race firing. Issue #1 specifically calls out the timeout case as confusing; the other technical messages above have the same underlying problem and are addressed by the same mechanism so the fix isn't narrowly special-cased to one string.

`error` is rendered to the user verbatim in `src/pages/app/components/speech/index.tsx` as `` `エラー: ${error}` `` and in the expanded error panel (`text-red-700`).

## Goals / Non-Goals

**Goals:**
- Replace the raw technical error string shown to the user with a short, plain-language Japanese message for the recognizable failure modes above (timeout, network error, HTTP error).
- Give the timeout case a specific, actionable message (transcription is taking too long; check that the local STT server/model is responding, or try a shorter utterance).
- Keep the original technical message available in `console.error` (already logged) for troubleshooting.
- Keep the change presentation-only: no change to retry behavior, timeout duration, or provider request logic.

**Non-Goals:**
- Not building per-provider error message customization (e.g. whisper.cpp-specific vs. cloud-provider-specific copy) — the mapping is by error *shape* (timeout / network / HTTP status), not by which provider produced it, consistent with the provider-agnostic curl abstraction.
- Not adding retry/backoff, a "test connection" button, or STT settings changes — out of scope for this issue.
- Not changing the already-Japanese precondition messages (no provider selected, empty audio, etc.) — they're already clear.

## Decisions

- **Where to map**: do the mapping at the point of display, in the `catch (sttError: any)` block in `useSystemAudio.ts`, not inside `fetchSTT`. `fetchSTT`'s job is to throw a faithful error for callers/logs; translating for end users is a UI concern, and this hook is the only place that currently renders STT errors.
- **How to map**: a small pure function (e.g. `toUserFacingSttErrorMessage(rawMessage: string): string`) that pattern-matches known substrings (`"timed out"`, `"Network error:"`, `/^HTTP \d+:/`) and returns a fixed Japanese message per case, falling back to a generic `"文字起こしに失敗しました。しばらくしてから再度お試しください。"` for anything unrecognized (rather than showing the raw string). This avoids a large taxonomy while still fixing the reported case and the other technical strings sharing the same code path.
- **Timeout-specific copy**: mention that transcription took too long and suggest checking the local STT server/model, since local whisper.cpp is the primary STT path documented for this fork (`docs/仕様/STT利用ガイド.md`, [local-llm-stt-integration](.claude/skills/local-llm-stt-integration/SKILL.md)); cloud providers are opt-in/out of MVP scope per that skill.
- **Logging**: keep `console.error("STT Error:", sttError)` as-is so the raw message/stack is still available for debugging; only the user-visible `setError(...)` value changes.

## Risks / Trade-offs

- [Risk] Pattern-matching on substrings of thrown `Error.message` is brittle if the underlying strings in `stt.function.ts` change wording later. → Mitigation: keep the matcher and the thrown strings colocated conceptually (documented in this design doc); low-severity since a mismatch only degrades to the generic fallback message, not a crash.
- [Risk] A generic fallback message could mask genuinely new/unexpected errors from the user, making them harder to report. → Mitigation: raw message stays in `console.error`; fallback text can be revisited if it proves unhelpful in practice.
- [Risk] Custom-provider users with non-standard error bodies (arbitrary JSON `error` fields) may not match any known pattern and get the generic fallback instead of provider-specific detail. → Mitigation: acceptable per Non-Goals — this issue targets the reported timeout confusion, not full per-provider error parsing.
