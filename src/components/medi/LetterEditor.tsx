"use client";

import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, MessageCircle, Mail, Copy, Check } from "lucide-react";
import type { Bill, MediDecision } from "@/lib/schemas";
import { whatsappShareUrl } from "@/lib/krishi-share";

interface LetterEditorProps {
  bill: Bill | null;
  decision?: MediDecision | null;
  onBack: () => void;
}

function generateInitialLetter(bill: Bill | null, decision?: MediDecision | null): string {
  const hospital = bill?.hospital || "[Hospital Name]";
  const city = bill?.city || "[City]";
  const procedure = bill?.procedure || "[Procedure / Diagnosis]";
  const total = bill?.total ? `₹${bill.total.toLocaleString("en-IN")}` : "[Total Amount]";
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const flagsList = decision?.flags || [];
  const specificPoints: string[] = [];

  for (const flag of flagsList) {
    if (flag.type === "vague") {
      specificPoints.push(
        `- Unspecified Charges: The bill lists an administrative or miscellaneous charge under "${flag.itemRef || "Miscellaneous"}" without a clinical line-by-line itemisation. We respectfully request an itemised statement or waiver of this fee.`
      );
    } else if (flag.type === "missingQty") {
      specificPoints.push(
        `- Pharmacy & Medication Itemisation: Pharmacy charges are billed as a lump sum without individual drug brand names, batch numbers, daily administration logs, or billed MRPs.`
      );
    } else if (flag.type === "totalMismatch") {
      specificPoints.push(
        `- Arithmetic Discrepancy: The sum of the itemised charges does not match the final invoiced total, leaving an unexplained difference of ${decision?.discrepancyTotal ? `₹${decision.discrepancyTotal.toLocaleString("en-IN")}` : "a significant amount"}.`
      );
    } else if (flag.type === "dataQuality") {
      specificPoints.push(
        `- Consumables & PPE: Disproportionately high charges for standard surgical consumables (gloves, syringes, cotton), which under regulatory guidelines should be capped at MRP or included in facility charges.`
      );
    }
  }

  if (specificPoints.length === 0) {
    specificPoints.push(
      "- Detailed Statement: A date-wise, item-by-item breakdown of pharmacy and nursing consumables administered during inpatient care.",
      "- Schedule Comparison: Confirmation that room rent and surgeon consultations strictly conform with the hospital's publicly displayed schedule of charges."
    );
  }

  return `To,
The Medical Superintendent & In-Charge Billing Department,
${hospital},
${city}

Date: ${today}

Subject: Formal Request for Itemised Bill Breakdown and Clarification regarding Inpatient Bill for ${procedure}

Respected Sir / Madam,

I am writing to express my appreciation for the medical care provided to the patient at your esteemed institution during the recent treatment for ${procedure}. 

Upon reviewing the final billing statement totaling ${total}, we noticed several entries where line-item transparency is required under the Clinical Establishments (Registration and Regulation) Act and National Consumer Disputes Redressal Commission (NCDRC) guidelines.

Specifically, we kindly request clarification and itemisation on the following points:

${specificPoints.join("\n\n")}

Under the Patient Charter published by the Ministry of Health and Family Welfare (MoHFW) and standard clinical establishment regulations, patients and their families have the legal right to inspect and receive an itemised, comprehensible copy of the final bill along with pharmacy issue slips before discharge.

We kindly request you to furnish:
1. A date-wise, itemised pharmacy statement showing batch numbers, quantities, and MRP.
2. The nurse's daily administration and consumable requisition sheet.
3. A written clarification or appropriate waiver for any unspecified administrative fees.

We trust this request will be addressed promptly in the interest of billing transparency and patient satisfaction.

Thank you for your cooperation and assistance.

Sincerely,

[Patient / Guardian Name]
[Patient UHID / IPD Bill Number]
[Contact Phone Number]
[Address / Signature]`;
}

export function LetterEditor({ bill, decision, onBack }: LetterEditorProps) {
  const initialContent = useMemo(() => generateInitialLetter(bill, decision), [bill, decision]);
  const [content, setContent] = useState(initialContent);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = whatsappShareUrl(content);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Clarification Request - Bill for ${bill?.procedure || "Treatment"} at ${bill?.hospital || "Hospital"}`);
    const body = encodeURIComponent(content);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-paper-2 p-3.5 rounded-2xl border-[1.5px] border-ink">
        <Button variant="quiet" size="sm" onClick={onBack} className="text-ink">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Results
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="text-xs">
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-moss" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? "Copied!" : "Copy Text"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="border-moss text-moss hover:bg-moss/10 text-xs"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
          </Button>

          <Button variant="secondary" size="sm" onClick={handleEmail} className="text-xs">
            <Mail className="w-3.5 h-3.5 mr-1" /> Email
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-nil hover:bg-nil/90 text-paper text-xs shadow-print"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5 mr-1" /> Save as PDF / Print
          </Button>
        </div>
      </div>

      {/* Editor & Live A4 Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left: Textarea Editor */}
        <div className="flex flex-col h-full bg-paper-2 rounded-[16px] border-[1.5px] border-ink overflow-hidden shadow-print">
          <div className="p-3 border-b-[1.5px] border-ink bg-paper/60 font-medium text-ink text-sm flex justify-between items-center">
            <span>Edit Letter Details</span>
            <span className="text-xs text-ink-soft">Fill in [Your Name], IPD number, etc.</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-5 bg-transparent outline-none resize-none font-body text-sm leading-relaxed text-ink font-mono"
            placeholder="Write your clarification letter here..."
          />
        </div>

        {/* Right: Live A4 Printable Preview */}
        <div className="flex flex-col h-full bg-ink/5 rounded-[16px] p-4 overflow-auto items-center">
          <div
            ref={printRef}
            className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-lg p-10 font-serif text-black print:shadow-none print:p-0 print:m-0 border border-gray-200"
          >
            <div className="whitespace-pre-wrap leading-relaxed text-[11pt] text-gray-900">
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none, .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
