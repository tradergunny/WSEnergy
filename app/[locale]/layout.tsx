import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WS Energy",
  description:
    "Thailand's authorized Projoy distributor — and your full-line partner for solar generation, storage, and EV.",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansThai.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
