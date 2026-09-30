# Phase 4 — MediShield Goes Live

Date: 2026-09-30

## What MediShield Includes

MediShield is the hospital bill audit, protection, and dispute assistance system of GramRaksha AI. It empowers rural citizens and families to understand complex hospital charges, detect billing anomalies, compare against government benchmark packages, and assert their rights under patient charter laws without feeling helpless or confused.

### 1. Privacy & Redaction First
- **Privacy Notice**: Confirms zero server-side storage of medical records or patient identity. Allows choosing between photo upload or manual data entry.
- **Bill Upload**: File drag-and-drop, camera upload, or manual entry option.
- **Client-Side Canvas Redaction**: Interactive canvas allowing patients to black out names, phone numbers, addresses, doctor names, and UHID numbers directly in the browser before extraction.

### 2. Comprehensive Bill Verification & Breakdown (`ExtractionReview`)
- **Demo Bill Presets**: One-click test scenarios for fast live demos:
  - *Scenario 1: Laparoscopic Appendectomy in Pune (City Care Hospital)* — ₹88,500 with ₹12,000 unitemised miscellaneous fee and high consumables.
  - *Scenario 2: Caesarean (C-Section) Delivery in Jaipur (Apex Hospital)* — ₹72,000 with room rent and unitemised pharmacy.
  - *Scenario 3: Cataract Surgery in Lucknow (Divine Eye Hospital)* — ₹44,000 comparing against PM-JAY package benchmarks.
- **Line-Item Editor**: Add, remove, and categorize items (Bed/Room Rent, Consultation, OT, Pharmacy, Diagnostics, Consumables, Miscellaneous).
- **Live Math Reconciliation Bar**: Automatically detects discrepancies between the sum of line items and the billed grand total.

### 3. Live Evidence Stream with Serp API
- **Government Package Benchmarks**: Queries official CGHS, PM-JAY / Ayushman Bharat, and State Health Scheme rates for the specific procedure and city.
- **Patient Grievance Routes**: Queries the National Consumer Helpline (1915), State Health Department, and Clinical Establishments Act rules.
- **Hospital News & Precedents**: Recent public billing complaints and consumer commission verdicts in that city.
- **Nearby Support Locations (Google Maps)**: District Consumer Disputes Redressal Commission (DCDRC) and District Legal Services Authority (DLSA) with addresses, hours, and direct phone numbers.

### 4. Plain-Language Bill Decision & Conclusion Synthesis (`decision.ts`)
- **Empathetic Conclusion Summary**: Localized in English, Hindi, and Bengali, explaining the bill in warm, accessible language suitable for an ordinary family member or illiterate citizen.
- **Pronunciation Safeguards**: Consistent `"Serp API"` (with a space) and no hyphenated numeric ranges (`"18000 to 26000"`, `"18,000 से 26,000"`).
- **One-Tap Web Speech API Audio Player (Listen / सुनें / শুনুন)**: Reads aloud the conclusion summary and advice in native Hindi, Bengali, or English at a calm 0.88x pace.
- **Item-Level Question Generator**: Specific, polite questions for each flagged charge (vague admin fees, math errors, lump-sum pharmacy) with one-click copy buttons for the billing counter.
- **Practical 4-Step Action Plan**:
  1. Request itemised pharmacy sheets with batch numbers and MRP.
  2. Ask to justify or waive non-clinical administrative and miscellaneous fees.
  3. Compare against the hospital's publicly displayed rate schedule.
  4. Call the National Consumer Helpline (1915) or Ayushman Bharat (14555) for free government support.
- **Serp API Attribution**: Small notice: *"Suggestions and conclusions are based on public web searches conducted using Serp API."*

### 5. Interactive Clarification Letter Generator (`LetterEditor`)
- **Automated Formal Draft**: Addressed to the Medical Superintendent and Billing In-Charge, incorporating specific flagged charges, math differences, and citing the Clinical Establishments Act.
- **Live A4 Preview**: Authentic document letterhead with print-to-PDF styles (`window.print()`).
- **One-Click Sharing**: WhatsApp message generation, email draft link, and copy to clipboard.

### 6. State Preservation & Local Storage
- **Resilient Session Storage (`gramraksha_medi_active_session`)**: Changing languages (EN ↔ HI ↔ BN) retains the bill and evidence, re-synthesizing the entire audit and advice in the newly chosen language.
- **Offline Recorded Mode**: Captured scenario fixture `fixtures/recorded/medi-pune.json` enables zero-cost offline demonstrations.
- **Local Storage (`medi-cases.ts`)**: Saves bill cases to IndexedDB, viewable from the Household Dashboard.

## Verification
- `npm run lint` — 0 errors, 0 warnings.
- `npm run typecheck` — 0 errors.
- `npm test` — 63/63 tests passing across 12 test suites.
- `npm run build` — Next.js Turbopack build succeeded in 7.1s.
