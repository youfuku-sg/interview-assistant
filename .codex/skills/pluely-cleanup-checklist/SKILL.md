---
name: pluely-cleanup-checklist
description: Check for and flag residual Pluely-era analytics, license-key, and stealth-marketing content when touching README, SECURITY.md, package.json, Cargo.toml, or any user-facing copy. Use before finishing changes that touch product copy, dependencies, or telemetry-adjacent code.
license: MIT
metadata:
  author: Interview-Assistant
  version: "1.0"
  sourceDocument: "docs/仕様/要求仕様書.md"
---

Use this skill whenever a change touches `README.md`, `SECURITY.md`, `package.json`, `src-tauri/Cargo.toml`, or any other user-facing copy/dependency file, or whenever telemetry/analytics/license behavior is discussed.

This repository is a fork of Pluely (`iamsrikanthnani/pluely`), being repurposed as a personal interview-support tool ("interview-assistant"). `docs/仕様/要求仕様書.md` §13.1 (最優先) requires cleaning up Pluely-origin analytics/license/stealth artifacts, and §8.4/§8.6 forbid unnecessary external telemetry and "undetectable/stealth" marketing framing. Read those sections for full rationale; this skill is the recurring checklist, not the source of truth.

## What to check

Run these before considering a change touching the files above complete:

```sh
grep -rniE "pluely\.com|iamsrikanthnani|srikanthnani|cluely" README.md SECURITY.md package.json src-tauri/Cargo.toml
grep -n "tauri-plugin-posthog" src-tauri/Cargo.toml package.json
grep -rniE "stealth|undetect|without anyone knowing|without detection|invisible.*(recording|screen ?share)" README.md SECURITY.md src/
grep -rniE "license.?key|licensing" src-tauri/src src/ --include="*.rs" --include="*.ts" --include="*.tsx"
```

## Categories of residue

- **Analytics/telemetry dependency**: `tauri-plugin-posthog` (and `tauri-plugin-posthog-api`) in `src-tauri/Cargo.toml` / `package.json`. Per §8.4, unnecessary telemetry/analytics/external transmission must be removed or disabled.
- **Upstream identity/contact leftovers**: `pluely.com`, `iamsrikanthnani`, `srikanthnani.com`, original author email/social links in `README.md`, `SECURITY.md`, `package.json` (`author`, `repository`, `homepage`, `bugs`).
- **License-key / commercial-tier code**: any remaining "Pluely Dev Pro", bounty program, or paid-tier logic that doesn't apply to a personal-use fork.
- **Stealth/evasion marketing copy**: phrasing like "without anyone knowing", "undetectable", "complete stealth", "without detection" in README or in-app strings. §8.6 explicitly avoids framing the app as deceiving interviewers or evading detection; rewrite toward "面接準備と回答補助" framing instead.

## How to use findings

- Treat each grep hit as something to evaluate, not something to blindly delete — some references (e.g. crediting the upstream project, GPL-3.0 attribution) are appropriate to keep per §8.7 (ライセンス).
- File paths and exact strings listed above are examples, not an exhaustive inventory — the codebase changes over time, so always re-run the greps rather than trusting a fixed list.
- This checklist is reused by [rebrand-readme-security-ja](../../../openspec/changes/rebrand-readme-security-ja/) and [update-dependencies-minor-patch](../../../openspec/changes/update-dependencies-minor-patch/); coordinate with those changes rather than duplicating the cleanup.
