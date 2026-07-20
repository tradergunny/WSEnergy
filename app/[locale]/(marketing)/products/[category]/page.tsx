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
import {
  CategoryProductExplorer,
  type ExplorerGroup,
} from "@/components/product/CategoryProductExplorer";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { withLocale } from "@/lib/navigation";
import { productHref, isSafetyCategorySlug } from "@/lib/product-url";
import { deriveFacets } from "@/lib/product-facets";
import type { urlFor } from "@/lib/sanity/client";

/**
 * Product Category template — BRIEF §6.3.
 * Order: breadcrumb → category hero → filter bar (wired) → product grid
 * → brand band → related case studies → category RFQ block.
 *
 * Facets (kW rating, phase) are derived server-side from spec rows and
 * model numbers (lib/product-facets.ts); CategoryProductExplorer owns the
 * filter state client-side via URL params.
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
  facetSpecs?: { label?: string | null; value?: string | null }[] | null;
  brand?: { name?: string; slug?: string; logo?: Parameters<typeof urlFor>[0] };
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
  logo?: Parameters<typeof urlFor>[0];
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

  // Group products under their brand for the section-by-brand layout below.
  // Authorized distributors lead, then alphabetical. Facets and card props
  // are precomputed here so the client explorer receives plain JSON.
  const toExplorerProduct = (p: ProductRow) => ({
    _id: p._id,
    brandSlug: p.brand?.slug ?? null,
    facets: deriveFacets({
      title: p.title,
      sku: p.sku,
      shortDescription: p.shortDescription_en,
      specs: p.facetSpecs,
    }),
    card: {
      brand: p.brand,
      authorized: p.authorized,
      exclusive: p.exclusive,
      safetyCritical: p.safetyCritical,
      image: p.image,
      sku: p.sku,
      title: p.title,
      description: localized(p.shortDescription_en, p.shortDescription_th),
      href: productHref(locale, {
        categorySlug: p.category?.slug,
        parentSlug: p.category?.parentSlug,
        brandSlug: p.brand?.slug,
        productSlug: p.slug,
      }),
      specsLabel: dict.actions.viewSpecs,
      quoteLabel: dict.actions.requestQuote,
      quoteHref,
      authorizedLabel: dict.common.authorizedBadge,
      exclusiveLabel: dict.common.exclusiveBadge,
      safetyLabel: dict.common.safetyBadge,
    },
  });

  const brandedGroups: ExplorerGroup[] = brands
    .map((brand) => ({
      brand: {
        _id: brand._id,
        name: brand.name,
        slug: brand.slug,
        authorizedDistributor: brand.authorizedDistributor,
        logo: brand.logo,
      },
      products: products
        .filter((p) => p.brand?.slug === brand.slug)
        .map(toExplorerProduct),
    }))
    .filter((group) => group.products.length > 0)
    .sort((a, b) => {
      const aAuth = a.brand.authorizedDistributor ? 0 : 1;
      const bAuth = b.brand.authorizedDistributor ? 0 : 1;
      if (aAuth !== bAuth) return aAuth - bAuth;
      return (a.brand.name ?? "").localeCompare(b.brand.name ?? "");
    });

  return (
    <>
      {/* ── Section 1 · Breadcrumb ──────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={withLocale(locale, "/")}
              className="hover:text-gold-500"
            >
              {t.categoryHero.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/products")}
              className="hover:text-gold-500"
            >
              {t.categoryHero.breadcrumbProducts}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{title}</li>
        </ol>
      </Container>

      {/* ── Section 2 · Category hero ───────────────────────────── */}
      <section>
        <Container className="py-10">
          <h1 className="text-h1 text-mist-50 font-medium">{title}</h1>
          {description && (
            <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
              {description}
            </p>
          )}
          {brands.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-2">
              {brands.map((b) => (
                <li key={b._id}>
                  <Link
                    href={withLocale(
                      locale,
                      `/products/${categorySlug}/${b.slug}`,
                    )}
                    className="inline-block rounded-sm transition-colors hover:bg-gold-500/10"
                  >
                    <Badge variant="brand">{b.name}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* ── Sections 3+4 · Wired filter bar + brand-grouped grid ── */}
      {products.length === 0 ? (
        <section>
          <Container className="py-12">
            <div className="border-mist-800 rounded-xl border bg-forest-800 p-8">
              <h2 className="text-h3 text-mist-50 font-medium">
                {t.empty.heading}
              </h2>
              <p className="text-body text-mist-400 mt-2 max-w-xl">
                {t.empty.body}
              </p>
              <div className="mt-4">
                <Button variant="outline-primary" size="md" href={quoteHref}>
                  {dict.actions.talkToEngineer}
                </Button>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <CategoryProductExplorer
          groups={brandedGroups}
          locale={locale}
          labels={{
            heading: t.filters.heading,
            brand: t.filters.brand,
            kwRange: t.filters.kwRange,
            phase: t.filters.phase,
          }}
          authorizedBadgeLabel={dict.common.authorizedBadge}
        />
      )}

      {/* ── Section 5 · Brand band ──────────────────────────────── */}
      {brands.length > 0 && (
        <section className="bg-forest-950">
          <Container className="py-12">
            <h2 className="text-h2 text-mist-50 mb-6 font-medium">
              {t.brandBand.heading}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {brands.slice(0, 3).map((b) => (
                <article
                  key={b._id}
                  className="border-mist-800 flex flex-col gap-3 rounded-xl border bg-forest-800 p-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-h4 text-mist-50 font-medium">
                      {b.name}
                    </span>
                    {b.authorizedDistributor && (
                      <Badge variant="authorized">
                        ★ {dict.common.authorizedBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-body text-mist-400">
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
              <h2 className="text-h2 text-mist-50 font-medium">
                {t.relatedProjects.heading}
              </h2>
              <Link
                href={withLocale(locale, "/projects")}
                className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-1 font-medium"
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
      <section className="bg-forest-950">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-mist-50 font-medium">
                {t.categoryRfq.heading}
              </h2>
              <p className="text-body-lg text-mist-400 mt-2">
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
