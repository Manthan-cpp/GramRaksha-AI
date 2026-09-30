"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  FileText,
  Copy,
  Printer,
  Share2,
  Check,
  ShieldCheck
} from "lucide-react";
import { FasalIncidentInput, FasalPhotoEvidence } from "@/lib/fasal/types";
import { EmpanelledInsurer } from "@/lib/fasal/insurer-directory";
import { generateFasalIntimationLetter } from "@/lib/fasal/letter";

interface FasalLetterModalProps {
  incident: FasalIncidentInput;
  insurer: EmpanelledInsurer;
  daoOfficeName?: string;
  daoAddress?: string;
  photos?: FasalPhotoEvidence[];
}

export function FasalLetterModal({
  incident,
  insurer,
  daoOfficeName,
  daoAddress,
  photos = []
}: FasalLetterModalProps) {
  const currentLocale = useLocale() as "en" | "hi" | "bn";
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "bn">(currentLocale);
  const [copied, setCopied] = useState(false);

  const letterText = generateFasalIntimationLetter({
    incident,
    insurer,
    daoOfficeName,
    daoAddress,
    photos,
    locale: selectedLang
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PMFBY 72-Hour Intimation Notice - ${incident.farmerName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #111;
              line-height: 1.6;
              white-space: pre-wrap;
              font-size: 14px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${letterText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(letterText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm">
      {/* Header and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink/10">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-moss-deep" />
            <h3 className="font-display text-xl text-ink">
              {currentLocale === "hi"
                ? "आधिकारिक 72-घंटे का दावा सूचना पत्र (Formal Intimation Letter)"
                : currentLocale === "bn"
                ? "সংবিধিবদ্ধ ৭২ ঘণ্টার ক্ষতিপূরণ দাবি নোটিশ"
                : "Statutory 72-Hour PMFBY Claim Notice"}
            </h3>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            {currentLocale === "hi"
              ? "PMFBY धारा 15.3 के अनुसार ज़िला कृषि अधिकारी (DAO) एवं बीमा कंपनी को प्रस्तुत करने योग्य विधिक प्रारूप।"
              : currentLocale === "bn"
              ? "PMFBY ধারা ১৫.৩ অনুযায়ী জেলা কৃষি আধিকারিক ও বিমা সংস্থায় জমা দেওয়ার উপযুক্ত ফরম্যাট।"
              : "Legally compliant notice format under PMFBY Clause 15.3 ready for submission to DAO & Insurer."}
          </p>
        </div>

        {/* Language selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Toggle */}
          <div className="flex rounded-lg border border-ink/15 p-0.5 bg-paper-2 text-xs font-medium">
            <button
              onClick={() => setSelectedLang("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedLang === "en" ? "bg-moss-deep text-paper font-semibold shadow-xs" : "text-ink hover:text-ink-soft"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang("hi")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedLang === "hi" ? "bg-moss-deep text-paper font-semibold shadow-xs" : "text-ink hover:text-ink-soft"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setSelectedLang("bn")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedLang === "bn" ? "bg-moss-deep text-paper font-semibold shadow-xs" : "text-ink hover:text-ink-soft"
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/20 text-xs font-semibold text-ink bg-paper hover:bg-paper-2 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-moss" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-ink-soft" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/20 text-xs font-semibold text-ink bg-paper hover:bg-paper-2 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-ink-soft" />
            <span>Print / PDF</span>
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Letter Content Display Box */}
      <div className="mt-4 p-5 rounded-xl bg-paper-2/70 border border-ink/10 font-mono text-xs sm:text-sm text-ink whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto select-all">
        {letterText}
      </div>

      {/* Instructions on how to serve this letter */}
      <div className="mt-4 p-3 rounded-xl bg-ink/5 border border-ink/10 flex items-start gap-2.5 text-xs text-ink-soft">
        <ShieldCheck className="w-4 h-4 text-moss-deep shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-ink">
            {currentLocale === "hi" ? "जमा करने का निर्देश:" : currentLocale === "bn" ? "জমা দেওয়ার নির্দেশ:" : "How to serve this intimation:"}
          </span>{" "}
          {currentLocale === "hi"
            ? "इस पत्र की दो प्रतियां प्रिंट करें। एक प्रति ज़िला कृषि कार्यालय (DAO) या बैंक शाखा में दें तथा दूसरी प्रति पर तारीख और मुहर सहित आधिकारिक पावती (Receiving Copy) अवश्य लें।"
            : currentLocale === "bn"
            ? "এই চিঠির দুটি কপি প্রিন্ট করুন। একটি কপি জেলা কৃষি আধিকারিক অথবা ব্যাংকে জমা দিন এবং অন্যটিতে তারিখ ও সিলসহ রিসিভিং কপি সংগ্রহ করে রাখুন।"
            : "Print 2 copies of this letter. Submit one copy to the District Agriculture Office (DAO) or your lending bank, and obtain an official stamped receiving copy on the second sheet for legal recourse."}
        </div>
      </div>
    </div>
  );
}
