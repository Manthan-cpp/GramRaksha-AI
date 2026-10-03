"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurakshaForm } from "@/components/suraksha/SurakshaForm";
import { SurakshaResults } from "@/components/suraksha/SurakshaResults";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { addClientEvidenceMetrics } from "@/lib/evidence/client-state";
import { buildSurakshaDecision } from "@/lib/suraksha/decision";
import { saveSurakshaCase } from "@/lib/storage/suraksha-cases";
import type {
  Evidence,
  EvidenceEvent,
  EvidenceMetrics,
  SurakshaDecision,
  SurakshaEvidenceRequest
} from "@/lib/schemas";
import { ShieldAlert, ArrowLeft, HelpCircle } from "lucide-react";

type FlowStep = "form" | "analyzing" | "results";

const ACTIVE_SURAKSHA_SESSION_KEY = "gramraksha:active_suraksha_session";

interface ActiveSurakshaSession {
  content: string;
  sourceType: "whatsapp" | "sms" | "link" | "apk" | "other";
  appName?: string;
  evidence: Evidence[];
  metrics?: EvidenceMetrics;
  warnings: string[];
  mode: "live" | "recorded";
}

export default function SurakshaPage() {
  const params = useParams<{ locale?: string }>();
  const locale: "en" | "hi" | "bn" =
    params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

  const [step, setStep] = useState<FlowStep>("form");
  const [content, setContent] = useState<string>("");
  const [sourceType, setSourceType] = useState<"whatsapp" | "sms" | "link" | "apk" | "other">("whatsapp");
  const [appName, setAppName] = useState<string | undefined>(undefined);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [decision, setDecision] = useState<SurakshaDecision | null>(null);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [mode, setMode] = useState<"live" | "recorded">("live");
  const [metrics, setMetrics] = useState<EvidenceMetrics | undefined>(undefined);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(ACTIVE_SURAKSHA_SESSION_KEY);
    if (!raw) return;
    try {
      const parsed: ActiveSurakshaSession = JSON.parse(raw);
      if (parsed?.content && parsed?.evidence) {
        setContent(parsed.content);
        setSourceType(parsed.sourceType || "whatsapp");
        setAppName(parsed.appName);
        setEvidence(parsed.evidence);
        setMetrics(parsed.metrics);
        setWarnings(parsed.warnings || []);
        setMode(parsed.mode || "live");
        const nextDecision = buildSurakshaDecision(
          {
            module: "suraksha",
            locale,
            content: parsed.content,
            sourceType: parsed.sourceType || "whatsapp",
            appName: parsed.appName,
            mode: parsed.mode || "live"
          },
          parsed.evidence,
          parsed.metrics || {
            queriesPlanned: 4,
            queriesRun: 4,
            liveSearches: 0,
            cacheHits: 0,
            sourcesKept: parsed.evidence.length,
            sourcesDropped: 0,
            mode: parsed.mode || "live"
          },
          parsed.warnings || [],
          locale
        );
        setDecision(nextDecision);
        setStep("results");
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    } catch (e) {
      console.error("Failed to restore active suraksha session:", e);
    }
  }, [locale]);

  // Derive localized decision without triggering cascading state updates
  const activeDecision = useMemo(() => {
    if (decision && content && evidence.length > 0) {
      return buildSurakshaDecision(
        {
          module: "suraksha",
          locale,
          content,
          sourceType,
          appName,
          mode
        },
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
  }, [decision, locale, content, evidence, sourceType, appName, mode, metrics, warnings]);

  const handleRunAudit = async (data: {
    content: string;
    sourceType: "whatsapp" | "sms" | "link" | "apk" | "other";
    appName?: string;
    mode: "live" | "recorded";
  }) => {
    setContent(data.content);
    setSourceType(data.sourceType);
    setAppName(data.appName);
    setMode(data.mode);
    setStep("analyzing");
    setTrailStatus("running");
    setEvents([]);
    setErrorMessage(undefined);
    setIsSaved(false);

    const request: SurakshaEvidenceRequest = {
      module: "suraksha",
      locale,
      content: data.content,
      sourceType: data.sourceType,
      appName: data.appName,
      mode: data.mode
    };

    let latestEvidence: Evidence[] = [];
    let latestMetrics: EvidenceMetrics | undefined;
    let latestWarnings: string[] = [];
    let latestDecision: SurakshaDecision | undefined;

    try {
      await streamEvidenceRun(request, (event) => {
        setEvents((prev) => [...prev, event]);
        if (event.type === "done") {
          latestEvidence = event.evidence;
          latestMetrics = event.metrics;
          latestWarnings = event.warnings;
          if (event.surakshaDecision) {
            latestDecision = event.surakshaDecision;
          }
          if (event.metrics) {
            addClientEvidenceMetrics(event.metrics);
          }
        } else if (event.type === "error") {
          setErrorMessage(event.message);
          setTrailStatus("error");
        }
      });

      if (!latestDecision) {
        latestDecision = buildSurakshaDecision(
          request,
          latestEvidence,
          latestMetrics || {
            queriesPlanned: 4,
            queriesRun: 4,
            liveSearches: 0,
            cacheHits: 0,
            sourcesKept: latestEvidence.length,
            sourcesDropped: 0,
            mode: data.mode
          },
          latestWarnings,
          locale
        );
      }

      setEvidence(latestEvidence);
      setMetrics(latestMetrics);
      setWarnings(latestWarnings);
      setDecision(latestDecision);
      setTrailStatus("done");
      setStep("results");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            ACTIVE_SURAKSHA_SESSION_KEY,
            JSON.stringify({
              content: data.content,
              sourceType: data.sourceType,
              appName: data.appName,
              evidence: latestEvidence,
              metrics: latestMetrics,
              warnings: latestWarnings,
              mode: data.mode
            })
          );
        } catch (e) {
          console.error("Failed to cache suraksha session:", e);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Evidence search failed.");
      setTrailStatus("error");
    }
  };

  const handleSaveCase = async () => {
    if (!activeDecision) return;
    try {
      await saveSurakshaCase({
        id: crypto.randomUUID(),
        module: "suraksha",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        content,
        sourceType,
        appName,
        decision: activeDecision,
        evidence,
        mode,
        warnings
      });
      setIsSaved(true);
    } catch {
      // Save error
    }
  };

  const handleStartOver = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACTIVE_SURAKSHA_SESSION_KEY);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    setStep("form");
    setContent("");
    setDecision(null);
    setEvidence([]);
    setEvents([]);
    setTrailStatus("idle");
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-paper-2 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-ink/70 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {locale === "hi" ? "मुखपृष्ठ पर लौटें" : locale === "bn" ? "হোমপেজে ফিরুন" : "Back to Home"}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/dashboard`}
              className="text-xs font-bold text-ink/70 hover:text-forest transition-colors"
            >
              {locale === "hi" ? "केस डैशबोर्ड" : locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
            </Link>
            <Link
              href={`/${locale}/help`}
              className="p-1.5 rounded-full hover:bg-paper-1 text-ink/70 hover:text-ink transition-colors"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* View Steps */}
        {step === "form" && (
          <SurakshaForm onSubmit={handleRunAudit} isLoading={false} />
        )}

        {step === "analyzing" && (
          <div className="space-y-4">
            <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 text-center shadow-[4px_4px_0_0_#1b382b]">
              <div className="w-12 h-12 rounded-full bg-forest/10 border border-forest/30 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6 text-forest animate-pulse" />
              </div>
              <h3 className="text-xl font-serif font-black text-ink mb-1">
                {locale === "hi"
                  ? "संदेश एवं साइबर स्रोतों का विश्लेषण जारी है..."
                  : locale === "bn"
                    ? "বার্তা ও সাইবার উৎস বিশ্লেষণ করা হচ্ছে..."
                    : "Auditing Threat Indicators via Serp API..."}
              </h3>
              <p className="text-xs text-ink/60">
                Checking official portals (.gov.in), police advisories, and Google Play developer verification.
              </p>
            </div>

            <EvidenceTrail
              status={trailStatus}
              events={events}
              errorMessage={errorMessage}
              mode={mode}
              onContinue={() => setStep("results")}
            />
          </div>
        )}

        {step === "results" && activeDecision && (
          <SurakshaResults
            decision={activeDecision}
            evidence={evidence}
            content={content}
            sourceType={sourceType}
            onStartOver={handleStartOver}
            onSave={handleSaveCase}
            saved={isSaved}
          />
        )}
      </div>
    </div>
  );
}
