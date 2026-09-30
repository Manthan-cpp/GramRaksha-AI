/**
 * Right to Information (RTI) Act 2005 Statutory Application Generator & Case Escalation Engine
 * 
 * Provides rural citizens, farmers, and patients with statutory follow-through mechanisms:
 * - Day 0: Formal Notice Served
 * - Day 7: First Follow-Up
 * - Day 15: Regulatory Authority Grievance (PM-JAY CGRMS / NCH / DLSA)
 * - Day 30: Statutory RTI Application under Section 6(1) of RTI Act 2005 demanding daily progress
 */

export interface EscalationMilestone {
  day: number;
  title: string;
  badge: string;
  status: "completed" | "active" | "upcoming";
  description: string;
  actionLabel: string;
  actionType: "view_notice" | "reminder" | "portal" | "rti";
  targetAuthority: string;
  legalProvision: string;
}

export interface EscalationTimeline {
  daysElapsed: number;
  currentMilestoneIndex: number;
  milestones: EscalationMilestone[];
}

export function calculateEscalationTimeline(createdAt: string, now: number = Date.now(), caseType: "medi" | "cashless" | "fasal" = "medi"): EscalationTimeline {
  const diffMs = Math.max(0, now - new Date(createdAt).getTime());
  const daysElapsed = Math.floor(diffMs / 86400000);

  const getMilestones = (): EscalationMilestone[] => {
    if (caseType === "fasal") {
      return [
        {
          day: 0,
          title: "Statutory 72h Intimation Served",
          badge: "Day 0",
          status: daysElapsed >= 7 ? "completed" : "active",
          description: "Formal loss intimation submitted to Empanelled Insurer and District Agriculture Officer (DAO) under PMFBY Clause 15.3.",
          actionLabel: "View Intimation Letter",
          actionType: "view_notice",
          targetAuthority: "Empanelled Insurer & DAO",
          legalProvision: "PMFBY Revised Guidelines Clause 15.3"
        },
        {
          day: 7,
          title: "Joint Loss Assessment Survey",
          badge: "Day 7",
          status: daysElapsed < 7 ? "upcoming" : daysElapsed >= 15 ? "completed" : "active",
          description: "Mandatory on-field survey by Joint Committee (Insurer Representative + Block Agriculture Officer + Farmer). Demand written inspection memo.",
          actionLabel: "Survey Follow-Up Memo",
          actionType: "reminder",
          targetAuthority: "Joint Survey Committee",
          legalProvision: "PMFBY Operational Guidelines Section 15.4"
        },
        {
          day: 15,
          title: "District Grievance Committee (DGC)",
          badge: "Day 15",
          status: daysElapsed < 15 ? "upcoming" : daysElapsed >= 30 ? "completed" : "active",
          description: "Escalate to District Level Monitoring Committee headed by District Collector if survey was not conducted or survey loss % was disputably lowered.",
          actionLabel: "Escalate to DGC / 14447",
          actionType: "portal",
          targetAuthority: "District Collector / DGC",
          legalProvision: "National Crop Insurance Portal Grievance Desk"
        },
        {
          day: 30,
          title: "Statutory RTI Application (Sec 6(1))",
          badge: "Day 30",
          status: daysElapsed < 30 ? "upcoming" : "active",
          description: "Demand certified copies of the joint survey sheet, geotagged satellite audit, and claim sanction status under Right to Information Act 2005.",
          actionLabel: "Generate RTI Application",
          actionType: "rti",
          targetAuthority: "Public Information Officer (PIO), District Agriculture Office",
          legalProvision: "Section 6(1) Right to Information Act 2005"
        }
      ];
    }

    // Default: Hospital Bill & Ayushman Cashless disputes
    return [
      {
        day: 0,
        title: "Dispute Notice Served to Hospital",
        badge: "Day 0",
        status: daysElapsed >= 7 ? "completed" : "active",
        description: caseType === "cashless"
          ? "Formal statutory notice served to Medical Superintendent citing PM-JAY Clause 8.2 prohibition of cash deposits."
          : "Formal itemized clarification notice served to Hospital Billing Superintendent with arithmetic discrepancy record.",
        actionLabel: "View Initial Notice",
        actionType: "view_notice",
        targetAuthority: "Hospital Medical Superintendent",
        legalProvision: caseType === "cashless" ? "NHA / PM-JAY MoU Clause 8.2" : "Clinical Establishments Act Rule 9"
      },
      {
        day: 7,
        title: "Written Follow-Up Reminder",
        badge: "Day 7",
        status: daysElapsed < 7 ? "upcoming" : daysElapsed >= 15 ? "completed" : "active",
        description: "Submit written reminder to Hospital Administration demanding refund of advance deposit / revised itemized statement within 72 hours.",
        actionLabel: "Generate Follow-Up Notice",
        actionType: "reminder",
        targetAuthority: "Hospital Accounts & Medical Superintendent",
        legalProvision: "Consumer Protection Act 2019 Section 2(47)"
      },
      {
        day: 15,
        title: "State Health Agency & CGRMS Appeal",
        badge: "Day 15",
        status: daysElapsed < 15 ? "upcoming" : daysElapsed >= 30 ? "completed" : "active",
        description: "File formal grievance on National Health Authority CGRMS Portal (cgrms.pmjay.gov.in) or call 14555 / 1915 with hospital receiving stamp copy.",
        actionLabel: "Lodge on CGRMS Portal",
        actionType: "portal",
        targetAuthority: "State Health Agency (SHA) / District Grievance Committee",
        legalProvision: "PM-JAY Redressal Protocol & National Consumer Helpline"
      },
      {
        day: 30,
        title: "Statutory RTI Application (Sec 6(1))",
        badge: "Day 30",
        status: daysElapsed < 30 ? "upcoming" : "active",
        description: "File application under Section 6(1) RTI Act 2005 to Chief Medical Officer / District Magistrate demanding Action Taken Report and inspection findings.",
        actionLabel: "Generate RTI Application",
        actionType: "rti",
        targetAuthority: "Public Information Officer (PIO), Office of the Chief Medical Officer",
        legalProvision: "Section 6(1) Right to Information Act 2005"
      }
    ];
  };

  const milestones = getMilestones();
  let currentMilestoneIndex = 0;
  if (daysElapsed >= 30) currentMilestoneIndex = 3;
  else if (daysElapsed >= 15) currentMilestoneIndex = 2;
  else if (daysElapsed >= 7) currentMilestoneIndex = 1;

  return {
    daysElapsed,
    currentMilestoneIndex,
    milestones
  };
}

export interface RtiApplicationParams {
  applicantName: string;
  applicantAddress: string;
  applicantPhone?: string;
  targetDepartment: string;
  targetCity: string;
  targetState: string;
  subjectReference: string;
  originalComplaintDate: string;
  originalReferenceNumber?: string;
  specificInquiries?: string[];
  locale?: "en" | "hi" | "bn";
}

export function generateRtiApplication(params: RtiApplicationParams): string {
  const locale = params.locale || "en";
  const todayFormatted = new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const inquiries = params.specificInquiries && params.specificInquiries.length > 0
    ? params.specificInquiries
    : [
        "Please provide the certified copy of the Diary Number / File Number under which my initial representation dated " + params.originalComplaintDate + " was registered in your office.",
        "Please provide a certified copy of the daily progress report / Action Taken Report (ATR) recorded in the file noting concerning my submitted representation.",
        "Please provide the names, designations, and official contact details of the officers/inspectors to whom this matter was assigned for inquiry.",
        "If no inquiry or resolution has been completed within the statutory period, please provide the certified copy of the rules or official reasons recorded in writing for such delay.",
        "Please provide the name, designation, and official office address of the First Appellate Authority (FAA) under Section 19(1) of the RTI Act 2005 for this public authority."
      ];

  if (locale === "hi") {
    return `आवेदन प्रपत्र (सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत)

दिनांक: ${todayFormatted}

सेवा में,
लोक सूचना अधिकारी (PIO),
${params.targetDepartment}
${params.targetCity}, ${params.targetState}

विषय: सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत जानकारी प्राप्त करने हेतु आवेदन।
संदर्भ: दिनांक ${params.originalComplaintDate} को प्रस्तुत औपचारिक शिकायत/अभ्यावेदन (संदर्भ: ${params.originalReferenceNumber || "पूर्व में हस्तगत/पंजीकृत"}).

महोदय/महोदया,

मैं, ${params.applicantName}, भारत का एक नागरिक, सूचना का अधिकार अधिनियम, 2005 के अंतर्गत निम्नलिखित प्रमाणित सूचनाएं निर्धारित समय-सीमा (30 दिन) में प्राप्त करने का अनुरोध करता हूँ:

१. प्रार्थी द्वारा दिनांक ${params.originalComplaintDate} को आपके कार्यालय में प्रस्तुत उक्त अभ्यावेदन पर दर्ज दैनिक प्रगति विवरण (Daily Progress Report) एवं फ़ाइल नोटिंग (File Noting) की प्रमाणित प्रतिलिपि उपलब्ध कराएं।
२. उक्त मामले की जांच हेतु नियुक्त किए गए जांच अधिकारी/निरीक्षक का नाम, पदनाम एवं उनके द्वारा प्रस्तुत अंतरिम/अंतिम जांच आख्या की प्रमाणित प्रति प्रदान करें।
३. यदि नियत समय-सीमा में मामले का निस्तारण नहीं किया गया है, तो इस विलंब के लिए उत्तरदायी अधिकारियों के नाम तथा विलंब के कारणों से संबंधित कार्यालय अभिलेख की प्रमाणित प्रति दें।
४. इस लोक प्राधिकरण के प्रथम अपीलीय अधिकारी (First Appellate Authority - FAA) का नाम, पदनाम एवं पूर्ण कार्यालय पता उपलब्ध कराएं।

आवेदन शुल्क:
अधिनियम के नियमानुसार निर्धारित ₹10 का आवेदन शुल्क (भारतीय पोस्टल ऑर्डर / कोर्ट फीस स्टाम्प / ट्रेजरी चालान) संलग्न है।

अधिनियम की धारा 20(1) के प्रति ध्यानाकर्षण:
कृपया संज्ञान लें कि सूचना का अधिकार अधिनियम 2005 की धारा 7(1) के अंतर्गत 30 दिनों में सूचना उपलब्ध कराना अनिवार्य है। बिना युक्तियुक्त कारण के विलंब करने पर धारा 20(1) के तहत ₹250 प्रतिदिन (अधिकतम ₹25,000) का दंड अधिरोपित किए जाने का वैधानिक प्रावधान है।

भवदीय,
हस्ताक्षर: _______________________
नाम: ${params.applicantName}
पता: ${params.applicantAddress}
दूरभाष: ${params.applicantPhone || "फोन उपलब्ध नहीं"}

संलग्नक:
1. पूर्व शिकायत पत्र दिनांकित ${params.originalComplaintDate} की प्रति।
2. निर्धारित ₹10 आवेदन शुल्क प्रमाण।`;
  }

  if (locale === "bn") {
    return `তথ্যের অধিকার আইন, ২০০৫ এর ধারা ৬(১) অনুযায়ী আবেদনের ফর্ম

তারিখ: ${todayFormatted}

প্রতি,
পাবলিক ইনফরমেশন অফিসার (PIO),
${params.targetDepartment}
${params.targetCity}, ${params.targetState}

বিষয়: তথ্যের অধিকার আইন, ২০০৫ এর ধারা ৬(১) এর অধীনে তথ্য প্রদানের আবেদন।
সূত্র: পূর্বে দাখিলকৃত অভিযোগ/আবেদনপত্র তারিখ ${params.originalComplaintDate} (রেফারেন্স: ${params.originalReferenceNumber || "অফিসিয়ালি জমা দেওয়া"}).

মহাশয়/মহাশয়া,

আমি, ${params.applicantName}, ভারতের একজন নাগরিক, তথ্যের অধিকার আইন ২০০৫ অনুযায়ী নির্ধারিত ৩০ দিনের সময়সীমার মধ্যে নিম্নলিখিত প্রত্যয়িত তথ্য প্রদানের অনুরোধ জানাচ্ছি:

১. আমার দ্বারা দাখিলকৃত অভিযোগের (তারিখ: ${params.originalComplaintDate}) ডায়েরি নম্বর ও দৈনিক অগ্রগতি প্রতিবেদন (Action Taken Report / Daily Progress Report) এর সার্টিফায়েড কপি প্রদান করুন।
২. এই অভিযোগ তদন্তের দায়িত্বে থাকা আধিকারিকের নাম, পদবি এবং তাদের জমা দেওয়া তদন্ত প্রতিবেদনের সার্টিফায়েড কপি প্রদান করুন।
৩. যদি নির্ধারিত সময়ের মধ্যে কোনো পদক্ষেপ গ্রহণ না করা হয়ে থাকে, তবে তার কারণ সম্বলিত ফাইল নোটিং এর সার্টিফায়েড কপি প্রদান করুন।
৪. ধারা ১৯(১) অনুযায়ী এই কর্তৃপক্ষের ফার্স্ট অ্যাপেলেট অথরিটি (FAA)-এর নাম ও অফিসের পূর্ণ ঠিকানা প্রদান করুন।

আবেদন ফি:
আইনানুযায়ী নির্ধারিত ₹১০ টাকার আবেদন ফি (পোস্টাল অর্ডার/কোর্ট ফি স্ট্যাম্প) এর সাথে সংযুক্ত করা হলো।

আইনগত ধারা ২০(১) এর স্মরণিকা:
দয়া করে মনে রাখবেন যে ধারা ৭(১) অনুযায়ী ৩০ দিনের মধ্যে তথ্য প্রদান বাধ্যতামূলক। অযৌক্তিক বিলম্বের ক্ষেত্রে ধারা ২০(১) অনুযায়ী দৈনিক ₹২৫০ টাকা হারে সর্বোচ্চ ₹২৫,০০০ টাকা পর্যন্ত জরিমানার সংস্থান রয়েছে।

বিনীত,
স্বাক্ষর: _______________________
নাম: ${params.applicantName}
ঠিকানা: ${params.applicantAddress}
ফোন: ${params.applicantPhone || "প্রযোজ্য নয়"}

সংযুক্তি:
১. মূল অভিযোগপত্রের অনুলিপি।
২. ₹১০ টাকার আবেদন ফি রসিদ।`;
  }

  // English (Default)
  return `FORM OF APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

Date: ${todayFormatted}

To,
The Public Information Officer (PIO),
${params.targetDepartment}
${params.targetCity}, ${params.targetState}

Subject: Request for Information under Section 6(1) of the Right to Information Act, 2005.
Reference: Formal Complaint / Representation submitted on ${params.originalComplaintDate} (Reference No: ${params.originalReferenceNumber || "On Record / Acknowledgment Stamped"}).

Respected Sir / Madam,

I, ${params.applicantName}, a citizen of India, hereby request you to kindly furnish the following verified and certified information under Section 6(1) of the Right to Information Act, 2005 within the statutory 30-day period:

${inquiries.map((inq, idx) => `${idx + 1}. ${inq}`).join("\n\n")}

Application Fee Particulars:
The statutory application fee of ₹10 (Rupees Ten only) has been remitted via Indian Postal Order (IPO) / Court Fee Stamp / Treasury Receipt enclosed herewith as required under the RTI (Regulation of Fee and Cost) Rules.

Notice regarding Penalty under Section 20(1):
Please take note that Section 7(1) of the RTI Act 2005 mandates supply of information within 30 days of receipt. In case of unreasonable delay, malafide refusal, or failure to supply certified information, penal proceedings under Section 20(1) carrying a statutory fine of ₹250 per day (up to ₹25,000) shall be pressed before the State / Central Information Commission.

Applicant Particulars:
Signature: ____________________________________
Name: ${params.applicantName}
Postal Address: ${params.applicantAddress}
Mobile / WhatsApp: ${params.applicantPhone || "On File"}

Enclosures:
1. Certified copy of original representation / intimation dated ${params.originalComplaintDate}.
2. Proof of statutory ₹10 application fee remittance.`;
}
