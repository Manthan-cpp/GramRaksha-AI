import { z } from "zod";
import { AyushmanCashlessDecisionSchema, type AyushmanCashlessDecision } from "@/lib/medi/cashless-types";
import { VillagePocketCardSchema, type VillagePocketCard } from "@/lib/pocket-card/types";
export { AyushmanCashlessDecisionSchema, type AyushmanCashlessDecision, VillagePocketCardSchema, type VillagePocketCard };

export const EvidenceMapsSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  hoursText: z.string().optional(),
  mapsUrl: z.string().url(),
  placeId: z.string().optional()
});

export const EvidenceTrendSchema = z.object({
  signal: z.enum(["rising", "stable", "falling"]),
  value: z.number().min(0).max(100),
  values: z.array(z.number().min(0).max(100)).min(2).max(48),
  region: z.string(),
  window: z.string()
});

export const EvidenceVideoSchema = z.object({
  channelName: z.string(),
  channelUrl: z.string().url().optional(),
  duration: z.string().optional(),
  thumbnailUrl: z.string().url().optional()
});

export const EvidenceModeSchema = z.enum(["live", "recorded"]);
export type EvidenceMode = z.infer<typeof EvidenceModeSchema>;

export const EvidenceEngineSchema = z.enum([
  "google",
  "google_news",
  "google_maps",
  "google_trends",
  "youtube",
  "google_play",
  "other"
]);
export type EvidenceEngine = z.infer<typeof EvidenceEngineSchema>;

export const EvidenceSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  publisher: z.string(),
  engine: EvidenceEngineSchema,
  trust: z.enum(["official", "news", "other"]),
  publishedAt: z.string().optional(),
  retrievedAt: z.string(),
  query: z.string(),
  maps: EvidenceMapsSchema.optional(),
  trend: EvidenceTrendSchema.optional(),
  video: EvidenceVideoSchema.optional(),
  sourceLanguage: z.string().optional()
});
export type Evidence = z.infer<typeof EvidenceSchema>;

const EvidenceLocaleSchema = z.enum(["en", "hi", "bn"]);

const EvidenceRequestBaseSchema = z.object({
  locale: EvidenceLocaleSchema.default("en"),
  mode: EvidenceModeSchema.optional()
}).strict();

export const CropEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("krishi"),
  crop: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  stage: z.string().trim().min(1).max(80),
  concern: z.string().trim().max(240).optional()
}).strict();

export const BillEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("medi"),
  subModule: z.enum(["bill_audit", "cashless_shield"]).default("bill_audit").optional(),
  hospital: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional(),
  procedure: z.string().trim().min(1).max(120),
  depositDemanded: z.number().nonnegative().optional(),
  patientName: z.string().trim().max(100).optional(),
  pmjayId: z.string().trim().max(100).optional(),
  demandedReason: z.string().trim().max(300).optional()
}).strict();

export const SurakshaEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("suraksha"),
  content: z.string().trim().min(3).max(2000),
  sourceType: z.enum(["whatsapp", "sms", "link", "apk", "other"]).default("whatsapp").optional(),
  appName: z.string().trim().max(100).optional(),
  extractedScheme: z.string().trim().max(100).optional(),
  extractedApk: z.string().trim().max(100).optional(),
  extractedUrl: z.string().trim().max(300).optional()
}).strict();
export type SurakshaEvidenceRequest = z.infer<typeof SurakshaEvidenceRequestSchema>;

export const FasalCalamityTypeSchema = z.enum([
  "hailstorm",
  "flood_inundation",
  "lightning_cloudburst",
  "unseasonal_rain",
  "landslide",
  "other"
]);
export type FasalCalamityType = z.infer<typeof FasalCalamityTypeSchema>;

export const FasalEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("fasal"),
  state: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  calamityType: FasalCalamityTypeSchema,
  crop: z.string().trim().min(1).max(80).optional()
}).strict();
export type FasalEvidenceRequest = z.infer<typeof FasalEvidenceRequestSchema>;

export const PocketCardEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("pocket_card"),
  state: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  block: z.string().trim().min(1).max(100),
  village: z.string().trim().min(1).max(100),
  pinCode: z.string().trim().max(10).optional(),
  panchayatPradhanName: z.string().trim().max(100).optional(),
  pradhanPhone: z.string().trim().max(30).optional()
}).strict();
export type PocketCardEvidenceRequest = z.infer<typeof PocketCardEvidenceRequestSchema>;

export const PashuEvidenceRequestSchema = EvidenceRequestBaseSchema.extend({
  module: z.literal("pashu"),
  animal: z.string().trim().min(1).max(80),
  concern: z.string().trim().min(1).max(300),
  state: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  farmerName: z.string().trim().max(100).optional(),
  farmerPhone: z.string().trim().max(30).optional()
}).strict();
export type PashuEvidenceRequest = z.infer<typeof PashuEvidenceRequestSchema>;

export const EvidenceRunRequestSchema = z.discriminatedUnion("module", [
  CropEvidenceRequestSchema,
  BillEvidenceRequestSchema,
  SurakshaEvidenceRequestSchema,
  FasalEvidenceRequestSchema,
  PocketCardEvidenceRequestSchema,
  PashuEvidenceRequestSchema
]);
export type EvidenceRunRequest = z.infer<typeof EvidenceRunRequestSchema>;

export const PlannedQuerySchema = z.object({
  id: z.string(),
  engine: EvidenceEngineSchema,
  query: z.string(),
  parameters: z.record(z.string(), z.string()).default({}),
  purpose: z.string(),
  requireOfficial: z.boolean().default(false)
});
export type PlannedQuery = z.infer<typeof PlannedQuerySchema>;

export const EvidenceMetricsSchema = z.object({
  queriesPlanned: z.number().int().nonnegative(),
  queriesRun: z.number().int().nonnegative(),
  liveSearches: z.number().int().nonnegative(),
  cacheHits: z.number().int().nonnegative(),
  sourcesKept: z.number().int().nonnegative(),
  sourcesDropped: z.number().int().nonnegative(),
  mode: EvidenceModeSchema
});
export type EvidenceMetrics = z.infer<typeof EvidenceMetricsSchema>;

export const ClaimSchema = z.object({
  text: z.string(),
  evidenceIds: z.array(z.string()),
  quote: z.string()
});
export type Claim = z.infer<typeof ClaimSchema>;

export const CropDecisionStepSchema = z.object({
  text: z.string(),
  kind: z.enum(["treatment", "source_action", "watch", "contact", "verify"]),
  evidenceIds: z.array(z.string()),
  quote: z.string().optional(),
  sourceBacked: z.boolean()
});
export type CropDecisionStep = z.infer<typeof CropDecisionStepSchema>;

export const CropDecisionSchema = z.object({
  status: z.enum(["guidance", "watch", "insufficient", "unavailable"]),
  headline: z.string(),
  summary: z.string(),
  labels: z.object({
    conclusion: z.string(),
    doNow: z.string(),
    nextStep: z.string(),
    sourceBacked: z.string(),
    productGuidance: z.string(),
    whyConclusion: z.string(),
    coverage: z.string(),
    serpApiNote: z.string().optional()
  }),
  steps: z.array(CropDecisionStepSchema).max(5),
  reasons: z.array(ClaimSchema).max(5),
  nextStep: z.string(),
  coverage: z.object({
    planned: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    sourcesReviewed: z.number().int().nonnegative(),
    sourcesDropped: z.number().int().nonnegative(),
    warnings: z.number().int().nonnegative()
  })
});
export type CropDecision = z.infer<typeof CropDecisionSchema>;

export const PlaceSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  hoursText: z.string().optional(),
  mapsUrl: z.string().url(),
  evidenceId: z.string()
});
export type Place = z.infer<typeof PlaceSchema>;

export const KisanCallCentreSchema = z.object({
  name: z.string(),
  phone: z.string(),
  sourceUrl: z.string().url()
});
export type KisanCallCentre = z.infer<typeof KisanCallCentreSchema>;

export const CropBriefSchema = z.object({
  actions: z.array(ClaimSchema),
  alerts: z.array(z.object({
    severity: z.enum(["low", "medium", "high"]).optional(),
    freshness: z.string(),
    claim: ClaimSchema
  })),
  market: z.array(z.object({
    price: z.string(),
    marketName: z.string(),
    date: z.string(),
    unit: z.string(),
    source: z.string(),
    evidenceId: z.string().optional()
  })),
  schemes: z.array(z.object({
    name: z.string(),
    description: z.string(),
    eligibility: z.string(),
    deadline: z.string().optional(),
    url: z.string().optional(),
    evidenceId: z.string().optional()
  })),
  support: z.array(PlaceSchema),
  kisanCallCentre: KisanCallCentreSchema.optional(),
  videos: z.array(z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url(),
    channelName: z.string(),
    duration: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),
    evidenceId: z.string()
  })).default([]),
  trend: z.object({
    signal: z.enum(["rising", "stable", "falling"]),
    value: z.number().min(0).max(100),
    values: z.array(z.number().min(0).max(100)).min(2).max(48),
    region: z.string(),
    window: z.string(),
    evidenceId: z.string()
  }).optional(),
  sources: z.array(EvidenceSchema),
  disclaimers: z.array(z.string()),
  locale: EvidenceLocaleSchema.optional(),
  translationStatus: z.literal("original_sources").optional(),
  refusal: z.string().optional(),
  decision: CropDecisionSchema.optional()
});
export type CropBrief = z.infer<typeof CropBriefSchema>;

const EvidenceEventBaseSchema = z.object({
  timestamp: z.string()
});

export const EvidenceEventSchema = z.discriminatedUnion("type", [
  EvidenceEventBaseSchema.extend({
    type: z.literal("planning"),
    message: z.string(),
    queriesPlanned: z.number().int().nonnegative()
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("searching"),
    queryId: z.string(),
    engine: EvidenceEngineSchema,
    query: z.string(),
    position: z.number().int().positive(),
    total: z.number().int().positive(),
    cacheHit: z.boolean().default(false)
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("reading"),
    queryId: z.string(),
    engine: EvidenceEngineSchema,
    title: z.string(),
    url: z.string().url(),
    cacheHit: z.boolean().default(false)
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("kept"),
    evidence: EvidenceSchema,
    reason: z.string()
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("dropped"),
    title: z.string(),
    url: z.string().url().optional(),
    engine: EvidenceEngineSchema,
    reason: z.string()
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("synthesizing"),
    message: z.string()
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("done"),
    mode: EvidenceModeSchema,
    evidence: z.array(EvidenceSchema),
    claims: z.array(ClaimSchema),
    metrics: EvidenceMetricsSchema,
    warnings: z.array(z.string()),
    cropBrief: CropBriefSchema.optional(),
    mediDecision: z.lazy(() => MediDecisionSchema).optional(),
    surakshaDecision: z.lazy(() => SurakshaDecisionSchema).optional(),
    cashlessDecision: z.lazy(() => AyushmanCashlessDecisionSchema).optional(),
    fasalDecision: z.lazy(() => FasalDecisionSchema).optional(),
    pocketCard: z.lazy(() => VillagePocketCardSchema).optional(),
    pashuDecision: z.lazy(() => PashuDecisionSchema).optional()
  }),
  EvidenceEventBaseSchema.extend({
    type: z.literal("error"),
    code: z.enum(["validation", "configuration", "budget", "upstream", "recorded_unavailable", "internal"]),
    message: z.string(),
    recoverable: z.boolean()
  })
]);
export type EvidenceEvent = z.infer<typeof EvidenceEventSchema>;

export const MediDecisionStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  urgent: z.boolean().default(false),
  badge: z.string().optional()
});
export type MediDecisionStep = z.infer<typeof MediDecisionStepSchema>;

export const FlagSchema = z.object({
  type: z.enum(["vague", "missingQty", "duplicate", "totalMismatch", "publicRefDiffers", "dataQuality"]),
  itemRef: z.string().optional(),
  message: z.string(),
  questionText: z.string(),
  refs: z.array(z.string())
});
export type Flag = z.infer<typeof FlagSchema>;

export const MediDecisionSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  speechSummary: z.string(),
  discrepancyTotal: z.number().optional(),
  benchmarkRange: z.string().optional(),
  flags: z.array(FlagSchema),
  actions: z.array(MediDecisionStepSchema),
  labels: z.object({
    conclusion: z.string(),
    flags: z.string(),
    sources: z.string(),
    grievance: z.string(),
    letter: z.string(),
    speechButton: z.string(),
    speechStop: z.string(),
    serpApiNote: z.string()
  })
});
export type MediDecision = z.infer<typeof MediDecisionSchema>;

export const SurakshaPatternMatchSchema = z.object({
  id: z.string(),
  severity: z.enum(["critical", "warning", "info"]),
  title: z.string(),
  description: z.string(),
  matchedText: z.string().optional()
});
export type SurakshaPatternMatch = z.infer<typeof SurakshaPatternMatchSchema>;

export const SurakshaDecisionSchema = z.object({
  verdict: z.enum(["danger", "caution", "safe"]),
  riskScore: z.number().min(0).max(100),
  headline: z.string(),
  summary: z.string(),
  speechSummary: z.string(),
  patterns: z.array(SurakshaPatternMatchSchema),
  officialFactCheck: z.object({
    schemeName: z.string().optional(),
    officialUrl: z.string().optional(),
    isAlwaysFree: z.boolean(),
    playStoreStatus: z.string(),
    officialGuidance: z.string()
  }),
  redressalRoutes: z.array(z.object({
    name: z.string(),
    action: z.string(),
    phone: z.string().optional(),
    url: z.string().optional(),
    type: z.enum(["chakshu", "cybercrime", "helpline", "official"])
  })),
  warningMessage: z.string(),
  labels: z.record(z.string(), z.string()).default({})
});
export type SurakshaDecision = z.infer<typeof SurakshaDecisionSchema>;

export const FasalPhotoEvidenceSchema = z.object({
  id: z.string(),
  dataUrl: z.string(),
  timestamp: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  caption: z.string().optional(),
  fileSize: z.number().optional()
});
export type FasalPhotoEvidence = z.infer<typeof FasalPhotoEvidenceSchema>;

export const FasalCountdownStatusSchema = z.object({
  hoursLeft: z.number(),
  minutesLeft: z.number(),
  secondsLeft: z.number(),
  totalMsRemaining: z.number(),
  percentElapsed: z.number().min(0).max(100),
  urgency: z.enum(["safe", "warning", "critical", "expired"]),
  formattedTimeLeft: z.string(),
  deadlineIso: z.string(),
  isExpired: z.boolean()
});
export type FasalCountdownStatus = z.infer<typeof FasalCountdownStatusSchema>;

export const FasalDecisionSchema = z.object({
  countdown: FasalCountdownStatusSchema,
  calamityType: FasalCalamityTypeSchema,
  calamityLabel: z.string(),
  incidentTime: z.string(),
  state: z.string(),
  district: z.string(),
  village: z.string(),
  khasraNo: z.string().optional(),
  crop: z.string(),
  areaAcres: z.number().optional(),
  lossPercentage: z.number().min(1).max(100),
  farmerName: z.string(),
  farmerPhone: z.string().optional(),
  applicationNo: z.string().optional(),
  bankAccountRef: z.string().optional(),
  insurer: z.object({
    name: z.string(),
    tollFree: z.string(),
    email: z.string().optional(),
    portalUrl: z.string().optional(),
    isEmpanelled: z.boolean()
  }),
  daoOffice: z.object({
    officeName: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    mapsUrl: z.string().optional()
  }),
  actions: z.array(z.object({
    id: z.string(),
    priority: z.number(),
    title: z.string(),
    description: z.string(),
    actionType: z.enum(["call", "app", "letter", "visit"]),
    actionValue: z.string().optional(),
    isUrgent: z.boolean()
  })),
  letterText: z.string(),
  speechSummary: z.string(),
  guidelineRule: z.string(),
  labels: z.record(z.string(), z.string()).default({})
});
export type FasalDecision = z.infer<typeof FasalDecisionSchema>;

export const PashuDecisionStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  title: z.string(),
  instruction: z.string(),
  explanation: z.string(),
  isEmergency: z.boolean().default(false),
  badge: z.string().optional()
});
export type PashuDecisionStep = z.infer<typeof PashuDecisionStepSchema>;

export const PashuHospitalSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  mapsUrl: z.string(),
  evidenceId: z.string().optional(),
  isGovernment: z.boolean().default(true)
});
export type PashuHospital = z.infer<typeof PashuHospitalSchema>;

export const PashuDecisionSchema = z.object({
  status: z.enum(["emergency", "critical", "moderate", "routine_care"]),
  animal: z.string(),
  concern: z.string(),
  detectedCondition: z.string(),
  headline: z.string(),
  summary: z.string(),
  speechSummary: z.string(),
  ambulanceHelpline: z.object({
    number: z.string().default("1962"),
    name: z.string().default("National Mobile Veterinary Unit (MVU) / Pashu Sanjeevani"),
    kisanNumber: z.string().default("1800-180-1551"),
    instructions: z.string()
  }),
  doNowSteps: z.array(PashuDecisionStepSchema),
  neverDoWarnings: z.array(z.string()),
  nearbyHospitals: z.array(PashuHospitalSchema),
  sourceReferences: z.array(z.object({
    title: z.string(),
    url: z.string(),
    publisher: z.string()
  })),
  dietAndCareTips: z.array(z.string()),
  labels: z.record(z.string(), z.string()).default({})
});
export type PashuDecision = z.infer<typeof PashuDecisionSchema>;

export const EvidenceRunResultSchema = z.object({
  mode: EvidenceModeSchema,
  evidence: z.array(EvidenceSchema),
  claims: z.array(ClaimSchema),
  metrics: EvidenceMetricsSchema,
  warnings: z.array(z.string()),
  cropBrief: CropBriefSchema.optional(),
  mediDecision: MediDecisionSchema.optional(),
  surakshaDecision: SurakshaDecisionSchema.optional(),
  fasalDecision: FasalDecisionSchema.optional(),
  cashlessDecision: AyushmanCashlessDecisionSchema.optional(),
  pocketCard: VillagePocketCardSchema.optional(),
  pashuDecision: PashuDecisionSchema.optional()
});
export type EvidenceRunResult = z.infer<typeof EvidenceRunResultSchema>;

export const BillItemSchema = z.object({
  label: z.string(),
  category: z.string().optional(),
  qty: z.number().optional(),
  unit: z.string().optional(),
  amount: z.number()
});
export type BillItem = z.infer<typeof BillItemSchema>;

export const BillSchema = z.object({
  hospital: z.string(),
  city: z.string(),
  date: z.string(),
  procedure: z.string(),
  items: z.array(BillItemSchema),
  total: z.number(),
  confidence: z.record(z.string(), z.number()),
  confirmed: z.boolean()
});
export type Bill = z.infer<typeof BillSchema>;

export const CaseSchema = z.object({
  id: z.string(),
  module: z.enum(["krishi", "medi", "suraksha", "fasal", "pocket_card", "pashu"]),
  createdAt: z.string(),
  payload: z.any(),
  locale: z.string()
});
export type Case = z.infer<typeof CaseSchema>;
