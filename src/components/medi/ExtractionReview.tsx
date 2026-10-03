"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Trash2, AlertCircle, CheckCircle2, Sparkles, FileText, ArrowLeft, Mic } from "lucide-react";
import type { Bill, BillItem } from "@/lib/schemas";
import { SAMPLE_BILLS } from "@/data/sample-bills";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";

interface ExtractionReviewProps {
  imageUrl?: string | null;
  initialBill?: Bill | null;
  onConfirm: (bill: Bill) => void;
  onBack?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "bed", label: "Bed / Room / Nursing" },
  { value: "consultation", label: "Doctor / Surgeon Fees" },
  { value: "ot", label: "Operation Theatre (OT)" },
  { value: "pharmacy", label: "Pharmacy / Injections" },
  { value: "diagnostics", label: "Diagnostics / Lab / Scans" },
  { value: "consumables", label: "Consumables & PPE" },
  { value: "misc", label: "Miscellaneous / Admin" }
];

export function ExtractionReview({ imageUrl, initialBill, onConfirm, onBack }: ExtractionReviewProps) {
  const locale = useLocale();
  const [hospital, setHospital] = useState(initialBill?.hospital || "");
  const [city, setCity] = useState(initialBill?.city || "");
  const [procedure, setProcedure] = useState(initialBill?.procedure || "");
  const [total, setTotal] = useState(initialBill?.total ? String(initialBill.total) : "");

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    locale,
    onTranscript: (spoken) => {
      setProcedure((prev) => (prev ? `${prev} ${spoken}` : spoken));
    }
  });
  const [items, setItems] = useState<BillItem[]>(
    initialBill?.items && initialBill.items.length > 0
      ? initialBill.items
      : [
          { label: "Bed & Room Charges", category: "bed", qty: 3, unit: "days", amount: 15000 },
          { label: "Surgeon & Anesthesia Fees", category: "consultation", qty: 1, unit: "case", amount: 28000 },
          { label: "Operation Theatre (OT) Facility", category: "ot", qty: 1, unit: "case", amount: 14000 },
          { label: "Pharmacy & Medicines (Lump Sum)", category: "pharmacy", qty: 1, unit: "lump sum", amount: 16500 },
          { label: "Consumables & Disposable PPE", category: "consumables", qty: 1, unit: "kit", amount: 7500 },
          { label: "Miscellaneous Administrative Charges", category: "misc", qty: 1, unit: "fee", amount: 7500 }
        ]
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

  const itemsSum = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalNum = parseFloat(total) || 0;
  const mathDiff = Math.round(totalNum - itemsSum);
  const isValid = hospital.trim() !== "" && city.trim() !== "" && procedure.trim() !== "" && totalNum > 0;

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_BILLS.find((s) => s.id === sampleId);
    if (!sample) return;
    setHospital(sample.bill.hospital);
    setCity(sample.bill.city);
    setProcedure(sample.bill.procedure);
    setTotal(String(sample.bill.total));
    setItems([...sample.bill.items]);
    setIsConfirmed(true);
  };

  const handleAddItem = () => {
    setItems((curr) => [
      ...curr,
      { label: "New Item", category: "misc", qty: 1, unit: "item", amount: 1000 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((curr) => curr.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    setItems((curr) =>
      curr.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAnalyze = () => {
    onConfirm({
      hospital: hospital.trim(),
      city: city.trim(),
      procedure: procedure.trim(),
      total: totalNum,
      date: new Date().toISOString().split("T")[0],
      items,
      confidence: {},
      confirmed: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-paper-2 p-6 rounded-[16px] border-[1.5px] border-ink shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="quiet" size="sm" onClick={onBack} className="mr-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <h2 className="font-display text-2xl text-ink">Bill Verification & Breakdown</h2>
          </div>
          <p className="text-ink-soft text-sm mt-1">
            Verify or edit the extracted details before querying Serp API for official benchmarks and grievance routes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-nil/5 p-3 rounded-xl border border-nil/20">
          <div className="flex items-center gap-1.5 text-nil font-medium text-xs">
            <Sparkles className="w-4 h-4" /> Try Demo Scenario:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_BILLS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleLoadSample(s.id)}
                className="px-2.5 py-1 text-xs rounded-lg font-medium bg-paper border border-nil/30 text-nil hover:bg-nil hover:text-paper transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-paper-2 border-[1.5px] border-ink rounded-[16px] shadow-print flex flex-col overflow-hidden">
            <div className="p-3.5 border-b-[1.5px] border-ink bg-paper/70 flex justify-between items-center">
              <span className="font-medium text-ink text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-nil" />
                {imageUrl ? "Redacted Bill Document" : "Manual Bill Review"}
              </span>
              {imageUrl && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-moss/10 text-moss font-semibold">
                  Redacted
                </span>
              )}
            </div>
            <div className="p-4 flex justify-center items-center bg-ink-soft/5 min-h-[300px]">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Redacted Bill"
                  className="max-w-full max-h-[460px] object-contain border border-ink-soft/20 shadow-sm rounded-lg"
                />
              ) : (
                <div className="text-center p-6 text-ink-soft space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-nil/10 flex items-center justify-center text-nil">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="font-medium text-ink">Manual Details Entry</h4>
                  <p className="text-xs leading-relaxed">
                    You chose to type details manually. Enter the hospital, city, procedure, and line items on the right.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-moss/30 bg-moss/5 text-xs text-ink-soft space-y-1">
            <p className="font-semibold text-moss">🔒 Zero Health Data Leakage</p>
            <p>
              We only send the confirmed hospital name, city, and procedure name to public Serp API searches. Your bill image, patient identity, and total amounts are never transmitted to search engines.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-paper-2 p-5 rounded-[16px] border-[1.5px] border-ink">
            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">
                Hospital Name *
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. City Care Hospital"
                className="w-full p-2.5 text-sm rounded-xl border-[1.5px] border-ink-soft/30 bg-paper focus:border-nil outline-none transition-colors text-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full p-2.5 text-sm rounded-xl border-[1.5px] border-ink-soft/30 bg-paper focus:border-nil outline-none transition-colors text-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1.5">
                Procedure / Treatment *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="e.g. Laparoscopic Appendectomy"
                  className="w-full p-2.5 pr-10 text-sm rounded-xl border-[1.5px] border-ink-soft/30 bg-paper focus:border-nil outline-none transition-colors text-ink"
                />
                {isSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? "Stop voice listening" : "Tap to speak procedure name"}
                    aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border transition-all ${
                      isListening
                        ? "bg-terracotta text-paper border-terracotta animate-pulse"
                        : "bg-paper-2 border-ink-soft/30 text-ink-soft hover:text-nil hover:border-nil"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isListening && (
                <p className="text-[11px] font-semibold text-terracotta animate-pulse mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping" />
                  Listening... speak procedure name
                </p>
              )}
            </div>
          </div>

          <div className="bg-paper-2 rounded-[16px] border-[1.5px] border-ink p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-ink-soft/20">
              <div>
                <h3 className="font-display text-lg text-ink">Line-Item Breakdown</h3>
                <p className="text-xs text-ink-soft">
                  Itemised charges help uncover vague fees, unitemised pharmacy sums, and math errors.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddItem} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Charge
              </Button>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 p-2.5 rounded-xl border border-ink-soft/20 bg-paper items-center hover:border-ink-soft/40 transition-colors"
                >
                  <div className="col-span-5 sm:col-span-5">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleItemChange(index, "label", e.target.value)}
                      placeholder="Item name / description"
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-ink-soft/20 bg-transparent focus:border-nil outline-none text-ink font-medium"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-4">
                    <select
                      value={item.category || "misc"}
                      onChange={(e) => handleItemChange(index, "category", e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-ink-soft/20 bg-transparent focus:border-nil outline-none text-ink-soft font-normal"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-ink-soft">₹</span>
                      <input
                        type="number"
                        value={item.amount || ""}
                        onChange={(e) => handleItemChange(index, "amount", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full pl-5 pr-1.5 py-1.5 text-xs text-right rounded-lg border border-ink-soft/20 bg-transparent focus:border-nil outline-none text-ink font-semibold"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-ink-soft hover:text-terracotta transition-colors rounded"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-ink-soft/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                  Total Billed Amount:
                </label>
                <div className="relative w-36">
                  <span className="absolute left-3 top-2 text-sm font-semibold text-ink">₹</span>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-6 pr-3 py-1.5 font-display text-lg text-ink font-bold rounded-xl border-[1.5px] border-ink-soft/30 bg-paper focus:border-nil outline-none text-right"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && Math.abs(mathDiff) <= 5 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-moss/10 border border-moss/30 text-moss text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Line items match total (₹{itemsSum.toLocaleString("en-IN")})</span>
                  </div>
                ) : items.length > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>
                      Discrepancy: Items sum to ₹{itemsSum.toLocaleString("en-IN")}, difference of ₹{Math.abs(mathDiff).toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-4 bg-paper-2 rounded-xl border-[1.5px] border-ink-soft/20">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-nil border-ink rounded focus:ring-nil"
              />
              <span className="text-ink text-xs sm:text-sm select-none">
                I confirm these details match my hospital bill. I understand GramRaksha AI will search public sources for reference package rates and consumer grievance routes, with zero storage of my personal data.
              </span>
            </label>
          </div>

          <Button
            variant="primary"
            className="w-full bg-nil hover:bg-nil/90 text-lg py-6 shadow-print"
            disabled={!isValid || !isConfirmed}
            onClick={handleAnalyze}
          >
            Confirm & Search Evidence with Serp API <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
