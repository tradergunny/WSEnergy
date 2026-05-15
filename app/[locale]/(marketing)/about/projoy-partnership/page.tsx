import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { authorizationDocsQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  IconShieldCheck,
  IconCertificate,
  IconHeadset,
  IconSchool,
  IconFileText,
  IconDownload,
  IconExternalLink,
  IconArrowRight,
} from "@tabler/icons-react";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type AuthDoc = {
  _id: string;
  title_en: string;
  title_th: string;
  url: string | null;
  thumbnail?: { asset: { _ref: string } };
};

export default async function ProjoyPartnershipPage({
  params,
}: PageProps<"/[locale]/about/projoy-partnership">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.about.projoyPartnership;

  const authDocs = await sanityClient.fetch<AuthDoc[]>(authorizationDocsQuery);

  const benefits = [
    { icon: IconShieldCheck, ...t.benefits.genuine },
    { icon: IconCertificate, ...t.benefits.warranty },
    { icon: IconHeadset, ...t.benefits.technical },
    { icon: IconSchool, ...t.benefits.training },
  ];

  const products = [
    { ...t.products.rapidShutdown, href: `/${locale}/safety/rapid-shutdown` },
    {
      ...t.products.ffSwitches,
      href: `/${locale}/safety/firefighter-safety-switches`,
    },
    { ...t.products.optimizers, href: `/${locale}/products/optimizers` },
  ];

  const l = (doc: AuthDoc) =>
    locale === "th" && doc.title_th ? doc.title_th : doc.title_en;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-mist-800">
        <Container className="py-16 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex gap-2 text-caption text-mist-400">
              <li>
                <a
                  href={`/${locale}`}
                  className="text-gold-500 transition-colors duration-150 hover:text-gold-400"
                >
                  {dict.nav.home}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a
                  href={`/${locale}/about`}
                  className="text-gold-500 transition-colors duration-150 hover:text-gold-400"
                >
                  {dict.about.breadcrumb}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-mist-400">
                {t.breadcrumb}
              </li>
            </ol>
          </nav>
          <Badge variant="exclusive">{t.hero.badge}</Badge>
          <h1 className="mt-6 text-display font-medium text-mist-50">
            {t.hero.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-mist-400">
            {t.hero.body}
          </p>
        </Container>
      </section>

      {/* Benefits */}
      <section>
        <Container className="py-16 lg:py-20">
          <h2 className="mb-10 text-h2 font-medium text-mist-50">
            {t.benefits.heading}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-lg border border-mist-800 p-7"
              >
                <b.icon
                  size={22}
                  stroke={1.5}
                  className="mb-4 text-gold-500"
                />
                <p className="text-h4 font-medium text-mist-50">
                  {b.title}
                </p>
                <p className="mt-2 text-body text-mist-400">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Authorization documents — inline previews */}
      <section className="border-t border-mist-800">
        <Container className="py-16 lg:py-20">
          <h2 className="mb-3 text-h2 font-medium text-mist-50">
            {t.authorization.heading}
          </h2>
          <p className="mb-10 max-w-2xl text-body text-mist-400">
            {t.authorization.body}
          </p>

          {authDocs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {authDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="overflow-hidden rounded-xl border border-mist-800"
                >
                  {/* Document preview area */}
                  <div className="flex min-h-[280px] flex-col items-center justify-center border-b border-mist-800 bg-forest-950 px-8 py-12">
                    {doc.thumbnail ? (
                      <img
                        src={urlFor(doc.thumbnail).width(400).quality(85).url()}
                        alt={l(doc)}
                        className="max-h-[220px] w-auto rounded border border-mist-800"
                      />
                    ) : (
                      <div className="relative flex h-40 w-[120px] flex-col items-center justify-center rounded border border-mist-800 bg-forest-800">
                        <div className="absolute right-0 top-0 h-5 w-5 border-b border-l border-mist-800 bg-forest-950" />
                        <IconFileText
                          size={32}
                          stroke={1}
                          className="text-mist-400"
                        />
                        <span className="mt-2 text-eyebrow text-mist-400">
                          PDF
                        </span>
                      </div>
                    )}
                    <p className="mt-5 text-center text-body font-medium text-mist-50">
                      {l(doc)}
                    </p>
                  </div>
                  {/* Action bar */}
                  <div className="flex items-center justify-between px-6 py-3.5">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-caption font-medium text-gold-500 transition-colors duration-150 hover:text-gold-400"
                      >
                        <IconDownload size={15} stroke={1.5} />
                        {t.authorization.viewPdf}
                      </a>
                    ) : (
                      <span className="text-caption text-mist-400">
                        {t.authorization.viewPdf}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body text-mist-400">
              {t.authorization.viewPdf}
            </p>
          )}

          <div className="mt-5">
            <a
              href="https://projoy-thai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-caption font-medium text-mist-400 transition-colors duration-150 hover:text-mist-50"
            >
              <IconExternalLink size={15} stroke={1.5} />
              {t.authorization.verifyLink}
            </a>
          </div>
        </Container>
      </section>

      {/* About Projoy */}
      <section className="border-t border-mist-800">
        <Container className="py-16 lg:py-20">
          <h2 className="mb-3 text-h2 font-medium text-mist-50">
            {t.aboutProjoy.heading}
          </h2>
          <p className="mb-8 max-w-2xl text-body text-mist-400">
            {t.aboutProjoy.body}
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.values(t.aboutProjoy.facts).map((fact) => (
              <div
                key={fact}
                className="rounded-full border border-mist-800 px-5 py-2.5 text-body font-medium text-mist-50"
              >
                {fact}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Projoy product range */}
      <section className="border-t border-mist-800">
        <Container className="py-16 lg:py-20">
          <h2 className="mb-10 text-h2 font-medium text-mist-50">
            {t.products.heading}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {products.map((p) => (
              <a
                key={p.title}
                href={p.href}
                className="group flex flex-col rounded-xl border border-mist-800 p-7 transition-colors duration-150 hover:border-gold-500"
              >
                <div className="flex items-center gap-2">
                  <p className="text-h4 font-medium text-mist-50">
                    {p.title}
                  </p>
                  {"badge" in p && p.badge && (
                    <Badge variant="exclusive">{p.badge}</Badge>
                  )}
                </div>
                <p className="mt-2 flex-1 text-body text-mist-400">
                  {p.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-caption font-medium text-gold-500">
                  {dict.actions.viewSpecs}
                  <IconArrowRight size={14} stroke={1.5} />
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-mist-800 bg-forest-950">
        <Container className="py-16 lg:py-20 text-center">
          <h2 className="text-h2 font-medium text-mist-50">
            {t.cta.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-body-lg text-mist-400">
            {t.cta.body}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href={`/${locale}/quote`}>
              {dict.actions.requestQuote}
            </Button>
            <Button variant="outline-primary" href="tel:+66870538668">
              {dict.actions.talkToEngineer}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
