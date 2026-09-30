"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { CropStepper, type CropProfile } from "@/components/krishi/CropStepper";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";
import { BriefView } from "@/components/krishi/BriefView";
import { streamCropEvidence } from "@/components/krishi/stream";
import { addClientEvidenceMetrics, getClientEvidenceMode } from "@/lib/evidence/client-state";
import { CropBriefSchema, type CropBrief, type EvidenceEvent } from "@/lib/schemas";
import { buildCropDecision } from "@/lib/krishi/decision";
import { Button } from "@/components/ui/button";

const KRISHI_SESSION_KEY = "gramraksha_krishi_active_session";

interface SavedKrishiSession {
  phase: "stepper" | "trail" | "brief";
  context: CropProfile;
  brief: CropBrief | null;
  mode: "live" | "recorded";
  warnings: string[];
  trailStatus: TrailStatus;
  events: EvidenceEvent[];
}

function getSavedSession(locale: string): {
  phase: "stepper" | "trail" | "brief";
  context: CropProfile | null;
  brief: CropBrief | null;
  mode: "live" | "recorded";
  warnings: string[];
  trailStatus: TrailStatus;
  events: EvidenceEvent[];
} {
  if (typeof window === "undefined") {
    return { phase: "stepper", context: null, brief: null, mode: "live", warnings: [], trailStatus: "idle", events: [] };
  }
  try {
    const raw = sessionStorage.getItem(KRISHI_SESSION_KEY);
    if (!raw) return { phase: "stepper", context: null, brief: null, mode: "live", warnings: [], trailStatus: "idle", events: [] };
    const saved: SavedKrishiSession = JSON.parse(raw);
    if (!saved || !saved.context || !saved.phase) {
      return { phase: "stepper", context: null, brief: null, mode: "live", warnings: [], trailStatus: "idle", events: [] };
    }

    let brief = saved.brief;
    if (brief) {
      const parsed = CropBriefSchema.safeParse(brief);
      if (parsed.success) {
        const baseBrief = parsed.data;
        const reDecision = buildCropDecision(
          {
            module: "krishi",
            locale: locale === "hi" || locale === "bn" ? locale : "en",
            crop: saved.context.crop,
            state: saved.context.state,
            district: saved.context.district,
            stage: saved.context.stage,
            concern: saved.context.concern
          },
          baseBrief,
          {
            queriesPlanned: 7,
            queriesRun: 7,
            liveSearches: 1,
            cacheHits: 0,
            sourcesKept: baseBrief.sources.length,
            sourcesDropped: 0,
            mode: saved.mode || "live"
          },
          saved.warnings || []
        );
        brief = { ...baseBrief, decision: reDecision, locale: locale === "hi" || locale === "bn" ? locale : "en" };
      }
    }

    return {
      phase: saved.phase,
      context: saved.context,
      brief,
      mode: saved.mode || "live",
      warnings: saved.warnings || [],
      trailStatus: saved.trailStatus || (brief ? "done" : "idle"),
      events: saved.events || []
    };
  } catch {
    return { phase: "stepper", context: null, brief: null, mode: "live", warnings: [], trailStatus: "idle", events: [] };
  }
}

export default function KrishiPage() {
  const t = useTranslations("Krishi");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { active.current?.abort(); }, []);
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

  // Initialize state directly from session storage (preserves state on language change or reload)
  const [initial] = useState(() => getSavedSession(locale));
  const [phase, setPhase] = useState<"stepper" | "trail" | "brief">(initial.phase);
  const [context, setContext] = useState<CropProfile | null>(initial.context);
  const [events, setEvents] = useState<EvidenceEvent[]>(initial.events);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>(initial.trailStatus);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [mode, setMode] = useState<"live" | "recorded">(initial.mode);
  const [brief, setBrief] = useState<CropBrief | null>(initial.brief);
  const [warnings, setWarnings] = useState<string[]>(initial.warnings);

  // Keep sessionStorage in sync whenever user moves forward
  useEffect(() => {
    if (phase !== "stepper" && context) {
      try {
        sessionStorage.setItem(
          KRISHI_SESSION_KEY,
          JSON.stringify({
            phase,
            context,
            brief,
            mode,
            warnings,
            trailStatus,
            events: events.slice(-30)
          })
        );
      } catch {
        // ignore storage error
      }
    }
  }, [phase, context, brief, mode, warnings, trailStatus, events]);

  const handleReset = () => {
    active.current?.abort();
    try {
      sessionStorage.removeItem(KRISHI_SESSION_KEY);
    } catch {}
    setPhase("stepper");
    setContext(null);
    setBrief(null);
    setEvents([]);
    setTrailStatus("idle");
    setErrorMessage(undefined);
    setWarnings([]);
  };

  const handleStepperComplete = (profile: CropProfile) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBrief(null);
    setWarnings([]);
    const selectedMode = getClientEvidenceMode();
    setContext(profile);
    setMode(selectedMode);
    setEvents([]);
    setErrorMessage(undefined);
    setTrailStatus("running");
    setPhase("trail");

    void streamCropEvidence(
      {
        module: "krishi",
        locale,
        mode: selectedMode,
        crop: profile.crop,
        state: profile.state,
        district: profile.district,
        stage: profile.stage,
        concern: profile.concern
      },
      (event) => {
        if (controller.signal.aborted || active.current !== controller) return;
        setEvents((current) => [...current, event]);
        if (event.type === "done") {
          const parsed = CropBriefSchema.safeParse("cropBrief" in event ? event.cropBrief : null);
          setBrief(parsed.success ? parsed.data : null);
          setWarnings(parsed.success ? event.warnings : [...event.warnings, t("incomplete")]);
          setTrailStatus("done");
          addClientEvidenceMetrics(event.metrics);
        } else if (event.type === "error") {
          setTrailStatus("error");
          setErrorMessage(event.message);
        }
      },
      controller.signal
    ).catch(() => {
      if (controller.signal.aborted || active.current !== controller) return;
      setTrailStatus("error");
      setErrorMessage(t("failed"));
    });
  };

  return (
    <div className="min-h-screen bg-paper pt-8 pb-24">
      {phase === "stepper" && (
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-moss-deep mb-2">{t("title")}</h1>
            <p className="text-ink-soft max-w-lg mx-auto">{t("intro")}</p>
          </div>
          <CropStepper onComplete={handleStepperComplete} />
        </div>
      )}

      {phase === "trail" && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-ink mb-2">{t("gather")}</h1>
            <p className="text-ink-soft">{t("gatherDetail")}</p>
          </div>
          <EvidenceTrail
            status={trailStatus}
            events={events}
            errorMessage={errorMessage}
            mode={mode}
            onContinue={trailStatus === "done" ? () => setPhase("brief") : undefined}
          />
          <div className="max-w-3xl mx-auto mt-6 text-center">
            <Button variant="quiet" className="text-sm font-medium" onClick={handleReset}>
              ← {t("retry")}
            </Button>
          </div>
        </div>
      )}

      {phase === "brief" && (
        <div>
          <BriefView
            brief={brief}
            cropContext={context}
            warnings={warnings}
            mode={mode}
            onStartOver={handleReset}
          />
        </div>
      )}
    </div>
  );
}
