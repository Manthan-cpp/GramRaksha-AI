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
import { Button } from "@/components/ui/button";

export default function KrishiPage() {
  const t = useTranslations("Krishi");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { active.current?.abort(); }, []);
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

  const [phase, setPhase] = useState<"stepper" | "trail" | "brief">("stepper");
  const [context, setContext] = useState<CropProfile | null>(null);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [mode, setMode] = useState<"live" | "recorded">("live");
  const [brief, setBrief] = useState<CropBrief | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleReset = () => {
    active.current?.abort();
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
