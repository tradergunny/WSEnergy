import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const subsections = [
  {
    key: "rapidShutdown" as const,
    href: "/safety/rapid-shutdown",
    navKey: "rapidShutdown" as const,
    exclusive: true,
  },
  {
    key: "firefighterSwitches" as const,
    href: "/safety/firefighter-safety-switches",
    navKey: "firefighterSwitches" as const,
    exclusive: false,
  },
  {
    key: "whySafety" as const,
    href: "/safety/why-solar-safety-matters",
    navKey: "whySafety" as const,
    exclusive: false,
  },
];

export async function generateMetadata({ params }: PageProps<"/[locale]/safety">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.safety.indexTitle, description: dict.safety.indexSubhead, alternates: alternates("/safety") };
}

export default async function SafetyIndexPage({
  params,
}: PageProps<"/[locale]/safety">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.safety;
  const quoteHref = withLocale(locale, "/quote");

  return (
    <>
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
          <li className="text-mist-50">
            {dict.productDetail.breadcrumbSafety}
          </li>
        </ol>
      </Container>

      <section>
        <Container className="py-10">
          <h1 className="text-h1 text-mist-50 font-medium">
            {t.indexTitle}
          </h1>
          <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
            {t.indexSubhead}
          </p>
        </Container>
      </section>

      <section>
        <Container className="pb-16">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {subsections.map((s) => (
              <li key={s.key}>
                <Link
                  href={withLocale(locale, s.href)}
                  className="group border-mist-800 hover:border-safety-600 flex flex-col gap-3 rounded-xl border bg-forest-800 p-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-h3 text-mist-50 group-hover:text-safety-600 font-medium">
                      {dict.nav[s.navKey]}
                    </span>
                    {s.exclusive && (
                      <span className="text-eyebrow text-safety-600">
                        ★ Exclusive
                      </span>
                    )}
                  </div>
                  <span className="text-safety-600 mt-auto inline-flex items-center gap-1 font-medium">
                    {dict.actions.readMore}
                    <IconArrowRight size={16} stroke={1.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-forest-950">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-mist-50 font-medium">
                {t.rapidShutdown.ctaHeading}
              </h2>
              <p className="text-body-lg text-mist-400 mt-2">
                {t.rapidShutdown.ctaBody}
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
