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
  featuredProductsQuery,
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
import { productHref } from "@/lib/product-url";
import { SITE_URL } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StatBlock } from "@/components/ui/StatBlock";
import { Hero } from "@/components/marketing/Hero";
import { SolutionsTabs, type SolutionTab } from "@/components/marketing/SolutionsTabs";
import { TestimonialsMarquee } from "@/components/marketing/TestimonialsMarquee";

type FeaturedProduct = {
  _id: string;
  title?: string;
  sku?: string;
  slug?: string;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  shortDescription_en?: string;
  shortDescription_th?: string;
  image?: Parameters<typeof urlFor>[0];
  brand?: { name?: string; slug?: string };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

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
  { name: "Godung Faifaa", slug: "godung-faifaa", logoSrc: "/partners/godung-faifaa.png" },
  { name: "Gunkul", slug: "gunkul", logoSrc: "/partners/gunkul.png" },
  { name: "SolaX Power", slug: "solax", logoSrc: "/partners/solax.png" },
  { name: "Prime Road Power", slug: "prime-road", logoSrc: "/partners/prime-road.png" },
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
    openGraph: { title: dict.home.hero.headline, description: dict.home.hero.subhead },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.home;

  const [
    featuredProducts,
    projects,
    articles,
    certifications,
    trainingSessions,
    installerProvinces,
  ] = await Promise.all([
    sanityClient.fetch<FeaturedProduct[]>(featuredProductsQuery),
    sanityClient.fetch<ProjectRow[]>(featuredProjectsQuery),
    sanityClient.fetch<ArticleRow[]>(latestArticlesQuery),
    sanityClient.fetch<CertificationRow[]>(homepageCertificationsQuery),
    getNextUpcomingTrainingSessions(),
    getInstallerProvinces(),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");
  const featured = featuredProducts[0];

  const solutionTabs: SolutionTab[] = [
    {
      key: "residential",
      label: locale === "th" ? "ที่อยู่อาศัย" : "Residential",
      title: t.solutions.residential,
      body: t.solutions.residentialDesc,
      bullets: [
        locale === "th" ? "ออกแบบตามรูปทรงหลังคา" : "Designed around your roof",
        locale === "th" ? "ระบบ Rapid Shutdown ในตัว" : "Rapid Shutdown built-in",
        locale === "th" ? "ติดตั้ง 4–8 สัปดาห์" : "Installed in 4–8 weeks",
      ],
      href: withLocale(locale, "/solutions/residential"),
      ctaLabel: locale === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more",
    },
    {
      key: "ci",
      label: locale === "th" ? "พาณิชย์และอุตสาหกรรม" : "Commercial & Industrial",
      title: t.solutions.ci,
      body: t.solutions.ciDesc,
      bullets: [
        locale === "th" ? "ROI 3–5 ปี" : "Typical 3–5 year ROI",
        locale === "th" ? "ตรวจสอบทางวิศวกรรมเต็มรูปแบบ" : "Full engineering review",
        locale === "th" ? "การปฏิบัติตามมาตรฐานความปลอดภัย" : "Compliance with TIS / IEC",
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
        locale === "th" ? "ตั้งแต่ MW เดียวถึงระดับยูทิลิตี้" : "Single MW to utility-scale",
        locale === "th" ? "การบูรณาการ SCADA" : "SCADA integration",
        locale === "th" ? "การจัดการโครงการแบบครบวงจร" : "End-to-end project delivery",
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
        locale === "th" ? "ตรวจสอบประสิทธิภาพแบบเรียลไทม์" : "Real-time performance monitoring",
        locale === "th" ? "การแจ้งเตือนความผิดพลาด" : "Fault alerting & diagnostics",
        locale === "th" ? "การรายงานแก่ผู้มีส่วนได้เสีย" : "Stakeholder-grade reporting",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── 1 · Cinematic hero ──────────────────────────────────── */}
      <Hero
        eyebrow={
          locale === "th"
            ? "โซลาร์ · พลังงานสำรอง · อีวี"
            : "Solar · Storage · EV"
        }
        headlineLines={
          locale === "th"
            ? ["เร่งการเปลี่ยนผ่าน", "สู่พลังงานสะอาดของไทย"]
            : ["Powering Thailand's", "transition to clean energy."]
        }
        subhead={
          locale === "th"
            ? "WS Energy คือผู้แทนจำหน่ายอย่างเป็นทางการของ Projoy และพันธมิตรครบวงจรของคุณสำหรับการผลิตไฟฟ้าจากแสงอาทิตย์ ระบบกักเก็บพลังงาน และยานยนต์ไฟฟ้า — ส่งมอบโดยทีมงานในประเทศจากสมุทรปราการ"
            : "WS Energy is Thailand's authorized Projoy distributor and your full-line partner for solar generation, storage, and EV — delivered by an in-country team out of Samut Prakan."
        }
        primaryCta={{
          label: dict.actions.requestQuote,
          href: quoteHref,
        }}
        secondaryCta={{
          label: locale === "th" ? "ดูโซลูชัน" : "Explore solutions",
          href: withLocale(locale, "/solutions/commercial-industrial"),
        }}
      />

      {/* ── 2 · Business partners (editorial logo grid) ─────────── */}
      <section className="bg-forest-950">
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
                  <span className="text-gold-500">อุตสาหกรรมพลังงานสะอาด</span>
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
                // 4×2 internal intersections: bottom-right of cells in
                // cols 0–2 of row 0 → 3 markers (indices 0,1,2).
                const showPlus = col < 3 && row < 1;
                // Column-banded rhythm — 8 cells in 4 cols means each column
                // alternates 900/950 down the rows; pleasant editorial stripe.
                const raised = i % 2 === 0;
                return (
                  <li
                    key={partner.slug}
                    className={`relative flex h-32 items-center justify-center px-6 md:h-40 md:px-8 lg:h-48 lg:px-10 ${
                      raised ? "bg-forest-900" : "bg-forest-950"
                    }`}
                  >
                    {partner.logoSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={partner.logoSrc}
                        alt={partner.name}
                        className="max-h-14 w-auto select-none object-contain opacity-90 brightness-0 invert md:max-h-16 lg:max-h-20"
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

          {/* "+more partners" — text-only tertiary CTA, right-aligned beneath
              the grid. Anchors the bottom-right of the section and implies
              the partner network extends beyond the visible eight. */}
          <ScrollReveal delay={0.2} className="mt-6 flex justify-end md:mt-8">
            <Link
              href={withLocale(locale, "/about")}
              className="group/more inline-flex items-center gap-2 text-body font-medium text-gold-500 transition-colors hover:text-gold-400"
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

      {/* ── 3 · Featured product (warm-bone card, big) ─────────── */}
      {featured ? (
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <ScrollReveal className="mb-10 flex items-end justify-between gap-6">
              <div>
                <MonoLabel tone="gold">
                  {locale === "th" ? "ผลิตภัณฑ์เด่น" : "Featured product"}
                </MonoLabel>
                <h2
                  className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {locale === "th"
                    ? "ระบบโซลาร์ที่ปลอดภัยทุกการติดตั้ง"
                    : "Safer solar, every install."}
                </h2>
              </div>
              <Link
                href={withLocale(locale, "/products")}
                className="group/btn hidden items-center gap-1.5 text-body font-medium text-gold-500 hover:text-gold-400 md:inline-flex"
              >
                {dict.actions.viewAll}
                <IconArrowUpRight
                  size={16}
                  stroke={2}
                  className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                />
              </Link>
            </ScrollReveal>

            <ScrollReveal className="overflow-hidden rounded-2xl bg-card-50 text-card-ink" delay={0.05}>
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="flex flex-col justify-between gap-8 p-8 md:p-12 lg:col-span-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {featured.exclusive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1 text-caption font-medium text-gold-500">
                          ★ {dict.common.exclusiveBadge}
                        </span>
                      ) : null}
                      {featured.authorized ? (
                        <span className="text-caption inline-flex items-center gap-1.5 rounded-full bg-forest-900/10 px-3 py-1 font-medium text-forest-900">
                          ★ {dict.common.authorizedBadge}
                        </span>
                      ) : null}
                    </div>
                    <h3
                      className="mt-5 font-medium tracking-tight"
                      style={{ fontSize: 36, lineHeight: 1.1 }}
                    >
                      {featured.title}
                    </h3>
                    {featured.sku ? (
                      <p className="mt-2 text-caption font-mono uppercase tracking-wider text-forest-900/60">
                        {featured.sku}
                      </p>
                    ) : null}
                    <p className="text-body-lg mt-5 max-w-md text-forest-900/75">
                      {localized(
                        featured.shortDescription_en,
                        featured.shortDescription_th,
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="on-card"
                      size="md"
                      href={productHref(locale, {
                        categorySlug: featured.category?.slug,
                        parentSlug: featured.category?.parentSlug,
                        brandSlug: featured.brand?.slug,
                        productSlug: featured.slug,
                      })}
                    >
                      {dict.actions.viewSpecs}
                      <IconArrowRight size={14} stroke={2} />
                    </Button>
                    <Link
                      href={quoteHref}
                      className="text-body group/btn inline-flex items-center gap-1.5 font-medium text-forest-900 hover:text-forest-700"
                    >
                      {dict.actions.requestQuote}
                      <IconArrowUpRight
                        size={14}
                        stroke={2}
                        className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      />
                    </Link>
                  </div>
                </div>

                {/* Product visual panel — uses Sanity image when present */}
                <div className="relative bg-card-100 lg:col-span-6">
                  <div className="bg-grid-forest absolute inset-0 opacity-60" />
                  <div className="relative flex aspect-[5/4] items-center justify-center p-10 lg:aspect-auto lg:h-full">
                    {featured.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(featured.image).width(720).url()}
                        alt={featured.title ?? ""}
                        className="max-h-[320px] w-auto object-contain"
                      />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center rounded-full bg-forest-900 text-gold-500">
                        <IconShieldCheckered size={72} stroke={1.25} />
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption font-mono uppercase tracking-wider text-forest-900/70">
                      <span>· Rapid Shutdown</span>
                      <span>· IEC 60947-3</span>
                      <span>· IP66</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* ── 4 · Solutions tabs ──────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="mb-10 max-w-3xl">
            <MonoLabel tone="mist">
              {locale === "th" ? "โซลูชันของเรา" : "Our solutions"}
            </MonoLabel>
            <h2
              className="mt-3 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
              }}
            >
              {locale === "th"
                ? "โซลาร์สำหรับทุกขนาดโครงการ"
                : "Solar solutions for every scale."}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <SolutionsTabs tabs={solutionTabs} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5 · Recent projects ─────────────────────────────────── */}
      {projects.length > 0 ? (
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <MonoLabel tone="mist">
                  {locale === "th" ? "โครงการล่าสุด" : "Recent projects"}
                </MonoLabel>
                <h2
                  className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {t.projects.heading}
                </h2>
              </div>
              <Link
                href={withLocale(locale, "/projects")}
                className="group/btn inline-flex items-center gap-1.5 rounded-full border border-mist-400/30 px-4 py-2 text-body font-medium text-mist-50 hover:bg-mist-50/5 hover:border-mist-400/60"
              >
                {t.projects.cta}
                <IconArrowRight
                  size={16}
                  stroke={2}
                  className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                />
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {projects.slice(0, 4).map((p, i) => (
                <ScrollReveal key={p._id} delay={i * 0.05}>
                  <Link
                    href={withLocale(locale, `/projects/${p.slug}`)}
                    className="group/proj block overflow-hidden rounded-2xl bg-card-50 text-card-ink transition-all duration-300 hover:-translate-y-0.5"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    {/* Image area */}
                    <div className="bg-grid-forest relative aspect-[16/9] overflow-hidden bg-card-100">
                      {p.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={urlFor(p.heroImage).width(800).url()}
                          alt={localized(p.title_en, p.title_th)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover/proj:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-forest-900/40">
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
                        <p className="text-body mt-1 text-forest-900/65">
                          {p.customer}
                        </p>
                      ) : null}
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-forest-900/10 pt-4 text-caption font-mono uppercase tracking-wider text-forest-900/70">
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
                        {p.year ? (
                          <span>· {p.year}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 6 · Why WS Energy ───────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="mb-10 max-w-3xl">
            <MonoLabel tone="gold">
              {locale === "th" ? "ความแตกต่างของ WS Energy" : "The WS Energy difference"}
            </MonoLabel>
            <h2
              className="mt-3 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
              }}
            >
              {locale === "th" ? "ทำไมต้อง WS Energy" : "Why choose WS Energy."}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatBlock
                value="500MW+"
                label={
                  locale === "th"
                    ? "พลังงานสะอาดที่ส่งมอบ"
                    : "Clean energy delivered"
                }
                icon={<IconBolt size={28} stroke={1.5} />}
              />
              <StatBlock
                value="15+ yrs"
                label={
                  locale === "th"
                    ? "ประสบการณ์ในวงการ"
                    : "Industry experience"
                }
                icon={<IconCertificate size={28} stroke={1.5} />}
              />
              <StatBlock
                value="1,200+"
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

      {/* ── 6.5 · Upcoming training ─────────────────────────────── */}
      {trainingSessions.length > 0 ? (
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <MonoLabel tone="gold">
                  {locale === "th" ? "อบรมที่กำลังจะมาถึง" : "Upcoming training"}
                </MonoLabel>
                <h2
                  className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {locale === "th"
                    ? "เรียนรู้กับช่างผู้ติดตั้งและพันธมิตรของเรา"
                    : "Train with our installers & partners."}
                </h2>
              </div>
              <Link
                href={withLocale(locale, "/training")}
                className="group/btn inline-flex items-center gap-1.5 rounded-full border border-mist-400/30 px-4 py-2 text-body font-medium text-mist-50 hover:bg-mist-50/5 hover:border-mist-400/60"
              >
                {locale === "th" ? "ดูตารางทั้งหมด" : "View full calendar"}
                <IconArrowRight
                  size={16}
                  stroke={2}
                  className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                />
              </Link>
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

      {/* ── 6.7 · Certified installer finder ─────────────────────── */}
      {installerProvinces.length > 0 ? (
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <ScrollReveal>
              <div className="rounded-2xl bg-card-50 p-10 text-card-ink md:p-14">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
                  <div className="md:col-span-7">
                    <MonoLabel tone="forest">
                      {locale === "th"
                        ? "เครือข่ายผู้ติดตั้งของเรา"
                        : "Certified installer directory"}
                    </MonoLabel>
                    <h2
                      className="mt-3 font-medium tracking-tight"
                      style={{
                        fontSize: "clamp(28px, 4vw, 44px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {locale === "th"
                        ? "ค้นหาช่างติดตั้งโซลาร์ที่ใกล้คุณ"
                        : "Find a certified installer near you."}
                    </h2>
                    <p className="text-body-lg mt-4 max-w-xl text-forest-900/70">
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
                      className="text-caption font-mono uppercase tracking-wider text-forest-900/55"
                    >
                      {locale === "th" ? "เลือกจังหวัด" : "Choose a province"}
                    </label>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <select
                        id="home-installer-province"
                        name="province"
                        defaultValue=""
                        className="flex-1 rounded-full border border-forest-900/20 bg-card-50 px-4 py-3 text-body font-medium text-forest-900 hover:border-forest-900/40 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
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
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-body font-medium text-mist-50 transition-colors hover:bg-forest-800"
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

      {/* ── 7 · Testimonials ────────────────────────────────────── */}
      <TestimonialsMarquee locale={locale} />

      {/* ── 8 · Latest articles ─────────────────────────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <MonoLabel tone="mist">
                {locale === "th" ? "บทความใหม่ล่าสุด" : "Insights"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                }}
              >
                {t.resources.heading}
              </h2>
            </div>
            <Link
              href={withLocale(locale, "/resources")}
              className="group/btn inline-flex items-center gap-1.5 text-body font-medium text-gold-500 hover:text-gold-400"
            >
              {dict.actions.viewAll}
              <IconArrowUpRight
                size={16}
                stroke={2}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </Link>
          </ScrollReveal>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {articles.slice(0, 3).map((a, i) => (
                <ScrollReveal key={a._id} delay={i * 0.05}>
                  <Link
                    href={withLocale(locale, `/resources/articles/${a.slug}`)}
                    className="group/art flex h-full flex-col overflow-hidden rounded-2xl border border-mist-800/60 bg-forest-800/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-mist-800"
                  >
                    <div className="bg-grid-mist aspect-[16/9] bg-forest-800">
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
                      <p className="text-caption font-mono uppercase tracking-wider text-mist-400">
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
                      <span className="mt-auto inline-flex items-center gap-1.5 text-body font-medium text-gold-500">
                        {locale === "th" ? "อ่านบทความ" : "Read article"}
                        <IconArrowUpRight size={14} stroke={2} />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-mist-800/60 bg-forest-800/40 p-8 text-mist-400">
              {t.resources.empty}
            </div>
          )}
        </div>
      </section>

      {/* ── 9 · Closing CTA band ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-950">
        <div className="bg-grid-mist pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
          <ScrollReveal className="flex flex-col items-center text-center">
            <MonoLabel tone="gold">
              {locale === "th" ? "ขอใบเสนอราคา" : "Get a quote"}
            </MonoLabel>
            <h2
              className="mt-4 max-w-3xl font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {t.closing.headline}
            </h2>
            <p className="text-body-lg mt-5 max-w-xl text-mist-400">
              {t.closing.body}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href={quoteHref}>
                {dict.actions.requestQuote}
                <IconArrowRight size={16} stroke={2} />
              </Button>
              <Link
                href={withLocale(locale, "/contact")}
                className="text-body group/btn inline-flex items-center gap-2 rounded-full border border-mist-400/30 px-[26px] py-[14px] font-medium text-mist-50 transition-colors hover:bg-mist-50/5 hover:border-mist-400/60"
              >
                {locale === "th" ? "พูดคุยกับวิศวกร" : "Talk to an engineer"}
                <IconArrowUpRight size={16} stroke={2} />
              </Link>
            </div>
            {certifications.length > 0 ? (
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-caption font-mono uppercase tracking-wider text-mist-400">
                {certifications.map((c) => (
                  <span key={c._id} className="inline-flex items-center gap-1.5">
                    <IconCertificate size={14} stroke={1.5} />
                    {c.name}
                  </span>
                ))}
              </div>
            ) : null}
          </ScrollReveal>
        </div>
      </section>
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
      className="group/train flex h-full flex-col rounded-2xl bg-card-50 p-7 text-card-ink transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span className="text-caption font-mono uppercase tracking-wider text-forest-900/55">
        {dateLabel}
      </span>
      <h3
        className="mt-3 font-medium tracking-tight"
        style={{ fontSize: 20, lineHeight: 1.3 }}
      >
        {title}
      </h3>
      {session.host ? (
        <p className="mt-1 text-body text-forest-900/65">{session.host}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-mono uppercase tracking-wider ${
            session.format === "in-person"
              ? "bg-forest-900 text-mist-50"
              : session.format === "online"
                ? "bg-gold-500/15 text-forest-900"
                : "border border-forest-900/25 text-forest-900"
          }`}
        >
          {formatLabel}
        </span>
        {session.province ? (
          <span className="inline-flex items-center gap-1 text-caption text-forest-900/65">
            <IconMapPin size={12} stroke={1.75} />
            {session.province}
          </span>
        ) : null}
        {isFull ? (
          <span className="inline-flex items-center rounded-full bg-forest-900/10 px-2.5 py-1 text-caption font-mono uppercase tracking-wider text-forest-900/55">
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
    <div className="rounded-xl border border-mist-800/60 bg-forest-800/40 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
        {icon}
      </div>
      <h3 className="text-h3 mt-5 font-medium tracking-tight text-mist-50">
        {title}
      </h3>
      <p className="text-body mt-2 text-mist-400">{desc}</p>
    </div>
  );
}
