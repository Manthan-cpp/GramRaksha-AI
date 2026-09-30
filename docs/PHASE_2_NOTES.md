# Phase 2 — Backend + Live Evidence Engine

Date: 2026-09-30

## Built

- Added the contract-first evidence schemas, deterministic KrishiSahay and MediShield query planner, SerpApi provider, recorded provider, cache, usage meter, normalizer, trust classifier, grounded-quote validator, safety linter, and SSE pipeline.
- Added `POST /api/evidence/run` with bounded request bodies, server-only SerpApi access, streaming events, safe public errors, and live/recorded mode selection.
- Wired the existing Evidence Trail and Judge Panel to real stream events and counters without redesigning the Phase 1 UI.
- Added real captured Recorded-mode evidence for the Rice / Nadia / Flowering hero scenario under `fixtures/recorded/krishi-nadia.json`.
- Added focused tests for planning, classification, validation, safety, budgets, and pipeline behavior.

## Verification

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed: 6 test files, 13 tests.
- `npm run build` — passed; `/api/evidence/run` is present in the production route output.
- Live smoke — passed: the hero request streamed planning, searching, reading, kept/dropped, synthesizing, and done events. The final run planned four searches, kept ten sources, used two cache hits, and completed one fresh live search. Google News timed out and was reported as a non-fatal warning.
- Recorded smoke — passed: the same hero request completed with `mode: "recorded"`, `liveSearches: 0`, and the real captured Search/Maps responses. The missing News capture remains explicitly warned rather than fabricated.

## Decisions

- SerpApi is the only live evidence provider in this phase. No unrelated search or scraping service was added.
- Claims are selected from kept snippets and must pass the evidence-ID and quote validator. No LLM is used in Phase 2.
- Maps searches use the user's district in the search text and the state as the Maps location anchor because district strings are not consistently accepted by SerpApi's Maps location resolver.
- The local cache and usage meter are file-backed for the demo. A shared production store and rate limiting remain Phase 6 hardening work.

## Known issues / next-phase items

- Google News can be empty or slow for a narrow district query; the UI reports this honestly and continues with available evidence. Phase 3 can tune crop-specific News fallback queries.
- The current Recorded capture is intentionally partial because the News request timed out; no synthetic News result was added.
- Phase 3 must turn the generic evidence bundle into the full KrishiSahay brief: actions, alerts, schemes, market data, regional-language content, Trends proxy, official-channel videos, and crop-specific tests.
