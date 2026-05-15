import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { allProjectsQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { Button } from "@/components/ui/Button";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

type ProjectRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  location?: string;
  year?: number;
  heroImage?: Parameters<typeof import("@/lib/sanity/client").urlFor>[0] | null;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.projectPages;
  return { title: t.headline, description: t.subhead, alternates: alternates("/projects") };
}

export default async function ProjectsIndexPage({
  params,
}: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.projectPages;

  const projects = await sanityClient.fetch<ProjectRow[]>(allProjectsQuery);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  return (
    <>
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex items-center gap-1">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
              {t.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{t.breadcrumbProjects}</li>
        </ol>
      </Container>

      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-mist-400 mb-3">{t.eyebrow}</p>
          <h1 className="text-display text-mist-50 font-medium">{t.headline}</h1>
          <p className="text-body-lg text-mist-400 mt-4 max-w-3xl">{t.subhead}</p>
        </Container>
      </section>

      <section>
        <Container className="py-12">
          {projects.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p._id}>
                  <CaseStudyCard
                    customer={p.customer}
                    sector={p.sector}
                    capacity={p.capacity}
                    year={p.year}
                    title={localized(p.title_en, p.title_th)}
                    image={p.heroImage}
                    href={withLocale(locale, `/projects/${p.slug}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-mist-400">{t.empty}</p>
          )}
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-forest-950">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-mist-50 font-medium">{t.detail.ctaHeading}</h2>
              <p className="text-body-lg text-mist-400 mt-2">{t.detail.ctaBody}</p>
            </div>
            <Button variant="primary" size="md" href={withLocale(locale, "/quote")}>
              {dict.actions.requestQuote}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
