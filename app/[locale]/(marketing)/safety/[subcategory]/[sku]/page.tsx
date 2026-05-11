import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconChevronRight } from "@tabler/icons-react";
import { PortableText } from "@portabletext/react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import {
  productBySkuQuery,
  productSkuTuplesQuery,
  relatedByBrandQuery,
  projectsByProductQuery,
} from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { DocumentTile } from "@/components/product/DocumentTile";
import { withLocale } from "@/lib/navigation";
import { productHref, isSafetyCategorySlug } from "@/lib/product-url";

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

type DocRef = { title?: string; url?: string } | null;

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
  overview_en?: unknown[];
  overview_th?: unknown[];
  gallery?: SanityImageRef[];
  specs?: { label_en?: string; label_th?: string; value?: string }[];
  compliance?: string[];
  datasheet?: DocRef;
  wiringDiagram?: DocRef;
  installManual?: DocRef;
  brand?: {
    _id?: string;
    name?: string;
    slug?: string;
    authorizedDistributor?: boolean;
    whyWeCarryIt_en?: string;
    whyWeCarryIt_th?: string;
    authorizationDocument?: DocRef;
  };
  category?: {
    _id?: string;
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
  pairsWellWith?: RelatedProduct[];
};

type RelatedProduct = {
  _id: string;
  title?: string;
  sku?: string;
  slug?: string;
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

type ProjectRow = {
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

const TABS = ["overview", "specs", "documents", "compliance"] as const;

export async function generateStaticParams() {
  const rows = await sanityClient.fetch<
    {
      sku: string;
      category: string;
      brand: string;
      parentSlug: string | null;
    }[]
  >(productSkuTuplesQuery);

  return rows
    .filter(
      (r) =>
        r.category &&
        isSafetyCategorySlug(r.category, r.parentSlug),
    )
    .flatMap((r) =>
      locales.map((locale) => ({
        locale,
        subcategory: r.category,
        sku: r.sku,
      })),
    );
}

export default async function SafetyProductDetailPage({
  params,
}: PageProps<"/[locale]/safety/[subcategory]/[sku]">) {
  const { locale, sku } = await params;
  if (!hasLocale(locale)) notFound();

  const maybeProduct = await sanityClient.fetch<ProductRow | null>(
    productBySkuQuery,
    { sku },
  );
  if (!maybeProduct) notFound();
  const product: ProductRow = maybeProduct;

  if (
    !isSafetyCategorySlug(product.category?.slug, product.category?.parentSlug)
  )
    notFound();

  const dict = await getDictionary(locale);
  const t = dict.productDetail;

  const [related, projects] = await Promise.all([
    product.brand?.slug
      ? sanityClient.fetch<RelatedProduct[]>(relatedByBrandQuery, {
          brand: product.brand.slug,
          sku,
        })
      : [],
    sanityClient.fetch<ProjectRow[]>(projectsByProductQuery, {
      productId: product._id,
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const displayTitle = product.title ?? product.sku ?? "";
  const categoryTitle = localized(
    product.category?.title_en,
    product.category?.title_th,
  );
  const quoteHref = withLocale(locale, "/quote");
  const catHref = withLocale(
    locale,
    `/safety/${product.category?.slug ?? ""}`,
  );

  const overview =
    locale === "th"
      ? (product.overview_th ?? product.overview_en)
      : (product.overview_en ?? product.overview_th);

  const gallery = product.gallery ?? [];
  const docs = [
    product.datasheet && {
      type: "datasheet" as const,
      title: product.datasheet.title ?? t.documents.datasheet,
      url: product.datasheet.url,
    },
    product.wiringDiagram && {
      type: "diagram" as const,
      title: product.wiringDiagram.title ?? t.documents.wiringDiagram,
      url: product.wiringDiagram.url,
    },
    product.installManual && {
      type: "manual" as const,
      title: product.installManual.title ?? t.documents.installManual,
      url: product.installManual.url,
    },
  ].filter(Boolean) as {
    type: "datasheet" | "diagram" | "manual";
    title: string;
    url?: string;
  }[];

  return (
    <>
      {/* ── Section 1 · Breadcrumb ──────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-graphite-600 flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={withLocale(locale, "/")}
              className="hover:text-safety-600"
            >
              {t.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/safety")}
              className="hover:text-safety-600"
            >
              {t.breadcrumbSafety}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link href={catHref} className="hover:text-safety-600">
              {categoryTitle}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-graphite-800">{displayTitle}</li>
        </ol>
      </Container>

      {/* ── Section 2 · Product hero (image + identity) ─────────── */}
      <section>
        <Container className="py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <div className="flex flex-col gap-3">
              <div className="bg-graphite-50 relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                {gallery[0] ? (
                  <Image
                    src={urlFor(gallery[0])
                      .width(800)
                      .height(600)
                      .fit("crop")
                      .url()}
                    alt={displayTitle}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="text-graphite-400 text-eyebrow flex h-full w-full items-center justify-center">
                    {product.brand?.name ?? "WS Energy"}
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="bg-graphite-50 relative aspect-square overflow-hidden rounded-md"
                    >
                      {img && (
                        <Image
                          src={urlFor(img)
                            .width(200)
                            .height(200)
                            .fit("crop")
                            .url()}
                          alt={`${displayTitle} ${i + 2}`}
                          fill
                          sizes="25vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand?.name && (
                  <Badge variant="brand">{product.brand.name}</Badge>
                )}
                {product.authorized && (
                  <Badge variant="authorized">
                    ★ {dict.common.authorizedBadge}
                  </Badge>
                )}
                {product.exclusive && (
                  <Badge variant="exclusive">
                    ★ {dict.common.exclusiveBadge}
                  </Badge>
                )}
                {product.safetyCritical && (
                  <Badge variant="safety-critical">
                    {dict.common.safetyBadge}
                  </Badge>
                )}
              </div>

              {product.sku && (
                <p className="text-caption text-graphite-600 font-mono">
                  {product.sku}
                </p>
              )}
              <h1 className="text-h1 text-graphite-900 font-medium">
                {displayTitle}
              </h1>
              {localized(
                product.shortDescription_en,
                product.shortDescription_th,
              ) && (
                <p className="text-body-lg text-graphite-600">
                  {localized(
                    product.shortDescription_en,
                    product.shortDescription_th,
                  )}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                <Button variant="primary" size="md" href={quoteHref}>
                  {dict.actions.requestQuote}
                </Button>
                <Button variant="outline-primary" size="md" href={quoteHref}>
                  {dict.actions.talkToEngineer}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Section 3 · Anchor nav (jump links) ────────────────── */}
      <nav className="border-graphite-200 sticky top-0 z-10 border-y bg-white">
        <Container>
          <ul className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <li key={tab}>
                <a
                  href={`#${tab}`}
                  className="text-body text-graphite-600 hover:text-safety-600 inline-block border-b-2 border-transparent px-1 py-3 font-medium"
                >
                  {t.tabs[tab]}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* ── Section 4a · Overview ───────────────────────────────── */}
      <section id="overview">
        <Container className="py-10">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-graphite-900 mb-4 font-medium">
              {t.overview.heading}
            </h2>
            {overview && Array.isArray(overview) && overview.length > 0 ? (
              <div className="text-body-lg text-graphite-600 space-y-4">
                <PortableText value={overview as any} />
              </div>
            ) : (
              <p className="text-body text-graphite-600">
                {localized(
                  product.shortDescription_en,
                  product.shortDescription_th,
                )}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Section 4b · Specs ─────────────────────────────────── */}
      <section id="specs" className="bg-graphite-50">
        <Container className="py-10">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.specs.heading}
            </h2>
            {product.specs && product.specs.length > 0 ? (
              <table className="w-full text-left">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-graphite-50"}
                    >
                      <td className="text-body text-graphite-800 px-4 py-2.5 font-medium">
                        {localized(s.label_en, s.label_th)}
                      </td>
                      <td className="text-body text-graphite-600 px-4 py-2.5 font-mono">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-body text-graphite-600">—</p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Section 4c · Documents ─────────────────────────────── */}
      <section id="documents">
        <Container className="py-10">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.documents.heading}
            </h2>
            {docs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {docs.map((d) => (
                  <DocumentTile
                    key={d.type}
                    type={d.type}
                    title={d.title}
                    href={d.url ?? "#"}
                  />
                ))}
              </div>
            ) : (
              <p className="text-body text-graphite-600">—</p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Section 4d · Compliance ────────────────────────────── */}
      <section id="compliance" className="bg-graphite-50">
        <Container className="py-10">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.compliance.heading}
            </h2>
            {product.compliance && product.compliance.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {product.compliance.map((c) => (
                  <li key={c}>
                    <Badge variant="brand">{c}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-graphite-600">—</p>
            )}
          </div>
        </Container>
      </section>

      {/* ── Section 5 · Pairs well with ────────────────────────── */}
      {product.pairsWellWith && product.pairsWellWith.length > 0 && (
        <section>
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.pairsWellWith.heading}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.pairsWellWith.map((p) => (
                <li key={p._id}>
                  <ProductCard
                    brand={p.brand?.name}
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

      {/* ── Section 6 · Other from this brand ──────────────────── */}
      {related.length > 0 && (
        <section className="bg-graphite-50">
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.relatedBrand.heading.replace(
                "{brand}",
                product.brand?.name ?? "",
              )}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p._id}>
                  <ProductCard
                    brand={p.brand?.name}
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

      {/* ── Section 7 · Case studies using this product ────────── */}
      {projects.length > 0 && (
        <section>
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.projects.heading}
            </h2>
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

      {/* ── Section 8 · Product-level RFQ ──────────────────────── */}
      <section className="bg-white">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.rfq.heading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2">
                {t.rfq.body}
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
