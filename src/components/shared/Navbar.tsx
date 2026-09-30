"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Leaf,
  Shield,
  ShieldAlert,
  Clock,
  FolderOpen,
  HelpCircle,
  Menu,
  X,
  PhoneCall,
  CreditCard
} from "lucide-react";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { EmergencyModal } from "@/components/shared/EmergencyModal";
import { listCropCases } from "@/lib/storage/crop-cases";
import { listMediCases } from "@/lib/storage/medi-cases";
import { listSurakshaCases } from "@/lib/storage/suraksha-cases";
import { listFasalCases } from "@/lib/storage/fasal-cases";
import { listPocketCards } from "@/lib/storage/pocket-cards";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [caseCount, setCaseCount] = useState<number | null>(null);

  // Fetch real-time count of locally saved cases for the badge
  useEffect(() => {
    let active = true;
    Promise.all([
      listCropCases().catch(() => []),
      listMediCases().catch(() => []),
      listSurakshaCases().catch(() => []),
      listFasalCases().catch(() => []),
      listPocketCards().catch(() => [])
    ]).then(([c, m, s, f, p]) => {
      if (active) {
        setCaseCount(c.length + m.length + s.length + f.length + p.length);
      }
    });

    const handleStorageUpdate = () => {
      Promise.all([
        listCropCases().catch(() => []),
        listMediCases().catch(() => []),
        listSurakshaCases().catch(() => []),
        listFasalCases().catch(() => []),
        listPocketCards().catch(() => [])
      ]).then(([c, m, s, f, p]) => {
        if (active) {
          setCaseCount(c.length + m.length + s.length + f.length + p.length);
        }
      });
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [pathname]);

  const navLinks = [
    {
      href: `/${locale}/krishi`,
      labelEn: "KrishiSahay",
      labelHi: "कृषिसहाय",
      labelBn: "কৃষিসহায়",
      descEn: "Crop & Mandi Intel",
      icon: Leaf,
      activeColor: "bg-moss/10 text-moss-deep border-moss/30 font-bold",
      isActive: pathname.includes("/krishi")
    },
    {
      href: `/${locale}/medi`,
      labelEn: "MediShield",
      labelHi: "मेडीशील्ड",
      labelBn: "মেডিশিল্ড",
      descEn: "Ayushman & Bill Audit",
      icon: Shield,
      activeColor: "bg-nil/10 text-nil border-nil/30 font-bold",
      isActive: pathname.includes("/medi")
    },
    {
      href: `/${locale}/suraksha`,
      labelEn: "Suraksha Check",
      labelHi: "सुरक्षा जांच",
      labelBn: "সুরক্ষা চেক",
      descEn: "APK & Scam Defense",
      icon: ShieldAlert,
      activeColor: "bg-terracotta/10 text-terracotta border-terracotta/30 font-bold",
      isActive: pathname.includes("/suraksha")
    },
    {
      href: `/${locale}/fasal`,
      labelEn: "Fasal 72h",
      labelHi: "फसल 72h",
      labelBn: "ফসল ৭২h",
      descEn: "PMFBY Claim Kit",
      icon: Clock,
      activeColor: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
      isActive: pathname.includes("/fasal")
    },
    {
      href: `/${locale}/card`,
      labelEn: "Pocket Card",
      labelHi: "पॉकेट कार्ड",
      labelBn: "পকেট কার্ড",
      descEn: "Offline Village Directory",
      icon: CreditCard,
      activeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
      isActive: pathname.includes("/card")
    },
    {
      href: `/${locale}/dashboard`,
      labelEn: "Cases",
      labelHi: "केस रिकॉर्ड",
      labelBn: "কেস রেকর্ড",
      descEn: "Device History",
      icon: FolderOpen,
      activeColor: "bg-ink/10 text-ink border-ink/30 font-bold",
      isActive: pathname.includes("/dashboard"),
      badge: caseCount && caseCount > 0 ? caseCount : undefined
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-paper/95 backdrop-blur-md border-b border-ink/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo & Emblem */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 shrink-0 group focus:outline-hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-2xl bg-nil text-paper flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl text-ink tracking-tight group-hover:text-nil transition-colors">
                  GramRaksha AI
                </span>
                <span className="hidden xl:inline-flex text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-moss/10 text-moss-deep border border-moss/20">
                  Civic Defense
                </span>
              </div>
              <p className="text-[10px] text-ink-soft font-medium leading-none hidden sm:block">
                {locale === "hi"
                  ? "कृषि, स्वास्थ्य एवं साइबर सुरक्षा प्रणाली"
                  : locale === "bn"
                  ? "কৃষি, স্বাস্থ্য ও সাইবার সুরক্ষা ব্যবস্থা"
                  : "Rural Agricultural, Health & Cyber Defense"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const label =
                locale === "hi" ? link.labelHi : locale === "bn" ? link.labelBn : link.labelEn;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold border transition-all ${
                    link.isActive
                      ? link.activeColor
                      : "border-transparent text-ink hover:text-nil hover:bg-paper-2"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {link.badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-ink text-paper font-bold shrink-0">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Utilities: Emergency Hotline, Language Selector, Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Emergency Button */}
            <button
              type="button"
              onClick={() => setEmergencyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-terracotta/10 text-terracotta border border-terracotta/25 hover:bg-terracotta hover:text-paper transition-all cursor-pointer shadow-2xs"
              title="National Emergency Helplines (112, 108, 14447, 14555, 1930)"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">112 / 108</span>
              <span className="sm:hidden">🚨</span>
            </button>

            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-ink/20 bg-paper-2 text-ink hover:text-nil hover:bg-paper transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ink/15 bg-paper p-4 space-y-2 animate-fade-in shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const label =
                  locale === "hi" ? link.labelHi : locale === "bn" ? link.labelBn : link.labelEn;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      link.isActive
                        ? link.activeColor
                        : "border-ink/10 bg-paper-2 hover:bg-paper text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-paper flex items-center justify-center text-ink shrink-0 border border-ink/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-ink">{label}</div>
                        <div className="text-[11px] text-ink-soft">{link.descEn}</div>
                      </div>
                    </div>
                    {link.badge !== undefined && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-ink text-paper">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Help & Lifeline Shortcut */}
            <div className="pt-2 border-t border-ink/10 flex items-center justify-between gap-2">
              <Link
                href={`/${locale}/help`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-semibold text-ink-soft hover:text-ink p-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>
                  {locale === "hi" ? "सहायता एवं सुरक्षा नीति" : locale === "bn" ? "সহায়তা ও নীতি" : "Help & Policies"}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setEmergencyOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-terracotta text-paper text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{locale === "hi" ? "आपातकालीन नंबर" : locale === "bn" ? "জরুরি নম্বর" : "Emergency Call"}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* National Emergency Helplines Modal */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        locale={locale}
      />
    </>
  );
}
