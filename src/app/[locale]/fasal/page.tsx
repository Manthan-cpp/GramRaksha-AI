"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FasalForm } from "@/components/fasal/FasalForm";
import { FasalResults } from "@/components/fasal/FasalResults";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { addClientEvidenceMetrics } from "@/lib/evidence/client-state";
import { buildFasalDecision } from "@/lib/fasal/decision";
import { saveFasalCase } from "@/lib/storage/fasal-cases";
import type {
  Evidence,
  EvidenceEvent,
  EvidenceMetrics,
  FasalDecision,
  FasalEvidenceRequest,
  FasalPhotoEvidence
} from "@/lib/schemas";
import type { FasalIncidentInput } from "@/lib/fasal/types";
import { Clock, ArrowLeft, AlertTriangle } from "lucide-react";

type FlowStep = "form" | "analyzing" | "results";

const ACTIVE_FASAL_SESSION_KEY = "gramraksha:active_fasal_session";

interface ActiveFasalSession {
  incident: FasalIncidentInput;
  photos: FasalPhotoEvidence[];
  evidence: Evidence[];
  metrics?: EvidenceMetrics;
  warnings?: string[];
  mode?: "live" | "recorded";
}

export default function FasalPage() {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale === "hi" || params?.locale === "bn" ? params.locale : "en") as "en" | "hi" | "bn";

  const [step, setStep] = useState<FlowStep>("form");
  const [, setIncident] = useState<FasalIncidentInput | null>(null);
  const [photos, setPhotos] = useState<FasalPhotoEvidence[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [decision, setDecision] = useState<FasalDecision | null>(null);
  const [mode, setMode] = useState<"live" | "recorded">("live");
  const [streamEvents, setStreamEvents] = useState<EvidenceEvent[]>([]);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(ACTIVE_FASAL_SESSION_KEY);
    if (!raw) return;
    try {
      const parsed: ActiveFasalSession = JSON.parse(raw);
      if (parsed?.incident) {
        setIncident(parsed.incident);
        setPhotos(parsed.photos || []);
        setEvidence(parsed.evidence || []);
        setMode(parsed.mode || "live");
        const nextDecision = buildFasalDecision({
          incident: parsed.incident,
          photos: parsed.photos || [],
          evidence: parsed.evidence || [],
          metrics: parsed.metrics,
          warnings: parsed.warnings,
          locale
        });
        setDecision(nextDecision);
        setStep("results");
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    } catch (e) {
      console.error("Failed to restore active fasal session:", e);
    }
  }, [locale]);

  const handleStartAnalysis = async (data: {
    incident: FasalIncidentInput;
    photos: FasalPhotoEvidence[];
    mode: "live" | "recorded";
  }) => {
    setIncident(data.incident);
    setPhotos(data.photos);
    setMode(data.mode);
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
      mode: data.mode
    };
    let warnings: string[] = [];

    const request: FasalEvidenceRequest = {
      module: "fasal",
      locale,
      mode: data.mode,
      state: data.incident.state,
      district: data.incident.district,
      calamityType: data.incident.calamityType,
      crop: data.incident.crop
    };

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

      const finalDecision = buildFasalDecision({
        incident: data.incident,
        photos: data.photos,
        evidence: collectedEvidence,
        metrics: latestMetrics,
        warnings,
        locale
      });

      setDecision(finalDecision);
      setStep("results");

      // Cache active session in sessionStorage to support seamless language switching
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            ACTIVE_FASAL_SESSION_KEY,
            JSON.stringify({
              incident: data.incident,
              photos: data.photos,
              evidence: collectedEvidence,
              metrics: latestMetrics,
              warnings,
              mode: data.mode
            })
          );
        } catch (e) {
          console.error("Failed to cache fasal session:", e);
        }
      }

      // Automatically persist to Dexie IndexedDB
      try {
        await saveFasalCase({
          id: crypto.randomUUID(),
          module: "fasal",
          version: 1,
          createdAt: new Date().toISOString(),
          locale,
          incident: data.incident,
          photos: data.photos,
          decision: finalDecision,
          evidence: collectedEvidence,
          mode: data.mode,
          warnings
        });
      } catch (e) {
        console.error("Dexie auto-save error:", e);
      }
    } catch (err) {
      console.error("Evidence run failed:", err);
      // Fallback decision with local rule computation so farmer is never left without guidance
      const fallbackDecision = buildFasalDecision({
        incident: data.incident,
        photos: data.photos,
        evidence: collectedEvidence,
        metrics: latestMetrics,
        warnings: ["Search offline; showing statutory PMFBY rules and helpline directory."],
        locale
      });
      setEvidence(collectedEvidence);
      setDecision(fallbackDecision);
      setTrailStatus("done");
      setStep("results");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            ACTIVE_FASAL_SESSION_KEY,
            JSON.stringify({
              incident: data.incident,
              photos: data.photos,
              evidence: collectedEvidence,
              metrics: latestMetrics,
              warnings: ["Search offline; showing statutory PMFBY rules and helpline directory."],
              mode: data.mode
            })
          );
        } catch (e) {
          console.error("Failed to cache fallback fasal session:", e);
        }
      }
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACTIVE_FASAL_SESSION_KEY);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    setStep("form");
    setDecision(null);
    setEvidence([]);
    setPhotos([]);
    setIncident(null);
  };

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* Top Navbar */}
      <header className="border-b border-ink/10 bg-paper sticky top-0 z-30 px-6 py-4 backdrop-blur-sm bg-paper/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-ink hover:opacity-80 transition-opacity text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <Image
              src="/images/logo.png"
              alt="GramRaksha AI"
              width={120}
              height={40}
              unoptimized
              className="h-6 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-900">
              <Clock className="w-4 h-4 text-amber-700" />
            </span>
            <span className="font-display font-bold text-base text-ink">
              {locale === "hi" ? "फसल बीमा 72-घंटे किट" : locale === "bn" ? "ফসল বিমা ৭২-ঘণ্টার কিট" : "Fasal Bima 72-Hour Kit"}
            </span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-mono text-ink-soft hover:text-ink underline"
          >
            {locale === "hi" ? "केस डैशबोर्ड" : locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {step === "form" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono mb-3">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>PMFBY Statutory Clause 15.3 Intimation</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl text-ink font-bold leading-tight">
                {locale === "hi"
                  ? "फसल क्षति की 72-घंटे में अनिवार्य सूचना दें"
                  : locale === "bn"
                  ? "ফসলের ক্ষতি ৭২ ঘণ্টার মধ্যে জানান"
                  : "Report Crop Loss Within 72 Hours"}
              </h1>
              <p className="text-ink-soft text-sm sm:text-base mt-3 leading-relaxed">
                {locale === "hi"
                  ? "ओलावृष्टि, बाढ़/जलभराव या आकाशीय बिजली से हुए नुकसान की सूचना 72 घंटे में देना अनिवार्य है। यह किट उलटी गिनती शुरू करती है, स्थानीय बीमा कंपनी खोजती है और आधिकारिक आवेदन तैयार करती है।"
                  : locale === "bn"
                  ? "শিলাবৃষ্টি, বন্যা বা বজ্রপাতে ফসল নষ্ট হলে ৭২ ঘণ্টার মধ্যে জানানো বাধ্যতামূলক। এই টুলটি কাউন্টডাউন শুরু করে, অফিসিয়াল বিমা কোম্পানি খুঁজে দেয় এবং চিঠি তৈরি করে।"
                  : "Under PMFBY guidelines, localized calamities require formal intimation within 72 hours. This kit starts your countdown, finds the empanelled insurer and DAO, and drafts the legal notice."}
              </p>
            </div>

            <FasalForm onSubmit={handleStartAnalysis} />
          </div>
        )}

        {step === "analyzing" && (
          <div className="max-w-2xl mx-auto py-12 space-y-8 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
              <Clock className="w-8 h-8 text-amber-700 absolute inset-0 m-auto" />
            </div>

            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold mb-2">
                {locale === "hi"
                  ? "72-घंटे की किट एवं बीमा विवरण सत्यापित किया जा रहा है..."
                  : locale === "bn"
                  ? "৭২ ঘণ্টার কিট ও বিমা তথ্য যাচাই করা হচ্ছে..."
                  : "Verifying 72-Hour Kit & District Insurer..."}
              </h2>
              <p className="text-sm text-ink-soft">
                {locale === "hi"
                  ? "पीएमएफबीवाई दिशानिर्देश, ज़िला कृषि अधिकारी का पता और कानूनी प्रारूप तैयार किया जा रहा है।"
                  : locale === "bn"
                  ? "সরকারি নির্দেশিকা, কৃষি আধিকারিকের ঠিকানা এবং আইনি দাবি ফরম্যাট সাজানো হচ্ছে।"
                  : "Checking PMFBY guidelines, querying District Agriculture Office, and formatting statutory intimation letter."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="text-left bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm">
              <EvidenceTrail events={streamEvents} status={trailStatus} mode={mode} />
            </div>
          </div>
        )}

        {step === "results" && decision && (
          <FasalResults
            decision={decision}
            evidence={evidence}
            photos={photos}
            onReset={handleReset}
            mode={mode}
          />
        )}
      </main>
    </div>
  );
}
