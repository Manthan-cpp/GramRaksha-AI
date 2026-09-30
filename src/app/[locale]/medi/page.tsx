"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PrivacyNotice } from "@/components/medi/PrivacyNotice";
import { BillUpload } from "@/components/medi/BillUpload";
import { RedactTool } from "@/components/medi/RedactTool";
import { ExtractionReview } from "@/components/medi/ExtractionReview";
import { BillResults } from "@/components/medi/BillResults";
import { LetterEditor } from "@/components/medi/LetterEditor";
import { CashlessForm } from "@/components/medi/cashless/CashlessForm";
import { CashlessResults } from "@/components/medi/cashless/CashlessResults";
import { CashlessLetterModal } from "@/components/medi/cashless/CashlessLetterModal";
import {
  Bill,
  type Evidence,
  type EvidenceEvent,
  type EvidenceMetrics,
  type MediDecision,
  type AyushmanCashlessDecision
} from "@/lib/schemas";
import type { AyushmanCashlessRequest } from "@/lib/medi/cashless-types";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { addClientEvidenceMetrics, getClientEvidenceMode } from "@/lib/evidence/client-state";
import { buildMediDecision } from "@/lib/medi/decision";
import { buildAyushmanCashlessDecision } from "@/lib/medi/cashless-decision";
import { saveMediCase } from "@/lib/storage/medi-cases";

type FlowStep = "privacy" | "upload" | "redact" | "review" | "analyzing" | "results" | "letter";
type CashlessStep = "form" | "analyzing" | "results";
type MediTab = "cashless" | "audit";

const MEDI_SESSION_KEY = "gramraksha_medi_active_session";

interface SavedMediSession {
  step: FlowStep;
  bill: Bill;
  evidence: Evidence[];
  metrics: EvidenceMetrics;
  warnings: string[];
  mode: "live" | "recorded";
}

function getSavedMediSession(locale: "en" | "hi" | "bn"): {
  step: FlowStep;
  bill: Bill | null;
  evidence: Evidence[];
  decision: MediDecision | null;
  mode: "live" | "recorded";
  metrics?: EvidenceMetrics;
  warnings: string[];
} {
  if (typeof window === "undefined") {
    return { step: "privacy", bill: null, evidence: [], decision: null, mode: "live", warnings: [] };
  }
  try {
    const raw = sessionStorage.getItem(MEDI_SESSION_KEY);
    if (!raw) {
      return { step: "privacy", bill: null, evidence: [], decision: null, mode: "live", warnings: [] };
    }
    const parsed = JSON.parse(raw) as SavedMediSession;
    if (parsed.bill && parsed.evidence) {
      const decision = buildMediDecision(
        parsed.bill,
        parsed.evidence,
        parsed.metrics || {
          queriesPlanned: 4,
          queriesRun: 4,
          liveSearches: 0,
          cacheHits: 0,
          sourcesKept: parsed.evidence.length,
          sourcesDropped: 0,
          mode: parsed.mode
        },
        parsed.warnings || [],
        locale
      );
      return {
        step: parsed.step === "letter" ? "letter" : "results",
        bill: parsed.bill,
        evidence: parsed.evidence,
        decision,
        mode: parsed.mode,
        metrics: parsed.metrics,
        warnings: parsed.warnings || []
      };
    }
  } catch {
    // Session corrupted or unavailable
  }
  return { step: "privacy", bill: null, evidence: [], decision: null, mode: "live", warnings: [] };
}

function MediShieldContent() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale: "en" | "hi" | "bn" = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

  const initialTab: MediTab = searchParams.get("tab") === "audit" || searchParams.get("mode") === "audit" ? "audit" : "cashless";
  const [activeTab, setActiveTab] = useState<MediTab>(initialTab);

  // --- Bill Audit State ---
  const [initialSession] = useState(() => getSavedMediSession(locale));
  const [step, setStep] = useState<FlowStep>(initialSession.step);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [redactedUrl, setRedactedUrl] = useState<string | null>(null);
  const [bill, setBill] = useState<Bill | null>(initialSession.bill);
  const [evidence, setEvidence] = useState<Evidence[]>(initialSession.evidence);
  const [decision, setDecision] = useState<MediDecision | null>(initialSession.decision);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>(initialSession.decision ? "done" : "idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [mode, setMode] = useState<"live" | "recorded">(initialSession.mode);
  const [metrics, setMetrics] = useState<EvidenceMetrics | undefined>(initialSession.metrics);
  const [warnings, setWarnings] = useState<string[]>(initialSession.warnings);
  const [isSaved, setIsSaved] = useState(false);

  // --- Ayushman Cashless Shield State ---
  const [cashlessStep, setCashlessStep] = useState<CashlessStep>("form");
  const [cashlessRequest, setCashlessRequest] = useState<AyushmanCashlessRequest | null>(null);
  const [cashlessDecision, setCashlessDecision] = useState<AyushmanCashlessDecision | null>(null);
  const [cashlessEvidence, setCashlessEvidence] = useState<Evidence[]>([]);
  const [cashlessEvents, setCashlessEvents] = useState<EvidenceEvent[]>([]);
  const [cashlessTrailStatus, setCashlessTrailStatus] = useState<TrailStatus>("idle");
  const [cashlessError, setCashlessError] = useState<string>();
  const [cashlessSaved, setCashlessSaved] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  // Dynamically derive active bill decision when bill, evidence, or locale changes
  const activeDecision = useMemo(() => {
    if (bill && evidence.length > 0) {
      return buildMediDecision(
        bill,
        evidence,
        metrics || {
          queriesPlanned: 4,
          queriesRun: 4,
          liveSearches: 0,
          cacheHits: 0,
          sourcesKept: evidence.length,
          sourcesDropped: 0,
          mode
        },
        warnings,
        locale
      );
    }
    return decision;
  }, [bill, evidence, metrics, warnings, mode, locale, decision]);

  // Save bill session whenever bill, evidence, or step changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (bill && evidence.length > 0 && (step === "results" || step === "letter")) {
        const sessionPayload: SavedMediSession = {
          step,
          bill,
          evidence,
          metrics: metrics || {
            queriesPlanned: 4,
            queriesRun: 4,
            liveSearches: 0,
            cacheHits: 0,
            sourcesKept: evidence.length,
            sourcesDropped: 0,
            mode
          },
          warnings,
          mode
        };
        sessionStorage.setItem(MEDI_SESSION_KEY, JSON.stringify(sessionPayload));
      }
    }
  }, [bill, evidence, step, metrics, warnings, mode]);

  // ----------------------------------------------------------------------
  // Bill Audit Handlers
  // ----------------------------------------------------------------------
  const handlePrivacyAccept = () => setStep("upload");
  const handleTypeManually = () => setStep("review");

  const handleFileSelect = (file: File) => {
    setRawFile(file);
    setStep("redact");
  };

  const handleRedactComplete = (url: string) => {
    setRedactedUrl(url);
    setStep("review");
  };

  const handleReviewConfirm = (confirmedBill: Bill) => {
    const selectedMode = getClientEvidenceMode();
    setBill(confirmedBill);
    setMode(selectedMode);
    setEvents([]);
    setErrorMessage(undefined);
    setTrailStatus("running");
    setStep("analyzing");
    setIsSaved(false);

    let collectedEvidence: Evidence[] = [];
    let collectedWarnings: string[] = [];

    void streamEvidenceRun(
      {
        module: "medi",
        subModule: "bill_audit",
        locale,
        mode: selectedMode,
        hospital: confirmedBill.hospital,
        city: confirmedBill.city,
        procedure: confirmedBill.procedure
      },
      (event) => {
        setEvents((current) => [...current, event]);

        if (event.type === "kept") {
          collectedEvidence.push(event.evidence);
        } else if (event.type === "done") {
          setTrailStatus("done");
          collectedWarnings = event.warnings || [];
          setMetrics(event.metrics);
          setWarnings(collectedWarnings);
          addClientEvidenceMetrics(event.metrics);

          if (event.evidence && event.evidence.length > 0) {
            collectedEvidence = event.evidence;
          }
          setEvidence(collectedEvidence);

          const computedDecision = buildMediDecision(
            confirmedBill,
            collectedEvidence,
            event.metrics,
            collectedWarnings,
            locale
          );
          setDecision(computedDecision);
        } else if (event.type === "error") {
          setTrailStatus("error");
          setErrorMessage(event.message);
        }
      }
    ).catch((error: unknown) => {
      setTrailStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "The evidence search could not be completed.");
    });
  };

  const handleStartOverAudit = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(MEDI_SESSION_KEY);
    }
    setStep("privacy");
    setRawFile(null);
    setRedactedUrl(null);
    setBill(null);
    setEvidence([]);
    setDecision(null);
    setEvents([]);
    setTrailStatus("idle");
    setErrorMessage(undefined);
    setIsSaved(false);
  };

  const handleSaveAuditCase = async () => {
    if (!bill || !activeDecision) return;
    try {
      await saveMediCase({
        id: crypto.randomUUID(),
        module: "medi",
        subModule: "bill_audit",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        hospital: bill.hospital,
        city: bill.city,
        procedure: bill.procedure,
        total: bill.total,
        items: bill.items,
        decision: activeDecision,
        mode,
        warnings
      });
      setIsSaved(true);
    } catch {
      // Storage failure handled silently or logged
    }
  };

  // ----------------------------------------------------------------------
  // Ayushman Cashless Shield Handlers
  // ----------------------------------------------------------------------
  const handleCashlessSubmit = (req: AyushmanCashlessRequest) => {
    const selectedMode = getClientEvidenceMode();
    setCashlessRequest(req);
    setMode(selectedMode);
    setCashlessEvents([]);
    setCashlessError(undefined);
    setCashlessTrailStatus("running");
    setCashlessStep("analyzing");
    setCashlessSaved(false);

    let collectedEvidence: Evidence[] = [];
    let collectedWarnings: string[] = [];

    void streamEvidenceRun(
      {
        module: "medi",
        subModule: "cashless_shield",
        locale,
        mode: selectedMode,
        hospital: req.hospital,
        city: req.city,
        state: req.state,
        procedure: req.procedure,
        depositDemanded: req.depositDemanded,
        patientName: req.patientName,
        pmjayId: req.pmjayId,
        demandedReason: req.demandedReason
      },
      (event) => {
        setCashlessEvents((current) => [...current, event]);

        if (event.type === "kept") {
          collectedEvidence.push(event.evidence);
        } else if (event.type === "done") {
          setCashlessTrailStatus("done");
          collectedWarnings = event.warnings || [];
          setWarnings(collectedWarnings);
          addClientEvidenceMetrics(event.metrics);

          if (event.evidence && event.evidence.length > 0) {
            collectedEvidence = event.evidence;
          }
          setCashlessEvidence(collectedEvidence);

          const computed =
            event.cashlessDecision ||
            buildAyushmanCashlessDecision({
              request: req,
              evidence: collectedEvidence,
              metrics: event.metrics,
              warnings: collectedWarnings,
              locale
            });

          setCashlessDecision(computed);
        } else if (event.type === "error") {
          setCashlessTrailStatus("error");
          setCashlessError(event.message);
        }
      }
    ).catch((error: unknown) => {
      setCashlessTrailStatus("error");
      setCashlessError(error instanceof Error ? error.message : "Evidence check could not be completed.");
    });
  };

  const handleStartOverCashless = () => {
    setCashlessStep("form");
    setCashlessRequest(null);
    setCashlessDecision(null);
    setCashlessEvidence([]);
    setCashlessEvents([]);
    setCashlessTrailStatus("idle");
    setCashlessError(undefined);
    setCashlessSaved(false);
  };

  const handleSaveCashlessCase = async () => {
    if (!cashlessRequest || !cashlessDecision) return;
    try {
      await saveMediCase({
        id: crypto.randomUUID(),
        module: "medi",
        subModule: "cashless_shield",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        hospital: cashlessRequest.hospital,
        city: cashlessRequest.city,
        state: cashlessRequest.state,
        procedure: cashlessRequest.procedure,
        total: 0,
        depositDemanded: cashlessRequest.depositDemanded,
        patientName: cashlessRequest.patientName,
        pmjayId: cashlessRequest.pmjayId,
        items: [],
        cashlessDecision,
        mode,
        warnings
      });
      setCashlessSaved(true);
    } catch {
      // Storage error handled
    }
  };

  return (
    <div className="min-h-screen bg-paper pt-8 pb-24 px-4 md:px-8">
      {/* Top Header & Dual Mode Switcher */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nil/10 text-nil font-semibold text-xs tracking-wider uppercase mb-2">
          MediShield Healthcare Defense
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink font-bold mb-2">
          Hospital & Ayushman Protection
        </h1>
        <p className="text-ink-soft text-sm md:text-base mb-6">
          Defending patients from illegal advance cash deposits, unapproved consumables, and inflated billing.
        </p>

        {/* Dual Tab Switcher */}
        <div className="inline-flex rounded-2xl border-[1.5px] border-ink/20 p-1.5 bg-paper-2 shadow-xs text-xs md:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("cashless")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "cashless"
                ? "bg-nil text-paper shadow-sm"
                : "text-ink hover:text-nil hover:bg-paper"
            }`}
          >
            <span>🛡️ Ayushman Cashless Shield</span>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                activeTab === "cashless" ? "bg-paper/20 text-paper" : "bg-nil/10 text-nil"
              } hidden md:inline`}
            >
              Deposit Refusal
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "audit"
                ? "bg-nil text-paper shadow-sm"
                : "text-ink hover:text-nil hover:bg-paper"
            }`}
          >
            <span>📋 Hospital Bill Audit</span>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                activeTab === "audit" ? "bg-paper/20 text-paper" : "bg-nil/10 text-nil"
              } hidden md:inline`}
            >
              Discharge Review
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: AYUSHMAN CASHLESS SHIELD */}
      {/* ==================================================================== */}
      {activeTab === "cashless" && (
        <>
          {cashlessStep === "form" && (
            <CashlessForm onSubmit={handleCashlessSubmit} loading={cashlessTrailStatus === "running"} />
          )}

          {cashlessStep === "analyzing" && (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl text-ink mb-2">
                  Verifying Hospital Empanelment & PM-JAY Clause 8.2 with SerpApi
                </h2>
                <p className="text-ink-soft text-sm">
                  Checking official registries for {cashlessRequest?.hospital} in {cashlessRequest?.city}, {cashlessRequest?.state}.
                </p>
              </div>
              <EvidenceTrail
                status={cashlessTrailStatus}
                events={cashlessEvents}
                errorMessage={cashlessError}
                mode={mode}
                onContinue={cashlessTrailStatus === "done" ? () => setCashlessStep("results") : undefined}
              />
            </div>
          )}

          {cashlessStep === "results" && cashlessDecision && (
            <>
              <CashlessResults
                decision={cashlessDecision}
                evidence={cashlessEvidence}
                onOpenLetter={() => setIsLetterModalOpen(true)}
                onStartOver={handleStartOverCashless}
                onSave={handleSaveCashlessCase}
                saved={cashlessSaved}
                locale={locale}
              />
              <CashlessLetterModal
                isOpen={isLetterModalOpen}
                onClose={() => setIsLetterModalOpen(false)}
                decision={cashlessDecision}
                initialLocale={locale}
              />
            </>
          )}
        </>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: HOSPITAL BILL AUDIT */}
      {/* ==================================================================== */}
      {activeTab === "audit" && (
        <>
          {step === "privacy" && (
            <PrivacyNotice onAccept={handlePrivacyAccept} onTypeManually={handleTypeManually} />
          )}

          {step === "upload" && (
            <BillUpload onFileSelect={handleFileSelect} onTypeManually={handleTypeManually} />
          )}

          {step === "redact" && rawFile && (
            <RedactTool file={rawFile} onComplete={handleRedactComplete} />
          )}

          {step === "review" && (
            <ExtractionReview
              imageUrl={redactedUrl}
              initialBill={bill}
              onConfirm={handleReviewConfirm}
              onBack={() => setStep(rawFile ? "upload" : "privacy")}
            />
          )}

          {step === "analyzing" && (
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-ink mb-2">Searching Official Evidence with SerpApi</h1>
                <p className="text-ink-soft text-sm">
                  We query only the confirmed hospital name ({bill?.hospital}), city ({bill?.city}), and procedure ({bill?.procedure}). Zero health data is shared.
                </p>
              </div>
              <EvidenceTrail
                status={trailStatus}
                events={events}
                errorMessage={errorMessage}
                mode={mode}
                onContinue={trailStatus === "done" ? () => setStep("results") : undefined}
              />
            </div>
          )}

          {step === "results" && (
            <BillResults
              bill={bill}
              decision={activeDecision}
              evidence={evidence}
              onOpenLetter={() => setStep("letter")}
              onStartOver={handleStartOverAudit}
              onSave={handleSaveAuditCase}
              saved={isSaved}
            />
          )}

          {step === "letter" && (
            <LetterEditor bill={bill} decision={activeDecision} onBack={() => setStep("results")} />
          )}
        </>
      )}
    </div>
  );
}

export default function MediShieldPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="text-center">
            <span className="w-8 h-8 border-4 border-nil border-t-transparent rounded-full animate-spin inline-block mb-3" />
            <div className="text-ink-soft text-sm font-semibold">Loading MediShield...</div>
          </div>
        </div>
      }
    >
      <MediShieldContent />
    </Suspense>
  );
}
