# Decisions

## Phase 2 — 2026-09-30

- SerpApi is the only live evidence provider. Google Search, Google News, and Google Maps are called through one `EvidenceProvider` interface.
- Phase 2 uses `NoLLMProvider` and deterministic quote-first claims. Gemini and Groq adapters remain disabled until a later phase requires an allowed use.
- Cache and usage metering use an atomic local file fallback under `.cache/serpapi`, with in-process memory for the current server process. This keeps local demos zero-cost and prevents accidental quota loops.
- Bill searches receive only confirmed hospital, city, and procedure fields. Bill images, patient details, amounts, and line items are not accepted by the evidence endpoint.
- Phase 1 visual structure and empty-state styling are preserved. Phase 2 only fills the existing Evidence Trail states and Judge Panel counters.

## Phase 3 — KrishiSahay — 2026-09-30

- Mandi data uses a strict SerpApi Google Search fallback: a price is shown only when one official snippet contains labelled commodity, market, date, currency, unit, and location fields. No number is inferred from a title or query.
- Google Trends is shown only as a labelled search-interest proxy. Thin data is hidden; it can never create an alert or action.
- YouTube results are kept only when the channel name matches the conservative official agriculture allowlist. Other videos are dropped.
- Dynamic source excerpts remain in their original language in this phase. The interface, refusal text, safety notes, and empty states are localized in English, Hindi, and Bengali; no unverified translation is presented as fact.
- Crop cases contain only the confirmed crop profile and the resulting public evidence brief in IndexedDB. The free-text concern and all bill/health data remain outside the crop store.
