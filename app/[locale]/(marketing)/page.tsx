import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconCertificate,
  IconMapPin,
  IconPlus,
  IconSchool,
  IconShieldCheckered,
  IconSolarPanel,
  IconTools,
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
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { StatBlock } from "@/components/ui/StatBlock";
import { GsapBridge } from "@/components/marketing/GsapBridge";
import { HeroAct } from "@/components/marketing/HeroAct";
import { ProductSchematic } from "@/components/product/ProductSchematic";
import { SafetyAct } from "@/components/marketing/SafetyAct";
import {
  SolutionsTabs,
  type SolutionTab,
} from "@/components/marketing/SolutionsTabs";
import { TestimonialsMarquee } from "@/components/marketing/TestimonialsMarquee";

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

  const FLAGSHIP_PLACEHOLDER = "/products/projoy-rapid-shutdown.png";
  const flagships: {
    key: string;
    title: string;
    brandPill?: "PROJOY" | "T-SUN";
    photoUrl?: string;
    href: string;
  }[] = [
    {
      key: "rapid-shutdown",
      title: "Rapid Shutdown",
      brandPill: "PROJOY",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/safety/rapid-shutdown"),
    },
    {
      key: "controller-box",
      title: "Controller Box",
      brandPill: "PROJOY",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/safety/rapid-shutdown"),
    },
    {
      key: "firefighter-safety-switches",
      title: "Firefighter Safety Switches",
      brandPill: "PROJOY",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/safety/firefighter-safety-switches"),
    },
    {
      key: "micro-inverter",
      title: "Micro Inverter",
      brandPill: "T-SUN",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/products/micro-inverters"),
    },
    {
      key: "scada-monitoring",
      title: "SCADA & Monitoring",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/solutions/scada-monitoring"),
    },
    {
      key: "full-catalog",
      title: "Full catalog",
      photoUrl: FLAGSHIP_PLACEHOLDER,
      href: withLocale(locale, "/products"),
    },
  ];

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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-24 hidden w-[560px] -translate-y-1/2 lg:block"
          >
            <ProductSchematic variant="switch" dim />
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
              <div className="mt-12 max-w-md border-t border-mist-800 pt-6">
                <p className="text-caption font-mono tracking-wider text-mist-200 uppercase">
                  {locale === "th" ? "ทีมงาน WS Energy" : "The WS Energy team"}
                </p>
                <p className="text-caption mt-1 text-mist-500">
                  {locale === "th"
                    ? "สมุทรปราการ ประเทศไทย"
                    : "Samut Prakan, Thailand"}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 2 · Business partners (editorial logo grid) ─────────── */}
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
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
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
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
          </div>
        </section>

        {/* ── 5 · Why WS Energy · counted proof ───────────────────── */}
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="mb-10 max-w-3xl">
              <ScrollReveal>
                <MonoLabel tone="gold">
                  {locale === "th"
                    ? "ความแตกต่างของ WS ENERGY"
                    : "The WS Energy difference"}
                </MonoLabel>
              </ScrollReveal>
              <SplitTextReveal
                as="h2"
                className="mt-3 font-medium tracking-tight text-mist-50"
              >
                <span className="block" style={headlineClamp}>
                  {locale === "th"
                    ? "ทำไมต้อง WS Energy"
                    : "Why choose WS Energy."}
                </span>
              </SplitTextReveal>
            </div>

            <ScrollReveal delay={0.05}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatBlock
                  value={<CountUp to={500} suffix="MW+" />}
                  label={
                    locale === "th"
                      ? "พลังงานสะอาดที่ส่งมอบ"
                      : "Clean energy delivered"
                  }
                  icon={<IconBolt size={28} stroke={1.5} />}
                />
                <StatBlock
                  value={<CountUp to={15} suffix="+ yrs" />}
                  label={
                    locale === "th"
                      ? "ประสบการณ์ในวงการ"
                      : "Industry experience"
                  }
                  icon={<IconCertificate size={28} stroke={1.5} />}
                />
                <StatBlock
                  value={<CountUp to={1200} suffix="+" />}
                  label={
                    locale === "th"
                      ? "ระบบที่ติดตั้งแล้ว"
                      : "Systems installed to date"
                  }
                  icon={<IconSolarPanel size={28} stroke={1.5} />}
                />
                <StatBlock
                  value="TH"
                  label={
                    locale === "th"
                      ? "ทีมงานท้องถิ่นจากสมุทรปราการ"
                      : "Local team from Samut Prakan"
                  }
                  icon={<IconMapPin size={28} stroke={1.5} />}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15} className="mt-5">
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

        {/* ── 6 · Solutions tabs ──────────────────────────────────── */}
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
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
          <section className="bg-forest-950">
            <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
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
          <section className="bg-forest-900">
            <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
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

        {/* ── 10 · Testimonials ───────────────────────────────────── */}
        <TestimonialsMarquee locale={locale} />

        {/* ── 11 · Latest articles ────────────────────────────────── */}
        <section className="bg-forest-900">
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

            {articles.length > 0 ? (
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
            ) : (
              <div className="bg-forest-800/40 rounded-xl border border-mist-800/60 p-8 text-mist-400">
                {t.resources.empty}
              </div>
            )}
          </div>
        </section>

        {/* ── 12 · Closing CTA ────────────────────────────────────── */}
        <section className="bg-forest-950 relative overflow-hidden">
          <div className="bg-grid-mist pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)] opacity-30" />
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
              {certifications.length > 0 ? (
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
