---
name: interview-support-domain
description: Domain knowledge and ethical constraints for implementing interview-support features — question extraction, intent classification, answer-assist generation, overlay display, and post-interview reports. Use when implementing or reviewing logic in this domain, not just UI plumbing.
license: MIT
metadata:
  author: Interview-Assistant
  version: "1.0"
  sourceDocument: "docs/仕様/要求仕様書.md"
---

Use this skill when implementing or reviewing question extraction, question-intent classification, answer-assist generation, the in-interview overlay, or the post-interview report. Full detail lives in `docs/仕様/要求仕様書.md` §7 (機能要求) and §8.6 (倫理と利用方針); this skill summarizes what a change needs to respect and points back to the source for specifics.

## Core domain flow (§7)

Documents/company info (§7.1–7.2) → interview session (§7.3) → transcript segments (§7.4, system audio only in MVP, not the user's own mic) → question extraction (§7.5, heuristic + AI + manual, over-extraction expected and must be user-editable) → intent classification (§7.6, fixed category list: 経歴確認/技術経験/技術深掘り/転職理由/志望動機/強み/弱み/チーム開発/トラブル対応/マネジメント経験/キャリアプラン/条件確認/逆質問/その他) → answer assist (§7.7) → overlay display (§7.8) → post-interview report (§7.9).

## Answer-assist output shape (§7.7)

Answer-assist output is short and structured, not a long paragraph: 質問意図, 回答の方向性, 話すべき要点, 関連する実績または経験, 避けた方がよい表現, and optionally a ~30-second spoken example. Do not default to generating 60+ second answers — the MVP explicitly deprioritizes long-form answers. Never invent career history, achievements, or experience not present in the user's registered documents — the tool must not fabricate a confident-sounding background.

## Overlay constraints (§7.8, §8.3)

The overlay is a small always-on-top panel meant to minimize eye movement during a live interview: latest question, intent, direction, key points, a short quote/summary from a related document, processing state — bullet-first, one short line per item. Avoid: full long-form text dumps, multiple decorative cards, anything requiring scrolling to see the important part, or requiring settings changes mid-interview. Target latency is 5–10s from question-finalized to first answer-assist output (§8.2); if generation is slower, show a processing indicator rather than leaving the overlay blank.

## Ethics and product framing (§8.6) — hard constraint

This is a self-preparation aid, not a cheating tool. When writing UI copy, command names, log messages, or docstrings in this domain, avoid:
- Framing that encourages fabricating experience or achievements.
- Language that centers deceiving the interviewer.
- Marketing the tool as "undetectable" or "usable without being noticed" — see [pluely-cleanup-checklist](../pluely-cleanup-checklist/SKILL.md), this is the same category of residual Pluely stealth-marketing framing that must not be reintroduced in new copy.
- Designs that have the user read a generated answer verbatim without understanding it (e.g. no full-screen teleprompter-style verbatim reading UI as the primary interaction).

If a feature request pushes toward any of the above, flag the tension against §8.6 rather than silently implementing it.

## Data model reference (§10)

`docs/仕様/要求仕様書.md` §10 has draft entities (Document, Company, InterviewSession, TranscriptSegment, InterviewQuestion, AnswerSuggestion) with field lists — check there before inventing new field names for these concepts, and reconcile [tauri-rust-conventions](../tauri-rust-conventions/SKILL.md)'s migration rules when adding tables.
