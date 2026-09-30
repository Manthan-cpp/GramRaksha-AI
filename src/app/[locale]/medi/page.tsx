"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PrivacyNotice } from "@/components/medi/PrivacyNotice";
import { BillUpload } from "@/components/medi/BillUpload";
import { RedactTool } from "@/components/medi/RedactTool";
import { ExtractionReview } from "@/components/medi/ExtractionReview";
import { BillResults } from "@/components/medi/BillResults";
import { LetterEditor } from "@/components/medi/LetterEditor";
import { Bill, type Evidence, type EvidenceEvent, type EvidenceMetrics, type MediDecision } from "@/lib/schemas";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { addClientEvidenceMetrics, getClientEvidenceMode } from "@/lib/evidence/client-state";
import { buildMediDecision } from "@/lib/medi/decision";
import { saveMediCase } from "@/lib/storage/medi-cases";

type FlowStep = "privacy" | "upload" | "redact" | "review" | "analyzing" | "results" | "letter";

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

export default function MediShieldPage() {
  const params = useParams<{ locale?: string }>();
  const locale: "en" | "hi" | "bn" = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

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

  // Dynamically derive active decision when bill, evidence, or locale changes
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

  // Save session whenever bill, evidence, or step changes
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

  const handleStartOver = () => {
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

  const handleSaveCase = async () => {
    if (!bill || !activeDecision) return;
    try {
      await saveMediCase({
        id: crypto.randomUUID(),
        module: "medi",
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

  return (
    <div className="min-h-screen bg-paper pt-10 pb-24 px-4 md:px-8">
      {step !== "letter" && step !== "results" && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nil/10 text-nil font-semibold text-xs tracking-wider uppercase mb-2">
            MediShield
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-1">Hospital Bill Protection</h1>
          <p className="text-ink-soft text-sm md:text-base max-w-lg mx-auto">
            Audit hospital charges against official government package benchmarks, patient charter rights, and grievance helplines.
          </p>
        </div>
      )}

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
            <h1 className="font-display text-3xl text-ink mb-2">Searching Official Evidence with Serp API</h1>
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
          onStartOver={handleStartOver}
          onSave={handleSaveCase}
          saved={isSaved}
        />
      )}

      {step === "letter" && (
        <LetterEditor bill={bill} decision={activeDecision} onBack={() => setStep("results")} />
      )}
    </div>
  );
}
