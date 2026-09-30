"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, FileText, ArrowRight, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations("Index");
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-paper">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="font-display text-2xl text-moss-deep tracking-tight">GramRaksha AI</div>
        <div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.1] mb-6">
            Evidence you can trust, <br className="hidden md:block"/>
            <span className="text-moss-deep">for farm, health & cyber security.</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-ink-soft max-w-2xl mx-auto mb-12">
            {t("subtitle")}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center w-full max-w-5xl mx-auto">
            <Link href="/krishi" className="w-full">
              <Button variant="primary" size="big" className="w-full group">
                <Leaf className="w-5 h-5 mr-2 text-paper/70 group-hover:text-paper transition-colors" />
                Protect a Crop
              </Button>
            </Link>
            
            <Link href="/medi" className="w-full">
              <Button variant="secondary" size="big" className="w-full group text-nil border-nil">
                <FileText className="w-5 h-5 mr-2 text-nil/70 group-hover:text-nil transition-colors" />
                MediShield & Ayushman
              </Button>
            </Link>

            <Link href="/suraksha" className="w-full">
              <Button variant="secondary" size="big" className="w-full group text-terracotta border-terracotta hover:bg-terracotta/10">
                <ShieldAlert className="w-5 h-5 mr-2 text-terracotta/70 group-hover:text-terracotta transition-colors" />
                Suraksha Check
              </Button>
            </Link>

            <Link href="/fasal" className="w-full">
              <Button variant="secondary" size="big" className="w-full group text-amber-700 border-amber-600 hover:bg-amber-50">
                <Clock className="w-5 h-5 mr-2 text-amber-600 group-hover:text-amber-700 transition-colors" />
                Fasal 72h Kit
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* The Problem / Scroll Story */}
      <section className="py-24 px-6 md:px-12 bg-paper-2 relative">
        <div className="max-w-4xl mx-auto">
          <div className="border-l-[1.5px] border-dashed border-ink-soft/30 pl-8 space-y-16 py-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-paper border-[1.5px] border-ink" />
              <h2 className="font-display text-3xl text-ink mb-4">The problem with searching.</h2>
              <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">
                When your crop is failing or a hospital bill looks wrong, a web search gives you scattered advice, 
                stale prices, and conflicting articles. It is hard to know what to trust when money is on the line.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-paper border-[1.5px] border-ink" />
              <h2 className="font-display text-3xl text-ink mb-4">One place for both.</h2>
              <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">
                GramRaksha AI reads official advisories, government schemes, and published hospital rates, 
                giving you a plain-language summary in your own language. Every claim is cited.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="font-display text-4xl text-center text-ink mb-16">How it is designed to work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Search", desc: "Finds the latest official advisories and rates." },
            { step: "2", title: "Read", desc: "Scans only trusted domains and recent news." },
            { step: "3", title: "Keep", desc: "Filters out unverified claims and opinions." },
            { step: "4", title: "Cite", desc: "Shows you exactly where every sentence came from." },
          ].map((item, i) => (
            <Card key={i} className="text-center p-8 bg-paper">
              <div className="w-12 h-12 rounded-full border-[1.5px] border-ink flex items-center justify-center mx-auto mb-6 font-mono text-xl">
                {item.step}
              </div>
              <h3 className="font-display text-2xl text-ink mb-3">{item.title}</h3>
              <p className="text-ink-soft">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Promises */}
      <section className="py-24 px-6 md:px-12 bg-ink text-paper">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-moss" />
              <h2 className="font-display text-3xl">What we promise</h2>
            </div>
            <ul className="space-y-4 text-paper/80 text-lg">
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> Every fact has a source link and timestamp.</li>
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> We use plain language, not technical jargon.</li>
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> Your data stays on your device by default.</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-8 h-8 text-terracotta" />
              <h2 className="font-display text-3xl">What we never do</h2>
            </div>
            <ul className="space-y-4 text-paper/80 text-lg">
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> We never diagnose crop diseases or prescribe chemicals.</li>
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> We never give legal, medical, or pricing verdicts.</li>
              <li className="flex gap-3"><ArrowRight className="w-5 h-5 shrink-0 mt-1" /> We never share your uploaded bills with anyone.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t-[1.5px] border-ink-soft/20 text-center">
        <p className="text-ink-soft text-sm">
          GramRaksha AI is a public-interest project. It does not replace expert advice. 
          If you are facing an emergency, please contact 108 (Ambulance) or 112 (National Emergency).
        </p>
      </footer>
    </div>
  );
}
