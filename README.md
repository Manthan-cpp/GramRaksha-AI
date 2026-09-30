# GramRaksha AI (ग्रामरक्षा एआई / গ্রামরক্ষা)

> **Evidence You Can Trust, For Farm, Health & Cyber Security Decisions.**  
> *Built for the SerpApi India Hackathon 2026 — Knowledge & Public Interest Track.*

---

## 1. What is GramRaksha AI?

Rural Indian households face extreme financial vulnerability at three critical moments:
1. **Farming & Harvest Decisions:** When a crop shows yellowing, blight, or pest symptoms, farmers are often misled by unregulated local pesticide shops into buying unnecessary or hazardous chemicals.
2. **Medical Emergency Bills:** When a family member is discharged from a private hospital, bills often contain arbitrary sums, unitemized "sundry" charges, or math discrepancies, leaving families trapped in medical debt without knowing their legal rights.
3. **Cyber & Scheme Fraud:** Farmers and village families are increasingly targeted by fraudulent WhatsApp forwards, fake "PM-Kisan" APK downloads, upfront registration fee scams, and electricity cutoff threats.

**GramRaksha AI** is a unified, privacy-first decision support system that grounds all three decisions in **verified public web evidence retrieved in real time via SerpApi**.

---

## 2. Core Modules & Features

### 🌾 Module 1: KrishiSahay (Crop Protection)
* **India-Wide Coverage:** Supports all 35 States & Union Territories and 720+ Indian districts with localized agronomic data.
* **4-Tab Modern Advisory Hub:**
  * **Tab 1: Conclusion & Action Plan:** 4-step practical action plan, active district pest/weather news alerts, and verbatim quotes from state agriculture universities and ICAR advisories.
  * **Tab 2: Mandi Prices & Trends:** APMC mandi rate cards (modal price per quintal, date, market name) paired with a Google Trends regional search-interest indicator.
  * **Tab 3: Verified Sources (Serp API):** Full transparency into every source searched, kept, or dropped with trust badges and timestamps.
  * **Tab 4: KVKs & Govt Schemes:** Krishi Vigyan Kendras with phone numbers and Google Maps directions, toll-free Kisan Call Centre (**1551**), PMFBY crop insurance, and official YouTube advisory videos.
* **Voice-Enabled:** Interactive microphone input (Web Speech API) for speaking crop symptoms in Hindi, Bengali, or English.
* **Accessible Audio Narration (TTS):** One-tap audio playback reading out advice clearly for low-literacy farmers.

---

### 🏥 Module 2: MediShield (Hospital Bill Protection)
* **Zero-Leakage Privacy:** Bill images are redacted in the browser canvas before analysis; patient names, phone numbers, and identities are never sent to servers or search engines.
* **Deterministic Arithmetic Audit:** Verifies line items against stated totals, flagging math mismatches and vague "miscellaneous" charges.
* **Official Benchmark Comparison:** Compares procedures against CGHS indicative package rates and Clinical Establishments Act rules.
* **4-Tab Dispute & Audit Hub:**
  * **Tab 1: Conclusion & Advice:** Plain-language summary, key overcharge flags, 4-step dispute guidance.
  * **Tab 2: Questions & Flags:** Specific questions to ask the hospital billing desk, item breakdown table.
  * **Tab 3: Verified Sources (Serp API):** Real-time consumer grievance rulings, CGHS benchmarks, and healthcare consumer articles.
  * **Tab 4: Helplines & Legal Aid:** National Consumer Helpline (**1915**), PM-JAY helpline (**14555**), e-Daakhil consumer commission portal, and local District Legal Services Authorities (DLSA).
* **Formal Clarification Letter Generator:** Auto-generates a polite, legally-grounded clarification letter formatted for A4 printing (Print to PDF) and WhatsApp sharing.

---

### 🛡️ Module 3: Suraksha Check (WhatsApp & Scheme Scam Detector)
* **Real-World Threat Triangulation:** Detects fake welfare APK files, lookalike phishing domains, advance fee/deposit demands, false urgency threats (e.g. electricity cutoff tonight), and OTP credential theft.
* **SerpApi App & Policy Verification:**
  * Queries official government scheme pages (`site:gov.in`) proving welfare benefits are 100% free with zero registration fees.
  * Searches `google_news` for recent state police alerts and PIB Fact Checks.
  * Uses `google_play` engine to verify whether an official app exists published by the National Informatics Centre (NIC) or if the APK is a dangerous rogue sideload.
* **4-Tab Security Audit Hub:**
  * **Tab 1: Verdict & Threat Analysis:** Dynamic risk score gauge (0–100%), threat severity tags (Critical / Warning), and TTS audio readouts.
  * **Tab 2: Verified Sources & Fact-Check:** Official scheme fee rules, police advisories, and Google Play publisher status.
  * **Tab 3: Report & Redressal:** 1-tap reporting on **Chakshu (Sanchar Saathi)** and tap-to-call **1930** (National Cybercrime Helpline).
  * **Tab 4: Village Warning Card:** Pre-formatted, ready-to-share alert bulletin formatted for village WhatsApp groups and Panchayat boards.

---

### 🏡 Module 4: Unified Household Hub (`/dashboard`)
* **Local-First IndexedDB:** Cases across farming, hospital bills, and scam checks are saved privately on the user's device via Dexie IndexedDB.
* **Category Filter Pills:** Quickly filter between All, Krishi, MediShield, and Suraksha records.
* **Advisory Freshness Warning:** Alerts users when crop advice is older than 7 days, advising a fresh search.
* **One-Click Privacy Wipe:** A "Wipe All Records" button that immediately deletes all stored medical, crop, and security data from device memory.
* **Low-Bandwidth Resilience (PWA):** Offline detection displays cached briefs when 2G/3G connectivity drops in rural fields.

---

## 3. Material SerpApi Integration

SerpApi is the foundational factual engine of GramRaksha AI. We use **six distinct SerpApi engines** across all modules:

| Need | SerpApi Engine | How It Drives the Product |
|---|---|---|
| **District Pest & Weather News** | `google_news` | Finds dated, district-level outbreak reports and Agromet advisories for Krishi alerts, plus recent police scam warnings. |
| **Official Advisories & Schemes** | `google` (Search) | Targets `site:gov.in`, `site:icar.org.in`, and official state health/scheme portals for verifiable rules and fee exemption laws. |
| **Local KVKs & Consumer Courts** | `google_maps` | Finds nearby Krishi Vigyan Kendras, DLSA offices, and Consumer Disputes Redressal Commissions. |
| **Regional Concern Signals** | `google_trends` | Tracks regional search interest spikes for crop concerns, surfaced as an early signal proxy. |
| **Official Advisory Videos** | `youtube` | Discovers verified educational videos from official channels (ICAR, DD Kisan, State Ag Depts). |
| **App & Publisher Verification** | `google_play` | Verifies authentic developer credentials (NIC / Government) on the Google Play Store vs rogue APK files. |

---

## 4. Safety & Grounding Principles

1. **No Prescriptions:** Never prescribes chemical pesticides or exact toxic doses; redirects farmers to certified KVK agricultural officers.
2. **No Diagnosis Verdicts:** Never diagnoses plant diseases with false certainty.
3. **No Defamatory Verdicts:** Never accuses hospitals or entities of criminal conduct; in Suraksha Check, vetted terminology (*"matches patterns reported in official public advisories as fraudulent"*) is strictly cited from police sources.
4. **Emergency First:** Top-level emergency strip points users to **108** (Ambulance), **112** (National Emergency Helpline), and **1930** (Cybercrime Helpline).
5. **Verified Grounding:** Every statement in the conclusion maps directly to a verbatim snippet from an official kept source.

---

## 5. Local Setup

### Prerequisites
* Node.js 20 LTS or higher
* SerpApi API Key (free tier supported)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/gramraksha-ai.git
cd gramraksha-ai

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Open .env and add your SERPAPI_API_KEY
```

### Running Locally
```bash
npm run dev
```
Open **`http://localhost:3000/en`** in your browser.  
Append **`?demo=1`** to any URL to activate the floating **Judge Panel** with real-time query counters and Live / Recorded mode switching.

---

## 6. Verification & Quality Gates

Run the automated test suite and build verification:
```bash
npm run lint       # ESLint (0 errors, 0 warnings)
npm run typecheck  # TypeScript strict compiler (0 type errors)
npm test           # Vitest suite (108 / 108 tests passing across 14 test files)
npm run build      # Next.js Turbopack production build
```

---

## 7. License & Credits

Built for the **SerpApi India Hackathon 2026** under the **Knowledge & Public Interest** track.
Open-source under the MIT License.
