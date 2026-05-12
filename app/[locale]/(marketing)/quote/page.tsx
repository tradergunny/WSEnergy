import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { RfqForm } from "@/components/forms/RfqForm";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function QuotePage({
  params,
}: PageProps<"/[locale]/quote">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.rfq;

  return (
    <Container className="py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex gap-2 text-caption text-graphite-400">
          <li>
            <a
              href={`/${locale}`}
              className="text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              {dict.nav.home}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-graphite-600">{t.breadcrumb}</li>
        </ol>
      </nav>

      {/* Intro */}
      <div className="mb-10 max-w-2xl">
        <h1 className="text-h1 font-medium text-graphite-900 dark:text-graphite-50">{t.heading}</h1>
        <p className="mt-2 text-body-lg text-graphite-600 dark:text-graphite-400">{t.subhead}</p>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl">
        <RfqForm dict={dict} locale={locale} />
      </div>
    </Container>
  );
}
