import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight, IconArrowRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  rapidShutdownProductsQuery,
  rapidShutdownCertificationsQuery,
  projoyAuthorizationDocQuery,
} from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { SystemDiagram } from "@/components/diagrams/SystemDiagram";
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

export default async function RapidShutdownPage({
  params,
}: PageProps<"/[locale]/safety/rapid-shutdown">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.safety.rapidShutdown;

  const [products, certifications, projoyAuth] = await Promise.all([
    sanityClient.fetch<ProductRow[]>(rapidShutdownProductsQuery),
    sanityClient.fetch<CertRow[]>(rapidShutdownCertificationsQuery),
    sanityClient.fetch<{ authDoc?: { title?: string; url?: string } } | null>(
      projoyAuthorizationDocQuery,
    ),
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
              className="hover:text-brand-600"
            >
              {dict.productDetail.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/safety")}
              className="hover:text-brand-600"
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
            {projoyAuth?.authDoc?.url && (
              <Button
                variant="outline-primary"
                size="md"
                href={projoyAuth.authDoc.url}
              >
                {t.authDocLabel}
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* ── Section 2 · Why rapid shutdown ──────────────────────── */}
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

      {/* ── Section 4 · Interactive system diagram ──────────────── */}
      <section>
        <Container className="py-12">
          <h2 className="text-h2 text-graphite-900 mb-4 font-medium">
            {t.diagramHeading}
          </h2>
          <p className="text-body text-graphite-600 mb-6 max-w-3xl">
            {t.diagramIntro}
          </p>
          <SystemDiagram
            labels={{
              triggerShutdown: t.diagram.triggerShutdown,
              reset: t.diagram.reset,
              statusLive: t.diagram.statusLive,
              statusShutdown: t.diagram.statusShutdown,
              statusPefs: t.diagram.statusPefs,
              statusDeenergized: t.diagram.statusDeenergized,
            }}
            nodeLabels={{
              pv: t.diagram.nodePv,
              pefs: t.diagram.nodePefs,
              dc: t.diagram.nodeDc,
              control: t.diagram.nodeControl,
              inverter: t.diagram.nodeInverter,
              grid: t.diagram.nodeGrid,
            }}
          />
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
