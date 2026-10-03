"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PocketCardForm } from "@/components/card/PocketCardForm";
import { PocketCardView } from "@/components/card/PocketCardView";
import type { VillagePocketCard, VillagePocketCardRequest } from "@/lib/pocket-card/types";
import { streamEvidenceRun } from "@/lib/evidence/client";
import { getClientEvidenceMode } from "@/lib/evidence/client-state";
import { buildVillagePocketCard } from "@/lib/pocket-card/decision";
import { savePocketCard, getPocketCard } from "@/lib/storage/pocket-cards";
import type { Evidence, EvidenceEvent } from "@/lib/schemas";
import { EvidenceTrail, type TrailStatus } from "@/components/krishi/EvidenceTrail";

const ACTIVE_CARD_SESSION_KEY = "gramraksha:active_card_session";

interface ActiveCardSession {
  request: VillagePocketCardRequest;
  evidence: Evidence[];
  card: VillagePocketCard;
  mode: "live" | "recorded";
}

function PocketCardContent() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale: "en" | "hi" | "bn" =
    params.locale === "hi" || params.locale === "bn" ? params.locale : "en";

  const [step, setStep] = useState<"form" | "generating" | "view">("form");
  const [card, setCard] = useState<VillagePocketCard | null>(null);
  const [trailStatus, setTrailStatus] = useState<TrailStatus>("idle");
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  // Restore active card on locale change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(ACTIVE_CARD_SESSION_KEY);
    if (!raw) return;
    try {
      const parsed: ActiveCardSession = JSON.parse(raw);
      if (parsed?.request && parsed?.card) {
        const nextCard = buildVillagePocketCard(
          parsed.request,
          parsed.evidence || [],
          parsed.mode || "live",
          locale
        );
        setCard(nextCard);
        setStep("view");
        setSaved(true);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    } catch (e) {
      console.error("Failed to restore active card session:", e);
    }
  }, [locale]);

  // Check if opening an existing card from query param ?id=...
  useEffect(() => {
    const cardId = searchParams.get("id");
    if (cardId) {
      getPocketCard(cardId).then((existing) => {
        if (existing) {
          setCard(existing);
          setStep("view");
          setSaved(true);
        }
      });
    }
  }, [searchParams]);

  const handleGenerate = (req: VillagePocketCardRequest) => {
    const mode = getClientEvidenceMode();
    setStep("generating");
    setTrailStatus("running");
    setEvents([]);
    setError(undefined);
    setSaved(false);

    let collectedEvidence: Evidence[] = [];

    void streamEvidenceRun(
      {
        module: "pocket_card",
        locale,
        mode,
        state: req.state,
        district: req.district,
        block: req.block,
        village: req.village,
        pinCode: req.pinCode,
        panchayatPradhanName: req.panchayatPradhanName,
        pradhanPhone: req.pradhanPhone
      },
      (event) => {
        setEvents((prev) => [...prev, event]);

        if (event.type === "kept") {
          collectedEvidence.push(event.evidence);
        } else if (event.type === "done") {
          setTrailStatus("done");
          const builtCard =
            event.pocketCard ||
            buildVillagePocketCard(req, collectedEvidence, mode, locale);

          setCard(builtCard);
          setStep("view");

          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                ACTIVE_CARD_SESSION_KEY,
                JSON.stringify({
                  request: req,
                  evidence: collectedEvidence,
                  card: builtCard,
                  mode
                })
              );
            } catch (e) {
              console.error("Failed to cache card session:", e);
            }
          }

          // Automatically cache into IndexedDB so it's instantly available offline
          savePocketCard(builtCard)
            .then(() => setSaved(true))
            .catch(() => {});
        } else if (event.type === "error") {
          setTrailStatus("error");
          setError(event.message);

          // Fallback graceful degradation: build pocket card using verified directory fallback
          const fallbackCard = buildVillagePocketCard(req, collectedEvidence, mode, locale);
          setCard(fallbackCard);
          setStep("view");

          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                ACTIVE_CARD_SESSION_KEY,
                JSON.stringify({
                  request: req,
                  evidence: collectedEvidence,
                  card: fallbackCard,
                  mode
                })
              );
            } catch (e) {
              console.error("Failed to cache fallback card session:", e);
            }
          }

          savePocketCard(fallbackCard)
            .then(() => setSaved(true))
            .catch(() => {});
        }
      }
    ).catch((err: unknown) => {
      setTrailStatus("error");
      setError(err instanceof Error ? err.message : "Evidence search stopped.");
      const fallbackCard = buildVillagePocketCard(req, collectedEvidence, mode, locale);
      setCard(fallbackCard);
      setStep("view");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            ACTIVE_CARD_SESSION_KEY,
            JSON.stringify({
              request: req,
              evidence: collectedEvidence,
              card: fallbackCard,
              mode
            })
          );
        } catch (e) {
          console.error("Failed to cache catch card session:", e);
        }
      }
    });
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACTIVE_CARD_SESSION_KEY);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    setStep("form");
    setCard(null);
    setTrailStatus("idle");
    setEvents([]);
    setError(undefined);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!card) return;
    try {
      await savePocketCard(card);
      setSaved(true);
    } catch {
      // Storage error
    }
  };

  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nil/10 text-nil font-semibold text-xs tracking-wider uppercase">
          <span>📇 Gram Raksha Offline System</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold">
          Emergency Pocket Card Generator
        </h1>
        <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
          Pre-fetch verified emergency places (PHC, Police Thana, KVK, DAO, DLSA) and national lifelines. Caches completely in local device memory for 100% offline access and wallet printing.
        </p>
      </div>

      {step === "form" && (
        <PocketCardForm onSubmit={handleGenerate} loading={trailStatus === "running"} />
      )}

      {step === "generating" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl bg-paper-2 border border-ink/15 text-center space-y-4">
            <span className="w-10 h-10 border-4 border-nil border-t-transparent rounded-full animate-spin inline-block" />
            <h3 className="font-display text-lg font-bold text-ink">
              Prefetching Village Emergency Places...
            </h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              Querying Google Maps for local Primary Health Centres and Police Stations, and searching official directories for Krishi Vigyan Kendra and Legal Aid desks.
            </p>
          </div>

          <EvidenceTrail
            events={events}
            status={trailStatus}
            errorMessage={error}
          />
        </div>
      )}

      {step === "view" && card && (
        <PocketCardView
          card={card}
          onReset={handleReset}
          onSave={handleSave}
          saved={saved}
        />
      )}
    </div>
  );
}

export default function PocketCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="text-center">
            <span className="w-8 h-8 border-4 border-nil border-t-transparent rounded-full animate-spin inline-block mb-3" />
            <div className="text-ink-soft text-sm font-semibold">Loading Emergency Pocket Card...</div>
          </div>
        </div>
      }
    >
      <PocketCardContent />
    </Suspense>
  );
}
