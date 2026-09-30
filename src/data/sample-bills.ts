import type { Bill } from "@/lib/schemas";

export interface SampleBillScenario {
  id: string;
  name: string;
  nameHi: string;
  nameBn: string;
  description: string;
  bill: Bill;
}

export const SAMPLE_BILLS: SampleBillScenario[] = [
  {
    id: "appendectomy-pune",
    name: "Appendectomy (Pune)",
    nameHi: "अपेंडिक्स ऑपरेशन (पुणे)",
    nameBn: "অ্যাপেন্ডিসাইটিস অপারেশন (পুনে)",
    description: "City Care Hospital · ₹88,500 total with ₹12,000 unitemised miscellaneous fee and high consumable charges.",
    bill: {
      hospital: "City Care Hospital",
      city: "Pune",
      date: new Date().toISOString().split("T")[0],
      procedure: "Laparoscopic Appendectomy",
      total: 88500,
      confidence: { hospital: 0.95, city: 0.95, procedure: 0.9, total: 0.9 },
      confirmed: true,
      items: [
        { label: "Bed & Room Charges (Semi-Private, 3 days)", category: "bed", qty: 3, unit: "days", amount: 15000 },
        { label: "Surgeon & Anesthetist Consultation Fees", category: "consultation", qty: 1, unit: "case", amount: 28000 },
        { label: "Operation Theatre (OT) Facility & Monitoring", category: "ot", qty: 1, unit: "case", amount: 14000 },
        { label: "Pharmacy, IV Fluids & Antibiotics (Lump Sum)", category: "pharmacy", qty: 1, unit: "lump sum", amount: 16500 },
        { label: "Surgical Consumables, Gloves & Disposable PPE", category: "consumables", qty: 1, unit: "kit", amount: 7500 },
        { label: "Miscellaneous Administration & Sanitation Charges", category: "misc", qty: 1, unit: "fee", amount: 7500 }
      ]
    }
  },
  {
    id: "c-section-jaipur",
    name: "C-Section Delivery (Jaipur)",
    nameHi: "सिजेरियन डिलीवरी (जयपुर)",
    nameBn: "সিজারিয়ান ডেলিভারি (জয়পুর)",
    description: "Apex Multispeciality · ₹72,000 total with high room rent and unitemised pharmacy.",
    bill: {
      hospital: "Apex Multispeciality Hospital",
      city: "Jaipur",
      date: new Date().toISOString().split("T")[0],
      procedure: "Caesarean Section (C-Section) Delivery",
      total: 72000,
      confidence: { hospital: 0.95, city: 0.95, procedure: 0.9, total: 0.9 },
      confirmed: true,
      items: [
        { label: "Maternity Ward Bed & Nursing (4 days)", category: "bed", qty: 4, unit: "days", amount: 18000 },
        { label: "Obstetrician & Pediatrician Delivery Charges", category: "consultation", qty: 1, unit: "case", amount: 24000 },
        { label: "OT Charges & Neonatal Equipment Standby", category: "ot", qty: 1, unit: "session", amount: 12000 },
        { label: "Post-op Medications & Mother-Baby Care Pack", category: "pharmacy", qty: 1, unit: "bundle", amount: 11000 },
        { label: "Hospital Administrative & Service Charges", category: "misc", qty: 1, unit: "fee", amount: 7000 }
      ]
    }
  },
  {
    id: "cataract-lucknow",
    name: "Cataract Surgery (Lucknow)",
    nameHi: "मोतियाबिंद ऑपरेशन (लखनऊ)",
    nameBn: "ছানি অপারেশন (লখনউ)",
    description: "Divine Eye Hospital · ₹44,000 total comparing against standard CGHS/PM-JAY package benchmarks.",
    bill: {
      hospital: "Divine Eye Hospital",
      city: "Lucknow",
      date: new Date().toISOString().split("T")[0],
      procedure: "Cataract Surgery with Foldable IOL",
      total: 44000,
      confidence: { hospital: 0.95, city: 0.95, procedure: 0.9, total: 0.9 },
      confirmed: true,
      items: [
        { label: "Hydrophobic Foldable Intraocular Lens (IOL)", category: "ot", qty: 1, unit: "unit", amount: 22000 },
        { label: "Ophthalmic Surgeon & OT Facility Fee", category: "consultation", qty: 1, unit: "case", amount: 14000 },
        { label: "Pre-Operative Diagnostics, A-Scan & Biometry", category: "diagnostics", qty: 1, unit: "investigation", amount: 4000 },
        { label: "Day Care Hospital Hospitality & Service Fee", category: "misc", qty: 1, unit: "fee", amount: 4000 }
      ]
    }
  }
];
