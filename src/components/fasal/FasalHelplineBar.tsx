"use client";

import { useLocale } from "next-intl";
import {
  Smartphone,
  Share2,
  Building,
  Headphones,
  ExternalLink
} from "lucide-react";
import { EmpanelledInsurer } from "@/lib/fasal/insurer-directory";

interface FasalHelplineBarProps {
  insurer: EmpanelledInsurer;
  calamityLabel: string;
  crop: string;
  village: string;
  district: string;
  state: string;
  lossPercentage: number;
  hoursLeft: number;
}

export function FasalHelplineBar({
  insurer,
  calamityLabel,
  crop,
  village,
  district,
  state,
  lossPercentage,
  hoursLeft
}: FasalHelplineBarProps) {
  const locale = useLocale() as "en" | "hi" | "bn";

  const cleanInsurerPhone = insurer.tollFree.replace(/[^0-9]/g, "");

  const handleShareWhatsApp = () => {
    let text = `🚨 *PMFBY URGENT CROP LOSS INTIMATION (72-HOUR NOTICE)*\n\n`;
    if (locale === "hi") {
      text = `🚨 *प्रधानमंत्री फसल बीमा (PMFBY) 72-घंटे की सूचना*\n\n`;
      text += `📍 *स्थान:* ${village}, ज़िला: ${district} (${state})\n`;
      text += `🌾 *फसल:* ${crop}\n`;
      text += `⛈️ *आपदा:* ${calamityLabel}\n`;
      text += `📉 *अनुमानित क्षति:* ${lossPercentage}%\n`;
      text += `⏳ *72-घंटे की सीमा:* केवल ${hoursLeft} घंटे शेष!\n\n`;
      text += `📞 राष्ट्रीय फसल बीमा हेल्पलाइन: 14447\n`;
      text += `🏢 बीमा कंपनी (${insurer.name}): ${insurer.tollFree}\n\n`;
      text += `कृपया संयुक्त सर्वेक्षण (Joint Panchnama) हेतु तत्काल कार्रवाई करें।`;
    } else if (locale === "bn") {
      text = `🚨 *প্রধানমন্ত্রী ফসল বিমা (PMFBY) ৭২ ঘণ্টার জরুরি নোটিশ*\n\n`;
      text += `📍 *এলাকা:* ${village}, জেলা: ${district} (${state})\n`;
      text += `🌾 *ক্ষতিগ্রস্ত শস্য:* ${crop}\n`;
      text += `⛈️ *দুর্যোগ:* ${calamityLabel}\n`;
      text += `📉 *আনুমানিক ক্ষতি:* ${lossPercentage}%\n`;
      text += `⏳ *সময়সীমা:* আর মাত্র ${hoursLeft} ঘণ্টা বাকি!\n\n`;
      text += `📞 জাতীয় বিমা হেল্পলাইন: 14447\n`;
      text += `🏢 বিমা কোম্পানি (${insurer.name}): ${insurer.tollFree}\n\n`;
      text += `অনুগ্রহ করে দ্রুত যৌথ জরিপ (Joint Spot Survey)-এর ব্যবস্থা করুন।`;
    } else {
      text += `📍 *Location:* ${village}, District: ${district} (${state})\n`;
      text += `🌾 *Crop:* ${crop}\n`;
      text += `⛈️ *Calamity:* ${calamityLabel}\n`;
      text += `📉 *Estimated Loss:* ${lossPercentage}%\n`;
      text += `⏳ *Deadline Window:* ${hoursLeft} hours remaining!\n\n`;
      text += `📞 National PMFBY Helpline: 14447\n`;
      text += `🏢 Insurer (${insurer.name}): ${insurer.tollFree}\n\n`;
      text += `Requesting urgent joint loss survey under PMFBY guidelines.`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl text-ink">
            {locale === "hi" ? "तात्कालिक दावा संपर्क एवं सहायता" : locale === "bn" ? "জরুরি দাবি ও হেল্পলাইন" : "Urgent Claim Intimation Channels"}
          </h3>
          <p className="text-xs text-ink-soft">
            {locale === "hi"
              ? "72-घंटे के भीतर इनमें से किसी भी माध्यम से सूचना दर्ज करवाकर टोकन नंबर प्राप्त करें।"
              : locale === "bn"
              ? "৭২ ঘণ্টার মধ্যে নিচের যেকোনো মাধ্যমে যোগাযোগ করে দাবি নিবন্ধন নম্বর সংগ্রহ করুন।"
              : "Report loss within 72 hours via any of these channels to obtain an official docket number."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* National Helpline 14447 */}
        <a
          href="tel:14447"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-moss-deep text-paper hover:bg-moss-deep/90 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-lg bg-paper/10 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-paper" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-paper/70 font-semibold">
              {locale === "hi" ? "राष्ट्रीय हेल्पलाइन (टोल-फ्री)" : locale === "bn" ? "জাতীয় হেল্পলাইন (টোল-ফ্রি)" : "National Helpline"}
            </div>
            <div className="font-mono text-lg font-bold">14447</div>
          </div>
        </a>

        {/* Insurer Helpline */}
        <a
          href={`tel:${cleanInsurerPhone}`}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-paper-2 border border-ink/15 text-ink hover:border-ink/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center shrink-0 text-ink">
            <Building className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-mono uppercase text-ink-soft truncate font-semibold">
              {insurer.name.split(" ")[0]} {locale === "hi" ? "बीमा सहायता" : locale === "bn" ? "বিমা হেল্পলাইন" : "Insurer"}
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-ink truncate">
              {insurer.tollFree}
            </div>
          </div>
        </a>

        {/* Crop Insurance App */}
        <a
          href="https://play.google.com/store/apps/details?id=in.farmguide.farmerapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-paper-2 border border-ink/15 text-ink hover:border-ink/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center shrink-0 text-ink">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-ink-soft font-semibold">
              {locale === "hi" ? "आधिकारिक मोबाइल ऐप" : locale === "bn" ? "অফিসিয়াল মোবাইল অ্যাপ" : "Official App"}
            </div>
            <div className="text-sm font-bold flex items-center gap-1 text-ink">
              <span>Crop Insurance</span>
              <ExternalLink className="w-3 h-3 text-ink-soft" />
            </div>
          </div>
        </a>

        {/* WhatsApp Share */}
        <button
          onClick={handleShareWhatsApp}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-emerald-800 font-semibold">
              {locale === "hi" ? "व्हाट्सएप पर साझा करें" : locale === "bn" ? "হোয়াটসঅ্যাপে শেয়ার" : "WhatsApp"}
            </div>
            <div className="text-sm font-bold text-emerald-950">
              {locale === "hi" ? "दावा सारांश भेजें" : locale === "bn" ? "দাবি বিবরণ পাঠান" : "Share Summary"}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
