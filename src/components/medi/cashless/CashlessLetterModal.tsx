"use client";

import { useState, useEffect } from "react";
import type { AyushmanCashlessDecision } from "@/lib/medi/cashless-types";

interface CashlessLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: AyushmanCashlessDecision;
  initialLocale?: "en" | "hi" | "bn";
}

export function CashlessLetterModal({
  isOpen,
  onClose,
  decision,
  initialLocale = "en"
}: CashlessLetterModalProps) {
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "bn">(initialLocale);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentText =
    activeLang === "hi"
      ? decision.letterHi
      : activeLang === "bn"
      ? decision.letterBn
      : decision.letterEn;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Statutory Representation - PM-JAY Clause 8.2</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 40px; line-height: 1.6; font-size: 13px; color: #111; }
            pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <pre>${currentText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    const textEncoded = encodeURIComponent(
      `*PM-JAY STATUTORY NOTICE (Clause 8.2)*\n\n${currentText.slice(0, 1400)}...\n\n(Sent via GramRaksha AI - MediShield)`
    );
    window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, "_blank");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-2xl shadow-2xl border border-ink/20 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-ink/15 bg-paper-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h2 className="font-display text-xl text-ink font-bold">
                Formal Statutory Representation
              </h2>
            </div>
            <p className="text-xs text-ink-soft mt-0.5 font-medium">
              Citing PM-JAY Operational Guidelines Clause 8.2 & Empanelment MoU
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex rounded-xl border border-ink/20 p-1 bg-paper text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeLang === "en" ? "bg-nil text-paper font-bold shadow-xs" : "text-ink hover:text-nil"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("hi")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeLang === "hi" ? "bg-nil text-paper font-bold shadow-xs" : "text-ink hover:text-nil"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("bn")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeLang === "bn" ? "bg-nil text-paper font-bold shadow-xs" : "text-ink hover:text-nil"
                }`}
              >
                বাংলা
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-paper transition-colors cursor-pointer font-bold"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Letter Text Preview */}
        <div className="flex-1 overflow-y-auto p-5 bg-paper text-ink font-mono text-xs md:text-sm leading-relaxed border-b border-ink/15 whitespace-pre-wrap select-text">
          {currentText}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-paper-2 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10">
          <div className="text-xs text-ink-soft flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Ready to submit to Medical Superintendent / PMAM desk</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-paper border border-ink/20 text-ink hover:bg-paper-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? "✓ Copied to Clipboard" : "📋 Copy Notice"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-paper border border-ink/20 text-ink hover:bg-paper-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              🖨️ Print / Save PDF
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-paper hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              💬 Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
