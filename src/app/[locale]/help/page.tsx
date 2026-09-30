"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-paper pb-24 px-6 md:px-12 pt-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <div>
          <Link href="/dashboard">
            <Button variant="quiet" className="mb-6 -ml-4">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="font-display text-4xl text-ink mb-4">Help & Safety</h1>
          <p className="text-xl text-ink-soft">How GramRaksha AI works and protects you.</p>
        </div>

        {/* Emergencies */}
        <section className="bg-terracotta/10 border-[1.5px] border-terracotta/30 p-6 rounded-[16px]">
          <h2 className="font-display text-2xl text-terracotta mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6" /> Emergency Numbers
          </h2>
          <ul className="space-y-3 text-ink">
            <li><strong>108</strong> — National Ambulance Service</li>
            <li><strong>112</strong> — National Emergency Number</li>
            <li><strong>1551</strong> — Kisan Call Centre (Agriculture)</li>
            <li><strong>1915</strong> — National Consumer Helpline</li>
          </ul>
        </section>

        {/* How it Works */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-moss" /> What We Do
          </h2>
          <p className="text-ink-soft leading-relaxed">
            We search official government domains (like .gov.in), public news, and verified sources to give you context for crop issues or hospital bills. Every claim we show includes a link to the exact source we found it on.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-ink flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-terracotta" /> What We Never Do
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-ink-soft leading-relaxed">
            <li>We <strong>do not</strong> diagnose plant diseases or prescribe chemical dosages.</li>
            <li>We <strong>do not</strong> state that a hospital committed fraud or overcharged you. We only compare the bill to published rates.</li>
            <li>We <strong>do not</strong> replace professional advice. Always consult local experts or authorities.</li>
          </ul>
        </section>

        {/* Privacy & Data */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-ink">Privacy & Your Data</h2>
          <div className="bg-paper-2 border-[1.5px] border-ink p-6 rounded-[16px] shadow-print space-y-6">
            <p className="text-ink-soft leading-relaxed">
              Your case history is stored <strong>only in this browser</strong>. We do not save your uploaded bills or personal information on our servers. Images are processed in memory and immediately discarded.
            </p>
            <div className="flex justify-between items-center pt-4 border-t-[1.5px] border-dashed border-ink-soft/30">
              <span className="text-ink font-medium">Clear all local data</span>
              <Button variant="secondary" className="text-terracotta border-terracotta hover:bg-terracotta/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete My Data
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
