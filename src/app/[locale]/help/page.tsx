"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Phone,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Lock
} from "lucide-react";
import { deleteAllCropCases } from "@/lib/storage/crop-cases";
import { deleteAllMediCases } from "@/lib/storage/medi-cases";
import { deleteAllSurakshaCases } from "@/lib/storage/suraksha-cases";
import { deleteAllFasalCases } from "@/lib/storage/fasal-cases";

export default function HelpPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";
  const [wiping, setWiping] = useState(false);
  const [wiped, setWiped] = useState(false);

  const handleWipeData = async () => {
    const confirmText =
      locale === "hi"
        ? "क्या आप अपने इस ब्राउज़र से सभी सहेजे गए कृषि, अस्पताल बिल, सुरक्षा जांच और फसल बीमा रिकॉर्ड हमेशा के लिए हटाना चाहते हैं?"
        : locale === "bn"
        ? "আপনি কি এই ব্রাউজারে সংরক্ষিত সমস্ত তথ্য মুছে ফেলতে চান?"
        : "Permanently wipe all locally saved case records, letters, and evidence logs from this browser?";

    if (!window.confirm(confirmText)) return;

    setWiping(true);
    try {
      await Promise.all([
        deleteAllCropCases(),
        deleteAllMediCases(),
        deleteAllSurakshaCases(),
        deleteAllFasalCases()
      ]);
      setWiped(true);
      setTimeout(() => setWiped(false), 4000);
    } catch {
      // Ignored
    } finally {
      setWiping(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nil/10 text-nil text-xs font-bold uppercase tracking-wider">
            <span>🛡️ Civic Safety, Redressal & Privacy</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl text-ink font-bold">
            {locale === "hi"
              ? "सहायता, आधिकारिक नियम एवं सुरक्षा नीति"
              : locale === "bn"
              ? "সহায়তা, সরকারি বিধি ও সুরক্ষা নীতি"
              : "Help, Grievance Directory & Data Privacy"}
          </h1>
          <p className="text-sm sm:text-base text-ink-soft max-w-2xl leading-relaxed">
            {locale === "hi"
              ? "ग्रामरक्षा एआई कैसे आपकी गोपनीयता की रक्षा करता है, आपातकालीन हेल्पलाइन और आधिकारिक निवारण तंत्र।"
              : locale === "bn"
              ? "গ্রামরক্ষা এআই কীভাবে আপনার গোপনীয়তা রক্ষা করে এবং সরকারি অভিযোগ প্রতিকার ব্যবস্থার তথ্য।"
              : "How GramRaksha AI protects your privacy, verified national emergency contacts, and official grievance escalation channels."}
          </p>
        </div>

        {/* Emergencies Directory */}
        <section className="bg-paper-2 border-[1.5px] border-ink/20 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta text-paper flex items-center justify-center font-bold text-lg shadow-2xs">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-ink font-bold">
                {locale === "hi" ? "राष्ट्रीय 24x7 निःशुल्क हेल्पलाइन" : locale === "bn" ? "জাতীয় ২৪x৭ বিনামূল্যে হেল্পলাইন" : "National 24x7 Verified Lifelines"}
              </h2>
              <p className="text-xs text-ink-soft">Tap to call directly from your phone</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-terracotta transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-terracotta">National Emergency Response</div>
                <div className="text-[11px] text-ink-soft">Police, Fire & Disaster (All States)</div>
              </div>
              <span className="font-mono text-base font-bold text-terracotta">📞 112</span>
            </a>

            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-emerald-700 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-emerald-700">Ambulance & Medical Emergency</div>
                <div className="text-[11px] text-ink-soft">Free hospital transport across India</div>
              </div>
              <span className="font-mono text-base font-bold text-emerald-700">📞 108</span>
            </a>

            <a
              href="tel:14447"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-amber-700 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-amber-700">PMFBY Crop Insurance Toll-Free</div>
                <div className="text-[11px] text-ink-soft">Report hail/flood loss within 72 hours</div>
              </div>
              <span className="font-mono text-base font-bold text-amber-700">📞 14447</span>
            </a>

            <a
              href="tel:14555"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-nil transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-nil">Ayushman PM-JAY Call Centre</div>
                <div className="text-[11px] text-ink-soft">Cashless deposit refusal & complaints</div>
              </div>
              <span className="font-mono text-base font-bold text-nil">📞 14555</span>
            </a>

            <a
              href="tel:1930"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-rose-700 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-rose-700">Cyber Crime Financial Fraud</div>
                <div className="text-[11px] text-ink-soft">Bank OTP & fraudulent APK scams</div>
              </div>
              <span className="font-mono text-base font-bold text-rose-700">📞 1930</span>
            </a>

            <a
              href="tel:18001801551"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-moss transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-moss-deep">Kisan Call Centre (KCC)</div>
                <div className="text-[11px] text-ink-soft">Agronomist advice in local languages</div>
              </div>
              <span className="font-mono text-base font-bold text-moss-deep">📞 1800-180-1551</span>
            </a>

            <a
              href="tel:15100"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-purple-700 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-purple-700">NALSA Free Legal Aid</div>
                <div className="text-[11px] text-ink-soft">Legal counsel for poor citizens & farmers</div>
              </div>
              <span className="font-mono text-base font-bold text-purple-700">📞 15100</span>
            </a>

            <a
              href="tel:1915"
              className="p-4 rounded-2xl bg-paper border border-ink/15 hover:border-blue-700 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-ink group-hover:text-blue-700">National Consumer Helpline</div>
                <div className="text-[11px] text-ink-soft">Unfair commercial billing & hospital disputes</div>
              </div>
              <span className="font-mono text-base font-bold text-blue-700">📞 1915</span>
            </a>
          </div>
        </section>

        {/* What We Do & What We Never Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What We Guarantee */}
          <div className="bg-paper-2 border border-moss/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2.5 text-moss-deep font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-moss" />
              <span>What We Guarantee</span>
            </div>
            <ul className="space-y-3 text-xs text-ink leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-moss font-bold">✓</span>
                <span><strong>Every Claim is Grounded:</strong> Every statement links directly to an active government portal (.gov.in), ICAR advisory, or high court ruling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-moss font-bold">✓</span>
                <span><strong>Plain Vernacular Language:</strong> Complex legal clauses (like Clause 8.2 or Section 15.3) are translated into straightforward guidance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-moss font-bold">✓</span>
                <span><strong>Actionable Formal Letters:</strong> Ready-to-print representations for Medical Superintendents and District Agriculture Officers.</span>
              </li>
            </ul>
          </div>

          {/* What We Strictly Never Do */}
          <div className="bg-paper-2 border border-terracotta/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2.5 text-terracotta font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-terracotta" />
              <span>What We Strictly Never Do</span>
            </div>
            <ul className="space-y-3 text-xs text-ink leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">&times;</span>
                <span><strong>No Synthetic Disease Diagnosis:</strong> We never pretend to diagnose plant fungal blights or human illnesses. We refer you to KVKs and licensed doctors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">&times;</span>
                <span><strong>No Chemical Prescriptions:</strong> We never recommend pesticide dosages that could damage soil or violate food safety laws.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta font-bold">&times;</span>
                <span><strong>No Defamatory Verdicts:</strong> We never declare a hospital guilty of fraud. We neutrally check empanelment lists and cited CGHS package caps.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Privacy & Wiping */}
        <section className="bg-paper-2 border-[1.5px] border-ink/20 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-nil text-paper flex items-center justify-center font-bold text-lg shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-ink font-bold">
                {locale === "hi" ? "डेटा गोपनीयता एवं स्थानीय नियंत्रण" : locale === "bn" ? "তথ্য গোপনীয়তা ও ডিভাইস নিয়ন্ত্রণ" : "Data Privacy & Local Control"}
              </h2>
              <p className="text-xs text-ink-soft">
                Digital Personal Data Protection Act (DPDP) 2023 Principles
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-ink-soft leading-relaxed">
            <p>
              GramRaksha AI operates on a <strong>zero-cloud storage model</strong> for citizen identity. All bill photos are redacted inside your browser before search query planning. Your saved cases, drafted letters, and geotagged crop photos are stored solely inside your browser&apos;s IndexedDB.
            </p>
            <p>
              When querying SerpApi, only public search terms (such as the hospital name, city, procedure, or crop name) are transmitted. No personal identifiers or phone numbers are ever shared.
            </p>
          </div>

          <div className="pt-4 border-t border-ink/15 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xs text-ink">Erase All Device Data</div>
              <div className="text-[11px] text-ink-soft">Permanently clear crop briefs, hospital cases, and fraud checks</div>
            </div>

            <button
              type="button"
              onClick={handleWipeData}
              disabled={wiping}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                wiped
                  ? "bg-emerald-600 text-white"
                  : "bg-terracotta/10 text-terracotta border border-terracotta/30 hover:bg-terracotta hover:text-paper"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{wiped ? "✓ All Data Erased" : wiping ? "Erasing..." : "Wipe All My Data"}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
