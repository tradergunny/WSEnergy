import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { IconChevronRight, IconArrowLeft } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  brandBySlugQuery,
  categoryBrandTuplesQuery,
  categoryBySlugQuery,
  productsByCategoryAndBrandQuery,
} from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { BrandLogoBadge } from "@/components/ui/BrandLogoBadge";
import { ProductCard } from "@/components/product/ProductCard";
import { withLocale } from "@/lib/navigation";
import { productHref, isSafetyCategorySlug } from "@/lib/product-url";
import type { urlFor } from "@/lib/sanity/client";

/**
 * Brand-in-category page — e.g. /en/products/inverters/huawei.
 * Sibling to /products/[category]/[brand]/[sku] (the SKU detail page).
 *
 * Shows the brand's identity (logo, authorized status, why-we-carry copy)
 * + only that brand's products in this category, ungrouped. Acts as a
 * filtered view of the parent category page for users who already know
 * which brand they want.
 */

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

type CategoryRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  description_en?: string;
  description_th?: string;
  parentSlug?: string;
};

type BrandData = {
  _id: string;
  name?: string;
  slug?: string;
  authorizedDistributor?: boolean;
  whyWeCarryIt_en?: string;
  whyWeCarryIt_th?: string;
  logo?: SanityImageRef;
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
  image?: SanityImageRef;
  brand?: { name?: string; slug?: string; logo?: SanityImageRef };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

export async function generateStaticParams() {
  const rows = await sanityClient.fetch<
    { category: string; brand: string }[]
  >(categoryBrandTuplesQuery);
  // Dedupe (one product row per pair → many duplicates) then cross with locales.
  const uniquePairs = new Set(rows.map((r) => `${r.category}|${r.brand}`));
  return Array.from(uniquePairs).flatMap((pair) => {
    const [category, brand] = pair.split("|");
    return locales.map((locale) => ({ locale, category, brand }));
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[category]/[brand]">): Promise<Metadata> {
  const { locale, category: categorySlug, brand: brandSlug } = await params;
  const [category, brand] = await Promise.all([
    sanityClient.fetch<CategoryRow | null>(categoryBySlugQuery, {
      slug: categorySlug,
    }),
    sanityClient.fetch<BrandData | null>(brandBySlugQuery, {
      slug: brandSlug,
    }),
  ]);
  if (!category || !brand) return { title: "WS Energy" };
  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");
  const categoryTitle = localized(category.title_en, category.title_th);
  const title =
    locale === "th"
      ? `${categoryTitle} ${brand.name} | WS Energy`
      : `${brand.name} ${categoryTitle} | WS Energy`;
  return { title };
}

export default async function BrandInCategoryPage({
  params,
}: PageProps<"/[locale]/products/[category]/[brand]">) {
  const { locale, category: categorySlug, brand: brandSlug } = await params;
  if (!hasLocale(locale)) notFound();

  const [category, brand, products] = await Promise.all([
    sanityClient.fetch<CategoryRow | null>(categoryBySlugQuery, {
      slug: categorySlug,
    }),
    sanityClient.fetch<BrandData | null>(brandBySlugQuery, {
      slug: brandSlug,
    }),
    sanityClient.fetch<ProductRow[]>(productsByCategoryAndBrandQuery, {
      category: categorySlug,
      brand: brandSlug,
    }),
  ]);

  if (!category || !brand) notFound();
  // Safety subcategories live under /safety/[slug] — never serve them here.
  if (isSafetyCategorySlug(category.slug, category.parentSlug)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.products;

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const categoryTitle = localized(category.title_en, category.title_th);
  const heading =
    locale === "th"
      ? `${categoryTitle} ${brand.name ?? ""}`
      : `${brand.name ?? ""} ${categoryTitle}`;
  const whyWeCarry = localized(brand.whyWeCarryIt_en, brand.whyWeCarryIt_th);
  const quoteHref = withLocale(locale, "/quote");
  const categoryUrl = withLocale(locale, `/products/${categorySlug}`);
  const backLabel =
    locale === "th"
      ? `ดู${categoryTitle}จากทุกแบรนด์`
      : `View all ${categoryTitle.toLowerCase()}`;

  return (
    <>
      {/* ── 1 · Breadcrumb ──────────────────────────────────────── */}
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
          <li>
            <Link href={categoryUrl} className="hover:text-gold-500">
              {categoryTitle}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{brand.name}</li>
        </ol>
      </Container>

      {/* ── 2 · Brand hero ──────────────────────────────────────── */}
      <section>
        <Container className="py-10">
          <MonoLabel tone="mist">
            _{(brand.name ?? "").toUpperCase()}
          </MonoLabel>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {brand.logo && (
              <BrandLogoBadge
                logo={brand.logo}
                name={brand.name}
                size="md"
              />
            )}
            <h1 className="text-h1 text-mist-50 font-medium">{heading}</h1>
            {brand.authorizedDistributor && (
              <Badge variant="authorized">
                ★ {dict.common.authorizedBadge}
              </Badge>
            )}
          </div>
          {whyWeCarry && (
            <p className="text-body-lg text-mist-400 mt-4 max-w-2xl">
              {whyWeCarry}
            </p>
          )}
        </Container>
      </section>

      {/* ── 3 · Product grid (ungrouped — single brand) ──────────── */}
      <section className="bg-forest-950">
        <Container className="py-12">
          {products.length === 0 ? (
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
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <li key={p._id}>
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
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* ── 4 · Back to "all [category]" ────────────────────────── */}
      <section>
        <Container className="border-mist-800/40 border-t py-8">
          <Link
            href={categoryUrl}
            className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-2 font-medium"
          >
            <IconArrowLeft size={16} stroke={1.5} />
            {backLabel}
          </Link>
        </Container>
      </section>

      {/* ── 5 · Closing CTA ─────────────────────────────────────── */}
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
