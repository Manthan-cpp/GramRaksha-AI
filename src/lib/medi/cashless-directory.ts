export interface StateHealthAgencyInfo {
  state: string;
  shaName: string;
  tollFree: string;
  alternatePhone?: string;
  portalUrl: string;
  cmoAuthority: string;
  notes: string;
}

export const STATE_HEALTH_AGENCIES: Record<string, StateHealthAgencyInfo> = {
  "uttar pradesh": {
    state: "Uttar Pradesh",
    shaName: "State Agency for Comprehensive Health and Integrated Services (SACHIS)",
    tollFree: "1800-1800-4444",
    alternatePhone: "104",
    portalUrl: "https://sachis.up.gov.in",
    cmoAuthority: "Chief Medical Officer (CMO) & District Magistrate",
    notes: "SACHIS operates 24x7 district-level PM-JAY grievance cells in all 75 districts."
  },
  bihar: {
    state: "Bihar",
    shaName: "Bihar Swasthya Suraksha Samiti (BSSS)",
    tollFree: "104",
    alternatePhone: "1800-345-6660",
    portalUrl: "https://bsss.bihar.gov.in",
    cmoAuthority: "Civil Surgeon-cum-Chief Medical Officer",
    notes: "BSSS mandates on-the-spot verification by District Programme Coordinator."
  },
  jharkhand: {
    state: "Jharkhand",
    shaName: "Jharkhand State Arogya Society (JSAS)",
    tollFree: "104",
    alternatePhone: "1800-120-1111",
    portalUrl: "https://jsas.jharkhand.gov.in",
    cmoAuthority: "Civil Surgeon-cum-CMO",
    notes: "JSAS enforces instant show-cause notice for illegal deposit demands."
  },
  maharashtra: {
    state: "Maharashtra",
    shaName: "State Health Assurance Society (MJPJAY / PM-JAY)",
    tollFree: "155388",
    alternatePhone: "1800-233-2200",
    portalUrl: "https://www.jeevandayee.gov.in",
    cmoAuthority: "District Civil Surgeon & District Collector",
    notes: "Joint implementation under Mahatma Jyotirao Phule Jan Arogya Yojana."
  },
  "west bengal": {
    state: "West Bengal",
    shaName: "Swasthya Sathi Nodal Assurance Agency",
    tollFree: "1800-345-5384",
    portalUrl: "https://swasthyasathi.gov.in",
    cmoAuthority: "Chief Medical Officer of Health (CMOH)",
    notes: "Under Swasthya Sathi & PM-JAY convergence, all treatment packages are 100% cashless."
  },
  "madhya pradesh": {
    state: "Madhya Pradesh",
    shaName: "Ayushman Bharat MP Nodal Agency (SAPSH)",
    tollFree: "104",
    alternatePhone: "1800-233-2085",
    portalUrl: "https://ayushmanbharat.mp.gov.in",
    cmoAuthority: "Chief Medical & Health Officer (CMHO)",
    notes: "SAPSH enforces strict de-empanelment guidelines for advance deposit demands."
  },
  rajasthan: {
    state: "Rajasthan",
    shaName: "Rajasthan State Health Assurance Agency (RSHAA)",
    tollFree: "181",
    portalUrl: "https://chiranjeevi.rajasthan.gov.in",
    cmoAuthority: "Chief Medical & Health Officer (CMHO)",
    notes: "Integrated with state universal health insurance coverage."
  },
  gujarat: {
    state: "Gujarat",
    shaName: "Gujarat State Health Agency (SHA-PMJAY)",
    tollFree: "1800-233-1022",
    portalUrl: "https://pmjay.gujarat.gov.in",
    cmoAuthority: "Chief District Health Officer (CDHO)",
    notes: "SHA Gujarat monitors private hospital billing via PMAM electronic check-ins."
  },
  haryana: {
    state: "Haryana",
    shaName: "Ayushman Bharat Haryana Health Protection Authority",
    tollFree: "1800-180-2444",
    portalUrl: "https://ayushmanharyana.gov.in",
    cmoAuthority: "Civil Surgeon & District Grievance Committee",
    notes: "Direct escalation to State Health Authority grievance nodal officer."
  },
  odisha: {
    state: "Odisha",
    shaName: "State Health Assurance Society Odisha (BSKY / PM-JAY)",
    tollFree: "104",
    portalUrl: "https://bsky.odisha.gov.in",
    cmoAuthority: "Chief District Medical & Public Health Officer (CDM&PHO)",
    notes: "Cashless packages cover diagnostics, medicine, OT, and food during stay."
  }
};

export const NATIONAL_PMJAY_HELPLINE = "14555";
export const NATIONAL_PMJAY_ALTERNATE = "1800-111-565";
export const NATIONAL_CGRMS_PORTAL = "https://cgrms.pmjay.gov.in";

export function getStateHealthAgency(stateQuery: string): StateHealthAgencyInfo {
  const normalized = stateQuery.trim().toLowerCase();
  for (const [key, info] of Object.entries(STATE_HEALTH_AGENCIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return info;
    }
  }

  return {
    state: stateQuery.trim() || "National",
    shaName: "National Health Authority / State Health Agency (SHA)",
    tollFree: NATIONAL_PMJAY_HELPLINE,
    alternatePhone: NATIONAL_PMJAY_ALTERNATE,
    portalUrl: NATIONAL_CGRMS_PORTAL,
    cmoAuthority: "Chief Medical Officer (CMO) / District Grievance Committee",
    notes: "Contact the National Health Authority toll-free helpline 14555 for immediate hospital intervention."
  };
}
