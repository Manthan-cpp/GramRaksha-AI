export interface ClinicalGuideline {
  conditionKey: string;
  defaultStatus: "emergency" | "critical" | "moderate" | "routine_care";
  keywords: string[];
  name: { en: string; hi: string; bn: string };
  summary: { en: string; hi: string; bn: string };
  speechText: { en: string; hi: string; bn: string };
  doNowSteps: Array<{
    title: { en: string; hi: string; bn: string };
    instruction: { en: string; hi: string; bn: string };
    explanation: { en: string; hi: string; bn: string };
    isEmergency?: boolean;
    badge?: string;
  }>;
  neverDoWarnings: string[] | {
    en: string[];
    hi: string[];
    bn: string[];
  };
  dietAndCareTips: string[] | {
    en: string[];
    hi: string[];
    bn: string[];
  };
}

export const CLINICAL_KNOWLEDGE_BASE: ClinicalGuideline[] = [
  {
    conditionKey: "bloat",
    defaultStatus: "emergency",
    keywords: ["bloat", "tympany", "gas", "swollen stomach", "stomach", "afra", "pet phulna", "pet fula", "पेट फूलना", "अफरा", "गैस", "পেট ফোলা", "গ্যাস"],
    name: {
      en: "Acute Bloat / Ruminal Tympany (Severe Gas Accumulation)",
      hi: "तीव्र अफरा / पेट फूलना (पेट में अत्यधिक गैस का दबाव)",
      bn: "তীব্র পেট ফোলা বা গ্যাস জমা (রুমেক্স টিম্প্যানি)"
    },
    summary: {
      en: "Acute Bloat is a life-threatening veterinary emergency where fermented gas builds up in the rumen, putting severe pressure on the lungs and heart. Immediate gas evacuation is required.",
      hi: "अफरा एक आपातकालीन स्थिति है जिसमें पशु के पेट (रूमेन) में तेजी से जहरीली गैस भर जाती है, जिससे फेफड़ों पर दबाव पड़ता है और सांस रुकने का खतरा होता है। तुरंत गैस निकालना आवश्यक है।",
      bn: "তীব্র পেট ফোলা একটি জীবনঘাতী জরুরি অবস্থা যেখানে পেটে অতিরিক্ত গ্যাস জমে ফুসফুস ও হৃদযন্ত্রের ওপর প্রচণ্ড চাপ ফেলে। দ্রুত গ্যাস বের করা অত্যন্ত জরুরি।"
    },
    speechText: {
      en: "Emergency bloat alert. Stop green fodder and water immediately. Keep the animal standing with front legs elevated. Feed 200 ml mustard oil mixed with crushed ginger and asafoetida (hing) to break the gas bubbles. Never puncture the belly with wire or knife. Dial 1962 for animal ambulance right away.",
      hi: "सावधान! यह अफरा यानी पेट में गैस का आपातकाल है। पशु को तुरंत खड़ा रखें और आगे के पैर ऊंचे टीले पर रखें। तुरंत 200 मिलीलीटर शुद्ध सरसों के तेल में 25 ग्राम सोंठ या अदरक का रस और 15 ग्राम हींग मिलाकर पिलाएं। पेट में तार या चाकू से छेद बिल्कुल न करें। 1962 पशु एम्बुलेंस को तुरंत कॉल करें।",
      bn: "জরুরি সতর্কবার্তা! পশুর পেটে তীব্র গ্যাস জমেছে। পশুকে বসতে দেবেন না, সামনের পা উঁচু জায়গায় দাঁড় করিয়ে রাখুন। ২০০ মিলি খাঁটি সরিষার তেলে আদার রস ও হিং মিশিয়ে খাওয়ান। কখনোই ধারালো ছুরি বা তার দিয়ে পেটে ফুটো করবেন না। এখনই ১৯ba২ নম্বরে ফোন করুন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Keep Standing & Elevate Front Legs",
          hi: "पशु को तुरंत खड़ा रखें और आगे के पैर ऊंचे करें",
          bn: "পশুকে দাঁড় করিয়ে রাখুন এবং সামনের পা উঁচুতে রাখুন"
        },
        instruction: {
          en: "Do not allow the animal to lie down on its side. Position the animal so its front legs are higher than its rear legs (e.g. on an elevated slope or mud mound). This relieves suffocating pressure off the diaphragm and lungs.",
          hi: "पशु को किसी भी सूरत में जमीन पर करवट लेकर लेटने न दें। आगे के पैरों को ऊंचे टीले या ढलान पर रखें ताकि पेट की गैस फेफड़ों पर दबाव न डाले और दम न घुटने पाए।",
          bn: "পশুকে কখনোই একপাশে শুয়ে পড়তে দেবেন না। সামনের পা দুটি উঁচু মাটির ঢিবিতে রাখুন যাতে পেটের গ্যাস ফুসফুসে চাপ না ফেলে।"
        },
        explanation: {
          en: "Gravity allows the trapped rumen gas bubble to move toward the esophagus for natural burping.",
          hi: "ऊंचाई पर खड़े होने से रूमेन के ऊपरी हिस्से में गैस इकट्ठी होकर डकार के जरिए बाहर निकलती है।",
          bn: "সামনের অংশ উঁচুতে রাখলে গ্যাস সহজে ঢেকুরের মাধ্যমে মুখ দিয়ে বেরিয়ে যেতে পারে।"
        },
        isEmergency: true,
        badge: "STEP 1 - IMMEDIATE"
      },
      {
        title: {
          en: "Administer Anti-Foaming Drench (Mustard Oil + Ginger + Hing)",
          hi: "सरसों तेल + अदरक + हींग का सुरक्षित घोल दें",
          bn: "সরিষার তেল + আদা + হিং-এর নিরাপদ মিশ্রণ খাওয়ান"
        },
        instruction: {
          en: "For adult cattle/buffalo: Gently drench 150-250 ml pure edible mustard oil or linseed oil mixed with 30 ml ginger juice and 15g hing (asafoetida). For goats/sheep: Give 30-50 ml oil. Administer very slowly by mouth corner to prevent choking.",
          hi: "बड़े गाय-भैंस के लिए: 150 से 200 मिलीलीटर सरसों या अलसी के तेल में 30 ग्राम अदरक का रस और 15 ग्राम हींग घोलकर नाल या बोतल से मुंह के कोने से धीरे-धीरे पिलाएं। बकरी-भेड़ के लिए 30-50 मिलीलीटर दें।",
          bn: "বড় গরু-মহিষের জন্য: ১৫০-২০০ মিলি খাঁটি সরিষার তেলে ৩০ মিলি আদার রস ও ১৫ গ্রাম হিং মিশিয়ে খুব সাবধানে খাওয়ান। ছাগল-ভেড়ার জন্য ৩০-৫০ মিলি দিন।"
        },
        explanation: {
          en: "Vegetable oil breaks the surface tension of foamy froth in the rumen within 10-15 minutes, converting millions of micro-bubbles into free gas that escapes by belching.",
          hi: "खाद्य तेल रूमेन में झाग के बुलबुलों को तोड़ देता है, जिससे गैस डकार के जरिए तुरंत बाहर निकलने लगती है।",
          bn: "তেল পেটের ভেতরের ফেনা ভেঙে ফেলে গ্যাস মুক্ত করতে সাহায্য করে।"
        },
        isEmergency: true,
        badge: "STEP 2 - GAS RELEASE"
      },
      {
        title: {
          en: "Insert Wooden Bit / Rope in Mouth to Induce Burping",
          hi: "मुंह में लकड़ी की खपच्ची या रस्सी बांधें",
          bn: "মুখে কাঠের টুকরো বা দড়ি বেঁধে রাখুন"
        },
        instruction: {
          en: "Tie a smooth wooden stick horizontally between the animal's jaws with a soft cotton rope behind the ears, like a horse bit. This stimulates continuous tongue movement and salivation, triggering involuntary belching.",
          hi: "घोड़े की लगाम की तरह पशु के मुंह में 1 इंच मोटी साफ लकड़ी की खपच्ची रखें और दोनों सिरों को सींग या कान के पीछे रस्सी से बांध दें। पशु लकड़ी चबाएगा जिससे लगातार डकार आएगी।",
          bn: "ঘোড়ার লাগামের মতো পশুর মুখে একটি মসৃণ কাঠের কাঠি রাখুন এবং কানের পেছন দিয়ে নরম দড়ি দিয়ে বাঁধুন। পশুর ক্রমাগত চিবানোর ফলে ঢেকুর উঠে গ্যাস বের হবে।"
        },
        explanation: {
          en: "Chewing stimulates the parotid salivary reflex; natural alkaline saliva buffers acidic rumen froth and opens the cardia sphincter.",
          hi: "लगातार चबाने से लार बनती है जो गैस के बुलबुले शांत करती है और डकार नली खुलती है।",
          bn: "চিবানোর ফলে লালা ক্ষরণ বৃদ্ধি পায় এবং খাদ্যনালীর মুখ খুলে গ্যাস বেরিয়ে যায়।"
        },
        badge: "STEP 3 - REFLEX TRIGGER"
      },
      {
        title: {
          en: "Massage Left Flank and Call 1962 MVU Ambulance",
          hi: "बाईं कोख की मालिश करें एवं 1962 पर कॉल करें",
          bn: "বাম পাশের পেটে মালিশ করুন ও ১৯ba২ নম্বরে কল করুন"
        },
        instruction: {
          en: "Gently massage the swollen left flank (बायां पेट) with both hands from bottom to top in a clockwise motion. If the animal is staggering or gasping for breath, call 1962 immediately for emergency trocarization by a veterinary surgeon.",
          hi: "पशु के बाएं पेट (कोख) को नीचे से ऊपर की ओर दोनों हाथों से सहलाएं और दबाएं। यदि पशु हांफ रहा हो या गिर रहा हो, तो बिना देर किए 1962 टोल-फ्री पर कॉल करके मोबाइल वैन बुलाएं।",
          bn: "পশুর ফোলা বাম পেটে নিচ থেকে ওপরের দিকে হাত দিয়ে মালিশ করুন। পশু যদি ভীষণ হাঁপায়, অবিলম্বে ১৯ba২ নম্বরে ফোন করে ভেটেরিনারি অ্যাম্বুলেন্স ডাকুন।"
        },
        explanation: {
          en: "Manual massage aids rumen motility. Severe bloat may require clinical trocar needle insertion by a licensed doctor.",
          hi: "मालिश से पेट की गतिशीलता बढ़ती है। अति-गंभीर स्थिति में डॉक्टर ट्रोकार कैनुला लगाकर गैस निकालते हैं।",
          bn: "মালিশ পেটের স্বাভাবিক নড়াচড়া বাড়ায়। অতিরিক্ত বাড়াবাড়ি হলে ডাক্তারের প্রয়োজন হয়।"
        },
        badge: "STEP 4 - RESCUE"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER puncture the animal's belly with sharp wire, household knife, or needle yourself (causes fatal bacterial peritonitis and septic shock).",
      "❌ NEVER forcefully drench liquids down the throat while holding the nose or when the animal is coughing (fluids will enter the lungs, causing deadly aspiration pneumonia).",
      "❌ NEVER feed any lush green legume fodder (berseem, lucerne, young clover), grain flour, or stale dough until the bloat is completely cured.",
      "❌ NEVER make the animal run or exhaust it; violent running can rupture the distended diaphragm.",
      "❌ NEVER give toxic human painkiller tablets like Diclofenac or unapproved quack powders."
    ],
    dietAndCareTips: [
      "Withhold all green fodder and fresh grains for at least 24 hours.",
      "Provide clean dry wheat straw (भूसा) or dry hay in small quantities.",
      "Provide fresh clean water with a pinch of baking soda (मीठा सोडा - sodium bicarbonate) only after bloat subsides.",
      "Gradually reintroduce green fodder mixed 50:50 with dry straw over the next 4 days."
    ]
  },
  {
    conditionKey: "lumpy",
    defaultStatus: "critical",
    keywords: ["lumpy", "lumpy skin", "nodule", "lumps", "skin sores", "pox", "लंपी", "गांठ", "फोड़े", "त्वचा रोग", "লাম্পি", "ত্বকের গুটি", "ফোসকা"],
    name: {
      en: "Lumpy Skin Disease / LSD (Viral Nodular Dermatitis)",
      hi: "लंपी त्वचा रोग / एलएसडी (गांठदार विषाणुजनित चर्म रोग)",
      bn: "লাম্পি স্কিন ডিজিজ (ভাইরাসজনিত ত্বকের গুটি রোগ)"
    },
    summary: {
      en: "Lumpy Skin Disease is a viral capripox illness spread by biting flies, mosquitoes, and ticks. Characterized by sudden high fever, enlarged lymph nodes, and round nodules (2-5 cm) all over the hide.",
      hi: "लंपी एक संक्रामक विषाणुजनित रोग है जो मक्खी, मच्छर और चिचड़ी के काटने से फैलता है। इसमें तेज बुखार के साथ पूरे शरीर की त्वचा पर 2 से 5 सेंटीमीटर की गोल कठोर गांठें बन जाती हैं।",
      bn: "লাম্পি স্কিন একটি ছোঁয়াচে ভাইরাসজনিত রোগ যা মাছি, মশা ও আটালির মাধ্যমে ছড়ায়। এতে তীব্র জ্বরের সাথে পশুর সারা শরীরে গোল গোল গুটি দেখা দেয়।"
    },
    speechText: {
      en: "Lumpy Skin Disease detected. First, isolate the affected cattle 50 meters away from healthy animals immediately. Wash wounds twice daily with mild potassium permanganate (Laal Dawa) solution. Apply neem oil and turmeric paste to prevent fly maggots. Feed soft boiled daliya with jaggery. Call 1962 for supportive veterinary care.",
      hi: "लंपी त्वचा रोग की पहचान। सबसे पहले बीमार पशु को अन्य स्वस्थ पशुओं से तुरंत कम से कम 50 मीटर दूर अलग बांधें। त्वचा के घावों को लाल दवा यानी पोटेशियम परमैंगनेट के हल्के पानी से धोएं। घावों पर नीम का तेल और हल्दी का लेप लगाएं ताकि मक्खियां कीड़े न डालें। पशु को उबला हुआ दलिया और गुड़ खिलाएं। 1962 पर कॉल करें।",
      bn: "লাম্পি স্কিন রোগের লক্ষণ। সবার আগে অসুস্থ পশুকে অন্য সুস্থ পশুদের থেকে অন্তত ৫০ মিটার দূরে আলাদা করুন। লাল ওষুধ বা পটাশ মিশ্রিত হালকা জল দিয়ে ঘা ধুয়ে দিন। নিম তেল ও হলুদের পেস্ট লাগান যাতে মাছি না বসে। পশুকে নরম জাউ ও গুড় খেতে দিন। ১৯ba২ নম্বরে কল করুন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Strict Physical Isolation (Min 50 Meters)",
          hi: "बीमार पशु को तुरंत अलग बाड़े में बांधें (कम से कम 50 मीटर)",
          bn: "সুস্থ পশুদের থেকে সম্পূর্ণ আলাদা রাখুন (অন্তত ৫০ মিটার দূরে)"
        },
        instruction: {
          en: "Move the animal to a separate, mosquito-netted or well-ventilated dry shed. Do not share feed troughs, buckets, ropes, or caretakers between infected and healthy animals.",
          hi: "बीमार गाय या बैल को तुरंत स्वस्थ पशुओं से 50 मीटर दूर अलग छांव में रखें। बीमार पशु की नाद, पानी की बाल्टी और रस्सी स्वस्थ पशुओं से बिल्कुल अलग रखें।",
          bn: "অসুস্থ পশুকে সাথে সাথে আলাদা শুকনো ছায়াযুক্ত স্থানে সরিয়ে নিন। খাবার ও জলের পাত্র আলাদা রাখুন যাতে সুস্থ পশুতে সংক্রমণ না ছড়ায়।"
        },
        explanation: {
          en: "Lumpy virus spreads aggressively via blood-sucking vector insects and direct contact with infected nasal secretions and saliva.",
          hi: "यह रोग मक्खी, मच्छर और लार के संपर्क से तेजी से फैलता है। अलग करने से बाकी पशु सुरक्षित रहते हैं।",
          bn: "মাছি ও মশার মাধ্যমে এই ভাইরাস অন্য পশুতে দ্রুত ছড়িয়ে পড়ে।"
        },
        isEmergency: true,
        badge: "STEP 1 - BIO-SECURITY"
      },
      {
        title: {
          en: "Antiseptic Wound Wash with Potassium Permanganate (Laal Dawa)",
          hi: "लाल दवा (पोटेशियम परमैंगनेट) के हल्के घोल से घाव धोएं",
          bn: "হালকা পটাশ (লাল ওষুধ) মিশ্রিত জল দিয়ে ঘা পরিষ্কার করুন"
        },
        instruction: {
          en: "Dissolve 1 pinch (approx 1 gram) of potassium permanganate in 5 liters of clean lukewarm water until it turns faint pink (not dark purple). Gently wash erupted nodules and skin lesions using clean cotton twice a day.",
          hi: "5 लीटर साफ गुनगुने पानी में सिर्फ 1 चुटकी लाल दवा घोलें (पानी हल्का गुलाबी होना चाहिए, गहरा जामुनी नहीं)। साफ सूती कपड़े से दिन में 2 बार गांठों और घावों की धीरे-धीरे सफाई करें।",
          bn: "৫ লিটার পরিষ্কার হালকা গরম জলে এক চিমটি পটাশ গুলে হালকা গোলাপি রঙের দ্রবণ তৈরি করুন। দিনে দুবার নরম কাপড় দিয়ে ঘা ধুয়ে দিন।"
        },
        explanation: {
          en: "Mild permanganate oxidizes bacterial contaminants and dries up weeping skin sores without irritating animal tissue.",
          hi: "हल्की लाल दवा कीटाणुओं को नष्ट करती है और गांठों के फूटने पर घाव को जल्दी सुखाती है।",
          bn: "পটাশের দ্রবণ জীবাণু ধ্বংস করে এবং ক্ষত দ্রুত শুকাতে সাহায্য করে।"
        },
        badge: "STEP 2 - WOUND HYGIENE"
      },
      {
        title: {
          en: "Apply Traditional Herbal Paste (Neem Oil + Turmeric + Camphor)",
          hi: "नीम का तेल + हल्दी + कपूर का देशी मरहम लगाएं",
          bn: "নিম তেল + হলুদ + কর্পূরের ভেষজ প্রলেপ দিন"
        },
        instruction: {
          en: "Mix 100 ml pure neem oil + 50g ground turmeric (हल्दी) + 5g crushed camphor (कपूर). Apply this soothing ointment over broken nodules twice daily. Keep flies away using smoke from dry neem leaves outside the shed.",
          hi: "100 मिली शुद्ध नीम के तेल में 50 ग्राम पिसी हुई हल्दी और 5 ग्राम कपूर पीसकर मिला लें। इसे फफोले और घावों पर दिन में दो बार लगाएं। बाड़े के पास सूखी नीम की पत्तियों का धुआं करें ताकि मक्खी-मच्छर दूर रहें।",
          bn: "১০০ মিলি নিম তেলে ৫০ গ্রাম হলুদ গুঁড়ো ও ৫ গ্রাম কর্পূর মিশিয়ে পেস্ট তৈরি করুন। ক্ষতের ওপর দিনে দুবার লাগান। গোয়ালঘরের কাছে নিমপাতার ধোঁয়া দিয়ে মশা-মাছি তাড়ান।"
        },
        explanation: {
          en: "Neem and turmeric possess potent antiviral, antibacterial, and maggot-repellent properties endorsed by NDDB and IVRI ethno-veterinary formulations.",
          hi: "नीम और हल्दी में प्राकृतिक कीटाणुनाशक गुण होते हैं और मक्खियों को घाव में कीड़े (Maggots) डालने से रोकते हैं।",
          bn: "নিম ও হলুদ প্রাকৃতিকভাবে মাছি তাড়ায় এবং ক্ষত দ্রুত সারায়।"
        },
        badge: "STEP 3 - FLY SHIELD"
      },
      {
        title: {
          en: "Call 1962 & Provide High-Energy Immune Nutrition",
          hi: "1962 पशु एम्बुलेंस बुलाएं एवं ऊर्जावान आहार दें",
          bn: "১৯ba২ নম্বরে ফোন করুন এবং শক্তিবর্ধক নরম খাবার দিন"
        },
        instruction: {
          en: "Feed soft warm daliya (broken wheat) mixed with 100g jaggery (gur) and mineral mixture daily. Call 1962 or visit the nearest Government Veterinary Dispensary for doctor-prescribed anti-inflammatory medication (e.g. Meloxicam/Paracetamol under vet advice) and secondary antibiotic cover.",
          hi: "पशु को रोज 1 किलो गेहूं का दलिया पकाकर उसमें 100 ग्राम गुड़ और 50 ग्राम खनिज मिश्रण मिलाकर खिलाएं। 1962 पर कॉल करें ताकि पशु चिकित्सक आकर दर्द निवारक और बुखार की दवा दे सकें।",
          bn: "পশুকে সেদ্ধ গমের জাউয়ে ১০০ গ্রাম গুড় মিশিয়ে নরম করে খেতে দিন। সরকারি পশু চিকিৎসকের কাছে নিয়ে যান বা ১৯ba২ নম্বরে ফোন করে সাহায্য নিন।"
        },
        explanation: {
          en: "Lumpy disease causes intense throat ulcers and loss of appetite; soft sweetened gruel prevents starvation and secondary organ failure.",
          hi: "गले में छाले होने से पशु चारा नहीं चबा पाता, इसलिए मीठा दलिया ऊर्जा देता है और कमजोरी रोकता है।",
          bn: "মুখ ও গলায় ক্ষতের কারণে পশু শক্ত ঘাস খেতে পারে না, তাই জাউ দ্রুত শক্তি জোগায়।"
        },
        badge: "STEP 4 - NUTRITION & CLINIC"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER squeeze, pinch, or burst the skin nodules with your fingers or needles (this spreads the virus deep into muscle tissues).",
      "❌ NEVER take an infected animal to common village grazing grounds, water ponds, or cattle markets (हाट-बाजार).",
      "❌ NEVER give toxic quack concoctions or battery water on the advice of unqualified village quacks.",
      "❌ NEVER abandon or throw sick cows outside the village; this infects the entire district herd.",
      "❌ NEVER use human-dose Diclofenac or unverified steroids without a registered BVSc doctor's written prescription."
    ],
    dietAndCareTips: [
      "Offer plenty of fresh, clean lukewarm water with electrolyte salt or jaggery.",
      "Feed tender green grass, boiled broken wheat (दलिया), and crushed bananas.",
      "Avoid feeding dry hard stalks (कड़बी/पुआल) that can injure tender mouth ulcers.",
      "Spray the shed with 1% Virkon-S or sodium hypochlorite solution every 3 days."
    ]
  },
  {
    conditionKey: "mastitis",
    defaultStatus: "critical",
    keywords: ["mastitis", "udder", "teat", "swollen udder", "thanail", "abnormal milk", "curdled milk", "blood in milk", "थनैल", "थन में सूजन", "दूध में खून", "छिछड़े", "ওলান ফোলা", "দুধে রক্ত", "দুধে ছানা"],
    name: {
      en: "Clinical Mastitis / Udder Infection (Thanail)",
      hi: "क्लीनिकल थनैल रोग / अयन व थनों की गंभीर सूजन",
      bn: "ক্লিনিক্যাল ম্যাসটাইটিস বা ওলান প্রদাহ (দুধের বাঁট ফোলা)"
    },
    summary: {
      en: "Mastitis is a serious bacterial inflammation of the mammary gland (udder), causing painful hot swelling, teat hardening, and abnormal milk (watery, yellowish, curd flakes, or blood clots). Delay leads to permanent teat blindness.",
      hi: "थनैल दुधारू पशुओं के थन (अयन) का एक अति-हानिकारक जीवाणु संक्रमण है। इसमें थन गर्म, कठोर और सूज जाते हैं तथा दूध में छिछड़े, पीला पानी या खून आने लगता है। देरी से थन हमेशा के लिए मर सकता है।",
      bn: "ম্যাসটাইটিস হলো ওলানের একটি মারাত্মক ব্যাকটেরিয়াল সংক্রমণ। এতে বাঁট ফুলে শক্ত ও গরম হয়ে যায় এবং দুধে ছানার মতো দলা বা রক্ত দেখা দেয়। অবহেলা করলে বাঁট চিরতরে নষ্ট হয়ে যেতে পারে।"
    },
    speechText: {
      en: "Mastitis alert. Milk out the affected quarter completely and throw the infected milk away safely. Wash teats with lukewarm saline water. Keep the cow standing for 45 minutes after milking. Never tie rubber bands on teats. Contact the veterinary doctor immediately for intra-mammary treatment before the teat is permanently damaged.",
      hi: "सावधान! यह थनैल रोग का लक्षण है। खराब थन का पूरा दूध निकालकर किसी गड्ढे में सुरक्षित दबा दें। थन को हल्के गुनगुने नमक के पानी से धोएं। दुहने के बाद गाय को कम से कम 45 मिनट तक बैठने न दें। थन पर रबड़ या धागा कभी न बांधें। तुरंत पशु चिकित्सक से संपर्क करें।",
      bn: "ম্যাসটাইটিসের জরুরি সতর্কতা। আক্রান্ত বাঁটের সব দুধ সম্পূর্ণ দুয়ে মাটিতে পুঁতে ফেলুন। হালকা গরম নুন জল দিয়ে বাঁট ধুয়ে দিন। দুধ দোয়ানোর পর পশুকে অন্তত ৪৫ মিনিট বসতে দেবেন না। বাঁটে কখনো রাবার ব্যান্ড বা সুতো বাঁধবেন না। দ্রুত পশু ডাক্তারের পরামর্শ নিন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Strip Out the Infected Quarter Completely & Safely Discard",
          hi: "खराब थन का सारा दूध पूरा निकालें और गड्ढे में गाड़ दें",
          bn: "আক্রান্ত বাঁটের সম্পূর্ণ দুধ বের করে মাটিতে গর্ত করে ফেলুন"
        },
        instruction: {
          en: "Gently milk out every drop of abnormal milk from the infected teat into a separate container 3 to 4 times a day. Dig a hole in the ground away from the cattle shed and bury the infected milk with lime/bleaching powder.",
          hi: "दिन में 3-4 बार खराब थन से पूरा मटमैला दूध धीरे-धीरे बाहर निकालें। इस दूध को बाड़े के फर्श पर बिल्कुल न गिरने दें; दूर गड्ढा खोदकर उसमें थोड़ा चूना डालकर दबा दें।",
          bn: "দিনে ৩-৪ বার আক্রান্ত বাঁট থেকে সমস্ত নষ্ট দুধ সম্পূর্ণ বের করে নিন। গোয়ালঘরের মেঝেতে এই দুধ ফেলবেন না; দূরে গর্ত খুঁড়ে চুন দিয়ে পুঁতে ফেলুন।"
        },
        explanation: {
          en: "Removing bacteria-laden milk relieves intra-mammary pressure and clears toxin buildup. Burying prevents contaminating the floor where other cows sit.",
          hi: "खराब दूध लगातार निकालने से थन के अंदर बैक्टीरिया का जहर कम होता है और सूजन घटती है।",
          bn: "দুধ বের করে নিলে ওলানের ভেতরের বিষাক্ত ব্যাকটেরিয়ার চাপ কমে যায়।"
        },
        isEmergency: true,
        badge: "STEP 1 - STRIPPING"
      },
      {
        title: {
          en: "Lukewarm Saline Fomentation / Cold Compresses",
          hi: "गुनगुने नमक के पानी से सिकाई करें",
          bn: "হালকা গরম নুন জল দিয়ে সেঁক দিন"
        },
        instruction: {
          en: "If the udder is extremely hot, red, and swollen in the first 24 hours, apply cold water or ice wrapped in cloth for 10 minutes. If chronically hard, foment with lukewarm water containing 2 teaspoons of salt and a pinch of alum (फिटकरी).",
          hi: "यदि थन बहुत गर्म और लाल है, तो ठंडे पानी की पट्टी रखें। यदि थन कठोर और भारी हो गया है, तो 1 लीटर गुनगुने पानी में 2 चम्मच नमक और 1 चुटकी फिटकरी मिलाकर साफ कपड़े से 10 मिनट सिकाई करें।",
          bn: "বাঁট অতিরিক্ত গরম ও লাল থাকলে ঠাণ্ডা জল বা বরফের সেঁক দিন। বাঁট শক্ত হয়ে থাকলে হালকা গরম জলে নুন ও সামান্য ফিটকিরি মিশিয়ে নরম কাপড় দিয়ে সেঁক দিন।"
        },
        explanation: {
          en: "Saline fomentation stimulates micro-circulation, soothes throbbing pain, and softens hardened teat tissues.",
          hi: "नमक व फिटकरी की सिकाई से रक्त संचार सुधरता है और थन की कठोरता व दर्द में आराम मिलता है।",
          bn: "নুন জলের সেঁক ফোলা কমায় এবং পশুর ব্যথা উপশম করে।"
        },
        badge: "STEP 2 - FOMENTATION"
      },
      {
        title: {
          en: "Enforce Post-Milking Standing Rule (Min 45 Minutes)",
          hi: "दूध निकालने के बाद पशु को 45 मिनट तक खड़े रखें",
          bn: "দুধ দোয়ানোর পর অন্তত ৪৫ মিনিট পশুকে দাঁড় করিয়ে রাখুন"
        },
        instruction: {
          en: "Offer fresh green grass or grain immediately after milking so the cow remains standing. The teat canal orifice remains open for 30-45 minutes after milking. If the cow sits on dirty cow dung while the teat is open, bacteria rush inside.",
          hi: "दुहने के तुरंत बाद पशु के आगे हरा चारा डाल दें ताकि वह चरता रहे और लेटे नहीं। दुहने के बाद थन का छेद 45 मिनट तक खुला रहता है; गोबर में बैठने से बैक्टीरिया अंदर घुस जाते हैं।",
          bn: "দুধ দোয়ানোর পরপরই সামনে কাঁচা ঘাস দিন যাতে পশু দাঁড়িয়ে থাকে। দোয়ানোর পর বাঁটের মুখ ৩০-৪৫ মিনিট খোলা থাকে; এসময় নোংরায় বসলে জীবাণু সহজে ভেতরে ঢোকে।"
        },
        explanation: {
          en: "The teat sphincter muscle needs time to contract; standing prevents retrograde bacterial entry from the ground.",
          hi: "खड़े रहने से थन की मांसपेशियां सिकुड़कर मुंह बंद कर लेती हैं, जिससे बाहरी संक्रमण नहीं फैलता।",
          bn: "দাঁড়িয়ে থাকলে বাঁটের মুখ প্রাকৃতিকভাবে বন্ধ হয়ে সংক্রমণ আটকায়।"
        },
        badge: "STEP 3 - PREVENTION"
      },
      {
        title: {
          en: "Call Vet for Intramammary Infusion & Systemic Antibiotic",
          hi: "पशु चिकित्सक से थन की दवा (इंट्रामैमरी ट्यूब) लगवाएं",
          bn: "পশু ডাক্তারের মাধ্যমে টিউব ও অ্যান্টিবায়োটিক প্রয়োগ করুন"
        },
        instruction: {
          en: "Never delay! Call a qualified BVSc doctor or 1962. The doctor will insert a sterile intramammary antibiotic infusion tube directly into the teat canal and administer systemic anti-inflammatory injections.",
          hi: "बिना समय गंवाए सरकारी पशु अस्पताल जाएं या 1962 पर कॉल करें। डॉक्टर थन के अंदर विशेष एंटीबायोटिक ट्यूब (Intramammary Tube) चढ़ाएंगे जिससे थन हमेशा के लिए बंद होने से बच जाएगा।",
          bn: "দেরি না করে দ্রুত পশু ডাক্তার ডাকুন। ডাক্তার সরাসরি বাঁটের ভেতরে বিশেষ অ্যান্টিবায়োটিক টিউব প্রয়োগ করবেন যাতে বাঁট নষ্ট না হয়।"
        },
        explanation: {
          en: "Mastitis requires culture-sensitive intramammary antibiotic therapy within 48 hours to preserve the glandular parenchyma and future lactation.",
          hi: "समय पर डॉक्टर की दवा मिलने से थन की दुग्ध ग्रंथियां नष्ट होने से बच जाती हैं।",
          bn: "সঠিক সময়ে চিকিৎসা না করালে দুধের উৎপাদন চিরতরে বন্ধ হয়ে যেতে পারে।"
        },
        badge: "STEP 4 - VET CLINIC"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER drink, boil, or sell mastitis milk (contains deadly bacterial endotoxins that cause severe food poisoning in humans and children).",
      "❌ NEVER tie rubber bands, threads, or wire around the teat base to stop leakage (causes gangrene and complete teat amputation).",
      "❌ NEVER use the harmful knuckling method (अंगूठा मोड़कर दुहना); always milk with the full-hand grasp (पूर्ण हस्त विधि).",
      "❌ NEVER insert unsterilized quack quills, bicycle spokes, or feathers into the teat canal.",
      "❌ NEVER let young calves suckle the infected teat (causes fatal bacterial septicemia in calves)."
    ],
    dietAndCareTips: [
      "Feed 50 grams of Trisodium Citrate or commercial mastitis powder under veterinary advice.",
      "Supplement with Vitamin E, Selenium, and Zinc to strengthen udder epithelial immunity.",
      "Keep the cattle shed floor dry, clean, and sprinkled with dry lime powder (चूना) daily.",
      "Always wash hands and teats with clean water before and after every milking."
    ]
  },
  {
    conditionKey: "fmd",
    defaultStatus: "critical",
    keywords: ["fmd", "foot and mouth", "mouth blisters", "saliva", "drooling", "hoof", "khurpaka", "muhpaka", "khur", "खुरपका", "मुंहपका", "लार गिरना", "खुर में कीड़े", "ক্ষুর ও মুখ", "মুখপাকা", "লালা পড়া"],
    name: {
      en: "Foot and Mouth Disease / FMD (Khurpaka-Muhpaka)",
      hi: "खुरपका-मुंहपका रोग / एफएमडी (विषाणुजनित संक्रामक महामारी)",
      bn: "খুর ও মুখের ক্ষত বা ক্ষুরপাকা-মুখপাকা রোগ (FMD)"
    },
    summary: {
      en: "Foot and Mouth Disease is a highly contagious aphthovirus infection causing severe fever, blisters and erosions on tongue, gums, and between the hoof cloven digits, with continuous ropy saliva drooling.",
      hi: "खुरपका-मुंहपका अत्यंत छूतदार विषाणुजनित रोग है। इसमें पशु के मुंह, जीभ और खुरों के बीच गहरे छाले पड़ जाते हैं, मुंह से तार की तरह लगातार लार टपकती है और पशु लंगड़ाकर चलता है।",
      bn: "এটি একটি অতি-সংক্রামক ভাইরাসজনিত রোগ। এতে পশুর মুখ, জিভ ও খুরের খাঁজে তীব্র ক্ষত হয় এবং মুখ দিয়ে অনবরত লালা ঝরে ও পশু খোঁড়াতে থাকে।"
    },
    speechText: {
      en: "Foot and Mouth Disease alert. Disinfect the cattle shed with dry lime powder. Wash mouth sores with mild alum (Fitkari) or potassium permanganate solution. Wash hooves with copper sulphate and apply neem oil. Feed cool boiled rice porridge. Never force the animal to walk on mud or rough stones. Contact 1962 immediately.",
      hi: "खुरपका-मुंहपका रोग की चेतावनी। बाड़े के दरवाजे पर चूने का छिड़काव करें। मुंह के छालों को 1 प्रतिशत फिटकरी के पानी या लाल दवा से धोएं। खुरों के घावों को साफ करके नीम का तेल या कपूर का लेप लगाएं। पशु को ठंडा उबला हुआ दलिया या चावल का मांड़ पिलाएं। पशु को कीचड़ में न जाने दें। 1962 पर कॉल करें।",
      bn: "খুরপাকা-মুখপাকা রোগের সতর্কতা। গোয়ালঘরের চারপাশে চুন ছড়ান। মুখের ক্ষত ১ শতাংশ ফিটকিরির জল দিয়ে ধুয়ে দিন। খুরের ক্ষতে নিম তেল ও কর্পূর লাগান। নরম ভাতের মাড় বা জাউ খেতে দিন। পশুকে কাদা বা শক্ত রাস্তায় হাঁটাবেন না। এখনই ১৯ba২ নম্বরে যোগাযোগ করুন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Mouth Care with 1% Alum (Fitkari) or Boroglycerine",
          hi: "1% फिटकरी के पानी या बोरोग्लिसरीन से मुंह धोएं",
          bn: "১% ফিটকিরির জল বা বোরোগ্লিসারিন দিয়ে মুখ পরিষ্কার করুন"
        },
        instruction: {
          en: "Dissolve 10 grams of alum (फिटकरी) in 1 liter of clean drinking water. Gently rinse the animal's mouth, gums, and tongue twice daily. After washing, apply honey or boroglycerine to soothe raw burning ulcers.",
          hi: "1 लीटर साफ पानी में 10 ग्राम पिसी हुई फिटकरी घोलें। दिन में दो बार पशु का मुंह और जीभ इस पानी से धीरे-धीरे धोएं। इसके बाद छालों पर थोड़ा शहद या बोरोग्लिसरीन लगाएं।",
          bn: "১ লিটার জলে ১০ গ্রাম ফিটকিরি গুলে দিনে দুবার পশুর মুখ ও জিভের ঘা ধুয়ে দিন। এরপর ক্ষতের ওপর মধু বা বোরোগ্লিসারিন লাগান।"
        },
        explanation: {
          en: "Alum acts as a mild astringent that cleanses necrotic debris and speeds up oral epithelial healing so the animal can eat.",
          hi: "फिटकरी से छाले साफ होते हैं और शहद से ठंडक मिलती है, जिससे पशु चारा खाने में समर्थ होता है।",
          bn: "ফিটকিরি মুখের ঘা পরিষ্কার করে এবং মধু জ্বালা কমিয়ে দ্রুত ক্ষত সারাতে সাহায্য করে।"
        },
        isEmergency: true,
        badge: "STEP 1 - MOUTH RELIEF"
      },
      {
        title: {
          en: "Hoof Antiseptic Wash & Maggot Shield",
          hi: "खुरों की पोटेशियम परमैंगनेट व तांबे के घोल से सफाई",
          bn: "খুরের ক্ষত লাল ওষুধ বা তুঁতে জল দিয়ে পরিষ্কার করুন"
        },
        instruction: {
          en: "Clean the muddy cloven hooves thoroughly with clean water, then bathe with 0.1% potassium permanganate or 2% copper sulphate (नीला थोथा). Apply zinc oxide ointment mixed with neem oil to prevent fly maggots.",
          hi: "खुरों के बीच के घावों को लाल दवा के पानी से अच्छी तरह साफ करें। इसके बाद घाव पर नीम का तेल और कपूर का लेप लगाएं ताकि मक्खियां कीड़े (कीड़े/Maggots) न पैदा करें।",
          bn: "খুরের খাঁজ পরিষ্কার করে পটাশ জল দিয়ে ধুয়ে দিন। এরপর নিম তেল ও কর্পূর লাগান যাতে মাছি বসে ক্ষতে পোকা না হয়।"
        },
        explanation: {
          en: "Foot lesions easily attract blowflies; daily antiseptic dressings prevent crippling hoof deformities and maggot infestation.",
          hi: "खुरों में कीड़े पड़ने से पशु हमेशा के लिए लंगड़ा हो सकता है, इसलिए रोज मरहम जरूरी है।",
          bn: "নিয়মিত ড্রেসিং না করলে খুরে পোকা হয়ে পশু চিরতরে পঙ্গু হয়ে যেতে পারে।"
        },
        badge: "STEP 2 - HOOF CARE"
      },
      {
        title: {
          en: "Provide Soft, Cooling Energy Gruel",
          hi: "ठंडा, मुलायम एवं ऊर्जावान पतला दलिया खिलाएं",
          bn: "নরম, ঠাণ্ডা ভাতের মাড় ও জাউ খেতে দিন"
        },
        instruction: {
          en: "Because mouth sores make chewing coarse grass painful, feed soft boiled rice water (मांड़), broken wheat porridge (दलिया) mixed with jaggery, or soft green clover/grass. Ensure clean drinking water is always within reach.",
          hi: "मुंह में छाले होने के कारण पशु सूखा भूसा नहीं खा पाता। उसे चावल का मांड़, उबला हुआ पतला दलिया और गुड़ का घोल पिलाएं तथा नरम हरी घास दें।",
          bn: "মুখে ক্ষতের কারণে পশু শক্ত খড় খেতে পারে না। তাকে ভাতের মাড়, গুড় মেশানো পাতলা জাউ ও নরম কচি ঘাস খেতে দিন।"
        },
        explanation: {
          en: "Maintains caloric intake and prevents severe ketosis and starvation during the 10-14 day viral cycle.",
          hi: "मुलायम आहार से पशु को कमजोरी नहीं आती और शरीर का वजन नहीं घटता।",
          bn: "নরম পুষ্টিকর খাবার পশুর দুর্বলতা ও ওজন হ্রাস রোধ করে।"
        },
        badge: "STEP 3 - SOFT DIET"
      },
      {
        title: {
          en: "Disinfect Shed Entrance with Lime & Alert 1962",
          hi: "बाड़े में चूने का छिड़काव करें एवं 1962 को सूचित करें",
          bn: "গোয়ালঘরের প্রবেশমুখে চুন দিন ও ১৯ba২ নম্বরে জানান"
        },
        instruction: {
          en: "Spread a 2-inch thick layer of dry slaked lime powder (बुझा हुआ चूना) at the shed doorway so every person walks through it. Alert village veterinary authorities and dial 1962 so ring vaccination can protect nearby herds.",
          hi: "बाड़े के प्रवेश द्वार पर 2 इंच चौड़ी चूने की पट्टी बिछाएं ताकि आने-जाने वालों के जूतों से वायरस न फैले। तुरंत 1962 पर कॉल करके गांव में रिंग टीकाकरण की मांग करें।",
          bn: "গোয়ালঘরের দরজায় শুকনো চুনের গুঁড়ো ছড়িয়ে ফুটবাথ তৈরি করুন। অবিলম্বে ১৯ba২ নম্বরে ফোন করে সংলগ্ন এলাকার জন্য টিকার ব্যবস্থা করতে বলুন।"
        },
        explanation: {
          en: "Lime destroys surface virus particles. Ring vaccination is vital to quarantine the outbreak within a 5 km radius.",
          hi: "चूना वायरस को मारता है और समय पर टीका लगने से अन्य पशु महामारी से बच जाते हैं।",
          bn: "চুন ভাইরাস ধ্বংস করে এবং টিকাকরণ রোগ ছড়ানো বন্ধ করে।"
        },
        badge: "STEP 4 - BIO-SAFETY"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER allow infected animals to walk on rough gravel, hot asphalt, or deep mud (causes hoof capsule detachment).",
      "❌ NEVER feed unboiled milk from FMD-affected cows to young calves (causes sudden fatal viral myocarditis / 'tiger heart').",
      "❌ NEVER pour hot boiling oil or corrosive chemicals on hoof wounds (a dangerous common village misconception).",
      "❌ NEVER move animals across village borders or sell at weekly cattle bazars during an active outbreak.",
      "❌ NEVER skip ring vaccination for the rest of your healthy animals."
    ],
    dietAndCareTips: [
      "Keep the floor dry and bedded with clean dry straw.",
      "Give 50 grams of mineral mixture daily to rebuild worn tissues.",
      "Isolate calves and feed them boiled milk separately.",
      "Avoid feeding dry thorny fodder or hard stalks until mouth heals fully."
    ]
  },
  {
    conditionKey: "diarrhea",
    defaultStatus: "moderate",
    keywords: ["diarrhea", "loose motion", "watery dung", "dast", "patla gobar", "scours", "dehydration", "पतला गोबर", "दस्त", "पतले दस्त", "পাতলা পায়খানা", "ডায়রিয়া", "জল পায়খানা"],
    name: {
      en: "Acute Diarrhea / Calf Scours (Watery Dung & Dehydration)",
      hi: "तीव्र दस्त / पतला गोबर (शरीर में पानी और लवण की भारी कमी)",
      bn: "তীব্র পাতলা পায়খানা বা ডায়রিয়া (জলশূন্যতা ও দুর্বলতা)"
    },
    summary: {
      en: "Acute diarrhea rapidly drains critical body fluids and electrolytes, leading to sunken eyes, weakness, hypothermia, and shock. Common causes include sudden feed change, bacterial enteritis, or internal parasites.",
      hi: "पशु में लगातार पतले दस्त होने से शरीर का सारा पानी और आवश्यक लवण तेजी से बह जाते हैं। आंखें अंदर धंस जाती हैं, शरीर ठंडा पड़ने लगता है और कमजोरी आ जाती है।",
      bn: "ক্রমাগত পাতলা পায়খানার ফলে পশুর শরীর থেকে জল ও প্রয়োজনীয় খনিজ বেরিয়ে মারাত্মক দুর্বলতা দেখা দেয়। চোখ গর্তে ঢুকে যায় এবং শরীর ঠাণ্ডা হয়ে পড়ে।"
    },
    speechText: {
      en: "Diarrhea alert. The greatest danger is dehydration. Immediately prepare homemade animal ORS: 1 liter clean warm water, 2 teaspoons salt, 2 tablespoons sugar or jaggery, and half teaspoon baking soda. Feed frequent small sips. Feed boiled guava leaf water and rice starch. Never stop clean water. Call 1962 for veterinary deworming advice.",
      hi: "दस्त की चेतावनी। सबसे बड़ा खतरा शरीर में पानी की कमी का है। तुरंत देशी जीवनरक्षक घोल (ORS) बनाएं: 1 लीटर साफ गुनगुने पानी में 2 चम्मच नमक, 2 चम्मच गुड़ या चीनी और आधा चम्मच मीठा सोडा मिलाएं। इसे दिन में 4-5 बार पिलाएं। अमरूद की पत्तियों का काढ़ा या चावल का मांड़ दें। पानी बिल्कुल न रोकें। 1962 पर कॉल करें।",
      bn: "পাতলা পায়খানার সতর্কতা। সবচেয়ে বড় বিপদ হলো পানিশূন্যতা। এখনই ঘরে তৈরি স্যালাইন বানান: ১ লিটার হালকা গরম জলে ২ চা চামচ নুন, ২ চামচ গুড় বা চিনি এবং আধ চামচ খাবার সোডা মিশিয়ে ঘন ঘন খাওয়ান। পেয়ারা পাতার রস ও ভাতের মাড় দিন। জল বন্ধ করবেন না। ১৯ba২ নম্বরে যোগাযোগ করুন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Administer Homemade Animal ORS (Rehydration Electrolyte)",
          hi: "देशी पशु जीवनरक्षक घोल (ORS) तुरंत बनाकर पिलाएं",
          bn: "ঘরে তৈরি স্যালাইন বা ওআরএস মিশ্রণ দ্রুত খাওয়ান"
        },
        instruction: {
          en: "Boil 2 liters of clean water and cool until lukewarm. Add: 4 level teaspoons of table salt + 4 tablespoons of jaggery/sugar + 1 level teaspoon of baking soda. Offer 1-2 liters every 3-4 hours for adult cattle, or 250-500 ml for calves.",
          hi: "2 लीटर साफ पानी में 4 चम्मच नमक, 4 चम्मच पिसा गुड़ और 1 चम्मच मीठा सोडा (बेकिंग सोडा) अच्छी तरह घोलें। बड़े पशु को हर 3-4 घंटे में 1 से 2 लीटर तथा बछड़े को 250-500 मिलीलीटर धीरे-धीरे पिलाएं।",
          bn: "২ লিটার হালকা গরম জলে ৪ চামচ নুন, ৪ চামচ গুড় এবং ১ চামচ খাবার সোডা মিশিয়ে স্যালাইন তৈরি করুন। বড় পশুকে ১-২ লিটার এবং বাছুরকে ২৫০-৫০০ মিলি করে দিনে ৩-৪ বার খাওয়ান।"
        },
        explanation: {
          en: "Replaces lost sodium, potassium, and bicarbonate directly through intestinal glucose co-transport, preventing fatal hypovolemic shock.",
          hi: "यह घोल आंतों द्वारा तुरंत सोख लिया जाता है और पशु के शरीर में पानी की जानलेवा कमी नहीं होने देता।",
          bn: "এই মিশ্রণ অন্ত্রের মাধ্যমে দ্রুত শোষিত হয়ে পানিশূন্যতা ও শক প্রতিরোধ করে।"
        },
        isEmergency: true,
        badge: "STEP 1 - REHYDRATION"
      },
      {
        title: {
          en: "Herbal Gut Soothers (Guava Leaf Decoction / Bael Pulp)",
          hi: "अमरूद की पत्तियों का काढ़ा या बेल का गूदा दें",
          bn: "পেয়ারা পাতার ক্বাথ বা বেলের শাঁস খাওয়ান"
        },
        instruction: {
          en: "Boil 15-20 fresh tender guava leaves in 1 liter of water until reduced by half. Strain and mix with 50g wood apple / bael fruit pulp (बेल का गूदा). Feed twice daily to soothe irritated gut mucosa.",
          hi: "15-20 ताजी अमरूद की पत्तियों को 1 लीटर पानी में तब तक उबालें जब तक पानी आधा न रह जाए। छानकर इसमें 50 ग्राम बेल का गूदा मिलाकर दिन में दो बार पिलाएं।",
          bn: "১৫-২০টি কচি পেয়ারা পাতা জলে ফুটিয়ে অর্ধেক করে নিন। ছেঁকে নিয়ে তাতে ৫০ গ্রাম বেলের শাঁস মিশিয়ে দিনে দুবার খাওয়ান।"
        },
        explanation: {
          en: "Natural tannins in guava leaves and pectin in bael fruit coat inflamed gut walls and reduce loose watery stool frequency safely.",
          hi: "अमरूद के पत्तों में टैनिन होता है जो आंतों की सूजन कम करके पतले दस्त को तुरंत बांधता है।",
          bn: "পেয়ারা পাতার ট্যানিন ও বেলের উপাদান অন্ত্রের প্রদাহ কমিয়ে পায়খানা শক্ত করতে সাহায্য করে।"
        },
        badge: "STEP 2 - GUT RELIEF"
      },
      {
        title: {
          en: "Pinch Skin Test to Monitor Dehydration Severity",
          hi: "गर्दन की चमड़ी खींचकर पानी की कमी जांचें",
          bn: "ঘাড়ের চামড়া টেনে জলশূন্যতার মাত্রা পরীক্ষা করুন"
        },
        instruction: {
          en: "Pinch a fold of skin on the side of the neck and release. If the fold snaps back in <1 second, hydration is fine. If the tented skin stays up for >3-5 seconds, the animal is in severe shock requiring IV drips from a vet.",
          hi: "पशु की गर्दन की चमड़ी को चुटकी में पकड़कर ऊपर खींचें और छोड़ें। यदि चमड़ी तुरंत वापस बैठ जाए तो ठीक है। यदि चमड़ी 3-5 सेकंड तक मुड़ी खड़ी रहे, तो शरीर में भारी पानी की कमी है और डॉक्टर से ड्रिप लगवानी पड़ेगी।",
          bn: "পশুর ঘাড়ের চামড়া আঙুল দিয়ে টেনে ছেড়ে দিন। যদি সাথে সাথে বসে যায় তবে ঠিক আছে। চামড়া যদি ৩-৫ সেকেন্ড কুঁচকে থাকে, তবে দ্রুত ডাক্তারের মাধ্যমে স্যালাইন দিতে হবে।"
        },
        explanation: {
          en: "Skin turgor test provides instant, zero-cost clinical assessment of systemic extracellular fluid depletion.",
          hi: "यह जांच बिना किसी उपकरण के तुरंत बता देती है कि पशु को नस में ग्लूकोज/ड्रिप की आवश्यकता है या नहीं।",
          bn: "এই পরীক্ষা কোনো খরচ ছাড়াই পশুর শরীরে জলের ঘাটতি পরিমাপ করতে সাহায্য করে।"
        },
        badge: "STEP 3 - CLINICAL CHECK"
      },
      {
        title: {
          en: "Vet Examination for Deworming & Target Antibiotic",
          hi: "पशु चिकित्सक से पेट के कीड़ों (कृमि) की दवा एवं जांच कराएं",
          bn: "কৃমিনাশক ওষুধ ও অ্যান্টিবায়োটিকের জন্য ডাক্তারের পরামর্শ নিন"
        },
        instruction: {
          en: "If dung contains blood clots, foul stench, or fever is present, call 1962. The doctor will provide appropriate dewormers (e.g. Albendazole / Fenbendazole) or targeted intestinal antimicrobials.",
          hi: "यदि गोबर में खून, बदबू या बुखार हो, तो 1962 पर कॉल करें। डॉक्टर गोबर की जांच करके पेट के कीड़ों की दवा या एंटीबायोटिक बोलस देंगे।",
          bn: "পায়খানায় রক্ত বা তীব্র দুর্গন্ধ থাকলে এবং জ্বর থাকলে ডাক্তারের পরামর্শে কৃমিনাশক বা প্রয়োজনীয় ওষুধ খাওয়ান।"
        },
        explanation: {
          en: "Treats underlying parasitic worm burden or bacterial salmonellosis/coccidiosis accurately.",
          hi: "कीड़े मारने की सही दवा से आंतें पूरी तरह स्वस्थ हो जाती हैं।",
          bn: "সঠিক ওষুধে পেটের কৃমি ও সংক্রমণ দূর হয়।"
        },
        badge: "STEP 4 - VET CARE"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER completely withhold clean drinking water (dehydration kills far faster than diarrhea itself).",
      "❌ NEVER give adult cattle deworming doses to very young weak calves without measuring weight (causes toxicity).",
      "❌ NEVER administer kerosene, diesel, or battery acid quack remedies under any circumstances.",
      "❌ NEVER feed sudden large quantities of raw grains, moldy roti, or sour fermented silage.",
      "❌ NEVER let sick animals lie down in cold wet drafts without warm bedding."
    ],
    dietAndCareTips: [
      "Feed small frequent amounts of cooked rice gruel and dry wheat straw.",
      "Avoid lush watery berseem or high-protein concentrate feeds for 48 hours.",
      "Keep calves warm on dry dry straw bedding away from cold floor.",
      "Ensure mothers' udder is washed before calf suckling."
    ]
  },
  {
    conditionKey: "general_care",
    defaultStatus: "routine_care",
    keywords: ["fever", "weakness", "lethargy", "feed", "care", "milk yield", "nutrition", "cough", "deworming", "बुखार", "सुस्ती", "कमजोरी", "दूध कम", "चारा", "জ্বর", "দুর্বলতা", "দুধ কম", "খাবার"],
    name: {
      en: "Livestock Health, High Fever & Productivity Guidance",
      hi: "पशु स्वास्थ्य, बुखार, कमजोरी एवं दुग्ध उत्पादन संवर्धन",
      bn: "পশু স্বাস্থ্য, জ্বর, দুর্বলতা ও দুধ উৎপাদন বৃদ্ধি পরামর্শ"
    },
    summary: {
      en: "Comprehensive livestock husbandry guidelines focusing on thermoregulation, immune booster nutrition, clean drinking water, and timely veterinary health checks.",
      hi: "पशु के स्वास्थ्य, तापमान नियंत्रण, कमजोरी दूर करने, संतुलित आहार तथा समय पर पशु चिकित्सा से संबंधित वैज्ञानिक दिशा-निर्देश।",
      bn: "পশুর স্বাস্থ্যরক্ষা, জ্বর নিয়ন্ত্রণ, শারীরিক দুর্বলতা দূরীকরণ এবং সুষম খাদ্যের বিজ্ঞানসম্মত পরামর্শ।"
    },
    speechText: {
      en: "General livestock care advice. Check rectal temperature. Provide shade, clean cool water, and 50 grams of mineral mixture daily. If fever exceeds 103 degrees Fahrenheit, sponge forehead with cool water and contact the nearest government veterinary dispensary or dial 1962.",
      hi: "पशु देखभाल सलाह। पशु को छांव में रखें और दिन में तीन बार साफ पानी पिलाएं। रोज 50 ग्राम खनिज मिश्रण दें। यदि तेज बुखार (103 डिग्री से अधिक) हो तो सिर पर ठंडे पानी की पट्टी रखें और तुरंत 1962 टोल-फ्री पर कॉल करें।",
      bn: "পশু যত্ন পরামর্শ। পশুকে ছায়াযুক্ত স্থানে রাখুন এবং দিনে তিনবার পরিষ্কার জল খেতে দিন। প্রতিদিন ৫০ গ্রাম মিনারেল মিক্সচার দিন। জ্বর ১০৩ ডিগ্রির বেশি হলে মাথায় ঠাণ্ডা জলের সেঁক দিন এবং নিকটস্থ পশু হাসপাতালে যোগাযোগ করুন।"
    },
    doNowSteps: [
      {
        title: {
          en: "Thermal Comfort & Cold Water Sponging for High Fever",
          hi: "छांव की व्यवस्था एवं तेज बुखार में सिर पर ठंडे पानी की पट्टी",
          bn: "ছায়াযুক্ত স্থানে রাখুন এবং জ্বরে মাথায় ঠাণ্ডা জলের সেঁক দিন"
        },
        instruction: {
          en: "If the animal feels burning hot or panting with fever (>103°F / 39.5°C), immediately tie it in a shaded, well-ventilated breeze. Sponge the forehead, neck, and legs with cool water for 15 minutes.",
          hi: "यदि पशु का शरीर तप रहा हो या वह हांफ रहा हो, तो उसे ठंडी हवादार छांव में बांधें। माथे, गर्दन और खुरों पर ठंडे पानी की पट्टी रखें ताकि शरीर का तापमान सामान्य हो सके।",
          bn: "পশুর শরীর অতিরিক্ত গরম হলে বা হাঁপাতে থাকলে ছায়াযুক্ত স্থানে রাখুন। কপাল, ঘাড় ও পায়ে ঠাণ্ডা জলের ভেজা কাপড় দিয়ে ১৫ মিনিট সেঁক দিন।"
        },
        explanation: {
          en: "Evaporative cooling protects vital brain cells and cardiovascular function during acute pyrexia.",
          hi: "ठंडे पानी की पट्टी से मस्तिष्क पर बुखार का असर नहीं होता और पशु को तुरंत राहत मिलती है।",
          bn: "মাথায় ঠাণ্ডা জল দিলে মস্তিষ্কে জ্বরের ক্ষতিকর প্রভাব পড়ে না।"
        },
        badge: "STEP 1 - COOLING"
      },
      {
        title: {
          en: "Feed Daily Mineral Mixture (50g Daily)",
          hi: "दैनिक आहार में 50 ग्राम खनिज मिश्रण (Mineral Mixture) दें",
          bn: "প্রতিদিনের খাবারে ৫০ গ্রাম মিনারেল মিক্সচার মেশান"
        },
        instruction: {
          en: "Mix 50 grams of ISI-certified chelating mineral mixture and 30 grams of common salt into the daily feed ration. This restores lost trace minerals (calcium, phosphorus, zinc, copper).",
          hi: "रोज पशु के दाने में 50 ग्राम प्रामाणिक खनिज मिश्रण (Mineral Mixture) और 30 ग्राम साधारण नमक मिलाकर खिलाएं। इससे कमजोरी दूर होती है और दूध बढ़ता है।",
          bn: "প্রতিদিন দানাদার খাবারের সাথে ৫০ গ্রাম অনুমোদিত মিনারেল মিক্সচার ও ৩০ গ্রাম খাবার নুন মিশিয়ে দিন। এতে দুর্বলতা কাটে এবং দুধের পরিমাণ বাড়ে।"
        },
        explanation: {
          en: "Essential micro-minerals maintain ruminal microbial enzyme production and reproductive health.",
          hi: "खनिज मिश्रण से पशु की रोग प्रतिरोधक क्षमता बढ़ती है और वह समय पर गाभिन होता है।",
          bn: "খনিজ উপাদান পশুর রোগ প্রতিরোধ ক্ষমতা বাড়ায় এবং প্রজনন স্বাস্থ্য ভালো রাখে।"
        },
        badge: "STEP 2 - MINERALS"
      },
      {
        title: {
          en: "Clean Drinking Water Ad Libitum (Unlimited)",
          hi: "हर समय प्रचुर मात्रा में साफ एवं ताजा पीने का पानी उपलब्ध रखें",
          bn: "সারাদিন পর্যাপ্ত পরিষ্কার ও বিশুদ্ধ পানীয় জল দিন"
        },
        instruction: {
          en: "Dairy cattle require 60-100 liters of fresh, clean water every single day. Never offer stagnant ditch water or green algae water which carries deadly fluke parasites.",
          hi: "दुधारू गाय-भैंस को रोजाना 60 से 100 लीटर साफ पानी की जरूरत होती है। गंदे गड्ढे या काई वाला पानी कभी न पिलाएं क्योंकि उसमें खतरनाक कीटाणु होते हैं।",
          bn: "দুধেল গাভীকে প্রতিদিন ৬০-১০০ লিটার পরিষ্কার জল খেতে দিন। ডোবা বা শেওলাযুক্ত নোংরা জল কখনোই খাওয়াবেন না।"
        },
        explanation: {
          en: "Water accounts for 87% of milk volume; fresh hydration maximizes ruminal fermentation efficiency.",
          hi: "दूध का 87% हिस्सा पानी होता है, भरपूर साफ पानी मिलने से दूध का उत्पादन अपने आप बढ़ता है।",
          bn: "দুধের ৮৭ শতাংশই জল, তাই পর্যাপ্ত জল পেলে দুধ উৎপাদন স্বাভাবিকভাবেই বৃদ্ধি পায়।"
        },
        badge: "STEP 3 - WATER"
      },
      {
        title: {
          en: "Call 1962 or Visit Nearest Government Vet Dispensary",
          hi: "1962 पर संपर्क करें अथवा निकटतम पशु चिकित्सालय जाएं",
          bn: "১৯ba২ নম্বরে যোগাযোগ করুন বা নিকটস্থ পশু হাসপাতালে যান"
        },
        instruction: {
          en: "For persistent fever (>24 hours), inability to stand, or sudden milk loss, dial toll-free 1962 or visit your local veterinary doctor for accurate diagnosis, blood smear checks, and deworming schedule.",
          hi: "यदि 24 घंटे से अधिक बुखार रहे, पशु बैठ जाए या खाना छोड़ दे, तो तुरंत 1962 पर कॉल करें। पशु चिकित्सक से खून की जांच कराएं ताकि टिक फीवर या अन्य बीमारी का समय पर इलाज हो सके।",
          bn: "জ্বর ২৪ ঘণ্টার বেশি থাকলে বা পশু বসা থেকে উঠতে না পারলে ১৯ba২ নম্বরে কল করুন এবং সরকারি পশু চিকিৎসকের কাছে রক্ত পরীক্ষা করান।"
        },
        explanation: {
          en: "Tick-borne hemoparasitic infections (Theileriosis, Babesiosis) require rapid microscopic blood confirmation and specific antiprotozoal drugs.",
          hi: "चिचड़ी के काटने से होने वाले बुखार में समय पर डॉक्टर की दवा मिलने से पशु की जान बच जाती है।",
          bn: "আটালির কামড়ে সৃষ্ট জ্বর দ্রুত শনাক্ত করে চিকিৎসা করালে পশুর জীবন বাঁচে।"
        },
        badge: "STEP 4 - VET ACCESS"
      }
    ],
    neverDoWarnings: [
      "❌ NEVER tie the animal in direct scorching summer sun or open cold winter drafts without shelter.",
      "❌ NEVER feed moldy, fungus-covered dry fodder (causes deadly aflatoxin liver poisoning).",
      "❌ NEVER administer human NSAID painkiller injections (like high-dose Diclofenac or unapproved compounds) to livestock.",
      "❌ NEVER neglect regular deworming (कृमि मुक्ति) every 6 months and annual FMD/HS/BQ vaccination."
    ],
    dietAndCareTips: [
      "Provide a balanced mix of 2 parts green fodder to 1 part dry straw.",
      "Ensure shelter has dry bedding and proper ventilation.",
      "Brush the animal's coat daily to dislodge ticks and stimulate circulation.",
      "Keep vaccination records up to date in the Pashu Aadhaar (INAPH) registry."
    ]
  }
];

export function findMatchingGuideline(animal: string, concern: string): ClinicalGuideline {
  const query = `${animal} ${concern}`.toLowerCase();
  
  for (const guide of CLINICAL_KNOWLEDGE_BASE) {
    if (guide.keywords.some((k) => query.includes(k.toLowerCase()))) {
      return guide;
    }
  }

  return CLINICAL_KNOWLEDGE_BASE[CLINICAL_KNOWLEDGE_BASE.length - 1];
}
