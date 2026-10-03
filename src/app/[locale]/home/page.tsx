"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sprout, ShieldCheck, FileSearch, Timer, IdCard, HeartPulse } from "lucide-react";
import { EmergencyModal } from "@/components/shared/EmergencyModal";

export default function HomeTabPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<number>(0);

  useEffect(() => {
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
  }, []);

  const scenarios = [
    {
      id: "medi",
      badge: "🏥 MediShield Scenario",
      titleEn: "Hospital Demanding ₹20,000 Advance Cash Deposit",
      titleHi: "अस्पताल द्वारा आयुष्मान मरीज से ₹20,000 अग्रिम जमा की मांग",
      titleBn: "আয়ুষ্মান রোগীর থেকে হাসপাতালের ২০,০০০ টাকা অগ্রিম দাবির ঘটনা",
      contextEn: "A private empanelled hospital in Varanasi demands ₹20,000 upfront before allotting an emergency C-section bed.",
      contextHi: "वाराणसी का एक सूचीबद्ध निजी अस्पताल सी-सेक्शन सर्जरी से पहले ₹20,000 नकद जमा की मांग करता है।",
      contextBn: "বারাণসীর একটি তালিকাভুক্ত হাসপাতাল জরুরি প্রসবের আগে ২০,০০০ টাকা অগ্রিম নগদ দাবি করছে।",
      solutionEn: "MediShield verifies hospital empanelment, invokes NHA Clause 8.2 (100% cashless mandate), generates an official Medical Superintendent representation, and maps the 4-tier escalation ladder.",
      solutionHi: "मेडीशील्ड अस्पताल के पैनल की जांच करता है, एनएचए क्लॉज 8.2 लागू करता है और एमएस को कानूनी नोटिस तैयार करता है।",
      solutionBn: "মেডিশিল্ড হাসপাতালের তালিকাভুক্তির তথ্য যাচাই করে, এনএইচএ ক্লজ ৮.২ প্রয়োগ করে এবং সুপারের কাছে আইনি নোটিশ তৈরি করে।",
      ctaEn: "Test Ayushman Shield",
      ctaHi: "आयुष्मान शील्ड परखें",
      ctaBn: "আয়ুষ্মান শিল্ড পরীক্ষা করুন",
      href: `/${locale}/medi`,
      accent: "border-nil/40 bg-nil/5 text-nil",
      buttonColor: "bg-nil hover:bg-nil/90 text-paper"
    },
    {
      id: "suraksha",
      badge: "🛡️ Suraksha Check Scenario",
      titleEn: "Suspicious 'PM Kisan Yojana' APK Forward on WhatsApp",
      titleHi: "व्हाट्सएप पर 'पीएम किसान योजना' की संदिग्ध एपीके फाइल",
      titleBn: "হোয়াটসঅ্যাপে 'পিএম কিসান যোজনা'র সন্দেহজনক ক্ষতিকর অ্যাপ",
      contextEn: "A farmer receives a WhatsApp forward claiming ₹6,000 bonus installment with a direct .apk download link asking for OTP and permissions.",
      contextHi: "किसान को व्हाट्सएप पर ₹6,000 किस्त के नाम पर .apk डाउनलोड लिंक और ओटीपी मांगने वाला संदेश मिला।",
      contextBn: "একজন কৃষক হোয়াটসঅ্যাপে ₹৬,০০০ কিস্তির নাম করে .apk অ্যাপ ডাউনলোড ও ওটিপি চাওয়ার মেসেজ পেয়েছেন।",
      solutionEn: "Suraksha Check inspects the text, flags the off-market APK hazard, cites official Nagaland Police advisories, and provides 1-tap reporting via DoT Chakshu on Sanchar Saathi.",
      solutionHi: "सुरक्षा जांच संदेश का विश्लेषण करती है, अनधिकृत ऐप खतरे की पुष्टि करती है और चक्षु पर रिपोर्ट कराती है।",
      solutionBn: "সুরক্ষা চেক বার্তাটি যাচাই করে ক্ষতিকর অ্যাপের ঝুঁকি শনাক্ত করে এবং চক্ষু পোর্টালে সরাসরি रिपोर्ट করে।",
      ctaEn: "Test Suraksha Check",
      ctaHi: "सुरक्षा जांच परखें",
      ctaBn: "সুরক্ষা চেক পরীক্ষা করুন",
      href: `/${locale}/suraksha`,
      accent: "border-terracotta/40 bg-terracotta/5 text-terracotta",
      buttonColor: "bg-terracotta hover:bg-terracotta/90 text-paper"
    },
    {
      id: "fasal",
      badge: "⏱️ Fasal 72h Scenario",
      titleEn: "Sudden Hailstorm Damage to Mustard & Wheat Fields",
      titleHi: "ओलावृष्टि से सरसों एवं गेहूं की फसल को गंभीर नुकसान",
      titleBn: "শিলাবৃষ্টিতে সর্ষে ও গম ফসলের ব্যাপক ক্ষয়ক্ষতি",
      contextEn: "A farmer suffers 75% crop devastation after hailstorms in Bharatpur. Claim rejection occurs if intimation is not filed within 72 hours under PMFBY Clause 15.3.",
      contextHi: "भरतपुर में ओलावृष्टि से 75% फसल नष्ट। 72 घंटे में सूचना न देने पर बीमा दावा निरस्त हो जाता है।",
      contextBn: "ভরতপুরে শিলাবৃষ্টিতে ৭৫% ফসল নষ্ট। পিএমএফবিওয়াই নিয়ম অনুযায়ী ৭২ ঘণ্টার মধ্যে নোটিশ না দিলে দাবি খারিজ হয়।",
      solutionEn: "Fasal 72h starts the statutory countdown timer, catalogs timestamped damage photos on-device, connects to 14447 helpline, and auto-drafts the DAO intimation letter.",
      solutionHi: "फसल 72h उलटी गिनती शुरू करता है, समय-मुद्रित फोटो सहेजता है और कृषि अधिकारी को पत्र तैयार करता है।",
      solutionBn: "ফসল ৭২h টাইমার চালু করে, সময়চিহ্নিত ছবি সংরক্ষণ করে এবং জেলা কৃষি আধিকারিককে চিঠি তৈরি করে।",
      ctaEn: "Open 72h Calamity Kit",
      ctaHi: "72h फसल किट खोलें",
      ctaBn: "৭২h ফসল কিট খুলুন",
      href: `/${locale}/fasal`,
      accent: "border-amber-500/40 bg-amber-500/5 text-amber-800",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-paper"
    },
    {
      id: "krishi",
      badge: "🌾 KrishiSahay Scenario",
      titleEn: "Leaf Blight on Paddy Crop & APMC Price Slump",
      titleHi: "धान की फसल पर पत्ती झुलसा रोग एवं स्थानीय मंडी भाव",
      titleBn: "ধান ফসলে পাতা পোড়া রোগ এবং স্থানীয় মান্ডি দর",
      contextEn: "A farmer in Burdwan notices widespread yellow leaf spotting during the vegetative stage and needs verified KVK management practices.",
      contextHi: "बर्धमान के किसान ने धान में पीले धब्बे देखे और कृषि विज्ञान केंद्र की प्रामाणिक सलाह जानना चाहता है।",
      contextBn: "বর্ধমান জেলার কৃষক ধানে হলুদ দাগ দেখতে পেয়েছেন এবং কেভিকে-র সঠিক পরামর্শ চাইছেন।",
      solutionEn: "KrishiSahay fetches ICAR and local KVK Burdwan advisories without prescribing dangerous chemical dosages, along with live APMC mandi prices.",
      solutionHi: "कृषिसहाय बिना किसी दवा नुस्खे के आईसीएआर और केवीके की प्रामाणिक सलाह तथा मंडी भाव दिखाता है।",
      solutionBn: "কৃষিসহায় কোনো ক্ষতিকর কীটনাশকের অযাচিত সুপারিশ ছাড়া সরকারি কৃষি বিজ্ঞান কেন্দ্রের পরামর্শ দেখায়।",
      ctaEn: "Search Crop Advisory",
      ctaHi: "फसल सलाह खोजें",
      ctaBn: "ফসলের পরামর্শ খুঁজুন",
      href: `/${locale}/krishi`,
      accent: "border-moss/40 bg-moss/5 text-moss-deep",
      buttonColor: "bg-moss hover:bg-moss-deep text-paper"
    },
    {
      id: "card",
      badge: "📇 Pocket Card Scenario",
      titleEn: "Remote Field Emergency With Zero Cellular Connectivity",
      titleHi: "सुदूर खेत या रात्रि में मोबाइल नेटवर्क शून्य होने पर आपातकाल",
      titleBn: "প্রত্যন্ত গ্রামে মোবাইল নেটওয়ার্ক ও ইন্টারনেট না থাকা অবস্থায় জরুরি পরিস্থিতি",
      contextEn: "A villager in an interior hamlet experiences sudden acute medical illness at 2 AM with dead cellular data and zero mobile network connectivity.",
      contextHi: "सुदूर गांव में रात 2 बजे अचानक गंभीर स्वास्थ्य संकट और फोन में इंटरनेट या मोबाइल नेटवर्क पूरी तरह ठप।",
      contextBn: "প্রত্যন্ত অঞ্চলে রাত ২টায় হঠাৎ তীব্র শারীরিক অসুস্থতা, কিন্তু ফোনে ইন্টারনেট বা মোবাইল নেটওয়ার্ক সম্পূর্ণ বিচ্ছিন্ন।",
      solutionEn: "Pre-printed CR80 Pocket Card provides verified local PHC, Thana beat officer numbers, and 1-tap offline vCard contacts without requiring a live web connection.",
      solutionHi: "पहले से प्रिंट किया गया पॉकेट कार्ड बिना इंटरनेट के निकटतम पीएचसी, थाना प्रभारी और आपातकालीन नंबर तुरंत उपलब्ध कराता है।",
      solutionBn: "আগে থেকেই প্রিন্ট করা পকেট কার্ড ইন্টারনেট সংযোগ ছাড়াই নিকটতম স্বাস্থ্য केंद्र ও থানার জরুরি নম্বর তাৎক্ষণিক প্রদান করে।",
      ctaEn: "Generate Pocket Card",
      ctaHi: "पॉकेट कार्ड बनाएं",
      ctaBn: "পকেট কার্ড তৈরি করুন",
      href: `/${locale}/card`,
      accent: "border-indigo-500/40 bg-indigo-500/5 text-indigo-900",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700 text-paper"
    },
    {
      id: "pashu",
      badge: "🐄 PashuSahay Scenario",
      titleEn: "Acute Bloat (Tympany) & Fever in Milking Cattle",
      titleHi: "दुधारू गाय में अचानक तेज अफरा (पेट में गैस) एवं बुखार",
      titleBn: "দুধেল গাভীর পেটে তীব্র গ্যাস জমা ও জ্বরের জরুরি অবস্থা",
      contextEn: "A farmer's cow develops acute left flank bloat with labored breathing and froth after grazing on young clover, requiring instant emergency home first aid.",
      contextHi: "बरसीम चरने के बाद गाय का बायां पेट तेजी से फूल गया, सांस फूल रही है और तुरंत आपातकालीन प्राथमिक उपचार की जरूरत है।",
      contextBn: "কচি ঘাস খাওয়ার পর গাভীর পেটের বাম দিক ফুলে উঠেছে, শ্বাসকষ্ট হচ্ছে এবং তাৎক্ষণিক জরুরি প্রাথমিক চিকিৎসা প্রয়োজন।",
      solutionEn: "PashuSahay provides immediate step-by-step home remedies (mustard oil + ginger + hing), warns strictly against fatal quack stomach punctures, maps nearby Government Veterinary Hospitals on Google Maps, and dials 1962 Animal Ambulance.",
      solutionHi: "पशुसहाय सरसों तेल-अदरक-हींग का घरेलू उपचार बताता है, तार या चाकू से पेट में छेद करने की सख्त चेतावनी देता है और 1962 एम्बुलेंस बुलाता है।",
      solutionBn: "পশুসহায় খাঁটি সরিষার তেল ও আদার নিরাপদ মিশ্রণের তাৎক্ষণিক পরামর্শ দেয়, ক্ষতিকর ফুটো করার বিরুদ্ধে কঠোর সতর্কতা জারি করে এবং ১৯ba২ অ্যাম্বুলেন্স ডাকে।",
      ctaEn: "Get Animal Care",
      ctaHi: "पशु उपचार देखें",
      ctaBn: "পশু চিকিৎসা দেখুন",
      href: `/${locale}/pashu`,
      accent: "border-amber-600/40 bg-amber-600/5 text-amber-900",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-paper"
    }
  ];

  return (
    <div className="relative w-full overflow-x-hidden pb-20">
      <section className="relative pt-12 md:pt-16 pb-12 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl text-ink font-bold leading-[1.12] tracking-tight"
          >
            {locale === "hi" ? (
              <>
                कृषि, स्वास्थ्य एवं साइबर सुरक्षा में <br className="hidden sm:block" />
                <span className="text-moss-deep">साक्ष्य जिस पर आप भरोसा कर सकें।</span>
              </>
            ) : locale === "bn" ? (
              <>
                কৃষি, স্বাস্থ্য ও সাইবার সুরক্ষায় <br className="hidden sm:block" />
                <span className="text-moss-deep">তথ্য যার ওপর আপনি ভরসা করতে পারেন।</span>
              </>
            ) : (
              <>
                Evidence you can trust, <br className="hidden sm:block" />
                <span className="text-moss-deep">for farm, health & cyber security.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed"
          >
            {locale === "hi"
              ? "एक एकीकृत मंच। फसल आपदा सूचना (72h), आयुष्मान कैशलेस संरक्षण (क्लॉज 8.2), धोखाधड़ी संदेश जांच और प्रामाणिक कृषि सलाह — बिना किसी अप्रामाणिक दवा या कानूनी जोखिम के।"
              : locale === "bn"
              ? "একটি সমন্বিত নাগরিক সমাধান। ফসলের বিপর্যয় নোটিশ (৭২h), আয়ুষ্মান ক্যাশলেস সুরক্ষা (ক্লজ ৮.২), ক্ষতিকর সাইবার মেসেজ যাচাই ও নির্ভরযোগ্য কৃষি তথ্য।"
              : "One unified public-interest platform. Statutory crop calamity intimations (72h), Ayushman cashless admission shield (Clause 8.2), cyber scam audits, and verified KVK agriculture intel."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs max-w-2xl mx-auto"
          >
            <span className="text-ink-soft font-semibold hidden sm:inline">24x7 Helplines:</span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border-[1.5px] border-ink text-ink font-bold transition-all shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <span>Emergency</span>
              <span className="font-mono text-ink">112</span>
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border-[1.5px] border-ink text-ink font-bold transition-all shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <span>Ambulance</span>
              <span className="font-mono text-ink">108</span>
            </a>
            <a
              href="tel:14447"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border-[1.5px] border-ink text-ink font-bold transition-all shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <span>Fasal Bima</span>
              <span className="font-mono text-ink">14447</span>
            </a>
            <a
              href="tel:14555"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border-[1.5px] border-ink text-ink font-bold transition-all shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <span>Ayushman</span>
              <span className="font-mono text-ink">14555</span>
            </a>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border-[1.5px] border-ink text-ink font-bold transition-all shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <span>Cyber</span>
              <span className="font-mono text-ink">1930</span>
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          <Link
            href={`/${locale}/krishi`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-moss text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-moss/10 text-moss-deep border border-moss/20">
                  Agri Intel
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-moss-deep transition-colors">
                  KrishiSahay
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "फसल कीट चेतावनी, कृषि विज्ञान केंद्र सलाह एवं दैनिक मंडी भाव — बिना किसी दवा नुस्खे के।"
                    : locale === "bn"
                    ? "ফসলের রোগ সতর্কতা, কেভিকে পরামর্শ ও দৈনিক মান্ডি দর — কোনো কৃত্রিম ওষুধ সুপারিশ ছাড়া।"
                    : "Grounded KVK pest alerts, APMC mandi rates, and official video advisories without synthetic chemical claims."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-moss-deep">
              <span>{locale === "hi" ? "फसल सुरक्षा शुरू करें" : locale === "bn" ? "ফসল সুরক্ষা শুরু করুন" : "Protect a Crop"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/medi`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-nil text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-nil/10 text-nil border border-nil/20">
                  Clause 8.2
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-nil transition-colors">
                  MediShield & Ayushman
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "अस्पताल की अवैध अग्रिम जमा मांग के खिलाफ कानूनी नोटिस और सीजीएचएस दरों पर बिल समीक्षा।"
                    : locale === "bn"
                    ? "হাসপাতালের অবৈধ অগ্রিম টাকা দাবির বিরুদ্ধে আইনি নোটিশ এবং সিজিএইচএস হারে बिल নিরীক্ষা।"
                    : "Zero-deposit cashless shield under PM-JAY Clause 8.2, hospital bill audits, and statutory notices."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-nil">
              <span>{locale === "hi" ? "कैशलेस शील्ड खोलें" : locale === "bn" ? "ক্যাশলেস শিল্ড খুলুন" : "Activate Shield"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/suraksha`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-terracotta text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileSearch className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20">
                  Anti-Scam
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-terracotta transition-colors">
                  Suraksha Check
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "नकली सरकारी ऐप (APK), फर्जी लॉटरी लिंक, योजना शुल्क मांग और बिजली बिल धोखाधड़ी की जांच।"
                    : locale === "bn"
                    ? "ক্ষতিকর অ্যাপ (APK), ভুয়ো সরকারি লিঙ্ক, প্রতারণামূলক ফি দাবি এবং বিদ্যুৎ बिल হুমকির নিরীক্ষা।"
                    : "Audit suspicious WhatsApp forwards, rogue APK files, scheme fees, and electricity cutoff threats."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-terracotta">
              <span>{locale === "hi" ? "संदेश की जांच करें" : locale === "bn" ? "মেসেজ যাচাই করুন" : "Audit Message"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/fasal`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Timer className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  PMFBY 72h
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-amber-800 transition-colors">
                  Fasal 72h Kit
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "ओलावृष्टि, बाढ़ या बिजली गिरने से फसल नुकसान पर 72 घंटे का वैधानिक सूचना पत्र एवं प्रमाण संग्रह।"
                    : locale === "bn"
                    ? "শিলাবৃষ্টি বা বন্যায় ফসল ক্ষতির ৭২ ঘণ্টার মধ্যে সরকারি নোটিশ ও প্রমাণ সংগ্রহ কিট।"
                    : "Statutory 72-hour countdown timer, local timestamped photo log, 14447 dialer, and DAO letter."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-amber-800">
              <span>{locale === "hi" ? "72h रिपोर्ट बनाएं" : locale === "bn" ? "৭২h রিপোর্ট তৈরি করুন" : "Launch Kit"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/card`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <IdCard className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-900 border border-indigo-500/20">
                  Offline Card
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-indigo-900 transition-colors">
                  Pocket Card
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC), थाना, केवीके एवं विधिक सेवा का वॉलेट-साइज ऑफलाइन पॉकेट कार्ड।"
                    : locale === "bn"
                    ? "নিকটবর্তী স্বাস্থ্য কেন্দ্র (PHC), থানা, কেভিকে ও আইনি সহায়তার অফলাইন ওয়ালেট পকেট কার্ড।"
                    : "Printable CR80 wallet card with local PHC, Police Thana, KVK, and legal aid. 100% offline in IndexedDB."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-indigo-900">
              <span>{locale === "hi" ? "पॉकेट कार्ड बनाएं" : locale === "bn" ? "পকেট কার্ড তৈরি করুন" : "Generate Card"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/pashu`}
            className="group p-6 rounded-3xl bg-white/20 backdrop-blur-md border-[2px] border-ink transition-all shadow-[6px_6px_0_rgba(62,39,35,1)] hover:shadow-[2px_2px_0_rgba(62,39,35,1)] hover:translate-x-[4px] hover:translate-y-[4px] flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-700 text-paper flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-600/10 text-amber-900 border border-amber-600/20">
                  Vet Care
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink group-hover:text-amber-900 transition-colors">
                  PashuSahay
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  {locale === "hi"
                    ? "गाय, भैंस, बकरी हेतु अफरा, लंपी, थनैल का कदम-दर-कदम देशी उपचार, 1962 एम्बुलेंस व सरकारी पशु अस्पताल।"
                    : locale === "bn"
                    ? "গরু, মহিষ, ছাগলের জরুরি প্রাথমিক চিকিৎসা, কি করবেন না সতর্কতা ও ১৯ba২ পশু অ্যাম্বুলেন্স।"
                    : "Step-by-step home livestock first aid (bloat, lumpy, mastitis), quack warnings, 1962 MVU, and Google Maps vet clinics."}
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-ink/10 flex items-center justify-between mt-6 text-xs font-bold text-amber-900">
              <span>{locale === "hi" ? "पशु उपचार देखें" : locale === "bn" ? "পশুর চিকিৎসা নিন" : "Treat Livestock"}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="bg-paper-2 rounded-3xl border border-ink/15 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-ink/10 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-moss-deep">
                {locale === "hi" ? "वास्तविक ग्रामीण संकट उदाहरण" : locale === "bn" ? "বাস্তব গ্রামীণ পরিস্থিতি" : "Real Village Crisis Scenarios"}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold mt-1">
                {locale === "hi"
                  ? "ग्रामरक्षा एआई वास्तविक स्थिति में कैसे रक्षा करता है"
                  : locale === "bn"
                  ? "গ্রামরক্ষা এআই বাস্তব পরিস্থিতিতে কীভাবে রক্ষা করে"
                  : "How GramRaksha AI Steps in When Trouble Hits"}
              </h2>
            </div>
            <p className="text-xs text-ink-soft max-w-md">
              {locale === "hi"
                ? "किसी भी स्थिति पर क्लिक करके देखें कि कैसे आधिकारिक नियमों और खोज साक्ष्य से समाधान निकलता है।"
                : locale === "bn"
                ? "যেকোনো उदाहरणে ক্লিক করে দেখুন কীভাবে সরকারি नियम ও অনুসন্ধানের মাধ্যমে সুরক্ষা দেওয়া হয়।"
                : "Select any real scenario to see how official rules and grounded evidence safeguard citizens."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {scenarios.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScenario(idx)}
                className={`p-3 sm:p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  activeScenario === idx
                    ? "bg-paper border-ink shadow-sm font-bold text-ink"
                    : "border-ink/10 bg-paper-2 hover:bg-paper text-ink-soft hover:text-ink"
                }`}
              >
                <div className="text-[11px] font-bold text-ink-soft mb-1">{s.badge}</div>
                <div className="text-xs sm:text-sm font-bold line-clamp-2">
                  {locale === "hi" ? s.titleHi : locale === "bn" ? s.titleBn : s.titleEn}
                </div>
              </button>
            ))}
          </div>

          {(() => {
            const cur = scenarios[activeScenario];
            return (
              <div className="bg-paper rounded-2xl border border-ink/15 p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cur.accent}`}>
                    {cur.badge}
                  </span>
                  <Link
                    href={cur.href}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-transform hover:scale-[1.02] cursor-pointer ${cur.buttonColor}`}
                  >
                    <span>{locale === "hi" ? cur.ctaHi : locale === "bn" ? cur.ctaBn : cur.ctaEn}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-4 rounded-2xl bg-terracotta/5 border border-terracotta/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
                      <XCircle className="w-4 h-4" />
                      <span>{locale === "hi" ? "नागरिक का संकट" : locale === "bn" ? "নাগরিকের সংকট" : "The Citizen's Crisis"}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink leading-relaxed">
                      {locale === "hi" ? cur.contextHi : locale === "bn" ? cur.contextBn : cur.contextEn}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-moss/10 border border-moss/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-moss-deep">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{locale === "hi" ? "ग्रामरक्षा एआई का समाधान" : locale === "bn" ? "গ্রামরক্ষা এআই-এর সমাধান" : "GramRaksha AI Grounded Defense"}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink leading-relaxed">
                      {locale === "hi" ? cur.solutionHi : locale === "bn" ? cur.solutionBn : cur.solutionEn}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-moss-deep">
            {locale === "hi" ? "तकनीकी पारदर्शिता" : locale === "bn" ? "প্রযুক্তিগত স্বচ্ছতা" : "Verifiable Architecture"}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl text-ink font-bold">
            {locale === "hi"
              ? "बिना किसी मनगढ़ंत सलाह के आधिकारिक खोज"
              : locale === "bn"
              ? "কোনো ভুল ধারণা ছাড়া সরকারি তথ্যের অনুসন্ধান"
              : "Zero Synthetic Hallucinations. Grounded in Gazettes."}
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft">
            {locale === "hi"
              ? "हम कभी भी कृत्रिम बुद्धि से मनमाना नुस्खा नहीं बनाते। प्रत्येक निष्कर्ष आधिकारिक सरकारी डोमेन से सीधे जुड़ा होता है।"
              : locale === "bn"
              ? "আমরা কখনো মনগড়া পরামর্শ দিই না। প্রতিটি দাবি সরকারি পোর্টাল ও অফিসিয়াল তথ্যসূত্র থেকে সরাসরি যাচাই করা হয়।"
              : "We never invent synthetic dosages or legal verdicts. Every output is tied to verbatim government source citations via SerpApi."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              titleEn: "SerpApi Multi-Engine Search",
              titleHi: "सर्फएपीआई बहु-इंजन खोज",
              titleBn: "সার্ফএপিআই বহু-ইঞ্জিন অনুসন্ধান",
              descEn: "Dispatches live targeted queries across Google Search, Maps, Play Store, and Google Trends for regional signals."
            },
            {
              step: "02",
              titleEn: "Institutional Allowlist",
              titleHi: "आधिकारिक संस्थान फिल्टर",
              titleBn: "সরকারি সংস্থা ফিল্টার",
              descEn: "Strictly filters results prioritizing .gov.in, .nic.in, icar.org.in, State Health Agencies, and High Court judgments."
            },
            {
              step: "03",
              titleEn: "Public-Interest Safety Linter",
              titleHi: "नागरिक सुरक्षा लिंटर",
              titleBn: "জনস্বার্থ সুরক্ষা লিন্টার",
              descEn: "Blocks synthetic medical prescriptions, unverified pesticide claims, and ungrounded accusations of hospital fraud."
            },
            {
              step: "04",
              titleEn: "100% On-Device Storage",
              titleHi: "पूर्णतः स्थानीय डिवाइस संग्रह",
              titleBn: "সম্পূর্ণ অন-ডিভাইস স্টোরেজ",
              descEn: "All case records, letters, and evidence logs reside only in your browser's IndexedDB. Zero cloud profiling."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-paper-2 rounded-3xl border border-ink/15 p-6 space-y-4 hover:border-nil/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-paper border border-ink/20 flex items-center justify-center font-mono font-bold text-sm text-ink shadow-2xs">
                {item.step}
              </div>
              <h3 className="font-display font-bold text-base text-ink">
                {locale === "hi" ? item.titleHi : locale === "bn" ? item.titleBn : item.titleEn}
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">{item.descEn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 px-6 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="bg-paper-2 rounded-3xl border border-ink/15 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-moss-deep">
              {locale === "hi" ? "पारंपरिक खोज बनाम ग्रामरक्षा एआई" : locale === "bn" ? "সাধারণ অনুসন্ধান বনাম গ্রামরক্ষা এআই" : "The Core Difference"}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold">
              {locale === "hi" ? "साधारण वेब खोज क्यों विफल हो जाती है" : locale === "bn" ? "সাধারণ ওয়েব সার্চ কেন ব্যর্থ হয়" : "Why Generic Web Searches Fail Farmers"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-paper border border-terracotta/20 space-y-4">
              <div className="flex items-center gap-2 text-terracotta font-bold text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>Ordinary Commercial Search Engines</span>
              </div>
              <ul className="space-y-3 text-xs text-ink-soft">
                <li className="flex items-start gap-2">
                  <span className="text-terracotta font-bold">&times;</span>
                  <span>Shows commercial sponsored ads and outdated blog posts from 2018.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta font-bold">&times;</span>
                  <span>Suggests risky unverified pesticide chemicals that can destroy soil or cause crop rejection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta font-bold">&times;</span>
                  <span>Does not know state-specific Ayushman MoUs or PMFBY 72-hour statutory deadlines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta font-bold">&times;</span>
                  <span>Uploads sensitive bills and documents to external cloud profiling servers.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-moss/30 space-y-4">
              <div className="flex items-center gap-2 text-moss-deep font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-moss" />
                <span>GramRaksha AI Grounded Defense</span>
              </div>
              <ul className="space-y-3 text-xs text-ink">
                <li className="flex items-start gap-2">
                  <span className="text-moss font-bold">✓</span>
                  <span>Scans official portals (.gov.in, ICAR, KVK, PM-JAY, PMFBY) with dated citations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss font-bold">✓</span>
                  <span>Strict zero-diagnosis rule: refers to agricultural scientists, never prescribes chemicals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss font-bold">✓</span>
                  <span>Applies statutory clauses (Clause 8.2 zero deposit, Section 15.3 72h notice) with ready formal letters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-moss font-bold">✓</span>
                  <span>100% on-device private processing with client-side redaction and zero tracking.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        locale={locale}
      />
    </div>
  );
}
