"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, CheckCircle, ExternalLink, Search, XCircle } from "lucide-react";
import type { EvidenceEvent } from "@/lib/schemas";
import { engineLabel } from "@/lib/evidence/trust";
import { useTranslations } from "next-intl";
import { SourceChip } from "./BriefView";
import { safeWebUrl } from "@/lib/krishi-share";

export type TrailStatus = "idle" | "running" | "done" | "error";

interface EvidenceTrailProps {
  status: TrailStatus;
  events?: EvidenceEvent[];
  errorMessage?: string;
  mode?: "live" | "recorded";
  onContinue?: () => void;
}

function iconFor(type: EvidenceEvent["type"]) {
  if (type === "searching") return <Search className="w-4 h-4" />;
  if (type === "reading") return <BookOpen className="w-4 h-4" />;
  if (type === "kept" || type === "done") return <CheckCircle className="w-4 h-4" />;
  if (type === "dropped" || type === "error") return <XCircle className="w-4 h-4" />;
  return <AlertCircle className="w-4 h-4" />;
}

export function EvidenceTrail({ status, events = [], errorMessage, mode = "live", onContinue }: EvidenceTrailProps) {
  const t = useTranslations("Krishi");
  if (status === "idle") {
    return (
      <Card className="max-w-2xl mx-auto border-dashed border-ink-soft/30">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-ink-soft/40 mb-4" />
          <h3 className="font-display text-xl text-ink mb-2">{t("idle")}</h3>
          <p className="text-ink-soft max-w-sm">
            {t("idleDetail")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = events[events.length - 1];
  const keptEvents = events.filter((event): event is Extract<EvidenceEvent, { type: "kept" }> => event.type === "kept");
  const droppedEvents = events.filter((event): event is Extract<EvidenceEvent, { type: "dropped" }> => event.type === "dropped");
  const droppedCount = droppedEvents.length;
  const flowEvents = events.filter((event) => event.type !== "dropped");

  return (
    <Card className="max-w-3xl mx-auto border-ink-soft/30">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b-[1.5px] border-dashed border-ink-soft/30 pb-5">
          <div>
            <h3 className="font-display text-2xl text-ink">{t("trail")}</h3>
            <p className="text-sm text-ink-soft mt-1">
              {status === "error" ? t("failed") : latest ? t(latest.type) : t("starting")}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-ink-soft/30 px-3 py-1 text-xs font-mono text-ink-soft">
            {t(mode)}
          </span>
        </div>

        <div className="mt-6 space-y-3" aria-live="polite">
          {status === "done" && onContinue && (
            <div className="rounded-2xl border-2 border-moss/40 bg-moss/10 p-5 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-moss shrink-0" />
                  <h4 className="font-display text-lg text-ink">Evidence Ready — Action Plan & Summary Prepared</h4>
                </div>
                <p className="text-sm text-ink-soft mt-1">
                  {t("counts", { kept: keptEvents.length, dropped: droppedCount })}
                </p>
                <p className="text-xs text-ink-soft/80 mt-1 italic">
                  Suggestions are based on public web searches conducted using Serp API.
                </p>
              </div>
              <Button variant="primary" className="bg-moss hover:bg-moss-deep text-paper font-semibold px-6 py-2.5 shrink-0 shadow-sm" onClick={onContinue}>
                {t("continue")} →
              </Button>
            </div>
          )}
          <p className="text-xs text-ink-soft">{t("original")}</p>
          {errorMessage && <p className="text-sm text-terracotta">{errorMessage}</p>}
          {events.length === 0 && status === "running" && (
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="h-3 w-3 animate-pulse rounded-full bg-moss" />
              <span>{t("starting")}</span>
            </div>
          )}
          {flowEvents.map((event, index) => {
            if (event.type === "kept") {
              return (
                <div key={`${event.type}-${event.evidence.id}`} className="rounded-xl border border-moss/30 bg-moss/5 p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-moss">{iconFor(event.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium text-ink">{event.evidence.title}</p>
                        <span className="text-xs font-mono text-moss">{engineLabel(event.evidence.engine)}</span>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft line-clamp-3">{event.evidence.snippet}</p>
                      {safeWebUrl(event.evidence.url) && <a className="mt-2 inline-flex items-center gap-1 text-sm text-nil underline" href={safeWebUrl(event.evidence.url)} target="_blank" rel="noopener noreferrer">{t("source")} <ExternalLink className="w-3.5 h-3.5" /></a>}
                      <SourceChip source={event.evidence} />
                    </div>
                  </div>
                </div>
              );
            }

            if (event.type === "searching" || event.type === "reading" || event.type === "planning" || event.type === "synthesizing") {
              return (
                <div key={`${event.type}-${event.timestamp}-${index}`} className="flex items-center gap-3 text-sm text-ink-soft">
                  <span className="text-ink-soft/70 shrink-0">{iconFor(event.type)}</span>
                  <span className="truncate">
                    <strong className="text-ink">{t(event.type)}:</strong>{" "}
                    {event.type === "searching" ? `${engineLabel(event.engine)} · ${event.cacheHit ? t("cache") : t("request")}` : event.type === "reading" ? event.title : t(event.type)}
                  </span>
                </div>
              );
            }

            if (event.type === "error") {
              return (
                <div key={`${event.type}-${event.timestamp}-${index}`} className="flex items-start gap-3 rounded-lg bg-terracotta/10 px-3 py-3 text-sm text-terracotta">
                  <span className="mt-0.5">{iconFor(event.type)}</span>
                  <span>{event.message}</span>
                </div>
              );
            }

            return null;
          })}

          {droppedCount > 0 && (
            <details className="mt-4 rounded-xl border border-ink/10 bg-black/[0.02] p-3 text-xs text-ink-soft transition-all">
              <summary className="cursor-pointer font-medium text-ink-soft hover:text-ink flex items-center justify-between select-none">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-moss-deep shrink-0" />
                  <span>Safety Gate: {droppedCount} non-official or unverified web results filtered</span>
                </span>
                <span className="text-[10px] text-ink-soft/70 underline">View details</span>
              </summary>
              <div className="mt-2.5 space-y-1.5 border-t border-ink/10 pt-2 max-h-40 overflow-y-auto">
                {droppedEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-ink-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink/30 mt-1 shrink-0" />
                    <span className="truncate">
                      <strong className="text-ink">{event.title}</strong>: {event.reason}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {(status === "done" || status === "error") && (
          <div className="mt-6 border-t-[1.5px] border-dashed border-ink-soft/30 pt-5">
            <p className="text-sm text-ink-soft">
              {status === "done"
                ? t("counts", { kept: keptEvents.length, dropped: droppedCount })
                : t("trailError")}
            </p>
            {status === "done" && (
              <p className="text-xs text-ink-soft/80 mt-1 italic">
                Suggestions are based on public web searches conducted using Serp API.
              </p>
            )}
            {status === "done" && onContinue && (
              <Button variant="primary" className="mt-4 bg-moss hover:bg-moss-deep text-paper" onClick={onContinue}>
                {t("continue")} →
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
