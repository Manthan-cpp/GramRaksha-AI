### Phase 1B - 2026-09-30 - UI Agent
- Completed: KrishiSahay flow UI (Crop stepper, Evidence Trail idle state, Brief view empty states).
- Files/routes added: src/app/[locale]/krishi/page.tsx, src/components/krishi/*, src/data/krishi.ts.
- Decisions: Created static lists for crops/locations to unblock UI.
- Known issues: The EvidenceTrail component only supports 'idle' state, real states to be built in Phase 2.


### Phase 1C - 2026-09-30 - UI Agent
- Completed: MediShield flow UI (Privacy, Upload, Redact, Review, Results, Letter).
- Files/routes added: src/app/[locale]/medi/page.tsx, src/components/medi/*.
- Decisions: Built basic HTML canvas redaction wrapper and live CSS print layout for the letter.
- Known issues: Redaction undo only removes last drawn rect.


### Phase 1D - 2026-09-30 - UI Agent
- Completed: Dashboard, Help & Safety, Judge Panel, System states (404, loading, error).
- Files/routes added: src/app/[locale]/dashboard, src/app/[locale]/help, src/components/shared/JudgePanel.tsx, error.tsx, loading.tsx, not-found.tsx.
- Decisions: Judge panel uses Suspense. Dashboard renders empty state for case history.


### Phase 3 Refinement - 2026-09-30 - Full Production Polish
- Completed: Synthesized plain-language conclusions from SerpApi searches, practical crop/harvest action steps, small SerpApi attribution note, top-of-trail completion banner, and Text-to-Speech audio readout for illiterate farmers.
- Files refined: src/lib/krishi/decision.ts, src/components/krishi/BriefView.tsx, src/components/krishi/EvidenceTrail.tsx, src/lib/schemas/index.ts.
- Verification: 58/58 tests passing, 0 lint errors, production build verified.


### Phase 4 - 2026-09-30 - MediShield Goes Live
- Completed: Full production-grade MediShield hospital bill audit and dispute assistance system.
  - Client-side redaction and manual entry fallbacks with demo scenario presets (Appendectomy in Pune, C-Section in Jaipur, Cataract in Lucknow).
  - Line-item breakdown editor with category tags and real-time arithmetic discrepancy checking.
  - Live Serp API searches for official package benchmarks (CGHS, PM-JAY), patient grievance rules, local news, and consumer commission maps.
  - Plain-language conclusion synthesis engine (`decision.ts`) in English, Hindi, and Bengali with TTS voice readout, pronunciation safeguards ("Serp API", no "minus" in number ranges), and small attribution notice.
  - Segmented tab UI: Conclusion & Advice, Questions & Flags to Ask, Verified Sources (Serp API), and Helplines & Legal Aid.
  - Formal clarification letter generator with live A4 preview, print-to-PDF styles, WhatsApp and email sharing.
  - State preservation across language changes with session storage and local Dexie IndexedDB storage for household dashboard cases.
- Files added/refined: src/lib/medi/decision.ts, src/components/medi/*, src/data/sample-bills.ts, src/lib/storage/medi-cases.ts, fixtures/recorded/medi-pune.json, messages/*.json.
- Verification: 63/63 tests passing across 12 test suites, 0 lint errors, Next.js build verified.


### Phase 5 - 2026-09-30 - Household Unification + Experience Upgrades
- Completed: Full unification of KrishiSahay and MediShield into a cohesive, high-polish experience.
  - Elevated KrishiSahay BriefView to match MediShield's 4-tab segmented layout (Conclusion & Advice, Mandi Prices & Trends, Verified Sources, KVKs & Govt Schemes) with modern top card, badges, and TTS audio narration.
  - Interactive voice input (Web Speech API via `useVoiceInput`) in Hindi, Bengali, and English for crop concern input and manual hospital bill procedure entry.
  - Unified Dashboard v2 (`/dashboard`) with relative time indicators, case category filter pills, advisory freshness alerts for cases older than 7 days, and one-click "Wipe All Records" local privacy cleanup.
  - Offline & PWA support with `OfflineBanner` (using `useSyncExternalStore`) and `manifest.webmanifest`.
  - Regional language localization polish across Hindi, Bengali, and English.
- Files added/refined: src/components/krishi/BriefView.tsx, src/components/krishi/CropStepper.tsx, src/components/medi/ExtractionReview.tsx, src/lib/voice/useVoiceInput.ts, src/app/[locale]/dashboard/page.tsx, src/components/shared/OfflineBanner.tsx, src/app/[locale]/layout.tsx, public/manifest.webmanifest.
- Verification: 64/64 tests passing across 12 test suites, 0 lint errors, 0 type errors, Next.js production build verified.
