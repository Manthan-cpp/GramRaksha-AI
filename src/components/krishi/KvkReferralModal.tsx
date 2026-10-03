"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  generateKvkReferralSlip,
  generateKvkWhatsAppText,
  type KvkReferralParams
} from "@/lib/krishi/kvk-referral";
import {
  ShieldAlert,
  Copy,
  Printer,
  Check,
  X,
  Share2,
  PhoneCall,
  Sparkles,
  Stethoscope,
  Wheat
} from "lucide-react";

interface KvkReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropContext: { crop: string; district: string; stage: string; state?: string } | null;
  observedConcern: string;
  mandiPriceSummary?: string;
  weatherSummary?: string;
  kvkName?: string;
  kvkPhone?: string;
}

export function KvkReferralModal({
  isOpen,
  onClose,
  cropContext,
  observedConcern,
  mandiPriceSummary,
  weatherSummary,
  kvkName,
  kvkPhone
}: KvkReferralModalProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !cropContext) return null;

  const referralParams: KvkReferralParams = {
    farmerName: farmerName.trim() || undefined,
    farmerPhone: farmerPhone.trim() || undefined,
    district: cropContext.district,
    state: cropContext.state,
    crop: cropContext.crop,
    growthStage: cropContext.stage,
    symptomsOrConcern: observedConcern || "Agronomic health review and pest advisory",
    mandiPriceSummary,
    weatherSummary,
    kvkCenterName: kvkName,
    kvkPhone,
    locale
  };

  const slipText = generateKvkReferralSlip(referralParams);
  const waText = generateKvkWhatsAppText(referralParams);

  const handleCopy = () => {
    navigator.clipboard.writeText(slipText).then(() => {
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
          <title>KVK Expert Referral Slip</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; line-height: 1.5; font-size: 13pt; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <pre>${slipText}</pre>
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
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-paper-2 border-[1.5px] border-ink rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-ink/15 bg-paper">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-moss/15 text-moss-deep border border-moss/30 flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-moss" />
                ICAR · Krishi Vigyan Kendra Docket
              </span>
              <span className="text-xs font-mono text-ink-soft bg-paper-2 px-2.5 py-0.5 rounded border border-ink/15">
                Zero-Diagnosis Compliant
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">
              {locale === "hi" ? "केवीके विशेषज्ञ रेफरल पर्ची" : locale === "bn" ? "কেভিকে বিশেষজ্ঞ রেফারেল স্লিপ" : "KVK Expert Referral Slip"}
            </h2>
            <p className="text-xs text-ink-soft">
              Packages field coordinates & symptoms for certified agronomists at Krishi Vigyan Kendra, {cropContext.district}.
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

        <div className="px-6 py-4 bg-paper-2 border-b border-ink/10 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
              {locale === "hi" ? "किसान का नाम (वैकल्पिक)" : locale === "bn" ? "কৃষকের নাম (ঐচ্ছিক)" : "Farmer Name (Optional)"}
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-ink/20 bg-paper text-ink focus:outline-none focus:border-moss"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-ink-soft uppercase mb-1">
              {locale === "hi" ? "मोबाइल नंबर (वैकल्पिक)" : locale === "bn" ? "মোবাইল নম্বর (ঐচ্ছিক)" : "Mobile Number (Optional)"}
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-ink/20 bg-paper text-ink focus:outline-none focus:border-moss"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-paper flex flex-wrap justify-between items-center gap-3 border-b border-ink/10 text-xs">
          <div className="flex items-center gap-2 text-moss-deep font-medium">
            <Stethoscope className="w-4 h-4 text-moss" />
            <span>Ready to submit to KVK or share with Kisan Call Centre</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy} className="text-xs">
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-moss" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy Slip"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Slip
            </Button>
            <Button variant="primary" size="sm" onClick={handleWhatsApp} className="text-xs bg-moss hover:bg-moss-deep text-paper">
              <Share2 className="w-3.5 h-3.5 mr-1" /> WhatsApp to KVK
            </Button>
            <a href="tel:18001801551">
              <Button variant="quiet" size="sm" className="text-xs text-amber-900 border border-amber-600/30 hover:bg-amber-100">
                <PhoneCall className="w-3.5 h-3.5 mr-1 text-amber-700" /> Dial KCC (1800-180-1551)
              </Button>
            </a>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-paper">
          <div className="p-6 rounded-2xl bg-paper-2 border-[1.5px] border-ink/20 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink select-text shadow-xs">
            {slipText}
          </div>
        </div>

        <div className="p-4 bg-paper-2 border-t border-ink/15 flex justify-between items-center text-xs text-ink-soft">
          <span>Official Agronomic Intake · ICAR-KVK Safety Standard</span>
          <Button variant="quiet" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
