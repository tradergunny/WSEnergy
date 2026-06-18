import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { productsIndexQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CountUp } from "@/components/ui/CountUp";
import { categoryHref } from "@/lib/product-url";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

/**
 * Products index — catalog landing.
 * Asymmetric split hero (headline left, live inventory stats right) over an
 * inventory-weighted category bento, brand logo band, safety cross-link, and
 * a single RFQ block. Counts, brand names, and imagery come live from Sanity
 * via `productsIndexQuery`.
 */

type CategoryRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  parentSlug?: string;
  productCount?: number;
  brandNames?: (string | null)[];
  image?: Parameters<typeof urlFor>[0] | null;
};

type BrandRow = {
  _id: string;
  name?: string;
  slug?: string;
  authorizedDistributor?: boolean;
  logo?: Parameters<typeof urlFor>[0] | null;
};

type IndexData = {
  categories: CategoryRow[];
  brands: BrandRow[];
};

/**
 * Bento placement by category position (Sanity orderRank puts the deepest
 * inventory first). 12-col grid: one 2-row feature cell, two 5-col cells,
 * then a 4-col bottom row. Surfaces alternate so the grid never reads as
 * six identical tiles; positions beyond 6 fall back to a standard cell.
 */
const BENTO_LAYOUT: { cell: string; surface: "feature" | "bone" | "forest" | "deep" }[] = [
  { cell: "sm:col-span-2 lg:col-span-7 lg:row-span-2", surface: "feature" },
  { cell: "lg:col-span-5", surface: "bone" },
  { cell: "lg:col-span-5", surface: "forest" },
  { cell: "lg:col-span-4", surface: "bone" },
  { cell: "lg:col-span-4", surface: "forest" },
  { cell: "lg:col-span-4", surface: "deep" },
];

const SURFACE_CLASSES: Record<string, string> = {
  feature:
    "border border-mist-800 bg-gradient-to-br from-forest-800 to-forest-950 text-mist-50 hover:border-gold-500/60",
  bone: "bg-card-50 text-card-ink hover:-translate-y-0.5",
  forest: "border border-mist-800 bg-forest-800 text-mist-50 hover:border-gold-500/60",
  deep: "border border-mist-800 bg-forest-950 text-mist-50 hover:border-gold-500/60",
};

export async function generateMetadata({ params }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.products.indexTitle, description: dict.products.indexSubhead, alternates: alternates("/products") };
}

export default async function ProductsIndexPage({
  params,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.products;
  const tx = t.index;

  const { categories, brands } = await sanityClient.fetch<IndexData>(
    productsIndexQuery,
  );

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const blurbs = tx.categoryBlurbs as Record<string, string | undefined>;
  const totalProducts = categories.reduce(
    (sum, c) => sum + (c.productCount ?? 0),
    0,
  );

  const unitFor = (n: number) =>
    locale === "th" ? tx.productsUnit : n === 1 ? "product" : "products";

  const authorizedBrands = brands
    .filter((b) => b.authorizedDistributor && b.name)
    .map((b) => b.name as string);
  const authorizedLine =
    authorizedBrands.length > 0
      ? tx.authorizedLine.replace(
          "{brands}",
          authorizedBrands.join(locale === "th" ? " และ " : " and "),
        )
      : null;

  const quoteHref = withLocale(locale, "/quote");
  const safetyHref = withLocale(locale, "/safety");
  const datasheetsHref = withLocale(locale, "/resources/datasheets");

  const stats = [
    { value: totalProducts, label: tx.statProducts },
    { value: brands.length, label: tx.statBrands },
    { value: categories.length, label: tx.statCategories },
  ];

  return (
    <>
      {/* ── Section 1 · Split hero: headline left, live stats right ── */}
      <Container as="section" className="pt-14 pb-16 lg:pt-20 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <ScrollReveal className="lg:col-span-7">
            <MonoLabel tone="gold">{t.indexEyebrow}</MonoLabel>
            <h1 className="text-h1 md:text-display text-mist-50 mt-4 max-w-[14ch] font-medium">
              {tx.headline}
            </h1>
            <p className="text-body-lg text-mist-400 mt-5 max-w-xl">
              {t.indexSubhead}
            </p>
          </ScrollReveal>
          <ScrollReveal
            delay={0.15}
            className="lg:col-span-4 lg:col-start-9 lg:border-l lg:border-mist-800 lg:pl-10"
          >
            <dl className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-mono text-4xl text-mist-50 lg:text-5xl">
                    <CountUp to={s.value} />
                  </dd>
                  <dt className="text-caption text-mist-400 mt-1">{s.label}</dt>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </Container>

      {/* ── Section 2 · Inventory-weighted category bento ───────────── */}
      <Container as="section" className="pb-20 lg:pb-24">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(215px,auto)] lg:gap-4">
          {categories.map((c, i) => {
            const layout = BENTO_LAYOUT[i] ?? {
              cell: "lg:col-span-4",
              surface: "forest" as const,
            };
            const isFeature = layout.surface === "feature";
            const onBone = layout.surface === "bone";
            const blurb = blurbs[c.slug ?? ""];
            const brandNames = (c.brandNames ?? []).filter(
              (n): n is string => Boolean(n),
            );
            const count = c.productCount ?? 0;
            const mutedText = onBone ? "text-card-ink/65" : "text-mist-400";

            return (
              <ScrollReveal
                as="li"
                key={c._id}
                delay={Math.min(i * 0.06, 0.3)}
                className={layout.cell}
              >
                <Link
                  href={categoryHref(locale, {
                    categorySlug: c.slug,
                    parentSlug: c.parentSlug,
                  })}
                  className={`group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-xl p-6 transition-all duration-300 ease-out lg:p-8 ${SURFACE_CLASSES[layout.surface]}`}
                >
                  {isFeature && (
                    <div
                      className="bg-grid-mist pointer-events-none absolute inset-0 opacity-60"
                      aria-hidden
                    />
                  )}
                  {onBone && c.image && (
                    <Image
                      src={urlFor(c.image).width(440).height(440).fit("max").url()}
                      alt={localized(c.title_en, c.title_th)}
                      width={220}
                      height={220}
                      className="pointer-events-none absolute right-3 bottom-3 h-36 w-36 mix-blend-multiply object-contain lg:h-44 lg:w-44"
                    />
                  )}

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <h2
                        className={`${isFeature ? "text-h2" : "text-h3"} font-medium`}
                      >
                        {localized(c.title_en, c.title_th)}
                      </h2>
                      {blurb && (
                        <p className={`text-body mt-2 max-w-sm ${mutedText}`}>
                          {blurb}
                        </p>
                      )}
                    </div>
                    <IconArrowUpRight
                      size={20}
                      stroke={1.5}
                      className={`shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                        onBone
                          ? "text-card-ink/50 group-hover:text-card-ink"
                          : "text-mist-600 group-hover:text-gold-500"
                      }`}
                      aria-hidden
                    />
                  </div>

                  {/* When a product photo occupies the right side of the cell,
                      the count + brand list stack on the left instead of
                      spreading across the photo. */}
                  <div
                    className={`relative mt-10 flex gap-4 ${
                      onBone && c.image
                        ? "flex-col items-start"
                        : "items-end justify-between"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`font-mono leading-none tabular-nums ${
                          isFeature ? "text-7xl lg:text-8xl" : "text-4xl"
                        }`}
                      >
                        {count}
                      </span>
                      <span className={`text-caption ${mutedText}`}>
                        {unitFor(count)}
                      </span>
                    </div>
                    {brandNames.length > 0 && (
                      <p
                        className={`text-caption ${mutedText} ${
                          onBone && c.image
                            ? "max-w-[55%]"
                            : "max-w-[45%] text-right"
                        }`}
                      >
                        {brandNames.join(", ")}
                      </p>
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </ul>
      </Container>

      {/* ── Section 3 · Brand band: real logos, authorized claim ────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-14 lg:py-16">
          <ScrollReveal>
            <h2 className="text-h2 text-mist-50 font-medium">
              {t.brandBand.heading}
            </h2>
            {authorizedLine && (
              <p className="text-body text-mist-400 mt-2 max-w-xl">
                {authorizedLine}
              </p>
            )}
            <ul className="mt-8 flex flex-wrap items-center gap-3 lg:gap-4">
              {brands.map((b) => (
                <li
                  key={b._id}
                  className="bg-card-50 flex h-14 items-center rounded-full px-7"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  {b.logo ? (
                    // multiply drops opaque white JPEG backgrounds into the
                    // bone pill while colored marks render normally.
                    <Image
                      src={urlFor(b.logo).height(64).fit("max").url()}
                      alt={b.name ?? ""}
                      width={120}
                      height={32}
                      className="h-auto max-h-7 w-auto max-w-28 object-contain mix-blend-multiply"
                    />
                  ) : (
                    <span className="text-h4 text-card-ink font-medium">
                      {b.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </Container>
      </section>

      {/* ── Section 4 · Safety cross-link ───────────────────────────── */}
      <Container as="section" className="py-16 lg:py-20">
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

      {/* ── Section 5 · RFQ block (single quote CTA on the page) ────── */}
      <Container as="section" className="pb-20 lg:pb-24">
        <ScrollReveal>
          <div
            className="bg-card-50 text-card-ink flex flex-wrap items-center justify-between gap-8 rounded-xl p-8 lg:p-12"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="max-w-xl">
              <h2 className="text-h2 font-medium">{tx.help.heading}</h2>
              <p className="text-body-lg text-card-ink/70 mt-2">
                {tx.help.body}
              </p>
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
                href={datasheetsHref}
                className="text-forest-900 font-medium underline-offset-4 hover:underline"
              >
                {tx.help.datasheets}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </>
  );
}
