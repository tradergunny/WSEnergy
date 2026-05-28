import Link from "next/link";
import { PortableText } from "@portabletext/react";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBattery,
  IconBolt,
  IconBoltOff,
  IconCertificate,
  IconChevronRight,
  IconClockHour3,
  IconCpu,
  IconCube,
  IconDownload,
  IconGauge,
  IconMapPin,
  IconPlugConnected,
  IconShieldBolt,
  IconShieldCheck,
  IconShieldCheckered,
  IconSolarPanel,
  IconSun,
  IconThermometer,
  IconTools,
  IconWifi,
  IconWorld,
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

const HIGHLIGHT_ICONS: Record<string, typeof IconShieldCheck> = {
  "shield-check": IconShieldCheck,
  "bolt-off": IconBoltOff,
  "plug-connected": IconPlugConnected,
  certificate: IconCertificate,
  gauge: IconGauge,
  bolt: IconBolt,
  sun: IconSun,
  battery: IconBattery,
  tools: IconTools,
  "shield-bolt": IconShieldBolt,
  thermometer: IconThermometer,
  world: IconWorld,
  clock: IconClockHour3,
  cube: IconCube,
  cpu: IconCpu,
  wifi: IconWifi,
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

type PTBlock = { _type?: string; style?: string; children?: { text?: string }[] };

function extractHeadingText(block: unknown): string {
  if (!block) return "";
  const b = block as PTBlock;
  if (b._type !== "block") return "";
  return (b.children ?? []).map((c) => c.text ?? "").join("");
}

/**
 * Split a Portable Text array into editorial sections at every heading block
 * (h1–h6). Paragraphs before the first heading become an unnumbered intro
 * section with `heading: null`.
 */
function segmentOverviewByHeading(
  blocks: unknown[],
): { heading: unknown | null; body: unknown[] }[] {
  const sections: { heading: unknown | null; body: unknown[] }[] = [];
  let current: { heading: unknown | null; body: unknown[] } | null = null;
  for (const block of blocks) {
    const b = block as PTBlock;
    const isHeading =
      b._type === "block" && typeof b.style === "string" && /^h[1-6]$/.test(b.style);
    if (isHeading) {
      if (current) sections.push(current);
      current = { heading: block, body: [] };
    } else {
      if (!current) current = { heading: null, body: [] };
      current.body.push(block);
    }
  }
  if (current) sections.push(current);
  return sections;
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
type DocRef = {
  title_en?: string;
  title_th?: string;
  fileSize?: string;
  url?: string;
} | null | undefined;

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
  highlights?: {
    icon?: string;
    title_en?: string;
    title_th?: string;
    credential_en?: string;
    credential_th?: string;
    body_en?: string;
    body_th?: string;
  }[];
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

  const highlights = product.highlights ?? [];

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

      {/* ── 3 · Feature highlight cards (icon-led, Sanity-driven) ── */}
      {highlights.length > 0 ? (
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
              {highlights.map((h, i) => {
                const Icon =
                  HIGHLIGHT_ICONS[h.icon ?? "shield-check"] ?? IconShieldCheck;
                const title = localized(h.title_en, h.title_th);
                const credential = localized(h.credential_en, h.credential_th);
                const body = localized(h.body_en, h.body_th);
                return (
                  <ScrollReveal key={i} delay={i * 0.05}>
                    <Card surface="forest">
                      <div className="flex h-full flex-col p-7 md:p-8">
                        <div className="mb-5 text-gold-500">
                          <Icon size={36} stroke={1.5} aria-hidden />
                        </div>
                        <h3 className="text-h3 font-medium tracking-tight text-mist-50">
                          {title}
                        </h3>
                        {credential ? (
                          <p className="mt-1.5 font-mono text-caption uppercase tracking-wider text-gold-500/85">
                            {credential}
                          </p>
                        ) : null}
                        {body ? (
                          <p className="text-body mt-3 text-mist-300">{body}</p>
                        ) : null}
                      </div>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 4 · Overview (editorial two-column with section numbering) ─ */}
      <ProductOverview
        overview={overview}
        locale={locale}
        heading={t.overview.heading}
      />

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

      {/* ── 9 · Documents (replaces pairs well with) ────────────── */}
      <ProductDocuments
        datasheet={product.datasheet}
        installManual={product.installManual}
        wiringDiagram={product.wiringDiagram}
        locale={locale}
        labels={t.documents}
      />

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

function ProductOverview({
  overview,
  locale,
  heading,
}: {
  overview: unknown[] | undefined;
  locale: Locale;
  heading: string;
}) {
  if (!overview || !Array.isArray(overview) || overview.length === 0) return null;

  const sections = segmentOverviewByHeading(overview);
  const hasHeadings = sections.some((s) => s.heading !== null);

  return (
    <section id="overview" className="bg-forest-900">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <ScrollReveal className="mb-12 max-w-3xl md:mb-16">
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
            {heading}
          </h2>
        </ScrollReveal>

        {hasHeadings ? (
          <div className="space-y-14 md:space-y-20">
            {sections.map((section, i) => {
              const headingText = extractHeadingText(section.heading);
              return (
                <ScrollReveal key={i} delay={0.05}>
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-5">
                      <div className="lg:sticky lg:top-24">
                        <MonoLabel tone="gold">
                          {String(i + 1).padStart(2, "0")}
                        </MonoLabel>
                        {headingText ? (
                          <h3
                            className="mt-3 font-medium tracking-tight text-mist-50"
                            style={{
                              fontSize: "clamp(20px, 2.2vw, 26px)",
                              lineHeight: 1.2,
                              letterSpacing: "-0.005em",
                            }}
                          >
                            {headingText}
                          </h3>
                        ) : null}
                      </div>
                    </div>
                    <div className="lg:col-span-7">
                      <div className="text-body-lg space-y-5 text-mist-200">
                        <PortableText value={section.body as never} />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <ScrollReveal delay={0.05}>
            <div className="text-body-lg max-w-[65ch] space-y-5 text-mist-200">
              <PortableText value={overview as never} />
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

function ProductDocuments({
  datasheet,
  installManual,
  wiringDiagram,
  locale,
  labels,
}: {
  datasheet: DocRef;
  installManual: DocRef;
  wiringDiagram: DocRef;
  locale: Locale;
  labels: {
    heading: string;
    datasheet: string;
    wiringDiagram: string;
    installManual: string;
  };
}) {
  const rows: { doc: DocRef; label: string }[] = [
    { doc: datasheet, label: labels.datasheet },
    { doc: installManual, label: labels.installManual },
    { doc: wiringDiagram, label: labels.wiringDiagram },
  ].filter((r) => r.doc?.url) as { doc: DocRef; label: string }[];

  if (rows.length === 0) return null;

  return (
    <section id="documents" className="bg-forest-950">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <ScrollReveal className="mb-10 max-w-3xl">
          <MonoLabel tone="mist">
            {locale === "th" ? "เอกสาร" : "Documents"}
          </MonoLabel>
          <h2
            className="mt-3 font-medium tracking-tight text-mist-50"
            style={{
              fontSize: "clamp(24px, 3.4vw, 36px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {labels.heading}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <Card surface="bone" className="max-w-3xl">
            <ul className="divide-y divide-forest-900/10">
              {rows.map(({ doc, label }) => {
                const subtitle =
                  locale === "th"
                    ? (doc?.title_th ?? doc?.title_en)
                    : (doc?.title_en ?? doc?.title_th);
                return (
                  <li key={label}>
                    <a
                      href={doc!.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/row flex items-center gap-4 px-6 py-5 transition-colors hover:bg-forest-900/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-body font-medium text-forest-900">
                          {label}
                        </div>
                        {subtitle && subtitle !== label ? (
                          <div className="mt-0.5 truncate font-mono text-caption text-forest-900/55">
                            {subtitle}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap font-mono text-caption text-forest-900/70 transition-colors group-hover/row:text-gold-600">
                        <IconDownload size={14} stroke={1.75} />
                        {doc?.fileSize ?? "PDF"}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Card>
        </ScrollReveal>
      </div>
    </section>
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

