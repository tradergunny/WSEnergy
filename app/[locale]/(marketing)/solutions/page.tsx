import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

/**
 * Solutions index — the landing the nav dropdown points into.
 * Asymmetric split hero (headline left, authorized/exclusive credentials right)
 * over a four-segment bento that routes to each solution sub-page, a Rapid
 * Shutdown cross-link, and a single RFQ block. Copy is dictionary-driven; the
 * four segments and their hrefs mirror the nav. Static — no Sanity round-trip.
 */

/**
 * Bento: exactly one cell per solution. Wide feature + narrow pair + wide band
 * so the grid reads as four distinct paths, not four identical tiles. Surfaces
 * alternate (gradient / bone / forest / deep) for background diversity.
 */
const SEGMENTS = [
  { slug: "commercial-industrial", navKey: "ci", cell: "lg:col-span-8", surface: "feature", wide: true },
  { slug: "residential", navKey: "residential", cell: "lg:col-span-4", surface: "bone", wide: false },
  { slug: "solar-farm", navKey: "solarFarm", cell: "lg:col-span-4", surface: "forest", wide: false },
  { slug: "scada-monitoring", navKey: "scada", cell: "lg:col-span-8", surface: "deep", wide: true },
] as const;

const SURFACE_CLASSES: Record<string, string> = {
  feature:
    "border border-mist-800 bg-gradient-to-br from-forest-800 to-forest-950 text-mist-50 hover:border-gold-500/60",
  bone: "bg-card-50 text-card-ink hover:-translate-y-0.5",
  forest: "border border-mist-800 bg-forest-800 text-mist-50 hover:border-gold-500/60",
  deep: "border border-mist-800 bg-forest-950 text-mist-50 hover:border-gold-500/60",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.nav.solutions,
    description: dict.solutions.index.subhead,
    alternates: alternates("/solutions"),
  };
}

export default async function SolutionsIndexPage({
  params,
}: PageProps<"/[locale]/solutions">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const tx = dict.solutions.index;

  const quoteHref = withLocale(locale, "/quote");
  const safetyHref = withLocale(locale, "/safety");
  const productsHref = withLocale(locale, "/products");

  return (
    <>
      {/* ── Section 1 · Split hero: headline left, credentials right ── */}
      <Container as="section" className="pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <ScrollReveal className="lg:col-span-7">
            <MonoLabel tone="gold">{tx.eyebrow}</MonoLabel>
            <h1 className="text-h1 md:text-display text-mist-50 mt-4 max-w-[16ch] font-medium">
              {tx.headline}
            </h1>
            <p className="text-body-lg text-mist-400 mt-5 max-w-xl">
              {tx.subhead}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="primary" size="md" href={quoteHref}>
                {dict.actions.requestQuote}
              </Button>
              <Button variant="outline-primary" size="md" href={quoteHref}>
                {dict.actions.talkToEngineer}
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal
            delay={0.15}
            className="lg:col-span-4 lg:col-start-9 lg:border-l lg:border-mist-800 lg:pl-10"
          >
            <ul className="grid gap-6">
              {tx.credentials.map((c) => (
                <li key={c.title} className="flex items-start gap-3">
                  <span
                    className="text-gold-500 text-body-lg mt-0.5 leading-none"
                    aria-hidden
                  >
                    ★
                  </span>
                  <div>
                    <p className="text-h4 text-mist-50 font-medium">{c.title}</p>
                    <p className="text-body text-mist-400 mt-1">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </Container>

      {/* ── Section 2 · Four-segment bento, one cell per solution ───── */}
      <Container as="section" className="pb-20 lg:pb-24">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(230px,auto)] lg:gap-4">
          {SEGMENTS.map((s, i) => {
            const onBone = s.surface === "bone";
            const showGrid = s.surface === "feature" || s.surface === "deep";
            const muted = onBone ? "text-card-ink/65" : "text-mist-400";

            return (
              <ScrollReveal
                as="li"
                key={s.slug}
                delay={Math.min(i * 0.06, 0.24)}
                className={s.cell}
              >
                <Link
                  href={withLocale(locale, `/solutions/${s.slug}`)}
                  className={`group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-300 ease-out lg:p-8 ${SURFACE_CLASSES[s.surface]}`}
                >
                  {showGrid && (
                    <div
                      className="bg-grid-mist pointer-events-none absolute inset-0 opacity-50"
                      aria-hidden
                    />
                  )}
                  <div className="relative flex items-start justify-between gap-4">
                    <h2 className={`${s.wide ? "text-h2" : "text-h3"} font-medium`}>
                      {dict.nav[s.navKey]}
                    </h2>
                    <IconArrowUpRight
                      size={22}
                      stroke={1.5}
                      className={`mt-1 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                        onBone
                          ? "text-card-ink/40 group-hover:text-card-ink"
                          : "text-mist-600 group-hover:text-gold-500"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <p className={`text-body relative mt-4 max-w-md ${muted}`}>
                    {tx.segments[s.slug]}
                  </p>
                </Link>
              </ScrollReveal>
            );
          })}
        </ul>
      </Container>

      {/* ── Section 3 · Rapid Shutdown cross-link ───────────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <div className="border-safety-400 border-l-2 pl-6">
                <h2 className="text-h2 text-mist-50 font-medium">
                  {tx.safety.heading}
                </h2>
                <p className="text-body-lg text-mist-400 mt-3 max-w-lg">
                  {tx.safety.body}
                </p>
                <div className="mt-6">
                  <Button variant="secondary" size="md" href={safetyHref}>
                    {dict.actions.exploreSafety}
                    <IconArrowRight
                      size={16}
                      stroke={1.5}
                      className="transition-transform group-hover/btn:translate-x-px"
                      aria-hidden
                    />
                  </Button>
                </div>
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
                  className="relative max-h-52 w-auto object-contain mix-blend-multiply"
                />
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── Section 4 · RFQ block (single quote CTA on the page) ────── */}
      <Container as="section" className="py-16 lg:py-24">
        <ScrollReveal>
          <div
            className="bg-card-50 text-card-ink flex flex-wrap items-center justify-between gap-8 rounded-xl p-8 lg:p-12"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="max-w-xl">
              <h2 className="text-h2 font-medium">{tx.help.heading}</h2>
              <p className="text-body-lg text-card-ink/70 mt-2">{tx.help.body}</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Button variant="on-card" size="lg" href={quoteHref}>
                {dict.actions.requestQuote}
                <IconArrowRight
                  size={16}
                  stroke={1.5}
                  className="transition-transform group-hover/btn:translate-x-px"
                  aria-hidden
                />
              </Button>
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
