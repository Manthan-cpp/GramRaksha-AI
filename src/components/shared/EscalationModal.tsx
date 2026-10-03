"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  calculateEscalationTimeline,
  generateRtiApplication,
  type EscalationTimeline
} from "@/lib/escalation/rti";
import {
  Clock,
  ShieldCheck,
  FileText,
  Copy,
  Printer,
  Check,
  X,
  Share2,
  ExternalLink,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseType: "medi" | "cashless" | "fasal";
  createdAt: string;
  applicantName: string;
  applicantAddress?: string;
  applicantPhone?: string;
  targetDepartment: string;
  targetCity: string;
  targetState: string;
  referenceNumber?: string;
}

export function EscalationModal({
  isOpen,
  onClose,
  caseType,
  createdAt,
  applicantName,
  applicantAddress = "District Resident",
  applicantPhone,
  targetDepartment,
  targetCity,
  targetState,
  referenceNumber
}: EscalationModalProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const [activeTab, setActiveTab] = useState<"timeline" | "rti">("timeline");
  const [copied, setCopied] = useState(false);
  const [simulatedDays, setSimulatedDays] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const now = Date.now();
  const realDiffDays = Math.floor(Math.max(0, now - new Date(createdAt).getTime()) / 86400000);
  const effectiveNow = simulatedDays !== null
    ? new Date(createdAt).getTime() + simulatedDays * 86400000
    : now;

  const timeline: EscalationTimeline = calculateEscalationTimeline(createdAt, effectiveNow, caseType);

  const complaintDateFormatted = new Date(createdAt).toLocaleDateString(
    locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const rtiText = generateRtiApplication({
    applicantName,
    applicantAddress: `${applicantAddress}, ${targetCity}, ${targetState}`,
    applicantPhone,
    targetDepartment,
    targetCity,
    targetState,
    subjectReference: caseType === "fasal" ? "PMFBY Crop Calamity Loss Claim" : "Hospital Billing & Advance Deposit Dispute",
    originalComplaintDate: complaintDateFormatted,
    originalReferenceNumber: referenceNumber,
    locale
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(rtiText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RTI Application - Section 6(1)</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; font-size: 14pt; }
            h2 { text-align: center; font-size: 16pt; margin-bottom: 20px; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <pre>${rtiText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleWhatsApp = () => {
    const text = `*RTI APPLICATION DRAFT (Sec 6(1) RTI Act 2005)*\n\n${rtiText.slice(0, 1500)}...\n\n_Generated via GramRaksha AI Case Escalation Ladder_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-paper-2 border-[1.5px] border-ink rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-ink/15 bg-paper">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta/15 text-terracotta border border-terracotta/30">
                Statutory Follow-Through Ladder
              </span>
              <span className="text-xs font-mono text-ink-soft bg-paper-2 px-2.5 py-0.5 rounded border border-ink/15">
                Day {timeline.daysElapsed} of Escalation
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {caseType === "fasal" ? "PMFBY Claim Escalation & RTI Desk" : "Hospital Dispute Follow-Up & RTI Desk"}
            </h2>
            <p className="text-xs text-ink-soft">
              Case opened on {complaintDateFormatted} · Target Authority: <strong className="text-ink">{targetDepartment}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-paper-2 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-paper-2 border-b border-ink/10 text-xs">
          <div className="flex gap-1.5 bg-paper p-1 rounded-xl border border-ink/15">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "timeline" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              📅 30-Day Milestone Ladder
            </button>
            <button
              onClick={() => setActiveTab("rti")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "rti" ? "bg-terracotta text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              ⚖️ Section 6(1) RTI Generator
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-ink-soft font-medium">Demo Simulator:</span>
            <button
              onClick={() => setSimulatedDays(0)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                simulatedDays === 0 ? "bg-moss text-paper border-moss" : "bg-paper text-ink border-ink/20"
              }`}
            >
              Day 0
            </button>
            <button
              onClick={() => setSimulatedDays(7)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                simulatedDays === 7 ? "bg-amber-600 text-paper border-amber-600" : "bg-paper text-ink border-ink/20"
              }`}
            >
              Day 7
            </button>
            <button
              onClick={() => setSimulatedDays(15)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                simulatedDays === 15 ? "bg-nil text-paper border-nil" : "bg-paper text-ink border-ink/20"
              }`}
            >
              Day 15
            </button>
            <button
              onClick={() => setSimulatedDays(30)}
              className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                simulatedDays === 30 ? "bg-terracotta text-paper border-terracotta" : "bg-paper text-ink border-ink/20"
              }`}
            >
              Day 30 (RTI)
            </button>
            {simulatedDays !== null && (
              <button
                onClick={() => setSimulatedDays(null)}
                className="text-[11px] text-ink-soft hover:text-terracotta underline ml-1"
              >
                Reset ({realDiffDays}d)
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-paper">
          {activeTab === "timeline" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {timeline.milestones.map((m, idx) => {
                  const isCurrent = timeline.currentMilestoneIndex === idx;
                  const isPast = m.status === "completed";
                  return (
                    <div
                      key={m.day}
                      className={`p-4 rounded-2xl border-[1.5px] transition-all relative ${
                        isCurrent
                          ? "border-terracotta bg-terracotta/5 shadow-sm ring-2 ring-terracotta/20"
                          : isPast
                          ? "border-moss/40 bg-moss/5"
                          : "border-ink/15 bg-paper-2 opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                            isCurrent
                              ? "bg-terracotta text-paper"
                              : isPast
                              ? "bg-moss text-paper"
                              : "bg-ink/10 text-ink-soft"
                          }`}
                        >
                          {m.badge}
                        </span>
                        {isPast && <ShieldCheck className="w-4 h-4 text-moss" />}
                        {isCurrent && <Clock className="w-4 h-4 text-terracotta animate-pulse" />}
                      </div>

                      <h3 className="font-semibold text-sm text-ink mb-1">{m.title}</h3>
                      <p className="text-xs text-ink-soft leading-relaxed mb-3">{m.description}</p>

                      <div className="text-[11px] text-ink-soft/80 border-t border-ink/10 pt-2 space-y-0.5 font-mono">
                        <div>🏛️ {m.targetAuthority}</div>
                        <div>📜 {m.legalProvision}</div>
                      </div>

                      {idx === 3 && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveTab("rti")}
                          className="w-full mt-3 bg-terracotta hover:bg-terracotta/90 text-paper text-xs shadow-xs"
                        >
                          Draft RTI Application →
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-paper-2 border border-ink/15 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-ink text-sm">
                  <HelpCircle className="w-4 h-4 text-nil" />
                  <span>How Statutory Escalation Works in Indian Law</span>
                </div>
                <p className="text-ink-soft leading-relaxed">
                  Under the Supreme Court guidelines on citizen grievance redressal, public and empanelled authorities are bound to acknowledge representations. If an empanelled hospital or crop insurance office remains silent for 30 days, filing a Section 6(1) RTI application with the district nodal agency triggers a personal liability fine of <strong>₹250 per day (up to ₹25,000)</strong> on the Public Information Officer under Section 20(1) for deemed refusal.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-turmeric/10 border border-turmeric/40 text-xs text-ink">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-turmeric-deep shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Statutory Checklist for RTI Filing:</strong>
                    <span>
                      1. Attach a <strong>₹10 Court Fee Stamp</strong> or <strong>Indian Postal Order (IPO)</strong> made payable to Accounts Officer.
                      <br />
                      2. Submit in duplicate (keep one stamped receiving copy for your records).
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCopy} className="text-xs">
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-moss" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copied ? "Copied" : "Copy RTI"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handlePrint} className="text-xs">
                    <Printer className="w-3.5 h-3.5 mr-1" /> Print / PDF
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleWhatsApp} className="text-xs bg-moss hover:bg-moss-deep text-paper">
                    <Share2 className="w-3.5 h-3.5 mr-1" /> WhatsApp Draft
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-paper border-[1.5px] border-ink/20 shadow-xs font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink select-text">
                {rtiText}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-paper-2 border-t border-ink/15 flex justify-between items-center text-xs text-ink-soft">
          <span>Protected under Right to Information Act 2005 & Consumer Protection Act 2019</span>
          <Button variant="quiet" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
