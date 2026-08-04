---
name: local-llm-stt-integration
description: Wire local LLM (Ollama, LM Studio) and local STT (whisper.cpp, faster-whisper) providers into the existing curl-based Dev Space custom-provider settings, rather than building new provider-specific integrations. Use when implementing AI-provider or STT-provider connectivity.
license: MIT
metadata:
  author: Interview-Assistant
  version: "1.0"
  sourceDocument: "docs/仕様/要求仕様書.md"
---

Use this skill when implementing or extending AI-provider or STT-provider connectivity. `docs/仕様/要求仕様書.md` §7.10 (AI プロバイダ設定) is the source of truth; this skill points at the existing implementation that already satisfies most of it.

## Existing mechanism: curl-based custom providers

This repo already has a generic "custom provider" mechanism under the Dev Space settings — do not build provider-specific (Ollama-specific, LM Studio-specific) integrations from scratch. Instead, a custom provider is defined by:

- A raw curl command string (parsed client-side with `@bany/curl-to-json`) — see `src/pages/dev/components/ai-configs/CustomProvider.tsx` and `src/pages/dev/components/stt-configs/CustomProvider.tsx`.
- A `responseContentPath` (dot-path into the JSON response, e.g. `choices[0].message.content` for chat completions, `text` for STT) to extract the answer from an arbitrary OpenAI-compatible response shape.
- A `streaming` flag.

Definitions and hooks: `src/lib/storage/ai-providers.ts`, `src/lib/storage/stt-providers.ts`, `src/hooks/useCustomProvider.ts`, `src/hooks/useCustomSttProviders.ts`, form UI in `src/pages/dev/components/{ai-configs,stt-configs}/CreateEditProvider.tsx`.

## Local LLM pattern (Ollama / LM Studio)

Both expose an OpenAI-compatible `/v1/chat/completions` endpoint locally, so they fit the existing custom-provider curl format directly. The codebase's own placeholder example is exactly this shape:

```
curl --location 'http://127.0.0.1:1337/v1/chat/completions' \
  --header 'Content-Type: application/json' \
  --data '{ "model": "...", "messages": [...] }'
```

response path: `choices[0].message.content`

For Ollama specifically, point at `http://localhost:11434/v1/chat/completions` (Ollama's OpenAI-compat endpoint); for LM Studio, its local server default is `http://localhost:1234/v1/chat/completions`. Model name goes in the JSON body per the target server's loaded model.

## Local STT pattern (whisper.cpp / faster-whisper)

Local whisper servers that expose an OpenAI-compatible `/v1/audio/transcriptions` endpoint (e.g. `whisper.cpp`'s server example, `faster-whisper-server`) fit the existing STT custom-provider form the same way, with response path `text` (matching the existing OpenAI STT placeholder in `CreateEditProvider.tsx`).

## What NOT to do

- Do not add new Rust-side plugins or hardcoded provider branches in `src-tauri/src/api.rs` for Ollama/LM Studio/whisper.cpp specifically — the curl+response-path abstraction is meant to cover arbitrary OpenAI-compatible local servers without new code per provider.
- Do not send interview content to cloud APIs by default; §7.10/§8.4 restrict cloud LLM/STT to being explicitly opt-in and out of MVP scope. If cloud API support is added later, it must be accompanied by a clear "what data is sent" disclosure per §7.10.
- API keys/secrets for any configured provider must go through the existing secure storage path (`tauri-plugin-keychain`), not a plain settings file — see §8.5 and [tauri-rust-conventions](../tauri-rust-conventions/SKILL.md) for the plugin/capability pattern.
