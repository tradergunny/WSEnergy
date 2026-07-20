import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { docsByTypeQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { DocumentTile } from "@/components/product/DocumentTile";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

type DocRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  documentType?: string;
  url?: string;
  fileSize?: string;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/resources/wiring-diagrams">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.resourcePages.wiring;
  return { title: t.headline, description: t.subhead, alternates: alternates("/resources/wiring-diagrams") };
}

export default async function WiringDiagramsPage({
  params,
}: PageProps<"/[locale]/resources/wiring-diagrams">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.resourcePages.wiring;

  const [diagrams, manuals] = await Promise.all([
    sanityClient.fetch<DocRow[]>(docsByTypeQuery, { docType: "diagram" }),
    sanityClient.fetch<DocRow[]>(docsByTypeQuery, { docType: "manual" }),
  ]);

  const allDocs = [...diagrams, ...manuals];

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  return (
    <>
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex items-center gap-1">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
              {dict.resourcePages.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link href={withLocale(locale, "/resources")} className="hover:text-gold-500">
              {dict.resourcePages.breadcrumbResources}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{t.headline}</li>
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
          {allDocs.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allDocs.map((d) => (
                <li key={d._id}>
                  <DocumentTile
                    type={d.documentType === "manual" ? "manual" : "diagram"}
                    title={localized(d.title_en, d.title_th)}
                    meta={d.fileSize}
                    href={d.url}
                    unavailableLabel={dict.resourcePages.fileUnavailable}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-mist-400">{t.empty}</p>
          )}
        </Container>
      </section>
    </>
  );
}
