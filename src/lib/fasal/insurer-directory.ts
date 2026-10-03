export interface EmpanelledInsurer {
  name: string;
  tollFree: string;
  alternatePhone?: string;
  email?: string;
  portalUrl?: string;
  isEmpanelled: boolean;
}

export const NATIONAL_PMFBY_HELPLINE = "14447";
export const KISAN_CALL_CENTRE = "1800-180-1551";

export const KNOWN_INSURERS: Record<string, EmpanelledInsurer> = {
  aic: {
    name: "Agriculture Insurance Company of India (AIC)",
    tollFree: "1800-11-6515",
    alternatePhone: "1800-11-0001",
    email: "support@aicofindia.com",
    portalUrl: "https://www.aicofindia.com",
    isEmpanelled: true
  },
  hdfc_ergo: {
    name: "HDFC ERGO General Insurance Co. Ltd.",
    tollFree: "1800-266-0700",
    email: "care@hdfcergo.com",
    portalUrl: "https://www.hdfcergo.com",
    isEmpanelled: true
  },
  sbi_general: {
    name: "SBI General Insurance Company Ltd.",
    tollFree: "1800-209-1111",
    alternatePhone: "1800-123-2310",
    email: "customer.care@sbigeneral.in",
    portalUrl: "https://www.sbigeneral.in",
    isEmpanelled: true
  },
  bajaj_allianz: {
    name: "Bajaj Allianz General Insurance Co. Ltd.",
    tollFree: "1800-209-5959",
    email: "bagichelp@bajajallianz.co.in",
    portalUrl: "https://www.bajajallianz.com",
    isEmpanelled: true
  },
  icici_lombard: {
    name: "ICICI Lombard General Insurance Co. Ltd.",
    tollFree: "1800-2666",
    email: "customersupport@icicilombard.com",
    portalUrl: "https://www.icicilombard.com",
    isEmpanelled: true
  },
  reliance_general: {
    name: "Reliance General Insurance Co. Ltd.",
    tollFree: "1800-102-4088",
    email: "services.rgicl@relianceada.com",
    portalUrl: "https://www.reliancegeneral.co.in",
    isEmpanelled: true
  },
  future_generali: {
    name: "Future Generali India Insurance Co. Ltd.",
    tollFree: "1800-220-233",
    email: "fgcare@futuregenerali.in",
    portalUrl: "https://general.futuregenerali.in",
    isEmpanelled: true
  },
  universal_sompo: {
    name: "Universal Sompo General Insurance Co. Ltd.",
    tollFree: "1800-22-4030",
    email: "contactus@universalsompo.com",
    portalUrl: "https://www.universalsompo.com",
    isEmpanelled: true
  },
  oriental_insurance: {
    name: "The Oriental Insurance Company Ltd.",
    tollFree: "1800-11-8485",
    email: "portal.support@orientalinsurance.co.in",
    portalUrl: "https://orientalinsurance.org.in",
    isEmpanelled: true
  }
};

const STATE_INSURER_MAP: Record<string, string> = {
  Maharashtra: "aic",
  "West Bengal": "aic", // Bangla Shasya Bima / AIC
  "Uttar Pradesh": "sbi_general",
  "Madhya Pradesh": "aic",
  Rajasthan: "hdfc_ergo",
  Haryana: "bajaj_allianz",
  Karnataka: "universal_sompo",
  Odisha: "future_generali",
  "Tamil Nadu": "aic",
  "Andhra Pradesh": "sbi_general",
  Telangana: "aic",
  Assam: "aic",
  Gujarat: "aic",
  Bihar: "aic", // Bihar Rajya Fasal Sahayata
  Chhattisgarh: "aic",
  Punjab: "aic"
};

export function lookupEmpanelledInsurer(state: string, _district?: string): EmpanelledInsurer {
  void _district;
  const normalizedState = Object.keys(STATE_INSURER_MAP).find(
    (s) => s.toLowerCase() === state.toLowerCase().trim()
  );

  const key = normalizedState ? STATE_INSURER_MAP[normalizedState] : "aic";
  const insurer = KNOWN_INSURERS[key] || KNOWN_INSURERS.aic;

  return {
    ...insurer,
    tollFree: insurer.tollFree || NATIONAL_PMFBY_HELPLINE
  };
}
