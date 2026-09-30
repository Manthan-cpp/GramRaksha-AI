"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BriefView } from "@/components/krishi/BriefView";
import { BillResults } from "@/components/medi/BillResults";
import { LetterEditor } from "@/components/medi/LetterEditor";
import { CashlessResults } from "@/components/medi/cashless/CashlessResults";
import { CashlessLetterModal } from "@/components/medi/cashless/CashlessLetterModal";
import { listCropCases, deleteCropCase, deleteAllCropCases, type SavedCropCase } from "@/lib/storage/crop-cases";
import { listMediCases, deleteMediCase, deleteAllMediCases, type SavedMediCase } from "@/lib/storage/medi-cases";
import {
  listSurakshaCases,
  deleteSurakshaCase,
  deleteAllSurakshaCases,
  type SavedSurakshaCase
} from "@/lib/storage/suraksha-cases";
import {
  listFasalCases,
  deleteFasalCase,
  deleteAllFasalCases,
  type SavedFasalCase
} from "@/lib/storage/fasal-cases";
import {
  listPocketCards,
  deletePocketCard,
  deleteAllPocketCards
} from "@/lib/storage/pocket-cards";
import type { VillagePocketCard } from "@/lib/pocket-card/types";
import { CreditCard } from "lucide-react";
import { SurakshaResults } from "@/components/suraksha/SurakshaResults";
import { FasalResults } from "@/components/fasal/FasalResults";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ShieldCheck,
  ShieldAlert,
  Leaf,
  FileText,
  Clock,
  AlertTriangle,
  HelpCircle,
  Trash2
} from "lucide-react";

function formatRelativeTime(dateStr: string, now: number | null, locale: string): string {
  if (now === null) return new Date(dateStr).toLocaleDateString(locale);
  const date = new Date(dateStr);
  const diffMs = Math.max(0, now - date.getTime());
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 2) return locale === "hi" ? "अभी-अभी" : locale === "bn" ? "এইমাত্র" : "Just now";
  if (diffMins < 60) return locale === "hi" ? `${diffMins} मिनट पहले` : locale === "bn" ? `${diffMins} মিনিট আগে` : `${diffMins} mins ago`;
  if (diffHours < 24) return locale === "hi" ? `${diffHours} घंटे पहले` : locale === "bn" ? `${diffHours} ঘণ্টা আগে` : `${diffHours} hours ago`;
  if (diffDays === 1) return locale === "hi" ? "कल" : locale === "bn" ? "গতকাল" : "Yesterday";
  return locale === "hi" ? `${diffDays} दिन पहले` : locale === "bn" ? `${diffDays} দিন আগে` : `${diffDays} days ago`;
}

export default function DashboardPage() {
  const t = useTranslations("Krishi");
  const locale = useLocale();
  const [cropCases, setCropCases] = useState<SavedCropCase[]>([]);
  const [mediCases, setMediCases] = useState<SavedMediCase[]>([]);
  const [surakshaCases, setSurakshaCases] = useState<SavedSurakshaCase[]>([]);
  const [fasalCases, setFasalCases] = useState<SavedFasalCase[]>([]);
  const [pocketCards, setPocketCards] = useState<VillagePocketCard[]>([]);
  const [filter, setFilter] = useState<"all" | "crop" | "medi" | "suraksha" | "fasal" | "card">("all");
  const [openedCrop, setOpenedCrop] = useState<SavedCropCase | null>(null);
  const [openedMedi, setOpenedMedi] = useState<SavedMediCase | null>(null);
  const [openedSuraksha, setOpenedSuraksha] = useState<SavedSurakshaCase | null>(null);
  const [openedFasal, setOpenedFasal] = useState<SavedFasalCase | null>(null);
  const [openedMediLetter, setOpenedMediLetter] = useState(false);
  const [openedCashlessLetter, setOpenedCashlessLetter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [hasOldCases, setHasOldCases] = useState(false);
  const alive = useRef(false);
  const deleting = useRef(false);

  useEffect(() => {
    alive.current = true;
    let cancelled = false;
    Promise.all([
      listCropCases(),
      listMediCases(),
      listSurakshaCases(),
      listFasalCases(),
      listPocketCards()
    ])
      .then(([crops, medis, surakshas, fasals, cards]) => {
        if (!cancelled) {
          setCropCases(crops);
          setMediCases(medis);
          setSurakshaCases(surakshas);
          setFasalCases(fasals);
          setPocketCards(cards);
          const currentNow = Date.now();
          setNow(currentNow);
          const old = [...crops, ...medis, ...surakshas, ...fasals].some(
            (c) => currentNow - new Date(c.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000
          );
          setHasOldCases(old);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      alive.current = false;
    };
  }, []);

  const removeCrop = async (id?: string) => {
    if (deleting.current || !window.confirm(t(id ? "confirmDelete" : "confirmAll"))) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      if (id) await deleteCropCase(id);
      else await deleteAllCropCases();
      if (alive.current) setCropCases((rows) => (id ? rows.filter((row) => row.id !== id) : []));
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const removeMedi = async (id?: string) => {
    if (deleting.current || !window.confirm(locale === "hi" ? "क्या आप इस सहेजे गए अस्पताल बिल केस को हटाना चाहते हैं?" : locale === "bn" ? "আপনি কি এই সংরক্ষিত বিল অডিটটি মুছে ফেলতে চান?" : "Delete this saved hospital bill case?")) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      if (id) await deleteMediCase(id);
      else await deleteAllMediCases();
      if (alive.current) setMediCases((rows) => (id ? rows.filter((row) => row.id !== id) : []));
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const removeSuraksha = async (id?: string) => {
    if (deleting.current || !window.confirm(locale === "hi" ? "क्या आप इस सहेजे गए सुरक्षा जांच केस को हटाना चाहते हैं?" : locale === "bn" ? "আপনি কি এই সংরক্ষিত সাইবার অডিটটি মুছে ফেলতে চান?" : "Delete this saved Suraksha check case?")) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      if (id) await deleteSurakshaCase(id);
      else await deleteAllSurakshaCases();
      if (alive.current) setSurakshaCases((rows) => (id ? rows.filter((row) => row.id !== id) : []));
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const removeFasal = async (id?: string) => {
    if (deleting.current || !window.confirm(locale === "hi" ? "क्या आप इस सहेजे गए फसल बीमा केस को हटाना चाहते हैं?" : locale === "bn" ? "আপনি কি এই সংরক্ষিত ফসল বিমা কেসটি মুছে ফেলতে চান?" : "Delete this saved Fasal 72-hour case?")) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      if (id) await deleteFasalCase(id);
      else await deleteAllFasalCases();
      if (alive.current) setFasalCases((rows) => (id ? rows.filter((row) => row.id !== id) : []));
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const removeCard = async (id?: string) => {
    if (deleting.current || !window.confirm(locale === "hi" ? "क्या आप इस सहेजे गए ग्राम पॉकेट कार्ड को हटाना चाहते हैं?" : locale === "bn" ? "আপনি কি এই সংরক্ষিত পকেট কার্ডটি মুছে ফেলতে চান?" : "Delete this saved Village Pocket Card?")) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      if (id) await deletePocketCard(id);
      else await deleteAllPocketCards();
      if (alive.current) setPocketCards((rows) => (id ? rows.filter((row) => row.id !== id) : []));
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const clearAllHousehold = async () => {
    const msg =
      locale === "hi"
        ? "क्या आप अपने डिवाइस से सभी सहेजे गए कृषि, अस्पताल बिल, सुरक्षा जांच एवं फसल बीमा रिकॉर्ड हमेशा के लिए हटाना चाहते हैं?"
        : locale === "bn"
        ? "আপনি কি ডিভাইস থেকে সমস্ত সংরক্ষিত কৃষি, বিল, সাইবার নিরাপত্তা ও ফসল বিমা অডিট মুছে ফেলতে চান?"
        : "Permanently wipe all crop advisories, hospital bill audits, scam checks, and crop insurance records from this device?";

    if (deleting.current || !window.confirm(msg)) return;
    deleting.current = true;
    setBusy(true);
    setError(false);
    try {
      await Promise.all([
        deleteAllCropCases(),
        deleteAllMediCases(),
        deleteAllSurakshaCases(),
        deleteAllFasalCases(),
        deleteAllPocketCards()
      ]);
      if (alive.current) {
        setCropCases([]);
        setMediCases([]);
        setSurakshaCases([]);
        setFasalCases([]);
        setPocketCards([]);
      }
    } catch {
      if (alive.current) setError(true);
    } finally {
      deleting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  if (openedCrop) {
    return (
      <div className="min-h-screen bg-paper pt-8 px-4">
        <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
          <Button variant="quiet" onClick={() => setOpenedCrop(null)} className="text-sm font-medium">
            ← {locale === "hi" ? "डैशबोर्ड रिकॉर्ड पर वापस जाएं" : locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Household Cases"}
          </Button>
          <span className="text-xs text-ink-soft bg-paper-2 border border-ink-soft/20 px-3 py-1 rounded-full">
            {formatRelativeTime(openedCrop.createdAt, now, locale)}
          </span>
        </div>
        <BriefView
          key={openedCrop.id}
          brief={openedCrop.brief}
          cropContext={openedCrop.profile}
          warnings={openedCrop.warnings}
          mode={openedCrop.mode}
          saved
        />
      </div>
    );
  }

  if (openedMedi) {
    if (openedMediLetter) {
      return (
        <div className="min-h-screen bg-paper pt-8 px-4">
          <LetterEditor
            bill={{
              hospital: openedMedi.hospital,
              city: openedMedi.city,
              procedure: openedMedi.procedure,
              total: openedMedi.total,
              items: openedMedi.items,
              date: openedMedi.createdAt.split("T")[0],
              confidence: {},
              confirmed: true
            }}
            decision={openedMedi.decision}
            onBack={() => setOpenedMediLetter(false)}
          />
        </div>
      );
    }

    if (openedMedi.subModule === "cashless_shield" && openedMedi.cashlessDecision) {
      return (
        <div className="min-h-screen bg-paper pt-8 px-4">
          <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
            <Button variant="quiet" onClick={() => setOpenedMedi(null)} className="text-sm font-medium">
              ← {locale === "hi" ? "डैशबोर्ड रिकॉर्ड पर वापस जाएं" : locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Household Cases"}
            </Button>
            <span className="text-xs text-ink-soft bg-paper-2 border border-ink-soft/20 px-3 py-1 rounded-full font-mono">
              {formatRelativeTime(openedMedi.createdAt, now, locale)}
            </span>
          </div>
          <CashlessResults
            decision={openedMedi.cashlessDecision}
            evidence={[]}
            onOpenLetter={() => setOpenedCashlessLetter(true)}
            onStartOver={() => setOpenedMedi(null)}
            onSave={() => {}}
            saved
            locale={locale as "en" | "hi" | "bn"}
          />
          <CashlessLetterModal
            isOpen={openedCashlessLetter}
            onClose={() => setOpenedCashlessLetter(false)}
            decision={openedMedi.cashlessDecision}
            initialLocale={locale as "en" | "hi" | "bn"}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-paper pt-8 px-4">
        <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
          <Button variant="quiet" onClick={() => setOpenedMedi(null)} className="text-sm font-medium">
            ← {locale === "hi" ? "डैशबोर्ड रिकॉर्ड पर वापस जाएं" : locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Household Cases"}
          </Button>
          <span className="text-xs text-ink-soft bg-paper-2 border border-ink-soft/20 px-3 py-1 rounded-full">
            {formatRelativeTime(openedMedi.createdAt, now, locale)}
          </span>
        </div>
        <BillResults
          bill={{
            hospital: openedMedi.hospital,
            city: openedMedi.city,
            procedure: openedMedi.procedure,
            total: openedMedi.total,
            items: openedMedi.items,
            date: openedMedi.createdAt.split("T")[0],
            confidence: {},
            confirmed: true
          }}
          decision={openedMedi.decision || {
            headline: "",
            summary: "",
            speechSummary: "",
            flags: [],
            actions: [],
            labels: {
              conclusion: "",
              flags: "",
              sources: "",
              grievance: "",
              letter: "",
              speechButton: "",
              speechStop: "",
              serpApiNote: ""
            }
          }}
          evidence={[]}
          onOpenLetter={() => setOpenedMediLetter(true)}
          saved
        />
      </div>
    );
  }

  if (openedSuraksha) {
    return (
      <div className="min-h-screen bg-paper pt-8 px-4">
        <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
          <Button variant="quiet" onClick={() => setOpenedSuraksha(null)} className="text-sm font-medium">
            ← {locale === "hi" ? "डैशबोर्ड रिकॉर्ड पर वापस जाएं" : locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Household Cases"}
          </Button>
          <span className="text-xs text-ink-soft bg-paper-2 border border-ink-soft/20 px-3 py-1 rounded-full">
            {formatRelativeTime(openedSuraksha.createdAt, now, locale)}
          </span>
        </div>
        <SurakshaResults
          decision={openedSuraksha.decision}
          evidence={openedSuraksha.evidence || []}
          content={openedSuraksha.content}
          sourceType={openedSuraksha.sourceType}
          onStartOver={() => setOpenedSuraksha(null)}
          saved
        />
      </div>
    );
  }

  if (openedFasal) {
    return (
      <div className="min-h-screen bg-paper pt-8 px-4">
        <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center">
          <Button variant="quiet" onClick={() => setOpenedFasal(null)} className="text-sm font-medium">
            ← {locale === "hi" ? "डैशबोर्ड रिकॉर्ड पर वापस जाएं" : locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Household Cases"}
          </Button>
          <span className="text-xs text-ink-soft bg-paper-2 border border-ink-soft/20 px-3 py-1 rounded-full font-mono">
            {formatRelativeTime(openedFasal.createdAt, now, locale)}
          </span>
        </div>
        <FasalResults
          decision={openedFasal.decision}
          evidence={openedFasal.evidence || []}
          photos={openedFasal.photos || []}
          onReset={() => setOpenedFasal(null)}
          mode={openedFasal.mode}
        />
      </div>
    );
  }

  const hasCases = cropCases.length > 0 || mediCases.length > 0 || surakshaCases.length > 0 || fasalCases.length > 0 || pocketCards.length > 0;
  const totalCount = cropCases.length + mediCases.length + surakshaCases.length + fasalCases.length + pocketCards.length;

  return (
    <div className="min-h-screen bg-paper pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-paper-2 p-6 rounded-3xl border border-ink/15 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/10 text-ink text-xs font-bold uppercase tracking-wider mb-2">
              <span>📁 On-Device Household Vault</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold">{t("household")}</h1>
            <p className="text-ink-soft text-sm sm:text-base mt-1">{t("householdDetail")}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href={`/${locale}/help`}>
              <Button variant="secondary" size="sm" className="text-xs font-semibold">
                <HelpCircle className="w-4 h-4 mr-1.5" /> {t("help")}
              </Button>
            </Link>
            {hasCases && (
              <Button
                variant="quiet"
                size="sm"
                disabled={loading || busy}
                onClick={clearAllHousehold}
                className="text-xs text-terracotta hover:bg-terracotta/10 border border-terracotta/30"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {locale === "hi" ? "सभी डेटा साफ करें" : locale === "bn" ? "সব মুছুন" : "Wipe All Records"}
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Case Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-paper-2 border border-ink/15 text-center">
            <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Total Vault Records</div>
            <div className="font-display text-2xl font-bold text-ink mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-moss/10 border border-moss/25 text-center">
            <div className="text-[11px] font-bold text-moss-deep uppercase tracking-wider">🌾 Krishi Briefs</div>
            <div className="font-display text-2xl font-bold text-moss-deep mt-0.5">{cropCases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-nil/10 border border-nil/25 text-center">
            <div className="text-[11px] font-bold text-nil uppercase tracking-wider">🏥 MediShield Cases</div>
            <div className="font-display text-2xl font-bold text-nil mt-0.5">{mediCases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/25 text-center">
            <div className="text-[11px] font-bold text-terracotta uppercase tracking-wider">🛡️ Cyber Audits</div>
            <div className="font-display text-2xl font-bold text-terracotta mt-0.5">{surakshaCases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">⏱️ Fasal 72h Reports</div>
            <div className="font-display text-2xl font-bold text-amber-900 mt-0.5">{fasalCases.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-center col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">📇 Pocket Cards</div>
            <div className="font-display text-2xl font-bold text-indigo-900 mt-0.5">{pocketCards.length}</div>
          </div>
        </div>

        {/* Protection Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-moss/10 border-[1.5px] border-moss/30 rounded-[20px] p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Leaf className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-moss inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-moss-deep">Agricultural Safety</span>
            </div>
            <h2 className="font-display text-2xl text-moss-deep mb-2 font-semibold">{t("title")}</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-[90%] leading-relaxed">{t("cropIntro")}</p>
            <Link href={`/${locale}/krishi`}>
              <Button variant="primary" className="bg-moss hover:bg-moss-deep text-paper shadow-print text-xs">
                {t("newCrop")}
              </Button>
            </Link>
          </div>

          <div className="bg-nil/10 border-[1.5px] border-nil/30 rounded-[20px] p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <FileText className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nil inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-nil">Hospital Bill Protection</span>
            </div>
            <h2 className="font-display text-2xl text-nil mb-2 font-semibold">MediShield</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-[90%] leading-relaxed">{t("billIntro")}</p>
            <Link href={`/${locale}/medi`}>
              <Button variant="primary" className="bg-nil hover:bg-nil/90 text-paper shadow-print text-xs">
                {t("newBill")}
              </Button>
            </Link>
          </div>

          <div className="bg-terracotta/10 border-[1.5px] border-terracotta/30 rounded-[20px] p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <ShieldAlert className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-terracotta inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-terracotta">Cyber & Scam Defense</span>
            </div>
            <h2 className="font-display text-2xl text-terracotta mb-2 font-semibold">Suraksha Check</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-[90%] leading-relaxed">
              Verify WhatsApp forwards, fake APK files, scheme fees, and electricity bill cutoff threats.
            </p>
            <Link href={`/${locale}/suraksha`}>
              <Button variant="primary" className="bg-terracotta hover:bg-terracotta/90 text-paper shadow-print text-xs">
                {locale === "hi" ? "नई सुरक्षा जांच" : locale === "bn" ? "নতুন নিরাপত্তা চেক" : "New Suraksha Check"}
              </Button>
            </Link>
          </div>

          <div className="bg-amber-500/10 border-[1.5px] border-amber-500/30 rounded-[20px] p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Clock className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-800">PMFBY Calamity Kit</span>
            </div>
            <h2 className="font-display text-2xl text-amber-900 mb-2 font-semibold">Fasal 72h Kit</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-[90%] leading-relaxed">
              Report hailstorm, flood or lightning damage within 72 hours with timestamped evidence.
            </p>
            <Link href={`/${locale}/fasal`}>
              <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 text-paper shadow-print text-xs">
                {locale === "hi" ? "नई फसल सूचना" : locale === "bn" ? "নতুন শস্য নোটিশ" : "New 72h Report"}
              </Button>
            </Link>
          </div>

          <div className="bg-indigo-500/10 border-[1.5px] border-indigo-500/30 rounded-[20px] p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <CreditCard className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-800">Offline Emergency Vault</span>
            </div>
            <h2 className="font-display text-2xl text-indigo-950 mb-2 font-semibold">Pocket Card</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-[90%] leading-relaxed">
              Generate wallet-sized offline emergency cards with local Thana, PHC, KVK, and legal aid.
            </p>
            <Link href={`/${locale}/card`}>
              <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-paper shadow-print text-xs">
                {locale === "hi" ? "नया पॉकेट कार्ड" : locale === "bn" ? "নতুন পকেট কার্ড" : "New Pocket Card"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Case Timeline Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-[1.5px] border-ink-soft/20 pb-4">
            <div>
              <h2 className="font-display text-2xl text-ink font-semibold flex items-center gap-2">
                <Clock className="w-6 h-6 text-ink-soft" /> {t("recent")}
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Saved cases stay private on this device in browser IndexedDB storage.
              </p>
            </div>

            {/* Filter Pills */}
            {hasCases && (
              <div className="flex flex-wrap gap-1.5 bg-paper-2 p-1 rounded-xl border border-ink-soft/20 text-xs">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "all" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setFilter("crop")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "crop" ? "bg-moss text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  🌾 Krishi ({cropCases.length})
                </button>
                <button
                  onClick={() => setFilter("medi")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "medi" ? "bg-nil text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  🏥 MediShield ({mediCases.length})
                </button>
                <button
                  onClick={() => setFilter("suraksha")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "suraksha" ? "bg-terracotta text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  🛡️ Suraksha ({surakshaCases.length})
                </button>
                <button
                  onClick={() => setFilter("fasal")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "fasal" ? "bg-amber-600 text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  ⏱️ Fasal 72h ({fasalCases.length})
                </button>
                <button
                  onClick={() => setFilter("card")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filter === "card" ? "bg-indigo-600 text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  📇 Cards ({pocketCards.length})
                </button>
              </div>
            )}
          </div>

          {/* Freshness Advisory Banner */}
          {hasOldCases && (
            <div className="p-4 rounded-xl border border-turmeric/40 bg-turmeric/10 flex items-start gap-3 text-xs text-ink-soft">
              <AlertTriangle className="w-4 h-4 text-turmeric-deep shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ink">Advisory Freshness Reminder: </span>
                <span>
                  Agricultural pest alerts, Agromet weather advisories, and APMC Mandi rates change weekly. For records older than 7 days, consider re-running a fresh Serp API search.
                </span>
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-terracotta mb-4">{t("storageError")}</p>}

          {loading ? (
            <div className="p-12 text-center text-ink-soft">
              <p role="status">{t("loading")}</p>
            </div>
          ) : hasCases ? (
            <div className="space-y-6">
              {/* MediShield Cases */}
              {(filter === "all" || filter === "medi") && mediCases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-nil font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Hospital Bill Cases ({mediCases.length})
                    </h3>
                    <Button
                      variant="quiet"
                      disabled={loading || busy}
                      onClick={() => removeMedi()}
                      className="text-xs text-ink-soft hover:text-terracotta"
                    >
                      Clear Bill Cases
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mediCases.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border-[1.5px] border-nil/30 bg-nil/5 flex justify-between items-center gap-4 flex-wrap hover:border-nil transition-all shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nil/15 text-nil uppercase">
                              {item.subModule === "cashless_shield" ? "🛡️ Ayushman Cashless" : item.procedure}
                            </span>
                            <span className="text-xs text-ink-soft font-mono">
                              {formatRelativeTime(item.createdAt, now, locale)}
                            </span>
                            <span className="text-[11px] px-2 py-0.2 rounded bg-paper border border-ink-soft/20 text-ink-soft font-mono">
                              {item.mode === "live" ? "Serp API Live" : "Recorded"}
                            </span>
                          </div>
                          <p className="font-medium text-ink text-base">
                            {item.hospital}, {item.city}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {item.subModule === "cashless_shield" ? (
                              <>
                                Advance Demanded: <strong className="text-terracotta font-mono font-semibold">₹{(item.depositDemanded || 0).toLocaleString("en-IN")}</strong> · Procedure: {item.procedure}
                              </>
                            ) : (
                              <>
                                Total Billed: <strong className="text-ink font-mono font-semibold">₹{item.total.toLocaleString("en-IN")}</strong> · {item.items.length} line items analyzed
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setOpenedMedi(item)} className="border-nil/40 text-nil hover:bg-nil/10">
                            {item.subModule === "cashless_shield" ? "View Notice & Ladder" : "View Audit"}
                          </Button>
                          <Button variant="quiet" size="sm" disabled={busy} onClick={() => removeMedi(item.id)} className="text-xs text-ink-soft hover:text-terracotta">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Krishi Cases */}
              {(filter === "all" || filter === "crop") && cropCases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-moss font-semibold flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> Crop Advisory Cases ({cropCases.length})
                    </h3>
                    <Button
                      variant="quiet"
                      disabled={loading || busy}
                      onClick={() => removeCrop()}
                      className="text-xs text-ink-soft hover:text-terracotta"
                    >
                      Clear Crop Cases
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {cropCases.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border-[1.5px] border-moss/30 bg-moss/5 flex justify-between items-center gap-4 flex-wrap hover:border-moss transition-all shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-moss/20 text-moss-deep uppercase">
                              {t.has(`crops.${item.profile.crop}`) ? t(`crops.${item.profile.crop}`) : item.profile.crop}
                            </span>
                            <span className="text-xs text-ink-soft font-mono">
                              {formatRelativeTime(item.createdAt, now, locale)}
                            </span>
                            <span className="text-[11px] px-2 py-0.2 rounded bg-paper border border-ink-soft/20 text-ink-soft font-mono">
                              {item.mode === "live" ? "Serp API Live" : "Recorded"}
                            </span>
                          </div>
                          <p className="font-medium text-ink text-base">
                            {item.profile.district}{item.profile.state ? `, ${item.profile.state}` : ""}
                          </p>
                          <p className="text-xs text-ink-soft">
                            Growth Stage: <strong className="text-ink">{t.has(`stages.${item.profile.stage}`) ? t(`stages.${item.profile.stage}`) : item.profile.stage}</strong> · {item.brief.sources.length} sources verified
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setOpenedCrop(item)} className="border-moss/40 text-moss hover:bg-moss/10">
                            {t("open")}
                          </Button>
                          <Button variant="quiet" size="sm" disabled={busy} onClick={() => removeCrop(item.id)} className="text-xs text-ink-soft hover:text-terracotta">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suraksha Cases */}
              {(filter === "all" || filter === "suraksha") && surakshaCases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-terracotta font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Suraksha Scam Check Cases ({surakshaCases.length})
                    </h3>
                    <Button
                      variant="quiet"
                      disabled={loading || busy}
                      onClick={() => removeSuraksha()}
                      className="text-xs text-ink-soft hover:text-terracotta"
                    >
                      Clear Suraksha Cases
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {surakshaCases.map((item) => {
                      const isDanger = item.decision.verdict === "danger";
                      const isSafe = item.decision.verdict === "safe";
                      return (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl border-[1.5px] border-terracotta/30 bg-terracotta/5 flex justify-between items-center gap-4 flex-wrap hover:border-terracotta transition-all shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                  isDanger
                                    ? "bg-red-200 text-red-900"
                                    : isSafe
                                      ? "bg-emerald-200 text-emerald-900"
                                      : "bg-amber-200 text-amber-900"
                                }`}
                              >
                                {item.decision.verdict} ({item.decision.riskScore}%)
                              </span>
                              <span className="text-xs text-ink-soft font-mono">
                                {formatRelativeTime(item.createdAt, now, locale)}
                              </span>
                              <span className="text-[11px] px-2 py-0.2 rounded bg-paper border border-ink-soft/20 text-ink-soft font-mono">
                                {item.sourceType}
                              </span>
                            </div>
                            <p className="font-medium text-ink text-base line-clamp-1">
                              {item.decision.headline}
                            </p>
                            <p className="text-xs text-ink-soft line-clamp-1 max-w-xl font-mono">
                              &ldquo;{item.content}&rdquo;
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setOpenedSuraksha(item)}
                              className="border-terracotta/40 text-terracotta hover:bg-terracotta/10"
                            >
                              View Audit
                            </Button>
                            <Button
                              variant="quiet"
                              size="sm"
                              disabled={busy}
                              onClick={() => removeSuraksha(item.id)}
                              className="text-xs text-ink-soft hover:text-terracotta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fasal 72-Hour Kit Cases */}
              {(filter === "all" || filter === "fasal") && fasalCases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-amber-800 font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700" /> Fasal Bima 72h Cases ({fasalCases.length})
                    </h3>
                    <Button
                      variant="quiet"
                      disabled={loading || busy}
                      onClick={() => removeFasal()}
                      className="text-xs text-ink-soft hover:text-terracotta"
                    >
                      Clear Fasal Cases
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {fasalCases.map((item) => {
                      const isExpired = item.decision.countdown.isExpired;
                      const isCritical = item.decision.countdown.urgency === "critical";
                      return (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl border-[1.5px] border-amber-500/30 bg-amber-50/60 flex justify-between items-center gap-4 flex-wrap hover:border-amber-500 transition-all shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                  isExpired
                                    ? "bg-ink/10 text-ink-soft"
                                    : isCritical
                                    ? "bg-rose-600 text-white animate-pulse"
                                    : "bg-amber-500 text-white"
                                }`}
                              >
                                {isExpired ? "Expired" : `${item.decision.countdown.hoursLeft}h Left`}
                              </span>
                              <span className="text-xs text-ink-soft font-mono">
                                {formatRelativeTime(item.createdAt, now, locale)}
                              </span>
                              <span className="text-[11px] px-2 py-0.2 rounded bg-paper border border-ink-soft/20 text-ink-soft font-mono">
                                {item.decision.calamityLabel}
                              </span>
                            </div>
                            <p className="font-medium text-ink text-base">
                              {item.incident.crop} · {item.incident.village}, {item.incident.district}
                            </p>
                            <p className="text-xs text-ink-soft">
                              Estimated Loss: <strong className="text-rose-600">{item.incident.lossPercentage}%</strong> · {item.photos.length} photos logged · Insurer: {item.decision.insurer.name.split(" ")[0]}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setOpenedFasal(item)}
                              className="border-amber-600/40 text-amber-800 hover:bg-amber-100"
                            >
                              Open Kit
                            </Button>
                            <Button
                              variant="quiet"
                              size="sm"
                              disabled={busy}
                              onClick={() => removeFasal(item.id)}
                              className="text-xs text-ink-soft hover:text-terracotta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pocket Card Cases */}
              {(filter === "all" || filter === "card") && pocketCards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-indigo-950 font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" /> Emergency Pocket Cards ({pocketCards.length})
                    </h3>
                    <Button
                      variant="quiet"
                      disabled={loading || busy}
                      onClick={() => removeCard()}
                      className="text-xs text-ink-soft hover:text-terracotta"
                    >
                      Clear Pocket Cards
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {pocketCards.map((card) => (
                      <div
                        key={card.id}
                        className="p-5 rounded-2xl border-[1.5px] border-indigo-500/30 bg-indigo-50/50 flex justify-between items-center gap-4 flex-wrap hover:border-indigo-500 transition-all shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-600 text-white">
                              📇 CR80 Pocket Card
                            </span>
                            <span className="text-xs text-ink-soft font-mono">
                              {formatRelativeTime(card.createdAt, now, locale)}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-paper border border-ink-soft/20 text-ink-soft font-mono">
                              {card.mode === "live" ? "SerpApi Live" : "Recorded"}
                            </span>
                          </div>
                          <p className="font-medium text-ink text-base">
                            {card.location.village}, {card.location.block ? `${card.location.block}, ` : ""}{card.location.district}, {card.location.state}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {card.places.length} Local Emergency Places · {card.lifelines.length} National Lifelines · 100% Offline Cached
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/${locale}/card?id=${card.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="border-indigo-600/40 text-indigo-800 hover:bg-indigo-100"
                            >
                              View & Print Card
                            </Button>
                          </Link>
                          <Button
                            variant="quiet"
                            size="sm"
                            disabled={busy}
                            onClick={() => removeCard(card.id)}
                            className="text-xs text-ink-soft hover:text-terracotta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <EmptyState
                title={t("noCases")}
                description="Your saved crop briefs, hospital bill audits, scam checks, crop insurance kits, and emergency pocket cards will appear here."
                icon={<ShieldCheck className="w-12 h-12 text-ink-soft/40" />}
              />
            )
          )}
        </section>
      </div>
    </div>
  );
}
