"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { EngineDiagnostics } from "@/components/shared/EngineDiagnostics";
import { EmergencyModal } from "@/components/shared/EmergencyModal";

export function Footer() {
  const locale = useLocale();
  const pathname = usePathname();
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Hide footer completely on the landing page
  const isLandingPage = pathname === `/${locale}` || pathname === `/${locale}/`;
  if (isLandingPage) {
    return null;
  }

  return (
    <>
      <footer className="bg-ink text-paper border-t border-ink-soft/30 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Brand & Civic Philosophy */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="GramRaksha AI"
                  width={200}
                  height={67}
                  unoptimized
                  className="h-9 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-paper/70 leading-relaxed">
                {locale === "hi"
                  ? "ग्रामीण नागरिकों, किसानों एवं परिवारों के लिए एक स्वतंत्र नागरिक सुरक्षा प्रणाली। फसल संकट, अस्पताल की अवैध जमा मांग और साइबर धोखाधड़ी के खिलाफ सटीक साक्ष्य।"
                  : locale === "bn"
                  ? "গ্রামীণ নাগরিক ও কৃষকদের জন্য একটি স্বাধীন নাগরিক সুরক্ষা ব্যবস্থা। ফসলের ক্ষয়ক্ষতি, হাসপাতালের অবৈধ দাবি ও সাইবার প্রতারণার বিরুদ্ধে তথ্যভিত্তিক সমাধান।"
                  : "A dedicated public-interest civic defense platform for rural citizens and farming communities across India. Verified grounded facts against calamity, hospital extortion, and cyber fraud."}
              </p>
              <div className="p-3 rounded-2xl bg-paper/5 border border-paper/10 text-[11px] text-paper/80 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% On-Device Privacy</span>
                </div>
                <p className="text-[10.5px] text-paper/60">
                  Your case history and bill details stay securely inside your browser&apos;s IndexedDB. No patient or crop data is ever uploaded to corporate databases.
                </p>
              </div>
            </div>

            {/* Column 2: Civic Services & Tools */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-paper uppercase tracking-wider">
                {locale === "hi" ? "नागरिक सुरक्षा सेवाएं" : locale === "bn" ? "নাগরিক পরিষেবা" : "Civic Services"}
              </h4>
              <ul className="space-y-2 text-xs text-paper/70">
                <li>
                  <Link href={`/${locale}/krishi`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>🌾</span>
                    <span>KrishiSahay — Crop & Mandi Intel</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/medi`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Ayushman Cashless Shield (Clause 8.2)</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/medi?tab=audit`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Hospital Bill Audit & Grievance Notice</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/suraksha`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>🔍</span>
                    <span>Suraksha Check — Rogue APK & Scam Linter</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/fasal`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>Fasal Bima 72h Calamity Kit</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/card`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>📇</span>
                    <span>Gram Raksha Emergency Pocket Card</span>
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/dashboard`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1.5">
                    <span>📁</span>
                    <span>Household Cases Vault (Offline)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Statutory Frameworks & Government Links */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-paper uppercase tracking-wider">
                {locale === "hi" ? "संवैधानिक एवं आधिकारिक नियम" : locale === "bn" ? "সরকারি বিধি ও নির্দেশিকা" : "Statutory Frameworks"}
              </h4>
              <ul className="space-y-2 text-xs text-paper/70">
                <li>
                  <a
                    href="https://pmjay.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper hover:underline transition-colors flex items-center justify-between"
                  >
                    <span>PM-JAY Clause 8.2 (Zero Deposit)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://pmfby.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper hover:underline transition-colors flex items-center justify-between"
                  >
                    <span>PMFBY Section 15.3 (72h Intimation)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://sancharsaathi.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper hover:underline transition-colors flex items-center justify-between"
                  >
                    <span>DoT Sanchar Saathi (Chakshu)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper hover:underline transition-colors flex items-center justify-between"
                  >
                    <span>National Cyber Crime Portal (1930)</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://agmarknet.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper hover:underline transition-colors flex items-center justify-between"
                  >
                    <span>Agmarknet Mandi Daily Rates</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </li>
                <li>
                  <Link href={`/${locale}/help`} className="hover:text-paper hover:underline transition-colors flex items-center gap-1 text-emerald-400 font-semibold pt-1">
                    <span>Help & Consumer Grievance Guide &rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: 24x7 Emergency Lifelines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-paper uppercase tracking-wider">
                  {locale === "hi" ? "राष्ट्रीय 24x7 हेल्पलाइन" : locale === "bn" ? "জাতীয় জরুরি নম্বর" : "National Lifelines"}
                </h4>
                <button
                  type="button"
                  onClick={() => setEmergencyOpen(true)}
                  className="text-[10px] text-terracotta bg-terracotta/20 px-2 py-0.5 rounded-md hover:bg-terracotta hover:text-paper transition-colors cursor-pointer font-bold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <a
                  href="tel:112"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 border border-paper/10 transition-colors group"
                >
                  <span className="text-paper/80">National Emergency</span>
                  <span className="font-mono font-bold text-paper group-hover:scale-105 transition-transform">
                    112
                  </span>
                </a>
                <a
                  href="tel:108"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 border border-paper/10 transition-colors group"
                >
                  <span className="text-paper/80">Ambulance Service</span>
                  <span className="font-mono font-bold text-paper group-hover:scale-105 transition-transform">
                    108
                  </span>
                </a>
                <a
                  href="tel:14447"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 border border-paper/10 transition-colors group"
                >
                  <span className="text-paper/80">Crop Calamity (PMFBY)</span>
                  <span className="font-mono font-bold text-paper group-hover:scale-105 transition-transform">
                    14447
                  </span>
                </a>
                <a
                  href="tel:14555"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 border border-paper/10 transition-colors group"
                >
                  <span className="text-paper/80">Ayushman Health Call</span>
                  <span className="font-mono font-bold text-paper group-hover:scale-105 transition-transform">
                    14555
                  </span>
                </a>
                <a
                  href="tel:1930"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-paper/5 hover:bg-paper/10 border border-paper/10 transition-colors group"
                >
                  <span className="text-paper/80">Cyber Crime Helpline</span>
                  <span className="font-mono font-bold text-paper group-hover:scale-105 transition-transform">
                    1930
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Public Interest Disclaimer & System Status */}
          <div className="pt-8 border-t border-paper/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-paper/60">
            <div className="text-center md:text-left space-y-1">
              <p>
                GramRaksha AI is a public-interest civic service. We never diagnose plant diseases, prescribe chemicals, or issue legal judgments.
              </p>
              <p className="text-[11px] text-paper/40">
                All advisories, empanelment listings, and benchmark rates are corroborated live via SerpApi from verified Indian public repositories.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Evidence Engine Diagnostics Trigger */}
              <button
                type="button"
                onClick={() => setDiagnosticsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/10 hover:bg-paper/20 text-paper/80 hover:text-paper border border-paper/15 transition-all cursor-pointer text-[11px] font-mono"
                title="Inspect SerpApi Engine Queries & Execution State"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SerpApi Engine: Online</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Diagnostics Modal */}
      <EngineDiagnostics
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        locale={locale}
      />
    </>
  );
}
