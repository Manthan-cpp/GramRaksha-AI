# 🛡️ GramRaksha AI — Remaining Build Plan (`remaining_build_plan.md`)

This roadmap defines the architectural blueprints, UX specifications, SerpApi engine routing, safety guidelines, and implementation sequence for the remaining new features and feature upgrades in **GramRaksha AI**.

---

## 📊 Completed Milestones Overview

| Milestone | Module | Key Capabilities Delivered | Status |
| :--- | :--- | :--- | :---: |
| **Phase 1-3** | **KrishiSahay** | Evidence pipeline, APMC Mandi intel, Google Trends, YouTube official advisories, TTS speech summary. | ✅ **Production Ready** |
| **Phase 4** | **MediShield** | Client-side redacting bill audit, CGHS/PM-JAY reference check, formal clarification notice letter. | ✅ **Production Ready** |
| **Phase 5** | **Household & Voice** | Unified dashboard, Web Speech API voice input, IndexedDB multi-case storage, offline PWA cache. | ✅ **Production Ready** |
| **Phase 6** | **Suraksha Check** | Rogue APK analysis, non-.gov.in phishing alerts, fee/deposit linter, Chakshu/1930 reporting routes. | ✅ **Production Ready** |
| **Phase 7** | **Fasal Bima 72h Kit** | PMFBY Clause 15.3 statutory countdown, local-only geotagged photo log, 14447 dial, DAO & Insurer letter. | ✅ **Production Ready** |
| **Phase 8** | **Ayushman Cashless Shield** | Point-of-admission deposit extortion protection under PM-JAY Clause 8.2, empanelment check, 4-tier escalation ladder, formal notice, 14555 dialer. | ✅ **Production Ready** |
| **Phase 9** | **Pocket Card & UI Redesign** | Offline CR80 wallet card, Google Maps PHC & Police extraction, vCard 3.0 export, WhatsApp broadcast generator, production civic UI redesign. | ✅ **Production Ready** |

---

## 🎯 Recommended Build Sequence for Remaining Features

```
Phase 10: Existing Feature Upgrades (Escalation Ladder, KrishiSahay Referral Card, Refresh Old Cases)
   │
   ▼
Phase 11: Multi-Language Expansion (Marathi, Telugu, Tamil)
   │
   ▼
Phase 12: Sahayak Mode & Aapda Watch (Community Worker Profiles & Weather Alerts)
```

---

## 🏥 Phase 8: Ayushman Cashless Shield (Extends MediShield)

### 1. Context & Regulatory Backing
- **The Problem:** Beneficiaries holding Ayushman Bharat PM-JAY / State Golden Cards often encounter private empanelled hospitals asking for upfront cash deposits, admission fees, or charging for consumable items that are statutorily included in pre-fixed package rates. A Comptroller and Auditor General (CAG) audit documented cases where beneficiaries paid out-of-pocket money for cashless packages.
- **Statutory MoU Rule:** Under the National Health Authority (NHA) & State Health Agency (SHA) Tripartite Memorandum of Understanding, empanelled hospitals receive package reimbursement directly from the Government/Insurance Agency and are **strictly prohibited** from demanding upfront cash deposits for package-covered ailments.
- **Redressal Channels:**
  - National Health Authority Call Centre: `14555` / `1800-111-565`
  - Centralized Grievance Redressal and Management System: [CGRMS Portal](https://cgrms.pmjay.gov.in)
  - District Grievance Redressal Committee (DGRC) headed by District Magistrate / Collector
  - State Health Agency (SHA) Grievance Redressal Cell

### 2. Core Architecture & UX
- **Input Flow:**
  - Farmer / patient enters: State, District, Hospital Name, Ayushman Card / ABHA Number (redacted on-device, only last 4 digits stored for letter), Admitted Treatment / Procedure, Deposit amount demanded in cash (e.g. ₹15,000).
- **SerpApi 3-Engine Queries:**
  - `google`: `PM-JAY empanelled hospital list "{hospital}" "{district}" site:pmjay.gov.in OR site:gov.in`
  - `google`: `State Health Agency Ayushman cashless deposit grievance procedure "{state}" site:gov.in`
  - `google_maps`: `Chief Medical Officer office District Health Society "{district}"`
- **Safety / Defamation Boundary:**
  - The UI never asserts that the hospital is *guilty of fraud*.
  - Neutral wording strictly enforced: *"Hospital appears on State empanelment records under PM-JAY. Under Clause 8.2 of the empanelment guidelines, packages are cashless without advance deposit."*
- **Escalation Ladder & Statutory Notice Letter:**
  - **Level 1:** On-Site Hospital Nodal Officer / Ayushman Mitra Desk.
  - **Level 2:** Formal written notice to Hospital Administration citing NHA Guidelines Section 8.2.
  - **Level 3:** Grievance lodged on CGRMS portal (`cgrms.pmjay.gov.in`) + Call 14555.
  - **Level 4:** Appeal to District Grievance Redressal Committee (DGRC / District Collector).
- **1-Click Actions:**
  - 📞 Dial `14555` (National Ayushman Helpline)
  - 📄 Generate Formal Letter to Hospital Medical Superintendent & SHA
  - 📋 Copy pre-formatted CGRMS complaint draft

---

## 💳 Phase 9: Gram Raksha Emergency Pocket Card

### 1. Purpose & Offline-First Strategy
- Rural citizens, elderly villagers, and farmers working in fields often experience poor network coverage or phone battery drain during crises.
- **Gram Raksha Card** is an on-demand, printable wallet-sized emergency card (ID card size: 85mm x 54mm or A4 fold-out 4-up format).
- Once generated online for a specific Village/District, all critical verified contacts are cached in local browser IndexedDB storage and work completely offline without internet connectivity.

### 2. Card Content & Directory Integration
- **Village Header:** State, District, Block / Taluka, Village Panchayat Name.
- **Pre-fetched Emergency Lifelines:**
  - 🚑 Ambulance: `108`
  - 🚨 National Emergency: `112`
  - 🌾 Crop Insurance / PMFBY Helpline: `14447`
  - 🧑‍🌾 Kisan Call Centre (Agriculture Advisory): `1800-180-1551`
  - 🏥 Ayushman Bharat / Health Redressal: `14555`
  - 🛡️ Cybercrime Financial Fraud Helpline: `1930`
  - ⚖️ National Legal Services Authority (NALSA / DLSA Free Legal Aid): `15100`
- **District Verified Support (Retrieved via SerpApi Google Maps):**
  - Nearest Primary Health Centre (PHC) / Community Health Centre (CHC) address & contact.
  - Local Police Station address & landline.
  - District Agriculture Officer (DAO) / Krishi Vigyan Kendra (KVK) address.
  - District Legal Services Authority (DLSA) / Consumer Dispute Redressal Commission address.
- **Physical Export:**
  - Clean CSS Print stylesheet for wallet card printing.
  - QR Code on card that encodes local emergency data as a vCard / offline payload.

---

## 🚀 Phase 10: Existing Feature Upgrades

### 1. Case Follow-Through Escalation Ladder
- **Current State:** Saved cases in `/dashboard` show audit results and letter downloads.
- **Upgrade:** Transform saved cases into an interactive **Escalation Ladder** with date tracking and milestone reminders:
  - **Day 0:** Letter submitted to Hospital / Bank / Insurer (Receiving Copy stamped).
  - **Day 7:** Follow-up reminder if no response received.
  - **Day 15:** Direct escalation to National Consumer Helpline (`consumerhelpline.gov.in` / `1915`) or PM-JAY CGRMS (`14555`).
  - **Day 30:** Filing e-Daakhil consumer complaint online (`edaakhil.nic.in`) or Right to Information (RTI) application draft.
- **RTI Application Generator:**
  - Auto-drafts an application under Section 6(1) of the RTI Act 2005 addressed to the Public Information Officer (PIO) of the District Agriculture Office / Chief Medical Officer demanding the daily progress report and inspection minutes of the submitted complaint.

### 2. Expert Referral Card (KrishiSahay)
- **Problem:** GramRaksha AI maintains a strict zero-diagnosis safety rule (never diagnosing crop diseases or prescribing hazardous chemicals). However, a farmer still needs human expert guidance.
- **Upgrade:** Package the farmer's crop, stage, district, weather summary, and field damage photograph into an official **KVK / Kisan Call Centre Expert Referral Card**:
  - One-tap WhatsApp share to the local Krishi Vigyan Kendra (KVK) WhatsApp helpdesk.
  - Pre-formatted structured SMS/Message format for Kisan Call Centre (1800-180-1551).
  - Maintains strict compliance: *"GramRaksha AI does not diagnose. This card packages your verified field parameters for certified scientists at your district KVK."*

### 3. "Refresh Instead of Warn" for Old Cases
- **Current State:** Cases older than 7 days show an amber advisory banner stating that prices and weather alerts might be stale.
- **Upgrade:** Replace the passive warning banner with a 1-click **"Re-run Live Search & Compare What Changed"** button.
- When clicked:
  - Dispatches a fresh SerpApi run for the same crop/location or hospital procedure.
  - Calculates a visual **Diff**: Mandi modal price changed (e.g. ₹2,100 -> ₹2,350), new weather advisory issued, or updated police alerts.

---

## 🌐 Phase 11: Regional Language Expansion

### 1. Target Languages by Demographic Reach
1. **Marathi (`mr`)**: 83+ million speakers. Critical for Maharashtra sugarcane, onion, cotton farmers (Vidarbha, Marathwada, Nashik, Pune).
2. **Telugu (`te`)**: 82+ million speakers. Critical for Andhra Pradesh and Telangana chilli, paddy, cotton growers.
3. **Tamil (`ta`)**: 75+ million speakers. Critical for Tamil Nadu delta farmers, health insurance claims, and cooperative banks.

### 2. Implementation Architecture
- GramRaksha AI's i18n structure is config-driven via `next-intl`:
  - `src/i18n/request.ts`: Add `mr`, `te`, `ta` to `locales` array.
  - `messages/mr.json`, `messages/te.json`, `messages/ta.json`: High-register agricultural and consumer terminology.
  - Google Fonts: Integrate `Noto Sans Devanagari` (Marathi), `Noto Sans Telugu`, `Noto Sans Tamil`.
  - Web Speech API: Voice recognition and TTS language codes (`mr-IN`, `te-IN`, `ta-IN`).

---

## 🤝 Phase 12: Sahayak Mode & Aapda Watch

### 1. Sahayak Mode (For Village Intermediaries)
- Designed for ASHA workers, Common Service Centre (CSC) Village Level Entrepreneurs (VLEs), Gram Rozgar Sahayaks, and school teachers who help non-smartphone-owning villagers.
- **Key Capabilities:**
  - **Multi-Household Switcher:** Save and switch between different family profiles without mixing records.
  - **High-Contrast, Large-Print Mode:** 20px+ base font with extra-large touch buttons for low-vision elders outdoors.
  - **Single-Sheet Village Summary Printout:** Print a 1-page combined advisory (crop market + bill clarification + disaster warnings) in the local language to hand to the villager.

### 2. Aapda Watch (District Weather & Disaster Advisory)
- Fetches dated official weather warnings from the India Meteorological Department (IMD) for the farmer's specific district.
- Integrates advisories on lightning strikes (pointing to official Damini app) and heavy rainfall/hailstorm.
- When an active severe hail or flood advisory is detected in the district, an alert banner offers a 1-click shortcut: **"Prepare Fasal Bima 72h Kit"**.

---

## 🛠️ Verification & Quality Standards for All Phases

1. **Safety & Linter Standards:**
   - 0 medical diagnoses, 0 chemical pesticide recommendations.
   - Neutral non-defamatory phrasing for billing disputes and hospital lookups.
   - 100% client-side privacy (PII and photos never uploaded to third-party cloud servers).
2. **Testing Gate:**
   - Every phase must include unit & integration tests covering calculator logic, schema validation, and recorded fixtures.
   - 100% test passing rate (currently 119/119 passing tests).
3. **Build & Lint Gate:**
   - 0 ESLint warnings, 0 TypeScript errors, clean Next.js Turbopack build.
4. **Git Protocol:**
   - Strict adherence to user mandate: **Never run `git push` or `git pull` without explicit user command and approval.**
