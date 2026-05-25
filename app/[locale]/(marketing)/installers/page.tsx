import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  getAllInstallers,
  getAllServiceTypes,
  getInstallerProvinces,
} from "@/lib/sanity/installers";
import { InstallersDirectory } from "./InstallersDirectory";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/installers">): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "th"
      ? "ค้นหาช่างติดตั้งโซลาร์ที่ได้รับการรับรอง"
      : "Find a Certified WS Energy Installer";
  const description =
    locale === "th"
      ? "เครือข่ายช่างติดตั้งโซลาร์ ระบบกักเก็บพลังงาน และสถานีชาร์จรถยนต์ไฟฟ้าทั่วประเทศไทย ที่ได้รับการรับรองจาก WS Energy"
      : "WS Energy–certified partner installers across Thailand for solar, battery storage, and EV charging.";
  return { title, description, alternates: alternates("/installers") };
}

export default async function InstallersPage({
  params,
}: PageProps<"/[locale]/installers">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);

  const [installers, serviceTypes, provinces] = await Promise.all([
    getAllInstallers(),
    getAllServiceTypes(),
    getInstallerProvinces(),
  ]);

  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-12 md:pt-28 md:pb-16">
          <ScrollReveal className="max-w-3xl">
            <MonoLabel tone="gold">
              {locale === "th"
                ? "เครือข่ายผู้ติดตั้งที่ได้รับการรับรอง"
                : "Certified installer network"}
            </MonoLabel>
            <h1
              className="mt-4 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {locale === "th"
                ? "ค้นหาช่างติดตั้งโซลาร์ที่ได้รับการรับรองจาก WS Energy"
                : "Find a Certified WS Energy Installer"}
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-mist-400">
              {locale === "th"
                ? "พันธมิตรช่างติดตั้งที่ผ่านการฝึกอบรมและรับรองโดย WS Energy ทั่วประเทศไทย ดำเนินงานติดตั้งโซลาร์ ระบบกักเก็บพลังงาน และสถานีชาร์จรถยนต์ไฟฟ้าตามมาตรฐานความปลอดภัย"
                : "WS Energy–trained and authorized partners across Thailand, delivering solar, battery storage, and EV charging installations to safety-grade standards."}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Filters + grid ────────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-24 md:pt-20 md:pb-28">
          <ScrollReveal>
            <Suspense fallback={null}>
              <InstallersDirectory
                installers={installers}
                serviceTypes={serviceTypes}
                provinces={provinces}
                locale={locale}
              />
            </Suspense>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <ScrollReveal>
            <div className="rounded-2xl bg-card-50 p-10 text-card-ink md:p-14">
              <MonoLabel tone="forest">
                {locale === "th" ? "เป็นช่างติดตั้ง?" : "Are you an installer?"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight"
                style={{
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                }}
              >
                {locale === "th"
                  ? "เข้าร่วมเครือข่ายช่างติดตั้งของ WS Energy"
                  : "Join the WS Energy installer network"}
              </h2>
              <p className="text-body-lg mt-4 max-w-2xl text-forest-900/70">
                {locale === "th"
                  ? "เข้าถึงสินค้าคุณภาพแบบเอกสิทธิ์ การฝึกอบรมจาก Projoy และโอกาสในการแนะนำลูกค้าจากเว็บไซต์ของเรา"
                  : "Get exclusive product access, Projoy-led training, and a place in the directory we send customer leads to."}
              </p>
              <a
                href={`/${locale}/contact`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-body font-medium text-mist-50 transition-colors hover:bg-forest-800"
              >
                {locale === "th"
                  ? "ติดต่อทีมพันธมิตร"
                  : "Contact the partner team"}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
