import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  productsByCategoriesQuery,
  projectsBySectorsQuery,
} from "@/lib/sanity/queries";
import {
  type SolutionProductRow,
  type SolutionProjectRow,
} from "@/components/solution/types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { CountUp } from "@/components/ui/CountUp";
import { Magnetic } from "@/components/ui/Magnetic";
import { GsapBridge } from "@/components/marketing/GsapBridge";
import { SolutionHero } from "@/components/solution/SolutionHero";
import { RapidShutdownDiagram } from "@/components/solution/RapidShutdownDiagram";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { withLocale } from "@/lib/navigation";
import { productHref } from "@/lib/product-url";
import { alternates } from "@/lib/seo";

/**
 * Commercial & Industrial Rooftop — bespoke, motion-driven solution flagship.
 * Cinematic hero → authority stat band → an INTERACTIVE rapid-shutdown one-line
 * diagram (the signature piece) → why-us → compliance documentation → live
 * Sanity products → real factory/warehouse references → RFQ. Built on the site's
 * GSAP/Lenis toolkit; fully bespoke (no shared page template).
 *
 * Drop a rooftop photo at /solutions/ci-hero.webp and set `heroImage` below to
 * light up the hero (a graded CSS backdrop carries it until then).
 */

const heroImage: string | null = "/solutions/ci-hero.jpg";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/commercial-industrial">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.solutions.commercialIndustrial;
  return {
    title: t.breadcrumb,
    description: t.subhead,
    alternates: alternates("/solutions/commercial-industrial"),
  };
}

export default async function CommercialIndustrialPage({
  params,
}: PageProps<"/[locale]/solutions/commercial-industrial">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.commercialIndustrial;

  const [products, projects] = await Promise.all([
    sanityClient.fetch<SolutionProductRow[]>(productsByCategoriesQuery, {
      categories: ["rapid-shutdown", "inverters", "battery-storage"],
    }),
    sanityClient.fetch<SolutionProjectRow[]>(projectsBySectorsQuery, {
      sectors: ["Factory", "Warehouse", "Commercial"],
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");
  const rapidShutdownHref = withLocale(locale, "/safety/rapid-shutdown");
  const projectsHref = withLocale(locale, "/projects");
  const productsHref = withLocale(locale, "/products");

  // Authority stats — voltages/timing are NEC 690.12 spec figures, brand count
  // is real; numbers live here (untranslatable), labels come from the dict.
  const stats: { to: number | null; display?: string; suffix: string }[] = [
    { to: null, display: "< 30", suffix: " V" },
    { to: 30, suffix: " s" },
    { to: 3, suffix: "" },
    { to: 25, suffix: " yr" },
  ];

  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className="text-caption text-mist-300 flex flex-wrap items-center gap-1">
        <li>
          <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
            {dict.productDetail.breadcrumbHome}
          </Link>
        </li>
        <IconChevronRight size={12} stroke={1.5} aria-hidden />
        <li>
          <Link
            href={withLocale(locale, "/solutions")}
            className="hover:text-gold-500"
          >
            {dict.nav.solutions}
          </Link>
        </li>
        <IconChevronRight size={12} stroke={1.5} aria-hidden />
        <li className="text-mist-50">{t.breadcrumb}</li>
      </ol>
    </nav>
  );

  return (
    <>
      <GsapBridge />

      {/* ── 1 · Cinematic hero ──────────────────────────────────── */}
      <SolutionHero
        eyebrow={t.eyebrow}
        headline={t.headline}
        subhead={t.subhead}
        chips={t.standards}
        chipsNote={t.standardsNote}
        primaryLabel={dict.actions.requestQuote}
        primaryHref={quoteHref}
        secondaryLabel={dict.actions.talkToEngineer}
        secondaryHref={quoteHref}
        imageSrc={heroImage}
        imageAlt={t.headline}
        breadcrumb={breadcrumb}
      />

      {/* ── 2 · Authority stat band ─────────────────────────────── */}
      <section className="bg-forest-900">
        <Container className="py-12 lg:py-16">
          <ul className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <ScrollReveal
                as="li"
                key={i}
                delay={Math.min(i * 0.08, 0.32)}
                className="border-mist-800 px-2 sm:border-l sm:px-8 sm:first:border-l-0 lg:px-10"
              >
                <p className="text-display text-gold-500 font-medium">
                  {s.to === null ? (
                    <span className="tabular-nums">
                      {s.display}
                      {s.suffix}
                    </span>
                  ) : (
                    <CountUp to={s.to} suffix={s.suffix} />
                  )}
                </p>
                <p className="text-body text-mist-400 mt-2 max-w-[22ch]">
                  {t.statLabels[i]}
                </p>
              </ScrollReveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── 3 · Signature interactive: rapid shutdown, live ─────── */}
      <RapidShutdownDiagram copy={t.diagram} />

      {/* ── 4 · Why EPCs spec WS Energy on C&I ──────────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 font-medium">
          {t.benefitsHeading}
        </SplitTextReveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {t.benefits.map((b, i) => (
            <ScrollReveal as="li" key={b.title} delay={Math.min(i * 0.06, 0.24)}>
              <div
                className="bg-card-50 text-card-ink h-full rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="bg-gold-500 h-0.5 w-8 rounded-full" />
                <h3 className="text-h4 mt-4 font-medium">{b.title}</h3>
                <p className="text-body text-card-ink/70 mt-2">{b.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </Container>

      {/* ── 5 · Compliance / documentation ──────────────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <MonoLabel tone="gold">{t.compliance.eyebrow}</MonoLabel>
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 mt-4 font-medium"
              >
                {t.compliance.heading}
              </SplitTextReveal>
              <p className="text-body-lg text-mist-400 mt-3 max-w-lg">
                {t.compliance.body}
              </p>
              <ul className="mt-6 grid gap-3">
                {t.compliance.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck
                      size={18}
                      stroke={2}
                      className="text-gold-500 mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span className="text-body text-mist-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Button variant="outline-primary" href={rapidShutdownHref}>
                  {dict.actions.exploreRapidShutdown}
                  <IconArrowRight
                    size={16}
                    stroke={1.5}
                    className="transition-transform group-hover/btn:translate-x-px"
                    aria-hidden
                  />
                </Button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div
                className="bg-card-50 relative flex items-center justify-center overflow-hidden rounded-xl p-10"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div
                  className="bg-grid-forest pointer-events-none absolute inset-0"
                  aria-hidden
                />
                <Image
                  src="/products/projoy-rapid-shutdown.png"
                  alt="Projoy rapid shutdown switch"
                  width={360}
                  height={280}
                  className="relative max-h-56 w-auto object-contain mix-blend-multiply"
                />
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 6 · Components we ship (live products) ───────────────── */}
      {products.length > 0 && (
        <Container as="section" className="bg-forest-900 py-16 lg:py-20">
          <SplitTextReveal as="h2" className="text-h2 text-mist-50 font-medium">
            {t.productsHeading}
          </SplitTextReveal>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <ScrollReveal as="li" key={p._id} delay={Math.min(i * 0.05, 0.25)}>
                <ProductCard
                  brand={p.brand}
                  authorized={p.authorized}
                  exclusive={p.exclusive}
                  safetyCritical={p.safetyCritical}
                  image={p.image}
                  sku={p.sku}
                  title={p.title}
                  description={localized(
                    p.shortDescription_en,
                    p.shortDescription_th,
                  )}
                  href={productHref(locale, {
                    categorySlug: p.category?.slug,
                    parentSlug: p.category?.parentSlug,
                    brandSlug: p.brand?.slug,
                    productSlug: p.slug,
                  })}
                  specsLabel={dict.actions.viewSpecs}
                  quoteLabel={dict.actions.requestQuote}
                  quoteHref={quoteHref}
                  authorizedLabel={dict.common.authorizedBadge}
                  exclusiveLabel={dict.common.exclusiveBadge}
                  safetyLabel={dict.common.safetyBadge}
                />
              </ScrollReveal>
            ))}
          </ul>
        </Container>
      )}

      {/* ── 7 · Factory / warehouse references ──────────────────── */}
      {projects.length > 0 && (
        <section className="border-mist-800 border-t bg-forest-950">
          <Container className="py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <ScrollReveal>
                <SplitTextReveal
                  as="h2"
                  className="text-h2 text-mist-50 font-medium"
                >
                  {t.projectsHeading}
                </SplitTextReveal>
                <p className="text-body text-mist-400 mt-2 max-w-xl">
                  {t.projectsSubhead}
                </p>
              </ScrollReveal>
              <Link
                href={projectsHref}
                className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-1 font-medium"
              >
                {dict.actions.viewAll}
                <IconArrowRight size={16} stroke={1.5} aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {projects.map((p) => (
                <CaseStudyCard
                  key={p._id}
                  customer={p.customer}
                  sector={p.sector}
                  capacity={p.capacity}
                  year={p.year}
                  title={localized(p.title_en, p.title_th)}
                  image={p.heroImage}
                  href={withLocale(locale, `/projects/${p.slug}`)}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── 8 · RFQ band ────────────────────────────────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <ScrollReveal>
          <div
            className="bg-card-50 text-card-ink flex flex-wrap items-center justify-between gap-8 rounded-xl p-8 lg:p-12"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="max-w-xl">
              <h2 className="text-h2 font-medium">{t.ctaHeading}</h2>
              <p className="text-body-lg text-card-ink/70 mt-2">{t.ctaBody}</p>
              <Link
                href={withLocale(locale, "/solar-calculator")}
                className="group/est text-gold-600 hover:text-gold-500 mt-4 inline-flex items-center gap-1.5 text-body font-medium transition-colors"
              >
                {locale === "th"
                  ? "ประเมินขนาดและการประหยัดเบื้องต้นก่อน"
                  : "Estimate your size & savings first"}
                <IconArrowRight
                  size={14}
                  stroke={2}
                  className="transition-transform group-hover/est:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Magnetic>
                <Button variant="on-card" size="lg" href={quoteHref}>
                  {dict.actions.requestQuote}
                  <IconArrowRight
                    size={16}
                    stroke={1.5}
                    className="transition-transform group-hover/btn:translate-x-px"
                    aria-hidden
                  />
                </Button>
              </Magnetic>
              <Link
                href={productsHref}
                className="text-forest-900 font-medium underline-offset-4 hover:underline"
              >
                {dict.actions.browseProducts}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </>
  );
}
