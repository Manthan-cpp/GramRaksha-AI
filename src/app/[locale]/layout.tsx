import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono, Hind_Siliguri, Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
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
  title: "GramRaksha AI — Rural Civic, Agricultural & Health Defense",
  description: "Evidence-backed protection for rural citizens: Krishi crop advisory, Ayushman cashless shield, scam detector & PMFBY calamity kit.",
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

  if (!locales.some((supportedLocale) => supportedLocale === locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} ${hindSiliguri.variable} ${notoSansDevanagari.variable}`}>
      <body className="antialiased font-body bg-paper text-ink selection:bg-moss/20 selection:text-ink min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <OfflineBanner />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
