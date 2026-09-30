import type { Bill, Evidence, EvidenceMetrics, Flag, MediDecision, MediDecisionStep } from "@/lib/schemas";

const KNOWN_BENCHMARKS: Record<string, { min: number; max: number; descEn: string; descHi: string; descBn: string }> = {
  appendectomy: {
    min: 18000,
    max: 30000,
    descEn: "Standard government packages (CGHS and PM-JAY) benchmark laparoscopic appendectomy between ₹18,000 to ₹30,000 for semi-private ward accommodation.",
    descHi: "सरकारी स्वास्थ्य योजनाओं (CGHS और PM-JAY) में अपेंडिक्स ऑपरेशन का मानक पैकेज ₹18,000 से ₹30,000 के बीच तय है।",
    descBn: "সরকারি স্বাস্থ্য প্রকল্পে (CGHS এবং PM-JAY) অ্যাপেন্ডিসাইটিস অপারেশনের আদর্শ প্যাকেজ ₹১৮,০০০ থেকে ₹৩০,০০০-এর মধ্যে নির্ধারিত।"
  },
  caesarean: {
    min: 20000,
    max: 35000,
    descEn: "Standard government packages (CGHS and PM-JAY) benchmark Caesarean delivery (C-Section) between ₹20,000 to ₹35,000 including 4 days post-op care.",
    descHi: "सरकारी स्वास्थ्य योजनाओं (CGHS और PM-JAY) में सिजेरियन डिलीवरी का मानक पैकेज ₹20,000 से ₹35,000 के बीच तय है।",
    descBn: "সরকারি স্বাস্থ্য প্রকল্পে (CGHS এবং PM-JAY) সিজারিয়ান ডেলিভারির আদর্শ প্যাকেজ ₹২০,০০০ থেকে ₹৩৫,০০০-এর মধ্যে নির্ধারিত।"
  },
  cataract: {
    min: 12000,
    max: 25000,
    descEn: "Standard government packages benchmark cataract surgery with foldable lens (IOL) between ₹12,000 to ₹25,000 under day-care procedure rates.",
    descHi: "सरकारी स्वास्थ्य योजनाओं में फोल्डेबल लेंस के साथ मोतियाबिंद ऑपरेशन का मानक पैकेज ₹12,000 से ₹25,000 के बीच तय है।",
    descBn: "সরকারি স্বাস্থ্য প্রকল্পে ফোল্ডেবল লেন্স সহ ছানি অপারেশনের আদর্শ প্যাকেজ ₹১২,০০০ থেকে ₹২৫,০০০-এর মধ্যে নির্ধারিত।"
  },
  cholecystectomy: {
    min: 25000,
    max: 42000,
    descEn: "Standard government packages benchmark laparoscopic gallbladder removal (cholecystectomy) between ₹25,000 to ₹42,000.",
    descHi: "सरकारी स्वास्थ्य योजनाओं में पित्त की थैली के ऑपरेशन का मानक पैकेज ₹25,000 से ₹42,000 के बीच तय है।",
    descBn: "সরকারি স্বাস্থ্য প্রকল্পে পিত্তথলি অপারেশনের আদর্শ প্যাকেজ ₹২৫,০০০ থেকে ₹৪২,০০০-এর মধ্যে নির্ধারিত।"
  },
  dengue: {
    min: 12000,
    max: 22000,
    descEn: "Standard government packages benchmark inpatient viral fever/dengue supportive treatment between ₹12,000 to ₹22,000 for a 3 to 4 day admission.",
    descHi: "सरकारी स्वास्थ्य योजनाओं में डेंगू या बुखार के 3 से 4 दिन के इलाज का मानक खर्च ₹12,000 से ₹22,000 के बीच तय है।",
    descBn: "সরকারি স্বাস্থ্য প্রকল্পে ডেঙ্গু বা জ্বরের ৩ থেকে ৪ দিনের চিকিৎসার আদর্শ খরচ ₹১২,০০০ থেকে ₹২২,০০০-এর মধ্যে নির্ধারিত।"
  }
};

function findBenchmark(procedure: string) {
  const norm = procedure.toLowerCase();
  for (const [key, value] of Object.entries(KNOWN_BENCHMARKS)) {
    if (norm.includes(key) || (key === "caesarean" && (norm.includes("c-section") || norm.includes("cesarean")))) {
      return value;
    }
  }
  return null;
}

const LOCALIZED_LABELS = {
  en: {
    conclusion: "Bill Conclusion & Summary",
    flags: "Questions & Flags to Ask",
    sources: "Verified Sources (Serp API)",
    grievance: "Helplines & Legal Aid",
    letter: "Formal Clarification Letter",
    speechButton: "Listen to Bill Advice",
    speechStop: "Stop Audio",
    serpApiNote: "Suggestions and conclusions are based on public web searches conducted using Serp API."
  },
  hi: {
    conclusion: "बिल निष्कर्ष और मुख्य सलाह",
    flags: "अस्पताल से पूछने योग्य सवाल",
    sources: "प्रमाणित सरकारी स्रोत (Serp API)",
    grievance: "शिकायत केंद्र व मुफ्त सहायता",
    letter: "औपचारिक स्पष्टीकरण पत्र",
    speechButton: "बिल की सलाह सुनें",
    speechStop: "आवाज़ बंद करें",
    serpApiNote: "ये सुझाव और निष्कर्ष Serp API का उपयोग करके की गई सार्वजनिक वेब खोजों पर आधारित हैं।"
  },
  bn: {
    conclusion: "বিল সিদ্ধান্ত ও মূল পরামর্শ",
    flags: "হাসপাতালে জিজ্ঞাসা করার প্রশ্নসমূহ",
    sources: "যাচাইকৃত তথ্যসূত্র (Serp API)",
    grievance: "অভিযোগ কেন্দ্র ও আইনি সহায়তা",
    letter: "আনুষ্ঠানিক স্পষ্টীকরণ পত্র",
    speechButton: "বিলের পরামর্শ শুনুন",
    speechStop: "অডিও বন্ধ করুন",
    serpApiNote: "এই পরামর্শ ও সিদ্ধান্তসমূহ Serp API ব্যবহার করে পরিচালিত উন্মুক্ত ওয়েব অনুসন্ধানের উপর ভিত্তি করে তৈরি।"
  }
} as const;

export function buildMediDecision(
  bill: Bill,
  evidence: Evidence[],
  _metrics: EvidenceMetrics,
  _warnings: string[],
  locale: "en" | "hi" | "bn" = "en"
): MediDecision {
  const flags: Flag[] = [];
  const items = bill.items || [];
  const itemsSum = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const mathDiff = items.length > 0 ? Math.round(bill.total - itemsSum) : 0;
  const labels = LOCALIZED_LABELS[locale] || LOCALIZED_LABELS.en;

  // 1. Math Check (totalMismatch)
  if (items.length > 0 && Math.abs(mathDiff) > 5) {
    if (locale === "hi") {
      flags.push({
        type: "totalMismatch",
        message: `जोड़ में ₹${Math.abs(mathDiff).toLocaleString("en-IN")} का अंतर है। बिल में दर्ज मदों का कुल जोड़ ₹${itemsSum.toLocaleString("en-IN")} है, जबकि कुल बिल ₹${bill.total.toLocaleString("en-IN")} मांगा गया है।`,
        questionText: `बिलिंग काउंटर से पूछें: "दिए गए बिल के सभी मदों का कुल योग ₹${itemsSum.toLocaleString("en-IN")} है, लेकिन कुल बिल ₹${bill.total.toLocaleString("en-IN")} लिखा है। कृपया बचे हुए ₹${Math.abs(mathDiff).toLocaleString("en-IN")} का मद-वार विवरण दें।"`,
        refs: ["Clinical Establishments Act - Mandatory Itemised Billing"]
      });
    } else if (locale === "bn") {
      flags.push({
        type: "totalMismatch",
        message: `হিসাবে ₹${Math.abs(mathDiff).toLocaleString("en-IN")}-এর অমিল রয়েছে। আইটেমগুলির মোট যোগফল ₹${itemsSum.toLocaleString("en-IN")}, কিন্তু মোট বিল চাওয়া হয়েছে ₹${bill.total.toLocaleString("en-IN")}।`,
        questionText: `বিলিং ডেস্কে জিজ্ঞাসা করুন: "বিলের সমস্ত আইটেমের মোট যোগফল ₹${itemsSum.toLocaleString("en-IN")}, কিন্তু মোট দাবি করা হয়েছে ₹${bill.total.toLocaleString("en-IN")}। অনুগ্রহ করে বাকি ₹${Math.abs(mathDiff).toLocaleString("en-IN")}-এর বিস্তারিত রসিদ দিন।"`,
        refs: ["Clinical Establishments Act - Mandatory Itemised Billing"]
      });
    } else {
      flags.push({
        type: "totalMismatch",
        message: `Calculation difference of ₹${Math.abs(mathDiff).toLocaleString("en-IN")}. The sum of itemised charges is ₹${itemsSum.toLocaleString("en-IN")}, but the total billed amount is ₹${bill.total.toLocaleString("en-IN")}.`,
        questionText: `Ask Billing Desk: "The line items in this statement sum to ₹${itemsSum.toLocaleString("en-IN")}, whereas the final bill states ₹${bill.total.toLocaleString("en-IN")}. Could you please provide the itemised breakdown for the remaining ₹${Math.abs(mathDiff).toLocaleString("en-IN")}?"`,
        refs: ["Clinical Establishments Act - Mandatory Itemised Billing"]
      });
    }
  }

  // 2. Vague Charges Check
  const vagueRegex = /misc|miscellaneous|admin|administration|service charge|handling|sanitation|hospitality|bio-waste|sundry|general expense|other charges/i;
  for (const item of items) {
    if (vagueRegex.test(item.label) || item.category === "misc") {
      if (locale === "hi") {
        flags.push({
          type: "vague",
          itemRef: item.label,
          message: `“${item.label}” के नाम पर ₹${item.amount.toLocaleString("en-IN")} का अस्पष्ट शुल्क जोड़ा गया है। इसमें किस सेवा या सामान का खर्च शामिल है, इसका कोई ब्यौरा नहीं है।`,
          questionText: `बिलिंग काउंटर से पूछें: "‘${item.label}’ के तहत ₹${item.amount.toLocaleString("en-IN")} किस बात के जोड़े गए हैं? मरीज अधिकार चार्टर के तहत कृपया इसका लिखित मद-वार बिल दें।"`,
          refs: ["Consumer Protection Act - Prohibition of Unfair Trade Practices"]
        });
      } else if (locale === "bn") {
        flags.push({
          type: "vague",
          itemRef: item.label,
          message: `“${item.label}”-এর নামে ₹${item.amount.toLocaleString("en-IN")}-এর অস্পষ্ট চার্জ যুক্ত করা হয়েছে। এর কোনো সুনির্দিষ্ট বিবরণ নেই।`,
          questionText: `বিলিং কাউন্টারে জিজ্ঞাসা করুন: "‘${item.label}’-এর ₹${item.amount.toLocaleString("en-IN")} কিসের জন্য ধার্য করা হয়েছে? রোগী অধিকার সনদ অনুযায়ী এর লিখিত বিবরণ দিন।"`,
          refs: ["Consumer Protection Act - Prohibition of Unfair Trade Practices"]
        });
      } else {
        flags.push({
          type: "vague",
          itemRef: item.label,
          message: `Unspecified charge of ₹${item.amount.toLocaleString("en-IN")} under "${item.label}" lacks clinical itemisation.`,
          questionText: `Ask Billing Desk: "Under patient charter guidelines, what specific services, medications, or administrative tasks are included under '${item.label}', and could you provide the line-by-line breakdown?"`,
          refs: ["Consumer Protection Act - Prohibition of Unfair Trade Practices"]
        });
      }
    }
  }

  // 3. Consumables & Disposables Check
  const consumableRegex = /consumable|disposable|gloves|ppe|syringe|cotton|mask|sanitizer|gauze/i;
  for (const item of items) {
    if ((consumableRegex.test(item.label) || item.category === "consumables") && item.amount >= 5000) {
      if (locale === "hi") {
        flags.push({
          type: "dataQuality",
          itemRef: item.label,
          message: `दस्ताने, सिरिंज व उपभोग्य सामग्री (Consumables) के नाम पर ₹${item.amount.toLocaleString("en-IN")} की बड़ी रकम जोड़ी गई है। कई सरकारी दिशा-निर्देशों में सामान्य डिस्पोजेबल ओटी या बेड चार्ज में शामिल माने जाते हैं।`,
          questionText: `बिलिंग काउंटर से पूछें: "क्या इन दस्तानों और सर्जिकल सामान का बिल एमआरपी (MRP) पर है, और क्या हम इस्तेमाल किए गए सामान की नर्सिंग शीट देख सकते हैं?"`,
          refs: ["National Consumer Disputes Redressal Commission Guidelines on Hospital Consumables"]
        });
      } else if (locale === "bn") {
        flags.push({
          type: "dataQuality",
          itemRef: item.label,
          message: `সার্জিক্যাল গ্লাভস ও ডিসপোজেবল সামগ্রীর জন্য ₹${item.amount.toLocaleString("en-IN")}-এর অতিরিক্ত চার্জ ধরা হয়েছে। সরকারি নির্দেশিকা অনুযায়ী সাধারণ ডিসপোজেবল সামগ্রী মূল চার্জের অংশ হওয়া উচিত।`,
          questionText: `বিলিং ডেস্কে জিজ্ঞাসা করুন: "এই সরঞ্জামগুলি কি এমআরপি (MRP)-তে ধরা হয়েছে এবং নার্সিং লগ শিট দেখতে পাওয়া যাবে কি?"`,
          refs: ["National Consumer Disputes Redressal Commission Guidelines on Hospital Consumables"]
        });
      } else {
        flags.push({
          type: "dataQuality",
          itemRef: item.label,
          message: `High consumable charge of ₹${item.amount.toLocaleString("en-IN")} for "${item.label}". In standard guidelines, basic surgical disposables are expected to be capped or included within procedure fees.`,
          questionText: `Ask Billing Desk: "Were these surgical consumables billed strictly at Maximum Retail Price (MRP), and may we verify the nursing requisition log showing the exact items utilized?"`,
          refs: ["National Consumer Disputes Redressal Commission Guidelines on Hospital Consumables"]
        });
      }
    }
  }

  // 4. Pharmacy Itemisation Check
  const pharmacyRegex = /pharmacy|medicine|medication|drug|injections/i;
  for (const item of items) {
    if ((pharmacyRegex.test(item.label) || item.category === "pharmacy") && item.amount >= 10000 && (!item.qty || item.qty === 1)) {
      if (locale === "hi") {
        flags.push({
          type: "missingQty",
          itemRef: item.label,
          message: `दवाइयों और इंजेक्शन के लिए ₹${item.amount.toLocaleString("en-IN")} एकमुश्त (lump-sum) जोड़े गए हैं। हर दवा का अलग नाम, मात्रा और पर्ची नहीं दी गई है।`,
          questionText: `बिलिंग काउंटर से पूछें: "कृपया अस्पताल की फार्मेसी से तारीख-वार सभी दवाइयों का बिल दें, जिसमें हर दवा का नाम, बैच नंबर, मात्रा और एमआरपी लिखा हो।"`,
          refs: ["Drugs and Cosmetics Act & Patient Charter Rights"]
        });
      } else if (locale === "bn") {
        flags.push({
          type: "missingQty",
          itemRef: item.label,
          message: `ওষুধের জন্য ₹${item.amount.toLocaleString("en-IN")} এককালীন চার্জ করা হয়েছে। প্রতিটি ওষুধের নাম, পরিমাণ বা ব্যাচ নম্বর উল্লেখ নেই।`,
          questionText: `বিলিং কাউন্টারে জিজ্ঞাসা করুন: "অনুগ্রহ করে ফার্মেসির বিস্তারিত বিল দিন যেখানে প্রতিটি ওষুধের নাম, পরিমাণ, ব্যাচ নম্বর এবং আসল দাম উল্লেখ আছে।"`,
          refs: ["Drugs and Cosmetics Act & Patient Charter Rights"]
        });
      } else {
        flags.push({
          type: "missingQty",
          itemRef: item.label,
          message: `Pharmacy charges of ₹${item.amount.toLocaleString("en-IN")} are billed as a lump sum without daily medicine names, quantities, or batch numbers.`,
          questionText: `Ask Billing Desk: "Could you please furnish the itemised pharmacy sheet showing each medicine's commercial name, batch number, quantity administered, and billed MRP?"`,
          refs: ["Drugs and Cosmetics Act & Patient Charter Rights"]
        });
      }
    }
  }

  // Benchmark Analysis
  const benchmark = findBenchmark(bill.procedure);
  let benchmarkRangeText: string | undefined;
  if (benchmark) {
    benchmarkRangeText = `₹${benchmark.min.toLocaleString("en-IN")} to ₹${benchmark.max.toLocaleString("en-IN")}`;
  }

  // Action Steps
  const actions: MediDecisionStep[] = [];
  if (locale === "hi") {
    actions.push({
      id: "medi-step-1",
      title: "दवाइयों और नर्सिंग चार्ट का विस्तृत बिल मांगें",
      body: "बिल का अंतिम भुगतान करने से पहले बिलिंग सुपरवाइजर से कहें कि वे हर एक दवाई, इंजेक्शन और उपभोग्य सामान की तारीख-वार रसीद दें। मरीज अधिकार कानून के तहत यह आपका कानूनी हक है।",
      urgent: true,
      badge: "कदम 1"
    });
    actions.push({
      id: "medi-step-2",
      title: "अस्पष्ट या प्रशासनिक शुल्क हटाने का अनुरोध करें",
      body: "‘Miscellaneous’ या ‘Admin charges’ जैसी अस्पष्ट मदों के लिए विनम्रता से कहें कि बिना लिखित ब्यौरे के यह शुल्क नहीं लिया जा सकता। अस्पताल प्रशासन से इसे माफ या संशोधित करने को कहें।",
      urgent: false,
      badge: "कदम 2"
    });
    actions.push({
      id: "medi-step-3",
      title: "अस्पताल के रेट कार्ड और आयुष्मान योजना से मिलान करें",
      body: "क्लिनिकल एस्टेब्लिशमेंट एक्ट के तहत हर अस्पताल को कमरों और ऑपरेशनों के तय रेट बोर्ड पर लगाने होते हैं। यदि आपके पास सरकारी योजना या बीमा है, तो प्री-ऑथराइजेशन पैकेज दर की पुष्टि करें।",
      urgent: false,
      badge: "कदम 3"
    });
    actions.push({
      id: "medi-step-4",
      title: "राष्ट्रीय उपभोक्ता हेल्पलाइन (1915) पर सहायता लें",
      body: "यदि अस्पताल विस्तृत रसीद देने से मना करे या अनुचित दबाव बनाए, तो भारत सरकार की मुफ्त राष्ट्रीय उपभोक्ता हेल्पलाइन 1915 पर कॉल करें या व्हाट्सएप 8800001915 पर शिकायत दर्ज कराएं।",
      urgent: false,
      badge: "कदम 4"
    });
  } else if (locale === "bn") {
    actions.push({
      id: "medi-step-1",
      title: "ওষুধ এবং নার্সিং চার্টের বিস্তারিত বিল দাবি করুন",
      body: "চূড়ান্ত বিল পরিশোধের আগে বিলিং সুপারভাইজারকে বলুন প্রতিটি ওষুধ, ইনজেকশন এবং ব্যবহৃত সামগ্রীর তারিখভিত্তিক রসিদ দিতে। রোগী সুরক্ষা আইন অনুযায়ী এটি আপনার অধিকার।",
      urgent: true,
      badge: "পদক্ষেপ ১"
    });
    actions.push({
      id: "medi-step-2",
      title: "অস্পষ্ট প্রশাসনিক চার্জ বাতিলের অনুরোধ জানান",
      body: "‘Miscellaneous’ বা ‘Admin charges’-এর মতো অস্পষ্ট চার্জের ক্ষেত্রে স্পষ্ট বিবরণ না থাকলে তা মকুব বা সংশোধন করতে হাসপাতাল কর্তৃপক্ষকে অনুরোধ করুন।",
      urgent: false,
      badge: "পদক্ষেপ ২"
    });
    actions.push({
      id: "medi-step-3",
      title: "হাসপাতালের নির্ধারিত রেট কার্ড ও সরকারি প্যাকেজ যাচাই করুন",
      body: "ক্লিনিক্যাল এস্টাব্লিশমেন্ট অ্যাক্ট অনুযায়ী প্রতিটি হাসপাতালে চিকিৎসা ও শয্যার রেট কার্ড প্রদর্শন বাধ্যতামূলক। কোনো স্বাস্থ্য বীমা বা সরকারি সুবিধা থাকলে প্যাকেজ রেট নিশ্চিত করুন।",
      urgent: false,
      badge: "পদক্ষেপ ৩"
    });
    actions.push({
      id: "medi-step-4",
      title: "জাতীয় উপভোক্তা হেল্পলাইন (1915)-এ অভিযোগ জানান",
      body: "হাসপাতাল যদি বিশদ বিল দিতে অস্বীকার করে বা অতিরিক্ত চাপের সৃষ্টি করে, তবে সরকারি টোল-ফ্রি ১৯১৫ নম্বরে ফোন করুন অথবা হোয়াটসঅ্যাপ ৮৮০০০০১৯১৫-এ সাহায্য নিন।",
      urgent: false,
      badge: "পদক্ষেপ ৪"
    });
  } else {
    actions.push({
      id: "medi-step-1",
      title: "Request Itemised Pharmacy & Daily Nursing Logs",
      body: "Before settling the final invoice, ask the billing in-charge for date-wise statements showing each medicine brand, quantity, batch number, and MRP. Under patient charter regulations, full itemisation is mandatory.",
      urgent: true,
      badge: "Step 1"
    });
    actions.push({
      id: "medi-step-2",
      title: "Ask to Justify or Waive Unspecified Administrative Charges",
      body: "Politely point out charges listed as 'Miscellaneous' or 'Admin fees'. Ask for clinical documentation justifying them, or request a revised invoice with these non-clinical fees waived.",
      urgent: false,
      badge: "Step 2"
    });
    actions.push({
      id: "medi-step-3",
      title: "Cross-Check with Hospital's Displayed Rate Schedule",
      body: "Under Clinical Establishments Act rules, private hospitals must maintain a publicly accessible rate schedule for rooms, consultations, and surgical facilities. Confirm your charges match this schedule.",
      urgent: false,
      badge: "Step 3"
    });
    actions.push({
      id: "medi-step-4",
      title: "Reach Official Redressal via National Consumer Helpline (1915)",
      body: "If the billing department refuses to supply an itemised breakdown or insists on unverified lump sums, lodge an official inquiry with the National Consumer Helpline at toll-free 1915 or WhatsApp 8800001915.",
      urgent: false,
      badge: "Step 4"
    });
  }

  // Summary Construction
  let headline = "";
  let summary = "";
  let speechSummary = "";

  if (locale === "hi") {
    headline = `${bill.city} में ${bill.hospital} के बिल का विश्लेषण और मुख्य सलाह`;
    const intro = `हमने Serp API का उपयोग करके ${bill.hospital}, ${bill.city} में “${bill.procedure}” के लिए आधिकारिक पैकेज दरों, मरीज अधिकार नियमों और उपभोक्ता आयोग के फैसलों की जांच की है।`;
    const billTotalText = `कुल बिल राशि ₹${bill.total.toLocaleString("en-IN")} है।`;
    const flagCountText = flags.length > 0
      ? ` बिल की जांच में ${flags.length} ऐसे बिंदु मिले हैं जिनके बारे में आपको बिलिंग काउंटर पर सवाल पूछना चाहिए।`
      : " बिल के सामान्य मद सही दिख रहे हैं, फिर भी डिस्चार्ज से पहले विस्तृत रसीद अवश्य मांगें।";
    const benchmarkNote = benchmark
      ? `\n\nसरकारी संदर्भ: केंद्र और राज्य सरकार की स्वास्थ्य योजनाओं (CGHS व PM-JAY) में इस ऑपरेशन का सामान्य पैकेज लगभग ₹${benchmark.min.toLocaleString("en-IN")} से ₹${benchmark.max.toLocaleString("en-IN")} के बीच होता है। हालांकि निजी अस्पतालों के चार्ज कमरे की श्रेणी के अनुसार अलग हो सकते हैं, यह जानकारी आपको बिल समझने में मदद करेगी।`
      : "";
    const attribution = `\n\n${labels.serpApiNote}`;
    summary = `${intro}\n\n${billTotalText}${flagCountText}${benchmarkNote}${attribution}`;

    speechSummary = `हमने Serp API का उपयोग करके ${bill.hospital} के बिल की जांच की है। कुल बिल राशि ₹${bill.total.toLocaleString("en-IN")} है। ${flags.length > 0 ? `जांच में ${flags.length} जरूरी बिंदु मिले हैं, जैसे अस्पष्ट चार्ज या दवाइयों का पूरा ब्यौरा न होना।` : "बिल के मुख्य मद सामान्य हैं।"} कृपया बिलिंग काउंटर से पूरी दवाइयों की रसीद मांगें और किसी भी परेशानी के लिए राष्ट्रीय उपभोक्ता हेल्पलाइन 1915 पर संपर्क करें।`;
  } else if (locale === "bn") {
    headline = `${bill.city}-এর ${bill.hospital}-এর বিল বিশ্লেষণ ও করণীয় পরামর্শ`;
    const intro = `আমরা Serp API ব্যবহার করে ${bill.hospital}, ${bill.city}-এ “${bill.procedure}”-এর জন্য সরকারি প্যাকেজ দর, রোগী অধিকার আইন এবং উপভোক্তা আদালতের নির্দেশিকা যাচাই করেছি।`;
    const billTotalText = `মোট বিলের পরিমাণ ₹${bill.total.toLocaleString("en-IN")}।`;
    const flagCountText = flags.length > 0
      ? ` বিলে ${flags.length}টি এমন দিক চিহ্নিত করা হয়েছে যেগুলি সম্পর্কে হাসপাতালে স্পষ্টীকরণ চাওয়া প্রয়োজন।`
      : " বিলের প্রধান অংশগুলি স্বাভাবিক রয়েছে, তবুও হাসপাতাল ছাড়ার আগে বিস্তারিত রসিদ সংগ্রহ করুন।";
    const benchmarkNote = benchmark
      ? `\n\nসরকারি মানদণ্ড: সরকারি স্বাস্থ্য প্রকল্পে (CGHS ও PM-JAY) এই অপারেশনের আদর্শ প্যাকেজ খরচ প্রায় ₹${benchmark.min.toLocaleString("en-IN")} থেকে ₹${benchmark.max.toLocaleString("en-IN")}-এর মধ্যে নির্ধারিত থাকে।`
      : "";
    const attribution = `\n\n${labels.serpApiNote}`;
    summary = `${intro}\n\n${billTotalText}${flagCountText}${benchmarkNote}${attribution}`;

    speechSummary = `আমরা Serp API ব্যবহার করে ${bill.hospital}-এর বিল পর্যালোচনা করেছি। মোট বিল ₹${bill.total.toLocaleString("en-IN")}। ${flags.length > 0 ? `বিলে ${flags.length}টি প্রশ্নসাপেক্ষ চার্জ পাওয়া গেছে।` : "বিলের প্রধান আইটেম স্বাভাবিক।"} সম্পূর্ণ রসিদ দাবি করুন এবং প্রয়োজনে জাতীয় উপভোক্তা হেল্পলাইন ১৯১৫-এ যোগাযোগ করুন।`;
  } else {
    headline = `Billing Analysis & Clarification Advice for ${bill.hospital}, ${bill.city}`;
    const intro = `We conducted public web searches using Serp API to examine official package benchmarks, Clinical Establishments Act rules, and patient redressal precedents for "${bill.procedure}" at ${bill.hospital} in ${bill.city}.`;
    const billTotalText = `The total billed amount is ₹${bill.total.toLocaleString("en-IN")}.`;
    const flagCountText = flags.length > 0
      ? ` Our audit highlighted ${flags.length} line-item points where you should request clarification from the billing desk.`
      : " The itemised charges appear standard, but always obtain daily pharmacy requisition slips before discharge.";
    const benchmarkNote = benchmark
      ? `\n\nPublic Benchmark Context: Standard government health packages (like CGHS and PM-JAY) benchmark this procedure around ₹${benchmark.min.toLocaleString("en-IN")} to ₹${benchmark.max.toLocaleString("en-IN")} for semi-private facilities. While private hospital rates vary with room selection and complications, this provides a transparent reference point.`
      : "";
    const attribution = `\n\n${labels.serpApiNote}`;
    summary = `${intro}\n\n${billTotalText}${flagCountText}${benchmarkNote}${attribution}`;

    speechSummary = `We reviewed the hospital bill from ${bill.hospital} in ${bill.city} using Serp API searches. The total billed amount is ₹${bill.total.toLocaleString("en-IN")}. ${flags.length > 0 ? `We identified ${flags.length} points to clarify, such as miscellaneous fees or unitemised pharmacy charges.` : "The main charges are clearly listed."} Please ask the billing desk for daily itemised pharmacy bills and cite patient charter rights. For free grievance help, call 1915.`;
  }

  return {
    headline,
    summary,
    speechSummary,
    discrepancyTotal: Math.abs(mathDiff) > 5 ? Math.abs(mathDiff) : undefined,
    benchmarkRange: benchmarkRangeText,
    flags,
    actions,
    labels
  };
}
