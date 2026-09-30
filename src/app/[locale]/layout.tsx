import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono, Hind_Siliguri, Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import { JudgePanel } from "@/components/shared/JudgePanel";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GramRaksha AI",
  description: "Evidence you can trust, for two decisions.",
  manifest: "/manifest.webmanifest"
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  console.log("RootLayout rendered with locale:", locale);
  if (!locales.some((supportedLocale) => supportedLocale === locale)) {
    console.log("Locale not in list:", locale);
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} ${hindSiliguri.variable} ${notoSansDevanagari.variable}`}>
      <body className="antialiased font-body bg-paper text-ink selection:bg-moss/20 selection:text-ink">
        <NextIntlClientProvider messages={messages}>
          <OfflineBanner />
          <div className="fixed top-6 right-6 z-50">
            <LanguageSelector />
          </div>
          {children}
          <JudgePanel />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
