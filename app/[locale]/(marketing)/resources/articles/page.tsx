import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconChevronRight } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { allArticlesQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";

type ArticleRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  excerpt_en?: string;
  excerpt_th?: string;
  heroImage?: Parameters<typeof urlFor>[0] | null;
  category?: string;
  publishedAt?: string;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/resources/articles">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.resourcePages.articles;
  return { title: t.headline, description: t.subhead, alternates: alternates("/resources/articles") };
}

export default async function ArticlesIndexPage({
  params,
}: PageProps<"/[locale]/resources/articles">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.resourcePages.articles;

  const articles = await sanityClient.fetch<ArticleRow[]>(allArticlesQuery);

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
          {articles.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a._id}>
                  <Link
                    href={withLocale(locale, `/resources/articles/${a.slug}`)}
                    className="group border-mist-800 hover:border-gold-500 bg-forest-800 flex flex-col overflow-hidden rounded-xl border transition-colors"
                  >
                    {a.heroImage && (
                      <div className="bg-forest-950 relative aspect-[16/9]">
                        <Image
                          src={urlFor(a.heroImage).width(640).height(360).url()}
                          alt={localized(a.title_en, a.title_th)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      {a.publishedAt && (
                        <time className="text-caption text-mist-400">
                          {t.publishedAt}{" "}
                          {new Date(a.publishedAt).toLocaleDateString(
                            locale === "th" ? "th-TH" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </time>
                      )}
                      <h2 className="text-h3 text-mist-50 group-hover:text-gold-500 font-medium transition-colors">
                        {localized(a.title_en, a.title_th)}
                      </h2>
                      <p className="text-body text-mist-400 line-clamp-3">
                        {localized(a.excerpt_en, a.excerpt_th)}
                      </p>
                      <span className="text-gold-500 text-body mt-auto pt-2 font-medium">
                        {t.readMore} →
                      </span>
                    </div>
                  </Link>
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
