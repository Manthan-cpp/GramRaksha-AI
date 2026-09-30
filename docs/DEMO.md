# GramRaksha AI — 3-Minute Demo Video Script

> **Hackathon:** SerpApi India Hackathon 2026  
> **Track:** Knowledge & Public Interest  
> **Duration:** 2 minutes 50 seconds (under 3:00 minute hard limit)  
> **Target Audience:** Hackathon Judges & Public Interest Evaluators  

---

## Storyline Overview

| Time | Scene | Narration & Action |
|---|---|---|
| **0:00 – 0:30** | **The Dual Vulnerability in Rural India** | "A farmer in Nadia and a family in Hyderabad face the exact same anxiety: no evidence they can trust when money is on the line. One bad decision on a crop disease wipes out a harvest; one unclear private hospital bill plunges a family into debt. GramRaksha AI solves both with verified, real-time web evidence." |
| **0:30 – 1:15** | **Story 1: KrishiSahay (Crop Protection)** | Select Rice → West Bengal → Nadia → Flowering. Tap the **Mic** button and speak: *"Brown spots on leaves"*. Click **Find Evidence**. Watch the live **Evidence Trail** stream real searches via SerpApi across Google Search, News, Maps, YouTube, and Trends. |
| **1:15 – 1:35** | **Krishi 4-Tab Output & Low-Literacy Support** | Showcase the 4 tabs: **Conclusion & Advice** (4-step practical plan with verbatim source quotes), **Mandi Prices** (modal rate per quintal + Trends graph), **Verified Sources**, and **KVKs** (Google Maps listing + Kisan Call Centre 1551). Tap **Listen to Advice** to play soothing Indic voice narration. |
| **1:35 – 2:10** | **Story 2: MediShield (Hospital Bill Protection)** | Navigate to `/medi`. Load the Hyderabad Appendectomy demo bill. Show client-side redaction (zero PII sent to servers). Show math audit detecting arithmetic discrepancies and ₹14,500 in vague "Miscellaneous" fees. Run live SerpApi search comparing against official CGHS rate card benchmarks and DCDRC consumer courts. Auto-draft clarification letter citing Clinical Establishments rules. |
| **2:10 – 2:35** | **Story 3: Suraksha Check (Scam & Fake APK Detector)** | Navigate to `/suraksha`. Click preset: *"Fake PM Kisan APK"*. Live audit triggers SerpApi `google_play` (developer verification), `google_news` (police cyber alerts), and `site:gov.in` (zero registration fee laws). Show risk gauge (88%), 1-tap Chakshu (Sanchar Saathi) report, 1930 helpline, and ready-to-share Village Warning WhatsApp bulletin. |
| **2:35 – 2:50** | **Household Hub & What We Never Do** | Open `/dashboard` showing all three pillars (Krishi, MediShield, Suraksha) in private IndexedDB with freshness reminders and "Wipe All Records" button. Switch to **Hindi** and **Bengali**. Close with our pledge: *"No hallucinations, no pesticide prescriptions, zero dark patterns. Just evidence you can trust."* |

---

## Pre-Flight Checklist Before Recording

1. **Local Server:** Ensure local dev server is running on `http://localhost:3000`.
2. **Judge Mode:** Add `?demo=1` to the URL to show the floating telemetry panel displaying queries executed, sources kept, and cache hits.
3. **Audio:** Verify microphone and speakers for the Web Speech API narration test.
4. **Resolution:** Record at 1080p (1920x1080) at 60fps.
