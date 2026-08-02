## Why

When local STT (whisper.cpp, via a custom Dev Space provider) times out or otherwise fails, `useSystemAudio.ts` surfaces the raw thrown error message (e.g. `Speech transcription timed out (30s)`, `Network error: ...`, `HTTP 504: ...`) directly to the user via `setError` / `エラー: ${error}`. These messages are written for developers, not end users, and give no indication of what happened or what to do next. Issue #1 asks for a clearer, user-facing message specifically for the STT timeout case.

## What Changes

- Add a mapping step between the raw error thrown by `fetchSTT`/the 30s timeout race in `src/hooks/useSystemAudio.ts` and the Japanese message shown to the user, so recognizable technical failures (timeout, network error, HTTP error, no-provider-configured) render as plain-language guidance instead of the raw exception text.
- For the STT timeout case specifically, show a message that explains transcription took too long and suggests a likely cause/next step (e.g. local whisper.cpp server not responding, audio too long, or the local model taking too long to process), rather than `Speech transcription timed out (30s)`.
- Preserve the existing behavior of putting the app into an error state and opening the popover; only the displayed text changes. Raw/technical detail may still be logged via `console.error` for debugging.

## Capabilities

### New Capabilities
- `stt-error-messages`: User-facing error message presentation for STT (speech-to-text) transcription failures, covering timeout, network, HTTP, and configuration error cases surfaced from `useSystemAudio.ts`.

### Modified Capabilities
(none — no existing spec currently covers STT error presentation)

## Impact

- `src/hooks/useSystemAudio.ts`: the `catch (sttError: any)` block around the STT timeout race (~line 309) that currently does `setError(sttError.message || "Failed to transcribe audio")`.
- Possibly a new small helper (e.g. `src/lib/functions/stt-error-messages.function.ts` or similar) that maps known error signatures to user-facing Japanese strings; exact shape is decided in design.md.
- No change to `src/lib/functions/stt.function.ts` error-throwing behavior, `src-tauri` STT commands, or the STT provider configuration UI — this is presentation-only.
