import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getSolarPackages } from "@/lib/sanity/packages";
import { SolarEstimator } from "@/components/estimator/SolarEstimator";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solar-calculator">): Promise<Metadata> {
  const { locale } = await params;
  const isTh = locale === "th";
  const title = isTh
    ? "คำนวณโซลาร์รูฟท็อป — ประหยัดและคืนทุนใน 30 วินาที"
    : "Solar Rooftop Calculator — savings & payback in 30 seconds";
  const description = isTh
    ? "ประเมินขนาดระบบโซลาร์ เงินที่ประหยัด ระยะคืนทุน ผลต่อสิ่งแวดล้อม และคำแนะนำว่าควรติดตั้งหรือไม่ จากค่าไฟและขนาดหลังคาของคุณ ฟรี ไม่ต้องลงทะเบียน"
    : "Estimate your solar system size, monthly savings, payback, environmental impact, and whether to install — from your electricity bill and roof size. Free, no sign-up.";
  return {
    title,
    description,
    alternates: alternates("/solar-calculator"),
    openGraph: { title, description },
  };
}

export default async function SolarCalculatorPage({
  params,
}: PageProps<"/[locale]/solar-calculator">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  await getDictionary(locale);

  const packages = await getSolarPackages();

  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="max-w-3xl">
            <MonoLabel tone="gold">
              {locale === "th" ? "ประเมินโซลาร์รูฟท็อป" : "Solar rooftop estimator"}
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
                ? "ดูว่าโซลาร์คุ้มกับหลังคาคุณไหม — ในไม่กี่วินาที"
                : "See if solar pays off on your roof — in seconds"}
            </h1>
            <p className="text-body-lg mt-5 max-w-2xl text-mist-400">
              {locale === "th"
                ? "กรอกค่าไฟและขนาดหลังคา แล้วรับการประเมินขนาดระบบ เงินที่ประหยัด ระยะคืนทุน ผลต่อสิ่งแวดล้อม และคำแนะนำว่าควรติดตั้งหรือไม่ — ทันที โดยไม่ต้องกรอกข้อมูลติดต่อ"
                : "Enter your bill and roof size for an instant estimate of system size, savings, payback, environmental impact, and whether we'd recommend installing — no contact details required."}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── The estimator ─────────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 pb-24 md:pb-28">
          <ScrollReveal>
            <SolarEstimator packages={packages} locale={locale} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
