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


### Phase 6 - 2026-09-30 - Suraksha Check (Scam & Phishing Defense)
- Completed: Full production-grade cyber fraud detection module for rural citizens.
  - Pattern engine detecting rogue `.apk` downloads, non-`.gov.in` lookalike phishing domains, advance deposit demands, false urgency threats, and OTP theft.
  - Decision engine synthesizing risk score (0-100%), plain-language verdicts (Danger, Caution, Safe), natural TTS speech summary, and verified redressal routes (Chakshu on Sanchar Saathi + 1930 Cybercrime Helpline).
  - SerpApi integration using `google_play` (NIC developer check), `google` (scheme fee rules), `google_news` (police alerts), and `google` (Chakshu reporting).
  - Safety scoping in `src/lib/llm/safety.ts` with `allowScamContext: true` allowing vetted advisory terminology ("matches patterns reported as fraud").
  - IndexedDB persistence (`gramraksha-suraksha-cases`) and integration into Dashboard with filter pills and card layout.
- Files added/refined: src/lib/suraksha/*, src/components/suraksha/*, src/app/[locale]/suraksha/page.tsx, fixtures/recorded/suraksha-pmkisan.json, tests/suraksha/suraksha.test.ts.
- Verification: 108/108 tests passing, 0 lint errors, Next.js Turbopack build verified.


### Phase 7 - 2026-09-30 - Fasal Bima 72-Hour Kit (PMFBY Statutory Intimation)
- Completed: Real-time 72-hour crop loss intimation toolkit for PMFBY-enrolled farmers.
  - Live ticking countdown timer with hours, minutes, and seconds calculating remaining window from incident timestamp.
  - Color-coded urgency levels: Safe (>48h left, emerald), Warning (24-48h left, amber), Critical (<24h left, red pulsing badge), and Expired (>72h passed, SDRF appeal guidance).
  - Local-only damage photo evidence log storing timestamped on-field photos in IndexedDB with 100% on-device privacy guarantee (no cloud uploads, no PII).
  - Big tactile quick-dial buttons: Dial 14447 (National PMFBY Helpline), Dial 1800-180-1551 (KCC), Dial Empanelled Insurer, Open Crop Insurance App, WhatsApp emergency share.
  - Formal statutory claim intimation letter generator under PMFBY Revised Operational Guidelines Clause 15.3 in English, Hindi, and Bengali with 1-click Print/PDF, Copy, and WhatsApp export.
  - SerpApi integration querying official PMFBY insurer cluster allocation, statutory 72-hour intimation guidelines, and District Agriculture Office Google Maps contact.
  - IndexedDB persistence (`gramraksha-fasal-cases`) and full Dashboard integration with 4-pillar card grid and Fasal filter pill.
- Files added/refined: src/lib/fasal/*, src/components/fasal/*, src/app/[locale]/fasal/page.tsx, src/lib/storage/fasal-cases.ts, fixtures/recorded/fasal-pmfby.json, tests/fasal/fasal.test.ts, messages/*.json, src/app/[locale]/dashboard/page.tsx, src/app/[locale]/page.tsx.
- Verification: 119/119 tests passing across 15 test suites, 0 lint errors, 0 type errors, Next.js Turbopack production build verified.


### Phase 8 - 2026-10-01 - Ayushman Cashless Shield (Extends MediShield)
- Completed: Point-of-admission deposit extortion protection for Ayushman Bharat PM-JAY & State Golden Card holders.
  - Empanelled hospital verification via SerpApi against official PM-JAY / State Health Agency registries with strict legal guardrails (neutral, non-defamatory phrasing: "Hospital appears on empanelment records under PM-JAY. Under Clause 8.2, packages are strictly cashless with zero advance deposit.").
  - 4-Tier statutory escalation ladder with actionable contact numbers and legal basis (1. Hospital Arogya Mitra Desk & Medical Superintendent -> 2. District Grievance Redressal Committee / CMO -> 3. State Health Agency Grievance Cell -> 4. National Health Authority 14555 & CGRMS portal).
  - Rapid Action Helpline Bar: 1-tap call to National 14555, State SHA toll-free (SACHIS 1800-1800-4444, BSSS 104, MJPJAY 155388, etc.), and PMAM on-site desk guidance.
  - Multilingual formal legal representation notice to Medical Superintendent with carbon copy (CC) to DGRC and SHA in English, Hindi, and Bengali, with live modal preview, copy, print-to-PDF, and WhatsApp dispatch.
  - Natural Web Speech API audio readout (TTS) explaining patient rights in Hindi, Bengali, or English.
  - Integrated into MediShield (`/medi`) with a top dual-mode switcher (`🛡️ Ayushman Cashless Shield` vs `📋 Hospital Bill Audit`) and URL parameter support (`?mode=cashless`).
  - IndexedDB storage integration in `SavedMediCase` with `subModule: "cashless_shield"`, rendered in Dashboard with specialized badge, deposit amount, and notice viewer.
- Files added/refined: src/lib/medi/cashless-*, src/components/medi/cashless/*, src/app/[locale]/medi/page.tsx, fixtures/recorded/medi-cashless.json, tests/medi/cashless.test.ts, messages/*.json, src/app/[locale]/dashboard/page.tsx, src/app/[locale]/page.tsx.
- Verification: 129/129 tests passing across 16 test suites, 0 lint errors, 0 type errors, Next.js Turbopack production build verified.
