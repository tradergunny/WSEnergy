import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconFileText,
  IconFileCode,
  IconCertificate,
  IconSchool,
  IconArticle,
  IconChevronRight,
} from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const sections = [
  { key: "datasheets", href: "/resources/datasheets", Icon: IconFileText },
  { key: "wiring", href: "/resources/wiring-diagrams", Icon: IconFileCode },
  { key: "standards", href: "/resources/standards-compliance", Icon: IconCertificate },
  { key: "workshop", href: "/resources/workshop-training", Icon: IconSchool },
  { key: "articles", href: "/resources/articles", Icon: IconArticle },
] as const;

type SectionKey = (typeof sections)[number]["key"];

const titleKey: Record<SectionKey, "datasheetsTitle" | "wiringTitle" | "standardsTitle" | "workshopTitle" | "articlesTitle"> = {
  datasheets: "datasheetsTitle",
  wiring: "wiringTitle",
  standards: "standardsTitle",
  workshop: "workshopTitle",
  articles: "articlesTitle",
};

const descKey: Record<SectionKey, "datasheetsDesc" | "wiringDesc" | "standardsDesc" | "workshopDesc" | "articlesDesc"> = {
  datasheets: "datasheetsDesc",
  wiring: "wiringDesc",
  standards: "standardsDesc",
  workshop: "workshopDesc",
  articles: "articlesDesc",
};

export async function generateMetadata({ params }: PageProps<"/[locale]/resources">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.resourcePages.hub;
  return { title: t.headline, description: t.subhead, alternates: alternates("/resources") };
}

export default async function ResourcesHubPage({
  params,
}: PageProps<"/[locale]/resources">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.resourcePages.hub;

  return (
    <>
      {/* Breadcrumb */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex items-center gap-1">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
              {dict.resourcePages.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{dict.resourcePages.breadcrumbResources}</li>
        </ol>
      </Container>

      {/* Hero */}
      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <p className="text-eyebrow text-mist-400 mb-3">{t.eyebrow}</p>
          <h1 className="text-display text-mist-50 font-medium">{t.headline}</h1>
          <p className="text-body-lg text-mist-400 mt-4 max-w-3xl">{t.subhead}</p>
        </Container>
      </section>

      {/* Section cards */}
      <section>
        <Container className="py-12">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map(({ key, href, Icon }) => (
              <li key={key}>
                <Link
                  href={withLocale(locale, href)}
                  className="group border-mist-800 hover:border-gold-500 bg-forest-800 flex flex-col gap-3 rounded-xl border p-6 transition-colors"
                >
                  <span className="text-mist-400 group-hover:text-gold-500 transition-colors">
                    <Icon size={28} stroke={1.5} />
                  </span>
                  <h2 className="text-h3 text-mist-50 font-medium">
                    {t[titleKey[key]]}
                  </h2>
                  <p className="text-body text-mist-400">{t[descKey[key]]}</p>
                  <span className="text-gold-500 text-body mt-auto flex items-center gap-1 font-medium">
                    {dict.resourcePages.viewAll}
                    <IconChevronRight size={16} stroke={2} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
