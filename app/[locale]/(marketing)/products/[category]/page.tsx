import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight, IconArrowRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  categoryBySlugQuery,
  categorySlugsQuery,
  productsByCategoryQuery,
  brandsByCategoryQuery,
  projectsByCategoryQuery,
} from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { withLocale } from "@/lib/navigation";
import { productHref, isSafetyCategorySlug } from "@/lib/product-url";
import type { urlFor } from "@/lib/sanity/client";

/**
 * Product Category template — BRIEF §6.3.
 * Order: breadcrumb → category hero → filter bar (UI only) → product grid
 * → brand band → related case studies → category RFQ block.
 *
 * Filter UI is rendered but inert this week — wiring happens once Sanity
 * holds enough SKUs to make filtering meaningful.
 */

type CategoryRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  description_en?: string;
  description_th?: string;
  parentSlug?: string;
};

type ProductRow = {
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

type BrandRow = {
  _id: string;
  name?: string;
  slug?: string;
  authorizedDistributor?: boolean;
  whyWeCarryIt_en?: string;
  whyWeCarryIt_th?: string;
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

export async function generateStaticParams() {
  const rows = await sanityClient.fetch<{ slug: string }[]>(categorySlugsQuery);
  // One [locale, category] pair per locale per category so both EN + TH
  // pre-render at build time.
  return rows.flatMap((row) =>
    locales.map((locale) => ({ locale, category: row.slug })),
  );
}

export default async function CategoryPage({
  params,
}: PageProps<"/[locale]/products/[category]">) {
  const { locale, category: categorySlug } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.products;

  const category = await sanityClient.fetch<CategoryRow | null>(
    categoryBySlugQuery,
    { slug: categorySlug },
  );
  if (!category) notFound();
  // Safety subcategories live under /safety/[slug] (BRIEF §5). 404 here so
  // we don't publish two canonical URLs for the same content.
  if (isSafetyCategorySlug(category.slug, category.parentSlug)) notFound();

  const [products, brands, projects] = await Promise.all([
    sanityClient.fetch<ProductRow[]>(productsByCategoryQuery, {
      category: categorySlug,
    }),
    sanityClient.fetch<BrandRow[]>(brandsByCategoryQuery, {
      category: categorySlug,
    }),
    sanityClient.fetch<ProjectRow[]>(projectsByCategoryQuery, {
      category: categorySlug,
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const title = localized(category.title_en, category.title_th);
  const description = localized(
    category.description_en,
    category.description_th,
  );
  const quoteHref = withLocale(locale, "/quote");

  return (
    <>
      {/* ── Section 1 · Breadcrumb ──────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-graphite-600 flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={withLocale(locale, "/")}
              className="hover:text-brand-600"
            >
              {t.categoryHero.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/products")}
              className="hover:text-brand-600"
            >
              {t.categoryHero.breadcrumbProducts}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-graphite-800">{title}</li>
        </ol>
      </Container>

      {/* ── Section 2 · Category hero ───────────────────────────── */}
      <section>
        <Container className="py-10">
          <h1 className="text-h1 text-graphite-900 font-medium">{title}</h1>
          {description && (
            <p className="text-body-lg text-graphite-600 mt-3 max-w-2xl">
              {description}
            </p>
          )}
          {brands.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-2">
              {brands.map((b) => (
                <li key={b._id}>
                  <Badge variant="brand">{b.name}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* ── Section 3 · Filter bar (UI only this week) ──────────── */}
      <section className="border-graphite-200 border-y bg-white">
        <Container className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-eyebrow text-graphite-600">
              {t.filters.heading}
            </span>
            <InertFilterChip>{t.filters.brand}</InertFilterChip>
            <InertFilterChip>{t.filters.kwRange}</InertFilterChip>
            <InertFilterChip>{t.filters.phase}</InertFilterChip>
            <InertFilterChip>{t.filters.application}</InertFilterChip>
            <span className="text-caption text-graphite-400 ml-auto">
              {t.filters.comingSoon}
            </span>
          </div>
        </Container>
      </section>

      {/* ── Section 4 · Product card grid ───────────────────────── */}
      <section>
        <Container className="py-12">
          {products.length === 0 ? (
            <div className="border-graphite-200 rounded-lg border bg-white p-8">
              <h2 className="text-h3 text-graphite-900 font-medium">
                {t.empty.heading}
              </h2>
              <p className="text-body text-graphite-600 mt-2 max-w-xl">
                {t.empty.body}
              </p>
              <div className="mt-4">
                <Button variant="outline-primary" size="md" href={quoteHref}>
                  {dict.actions.talkToEngineer}
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </Container>
      </section>

      {/* ── Section 5 · Brand band ──────────────────────────────── */}
      {brands.length > 0 && (
        <section className="bg-graphite-50">
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.brandBand.heading}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {brands.slice(0, 3).map((b) => (
                <article
                  key={b._id}
                  className="border-graphite-200 flex flex-col gap-3 rounded-lg border bg-white p-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-h4 text-graphite-900 font-medium">
                      {b.name}
                    </span>
                    {b.authorizedDistributor && (
                      <Badge variant="authorized">
                        ★ {dict.common.authorizedBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-body text-graphite-600">
                    {localized(b.whyWeCarryIt_en, b.whyWeCarryIt_th) ||
                      (locale === "th"
                        ? "พาร์ทเนอร์ระดับโลกที่เราเลือกใช้"
                        : "A global partner we stand behind.")}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Section 6 · Related case studies ────────────────────── */}
      {projects.length > 0 && (
        <section>
          <Container className="py-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.relatedProjects.heading}
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

      {/* ── Section 7 · Category RFQ block ──────────────────────── */}
      <section className="bg-graphite-50">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.categoryRfq.heading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2">
                {t.categoryRfq.body}
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

function InertFilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-caption border-graphite-200 text-graphite-600 inline-flex cursor-not-allowed items-center gap-1 rounded-md border bg-white px-3 py-1.5">
      {children}
    </span>
  );
}
