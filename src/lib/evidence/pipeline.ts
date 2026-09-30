import {
  EvidenceRunResultSchema,
  type Evidence,
  type EvidenceEvent,
  type EvidenceMetrics,
  type EvidenceMode,
  type EvidenceRunRequest
} from "@/lib/schemas";
import { getEvidenceConfig } from "@/lib/evidence/config";
import { planEvidence } from "@/lib/evidence/planner";
import { normalizeSerpApiResponse, withoutInternalFields, type EvidenceCandidate } from "@/lib/evidence/normalize";
import { classifyEvidence } from "@/lib/evidence/trust";
import { claimsFromEvidence, validateGroundedClaims } from "@/lib/evidence/validator";
import {
  ProviderConfigurationError,
  ProviderUpstreamError,
  SerpApiProvider,
  type EvidenceProvider
} from "@/lib/evidence/provider";
import { RecordedDataUnavailableError, RecordedProvider } from "@/lib/evidence/recorded";
import { BudgetExceededError } from "@/lib/evidence/usage";
import { buildCropBrief } from "@/lib/krishi/brief";
import { buildCropDecision } from "@/lib/krishi/decision";
import { buildMediDecision } from "@/lib/medi/decision";
import { buildAyushmanCashlessDecision } from "@/lib/medi/cashless-decision";
import { buildSurakshaDecision } from "@/lib/suraksha/decision";
import { buildFasalDecision } from "@/lib/fasal/decision";

export type EvidenceEventSink = (event: EvidenceEvent) => void | Promise<void>;

interface PipelineDependencies {
  provider?: EvidenceProvider;
  mode?: EvidenceMode;
  maxQueries?: number;
}

function now(): string {
  return new Date().toISOString();
}

function publicError(error: unknown): {
  code: "configuration" | "budget" | "upstream" | "recorded_unavailable" | "internal";
  message: string;
} {
  if (error instanceof BudgetExceededError) return { code: "budget", message: "The monthly search budget has been reached. Try Recorded mode or again next month." };
  if (error instanceof ProviderConfigurationError) return { code: "configuration", message: error.message };
  if (error instanceof ProviderUpstreamError) return { code: "upstream", message: error.message };
  if (error instanceof RecordedDataUnavailableError) return { code: "recorded_unavailable", message: error.message };
  return { code: "internal", message: "The evidence search could not be completed." };
}

function orderEvidence(candidates: EvidenceCandidate[]): Evidence[] {
  return candidates
    .sort((left, right) => right.recencyScore - left.recencyScore || (left.sourcePosition ?? 0) - (right.sourcePosition ?? 0))
    .map(withoutInternalFields);
}

function providerFor(mode: EvidenceMode, input: EvidenceRunRequest): EvidenceProvider {
  if (mode === "recorded") return new RecordedProvider(input);
  return new SerpApiProvider();
}

export async function runEvidencePipeline(
  input: EvidenceRunRequest,
  emit: EvidenceEventSink,
  dependencies: PipelineDependencies = {}
) {
  const config = getEvidenceConfig();
  const mode = dependencies.mode ?? input.mode ?? config.defaultMode;
  const maxQueries = dependencies.maxQueries ?? config.queryBudgetPerCase;
  const provider = dependencies.provider ?? providerFor(mode, input);
  const plan = planEvidence(input, maxQueries);
  const warnings: string[] = [];
  let lastFailureCode: ReturnType<typeof publicError>["code"] | undefined;
  const keptByUrl = new Map<string, EvidenceCandidate>();
  const metrics: EvidenceMetrics = {
    queriesPlanned: plan.length,
    queriesRun: 0,
    liveSearches: 0,
    cacheHits: 0,
    sourcesKept: 0,
    sourcesDropped: 0,
    mode
  };

  await emit({
    type: "planning",
    timestamp: now(),
    message: `Prepared ${plan.length} evidence searches.`,
    queriesPlanned: plan.length
  });

  if (plan.length === 0) {
    const errorEvent: EvidenceEvent = {
      type: "error",
      timestamp: now(),
      code: "configuration",
      message: "No evidence searches could be planned for this request.",
      recoverable: false
    };
    await emit(errorEvent);
    return null;
  }

  for (const [index, query] of plan.entries()) {
    let result;
    try {
      result = await provider.search(query);
      metrics.queriesRun += 1;
      const isLiveCacheHit = result.source === "live" && result.cacheHit;
      if (isLiveCacheHit) metrics.cacheHits += 1;
      if (result.source === "live" && !result.cacheHit) metrics.liveSearches += 1;
    } catch (error) {
      const failure = publicError(error);
      lastFailureCode = failure.code;
      warnings.push(failure.message);
      await emit({
        type: "dropped",
        timestamp: now(),
        title: query.purpose,
        engine: query.engine,
        reason: failure.message
      });
      continue;
    }

    await emit({
      type: "searching",
      timestamp: now(),
      queryId: query.id,
      engine: query.engine,
      query: query.query,
      position: index + 1,
      total: plan.length,
      cacheHit: result.source === "live" && result.cacheHit
    });

    const candidates = normalizeSerpApiResponse(result.raw, query, result.retrievedAt);
    for (const candidate of candidates) {
      const classification = classifyEvidence(candidate, query);
      if (classification.action === "drop" && classification.evidence === null) {
        metrics.sourcesDropped += 1;
        await emit({ type: "dropped", timestamp: now(), title: classification.title, engine: query.engine, reason: classification.reason });
        continue;
      }
      await emit({
        type: "reading",
        timestamp: now(),
        queryId: query.id,
        engine: query.engine,
        title: candidate.title,
        url: candidate.url,
        cacheHit: result.source === "live" && result.cacheHit
      });

      if (classification.action === "drop") {
        metrics.sourcesDropped += 1;
        await emit({
          type: "dropped",
          timestamp: now(),
          title: classification.title,
          url: classification.url,
          engine: query.engine,
          reason: classification.reason
        });
        continue;
      }

      if (keptByUrl.has(classification.evidence.url)) {
        metrics.sourcesDropped += 1;
        await emit({
          type: "dropped",
          timestamp: now(),
          title: classification.evidence.title,
          url: classification.evidence.url,
          engine: query.engine,
          reason: "Duplicate URL already kept from another search."
        });
        continue;
      }

      keptByUrl.set(classification.evidence.url, classification.evidence);
      metrics.sourcesKept += 1;
      await emit({
        type: "kept",
        timestamp: now(),
        evidence: withoutInternalFields(classification.evidence),
        reason: classification.reason
      });
    }
  }

  const evidence = orderEvidence([...keptByUrl.values()]);
  await emit({
    type: "synthesizing",
    timestamp: now(),
    message: "Checking that every claim is tied to a kept source snippet."
  });

  const claimValidation = validateGroundedClaims(claimsFromEvidence(evidence), evidence, {
    allowOfficialCropRecommendations: input.module === "krishi"
  });
  if (claimValidation.dropped.length > 0) {
    warnings.push(`${claimValidation.dropped.length} ungrounded or unsafe claim(s) were removed.`);
  }

  const cropInput = input.module === "krishi" ? input : undefined;
  const baseCropBrief = cropInput ? buildCropBrief(cropInput, evidence) : undefined;
  const cropBrief = cropInput && baseCropBrief
    ? { ...baseCropBrief, decision: buildCropDecision(cropInput, baseCropBrief, metrics, warnings) }
    : undefined;
  const mediInput = input.module === "medi" ? input : undefined;
  const mediDecision = mediInput && mediInput.subModule !== "cashless_shield"
    ? buildMediDecision(
        {
          hospital: mediInput.hospital,
          city: mediInput.city,
          procedure: mediInput.procedure,
          total: 0,
          date: now().split("T")[0],
          items: [],
          confidence: {},
          confirmed: true
        },
        evidence,
        metrics,
        warnings,
        input.locale
      )
    : undefined;
  const cashlessDecision = mediInput && mediInput.subModule === "cashless_shield"
    ? buildAyushmanCashlessDecision({
        request: {
          hospital: mediInput.hospital,
          city: mediInput.city,
          state: mediInput.state || "National",
          procedure: mediInput.procedure,
          depositDemanded: mediInput.depositDemanded || 0,
          patientName: mediInput.patientName,
          pmjayId: mediInput.pmjayId,
          demandedReason: mediInput.demandedReason
        },
        evidence,
        metrics,
        warnings,
        locale: input.locale
      })
    : undefined;
  const surakshaInput = input.module === "suraksha" ? input : undefined;
  const surakshaDecision = surakshaInput
    ? buildSurakshaDecision(
        surakshaInput,
        evidence,
        metrics,
        warnings,
        input.locale
      )
    : undefined;
  const fasalInput = input.module === "fasal" ? input : undefined;
  const fasalDecision = fasalInput
    ? buildFasalDecision({
        incident: {
          calamityType: fasalInput.calamityType,
          incidentTime: now(),
          state: fasalInput.state,
          district: fasalInput.district,
          village: "Gram Panchayat",
          crop: fasalInput.crop || "Standing Crop",
          lossPercentage: 60,
          farmerName: "Insured Farmer"
        },
        evidence,
        metrics,
        warnings,
        locale: input.locale
      })
    : undefined;
  if (
    evidence.length === 0 &&
    warnings.length > 0 &&
    (lastFailureCode === "configuration" || lastFailureCode === "budget" || mode === "recorded")
  ) {
    const firstWarning = warnings[0];
    const failure: EvidenceEvent = {
      type: "error",
      timestamp: now(),
      code: lastFailureCode || (mode === "recorded" ? "recorded_unavailable" : "upstream"),
      message: firstWarning,
      recoverable: true
    };
    await emit(failure);
    return null;
  }

  const result = EvidenceRunResultSchema.parse({
    mode,
    evidence,
    claims: claimValidation.claims,
    metrics,
    warnings: [...new Set(warnings)],
    cropBrief,
    mediDecision,
    surakshaDecision,
    fasalDecision,
    cashlessDecision
  });
  await emit({
    type: "done",
    timestamp: now(),
    ...result
  });
  return result;
}
