## 1. Error message mapping

- [ ] 1.1 Add a pure `toUserFacingSttErrorMessage(rawMessage: string): string` helper (e.g. in `src/lib/functions/stt-error-messages.function.ts`) that maps known raw STT error strings to plain-language Japanese messages:
  - `"timed out"` substring → timeout-specific message (mentions transcription is taking too long; suggests checking the local STT server/model).
  - `"Network error:"` prefix → connection-failure message.
  - `/^HTTP \d+:/` prefix → provider error-response message.
  - anything else → generic fallback (`"文字起こしに失敗しました。しばらくしてから再度お試しください。"`).
- [ ] 1.2 Add unit coverage for the helper: one case per pattern above plus the fallback case.

## 2. Wire into useSystemAudio

- [ ] 2.1 In `src/hooks/useSystemAudio.ts`, in the `catch (sttError: any)` block around the STT timeout race (~line 309-312), call `setError(toUserFacingSttErrorMessage(sttError.message || ""))` instead of `setError(sttError.message || "Failed to transcribe audio")`.
- [ ] 2.2 Keep the existing `console.error("STT Error:", sttError)` call so the raw message/stack is still logged.

## 3. Verification

- [ ] 3.1 Run `npm run typecheck` and `npm run lint`.
- [ ] 3.2 Manually trigger a local STT timeout (or a stubbed 30s delay) and confirm the error panel in `src/pages/app/components/speech/index.tsx` shows the new plain-language message instead of `Speech transcription timed out (30s)`.
- [ ] 3.3 Confirm the raw error message is still visible in the browser/devtools console for the same failure.
