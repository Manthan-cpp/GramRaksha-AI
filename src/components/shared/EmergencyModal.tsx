"use client";

import { X, Phone, ShieldAlert, HeartPulse, Leaf, Shield, Scale, HelpCircle } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

interface HelplineItem {
  number: string;
  nameEn: string;
  nameHi: string;
  nameBn: string;
  descEn: string;
  descHi: string;
  descBn: string;
  icon: typeof Phone;
  color: string;
  bg: string;
}

const HELPLINES: HelplineItem[] = [
  {
    number: "112",
    nameEn: "National Emergency Response (All-in-One)",
    nameHi: "राष्ट्रीय आपातकालीन प्रतिक्रिया (सभी सेवाएं)",
    nameBn: "জাতীয় জরুরি সহায়তা (সব পরিষেবা)",
    descEn: "24x7 unified emergency for Police, Fire, and Disaster management.",
    descHi: "पुलिस, अग्निशमन और आपदा प्रबंधन के लिए 24x7 संयुक्त सेवा।",
    descBn: "পুলিশ, দমকল এবং দুর্যোগ ব্যবস্থাপনার জন্য ২৪x৭ যৌথ সহায়তা।",
    icon: ShieldAlert,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200"
  },
  {
    number: "108",
    nameEn: "Ambulance & Emergency Medical Care",
    nameHi: "एम्बुलेंस एवं आपातकालीन चिकित्सा",
    nameBn: "অ্যাম্বুলেন্স ও জরুরি চিকিৎসা",
    descEn: "Free emergency hospital transport and acute patient care across all states.",
    descHi: "सभी राज्यों में निःशुल्क आपातकालीन अस्पताल परिवहन एवं मरीज सेवा।",
    descBn: "সমস্ত রাজ্যে বিনামূল্যে জরুরি হাসপাতাল পরিবহন ও রোগী সেবা।",
    icon: HeartPulse,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200"
  },
  {
    number: "14447",
    nameEn: "PMFBY Crop Insurance Calamity Helpline",
    nameHi: "प्रधानमंत्री फसल बीमा योजना आपदा हेल्पलाइन",
    nameBn: "পিএমএফবিওয়াই ফসল বিমা বিপর্যয় হেল্পলাইন",
    descEn: "Report hailstorm, flood or localized calamity loss within 72 hours.",
    descHi: "ओलावृष्टि, बाढ़ या स्थानीय आपदा नुकसान की सूचना 72 घंटे के भीतर दें।",
    descBn: "শিলাবৃষ্টি, বন্যা বা ফসল ক্ষতির তথ্য ৭২ ঘণ্টার মধ্যে জানান।",
    icon: Leaf,
    color: "text-amber-800",
    bg: "bg-amber-50 border-amber-200"
  },
  {
    number: "14555",
    nameEn: "Ayushman Bharat PM-JAY Call Centre",
    nameHi: "आयुष्मान भारत पीएम-जय कॉल सेंटर",
    nameBn: "আয়ুষ্মান ভারত পিএম-জে কল সেন্টার",
    descEn: "Report advance deposit demands, card activation issues, and hospital refusal.",
    descHi: "अस्पताल द्वारा अग्रिम जमा मांग, कार्ड समस्या या इलाज से मना करने की शिकायत करें।",
    descBn: "হাসপাতালে অগ্রিম টাকা দাবি বা চিকিৎসার অস্বীকৃতির বিরুদ্ধে অভিযোগ জানান।",
    icon: Shield,
    color: "text-blue-800",
    bg: "bg-blue-50 border-blue-200"
  },
  {
    number: "1930",
    nameEn: "Cyber Crime Financial Fraud Helpline",
    nameHi: "साइबर वित्तीय धोखाधड़ी हेल्पलाइन",
    nameBn: "সাইবার আর্থিক জালিয়াতি হেল্পলাইন",
    descEn: "Immediate reporting for unauthorized bank debits, OTP fraud, and fake APKs.",
    descHi: "अवैध बैंक कटौती, ओटीपी धोखाधड़ी या नकली ऐप की तुरंत रिपोर्ट दर्ज कराएं।",
    descBn: "অবৈধ ব্যাংক লেনদেন, ওটিপি জালিয়াতি বা ক্ষতিকর অ্যাপের বিরুদ্ধে রিপোর্ট করুন।",
    icon: ShieldAlert,
    color: "text-rose-800",
    bg: "bg-rose-50 border-rose-200"
  },
  {
    number: "1800-180-1551",
    nameEn: "Kisan Call Centre (KCC Advisory)",
    nameHi: "किसान कॉल सेंटर (कृषि विशेषज्ञ सलाह)",
    nameBn: "কিসান কল সেন্টার (কৃষি বিশেষজ্ঞ পরামর্শ)",
    descEn: "Free official agronomy and weather advisory in your local language (6 AM - 10 PM).",
    descHi: "अपनी स्थानीय भाषा में कृषि विशेषज्ञों से निःशुल्क आधिकारिक सलाह (सुबह 6 से रात 10)।",
    descBn: "স্থানীয় ভাষায় কৃষি বিশেষজ্ঞদের থেকে বিনামূল্যে সরকারি পরামর্শ (সকাল ৬ - রাত ১০)।",
    icon: HelpCircle,
    color: "text-moss-deep",
    bg: "bg-moss/10 border-moss/20"
  },
  {
    number: "15100",
    nameEn: "NALSA Free Legal Aid Helpline",
    nameHi: "नालसा निःशुल्क कानूनी सहायता हेल्पलाइन",
    nameBn: "নালসা বিনামূল্যে আইনি সহায়তা হেল্পলাইন",
    descEn: "Free legal representation and counsel for farmers and marginalized citizens.",
    descHi: "किसानों और कमजोर वर्ग के नागरिकों के लिए निःशुल्क विधिक सलाह एवं वकील।",
    descBn: "কৃষক ও সুবিধাবঞ্চিত নাগরিকদের জন্য বিনামূল্যে আইনি পরামর্শ ও সহায়তা।",
    icon: Scale,
    color: "text-purple-800",
    bg: "bg-purple-50 border-purple-200"
  }
];

export function EmergencyModal({ isOpen, onClose, locale = "en" }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-paper rounded-3xl shadow-2xl border border-ink/20 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-dialog-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-ink/15 bg-paper-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center text-xl shrink-0 font-bold">
              🚨
            </span>
            <div>
              <h2 id="emergency-dialog-title" className="font-display text-xl sm:text-2xl text-ink font-bold">
                {locale === "hi"
                  ? "राष्ट्रीय आपातकालीन एवं नागरिक सहायता हेल्पलाइन"
                  : locale === "bn"
                  ? "জাতীয় জরুরি ও নাগরিক সহায়তা হেল্পলাইন"
                  : "National Emergency & Citizen Lifelines"}
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                {locale === "hi"
                  ? "भारत सरकार की 24x7 निःशुल्क आधिकारिक हेल्पलाइन — सीधे डायल करें"
                  : locale === "bn"
                  ? "ভারত সরকারের ২৪x৭ বিনামূল্যে সরকারি হেল্পলাইন — সরাসরি কল করুন"
                  : "Government of India 24x7 verified toll-free lifelines — tap to dial directly"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-ink/15 bg-paper hover:bg-paper-2 flex items-center justify-center text-ink-soft hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Helplines List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          {HELPLINES.map((h) => {
            const Icon = h.icon;
            const title = locale === "hi" ? h.nameHi : locale === "bn" ? h.nameBn : h.nameEn;
            const desc = locale === "hi" ? h.descHi : locale === "bn" ? h.descBn : h.descEn;

            return (
              <a
                key={h.number}
                href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border ${h.bg} hover:shadow-md transition-all group cursor-pointer`}
              >
                <div className="flex items-start gap-3.5 min-w-0 pr-3">
                  <div className={`w-9 h-9 rounded-xl bg-paper flex items-center justify-center ${h.color} shrink-0 shadow-2xs mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm text-ink group-hover:text-nil transition-colors truncate">
                        {title}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold bg-paper border border-ink/15 ${h.color} group-hover:scale-105 transition-transform shadow-2xs`}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>{h.number}</span>
                  </span>
                  <div className="text-[10px] text-ink-soft font-semibold mt-1">
                    {locale === "hi" ? "कॉल करने के लिए टैप करें" : locale === "bn" ? "কল করতে ট্যাপ করুন" : "Tap to Call"}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink/15 bg-paper-2 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
          <span>🛡️ Verified directly against Government of India directories.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-nil text-paper font-semibold hover:bg-nil/90 transition-colors cursor-pointer text-xs"
          >
            {locale === "hi" ? "बंद करें" : locale === "bn" ? "বন্ধ করুন" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
