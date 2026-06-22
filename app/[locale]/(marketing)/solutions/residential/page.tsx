import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconBolt, IconChevronRight } from "@tabler/icons-react";
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
} from "@/components/solution/SolutionPage";
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
 * Residential & small commercial — bespoke, warm solution page for installers.
 * Cinematic hero → "kit scale" strip (5/15/30 kW sizes on the shelf) → EV-ready
 * band → why-installers benefits → live Sanity products → references → a
 * LINE-forward quote close. Reuses SolutionHero + the GSAP/Lenis kit; does NOT
 * use the shared SolutionPage template.
 *
 * Drop a home/villa rooftop photo at /solutions/residential-hero.jpg and set
 * `heroImage` below (a graded CSS backdrop carries it until then).
 */

const heroImage: string | null = "/solutions/residential-hero.jpg";
const lineHref = "https://line.me/";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/residential">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.solutions.residential;
  return {
    title: t.breadcrumb,
    description: t.subhead,
    alternates: alternates("/solutions/residential"),
  };
}

export default async function ResidentialPage({
  params,
}: PageProps<"/[locale]/solutions/residential">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.residential;

  const [products, projects] = await Promise.all([
    sanityClient.fetch<SolutionProductRow[]>(productsByCategoriesQuery, {
      categories: ["inverters", "battery-storage", "micro-inverters", "ev-chargers"],
    }),
    sanityClient.fetch<SolutionProjectRow[]>(projectsBySectorsQuery, {
      sectors: ["Residential"],
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");
  const projectsHref = withLocale(locale, "/projects");
  const productsHref = withLocale(locale, "/products");

  const featuredProducts = products.slice(0, 6);

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
        chips={t.brands}
        chipsNote={t.heroChipsNote}
        primaryLabel={dict.actions.requestQuote}
        primaryHref={quoteHref}
        secondaryLabel={dict.actions.talkToEngineer}
        secondaryHref={quoteHref}
        imageSrc={heroImage}
        imageAlt={t.headline}
        breadcrumb={breadcrumb}
      />

      {/* ── 2 · Kit-scale strip (signature motif) ───────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <MonoLabel tone="gold">{t.kitScale.eyebrow}</MonoLabel>
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 mt-4 font-medium">
          {t.kitScale.heading}
        </SplitTextReveal>
        <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
          {t.kitScale.body}
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {t.kitScale.tiers.map((tier, i) => (
            <ScrollReveal as="li" key={tier.size} delay={Math.min(i * 0.1, 0.3)}>
              <div
                className="bg-card-50 text-card-ink flex h-full flex-col rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* scale indicator — fills more bars as the kit grows */}
                <div className="flex items-end gap-1.5" aria-hidden>
                  {[0, 1, 2].map((b) => (
                    <span
                      key={b}
                      className="w-2.5 rounded-sm"
                      style={{
                        height: `${12 + b * 8}px`,
                        backgroundColor:
                          b <= i ? "var(--color-gold-500)" : "rgba(0,38,22,0.12)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-display mt-5 font-medium tabular-nums">
                  {tier.size}
                </p>
                <h3 className="text-h4 mt-1 font-medium">{tier.name}</h3>
                <p className="text-body text-card-ink/70 mt-2">{tier.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </Container>

      {/* ── 3 · EV-ready band ───────────────────────────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <MonoLabel tone="gold">{t.evReady.eyebrow}</MonoLabel>
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 mt-4 font-medium"
              >
                {t.evReady.heading}
              </SplitTextReveal>
              <p className="text-body-lg text-mist-400 mt-3 max-w-lg">
                {t.evReady.body}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div
                className="bg-card-50 text-card-ink rounded-xl p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="bg-forest-900 text-gold-500 inline-flex h-12 w-12 items-center justify-center rounded-full">
                  <IconBolt size={24} stroke={1.5} aria-hidden />
                </span>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {["SCU", "Sine Xcel", "SolaX"].map((c) => (
                    <li
                      key={c}
                      className="border-card-200 text-card-ink rounded-full border px-3 py-1 text-caption font-medium"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="text-body text-card-ink/70 mt-4">
                  {t.benefits[2].body}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 4 · Why installers choose WS Energy ─────────────────── */}
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

      {/* ── 5 · Residential-ready products (live) ───────────────── */}
      {featuredProducts.length > 0 && (
        <section className="border-mist-800 border-t bg-forest-950">
          <Container className="py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 font-medium"
              >
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
        </section>
      )}

      {/* ── 6 · Residential references (live) ───────────────────── */}
      {projects.length > 0 && (
        <Container as="section" className="bg-forest-900 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SplitTextReveal as="h2" className="text-h2 text-mist-50 font-medium">
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
      )}

      {/* ── 7 · LINE-forward quote close ────────────────────────── */}
      <section className="border-mist-800 border-t bg-forest-950">
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
              <div className="flex flex-wrap items-center gap-4">
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
                <a
                  href={lineHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-mist-50 inline-flex items-center justify-center rounded-full border px-[26px] py-[14px] text-body-lg font-medium transition-colors"
                >
                  {t.lineCta}
                </a>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
