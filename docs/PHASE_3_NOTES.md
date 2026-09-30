# Phase 3 — KrishiSahay goes live

Date: 2026-09-30

## What was already present and verified

- All-India crop location data: 35 state/UT labels and 722 district labels, including Nadia, Ludhiana, and Nagpur.
- Deterministic quote-first crop brief builder with safe actions, district news alerts, official scheme excerpts, Maps support, refusal handling, and localized English/Hindi/Bengali safety copy.
- Local-only crop case storage, dashboard reopening/deletion, and source-backed text/image/WhatsApp sharing.
- Strict mandi fallback parser and existing Phase 2 evidence stream.

## Completed in this phase

- Tuned the crop planner for seven bounded SerpApi searches: advisory, recent News, schemes, mandi references, Maps support, Trends proxy, and official-channel YouTube discovery.
- Added SerpApi response normalization for Google Trends timeseries and YouTube video results.
- Added a conservative official agriculture channel allowlist. Unverified channels are dropped.
- Added a labelled Trends signal with thin-data hiding; it cannot create an alert or action.
- Added a verified Kisan Call Centre fallback (`1800-180-1551`) with an official reference link.
- Added brief sections for market data, early search signal, official videos, source-engine labels, and a full source list without changing the visual language.
- Added all-India location provenance notes and crop-engine tests.

## Verification

- `npm run typecheck` — passed.
- `npm test` — passed: 11 test files, 56 tests.
- `npm run lint` — passed.
- `npm run build` — passed; `/en/krishi`, `/en/dashboard`, and `/api/evidence/run` build successfully.
- Live Rice / Nadia / Flowering: 7 planned, 5 successful, 19 sources kept, 1 KVK support result. News and Trends failures became warnings; no alert, price, or trend was fabricated.
- Live Wheat / Ludhiana: 5 successful searches, 16 sources kept, 1 support result.
- Live Cotton / Nagpur: 6 successful searches, 19 sources kept.
- Recorded Rice / Nadia / Flowering: 5 real captured responses replayed with `liveSearches: 0`.

## Known limitations

- Google News and Google Trends can be empty, slow, or unavailable for a narrow query; the brief shows intentional empty states and warnings.
- The current real Recorded capture contains five successful hero responses; News and Trends are deliberately not faked.
- The live hero's available mandi snippets did not contain all required labelled fields, so no price was shown. This is correct behavior; a number is never inferred.
- The available YouTube result came from a non-allowlisted channel and was dropped. No unofficial video is shown.
- Dynamic evidence snippets remain in their original language. Static UI, safety copy, refusal text, and empty states are localized; automatic translation remains a later, explicitly consented public-content feature.
- Curated, officially cross-checked KVK demo data and Phase 6 shared rate limiting/distributed caching remain future hardening work.

## Refinement & Production Readiness Polish
- Plain-Language Synthesis: Replaced raw source dump and negative 'no verified advisory action' dead-ends with actionable synthesis of what SerpApi searches report for the crop, district, and growth stage.
- Practical Harvest & Crop Steps: Tailored stage-specific guidance for Sugarcane, Rice, Wheat, Cotton, Potato, and other crops (maturity checking, clean ground cutting, moisture reduction, safe storage, mandi preparation) paired with official Kisan Call Centre support.
- Accessibility / Illiterate Farmer Support: Added one-click Web Speech API Text-to-Speech (TTS) readout in Hindi, Bengali, and English to read aloud the conclusions and action steps.
- Prominent Trail Completion: Added top action banner on Evidence Trail so users immediately transition to the action plan instead of scrolling past raw cards.
- SerpApi Attribution: Added explicit small note stating suggestions and conclusions are based on public web searches conducted using SerpApi.

