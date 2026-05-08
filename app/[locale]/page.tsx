import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LocaleToggle } from "@/components/layout/LocaleToggle";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-graphite-200 flex items-center justify-between border-b px-6 py-4">
        <span className="text-h4 text-brand-600 font-medium">
          {dict.site.name}
        </span>
        <LocaleToggle current={locale} />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-display text-graphite-900 font-medium">
          {dict.site.name}
        </h1>
        <p className="text-body-lg text-graphite-600 mt-4 max-w-xl">
          {dict.site.tagline}
        </p>
      </section>
    </main>
  );
}
