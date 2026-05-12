import Link from "next/link";
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { withLocale } from "@/lib/navigation";
import { productHref } from "@/lib/product-url";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { urlFor } from "@/lib/sanity/client";

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

export type SolutionProductRow = {
  _id: string;
  title?: string;
  sku?: string;
  slug?: string;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  shortDescription_en?: string;
  shortDescription_th?: string;
  image?: SanityImageRef;
  brand?: { name?: string; slug?: string };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

export type SolutionProjectRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  year?: number;
  heroImage?: SanityImageRef;
};

export type SolutionPageProps = {
  locale: Locale;
  dict: Dictionary;
  copy: {
    eyebrow: string;
    headline: string;
    subhead: string;
    benefitsHeading: string;
    benefits: { title: string; body: string }[];
    productsHeading: string;
    projectsHeading: string;
    ctaHeading: string;
    ctaBody: string;
    breadcrumb: string;
  };
  products: SolutionProductRow[];
  projects: SolutionProjectRow[];
};

export function SolutionPage({
  locale,
  dict,
  copy,
  products,
  projects,
}: SolutionPageProps) {
  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-graphite-600 flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={withLocale(locale, "/")}
              className="hover:text-brand-600"
            >
              {dict.productDetail.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/solutions")}
              className="hover:text-brand-600"
            >
              {dict.nav.solutions}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-graphite-800">{copy.breadcrumb}</li>
        </ol>
      </Container>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="border-graphite-200 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-graphite-600 mb-3">{copy.eyebrow}</p>
          <h1 className="text-display text-graphite-900 font-medium">
            {copy.headline}
          </h1>
          <p className="text-body-lg text-graphite-600 mt-4 max-w-3xl">
            {copy.subhead}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" size="md" href={quoteHref}>
              {dict.actions.requestQuote}
            </Button>
            <Button variant="outline-primary" size="md" href={quoteHref}>
              {dict.actions.talkToEngineer}
            </Button>
          </div>
        </Container>
      </section>

      {/* ── Benefits ────────────────────────────────────────────── */}
      <section>
        <Container className="py-12">
          <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
            {copy.benefitsHeading}
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.benefits.map((b) => (
              <li
                key={b.title}
                className="border-graphite-200 flex flex-col gap-2 rounded-lg border bg-white p-5"
              >
                <h3 className="text-h4 text-graphite-900 font-medium">
                  {b.title}
                </h3>
                <p className="text-body text-graphite-600">{b.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Featured products ──────────────────────────────────── */}
      {products.length > 0 && (
        <section className="bg-graphite-50">
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {copy.productsHeading}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <li key={p._id}>
                  <ProductCard
                    brand={p.brand?.name}
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
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ── Featured projects ───────────────────────────────────── */}
      {projects.length > 0 && (
        <section>
          <Container className="py-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {copy.projectsHeading}
              </h2>
              <Link
                href={withLocale(locale, "/projects")}
                className="text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 font-medium"
              >
                {dict.actions.viewAll}
                <IconArrowRight size={16} stroke={1.5} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {/* ── Closing CTA ─────────────────────────────────────────── */}
      <section className="bg-graphite-50">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {copy.ctaHeading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2">
                {copy.ctaBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="md" href={quoteHref}>
                {dict.actions.requestQuote}
              </Button>
              <Button variant="outline-primary" size="md" href={quoteHref}>
                {dict.actions.talkToEngineer}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
