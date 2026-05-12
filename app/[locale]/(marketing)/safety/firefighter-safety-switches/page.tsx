import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  firefighterProductsQuery,
  rapidShutdownCertificationsQuery,
} from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { withLocale } from "@/lib/navigation";
import { productHref } from "@/lib/product-url";
import type { urlFor } from "@/lib/sanity/client";

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

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
  brand?: { name?: string; slug?: string };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

type CertRow = {
  _id: string;
  name?: string;
  logo?: SanityImageRef;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FirefighterSwitchesPage({
  params,
}: PageProps<"/[locale]/safety/firefighter-safety-switches">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.safety.firefighterSwitches;

  const [products, certifications] = await Promise.all([
    sanityClient.fetch<ProductRow[]>(firefighterProductsQuery),
    sanityClient.fetch<CertRow[]>(rapidShutdownCertificationsQuery),
  ]);

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
              className="hover:text-safety-600"
            >
              {dict.productDetail.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/safety")}
              className="hover:text-safety-600"
            >
              {dict.productDetail.breadcrumbSafety}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-graphite-800">{t.headline}</li>
        </ol>
      </Container>

      {/* ── Section 1 · Hero ────────────────────────────────────── */}
      <section className="border-safety-200 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-safety-600 mb-3">{t.eyebrow}</p>
          <h1 className="text-display text-graphite-900 font-medium">
            {t.headline}
          </h1>
          <p className="text-body-lg text-graphite-600 mt-4 max-w-3xl">
            {t.subhead}
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

      {/* ── Section 2 · Why firefighter switches ────────────────── */}
      <section>
        <Container className="py-12">
          <h2 className="text-h2 text-graphite-900 mb-4 font-medium">
            {t.whyHeading}
          </h2>
          <p className="text-body-lg text-graphite-600 max-w-3xl">
            {t.whyBody}
          </p>
        </Container>
      </section>

      {/* ── Section 3 · Products ────────────────────────────────── */}
      <section className="bg-graphite-50">
        <Container className="py-12">
          <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
            {t.productsHeading}
          </h2>
          {products.length > 0 ? (
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
          ) : (
            <p className="text-body text-graphite-600">—</p>
          )}
        </Container>
      </section>

      {/* ── Section 4 · Disconnect installation diagram ─────────── */}
      <section>
        <Container className="py-12">
          <h2 className="text-h2 text-graphite-900 mb-4 font-medium">
            {t.diagramHeading}
          </h2>
          <p className="text-body text-graphite-600 mb-6 max-w-3xl">
            {t.diagramIntro}
          </p>
          <div className="border-graphite-200 bg-graphite-50 rounded-lg border p-6">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 820 320"
                className="block min-w-[820px] w-full h-auto"
                role="img"
                aria-label={t.diagramHeading}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Ground line */}
                <line
                  x1={40}
                  y1={280}
                  x2={780}
                  y2={280}
                  stroke="#5f5e5a"
                  strokeWidth={1}
                />

                {/* Building outline */}
                <rect
                  x={120}
                  y={110}
                  width={360}
                  height={170}
                  fill="#f8f8f7"
                  stroke="#d3d1c7"
                  strokeWidth={1}
                />
                {/* Roof / array */}
                <polygon
                  points="120,110 300,40 480,110"
                  fill="#f1efe8"
                  stroke="#d3d1c7"
                  strokeWidth={1}
                />
                {/* PV array tiles on the roof */}
                <g stroke="#888780" strokeWidth={1} fill="#e6f1fb">
                  <polygon points="180,98 240,68 290,68 240,98" />
                  <polygon points="300,98 360,68 410,68 360,98" />
                </g>

                {/* DC line from roof into building */}
                <line
                  x1={300}
                  y1={110}
                  x2={300}
                  y2={200}
                  stroke="#5f5e5a"
                  strokeWidth={2}
                />
                {/* Bend toward exterior switch */}
                <line
                  x1={300}
                  y1={200}
                  x2={540}
                  y2={200}
                  stroke="#5f5e5a"
                  strokeWidth={2}
                />

                {/* Disconnect switch (outside the building) */}
                <rect
                  x={540}
                  y={170}
                  width={76}
                  height={64}
                  rx={6}
                  fill="#fcebeb"
                  stroke="#a32d2d"
                  strokeWidth={2}
                />
                <text
                  x={578}
                  y={196}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={10}
                  fontWeight={500}
                  fill="#a32d2d"
                >
                  DISCONNECT
                </text>
                <text
                  x={578}
                  y={214}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={10}
                  fill="#791f1f"
                >
                  PEFS-EL
                </text>

                {/* Line continues to inverter/grid */}
                <line
                  x1={616}
                  y1={202}
                  x2={720}
                  y2={202}
                  stroke="#5f5e5a"
                  strokeWidth={2}
                />
                <rect
                  x={720}
                  y={180}
                  width={56}
                  height={44}
                  rx={4}
                  fill="#f8f8f7"
                  stroke="#d3d1c7"
                  strokeWidth={1}
                />
                <text
                  x={748}
                  y={206}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={10}
                  fontWeight={500}
                  fill="#1a1a19"
                >
                  Inverter
                </text>

                {/* Callouts */}
                <text
                  x={300}
                  y={30}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                  fontWeight={500}
                  fill="#1a1a19"
                >
                  {t.diagramLabels.rooftopArray}
                </text>
                <text
                  x={300}
                  y={170}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                  fill="#5f5e5a"
                >
                  {t.diagramLabels.building}
                </text>
                <text
                  x={578}
                  y={258}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                  fontWeight={500}
                  fill="#a32d2d"
                >
                  {t.diagramLabels.disconnect}
                </text>
                <text
                  x={578}
                  y={274}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={10}
                  fill="#5f5e5a"
                >
                  {t.diagramLabels.disconnectMeta}
                </text>
                <text
                  x={40}
                  y={300}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={10}
                  fill="#888780"
                >
                  {t.diagramLabels.ground}
                </text>
              </svg>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Section 5 · Certifications ──────────────────────────── */}
      {certifications.length > 0 && (
        <section className="bg-graphite-50">
          <Container className="py-12">
            <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
              {t.certsHeading}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <li key={c._id}>
                  <Badge variant="brand">{c.name}</Badge>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ── Section 6 · CTA ─────────────────────────────────────── */}
      <section className="bg-white">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.ctaHeading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2">
                {t.ctaBody}
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
