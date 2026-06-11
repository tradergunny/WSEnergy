import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconBroadcastOff,
  IconChevronDown,
  IconChevronRight,
  IconCircuitSwitchOpen,
  IconClock,
  IconFileCertificate,
  IconPower,
  IconShieldCheck,
  IconSolarPanel,
} from "@tabler/icons-react";
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
import { CountUp } from "@/components/ui/CountUp";
import { Magnetic } from "@/components/ui/Magnetic";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { StatBlock } from "@/components/ui/StatBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { SystemDiagram } from "@/components/diagrams/SystemDiagram";
import { withLocale } from "@/lib/navigation";
import { productHref } from "@/lib/product-url";
import { alternates } from "@/lib/seo";
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
  brand?: { name?: string; slug?: string; logo?: SanityImageRef };
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

export async function generateMetadata({ params }: PageProps<"/[locale]/safety/rapid-shutdown">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.safety.rapidShutdown;
  return { title: t.headline, description: t.subhead, alternates: alternates("/safety/rapid-shutdown") };
}

const headlineClamp = {
  fontSize: "clamp(26px, 3.2vw, 40px)",
  lineHeight: 1.12,
  letterSpacing: "-0.015em",
} as const;

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

  // NEC 2017 §690.12 limits — code requirements, not marketing numbers.
  const codeStats = [
    { value: 1000, suffix: " V", label: t.stats.string, icon: <IconBolt size={28} stroke={1.5} /> },
    { value: 30, suffix: " s", label: t.stats.seconds, icon: <IconClock size={28} stroke={1.5} /> },
    { value: 30, suffix: " V", label: t.stats.outside, icon: <IconShieldCheck size={28} stroke={1.5} /> },
    { value: 80, suffix: " V", label: t.stats.inside, icon: <IconSolarPanel size={28} stroke={1.5} /> },
  ];

  const stepIcons = [
    <IconPower key="trigger" size={22} stroke={1.5} />,
    <IconBroadcastOff key="signal" size={22} stroke={1.5} />,
    <IconCircuitSwitchOpen key="isolate" size={22} stroke={1.5} />,
  ];

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex flex-wrap items-center gap-1">
          <li>
            <Link
              href={withLocale(locale, "/")}
              className="hover:text-gold-500"
            >
              {dict.productDetail.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link
              href={withLocale(locale, "/safety")}
              className="hover:text-gold-500"
            >
              {dict.productDetail.breadcrumbSafety}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{t.headline}</li>
        </ol>
      </Container>

      {/* ── 1 · Hero: asymmetric split, product photo on the canvas ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-grid-mist pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_60%_70%_at_75%_40%,black,transparent)]"
        />
        <Container className="relative py-14 md:py-20">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <MonoLabel tone="gold">{t.eyebrow}</MonoLabel>
              <SplitTextReveal
                as="h1"
                className="mt-4 font-medium tracking-tight"
                stagger={0.04}
              >
                <span
                  className="block text-mist-50"
                  style={{
                    fontSize: "clamp(34px, 4.6vw, 58px)",
                    lineHeight: 1.06,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.heroLine1}
                </span>
                <span
                  className="block text-gold-500"
                  style={{
                    fontSize: "clamp(34px, 4.6vw, 58px)",
                    lineHeight: 1.06,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.heroLine2}
                </span>
              </SplitTextReveal>
              <ScrollReveal delay={0.15}>
                <p className="text-body-lg mt-5 max-w-xl text-mist-400">
                  {t.subhead}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <Button variant="primary" size="md" href={quoteHref}>
                      {dict.actions.requestQuote}
                      <IconArrowRight size={14} stroke={2} />
                    </Button>
                  </Magnetic>
                  <Button variant="secondary" size="md" href="#how-it-works">
                    {t.heroSecondaryCta}
                    <IconArrowDown size={14} stroke={2} />
                  </Button>
                </div>
              </ScrollReveal>
            </div>

            <div className="md:col-span-5">
              <ScrollReveal delay={0.2}>
                <div className="relative mx-auto flex max-w-md items-center justify-center py-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 65% 55% at 50% 50%, color-mix(in srgb, var(--color-gold-500) 16%, transparent), transparent 72%)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/products/projoy-rapid-shutdown.png"
                    alt={
                      locale === "th"
                        ? "อุปกรณ์ Projoy PEFS Rapid Shutdown"
                        : "Projoy PEFS rapid shutdown device"
                    }
                    className="relative h-64 w-auto select-none object-contain md:h-80 lg:h-[22rem]"
                    draggable={false}
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2 · The hazard, in code numbers ─────────────────────── */}
      <section className="bg-forest-900">
        <Container className="py-20 md:py-24">
          <div className="max-w-3xl">
            <SplitTextReveal
              as="h2"
              className="font-medium tracking-tight text-mist-50"
            >
              <span className="block" style={headlineClamp}>
                {t.hazardHeading}
              </span>
            </SplitTextReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-body-lg mt-4 text-mist-400">{t.hazardBody}</p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} className="mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {codeStats.map((s) => (
                <StatBlock
                  key={s.label}
                  value={<CountUp to={s.value} suffix={s.suffix} />}
                  label={s.label}
                  icon={s.icon}
                />
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ── 3 · Fail-safe mechanism + interactive diagram ───────── */}
      <section id="how-it-works" className="scroll-mt-16 bg-forest-950">
        <Container className="py-20 md:py-24">
          <div className="max-w-3xl">
            <SplitTextReveal
              as="h2"
              className="font-medium tracking-tight text-mist-50"
            >
              <span className="block" style={headlineClamp}>
                {t.howHeading}
              </span>
            </SplitTextReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-body-lg mt-4 text-mist-400">{t.howBody}</p>
            </ScrollReveal>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Step rail */}
            <ol className="relative lg:col-span-4">
              <span
                aria-hidden="true"
                className="absolute top-5 bottom-5 left-5 w-px bg-mist-800"
              />
              {t.steps.map((step, i) => (
                <ScrollReveal as="li" key={step.title} delay={i * 0.12}>
                  <div className={`relative flex gap-5 ${i > 0 ? "mt-10" : ""}`}>
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-forest-950 text-gold-500">
                      {stepIcons[i]}
                    </span>
                    <div>
                      <h3 className="text-h3 font-medium tracking-tight text-mist-50">
                        {step.title}
                      </h3>
                      <p className="text-body mt-1.5 text-mist-400">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </ol>

            {/* Interactive diagram */}
            <ScrollReveal delay={0.2} className="lg:col-span-8">
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
              <p className="text-caption mt-3 text-mist-600">{t.diagramHint}</p>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 4 · Products (Sanity) ───────────────────────────────── */}
      <section className="bg-forest-900">
        <Container className="py-20 md:py-24">
          <div className="mb-10 max-w-3xl">
            <ScrollReveal>
              <MonoLabel tone="mist">{t.productsEyebrow}</MonoLabel>
            </ScrollReveal>
            <SplitTextReveal
              as="h2"
              className="mt-3 font-medium tracking-tight text-mist-50"
            >
              <span className="block" style={headlineClamp}>
                {t.productsHeading}
              </span>
            </SplitTextReveal>
          </div>

          {products.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <ScrollReveal as="li" key={p._id} delay={i * 0.05}>
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
                </ScrollReveal>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-mist-800/60 bg-forest-800/40 p-8 text-body text-mist-400">
              {t.productsEmpty}
            </div>
          )}
        </Container>
      </section>

      {/* ── 5 · Authorization & certifications (bone card) ──────── */}
      <section className="bg-forest-950">
        <Container className="py-20 md:py-24">
          <ScrollReveal>
            <div className="rounded-2xl bg-card-50 p-10 text-card-ink md:p-14">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                <div className={certifications.length > 0 ? "md:col-span-7" : "md:col-span-12"}>
                  <h2 className="font-medium tracking-tight" style={headlineClamp}>
                    {t.authHeading}
                  </h2>
                  <p className="text-body-lg mt-4 max-w-xl text-forest-900/70">
                    {t.authBody}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                    {projoyAuth?.authDoc?.url ? (
                      <Button
                        variant="on-card"
                        size="md"
                        href={projoyAuth.authDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconFileCertificate size={16} stroke={1.75} />
                        {t.authDocLabel}
                      </Button>
                    ) : null}
                    <Link
                      href={withLocale(locale, "/about/projoy-partnership")}
                      className="inline-flex items-center gap-1.5 text-body font-medium text-forest-900 underline-offset-4 hover:underline"
                    >
                      {t.partnerCta}
                      <IconArrowUpRight size={14} stroke={2} />
                    </Link>
                  </div>
                </div>

                {certifications.length > 0 ? (
                  <div className="md:col-span-5">
                    <p className="text-caption font-mono uppercase tracking-wider text-forest-900/55">
                      {t.certsHeading}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {certifications.map((c) => (
                        <li key={c._id}>
                          <span className="text-caption inline-flex items-center rounded-full border border-forest-900/20 px-3 py-1.5 font-mono uppercase tracking-wider text-forest-900/80">
                            {c.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ── 6 · FAQ ─────────────────────────────────────────────── */}
      <section className="bg-forest-900">
        <Container className="py-20 md:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SplitTextReveal
                as="h2"
                className="font-medium tracking-tight text-mist-50"
              >
                <span className="block" style={headlineClamp}>
                  {t.faqHeading}
                </span>
              </SplitTextReveal>
            </div>
            <ScrollReveal delay={0.1} className="lg:col-span-8">
              <div className="divide-y divide-mist-800/60">
                {t.faq.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-h4 font-medium text-mist-50 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <IconChevronDown
                        size={18}
                        stroke={1.75}
                        className="shrink-0 text-mist-400 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="text-body mt-3 max-w-2xl text-mist-400">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 7 · Closing CTA + related safety pages ──────────────── */}
      <section className="relative overflow-hidden bg-forest-950">
        <div
          aria-hidden="true"
          className="bg-grid-mist pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"
        />
        <Container className="relative py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            <ScrollReveal>
              <MonoLabel tone="gold">{t.ctaEyebrow}</MonoLabel>
            </ScrollReveal>
            <SplitTextReveal
              as="h2"
              className="mt-4 max-w-3xl font-medium tracking-tight text-mist-50"
            >
              <span
                className="block"
                style={{
                  fontSize: "clamp(30px, 4.5vw, 52px)",
                  lineHeight: 1.06,
                  letterSpacing: "-0.02em",
                }}
              >
                {t.ctaHeading}
              </span>
            </SplitTextReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-body-lg mt-5 max-w-xl text-mist-400">
                {t.ctaBody}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Magnetic>
                  <Button variant="primary" size="lg" href={quoteHref}>
                    {dict.actions.requestQuote}
                    <IconArrowRight size={16} stroke={2} />
                  </Button>
                </Magnetic>
                <Magnetic strength={0.22}>
                  <Button
                    variant="secondary"
                    size="lg"
                    href={withLocale(locale, "/contact")}
                  >
                    {dict.actions.talkToEngineer}
                    <IconArrowUpRight size={16} stroke={2} />
                  </Button>
                </Magnetic>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.35}>
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <Link
                  href={withLocale(locale, "/safety/firefighter-safety-switches")}
                  className="inline-flex items-center gap-1.5 text-body text-mist-400 transition-colors hover:text-gold-400"
                >
                  {dict.nav.firefighterSwitches}
                  <IconArrowUpRight size={14} stroke={2} />
                </Link>
                <Link
                  href={withLocale(locale, "/safety/why-solar-safety-matters")}
                  className="inline-flex items-center gap-1.5 text-body text-mist-400 transition-colors hover:text-gold-400"
                >
                  {dict.nav.whySafety}
                  <IconArrowUpRight size={14} stroke={2} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </>
  );
}
