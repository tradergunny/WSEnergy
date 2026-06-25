import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { Magnetic } from "@/components/ui/Magnetic";
import { GsapBridge } from "@/components/marketing/GsapBridge";
import { SolutionHero } from "@/components/solution/SolutionHero";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { withLocale } from "@/lib/navigation";
import { productHref } from "@/lib/product-url";
import { alternates } from "@/lib/seo";

/**
 * Solar Farm & Utility — bespoke, engineering-grade solution page.
 * Cinematic hero → string-design / engineering support → a staged-delivery
 * logistics timeline (the signature) → MW-scale sourcing + Rapid Shutdown band
 * → live Sanity products → utility references → "share your single-line" close.
 * Reuses SolutionHero + the GSAP/Lenis kit; fully bespoke (no shared template).
 *
 * Drop a wide ground-mount photo at /solutions/solar-farm-hero.jpg and set
 * `heroImage` below (a graded CSS backdrop carries it until then).
 */

const heroImage: string | null = "/solutions/solar-farm-hero.jpg";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/solar-farm">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.solutions.solarFarm;
  return {
    title: t.breadcrumb,
    description: t.subhead,
    alternates: alternates("/solutions/solar-farm"),
  };
}

export default async function SolarFarmPage({
  params,
}: PageProps<"/[locale]/solutions/solar-farm">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.solarFarm;

  const [products, projects] = await Promise.all([
    sanityClient.fetch<SolutionProductRow[]>(productsByCategoriesQuery, {
      categories: ["inverters", "rapid-shutdown", "accessories"],
    }),
    sanityClient.fetch<SolutionProjectRow[]>(projectsBySectorsQuery, {
      sectors: ["Solar Farm", "Utility"],
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");
  const rapidShutdownHref = withLocale(locale, "/safety/rapid-shutdown");
  const projectsHref = withLocale(locale, "/projects");
  const productsHref = withLocale(locale, "/products");

  const featuredProducts = products.slice(0, 6);
  const ctaBg = projects.length > 0 ? "bg-forest-900" : "bg-forest-950";

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
        chips={t.heroChips}
        chipsNote={t.heroChipsNote}
        primaryLabel={dict.actions.requestQuote}
        primaryHref={quoteHref}
        secondaryLabel={dict.actions.talkToEngineer}
        secondaryHref={quoteHref}
        imageSrc={heroImage}
        imageAlt={t.headline}
        breadcrumb={breadcrumb}
      />

      {/* ── 2 · Engineering / string-design support ─────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <MonoLabel tone="gold">{t.engineering.eyebrow}</MonoLabel>
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 mt-4 font-medium"
              >
                {t.engineering.heading}
              </SplitTextReveal>
              <p className="text-body-lg text-mist-400 mt-3 max-w-lg">
                {t.engineering.body}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="border-mist-800 bg-forest-900 rounded-2xl border p-6 lg:p-8">
                <ul className="grid gap-4">
                  {t.engineering.checklist.map((item) => (
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
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 3 · Logistics timeline (signature motif) ────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <MonoLabel tone="gold">{t.logistics.eyebrow}</MonoLabel>
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 mt-4 font-medium">
          {t.logistics.heading}
        </SplitTextReveal>
        <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
          {t.logistics.body}
        </p>
        <ol className="relative mt-10 max-w-2xl">
          <div
            className="bg-mist-800 absolute top-3 bottom-3 left-4 w-px"
            aria-hidden
          />
          {t.logistics.steps.map((s, i) => (
            <ScrollReveal
              as="li"
              key={s.title}
              delay={Math.min(i * 0.1, 0.3)}
              className="relative flex gap-5 pb-8 last:pb-0"
            >
              <span className="bg-gold-500 text-forest-900 text-caption relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-h4 text-mist-50 font-medium">{s.title}</h3>
                <p className="text-body text-mist-400 mt-1">{s.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </ol>
      </Container>

      {/* ── 4 · MW-scale sourcing + Rapid Shutdown ──────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-20">
          <ul className="grid gap-4 md:grid-cols-2">
            <ScrollReveal as="li">
              <div
                className="bg-card-50 text-card-ink h-full rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="bg-gold-500 h-0.5 w-8 rounded-full" />
                <h3 className="text-h4 mt-4 font-medium">{t.benefits[0].title}</h3>
                <p className="text-body text-card-ink/70 mt-2">
                  {t.benefits[0].body}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal as="li" delay={0.08}>
              <div
                className="bg-card-50 text-card-ink flex h-full flex-col rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="bg-gold-500 h-0.5 w-8 rounded-full" />
                <h3 className="text-h4 mt-4 font-medium">{t.benefits[2].title}</h3>
                <p className="text-body text-card-ink/70 mt-2">
                  {t.benefits[2].body}
                </p>
                <Link
                  href={rapidShutdownHref}
                  className="text-forest-900 mt-4 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                >
                  {dict.actions.exploreRapidShutdown}
                  <IconArrowRight size={16} stroke={1.5} aria-hidden />
                </Link>
              </div>
            </ScrollReveal>
          </ul>
        </Container>
      </section>

      {/* ── 5 · Components we ship (live products) ───────────────── */}
      {featuredProducts.length > 0 && (
        <Container as="section" className="bg-forest-900 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SplitTextReveal as="h2" className="text-h2 text-mist-50 font-medium">
              {t.productsHeading}
            </SplitTextReveal>
            <Link
              href={productsHref}
              className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-1 font-medium"
            >
              {dict.actions.browseProducts}
              <IconArrowRight size={16} stroke={1.5} aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p, i) => (
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

      {/* ── 6 · Utility-scale references (live) ──────────────────── */}
      {projects.length > 0 && (
        <section className="border-mist-800 border-t bg-forest-950">
          <Container className="py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 font-medium"
              >
                {t.projectsHeading}
              </SplitTextReveal>
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

      {/* ── 7 · Single-line quote close ─────────────────────────── */}
      <section className={ctaBg}>
        <Container className="py-16 lg:py-24">
          <ScrollReveal>
            <div
              className="bg-card-50 text-card-ink flex flex-wrap items-center justify-between gap-8 rounded-xl p-8 lg:p-12"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="max-w-xl">
                <h2 className="text-h2 font-medium">{t.ctaHeading}</h2>
                <p className="text-body-lg text-card-ink/70 mt-2">{t.ctaBody}</p>
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
      </section>
    </>
  );
}
