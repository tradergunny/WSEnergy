import Link from "next/link";
import { PortableText } from "@portabletext/react";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconCertificate,
  IconChevronRight,
  IconDownload,
  IconFileText,
  IconMapPin,
  IconPlug,
  IconShieldCheckered,
  IconSolarPanel,
  IconTools,
} from "@tabler/icons-react";
import { urlFor } from "@/lib/sanity/client";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { productHref } from "@/lib/product-url";
import { withLocale } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

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

const docTypeIcon = {
  datasheet: IconFileText,
  diagram: IconPlug,
  manual: IconTools,
} as const;

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
  };
}) {
  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const displayTitle = product.title ?? product.sku ?? "";
  const quoteHref = withLocale(locale, "/quote");

  const overview =
    locale === "th"
      ? (product.overview_th ?? product.overview_en)
      : (product.overview_en ?? product.overview_th);

  const gallery = product.gallery ?? [];
  const heroImage = gallery[0];

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

  // Quick feature highlights — synthesised from compliance + specs metadata
  const compliance = product.compliance ?? [];
  const featureHighlights = buildFeatureHighlights({
    compliance,
    safetyCritical: product.safetyCritical,
    locale,
  });

  const shortDesc = localized(
    product.shortDescription_en,
    product.shortDescription_th,
  );

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

      {/* ── 2 · Hero (warm-bone with product image) ─────────────── */}
      <section className="bg-forest-900">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 lg:py-20">
          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl bg-card-50 text-card-ink">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Image panel */}
                <div className="relative bg-card-100 lg:col-span-5">
                  <div className="bg-grid-forest absolute inset-0 opacity-50" />
                  <div className="relative flex aspect-square items-center justify-center p-10 lg:aspect-auto lg:h-full">
                    {heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(heroImage).width(900).url()}
                        alt={displayTitle}
                        className="max-h-[420px] w-auto object-contain"
                      />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center rounded-full bg-forest-900 text-gold-500">
                        <IconShieldCheckered size={72} stroke={1.25} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity panel */}
                <div className="flex flex-col justify-between gap-8 p-8 md:p-12 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {product.brand?.name ? (
                        <span className="text-caption inline-flex items-center gap-1.5 rounded-full bg-forest-900/8 px-3 py-1 font-mono uppercase tracking-wider text-forest-900/70">
                          {product.brand.name}
                        </span>
                      ) : null}
                      {product.exclusive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-3 py-1 text-caption font-medium text-gold-500">
                          ★ {dict.common.exclusiveBadge}
                        </span>
                      ) : null}
                      {product.authorized ? (
                        <span className="text-caption inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1 font-medium text-forest-900">
                          ★ {dict.common.authorizedBadge}
                        </span>
                      ) : null}
                      {product.safetyCritical ? (
                        <span className="text-caption inline-flex items-center gap-1.5 rounded-full bg-safety-600 px-3 py-1 font-medium text-white">
                          {dict.common.safetyBadge}
                        </span>
                      ) : null}
                    </div>

                    <h1
                      className="mt-6 font-medium tracking-tight"
                      style={{
                        fontSize: "clamp(28px, 4vw, 44px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {displayTitle}
                    </h1>
                    {product.sku ? (
                      <p className="mt-2 text-caption font-mono uppercase tracking-wider text-forest-900/60">
                        {product.sku}
                      </p>
                    ) : null}
                    {shortDesc ? (
                      <p className="text-body-lg mt-5 max-w-lg text-forest-900/75">
                        {shortDesc}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="on-card" size="md" href={quoteHref}>
                        {dict.actions.requestQuote}
                        <IconArrowRight size={14} stroke={2} />
                      </Button>
                      {product.datasheet?.url ? (
                        <a
                          href={product.datasheet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body group/btn inline-flex items-center gap-2 rounded-full border border-forest-900/15 px-[22px] py-[12px] font-medium text-forest-900 transition-colors hover:bg-forest-900/5"
                        >
                          <IconDownload size={14} stroke={2} />
                          {locale === "th" ? "ดาวน์โหลดดาต้าชีต" : "Download datasheet"}
                        </a>
                      ) : (
                        <Link
                          href={quoteHref}
                          className="text-body group/btn inline-flex items-center gap-1.5 font-medium text-forest-900 hover:text-forest-700"
                        >
                          {dict.actions.talkToEngineer}
                          <IconArrowUpRight size={14} stroke={2} />
                        </Link>
                      )}
                    </div>

                    {/* At-a-glance mono strip */}
                    {compliance.length > 0 || product.specs?.length ? (
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-forest-900/10 pt-5 text-caption font-mono uppercase tracking-wider text-forest-900/65">
                        {compliance.slice(0, 4).map((c) => (
                          <span key={c}>· {c}</span>
                        ))}
                        {(product.specs ?? []).slice(0, 2).map((s, i) => (
                          <span key={i}>· {s.value}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3 · Feature highlights ──────────────────────────────── */}
      {featureHighlights.length > 0 ? (
        <section className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 max-w-3xl">
              <MonoLabel tone="gold">
                {locale === "th" ? "คุณสมบัติเด่น" : "Key features"}
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
                  ? "ความปลอดภัยระดับโครงการที่ผ่านการรับรอง"
                  : "Project-grade engineering, certified for Thailand."}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featureHighlights.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-mist-800/60 bg-forest-900/40 p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
                      <f.icon size={22} stroke={1.5} />
                    </div>
                    <h3 className="text-h3 mt-5 font-medium tracking-tight text-mist-50">
                      {f.title}
                    </h3>
                    <p className="text-body mt-2 text-mist-400">{f.body}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

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

      {/* ── 5 · Specs (datasheet-style table) ───────────────────── */}
      {product.specs && product.specs.length > 0 ? (
        <section id="specs" className="bg-forest-950">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal className="mb-10 max-w-3xl">
              <MonoLabel tone="gold">
                {locale === "th" ? "ข้อมูลจำเพาะ" : "Specifications"}
              </MonoLabel>
              <h2
                className="mt-3 font-medium tracking-tight text-mist-50"
                style={{
                  fontSize: "clamp(24px, 3.4vw, 36px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.specs.heading}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <div className="overflow-hidden rounded-2xl border border-mist-800/60 bg-forest-900/40">
                <dl className="divide-y divide-mist-800/60">
                  {product.specs.map((s, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-12 sm:gap-6"
                    >
                      <dt className="text-body text-mist-400 sm:col-span-5">
                        {localized(s.label_en, s.label_th)}
                      </dt>
                      <dd className="text-body font-mono text-mist-50 sm:col-span-7">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* ── 6 · Certifications wall ─────────────────────────────── */}
      {compliance.length > 0 ? (
        <section id="compliance" className="bg-forest-900">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <ScrollReveal>
              <div className="overflow-hidden rounded-2xl bg-card-50 text-card-ink">
                <div className="bg-grid-forest relative grid grid-cols-1 gap-8 p-10 md:p-14 lg:grid-cols-12">
                  <div className="relative lg:col-span-5">
                    <MonoLabel tone="forest">
                      {locale === "th" ? "การรับรองและมาตรฐาน" : "Certified & compliant"}
                    </MonoLabel>
                    <h2
                      className="mt-4 font-medium tracking-tight"
                      style={{
                        fontSize: "clamp(22px, 3vw, 32px)",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t.compliance.heading}
                    </h2>
                    <p className="text-body mt-4 max-w-md text-forest-900/65">
                      {locale === "th"
                        ? "ผ่านการรับรองมาตรฐานสากลและตอบสนองข้อกำหนดทางวิศวกรรมของไทย"
                        : "Backed by international certifications and the engineering codes Thai EPCs are spec'ing today."}
                    </p>
                  </div>

                  <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
                    {compliance.map((c) => (
                      <div
                        key={c}
                        className="flex items-center justify-center rounded-xl border border-forest-900/10 bg-card-100/50 px-4 py-5 text-center"
                      >
                        <div>
                          <IconCertificate
                            size={20}
                            stroke={1.5}
                            className="mx-auto text-forest-900/50"
                          />
                          <p className="mt-2 text-caption font-mono uppercase tracking-wider text-forest-900/80">
                            {c}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* ── 7 · Documents downloads ─────────────────────────────── */}
      {docs.length > 0 ? (
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
                {t.documents.heading}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {docs.map((d, i) => {
                const Icon = docTypeIcon[d.type];
                return (
                  <ScrollReveal key={d.type} delay={i * 0.05}>
                    <a
                      href={d.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/doc flex h-full items-start gap-4 rounded-xl border border-mist-800/60 bg-forest-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-mist-800 hover:bg-forest-900/70"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
                        <Icon size={20} stroke={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-caption font-mono uppercase tracking-wider text-mist-400">
                          PDF
                        </p>
                        <h3 className="text-h4 mt-1 font-medium text-mist-50">
                          {d.title}
                        </h3>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-body font-medium text-gold-500">
                          {locale === "th" ? "ดาวน์โหลด" : "Download"}
                          <IconDownload size={14} stroke={2} />
                        </span>
                      </div>
                    </a>
                  </ScrollReveal>
                );
              })}
            </div>
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
        <section className="bg-forest-950">
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
  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

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

function buildFeatureHighlights({
  compliance,
  safetyCritical,
  locale,
}: {
  compliance: string[];
  safetyCritical?: boolean;
  locale: Locale;
}) {
  const items: { icon: typeof IconBolt; title: string; body: string }[] = [];
  const has = (substr: string) =>
    compliance.some((c) => c.toLowerCase().includes(substr.toLowerCase()));

  if (safetyCritical || has("rapid") || has("UL3741")) {
    items.push({
      icon: IconShieldCheckered,
      title: locale === "th" ? "ระบบหยุดฉุกเฉินระดับโมดูล" : "Module-level rapid shutdown",
      body:
        locale === "th"
          ? "ตัดวงจร PV ที่แผงภายในไม่กี่วินาที — ป้องกันนักดับเพลิงและตอบสนองมาตรฐานสากล"
          : "De-energizes PV strings at the panel within seconds — protecting firefighters and satisfying modern codes.",
    });
  }
  if (has("UL94") || has("V0")) {
    items.push({
      icon: IconBolt,
      title: locale === "th" ? "วัสดุหน่วงไฟ UL94-V0" : "Flame retardant UL94-V0",
      body:
        locale === "th"
          ? "วัสดุภายในผ่านมาตรฐานหน่วงไฟระดับสูงสุดของอุตสาหกรรม"
          : "Housing materials meet the industry's strictest flame-retardant grade.",
    });
  }
  if (has("IP6") || has("NEMA")) {
    items.push({
      icon: IconPlug,
      title: locale === "th" ? "ปกป้องระดับ IP66 / NEMA 4X" : "IP66 / NEMA 4X ingress",
      body:
        locale === "th"
          ? "ปิดผนึกกันฝุ่นและน้ำสำหรับการติดตั้งกลางแจ้ง"
          : "Sealed against dust and water for unprotected outdoor installation.",
    });
  }
  if (has("IEC") || has("TIS") || compliance.length > 0) {
    items.push({
      icon: IconCertificate,
      title: locale === "th" ? "ผ่านมาตรฐานสากล" : "Internationally certified",
      body:
        locale === "th"
          ? `รับรองโดย ${compliance.slice(0, 3).join(" · ") || "หน่วยงานสากล"} และมาตรฐานวิศวกรรมไฟฟ้าไทย`
          : `Certified by ${compliance.slice(0, 3).join(" · ") || "international standards bodies"} and compliant with Thai electrical codes.`,
    });
  }

  return items.slice(0, 4);
}
