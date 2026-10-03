# GramRaksha AI (ग्रामरक्षा एआई / গ্রামরক্ষা)

> **Verified Evidence for Agricultural, Livestock, Healthcare & Cyber Defense Decisions in Rural India.**  
> *Built for the SerpApi India Hackathon 2026 — Knowledge & Public Interest Track.*

---

## 1. What is GramRaksha AI?

Over 700 million rural Indian citizens face extreme financial vulnerability during critical emergencies:
1. **Farming & Pest Crises:** When crops exhibit yellowing or blight, farmers are often exploited by unregulated fertilizer shops selling toxic chemicals without verifiable agronomic backing.
2. **Livestock & Veterinary Emergencies:** When cattle or domestic animals show symptoms of epidemic diseases like Lumpy Skin Disease, prompt veterinary care and isolation protocols are critical.
3. **Medical Overcharging & Cash Demands:** Even with Ayushman Bharat (PM-JAY) cards, rural families are frequently confronted with unlawful cash deposit demands or inflated hospital bills.
4. **PMFBY Crop Insurance Deadlines:** When hailstorms or floods strike, farmers have a strict statutory **72-hour** window to intimate crop loss under PMFBY guidelines.
5. **Cyber & Scheme Fraud:** Farmers are targeted with malicious WhatsApp APK files (e.g., fake PM-Kisan installment updates) designed to compromise bank accounts.
6. **Zero-Connectivity Emergencies:** In remote areas with poor or absent network connectivity, citizens lack emergency contact directories for their local Police Thana, PHC, KVK, and Legal Aid.

**GramRaksha AI** is an on-device, privacy-first civic defense platform that grounds all critical rural decisions in **real-time, verified public web evidence retrieved via SerpApi**.

---

## 2. Core Modules & Capabilities

### 🌾 1. KrishiSahay (Crop Protection & Mandi Intel)
* **All 35 States & UTs:** Localized agronomic advisories across 720+ Indian districts.
* **4-Tab Actionable Advisory:**
  * **Action Plan:** Step-by-step practical recommendations, active district pest/weather warnings, and verbatim citations from ICAR and State Agriculture Universities.
  * **Mandi Rates:** Live APMC mandi price cards (modal rate/quintal) with historical Google Trends regional search interest.
  * **Verified Sources (SerpApi):** Transparent citation trail of official government portals (`icar.org.in`, `agmarknet.gov.in`).
  * **KVKs & Expert Escalation:** Local Krishi Vigyan Kendra contact numbers, Kisan Call Centre (**1551**), and official educational video advisories.
* **Low-Literacy Support:** Voice search input and one-tap Indic Text-to-Speech audio narration (Hindi, Bengali, English).

### 🐄 2. PashuSahay (Livestock & Veterinary Care)
* **Species-Specific Guidance:** Instant diagnostic and first-aid support for Cattle, Buffaloes, Goats, Sheep, and Poultry.
* **Spoon-Fed First-Aid Steps:** Plain-language quarantine, hydration, and organic home-care guidance designed for first-time smartphone users.
* **Emergency Lifeline Integration:** Direct tap-to-call for the **1962** Mobile Veterinary Clinic and NDDB helplines.
* **Official Verification:** Cites authentic veterinary research repositories and government disease advisories via SerpApi.

### 🏥 3. MediShield (Ayushman PM-JAY & Hospital Bill Audit)
* **Deterministic Arithmetic Audit:** Cross-verifies bill line items against stated totals, flagging arithmetic errors and vague "miscellaneous" surcharges.
* **Ayushman Cashless Shield (Clause 8.2):** Validates hospital empanelment under PM-JAY and benchmarks fees against official CGHS rate ceilings.
* **Dispute Notice Generator:** Auto-generates a formal, statutory Medical Superintendent Dispute Notice ready for A4 PDF download or WhatsApp delivery to billing desks.
* **4-Tier Escalation Ladder:** Day-0 to Day-30 procedural roadmap (Grievance Cell, State Health Agency, e-Daakhil consumer court, District Legal Services Authority).

### 🛡️ 4. Suraksha Check (Scam & Rogue APK Defense)
* **Multi-Engine Threat Triangulation:** Detects fake welfare APK files, fraudulent WhatsApp forwards, upfront fee demands, and power cutoff threats.
* **Google Play & Gov Verification:** Cross-references sideloaded APKs against the Google Play Store (developer validation) and official government databases (`site:gov.in`).
* **1-Tap Redressal:** Quick reporting via **Chakshu (Sanchar Saathi)** and tap-to-call **1930** (National Cybercrime Helpline).
* **Village Warning Bulletins:** Generates printable and shareable alert notices for village WhatsApp groups and Panchayat boards.

### ⏱️ 5. Fasal 72h (PMFBY 72-Hour Loss Intimation Kit)
* **Strict Statutory Timeline:** Guides farmers through submitting post-harvest loss intimations within the mandated 72-hour PMFBY window.
* **Time-Stamped Dossier:** Generates a structured loss intimation packet with geotagged evidence slots and insurance company nodal contact details.
* **Direct Intimation Channels:** Links to the Kisan Bima toll-free hotline (**14447**) and the national PMFBY portal.

### 🪪 6. Pocket Card (Offline Village Emergency Vault)
* **CR80 Wallet-Sized Layout:** Formats essential village emergency contacts into a printable pocket card.
* **Local Directory:** Includes local Police Thana, Primary Health Centre (PHC), Krishi Vigyan Kendra (KVK), and District Legal Services Authority (DLSA).
* **Zero Connectivity Resilience:** Works 100% offline via browser IndexedDB cache.

### 📂 7. Household Case Vault (`/dashboard`)
* **100% On-Device Privacy:** All crop briefs, veterinary questions, bill audits, and scam checks stay in the user's browser IndexedDB (Dexie). No citizen data is ever uploaded to central databases.
* **Instant Privacy Wipe:** A single tap securely purges all stored records from browser storage.

---

## 3. Material SerpApi Integration

SerpApi provides the factual backbone of GramRaksha AI. The application leverages **six distinct SerpApi search engines**:

| SerpApi Engine | Role in GramRaksha AI | Key Parameters Used |
|---|---|---|
| `google` | Retrieves authoritative government advisories (`site:gov.in`, `site:icar.org.in`, `site:pmjay.gov.in`), statutory scheme guidelines, and consumer court rulings. | `q`, `gl=in`, `hl=en\|hi\|bn` |
| `google_news` | Surfaces district-level agricultural pest alerts, weather advisories, and state police cyber fraud warnings. | `q`, `gl=in`, `when:30d` |
| `google_maps` | Identifies nearby Krishi Vigyan Kendras (KVKs), Primary Health Centres, and District Consumer Forums with directions and phone numbers. | `type=search`, `q`, `location`, `z=10` |
| `google_trends` | Monitors regional search interest spikes for crop diseases and pest outbreaks as an early-warning signal proxy. | `q`, `geo=IN`, `date=today 1-m` |
| `google_play` | Verifies whether an app referenced in a message is published by an authentic government developer (NIC) or is an unverified sideload APK. | `q`, `gl=in`, `hl=en` |
| `youtube` | Curates educational video demonstrations from verified official channels (ICAR, DD Kisan, Ministry of Agriculture). | `q`, `sp=EgIQAQ%253D%253D` |

---

## 4. Safety & Grounding Principles

1. **Zero Chemical Prescriptions:** The system never prescribes synthetic chemical dosages; it spoon-feeds organic cultural practices and directs users to certified KVK scientists.
2. **No Hallucinated Verdicts:** In scam and bill audits, language strictly mirrors official public notices and consumer protection statutes without defamatory accusations.
3. **Emergency Lifelines Front and Center:** Direct telephone hotlines for **112** (National Emergency), **108** (Ambulance), **1962** (Veterinary), **14447** (Crop Insurance), **14555** (Ayushman), and **1930** (Cybercrime) are accessible from every page.
4. **Verifiable Citations:** Every summary statement cites verbatim text from an official kept web source.

---

## 5. Local Setup & Quickstart

### Prerequisites
- Node.js 20 LTS or higher
- A SerpApi API key (get one free at [serpapi.com](https://serpapi.com))

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Manthan-cpp/GramRaksha-AI.git
cd GramRaksha-AI

# 2. Install dependencies
npm install

# 3. Configure environment
copy .env.example .env
# Edit .env and enter your SERPAPI_API_KEY
```

### Running Locally
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser to experience the application.  
Append **`?demo=1`** to any route to view the live **Judge Panel** with real-time SerpApi telemetry counters.

---

## 6. Verification & Quality Gates

Run the automated test suite and verification commands:

```bash
npm test           # Run 148 automated unit tests (Vitest)
npm run typecheck  # TypeScript strict compiler verification
npm run lint       # ESLint quality audit
npm run build      # Next.js Turbopack production build
```

---

## 7. License

Open-source under the [MIT License](LICENSE). Built for the **SerpApi India Hackathon 2026** under the **Knowledge & Public Interest** track.
