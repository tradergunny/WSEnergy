import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/safety/why-solar-safety-matters">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.safety.whySafety;
  return { title: t.headline, description: t.subhead, alternates: alternates("/safety/why-solar-safety-matters") };
}

export default async function WhySolarSafetyMattersPage({
  params,
}: PageProps<"/[locale]/safety/why-solar-safety-matters">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.safety.whySafety;

  const quoteHref = withLocale(locale, "/quote");

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex flex-wrap items-center gap-1">
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
          <li className="text-mist-50">{t.headline}</li>
        </ol>
      </Container>

      {/* ── Section 1 · Hero ────────────────────────────────────── */}
      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-safety-600 mb-3">{t.eyebrow}</p>
          <h1 className="text-display text-mist-50 font-medium">
            {t.headline}
          </h1>
          <p className="text-body-lg text-mist-400 mt-4 max-w-3xl">
            {t.subhead}
          </p>
        </Container>
      </section>

      {/* ── Section 2 · The risk ────────────────────────────────── */}
      <section>
        <Container className="py-12">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-mist-50 mb-4 font-medium">
              {t.riskHeading}
            </h2>
            <p className="text-body-lg text-mist-400">{t.riskBody}</p>
          </div>
        </Container>
      </section>

      {/* ── Section 3 · The regulation ──────────────────────────── */}
      <section className="bg-forest-950">
        <Container className="py-12">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-mist-50 mb-4 font-medium">
              {t.regulationHeading}
            </h2>
            <p className="text-body-lg text-mist-400">
              {t.regulationBody}
            </p>
          </div>
        </Container>
      </section>

      {/* ── Section 4 · The WS Energy answer ───────────────────── */}
      <section className="border-safety-600/40 bg-safety-600/10 border-y">
        <Container className="py-12">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-mist-50 mb-4 font-medium">
              {t.wsAnswerHeading}
            </h2>
            <p className="text-body-lg text-mist-400">{t.wsAnswerBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="md"
                href={withLocale(locale, "/safety/rapid-shutdown")}
              >
                {dict.actions.exploreRapidShutdown}
              </Button>
              <Button
                variant="outline-primary"
                size="md"
                href={withLocale(
                  locale,
                  "/safety/firefighter-safety-switches",
                )}
              >
                {dict.nav.firefighterSwitches}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Section 5 · CTA ─────────────────────────────────────── */}
      <section className="bg-forest-900">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-mist-50 font-medium">
                {t.ctaHeading}
              </h2>
              <p className="text-body-lg text-mist-400 mt-2">
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
