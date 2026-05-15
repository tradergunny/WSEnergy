import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: PageProps<"/[locale]/quote/confirmation">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const resolvedSearch = await searchParams;
  const ref =
    typeof resolvedSearch?.ref === "string" ? resolvedSearch.ref : null;

  const dict = await getDictionary(locale);
  const t = dict.rfq.confirmation;

  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        {/* Check icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-success-text)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-h1 font-medium text-mist-50">{t.heading}</h1>

        {ref && (
          <p className="rounded-md bg-forest-800 px-6 py-3 font-mono text-h3 text-mist-50">
            {ref}
          </p>
        )}

        <p className="text-body-lg text-mist-400">{t.body}</p>

        {/* Fast-track strip */}
        <div className="flex w-full flex-col gap-3 rounded-xl border border-mist-800 p-5 text-left">
          <p className="text-h4 font-medium text-mist-50">
            {t.fastTrackHeading}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline-primary" size="sm" href="tel:+66-xx-xxx-xxxx">
              {dict.actions.callUs}
            </Button>
            <Button variant="outline-primary" size="sm" href="https://lin.ee/placeholder">
              {dict.actions.lineOA}
            </Button>
          </div>
        </div>

        <Button variant="secondary" href={`/${locale}/products`}>
          {t.browseCta}
        </Button>
      </div>
    </Container>
  );
}
