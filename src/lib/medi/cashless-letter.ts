import { getStateHealthAgency, NATIONAL_PMJAY_HELPLINE } from "./cashless-directory";

export interface CashlessLetterData {
  hospital: string;
  city: string;
  state: string;
  procedure: string;
  depositDemanded: number;
  patientName?: string;
  pmjayId?: string;
  demandedReason?: string;
  date?: string;
}

export function generateCashlessLetterEn(data: CashlessLetterData): string {
  const patient = data.patientName?.trim() || "Beneficiary Patient";
  const cardId = data.pmjayId?.trim() || "Ayushman Bharat PM-JAY Golden Card";
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const sha = getStateHealthAgency(data.state);
  const depositFormatted = `₹${data.depositDemanded.toLocaleString("en-IN")}`;

  return `FORMAL STATUTORY REPRESENTATION
(Under Ayushman Bharat PM-JAY Operational Guidelines Clause 8.2 & Empanelment MoU)

Date: ${dateStr}

TO:
The Medical Superintendent & Hospital PM-JAY Nodal Officer,
${data.hospital},
${data.city}, ${data.state}

COPY TRANSMITTED TO:
1. The District Magistrate & Chief Medical Officer (Chairman, DGRC), District ${data.city}
2. The Chief Executive Officer, ${sha.shaName}, ${data.state}
3. National Health Authority Grievance Cell (CGRMS) / Helpline: ${NATIONAL_PMJAY_HELPLINE}

SUBJECT: URGENT REPRESENTATION AGAINST UNLAWFUL ADVANCE DEPOSIT DEMAND OF ${depositFormatted} FOR PM-JAY BENEFICIARY ${patient.toUpperCase()} (CARD ID: ${cardId})

Respected Sir / Madam,

1. BENEFICIARY DETAILS:
I am writing on behalf of patient ${patient}, holder of active Ayushman Bharat PM-JAY Golden Card (Card ID: ${cardId}), seeking emergency/indicated medical admission and treatment for "${data.procedure}" at your facility on ${dateStr}.

2. UNLAWFUL DEMAND OF ADVANCE DEPOSIT:
At the hospital admission desk, the hospital administration has demanded an upfront cash deposit of ${depositFormatted} as a prerequisite for admitting the patient and commencing treatment${data.demandedReason ? ` (Reason cited: "${data.demandedReason}")` : ""}.

3. RELEVANT STATUTORY GUIDELINES & MOU CLAUSES:
Your esteemed hospital appears on official empanelment records under the Pradhan Mantri Jan Arogya Yojana (PM-JAY) and the State Health Agency (${sha.shaName}). Under the statutory Operational Guidelines and the Empanelment Memorandum of Understanding (MoU):
  a) Clause 8.2 (Cashless Access): "The Empanelled Health Care Provider (EHCP) shall provide 100% cashless and paperless access to all covered secondary and tertiary care procedures. Under no circumstances shall an EHCP demand any advance security deposit, registration fee, or out-of-pocket charges from the beneficiary."
  b) Clause 11.1 (Comprehensive Package Coverage): Package rates established by the National Health Authority are all-inclusive, covering bed charges, nursing, surgeon fees, OT facility, anesthesia, diagnostics, prescribed medicines, surgical implants, and food during hospitalization.
  c) Clause 23 (Penalties & De-empanelment): Soliciting advance deposits or denying treatment to eligible beneficiaries constitutes a material violation of the empanelment MoU, attracting show-cause notice, financial penalties of up to five times the demanded amount, and immediate de-empanelment from PM-JAY registries.

4. FORMAL DEMAND & TIMELINE:
You are hereby formally called upon to:
  i. Immediately admit patient ${patient} and initiate treatment for "${data.procedure}" under PM-JAY cashless pre-authorization with ZERO cash deposit.
  ii. Instruct the on-duty Pradhan Mantri Arogya Mitra (PMAM) desk to complete biometric authentication and electronic pre-authorization without delay.

5. NOTICE OF ESCALATION:
Please take notice that if admission is delayed or denied on account of refusal to pay the demanded deposit of ${depositFormatted} within 2 (two) hours of receipt of this representation:
  - An immediate formal complaint will be logged on the Central Grievance Redressal Management System (CGRMS / cgrms.pmjay.gov.in) with recording ticket number.
  - A formal petition will be submitted before the District Grievance Redressal Committee (DGRC) headed by the District Magistrate and Chief Medical Officer for emergency inspection and penalty proceedings under Section 23 of the MoU.

Yours sincerely,

(Representative / Attendant on behalf of ${patient})
Patient / Attendant Mobile: _______________________
Ayushman Card / ABHA ID: ${cardId}
Hospital Counter Receipt / Time: ___________________`;
}

export function generateCashlessLetterHi(data: CashlessLetterData): string {
  const patient = data.patientName?.trim() || "लाभार्थी मरीज";
  const cardId = data.pmjayId?.trim() || "आयुष्मान भारत गोल्डन कार्ड";
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const sha = getStateHealthAgency(data.state);
  const depositFormatted = `₹${data.depositDemanded.toLocaleString("en-IN")}`;

  return `औपचारिक विधिक प्रतिवेदन (STATUTORY REPRESENTATION)
(आयुष्मान भारत PM-JAY संचालन दिशानिर्देश खंड 8.2 एवं अनुबंधन MoU के अंतर्गत)

दिनांक: ${dateStr}

सेवा में:
चिकित्सा अधीक्षक एवं PM-JAY नोडल अधिकारी,
${data.hospital},
${data.city}, ${data.state}

प्रतिलिपि प्रेषित:
1. जिलाधिकारी एवं मुख्य चिकित्सा अधिकारी (अध्यक्ष, जिला शिकायत निवारण समिति - DGRC), जिला ${data.city}
2. मुख्य कार्यकारी अधिकारी, ${sha.shaName}, ${data.state}
3. राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) शिकायत प्रकोष्ठ (CGRMS) / राष्ट्रीय हेल्पलाइन: ${NATIONAL_PMJAY_HELPLINE}

विषय: आयुष्मान लाभार्थी ${patient} (कार्ड आईडी: ${cardId}) से उपचार हेतु ${depositFormatted} की अवैध अग्रिम नकद मांग के संबंध में तत्काल प्रतिवेदन।

महोदय / महोदया,

1. लाभार्थी विवरण:
मैं आयुष्मान भारत PM-JAY के वैध लाभार्थी मरीज ${patient} (गोल्डन कार्ड आईडी: ${cardId}) के उपचार हेतु यह औपचारिक प्रतिवेदन प्रस्तुत कर रहा हूँ। मरीज को "${data.procedure}" के उपचार हेतु दिनांक ${dateStr} को आपके अस्पताल में भर्ती कराया जाना आवश्यक है।

2. अग्रिम नकद जमा की अवैध मांग:
अस्पताल के प्रवेश / रिसेप्शन पटल पर मरीज को भर्ती करने एवं उपचार प्रारंभ करने से पूर्व ${depositFormatted} की नकद अग्रिम राशि (एडवांस डिपॉजिट) की मांग की जा रही है${data.demandedReason ? ` (कारण: "${data.demandedReason}")` : ""}।

3. वैधानिक नियम एवं MoU की शर्तें:
आपका अस्पताल आयुष्मान भारत PM-JAY एवं राज्य स्वास्थ्य एजेंसी (${sha.shaName}) की आधिकारिक सूचीबद्धता (Empanelment) में सम्मिलित है। शासन के नियमानुसार:
  क) खंड 8.2 (पूर्णतः कैशलेस उपचार): "पैनलबद्ध अस्पताल पात्र लाभार्थी से उपचार के लिए कोई भी अग्रिम जमानत राशि, पंजीकरण शुल्क या नकद भुगतान नहीं मांग सकता। संपूर्ण उपचार पूर्णतः कैशलेस होना अनिवार्य है।"
  ख) खंड 11.1 (व्यापक पैकेज): सरकारी पैकेज में डॉक्टर परामर्श, बिस्तर, जांच, दवाइयां, ऑपरेशन, इम्प्लांट एवं भोजन का पूरा खर्च सम्मिलित है। मरीज से बाहर से दवा या जांच कराना भी नियम विरुद्ध है।
  ग) खंड 23 (दंड एवं पैनल से निष्कासन): नकद राशि मांगना या मरीज को भर्ती न करना अनुबंध का गंभीर उल्लंघन है, जिसमें अस्पताल पर जुर्माना तथा आयुष्मान सूची से निष्कासन (De-empanelment) का वैधानिक प्रावधान है।

4. त्वरित कार्रवाई की मांग:
अतः आपसे अनुरोध है कि:
  i. मरीज ${patient} को बिना किसी अग्रिम नकद राशि के आयुष्मान योजना के तहत तत्काल भर्ती कर उपचार प्रारंभ किया जाए।
  ii. अस्पताल के आरोग्य मित्र पटल को तुरंत बायोमेट्रिक सत्यापन एवं प्री-ऑथराइजेशन प्रक्रिया पूर्ण करने का निर्देश दिया जाए।

5. शिकायत निवारण चेतावनी:
यदि आगामी 2 घंटे के भीतर अग्रिम राशि न देने के कारण मरीज को भर्ती करने में विलंब या मना किया जाता है, तो इसकी औपचारिक शिकायत राष्ट्रीय पोर्टल CGRMS (cgrms.pmjay.gov.in) तथा जिला शिकायत निवारण समिति (DGRC / मुख्य चिकित्सा अधिकारी) को तत्काल प्रेषित कर विधिक कार्रवाई की मांग की जाएगी।

भवदीय,

(मरीज ${patient} के प्रतिनिधि / परिजन)
मोबाइल नंबर: _______________________
आयुष्मान कार्ड नंबर: ${cardId}
अस्पताल प्रवेश काउंटर समय: ____________`;
}

export function generateCashlessLetterBn(data: CashlessLetterData): string {
  const patient = data.patientName?.trim() || "উপভোক্তা রোগী";
  const cardId = data.pmjayId?.trim() || "আয়ুষ্মান ভারত / স্বাস্থ্য সাথী কার্ড";
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const sha = getStateHealthAgency(data.state);
  const depositFormatted = `₹${data.depositDemanded.toLocaleString("en-IN")}`;

  return `বিধিবদ্ধ আনুষ্ঠানিক আবেদন (STATUTORY REPRESENTATION)
(আয়ুষ্মান ভারত PM-JAY / স্বাস্থ্য সাথী নির্দেশিকা ধারা ৮.২ অনুযায়ী)

তারিখ: ${dateStr}

বরাবর:
মেডিকেল সুপারিনটেনডেন্ট ও PM-JAY নোডাল অফিসার,
${data.hospital},
${data.city}, ${data.state}

অনুলিপি প্রেরিত:
১. জেলা শাসক ও মুখ্য স্বাস্থ্য আধিকারিক (CMOH / চেয়ারম্যান, DGRC), জেলা ${data.city}
২. চিফ এক্সিকিউটিভ অফিসার, ${sha.shaName}, ${data.state}
৩. জাতীয় স্বাস্থ্য কর্তৃপক্ষ (NHA) অভিযোগ সেল / হেল্পলাইন: ${NATIONAL_PMJAY_HELPLINE}

বিষয়: আয়ুষ্মান উপভোক্তা ${patient} (কার্ড আইডি: ${cardId})-এর চিকিৎসার জন্য ${depositFormatted} বেআইনি অগ্রিম জমা দাবির বিরুদ্ধে জরুরি আবেদন।

মহাশয় / মহাশয়া,

১. উপভোক্তার বিবরণ:
আমি আয়ুষ্মান ভারত / স্বাস্থ্য সাথী কার্ডধারী রোগী ${patient} (কার্ড আইডি: ${cardId})-এর জরুরি ভর্তি ও "${data.procedure}" চিকিৎসার জন্য এই আবেদন পেশ করছি।

২. বেআইনি অগ্রিম নগদ দাবি:
হাসপাতালের ভর্তি ডেস্কে রোগীকে ভর্তি করার পূর্বশর্ত হিসেবে ${depositFormatted} অগ্রিম নগদ জমা দাবি করা হচ্ছে${data.demandedReason ? ` (কারণ: "${data.demandedReason}")` : ""}।

৩. সরকারি নিয়ম ও নির্দেশিকা:
আপনার হাসপাতাল সরকারি স্বাস্থ্য বীমা প্যানেলভুক্ত। ধারা ৮.২ অনুযায়ী প্যানেলভুক্ত কোনো হাসপাতাল কোনো অবস্থাতেই রোগীর কাছ থেকে অগ্রিম নগদ জমা বা ফি দাবি করতে পারে না। সমস্ত চিকিৎসা সম্পূর্ণ ক্যাশলেস হওয়া বাধ্যতামূলক। এই ধরনের দাবি চুক্তির চরম লঙ্ঘন এবং হাসপাতাল বরখাস্তের কারণ হতে পারে।

৪. দাবি:
রোগীকে কোনো অগ্রিম জমা ছাড়াই অবিলম্বে ভর্তি করে ক্যাশলেস চিকিৎসা শুরু করার নির্দেশ দিন। অন্যথায় জেলা অভিযোগ কমিটি ও জাতীয় পোর্টালে (CGRMS) অবিলম্বে আইনি অভিযোগ দায়ের করা হবে।

বিনীত,
(রোগী ${patient}-এর পক্ষ থেকে)
ফোন: _______________________
কার্ড আইডি: ${cardId}`;
}

export function generateCashlessLetter(
  data: CashlessLetterData,
  locale: "en" | "hi" | "bn" = "en"
): string {
  if (locale === "hi") return generateCashlessLetterHi(data);
  if (locale === "bn") return generateCashlessLetterBn(data);
  return generateCashlessLetterEn(data);
}
