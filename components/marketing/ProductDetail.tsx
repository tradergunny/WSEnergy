import Link from "next/link";
import { PortableText } from "@portabletext/react";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconChartLine,
  IconChevronRight,
  IconDownload,
  IconMapPin,
  IconShieldCheckered,
  IconSolarPanel,
} from "@tabler/icons-react";
import { urlFor } from "@/lib/sanity/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  ProductDetailHeader,
  type ProductDetailHeaderProps,
  type SpecGroup,
  type SpecGroupId,
} from "@/components/product/ProductDetailHeader";
import { productHref } from "@/lib/product-url";
import { withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

const SPEC_GROUP_ORDER: SpecGroupId[] = [
  "electrical",
  "mechanical",
  "environment",
  "compliance",
];

const SPEC_GROUP_LABELS: Record<SpecGroupId, { en: string; th: string }> = {
  electrical: { en: "Electrical", th: "ไฟฟ้า" },
  mechanical: { en: "Mechanical", th: "กลศาสตร์" },
  environment: { en: "Environment", th: "สิ่งแวดล้อม" },
  compliance: { en: "Compliance", th: "มาตรฐาน" },
};

/**
 * Split "22,500 W" → { value: "22,500", unit: "W" } so the unit can render
 * dimmer beside the number. Leaves strings without a recognisable trailing
 * unit ("Natural convection", "IP66") untouched.
 */
function splitValueUnit(raw: string): { value: string; unit?: string } {
  const m = raw.match(/^(.+?)\s+([%°A-Za-z][%°A-Za-z/]{0,4})\s*$/);
  if (m) return { value: m[1], unit: m[2] };
  return { value: raw };
}

function toHeaderProps(
  product: ProductDetailData,
  locale: Locale,
): ProductDetailHeaderProps {
  const specs = product.specs ?? [];

  // Bucket every spec into its declared group (default: electrical).
  const buckets = new Map<SpecGroupId, SpecGroup["rows"]>();
  for (const s of specs) {
    const groupId: SpecGroupId =
      (s.group as SpecGroupId | undefined) ?? "electrical";
    const split = splitValueUnit(s.value ?? "");
    const rows = buckets.get(groupId) ?? [];
    rows.push({
      label: { en: s.label_en ?? "", th: s.label_th },
      value: split.value,
      unit: split.unit,
    });
    buckets.set(groupId, rows);
  }

  // Render tabs in canonical order, only for groups that have rows.
  const specGroups: SpecGroup[] = SPEC_GROUP_ORDER.filter((g) =>
    buckets.has(g),
  ).map((g) => ({
    id: g,
    label: SPEC_GROUP_LABELS[g],
    rows: buckets.get(g)!,
  }));

  // First 4 spec rows become the hero stats. Editors control which by
  // ordering the specs array in Studio.
  const stats = specs.slice(0, 4).map((s) => {
    const split = splitValueUnit(s.value ?? "");
    return {
      label: { en: s.label_en ?? "", th: s.label_th },
      value: split.value,
      unit: split.unit,
    };
  });

  const summaryEn = product.shortDescription_en ?? "";
  const summaryTh = product.shortDescription_th;

  const classificationEn = product.category?.title_en ?? "";
  const classificationTh = product.category?.title_th;

  return {
    locale,
    mpn: product.sku ?? product.title ?? "",
    manufacturer: product.brand?.name ?? "",
    classification: { en: classificationEn, th: classificationTh },
    authorized: Boolean(product.authorized),
    authorizedNote: product.brand?.authorizedDistributor
      ? {
          en: `${product.brand.name ?? ""} authorized partner`.trim(),
          th: `ตัวแทนจำหน่าย ${product.brand.name ?? ""}`.trim(),
        }
      : undefined,
    inStock: true,
    stockLocation: "TH",
    title: product.title ?? product.sku ?? "",
    summary: { en: summaryEn, th: summaryTh },
    imageSrc: product.gallery?.[0]
      ? urlFor(product.gallery[0]).width(900).url()
      : undefined,
    imageAlt: product.title ?? product.sku,
    stats,
    specGroups,
    certifications: product.compliance ?? [],
    datasheetHref: product.datasheet?.url,
    datasheetMeta: "PDF",
    quoteHref: withLocale(locale, "/quote"),
    contactHref: withLocale(locale, "/contact"),
  };
}

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;
type DocRef = { title?: string; url?: string } | null | undefined;

export type ProductDetailData = {
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
  specs?: {
    label_en?: string;
    label_th?: string;
    value?: string;
    group?: "electrical" | "mechanical" | "environment" | "compliance";
  }[];
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
  pairsWellWith?: RelatedProductRow[];
};

export type RelatedProductRow = {
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

export type ProjectRow = {
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

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

export function ProductDetail({
  product,
  related,
  projects,
  breadcrumbs,
  locale,
  dict,
  t,
}: {
  product: ProductDetailData;
  related: RelatedProductRow[];
  projects: ProjectRow[];
  breadcrumbs: BreadcrumbCrumb[];
  locale: Locale;
  dict: {
    actions: Record<string, string>;
    common: Record<string, string>;
  };
  t: {
    overview: { heading: string };
    specs: { heading: string };
    documents: {
      heading: string;
      datasheet: string;
      wiringDiagram: string;
      installManual: string;
    };
    compliance: { heading: string };
    pairsWellWith: { heading: string };
    relatedBrand: { heading: string };
    projects: { heading: string };
    rfq: { heading: string; body: string };
    nav: {
      overview: string;
      specs: string;
      compliance: string;
      documents: string;
      pairs: string;
    };
    highlights: {
      eyebrow: string;
      heading: string;
      bankable: { title: string; subtitle: string };
      safety: { title: string; subtitle: string };
      thaiGrid: { title: string; subtitle: string };
    };
  };
}) {
  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");

  const overview =
    locale === "th"
      ? (product.overview_th ?? product.overview_en)
      : (product.overview_en ?? product.overview_th);

  const gallery = product.gallery ?? [];

  const featureCards: {
    icon: typeof IconBolt;
    title: string;
    subtitle: string;
  }[] = [
    { icon: IconChartLine, ...t.highlights.bankable },
    { icon: IconShieldCheckered, ...t.highlights.safety },
    { icon: IconBolt, ...t.highlights.thaiGrid },
  ];

  return (
    <>
      {/* ── 1 · Breadcrumb ──────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-mist-800/40 bg-forest-950"
      >
        <div className="mx-auto max-w-6xl px-6">
          <ol className="text-caption flex flex-wrap items-center gap-1 py-4 text-mist-400">
            {breadcrumbs.map((c, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="inline-flex items-center gap-1">
                  {i > 0 ? (
                    <IconChevronRight
                      size={12}
                      stroke={1.5}
                      aria-hidden
                      className="text-mist-600"
                    />
                  ) : null}
                  {c.href && !isLast ? (
                    <Link
                      href={c.href}
                      className="transition-colors hover:text-gold-500"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-mist-200" : ""}>{c.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* ── 2 · Engineering-ledger product header ───────────────── */}
      <ProductDetailHeader {...toHeaderProps(product, locale)} />

      {/* ── 3 · Feature highlight cards (image-led tall tiles) ──── */}
      <section className="bg-forest-950">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <ScrollReveal className="mb-10 max-w-3xl">
            <MonoLabel tone="gold">{t.highlights.eyebrow}</MonoLabel>
            <h2
              className="mt-3 font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(24px, 3.4vw, 36px)",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {t.highlights.heading}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card, i) => {
              const Icon = card.icon;
              const cardImage = gallery[i] ?? gallery[0];
              return (
                <ScrollReveal key={card.title} delay={i * 0.05}>
                  <Card surface="forest">
                    <div className="relative aspect-[4/5]">
                      {cardImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={urlFor(cardImage).width(800).url()}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gold-500">
                          <Icon size={64} stroke={1.25} />
                        </div>
                      )}
                      {/* Bottom-fade gradient so the title stays legible on photos */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/0 via-forest-950/10 to-forest-950/85"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-h3 font-medium tracking-tight text-mist-50">
                          {card.title}
                        </h3>
                        <p className="text-body mt-1.5 max-w-[28ch] text-mist-400">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4 · Overview (editorial) ────────────────────────────── */}
      {overview && Array.isArray(overview) && overview.length > 0 ? (
        <section id="overview" className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 max-w-3xl">
              <MonoLabel tone="mist">
                {locale === "th" ? "ภาพรวม" : "Overview"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(24px, 3.4vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.overview.heading}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <div className="text-body-lg max-w-[65ch] space-y-5 text-mist-200">
                <PortableText value={overview as never} />
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* ── 8 · Authorized distribution (brand trust) ───────────── */}
      {product.brand?.authorizedDistributor &&
      (product.brand.whyWeCarryIt_en || product.brand.whyWeCarryIt_th) ? (
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal>
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <MonoLabel tone="gold">
                    {locale === "th"
                      ? "ผู้แทนจำหน่ายอย่างเป็นทางการ"
                      : "Authorized distribution"}
                  </MonoLabel>
                  <h2
                    className="mt-3 font-medium tracking-tight text-mist-50"
                    style={{
                      fontSize: "clamp(24px, 3.4vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {locale === "th"
                      ? `เหตุผลที่เราจำหน่าย ${product.brand.name ?? ""}`
                      : `Why we carry ${product.brand.name ?? ""}.`}
                  </h2>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-body-lg text-mist-200">
                    {localized(
                      product.brand.whyWeCarryIt_en,
                      product.brand.whyWeCarryIt_th,
                    )}
                  </p>
                  {product.brand.authorizationDocument?.url ? (
                    <a
                      href={product.brand.authorizationDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-mist-400/30 px-5 py-2.5 text-body font-medium text-mist-50 transition-colors hover:bg-mist-50/5 hover:border-mist-400/60"
                    >
                      <IconDownload size={16} stroke={2} />
                      {locale === "th"
                        ? "ดาวน์โหลดหนังสือมอบอำนาจ"
                        : "Download authorization letter"}
                    </a>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* ── 9 · Pairs well with ─────────────────────────────────── */}
      {product.pairsWellWith && product.pairsWellWith.length > 0 ? (
        <section id="pairs" className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <MonoLabel tone="mist">
                  {locale === "th" ? "ใช้คู่กันได้ดี" : "Pairs well with"}
                </MonoLabel>
                <h2
                  className="mt-3 max-w-2xl font-medium tracking-tight text-mist-50"
                  style={{
                    fontSize: "clamp(24px, 3.4vw, 36px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.pairsWellWith.heading}
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {product.pairsWellWith.map((p, i) => (
                <RelatedProductCard
                  key={p._id}
                  product={p}
                  locale={locale}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 10 · Projects using this product ───────────────────── */}
      {projects.length > 0 ? (
        <section className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 max-w-3xl">
              <MonoLabel tone="gold">
                {locale === "th" ? "โครงการที่ใช้สินค้านี้" : "Used on projects"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(24px, 3.4vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.projects.heading}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <ScrollReveal key={p._id} delay={i * 0.05}>
                  <Link
                    href={withLocale(locale, `/projects/${p.slug}`)}
                    className="group/proj block overflow-hidden rounded-2xl bg-card-50 text-card-ink transition-all duration-300 hover:-translate-y-0.5"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="bg-grid-forest relative aspect-[16/9] overflow-hidden bg-card-100">
                      {p.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={urlFor(p.heroImage).width(720).url()}
                          alt={localized(p.title_en, p.title_th)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover/proj:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-forest-900/40">
                          <IconSolarPanel size={56} stroke={1.25} />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3
                        className="font-medium tracking-tight"
                        style={{ fontSize: 20, lineHeight: 1.25 }}
                      >
                        {localized(p.title_en, p.title_th)}
                      </h3>
                      {p.customer ? (
                        <p className="text-body mt-1 text-forest-900/65">
                          {p.customer}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-forest-900/10 pt-3 text-caption font-mono uppercase tracking-wider text-forest-900/70">
                        {p.sector ? (
                          <span className="inline-flex items-center gap-1.5">
                            <IconMapPin size={12} stroke={1.75} />
                            {p.sector}
                          </span>
                        ) : null}
                        {p.capacity ? (
                          <span className="inline-flex items-center gap-1.5">
                            <IconBolt size={12} stroke={1.75} />
                            {p.capacity}
                          </span>
                        ) : null}
                        {p.year ? <span>· {p.year}</span> : null}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 11 · Other from this brand ──────────────────────────── */}
      {related.length > 0 ? (
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 max-w-3xl">
              <MonoLabel tone="mist">
                {locale === "th" ? "อื่น ๆ จากแบรนด์นี้" : "More from this brand"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(24px, 3.4vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.relatedBrand.heading.replace(
                  "{brand}",
                  product.brand?.name ?? "",
                )}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <RelatedProductCard
                  key={p._id}
                  product={p}
                  locale={locale}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 12 · Closing CTA band ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-900">
        <div className="bg-grid-mist pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
          <ScrollReveal className="flex flex-col items-center text-center">
            <MonoLabel tone="gold">
              {locale === "th" ? "ขอใบเสนอราคา" : "Get a quote"}
            </MonoLabel>
            <h2
              className="mt-4 max-w-3xl font-medium tracking-tight text-mist-50"
              style={{
                fontSize: "clamp(28px, 4.5vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {t.rfq.heading}
            </h2>
            <p className="text-body-lg mt-4 max-w-xl text-mist-400">
              {t.rfq.body}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href={quoteHref}>
                {dict.actions.requestQuote}
                <IconArrowRight size={16} stroke={2} />
              </Button>
              <Link
                href={withLocale(locale, "/contact")}
                className="text-body group/btn inline-flex items-center gap-2 rounded-full border border-mist-400/30 px-[26px] py-[14px] font-medium text-mist-50 transition-colors hover:bg-mist-50/5 hover:border-mist-400/60"
              >
                {dict.actions.talkToEngineer}
                <IconArrowUpRight size={16} stroke={2} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function RelatedProductCard({
  product,
  locale,
  delay,
}: {
  product: RelatedProductRow;
  locale: Locale;
  delay: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <Link
        href={productHref(locale, {
          categorySlug: product.category?.slug,
          parentSlug: product.category?.parentSlug,
          brandSlug: product.brand?.slug,
          productSlug: product.slug,
        })}
        className="group/rel block h-full overflow-hidden rounded-2xl bg-card-50 text-card-ink transition-all duration-300 hover:-translate-y-0.5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="bg-grid-forest relative aspect-[5/4] overflow-hidden bg-card-100">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFor(product.image).width(560).url()}
              alt={product.title ?? ""}
              className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover/rel:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-forest-900/30">
              <IconShieldCheckered size={56} stroke={1.25} />
            </div>
          )}
        </div>
        <div className="p-5">
          {product.brand?.name ? (
            <p className="text-caption font-mono uppercase tracking-wider text-forest-900/50">
              {product.brand.name}
            </p>
          ) : null}
          <h3
            className="mt-1 font-medium tracking-tight"
            style={{ fontSize: 17, lineHeight: 1.3 }}
          >
            {product.title}
          </h3>
          {product.sku ? (
            <p className="mt-1 text-caption font-mono text-forest-900/60">
              {product.sku}
            </p>
          ) : null}
        </div>
      </Link>
    </ScrollReveal>
  );
}

