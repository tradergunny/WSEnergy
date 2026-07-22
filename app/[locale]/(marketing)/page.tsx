import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconAdjustmentsBolt,
  IconArrowRight,
  IconArrowUpRight,
  IconBatteryVertical2,
  IconBolt,
  IconCertificate,
  IconChargingPile,
  IconGridDots,
  IconMapPin,
  IconPlug,
  IconPlus,
  IconSchool,
  IconShieldCheckered,
  IconSolarPanel,
  IconTools,
  IconWaveSine,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import {
  featuredProjectsQuery,
  latestArticlesQuery,
  homepageCertificationsQuery,
} from "@/lib/sanity/queries";
import {
  getNextUpcomingTrainingSessions,
  type TrainingFormat,
  type TrainingSessionRow,
} from "@/lib/sanity/training";
import { getInstallerProvinces } from "@/lib/sanity/installers";
import { withLocale } from "@/lib/navigation";
import { SITE_URL } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { Magnetic } from "@/components/ui/Magnetic";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { SectionGlow } from "@/components/ui/SectionGlow";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { GsapBridge } from "@/components/marketing/GsapBridge";
import { HeroAct } from "@/components/marketing/HeroAct";
import { ServiceFlow } from "@/components/marketing/ServiceFlow";
import { ProductSchematic } from "@/components/product/ProductSchematic";
import { TracedBolt } from "@/components/marketing/TracedBolt";
import type { SchematicVariant } from "@/components/product/schematic-variant";
import { SafetyAct } from "@/components/marketing/SafetyAct";
import {
  SolutionsTabs,
  type SolutionTab,
} from "@/components/marketing/SolutionsTabs";
import { ThailandCoverageMap } from "@/components/marketing/ThailandCoverageMap";

/**
 * Homepage — "The Living Grid" experience.
 * Two pinned scroll acts (HeroAct's three-scene scale transition, SafetyAct's
 * rapid-shutdown story) over the editorial section rhythm. GSAP primitives
 * per BRIEF §7.10; Sanity remains the data source of truth.
 */

type ProjectRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  year?: number;
  heroImage?: Parameters<typeof urlFor>[0];
};

type ArticleRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  excerpt_en?: string;
  excerpt_th?: string;
  heroImage?: Parameters<typeof urlFor>[0];
  publishedAt?: string;
};

type CertificationRow = {
  _id: string;
  name?: string;
  logo?: Parameters<typeof urlFor>[0];
};

type BusinessPartner = {
  name: string;
  slug: string;
  /** Drop a transparent SVG/PNG into `public/partners/` and reference it here
   *  (e.g. `/partners/huawei.svg`). Without it, the cell renders the name as
   *  styled card text — a safe placeholder until the asset lands. */
  logoSrc?: string;
};

const BUSINESS_PARTNERS: readonly BusinessPartner[] = [
  { name: "PEA ENCOM", slug: "pea-encom", logoSrc: "/partners/pea-encom.png" },
  {
    name: "Godung Faifaa",
    slug: "godung-faifaa",
    logoSrc: "/partners/godung-faifaa.png",
  },
  { name: "Gunkul", slug: "gunkul", logoSrc: "/partners/gunkul.png" },
  { name: "SolaX Power", slug: "solax", logoSrc: "/partners/solax.png" },
  {
    name: "Prime Road Power",
    slug: "prime-road",
    logoSrc: "/partners/prime-road.png",
  },
  { name: "Huawei", slug: "huawei", logoSrc: "/partners/huawei.png" },
  { name: "Projoy Electric", slug: "projoy", logoSrc: "/partners/projoy.png" },
  // Per-user order: Sigenergy takes the "closing" slot of row 1; Greenergy
  // opens row 2 so the new logo lands in a fresh row of its own.
  { name: "Sigenergy", slug: "sigenergy", logoSrc: "/partners/sigenergy.png" },
  { name: "Greenergy", slug: "greenergy", logoSrc: "/partners/greenergy.png" },
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.home.hero.headline,
    description: dict.home.hero.subhead,
    alternates: alternates("/"),
    openGraph: {
      title: dict.home.hero.headline,
      description: dict.home.hero.subhead,
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.home;

  const [
    projects,
    articles,
    certifications,
    trainingSessions,
    installerProvinces,
  ] = await Promise.all([
    sanityClient.fetch<ProjectRow[]>(featuredProjectsQuery),
    sanityClient.fetch<ArticleRow[]>(latestArticlesQuery),
    sanityClient.fetch<CertificationRow[]>(homepageCertificationsQuery),
    getNextUpcomingTrainingSessions(),
    getInstallerProvinces(),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");

  // The Projoy photo is real product photography and stays on the one tile
  // it depicts. Every other tile renders its category's blueprint schematic —
  // six copies of the same photo read as unfinished.
  const flagships: {
    key: string;
    title: string;
    brandPill?: "PROJOY" | "T-SUN";
    photoUrl?: string;
    art?: SchematicVariant;
    href: string;
  }[] = [
    {
      key: "rapid-shutdown",
      title: "Rapid Shutdown",
      brandPill: "PROJOY",
      photoUrl: "/products/projoy-rapid-shutdown.png",
      href: withLocale(locale, "/safety/rapid-shutdown"),
    },
    {
      key: "controller-box",
      title: "Controller Box",
      brandPill: "PROJOY",
      art: "optimizer",
      href: withLocale(locale, "/safety/rapid-shutdown"),
    },
    {
      key: "firefighter-safety-switches",
      title: "Firefighter Safety Switches",
      brandPill: "PROJOY",
      art: "switch",
      href: withLocale(locale, "/safety/firefighter-safety-switches"),
    },
    {
      key: "micro-inverter",
      title: "Micro Inverter",
      brandPill: "T-SUN",
      art: "inverter",
      href: withLocale(locale, "/products/micro-inverters"),
    },
    {
      key: "scada-monitoring",
      title: "SCADA & Monitoring",
      art: "generic",
      href: withLocale(locale, "/solutions/scada-monitoring"),
    },
    {
      key: "full-catalog",
      title: "Full catalog",
      art: "battery",
      href: withLocale(locale, "/products"),
    },
  ];

  // Category rail — a one-row table of contents for the catalogue,
  // mirroring the six category pages in the products nav. Labels come
  // from dict.nav so the rail and the header menu never drift apart.
  const categoryRail = [
    { key: "inverters", icon: IconWaveSine, href: "/products/inverters" },
    {
      key: "batteryStorage",
      icon: IconBatteryVertical2,
      href: "/products/battery-storage",
    },
    {
      key: "optimizers",
      icon: IconAdjustmentsBolt,
      href: "/products/optimizers",
    },
    {
      key: "microInverters",
      icon: IconGridDots,
      href: "/products/micro-inverters",
    },
    {
      key: "evChargers",
      icon: IconChargingPile,
      href: "/products/ev-chargers",
    },
    { key: "accessories", icon: IconPlug, href: "/products/accessories" },
  ] as const;

  const solutionTabs: SolutionTab[] = [
    {
      key: "residential",
      label: locale === "th" ? "ที่อยู่อาศัย" : "Residential",
      title: t.solutions.residential,
      body: t.solutions.residentialDesc,
      bullets: [
        locale === "th" ? "ออกแบบตามรูปทรงหลังคา" : "Designed around your roof",
        locale === "th"
          ? "ระบบ Rapid Shutdown ในตัว"
          : "Rapid Shutdown built-in",
        locale === "th" ? "ติดตั้ง 4–8 สัปดาห์" : "Installed in 4–8 weeks",
      ],
      href: withLocale(locale, "/solutions/residential"),
      ctaLabel: locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more",
      image: "/solutions/residential-hero.jpg",
    },
    {
      key: "ci",
      label:
        locale === "th" ? "พาณิชย์และอุตสาหกรรม" : "Commercial & Industrial",
      title: t.solutions.ci,
      body: t.solutions.ciDesc,
      bullets: [
        locale === "th" ? "ROI 3–5 ปี" : "Typical 3–5 year ROI",
        locale === "th"
          ? "ตรวจสอบทางวิศวกรรมเต็มรูปแบบ"
          : "Full engineering review",
        locale === "th"
          ? "การปฏิบัติตามมาตรฐานความปลอดภัย"
          : "Compliance with TIS / IEC",
      ],
      href: withLocale(locale, "/solutions/commercial-industrial"),
      ctaLabel: locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more",
      image: "/solutions/ci-hero.jpg",
    },
    {
      key: "solar-farm",
      label: locale === "th" ? "โซลาร์ฟาร์ม" : "Solar farm",
      title: t.solutions.solarFarm,
      body: t.solutions.solarFarmDesc,
      bullets: [
        locale === "th"
          ? "ตั้งแต่ MW เดียวถึงระดับยูทิลิตี้"
          : "Single MW to utility-scale",
        locale === "th" ? "การบูรณาการ SCADA" : "SCADA integration",
        locale === "th"
          ? "การจัดการโครงการแบบครบวงจร"
          : "End-to-end project delivery",
      ],
      href: withLocale(locale, "/solutions/solar-farm"),
      ctaLabel: locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more",
      image: "/solutions/solar-farm-hero.jpg",
    },
    {
      key: "scada",
      label: locale === "th" ? "SCADA" : "SCADA monitoring",
      title: t.solutions.scada,
      body: t.solutions.scadaDesc,
      bullets: [
        locale === "th"
          ? "ตรวจสอบประสิทธิภาพแบบเรียลไทม์"
          : "Real-time performance monitoring",
        locale === "th"
          ? "การแจ้งเตือนความผิดพลาด"
          : "Fault alerting & diagnostics",
        locale === "th"
          ? "การรายงานแก่ผู้มีส่วนได้เสีย"
          : "Stakeholder-grade reporting",
      ],
      href: withLocale(locale, "/solutions/scada-monitoring"),
      ctaLabel: locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WS Energy Co., Ltd.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/WSLogo.png`,
    description: t.hero.subhead,
    address: {
      "@type": "PostalAddress",
      streetAddress: "51/17 Moo 3 Bangpla, Bangplee",
      addressLocality: "Samut Prakan",
      postalCode: "10540",
      addressCountry: "TH",
    },
    telephone: "+66870538668",
    sameAs: [],
  };

  const headlineClamp = {
    fontSize: "clamp(28px, 4vw, 44px)",
    lineHeight: 1.1,
    letterSpacing: "-0.015em",
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Counter-zoom: cancels html's global zoom: 0.8125 so viewport-height
         stages and ScrollTrigger math run at true viewport scale. */}
      <div style={{ zoom: 1.2308 }}>
        <GsapBridge />

        {/* ── 1 · Scroll-scrubbed scale transition (house → factory → farm) ── */}
        <HeroAct
          locale={locale}
          quoteHref={quoteHref}
          solutionsHref={withLocale(locale, "/solutions/commercial-industrial")}
          requestQuoteLabel={dict.actions.requestQuote}
        />

        {/* ── 1.5 · Manifesto — the signed safety thesis ──────────── */}
        {/* Conviction before borrowed authority: this band states, in our
            own name, why the company exists. Partner logos follow it. */}
        <section className="bg-forest-950 relative overflow-hidden">
          {/* The company's own mark signs its manifesto: the WS bolt as a
              gold-traced engraving, not a product drawing. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 hidden w-[360px] -translate-y-1/2 lg:block xl:right-16"
          >
            <TracedBolt />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
            <ScrollReveal>
              <MonoLabel tone="gold">
                {locale === "th" ? "เหตุผลที่เราก่อตั้ง" : "Why we exist"}
              </MonoLabel>
            </ScrollReveal>
            <SplitTextReveal
              as="h2"
              className="mt-5 max-w-4xl font-medium tracking-tight text-mist-50"
            >
              <span
                className="block"
                style={{
                  fontSize: "clamp(30px, 4.6vw, 54px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                }}
              >
                {locale === "th"
                  ? "WS Energy ก่อตั้งขึ้นเพื่อให้การเติบโตของโซลาร์ไทย ไม่ต้องแลกด้วยชีวิต"
                  : "WS Energy exists so Thailand's solar boom never costs a life."}
              </span>
            </SplitTextReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-body-lg mt-7 max-w-2xl text-mist-300">
                {locale === "th"
                  ? "โซลาร์กำลังขยายสู่หลังคาทั่วประเทศ ทั้งบ้าน โรงงาน โกดัง และโรงเรียน ทุกหลังคาล้วนมีไฟฟ้ากระแสตรงแรงดันสูงทำงานอยู่ แต่อุตสาหกรรมส่วนใหญ่กลับมองข้ามเรื่องนี้ เราจึงสร้าง WS Energy ในทิศทางตรงกันข้าม ความปลอดภัยคือผลิตภัณฑ์ของเรา ตั้งแต่ระบบ Rapid Shutdown ที่เราเป็นผู้แทนจำหน่ายแต่เพียงผู้เดียวในไทย การอบรมช่างติดตั้งที่ผ่านการรับรอง ไปจนถึงอุปกรณ์ทุกชิ้นที่เรากล้าติดตั้งบนหลังคาบ้านของครอบครัวเราเอง"
                  : "Solar is racing onto Thai rooftops: homes, factories, warehouses, schools. Every one of those roofs carries live DC voltage, and much of the industry treats that as a footnote. We built WS Energy the other way around. Safety is the product: exclusive rapid-shutdown distribution, certified installer training, and equipment we would put on our own families' homes."}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              {/* Signed by the founder: a real face and name is the highest-
                  trust element on the page. The portrait's own white studio
                  background fills the disc; a hairline ring seats it on the
                  forest canvas. */}
              {/* Letterhead footer: the person signs, the company stamps.
                  Founder left; the lockup as a static seal right, at natural
                  raster size (180x60 source — never upscale it). */}
              <div className="mt-12 flex max-w-2xl flex-wrap items-center justify-between gap-x-10 gap-y-8 border-t border-mist-800 pt-7">
                <div className="flex items-center gap-5">
                  <div className="bg-card-50 relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-mist-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/team/sittiphol-ngamsangiam.png"
                      alt="Sittiphol Ngamsangiam, Founder & Managing Director of WS Energy"
                      className="absolute inset-0 h-full w-full scale-[1.15] object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="font-medium tracking-tight text-mist-50">
                      {locale === "th"
                        ? "คุณสิทธิพล งามเสงี่ยม"
                        : "Sittiphol Ngamsangiam"}
                    </p>
                    <p className="text-caption mt-1 font-mono tracking-wider text-mist-400 uppercase">
                      {locale === "th"
                        ? "ผู้ก่อตั้งและกรรมการผู้จัดการ"
                        : "Founder & Managing Director"}
                    </p>
                  </div>
                </div>
                {/* Mirrors the founder block's grammar: mark where the
                    portrait sits, two lines of identity beside it. */}
                <div className="flex items-center gap-5">
                  {/* Wider slot than the portrait disc once the blocks sit
                      side by side — the wordmark needs horizontal room to
                      carry the same optical weight. While they're stacked,
                      it matches the disc so both text columns share a rail. */}
                  <div className="flex h-16 w-16 shrink-0 items-center sm:w-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/WSLogo.png" alt="WS Energy" className="w-full" />
                  </div>
                  <div>
                    <p className="font-medium tracking-tight text-mist-50">
                      WS Energy Co., Ltd.
                    </p>
                    <p className="text-caption mt-1 font-mono tracking-wider text-mist-400 uppercase">
                      {locale === "th"
                        ? "สมุทรปราการ ประเทศไทย"
                        : "Samut Prakan, Thailand"}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 1.6 · Service flow — the manifesto's method ─────────── */}
        {/* An open full-width band like its neighbors — the shift to
            forest-900 off the manifesto's 950 canvas marks the seam,
            and the hairline below hands off to partners. Header sits
            beside the rail so the section stays short; the looping
            pulse is the show, not the section size. */}
        <section className="bg-forest-900 relative overflow-hidden border-b border-mist-800/50">
          {/* The design-review still anchors the band's left edge and
              fades to solid forest before the rail begins, so the
              pulse keeps a quiet stage. Same photo-under-scrim
              technique as the closing CTA. Desktop only: on mobile
              the photo would sit under the whole vertical timeline. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/service/sld-review.jpg"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-left"
            />
            <div className="from-forest-900/70 via-forest-900/90 to-forest-900 absolute inset-0 bg-gradient-to-r via-45% to-70%" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-16">
            <ScrollReveal>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                {/* Header rides beside the rail, not above it, so the
                    whole section stays one horizontal strip. */}
                <div className="lg:col-span-3">
                  <MonoLabel tone="gold">
                    {locale === "th" ? "ขั้นตอนบริการ" : "Service flow"}
                  </MonoLabel>
                  <h2
                    className="mt-3 font-medium tracking-tight text-mist-50"
                    style={{
                      fontSize: "clamp(20px, 2vw, 24px)",
                      lineHeight: 1.25,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {locale === "th"
                      ? "ทีมเดียว ตั้งแต่แบบร่างจนถึงการดูแลระยะยาว"
                      : "One team, from drawing to decades"}
                  </h2>
                  {/* mist-200, not 400: this line sits over the photo. */}
                  <p className="text-caption mt-2 text-mist-200">
                    {locale === "th"
                      ? "ทุกออเดอร์ผ่านทีมเดิมครบทั้งห้าขั้นตอน ไม่ส่งต่องานให้ใครกลางทาง"
                      : "Every order moves through the same five hands. No handoffs to strangers."}
                  </p>
                </div>
                <div className="lg:col-span-9">
                  <ServiceFlow
                    steps={[
                      {
                        key: "design",
                        title: locale === "th" ? "ตรวจแบบระบบ" : "Design check",
                        detail:
                          locale === "th"
                            ? "ตรวจ SLD เลย์เอาต์ และแนะนำอุปกรณ์"
                            : "SLD and layout review",
                      },
                      {
                        key: "delivery",
                        title: locale === "th" ? "จัดส่งสินค้า" : "Delivery",
                        detail:
                          locale === "th"
                            ? "ส่งตรงจากคลังในไทย"
                            : "From Thai warehouse stock",
                      },
                      {
                        key: "install",
                        title:
                          locale === "th"
                            ? "ซัพพอร์ตติดตั้ง"
                            : "Install support",
                        detail:
                          locale === "th"
                            ? "มีคู่มือและวิศวกรให้คำแนะนำ"
                            : "Manuals and engineer guidance",
                      },
                      {
                        key: "commissioning",
                        title: locale === "th" ? "เปิดระบบ" : "Commissioning",
                        detail:
                          locale === "th"
                            ? "คอมมิชชันนิงพร้อมอบรมทีม"
                            : "System startup, team training",
                      },
                      {
                        key: "aftersale",
                        title: locale === "th" ? "หลังการขาย" : "After-sale",
                        detail:
                          locale === "th"
                            ? "มอนิเตอร์และซ่อมบำรุง"
                            : "Monitoring and maintenance",
                      },
                    ]}
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 2 · Business partners (editorial logo grid) ─────────── */}
        <section className="bg-forest-900 relative overflow-hidden">
          <SectionGlow position="top-center" />
          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center md:mb-14">
              <MonoLabel tone="mist">
                {locale === "th" ? "พันธมิตรทางธุรกิจ" : "Business partners"}
              </MonoLabel>
              <p
                className="max-w-2xl font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(22px, 2.8vw, 30px)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.015em",
                }}
              >
                {locale === "th" ? (
                  <>
                    ทำงานร่วมกับผู้นำใน{" "}
                    <span className="text-gold-500">
                      อุตสาหกรรมพลังงานสะอาด
                    </span>
                  </>
                ) : (
                  <>
                    The companies we{" "}
                    <span className="text-gold-500">collaborate</span> with.
                  </>
                )}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <ul className="relative grid grid-cols-2 gap-px bg-mist-800/60 md:grid-cols-4">
                {/* Full-bleed top hairline */}
                <li
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-px left-1/2 w-screen -translate-x-1/2 border-t border-mist-800/60"
                />

                {/* 8 cells in 4-col × 2-row layout. Greenergy is the 9th in the
                    source list — it sits off-grid and is implied by the "+more"
                    link below. Slice keeps Greenergy in `BUSINESS_PARTNERS` so
                    its logo file stays referenced and easy to re-introduce. */}
                {BUSINESS_PARTNERS.slice(0, 8).map((partner, i) => {
                  const col = i % 4;
                  const row = Math.floor(i / 4);
                  const showPlus = col < 3 && row < 1;
                  // Section sits on forest-900, so the checker stripe sinks
                  // alternate cells to forest-950.
                  const sunk = i % 2 === 0;
                  return (
                    <li
                      key={partner.slug}
                      className={`relative flex h-32 items-center justify-center px-6 md:h-40 md:px-8 lg:h-48 lg:px-10 ${
                        sunk ? "bg-forest-950" : "bg-forest-900"
                      }`}
                    >
                      {partner.logoSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={partner.logoSrc}
                          alt={partner.name}
                          className="max-h-14 w-auto object-contain opacity-90 brightness-0 invert select-none md:max-h-16 lg:max-h-20"
                        />
                      ) : (
                        <span className="text-h4 font-medium tracking-tight text-mist-200">
                          {partner.name}
                        </span>
                      )}
                      {showPlus ? (
                        <IconPlus
                          size={20}
                          stroke={1.5}
                          className="pointer-events-none absolute -right-[10px] -bottom-[10px] z-10 hidden text-mist-600 md:block"
                        />
                      ) : null}
                    </li>
                  );
                })}

                {/* Full-bleed bottom hairline */}
                <li
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-px left-1/2 w-screen -translate-x-1/2 border-b border-mist-800/60"
                />
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="mt-6 flex justify-end md:mt-8">
              <Link
                href={withLocale(locale, "/about")}
                className="group/more text-body text-gold-500 hover:text-gold-400 inline-flex items-center gap-2 font-medium transition-colors"
              >
                <IconPlus size={14} stroke={2.5} />
                <span>
                  {locale === "th" ? "พันธมิตรเพิ่มเติม" : "more partners"}
                </span>
                <IconArrowRight
                  size={14}
                  stroke={2}
                  className="transition-transform duration-200 group-hover/more:translate-x-0.5"
                />
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 3 · Rapid Shutdown story (pinned act) ───────────────── */}
        <SafetyAct
          locale={locale}
          rapidShutdownHref={withLocale(locale, "/safety/rapid-shutdown")}
          partnershipHref={withLocale(locale, "/about/projoy-partnership")}
        />

        {/* ── 4 · Flagship products ───────────────────────────────── */}
        <section className="bg-forest-900 relative overflow-hidden">
          <SectionGlow />
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <ScrollReveal>
                  <MonoLabel tone="mist">
                    {locale === "th" ? "ผลิตภัณฑ์เด่น" : "Flagship products"}
                  </MonoLabel>
                </ScrollReveal>
                <SplitTextReveal
                  as="h2"
                  className="mt-3 font-medium tracking-tight text-mist-50"
                >
                  <span className="block" style={headlineClamp}>
                    {t.categories.heading}
                  </span>
                </SplitTextReveal>
                <ScrollReveal delay={0.15}>
                  <p className="text-body-lg mt-4 text-mist-400">
                    {t.categories.subhead}
                  </p>
                </ScrollReveal>
              </div>
              <ScrollReveal delay={0.1}>
                <Link
                  href={withLocale(locale, "/products")}
                  className="group/btn text-body inline-flex items-center gap-1.5 rounded-full border border-mist-400/30 px-4 py-2 font-medium text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
                >
                  {dict.actions.viewAll}
                  <IconArrowRight
                    size={16}
                    stroke={2}
                    className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                  />
                </Link>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {flagships.map((tile, i) => (
                <ScrollReveal key={tile.key} delay={i * 0.04}>
                  <Card
                    surface="forest-deep"
                    href={tile.href}
                    className="h-full"
                  >
                    <div className="flex h-full flex-col">
                      <div className="bg-forest-950 relative aspect-[4/3] w-full overflow-hidden">
                        {tile.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={tile.photoUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 ease-out group-hover/card:scale-105"
                          />
                        ) : tile.art ? (
                          <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="aspect-[252/312] h-full">
                              <ProductSchematic variant={tile.art} />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                              _{tile.key.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        aria-hidden="true"
                        className="h-px w-full bg-mist-800"
                      />
                      <div className="bg-forest-900 flex min-h-[72px] flex-1 items-center justify-between gap-3 px-5 py-4">
                        <h3
                          className="truncate font-medium tracking-tight text-mist-50 transition-transform duration-300 ease-out group-hover/card:translate-x-0.5"
                          style={{
                            fontSize: 17,
                            lineHeight: 1.3,
                            letterSpacing: "-0.01em",
                          }}
                          title={tile.title}
                        >
                          {tile.title}
                        </h3>
                        <span className="flex shrink-0 items-center gap-2">
                          {tile.brandPill ? (
                            <span className="text-caption inline-flex items-center rounded-full border border-mist-800 px-2.5 py-1 font-mono tracking-wider text-mist-300 uppercase">
                              {tile.brandPill}
                            </span>
                          ) : null}
                          <IconArrowUpRight
                            size={14}
                            stroke={2}
                            className="text-mist-400 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {/* Category rail — the breadth signal the old site carried
                with a product collage, reduced to a table of contents:
                six wordless glyphs linking into the catalogue. Hairline
                dividers only from md up; on mobile the 2-col wrap would
                give row-start cells stray left borders. */}
            <ScrollReveal delay={0.1}>
              <nav
                aria-label={
                  locale === "th" ? "หมวดหมู่สินค้า" : "Product categories"
                }
                className="mt-14 border-t border-mist-800 pt-8"
              >
                <p className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                  {locale === "th"
                    ? "_ครบทุกหมวด จากคลังเดียว"
                    : "_The full range, one warehouse"}
                </p>
                <ul className="mt-7 grid grid-cols-2 gap-y-7 sm:grid-cols-3 md:grid-cols-6 md:divide-x md:divide-mist-800/60">
                  {categoryRail.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <li key={cat.key}>
                        <Link
                          href={withLocale(locale, cat.href)}
                          className="group/rail flex flex-col items-center gap-2.5 px-2 text-center"
                        >
                          <CatIcon
                            size={22}
                            stroke={1.5}
                            className="text-mist-400 transition-colors duration-200 group-hover/rail:text-gold-500"
                          />
                          <span className="text-caption inline-flex items-center gap-1 text-mist-300 transition-colors duration-200 group-hover/rail:text-gold-500">
                            {dict.nav[cat.key]}
                            <IconArrowUpRight
                              size={12}
                              stroke={2}
                              className="opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100"
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 5 · Proof band — provable credentials first ─────────── */}
        {/* The hero claim is the exclusive distributorship (a contractual
            fact); scale numbers sit in a deliberately quiet row below until
            audited figures replace the current estimates. */}
        <section className="bg-forest-950 relative overflow-hidden">
          <SectionGlow />
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="mb-12 max-w-4xl md:mb-14">
              <ScrollReveal>
                <MonoLabel tone="gold">
                  {locale === "th"
                    ? "ความแตกต่างของ WS ENERGY"
                    : "The WS Energy difference"}
                </MonoLabel>
              </ScrollReveal>
              <SplitTextReveal
                as="h2"
                className="mt-4 font-medium tracking-tight text-mist-50"
              >
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(30px, 4.6vw, 54px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {locale === "th"
                    ? "ผู้แทนจำหน่าย Projoy แต่เพียงผู้เดียวในประเทศไทย"
                    : "Thailand's exclusive Projoy distributor."}
                </span>
              </SplitTextReveal>
              <ScrollReveal delay={0.15}>
                <p className="text-body-lg mt-5 max-w-2xl text-mist-300">
                  {locale === "th"
                    ? "อุปกรณ์ Rapid Shutdown ของ Projoy ทุกชิ้นที่จำหน่ายในประเทศไทยส่งผ่าน WS Energy แหล่งเดียวที่รับผิดชอบทั้งฮาร์ดแวร์ การอบรมช่างติดตั้ง และเอกสารรับรองมาตรฐาน"
                    : "Every Projoy rapid-shutdown unit sold in Thailand ships through WS Energy: one accountable source for the hardware, the installer training, and the compliance paperwork behind it."}
                </p>
              </ScrollReveal>
            </div>

            {/* Credential ledger — claims a skeptic can verify. */}
            <ScrollReveal delay={0.05}>
              <div className="grid grid-cols-1 divide-y divide-mist-800 border-y border-mist-800 md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="py-6 md:pr-10">
                  <p className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                    {locale === "th"
                      ? "ผู้แทนจำหน่ายอย่างเป็นทางการ"
                      : "Authorized distributor for"}
                  </p>
                  <p className="mt-2 font-mono text-[17px] text-mist-50">
                    Huawei · SolaX · T-SUN
                  </p>
                </div>
                <div className="py-6 md:px-10">
                  <p className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                    {locale === "th"
                      ? "ได้รับการรับรองมาตรฐาน"
                      : "Certified to"}
                  </p>
                  {/* Sanity's certification list wins once it holds 2+ named
                      entries; until then use the user-confirmed baseline
                      (a lone "TIS" reads weaker than the real coverage). */}
                  <p className="mt-2 font-mono text-[17px] text-mist-50">
                    {certifications.filter((c) => c.name).length >= 2
                      ? certifications
                          .slice(0, 3)
                          .map((c) => c.name)
                          .filter(Boolean)
                          .join(" · ")
                      : "IEC · TIS"}
                  </p>
                </div>
                <div className="py-6 md:pl-10">
                  <p className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                    {locale === "th" ? "ฐานปฏิบัติการ" : "Base of operations"}
                  </p>
                  <p className="mt-2 font-mono text-[17px] text-mist-50">
                    {locale === "th"
                      ? "สมุทรปราการ ประเทศไทย"
                      : "Samut Prakan, Thailand"}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Scale stats — quiet on purpose; estimates pending real figures. */}
            <ScrollReveal delay={0.12} className="mt-9">
              <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
                <div>
                  <p className="font-mono text-[24px] leading-none text-mist-100">
                    <CountUp to={500} suffix=" MW+" />
                  </p>
                  <p className="text-caption mt-2 text-mist-500">
                    {locale === "th"
                      ? "พลังงานสะอาดที่ส่งมอบ"
                      : "Clean energy delivered"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[24px] leading-none text-mist-100">
                    <CountUp to={1200} suffix="+" />
                  </p>
                  <p className="text-caption mt-2 text-mist-500">
                    {locale === "th"
                      ? "ระบบที่ติดตั้งแล้ว"
                      : "Systems installed to date"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[24px] leading-none text-mist-100">
                    <CountUp to={15} suffix="+ yrs" />
                  </p>
                  <p className="text-caption mt-2 text-mist-500">
                    {locale === "th"
                      ? "ประสบการณ์ในวงการ"
                      : "Industry experience"}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="mt-14">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <WhyTile
                  icon={<IconTools size={22} stroke={1.5} />}
                  title={t.why.engineeringTitle}
                  desc={t.why.engineeringDesc}
                />
                <WhyTile
                  icon={<IconSchool size={22} stroke={1.5} />}
                  title={t.why.trainingTitle}
                  desc={t.why.trainingDesc}
                />
                <WhyTile
                  icon={<IconShieldCheckered size={22} stroke={1.5} />}
                  title={t.why.authorizedTitle}
                  desc={t.why.authorizedDesc}
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 5.5 · National footprint ────────────────────────────── */}
        {/* Reach, not a heatmap: an enterprise distributor based in Samut
            Prakan whose projects and installer network span the country.
            Hubs are real Sanity geography — HQ, project sites, installer
            provinces. This is our answer to WHA's world-map moment. */}
        <section className="bg-forest-900 relative overflow-hidden border-b border-mist-800/50">
          {/* Backlights the map, which is this section's focal point. */}
          <SectionGlow position="top-right" />
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Copy + regional ledger */}
              <div className="lg:col-span-6">
                <ScrollReveal>
                  <MonoLabel tone="gold">
                    {locale === "th"
                      ? "ขอบเขตการดำเนินงาน"
                      : "National footprint"}
                  </MonoLabel>
                </ScrollReveal>
                <SplitTextReveal
                  as="h2"
                  className="mt-4 font-medium tracking-tight text-mist-50"
                >
                  <span
                    className="block"
                    style={{
                      fontSize: "clamp(30px, 4.4vw, 52px)",
                      lineHeight: 1.08,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {locale === "th"
                      ? "ฐานที่สมุทรปราการ ส่งมอบทั่วประเทศไทย"
                      : "Based in Samut Prakan. Delivered across Thailand."}
                  </span>
                </SplitTextReveal>
                <ScrollReveal delay={0.12}>
                  <p className="text-body-lg mt-5 max-w-xl text-mist-300">
                    {locale === "th"
                      ? "เราจัดหาและออกแบบระบบให้กับโครงการระดับองค์กร โรงงาน คลังสินค้า และโซลาร์ฟาร์ม จากสำนักงานใหญ่ในสมุทรปราการ ผ่านเครือข่ายช่างติดตั้งที่ได้รับการรับรอง ครอบคลุมตั้งแต่ภาคเหนือถึงภาคใต้"
                      : "We supply and engineer systems for enterprise clients — factories, warehouses, and solar farms — from our Samut Prakan headquarters, through a certified installer network that reaches from the north to the south."}
                  </p>
                </ScrollReveal>

                {/* Regional ledger — provable, from Sanity province coverage. */}
                <ScrollReveal delay={0.18}>
                  <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-mist-800 pt-8 sm:max-w-md">
                    <div>
                      <dt className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                        {locale === "th" ? "สำนักงานใหญ่" : "Headquarters"}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[17px] text-mist-50">
                        {locale === "th" ? "สมุทรปราการ" : "Samut Prakan"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                        {locale === "th"
                          ? "ภูมิภาคที่ครอบคลุม"
                          : "Regions covered"}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[17px] text-mist-50">
                        {locale === "th"
                          ? "เหนือ · กลาง · ตะวันออก · ใต้"
                          : "North · Central · East · South"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                        {locale === "th"
                          ? "จังหวัดที่มีช่างติดตั้ง"
                          : "Installer provinces"}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[17px] text-mist-50">
                        {installerProvinces.length > 0
                          ? installerProvinces.join(" · ")
                          : locale === "th"
                            ? "เชียงใหม่ · ระยอง · ภูเก็ต · กรุงเทพฯ"
                            : "Chiang Mai · Rayong · Phuket · Bangkok"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption font-mono tracking-wider text-mist-500 uppercase">
                        {locale === "th" ? "กลุ่มลูกค้าหลัก" : "Primary focus"}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[17px] text-mist-50">
                        {locale === "th"
                          ? "องค์กร · อุตสาหกรรม"
                          : "Enterprise · Industrial"}
                      </dd>
                    </div>
                  </dl>
                </ScrollReveal>

                {/* Legend */}
                <ScrollReveal delay={0.22}>
                  <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                    <li className="text-caption flex items-center gap-2 text-mist-400">
                      <span className="ring-gold-500 bg-gold-500 ring-offset-forest-900 h-2.5 w-2.5 rounded-full ring-2 ring-offset-2" />
                      {locale === "th" ? "สำนักงานใหญ่" : "Headquarters"}
                    </li>
                    <li className="text-caption flex items-center gap-2 text-mist-400">
                      <span className="bg-gold-500/90 h-2.5 w-2.5 rounded-full" />
                      {locale === "th" ? "โครงการอ้างอิง" : "Project sites"}
                    </li>
                    <li className="text-caption flex items-center gap-2 text-mist-400">
                      <span className="border-gold-500/60 h-2.5 w-2.5 rounded-full border bg-mist-50" />
                      {locale === "th"
                        ? "เครือข่ายช่างติดตั้ง"
                        : "Installer network"}
                    </li>
                  </ul>
                </ScrollReveal>
              </div>

              {/* Map */}
              <div className="flex justify-center lg:col-span-6 lg:justify-end">
                <ThailandCoverageMap locale={locale} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 6 · Solutions tabs ──────────────────────────────────── */}
        <section className="bg-forest-900 relative overflow-hidden">
          <SectionGlow />
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="mb-10 max-w-3xl">
              <ScrollReveal>
                <MonoLabel tone="mist">
                  {locale === "th" ? "โซลูชันของเรา" : "Our solutions"}
                </MonoLabel>
              </ScrollReveal>
              <SplitTextReveal
                as="h2"
                className="mt-3 font-medium tracking-tight text-mist-50"
              >
                <span className="block" style={headlineClamp}>
                  {locale === "th"
                    ? "โซลาร์สำหรับทุกขนาดโครงการ"
                    : "Solar solutions for every scale."}
                </span>
              </SplitTextReveal>
            </div>

            <ScrollReveal delay={0.05}>
              <SolutionsTabs tabs={solutionTabs} />
            </ScrollReveal>
          </div>
        </section>

        {/* ── 6.5 · Solar rooftop estimator ───────────────────────── */}
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <ScrollReveal>
              <div className="bg-card-50 text-card-ink rounded-2xl p-10 md:p-14">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-7">
                    <MonoLabel tone="forest">
                      {locale === "th"
                        ? "คำนวณโซลาร์รูฟท็อป"
                        : "Solar rooftop calculator"}
                    </MonoLabel>
                    <h2
                      className="mt-3 font-medium tracking-tight"
                      style={headlineClamp}
                    >
                      {locale === "th"
                        ? "โซลาร์คุ้มกับหลังคาคุณไหม? รู้ผลใน 30 วินาที"
                        : "Will solar pay off on your roof?"}
                    </h2>
                    <p className="text-body-lg text-forest-900/70 mt-4 max-w-xl">
                      {locale === "th"
                        ? "กรอกค่าไฟและขนาดหลังคา รับขนาดระบบที่แนะนำ เงินที่ประหยัด ระยะคืนทุน และคำแนะนำว่าควรติดตั้งหรือไม่ — ฟรี ไม่ต้องลงทะเบียน"
                        : "Enter your bill and roof size for an instant estimate of system size, savings, payback, and whether we'd recommend installing — free, no sign-up."}
                    </p>
                    <div className="text-caption text-forest-900/55 mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono tracking-wider uppercase">
                      <span>{locale === "th" ? "ฟรี" : "Free"}</span>
                      <span>
                        {locale === "th" ? "ไม่ต้องลงทะเบียน" : "No sign-up"}
                      </span>
                      <span>
                        {locale === "th" ? "≈ 30 วินาที" : "≈ 30 seconds"}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-5 md:flex md:justify-end">
                    <Magnetic>
                      <Button
                        variant="on-card"
                        size="lg"
                        href={withLocale(locale, "/solar-calculator")}
                      >
                        {locale === "th" ? "ลองคำนวณเลย" : "Try the calculator"}
                        <IconArrowRight size={16} stroke={2} />
                      </Button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 7 · Recent projects ─────────────────────────────────── */}
        {projects.length > 0 ? (
          <section className="bg-forest-950 relative overflow-hidden">
            <SectionGlow />
            <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <ScrollReveal>
                    <MonoLabel tone="mist">
                      {locale === "th" ? "โครงการล่าสุด" : "Recent projects"}
                    </MonoLabel>
                  </ScrollReveal>
                  <SplitTextReveal
                    as="h2"
                    className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  >
                    <span className="block" style={headlineClamp}>
                      {t.projects.heading}
                    </span>
                  </SplitTextReveal>
                </div>
                <ScrollReveal delay={0.1}>
                  <Link
                    href={withLocale(locale, "/projects")}
                    className="group/btn text-body inline-flex items-center gap-1.5 rounded-full border border-mist-400/30 px-4 py-2 font-medium text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
                  >
                    {t.projects.cta}
                    <IconArrowRight
                      size={16}
                      stroke={2}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                    />
                  </Link>
                </ScrollReveal>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {projects.slice(0, 4).map((p, i) => (
                  <ScrollReveal key={p._id} delay={i * 0.05}>
                    <Link
                      href={withLocale(locale, `/projects/${p.slug}`)}
                      className="group/proj bg-card-50 text-card-ink block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      <div className="bg-grid-forest bg-card-100 relative aspect-[16/9] overflow-hidden">
                        {p.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={urlFor(p.heroImage).width(800).url()}
                            alt={localized(p.title_en, p.title_th)}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/proj:scale-105"
                          />
                        ) : (
                          <div className="text-forest-900/40 flex h-full w-full items-center justify-center">
                            <IconSolarPanel size={56} stroke={1.25} />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3
                          className="font-medium tracking-tight"
                          style={{ fontSize: 22, lineHeight: 1.2 }}
                        >
                          {localized(p.title_en, p.title_th)}
                        </h3>
                        {p.customer ? (
                          <p className="text-body text-forest-900/65 mt-1">
                            {p.customer}
                          </p>
                        ) : null}
                        <div className="border-forest-900/10 text-caption text-forest-900/70 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 font-mono tracking-wider uppercase">
                          {p.sector ? (
                            <span className="inline-flex items-center gap-1.5">
                              <IconMapPin size={12} stroke={1.75} />
                              {p.sector}
                            </span>
                          ) : null}
                          {p.capacity ? (
                            <span className="inline-flex items-center gap-1.5">
                              <IconBolt size={12} stroke={1.75} />
                              {p.capacity}
                            </span>
                          ) : null}
                          {p.year ? <span>· {p.year}</span> : null}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 8 · Upcoming training ───────────────────────────────── */}
        {trainingSessions.length > 0 ? (
          <section className="bg-forest-900 relative overflow-hidden">
            <SectionGlow />
            <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <ScrollReveal>
                    <MonoLabel tone="gold">
                      {locale === "th"
                        ? "อบรมที่กำลังจะมาถึง"
                        : "Upcoming training"}
                    </MonoLabel>
                  </ScrollReveal>
                  <SplitTextReveal
                    as="h2"
                    className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  >
                    <span className="block" style={headlineClamp}>
                      {locale === "th"
                        ? "เรียนรู้กับช่างผู้ติดตั้งและพันธมิตรของเรา"
                        : "Train with our installers & partners."}
                    </span>
                  </SplitTextReveal>
                </div>
                <ScrollReveal delay={0.1}>
                  <Link
                    href={withLocale(locale, "/training")}
                    className="group/btn text-body inline-flex items-center gap-1.5 rounded-full border border-mist-400/30 px-4 py-2 font-medium text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5"
                  >
                    {locale === "th" ? "ดูตารางทั้งหมด" : "View full calendar"}
                    <IconArrowRight
                      size={16}
                      stroke={2}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                    />
                  </Link>
                </ScrollReveal>
              </div>

              {/* Real session photography, cropped from the company's own
                  event coverage: place → gear → hands, wide to close. The
                  calendar below says "upcoming"; these prove "recurring".
                  On mobile only the lead photo shows — three stacked photos
                  would push the actual calendar below the fold. */}
              <ScrollReveal>
                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      src: "/training/training-classroom.jpg",
                      alt:
                        locale === "th"
                          ? "การอบรมในห้องเรียน: วิทยากรอธิบายประเภทอินเวอร์เตอร์"
                          : "Classroom session: instructor presenting inverter types",
                      mobile: true,
                    },
                    {
                      src: "/training/training-equipment-wall.jpg",
                      alt:
                        locale === "th"
                          ? "ผู้เข้าอบรมศึกษาผนังสาธิตไมโครอินเวอร์เตอร์"
                          : "Attendees at the micro-inverter demonstration wall",
                      mobile: false,
                    },
                    {
                      src: "/training/training-hands-on.jpg",
                      alt:
                        locale === "th"
                          ? "ฝึกปฏิบัติจริงกับสายและขั้วต่อ MC4"
                          : "Hands-on practice with MC4 connectors",
                      mobile: false,
                    },
                  ].map((photo) => (
                    <div
                      key={photo.src}
                      className={`overflow-hidden rounded-xl border border-mist-800/60 ${
                        photo.mobile ? "" : "hidden sm:block"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {trainingSessions.map((s, i) => (
                  <ScrollReveal key={s._id} delay={i * 0.05}>
                    <TrainingCard
                      session={s}
                      locale={locale}
                      href={withLocale(locale, "/training")}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 9 · Certified installer finder ──────────────────────── */}
        {installerProvinces.length > 0 ? (
          <section className="bg-forest-900">
            <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
              <ScrollReveal>
                <div className="bg-card-50 text-card-ink rounded-2xl p-10 md:p-14">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-7">
                      <MonoLabel tone="forest">
                        {locale === "th"
                          ? "เครือข่ายผู้ติดตั้งของเรา"
                          : "Certified installer directory"}
                      </MonoLabel>
                      <h2
                        className="mt-3 font-medium tracking-tight"
                        style={headlineClamp}
                      >
                        {locale === "th"
                          ? "ค้นหาช่างติดตั้งโซลาร์ที่ใกล้คุณ"
                          : "Find a certified installer near you."}
                      </h2>
                      <p className="text-body-lg text-forest-900/70 mt-4 max-w-xl">
                        {locale === "th"
                          ? "ช่างติดตั้งที่ผ่านการฝึกอบรมและรับรองโดย WS Energy พร้อมให้บริการติดตั้งโซลาร์ ระบบกักเก็บพลังงาน และสถานีชาร์จรถยนต์ไฟฟ้าตามมาตรฐานความปลอดภัย"
                          : "WS Energy–trained partners delivering safety-grade solar, storage, and EV charging across Thailand."}
                      </p>
                    </div>
                    <form
                      action={withLocale(locale, "/installers")}
                      method="GET"
                      className="md:col-span-5"
                    >
                      <label
                        htmlFor="home-installer-province"
                        className="text-caption text-forest-900/55 font-mono tracking-wider uppercase"
                      >
                        {locale === "th" ? "เลือกจังหวัด" : "Choose a province"}
                      </label>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <select
                          id="home-installer-province"
                          name="province"
                          defaultValue=""
                          className="border-forest-900/20 bg-card-50 text-body text-forest-900 hover:border-forest-900/40 focus:ring-gold-500/40 flex-1 rounded-full border px-4 py-3 font-medium focus:ring-2 focus:outline-none"
                        >
                          <option value="">
                            {locale === "th" ? "ทุกจังหวัด" : "All provinces"}
                          </option>
                          {installerProvinces.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="bg-forest-900 text-body hover:bg-forest-800 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-mist-50 transition-colors"
                        >
                          {locale === "th" ? "ค้นหา" : "Find installers"}
                          <IconArrowRight size={16} stroke={2} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        ) : null}

        {/* ── 10 · Latest articles ────────────────────────────────── */}
        {/* Renders only when articles exist — a homepage must never show
            its own empty state. */}
        {/* forest-950 keeps the tail alternating once articles exist: the
            testimonials band that used to sit here carried that step. */}
        {articles.length > 0 ? (
          <section className="bg-forest-950">
            <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <ScrollReveal>
                    <MonoLabel tone="mist">
                      {locale === "th" ? "บทความใหม่ล่าสุด" : "Insights"}
                    </MonoLabel>
                  </ScrollReveal>
                  <SplitTextReveal
                    as="h2"
                    className="mt-3 font-medium tracking-tight text-mist-50"
                  >
                    <span className="block" style={headlineClamp}>
                      {t.resources.heading}
                    </span>
                  </SplitTextReveal>
                </div>
                <ScrollReveal delay={0.1}>
                  <Link
                    href={withLocale(locale, "/resources")}
                    className="group/btn text-body text-gold-500 hover:text-gold-400 inline-flex items-center gap-1.5 font-medium"
                  >
                    {dict.actions.viewAll}
                    <IconArrowUpRight
                      size={16}
                      stroke={2}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </Link>
                </ScrollReveal>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {articles.slice(0, 3).map((a, i) => (
                  <ScrollReveal key={a._id} delay={i * 0.05}>
                    <Link
                      href={withLocale(locale, `/resources/articles/${a.slug}`)}
                      className="group/art bg-forest-800/40 flex h-full flex-col overflow-hidden rounded-2xl border border-mist-800/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-mist-800"
                    >
                      <div className="bg-grid-mist bg-forest-800 aspect-[16/9]">
                        {a.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={urlFor(a.heroImage).width(640).url()}
                            alt={localized(a.title_en, a.title_th)}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/art:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <p className="text-caption font-mono tracking-wider text-mist-400 uppercase">
                          {t.resources.articlesCta}
                        </p>
                        <h3
                          className="font-medium tracking-tight text-mist-50"
                          style={{ fontSize: 20, lineHeight: 1.3 }}
                        >
                          {localized(a.title_en, a.title_th)}
                        </h3>
                        <p className="text-body line-clamp-3 text-mist-400">
                          {localized(a.excerpt_en, a.excerpt_th)}
                        </p>
                        <span className="text-body text-gold-500 mt-auto inline-flex items-center gap-1.5 font-medium">
                          {locale === "th" ? "อ่านบทความ" : "Read article"}
                          <IconArrowUpRight size={14} stroke={2} />
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 11 · Closing CTA ────────────────────────────────────── */}
        {/* Photographic bookend: the page opens over a rooftop and closes
            over a solar field at the same hour. The scrim holds the section
            at forest-950 top and bottom so the seams stay clean, and keeps
            copy and buttons at full contrast over the image. */}
        <section className="bg-forest-950 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/solutions/solar-farm-hero.jpg"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-45"
            />
            <div className="from-forest-950 via-forest-950/45 to-forest-950 absolute inset-0 bg-gradient-to-b" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
            <div className="flex flex-col items-center text-center">
              <ScrollReveal>
                <MonoLabel tone="gold">
                  {locale === "th" ? "ขอใบเสนอราคา" : "Get a quote"}
                </MonoLabel>
              </ScrollReveal>
              <SplitTextReveal
                as="h2"
                className="mt-4 max-w-3xl font-medium tracking-tight text-mist-50"
              >
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(32px, 5vw, 56px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.closing.headline}
                </span>
              </SplitTextReveal>
              <ScrollReveal delay={0.15}>
                <p className="text-body-lg mt-5 max-w-xl text-mist-400">
                  {t.closing.body}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Magnetic>
                    <Button variant="primary" size="lg" href={quoteHref}>
                      {dict.actions.requestQuote}
                      <IconArrowRight size={16} stroke={2} />
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.22}>
                    <Button
                      variant="secondary"
                      size="lg"
                      href={withLocale(locale, "/contact")}
                    >
                      {locale === "th"
                        ? "พูดคุยกับวิศวกร"
                        : "Talk to an engineer"}
                      <IconArrowUpRight size={16} stroke={2} />
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.22}>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      href={withLocale(locale, "/installers")}
                    >
                      {locale === "th"
                        ? "เข้าร่วมเครือข่ายช่างติดตั้ง"
                        : "Become an installer"}
                      <IconArrowUpRight size={16} stroke={2} />
                    </Button>
                  </Magnetic>
                </div>
              </ScrollReveal>
              {/* A single lone cert chip reads weaker than none — show the
                  strip only once Sanity holds 2+ named certifications. */}
              {certifications.filter((c) => c.name).length >= 2 ? (
                <ScrollReveal delay={0.35}>
                  <div className="text-caption mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono tracking-wider text-mist-400 uppercase">
                    {certifications.map((c) => (
                      <span
                        key={c._id}
                        className="inline-flex items-center gap-1.5"
                      >
                        <IconCertificate size={14} stroke={1.5} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function TrainingCard({
  session,
  locale,
  href,
}: {
  session: TrainingSessionRow;
  locale: "en" | "th";
  href: string;
}) {
  const title =
    locale === "th"
      ? (session.title_th ?? session.title_en)
      : (session.title_en ?? session.title_th ?? "");
  const dateLabel = formatTrainingDateRange(
    session.startDate,
    session.endDate,
    locale,
  );
  const formatLabel = formatTrainingFormat(session.format, locale);
  const isFull = session.seatsRemaining === 0;

  return (
    <Link
      href={href}
      className="group/train bg-card-50 text-card-ink flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span className="text-caption text-forest-900/55 font-mono tracking-wider uppercase">
        {dateLabel}
      </span>
      <h3
        className="mt-3 font-medium tracking-tight"
        style={{ fontSize: 20, lineHeight: 1.3 }}
      >
        {title}
      </h3>
      {session.host ? (
        <p className="text-body text-forest-900/65 mt-1">{session.host}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        <span
          className={`text-caption inline-flex items-center rounded-full px-2.5 py-1 font-mono tracking-wider uppercase ${
            session.format === "in-person"
              ? "bg-forest-900 text-mist-50"
              : session.format === "online"
                ? "bg-gold-500/15 text-forest-900"
                : "border-forest-900/25 text-forest-900 border"
          }`}
        >
          {formatLabel}
        </span>
        {session.province ? (
          <span className="text-caption text-forest-900/65 inline-flex items-center gap-1">
            <IconMapPin size={12} stroke={1.75} />
            {session.province}
          </span>
        ) : null}
        {isFull ? (
          <span className="bg-forest-900/10 text-caption text-forest-900/55 inline-flex items-center rounded-full px-2.5 py-1 font-mono tracking-wider uppercase">
            {locale === "th" ? "เต็ม" : "Full"}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function formatTrainingDateRange(
  start: string,
  end: string,
  locale: "en" | "th",
): string {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const intlLocale = locale === "th" ? "th-TH" : "en-GB";
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale, opts).format(d);
  if (start === end) {
    return fmt(s, { day: "numeric", month: "short", year: "numeric" });
  }
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${fmt(s, { day: "numeric" })}–${fmt(e, { day: "numeric", month: "short", year: "numeric" })}`;
  }
  return `${fmt(s, { day: "numeric", month: "short" })} – ${fmt(e, { day: "numeric", month: "short", year: "numeric" })}`;
}

function formatTrainingFormat(
  format: TrainingFormat,
  locale: "en" | "th",
): string {
  if (locale === "th") {
    return format === "in-person"
      ? "ในสถานที่"
      : format === "online"
        ? "ออนไลน์"
        : "ผสมผสาน";
  }
  return format === "in-person"
    ? "In person"
    : format === "online"
      ? "Online"
      : "Hybrid";
}

function WhyTile({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-forest-800/40 rounded-xl border border-mist-800/60 p-6">
      <div className="bg-gold-500/15 text-gold-500 flex h-10 w-10 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="text-h3 mt-5 font-medium tracking-tight text-mist-50">
        {title}
      </h3>
      <p className="text-body mt-2 text-mist-400">{desc}</p>
    </div>
  );
}
