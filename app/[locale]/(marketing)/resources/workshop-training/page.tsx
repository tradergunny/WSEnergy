import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconChevronRight, IconCalendarEvent } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/resources/workshop-training">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.resourcePages.workshop;
  return { title: t.headline, description: t.subhead, alternates: alternates("/resources/workshop-training") };
}

export default async function WorkshopTrainingPage({
  params,
}: PageProps<"/[locale]/resources/workshop-training">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.resourcePages.workshop;

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
          <div className="border-mist-800 bg-forest-800 flex flex-col items-center gap-4 rounded-xl border p-12 text-center">
            <span className="text-mist-400">
              <IconCalendarEvent size={40} stroke={1.5} />
            </span>
            <h2 className="text-h2 text-mist-50 font-medium">{t.comingSoon}</h2>
            <p className="text-body-lg text-mist-400 max-w-lg">{t.comingSoonBody}</p>
            <Button variant="primary" size="md" href={withLocale(locale, "/contact")}>
              {dict.nav.contact}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
