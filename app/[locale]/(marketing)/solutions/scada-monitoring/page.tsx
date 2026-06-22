import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconCheck, IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { GsapBridge } from "@/components/marketing/GsapBridge";
import { ScadaHero } from "@/components/solution/ScadaHero";
import { ScadaArchitecture } from "@/components/solution/ScadaArchitecture";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

/**
 * SCADA, EMS & HMI — bespoke, dashboard-grade solution page.
 * A built operator-screen hero (no photo) → an interactive process-architecture
 * diagram (the signature, Monitoring/Control toggle) → the supervisory-stack
 * capabilities → the PEA Samui BESS deployment, featured → preventive
 * maintenance + HV test & commissioning services → a scoping CTA.
 * Dict-driven; reuses the GSAP/Lenis kit. Does NOT use the shared template.
 */

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/scada-monitoring">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.solutions.scadaMonitoring;
  return {
    title: t.breadcrumb,
    description: t.subhead,
    alternates: alternates("/solutions/scada-monitoring"),
  };
}

export default async function ScadaMonitoringPage({
  params,
}: PageProps<"/[locale]/solutions/scada-monitoring">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.scadaMonitoring;
  const quoteHref = withLocale(locale, "/quote");

  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className="text-caption text-mist-300 flex flex-wrap items-center gap-1">
        <li>
          <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
            {dict.productDetail.breadcrumbHome}
          </Link>
        </li>
        <IconChevronRight size={12} stroke={1.5} aria-hidden />
        <li>
          <Link
            href={withLocale(locale, "/solutions")}
            className="hover:text-gold-500"
          >
            {dict.nav.solutions}
          </Link>
        </li>
        <IconChevronRight size={12} stroke={1.5} aria-hidden />
        <li className="text-mist-50">{t.breadcrumb}</li>
      </ol>
    </nav>
  );

  return (
    <>
      <GsapBridge />

      {/* ── 1 · Dashboard hero ──────────────────────────────────── */}
      <ScadaHero
        eyebrow={t.eyebrow}
        headline={t.headline}
        subhead={t.subhead}
        statusLabel={t.hero.statusLabel}
        caption={t.hero.caption}
        tiles={t.hero.tiles}
        events={t.hero.events}
        primaryLabel={dict.actions.requestQuote}
        primaryHref={quoteHref}
        secondaryLabel={dict.actions.talkToEngineer}
        secondaryHref={quoteHref}
        breadcrumb={breadcrumb}
      />

      {/* ── 2 · Process architecture (signature) ────────────────── */}
      <ScadaArchitecture copy={t.architecture} />

      {/* ── 3 · Supervisory-stack capabilities ──────────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <MonoLabel tone="gold">{t.capabilities.eyebrow}</MonoLabel>
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 mt-4 font-medium">
          {t.capabilities.heading}
        </SplitTextReveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.capabilities.items.map((c, i) => (
            <ScrollReveal as="li" key={c.title} delay={Math.min(i * 0.05, 0.25)}>
              <div
                className="bg-card-50 text-card-ink h-full rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-7"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="bg-gold-500 h-0.5 w-8 rounded-full" />
                <h3 className="text-h4 mt-4 font-medium">{c.title}</h3>
                <p className="text-body text-card-ink/70 mt-2">{c.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </Container>

      {/* ── 4 · Featured deployment: PEA Samui BESS ─────────────── */}
      <section className="border-mist-800 border-y bg-forest-950">
        <Container className="py-16 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <MonoLabel tone="gold">{t.project.eyebrow}</MonoLabel>
              <p className="text-caption text-mist-400 mt-4 font-mono tracking-wide uppercase">
                {t.project.customer}
              </p>
              <SplitTextReveal
                as="h2"
                className="text-h2 text-mist-50 mt-2 font-medium"
              >
                {t.project.title}
              </SplitTextReveal>
              <p className="text-body-lg text-mist-400 mt-3 max-w-lg">
                {t.project.body}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <dl className="border-mist-800 bg-mist-800 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border">
                {t.project.facts.map((f) => (
                  <div key={f.label} className="bg-forest-900 p-5">
                    <dt className="text-caption text-mist-600 font-mono tracking-wide uppercase">
                      {f.label}
                    </dt>
                    <dd className="text-body text-mist-50 mt-1.5">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* ── 5 · Maintenance & commissioning services ────────────── */}
      <Container as="section" className="bg-forest-900 py-16 lg:py-24">
        <MonoLabel tone="gold">{t.services.eyebrow}</MonoLabel>
        <SplitTextReveal as="h2" className="text-h2 text-mist-50 mt-4 font-medium">
          {t.services.heading}
        </SplitTextReveal>
        <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
          {t.services.body}
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {t.services.groups.map((g, i) => (
            <ScrollReveal as="li" key={g.title} delay={Math.min(i * 0.08, 0.24)}>
              <div
                className="bg-card-50 text-card-ink h-full rounded-xl p-6 lg:p-8"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h3 className="text-h4 font-medium">{g.title}</h3>
                <ul className="mt-4 grid gap-3">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <IconCheck
                        size={18}
                        stroke={2}
                        className="text-forest-500 mt-0.5 shrink-0"
                        aria-hidden
                      />
                      <span className="text-body text-card-ink/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </Container>

      {/* ── 6 · Scoping CTA ─────────────────────────────────────── */}
      <section className="bg-forest-950">
        <Container className="py-16 lg:py-24">
          <ScrollReveal>
            <div
              className="bg-card-50 text-card-ink flex flex-wrap items-center justify-between gap-8 rounded-xl p-8 lg:p-12"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="max-w-xl">
                <h2 className="text-h2 font-medium">{t.ctaHeading}</h2>
                <p className="text-body-lg text-card-ink/70 mt-2">{t.ctaBody}</p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <Magnetic>
                  <Button variant="on-card" size="lg" href={quoteHref}>
                    {dict.actions.requestQuote}
                    <IconArrowRight
                      size={16}
                      stroke={1.5}
                      className="transition-transform group-hover/btn:translate-x-px"
                      aria-hidden
                    />
                  </Button>
                </Magnetic>
                <Link
                  href={quoteHref}
                  className="text-forest-900 font-medium underline-offset-4 hover:underline"
                >
                  {dict.actions.talkToEngineer}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
