"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Leaf,
  Shield,
  ShieldAlert,
  Clock,
  FolderOpen,
  Menu,
  X,
  PhoneCall,
  CreditCard,
  HeartPulse
} from "lucide-react";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { EmergencyModal } from "@/components/shared/EmergencyModal";
import { listCropCases } from "@/lib/storage/crop-cases";
import { listMediCases } from "@/lib/storage/medi-cases";
import { listSurakshaCases } from "@/lib/storage/suraksha-cases";
import { listFasalCases } from "@/lib/storage/fasal-cases";
import { listPocketCards } from "@/lib/storage/pocket-cards";
import { listPashuCases } from "@/lib/storage/pashu-cases";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [caseCount, setCaseCount] = useState<number | null>(null);

  const isLandingPage = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Fetch real-time count of locally saved cases for the badge
  useEffect(() => {
    let active = true;
    Promise.all([
      listCropCases().catch(() => []),
      listMediCases().catch(() => []),
      listSurakshaCases().catch(() => []),
      listFasalCases().catch(() => []),
      listPocketCards().catch(() => []),
      listPashuCases().catch(() => [])
    ]).then(([c, m, s, f, p, pa]) => {
      if (active) {
        setCaseCount(c.length + m.length + s.length + f.length + p.length + pa.length);
      }
    });

    const handleStorageUpdate = () => {
      Promise.all([
        listCropCases().catch(() => []),
        listMediCases().catch(() => []),
        listSurakshaCases().catch(() => []),
        listFasalCases().catch(() => []),
        listPocketCards().catch(() => []),
        listPashuCases().catch(() => [])
      ]).then(([c, m, s, f, p, pa]) => {
        if (active) {
          setCaseCount(c.length + m.length + s.length + f.length + p.length + pa.length);
        }
      });
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: `/${locale}/home`,
      labelEn: "Home",
      labelHi: "होम",
      labelBn: "হোম",
      descEn: "GramRaksha Central Hub",
      icon: Home,
      activeColor: "bg-amber-600/20 text-amber-900 border-amber-600",
      isActive: pathname.includes("/home")
    },
    {
      href: `/${locale}/krishi`,
      labelEn: "KrishiSahay",
      labelHi: "कृषिसहाय",
      labelBn: "কৃষিসহায়",
      descEn: "Crop & Mandi Intel",
      icon: Leaf,
      activeColor: "bg-moss/20 text-moss-deep border-moss",
      isActive: pathname.includes("/krishi")
    },
    {
      href: `/${locale}/pashu`,
      labelEn: "PashuSahay",
      labelHi: "पशुसहाय",
      labelBn: "পশুসহায়",
      descEn: "Livestock & Vet Care",
      icon: HeartPulse,
      activeColor: "bg-amber-600/20 text-amber-900 border-amber-600",
      isActive: pathname.includes("/pashu")
    },
    {
      href: `/${locale}/medi`,
      labelEn: "MediShield",
      labelHi: "मेडीशील्ड",
      labelBn: "মেডিশিল্ড",
      descEn: "Ayushman & Bill Audit",
      icon: Shield,
      activeColor: "bg-nil/20 text-nil border-nil",
      isActive: pathname.includes("/medi")
    },
    {
      href: `/${locale}/suraksha`,
      labelEn: "Suraksha Check",
      labelHi: "सुरक्षा जांच",
      labelBn: "সুরক্ষা চেক",
      descEn: "APK & Scam Defense",
      icon: ShieldAlert,
      activeColor: "bg-terracotta/20 text-terracotta border-terracotta",
      isActive: pathname.includes("/suraksha")
    },
    {
      href: `/${locale}/fasal`,
      labelEn: "Fasal 72h",
      labelHi: "फसल 72h",
      labelBn: "ফসল ৭২h",
      descEn: "PMFBY Claim Kit",
      icon: Clock,
      activeColor: "bg-amber-500/20 text-amber-800 border-amber-500",
      isActive: pathname.includes("/fasal")
    },
    {
      href: `/${locale}/card`,
      labelEn: "Pocket Card",
      labelHi: "पॉकेट कार्ड",
      labelBn: "পকেট কার্ড",
      descEn: "Offline Village Directory",
      icon: CreditCard,
      activeColor: "bg-indigo-600/20 text-indigo-900 border-indigo-600",
      isActive: pathname.includes("/card")
    },
    {
      href: `/${locale}/dashboard`,
      labelEn: "Cases",
      labelHi: "केस रिकॉर्ड",
      labelBn: "কেস রেকর্ড",
      descEn: "Device History",
      icon: FolderOpen,
      activeColor: "bg-ink/20 text-ink border-ink",
      isActive: pathname.includes("/dashboard"),
      badge: caseCount && caseCount > 0 ? caseCount : undefined
    }
  ];

  if (isLandingPage) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full relative">
        <AnimatePresence mode="wait" initial={false}>
          {!menuOpen ? (
            <motion.div
              key="initial-navbar"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-transparent backdrop-blur-none border-b border-transparent"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
                {/* Brand Logo (Left) */}
                <Link
                  href={`/${locale}`}
                  className="flex items-center shrink-0 group focus:outline-hidden py-1"
                  onClick={() => setMenuOpen(false)}
                  aria-label="GramRaksha AI Home"
                >
                  <div className="relative flex items-center">
                    <Image
                      src="/images/logo.png"
                      alt="GramRaksha AI"
                      width={210}
                      height={74}
                      unoptimized
                      priority
                      className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
                    />
                  </div>
                </Link>

                {/* Right Header Utilities: Emergency Hotline, Language Selector & Hamburger Menu */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Quick Emergency Button */}
                  <button
                    type="button"
                    onClick={() => setEmergencyOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/40 text-ink border-2 border-ink hover:bg-red-600 hover:border-red-600 hover:text-white transition-all cursor-pointer shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
                    title="National Emergency Helplines (112, 108, 14447, 14555, 1930)"
                  >
                    <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                    <span>112 / 108</span>
                  </button>

                  {/* Language Selector Dropdown */}
                  <LanguageSelector />

                  {/* Hamburger Menu Button on Right Side */}
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/40 hover:bg-white/60 text-ink border-2 border-ink shadow-[2px_2px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                    aria-label="Open Navigation Menu"
                    aria-expanded={false}
                  >
                    <Menu className="w-4 h-4 text-ink" />
                    <span className="hidden sm:inline">
                      {locale === "hi" ? "मेन्यू" : locale === "bn" ? "মেনু" : "Menu"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-navbar"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full bg-[#2A1B14]/65 backdrop-blur-2xl border-b-2 border-amber-600/40 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                {/* Brand Logo inside expanded bar (Desktop) */}
                <Link
                  href={`/${locale}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/20 hidden md:flex"
                >
                  <Image
                    src="/images/logo.png"
                    alt="GramRaksha AI"
                    width={130}
                    height={45}
                    unoptimized
                    priority
                    className="h-7 w-auto object-contain"
                  />
                </Link>

                {/* All Website Features filling up the Navbar */}
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-1 shrink-0 flex-1 justify-start md:justify-center">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const label =
                      locale === "hi" ? link.labelHi : locale === "bn" ? link.labelBn : link.labelEn;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all shrink-0 cursor-pointer ${
                          link.isActive
                            ? "bg-amber-500 text-ink border-amber-400 shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
                            : "border-white/20 bg-white/10 hover:bg-white/25 text-paper hover:text-white hover:border-white/40 shadow-sm"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${link.isActive ? "text-ink" : "text-amber-300"}`} />
                        <span>{label}</span>
                        {link.badge !== undefined && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400 text-ink font-bold">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Right Controls: Close Button (Language Selector is only in initial navbar) */}
                <div className="flex items-center gap-2 shrink-0 pl-2 sm:pl-3 border-l border-white/20">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600/85 hover:bg-red-600 text-white border-2 border-red-400 transition-all shadow-[2px_2px_0_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0_rgba(0,0,0,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                    title="Close Menu"
                    aria-label="Close Navigation Menu"
                  >
                    <X className="w-4 h-4 text-white" />
                    <span className="hidden sm:inline">
                      {locale === "hi" ? "वापस" : locale === "bn" ? "বন্ধ" : "Close"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
