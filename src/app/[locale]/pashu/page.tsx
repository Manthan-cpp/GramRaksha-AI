"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PashuForm } from "@/components/pashu/PashuForm";
import { PashuResults } from "@/components/pashu/PashuResults";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { addClientEvidenceMetrics } from "@/lib/evidence/client-state";
import { buildPashuDecision } from "@/lib/pashu/decision";
import { savePashuCase } from "@/lib/storage/pashu-cases";
import type {
  Evidence,
  EvidenceEvent,
  EvidenceMetrics,
  PashuDecision,
  PashuEvidenceRequest
} from "@/lib/schemas";
import { HeartPulse, ArrowLeft, PhoneCall, AlertTriangle, ShieldCheck } from "lucide-react";

type FlowStep = "form" | "analyzing" | "results";

interface ActivePashuSession {
  request: PashuEvidenceRequest;
  evidence: Evidence[];
  metrics: EvidenceMetrics;
  warnings: string[];
  isSaved?: boolean;
}

const SESSION_KEY = "gramraksha:active_pashu_session";

export default function PashuPage() {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale === "hi" || params?.locale === "bn" ? params.locale : "en") as "en" | "hi" | "bn";

  const [step, setStep] = useState<FlowStep>("form");
  const [activeRequest, setActiveRequest] = useState<PashuEvidenceRequest | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [decision, setDecision] = useState<PashuDecision | null>(null);
  const [, setMode] = useState<"live" | "recorded">("live");
  const [streamEvents, setStreamEvents] = useState<EvidenceEvent[]>([]);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: ActivePashuSession = JSON.parse(raw);
        if (session && session.request && Array.isArray(session.evidence)) {
          setActiveRequest(session.request);
          setEvidence(session.evidence);
          setMode(session.request.mode || "live");
          const translatedDecision = buildPashuDecision({
            request: session.request,
            evidence: session.evidence,
            metrics: session.metrics || {
              queriesPlanned: 4,
              queriesRun: session.evidence.length,
              liveSearches: 1,
              cacheHits: 0,
              sourcesKept: session.evidence.length,
              sourcesDropped: 0,
              mode: session.request.mode || "live"
            },
            warnings: session.warnings || [],
            locale
          });
          setDecision(translatedDecision);
          setStep("results");
          if (session.isSaved) setIsSaved(true);
          return;
        }
      }
    } catch {
    }

    if (step === "results" && activeRequest && evidence.length > 0) {
      const translatedDecision = buildPashuDecision({
        request: activeRequest,
        evidence,
        locale
      });
      setDecision(translatedDecision);
    }
  }, [locale]);

  const handleReset = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setStep("form");
    setActiveRequest(null);
    setEvidence([]);
    setDecision(null);
    setStreamEvents([]);
    setTrailStatus("idle");
    setErrorMsg(null);
    setIsSaved(false);
  };

  const handleStartAnalysis = async (request: PashuEvidenceRequest) => {
    setActiveRequest(request);
    setMode(request.mode || "live");
    setStep("analyzing");
    setTrailStatus("running");
    setErrorMsg(null);
    setStreamEvents([]);

    let collectedEvidence: Evidence[] = [];
    let latestMetrics: EvidenceMetrics = {
      queriesPlanned: 4,
      queriesRun: 0,
      liveSearches: 0,
      cacheHits: 0,
      sourcesKept: 0,
      sourcesDropped: 0,
      mode: request.mode || "live"
    };
    let warnings: string[] = [];

    try {
      await streamEvidenceRun(request, (event) => {
        setStreamEvents((prev) => [...prev, event]);

        if (event.type === "done") {
          collectedEvidence = event.evidence;
          latestMetrics = event.metrics;
          warnings = event.warnings;
          addClientEvidenceMetrics(event.metrics);
        } else if (event.type === "error" && !event.recoverable) {
          setErrorMsg(event.message);
        }
      });

      setEvidence(collectedEvidence);
      setTrailStatus("done");

      const finalDecision = buildPashuDecision({
        request,
        evidence: collectedEvidence,
        metrics: latestMetrics,
        warnings,
        locale
      });

      setDecision(finalDecision);
      setStep("results");

      try {
        const sessionData: ActivePashuSession = {
          request,
          evidence: collectedEvidence,
          metrics: latestMetrics,
          warnings,
          isSaved: false
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch {}

      try {
        await savePashuCase({
          id: crypto.randomUUID(),
          module: "pashu",
          version: 1,
          createdAt: new Date().toISOString(),
          locale,
          animal: request.animal,
          concern: request.concern,
          state: request.state,
          district: request.district,
          decision: finalDecision,
          evidence: collectedEvidence,
          mode: request.mode || "live",
          warnings
        });
        setIsSaved(true);
        try {
          const raw = sessionStorage.getItem(SESSION_KEY);
          if (raw) {
            const session = JSON.parse(raw);
            session.isSaved = true;
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          }
        } catch {}
      } catch {
      }
    } catch (err) {
      setTrailStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Evidence run failed. Please try again.");
    }
  };

  const handleManualSave = async () => {
    if (!decision || !activeRequest) return;
    try {
      await savePashuCase({
        id: crypto.randomUUID(),
        module: "pashu",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        animal: activeRequest.animal,
        concern: activeRequest.concern,
        state: activeRequest.state,
        district: activeRequest.district,
        decision,
        evidence,
        mode: activeRequest.mode || "live",
        warnings: []
      });
      setIsSaved(true);
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          session.isSaved = true;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
      } catch {}
    } catch {
      alert("Unable to save case to local storage.");
    }
  };

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-ink-soft">
              <Link href={`/${locale}`} className="hover:text-ink transition-colors">
                GramRaksha
              </Link>
              <span>/</span>
              <span className="text-amber-800">PashuSahay</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink flex items-center gap-2.5">
              <HeartPulse className="w-8 h-8 text-amber-700" />
              <span>{locale === "hi" ? "पशुसहाय (पशु स्वास्थ्य एवं चिकित्सा सलाह)" : locale === "bn" ? "পশুসহায় (পশু চিকিৎসা ও পরামর্শ)" : "PashuSahay (Livestock Health & Vet Guidance)"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft max-w-2xl">
              {locale === "hi"
                ? "गाय, भैंस, बकरी, भेड़ आदि के लिए तत्काल प्राथमिक उपचार, क्या न करें की चेतावनी, 1962 एम्बुलेंस एवं निकटतम सरकारी पशु चिकित्सालय।"
                : locale === "bn"
                ? "গরু, মহিষ, ছাগল ও ভেড়ার জরুরি প্রাথমিক চিকিৎসা, কি করবেন না সতর্কতা, ১৯ba২ অ্যাম্বুলেন্স ও নিকটস্থ সরকারি পশু হাসপাতাল।"
                : "Spoon-fed step-by-step home first aid, critical quack warnings, 1962 animal ambulance dispatch, and Google Maps veterinary hospitals."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:1962"
              className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold border-[2px] border-ink shadow-[3px_3px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>1962 MVU Ambulance</span>
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {step === "form" && (
          <div className="space-y-6">
            <PashuForm onSubmit={handleStartAnalysis} />
          </div>
        )}

        {step === "analyzing" && (
          <div className="space-y-6 bg-white/40 backdrop-blur-md rounded-3xl border-[2px] border-ink p-6 sm:p-8 shadow-[6px_6px_0_rgba(62,39,35,1)]">
            <div className="flex items-center justify-between pb-4 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 text-amber-700 animate-pulse" />
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {locale === "hi" ? "सत्यापित पशु चिकित्सा सलाह खोजी जा रही है..." : locale === "bn" ? "পশু চিকিৎসা তথ্য অনুসন্ধান করা হচ্ছে..." : "Searching ICAR, IVRI & Maps Guidelines..."}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {activeRequest?.animal}: {activeRequest?.concern} ({activeRequest?.district}, {activeRequest?.state})
                  </p>
                </div>
              </div>
            </div>

            <EvidenceTrail events={streamEvents} status={trailStatus} />

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border-[2px] border-red-700 text-red-950 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-white text-ink text-xs font-bold border border-ink hover:bg-neutral-100"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}

        {step === "results" && decision && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-ink text-xs font-bold border-[2px] border-ink shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{locale === "hi" ? "नया पशु / लक्षण जांचें" : locale === "bn" ? "নতুন পশুর তথ্য যাচাই" : "Check Another Issue"}</span>
              </button>
            </div>

            <PashuResults
              decision={decision}
              evidence={evidence}
              onSaveCase={handleManualSave}
              isSaved={isSaved}
            />
          </div>
        )}
      </main>
    </div>
  );
}
