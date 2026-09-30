"use client";

import type { CashlessEscalationTier } from "@/lib/medi/cashless-types";

interface CashlessEscalationCardProps {
  tiers: CashlessEscalationTier[];
}

export function CashlessEscalationCard({ tiers }: CashlessEscalationCardProps) {
  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return { label: "Step 1: On-Site", bg: "bg-nil/15 text-nil border-nil/30" };
      case 2:
        return { label: "Step 2: District", bg: "bg-amber-100 text-amber-900 border-amber-300" };
      case 3:
        return { label: "Step 3: State SHA", bg: "bg-orange-100 text-orange-900 border-orange-300" };
      case 4:
        return { label: "Step 4: National NHA", bg: "bg-rose-100 text-rose-900 border-rose-300" };
      default:
        return { label: `Tier ${tier}`, bg: "bg-ink/10 text-ink border-ink/20" };
    }
  };

  return (
    <div className="bg-paper rounded-2xl border border-ink/15 p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪜</span>
          <div>
            <h3 className="font-display text-lg text-ink font-bold">
              4-Tier Statutory Escalation Ladder
            </h3>
            <p className="text-xs text-ink-soft">
              Follow this sequence if the admission desk demands an advance deposit or delays admission
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-nil/10 text-nil border border-nil/20">
          Official Grievance Hierarchy
        </span>
      </div>

      <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-ink/15">
        {tiers.map((t) => {
          const badge = getTierBadge(t.tier);
          return (
            <div
              key={t.tier}
              className="relative pl-10 group transition-all"
            >
              {/* Timeline circle */}
              <div className="absolute left-2 top-2 -translate-x-1/2 w-5 h-5 rounded-full bg-paper border-2 border-nil text-nil text-[10px] font-bold flex items-center justify-center shadow-xs">
                {t.tier}
              </div>

              <div className="bg-paper-2 hover:bg-paper transition-all rounded-xl p-4 border border-ink/10 hover:border-nil/40">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <h4 className="font-bold text-ink text-sm md:text-base">
                      {t.title}
                    </h4>
                  </div>
                  <div className="text-xs font-semibold text-nil flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{t.turnaround}</span>
                  </div>
                </div>

                <div className="text-xs text-ink-soft font-medium mb-2">
                  <span className="text-ink font-semibold">Authority:</span> {t.authority}
                </div>

                <p className="text-xs md:text-sm text-ink leading-relaxed mb-3">
                  {t.actionText}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/10 text-xs">
                  <div className="text-[11px] text-ink-soft font-mono">
                    <span className="font-semibold text-ink">Statutory Basis:</span> {t.legalBasis}
                  </div>
                  {t.phone && (
                    <a
                      href={`tel:${t.phone.replace(/[^0-9]/g, "")}`}
                      className="inline-flex items-center gap-1.5 font-bold text-nil hover:underline bg-nil/10 px-3 py-1 rounded-lg transition-colors border border-nil/20"
                    >
                      <span>📞</span>
                      <span>Call {t.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
