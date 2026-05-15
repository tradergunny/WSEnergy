import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconChevronRight, IconArrowLeft } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { articleBySlugQuery, articleSlugsQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";
import { PortableText } from "@portabletext/react";

type Article = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  excerpt_en?: string;
  excerpt_th?: string;
  body_en?: Array<{ _type: string; [key: string]: unknown }>;
  body_th?: Array<{ _type: string; [key: string]: unknown }>;
  heroImage?: Parameters<typeof urlFor>[0] | null;
  category?: string;
  publishedAt?: string;
  author?: { name?: string; role?: string };
};

export async function generateMetadata({ params }: PageProps<"/[locale]/resources/articles/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await sanityClient.fetch<{ title_en?: string; title_th?: string; excerpt_en?: string; excerpt_th?: string } | null>(
    articleBySlugQuery,
    { slug },
  );
  if (!article) return {};
  const title = locale === "th" ? (article.title_th ?? article.title_en) : (article.title_en ?? article.title_th);
  const description = locale === "th" ? (article.excerpt_th ?? article.excerpt_en) : (article.excerpt_en ?? article.excerpt_th);
  return { title, description, alternates: alternates(`/resources/articles/${slug}`) };
}

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(articleSlugsQuery);
  return locales.flatMap((locale) =>
    slugs.map((s) => ({ locale, slug: s.slug })),
  );
}

export default async function ArticleDetailPage({
  params,
}: PageProps<"/[locale]/resources/articles/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.resourcePages.articles;

  const article = await sanityClient.fetch<Article | null>(articleBySlugQuery, {
    slug,
  });

  if (!article) notFound();

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const body = locale === "th" ? (article.body_th ?? article.body_en) : (article.body_en ?? article.body_th);

  return (
    <>
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex flex-wrap items-center gap-1">
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
          <li>
            <Link href={withLocale(locale, "/resources/articles")} className="hover:text-gold-500">
              {t.headline}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">
            {localized(article.title_en, article.title_th)}
          </li>
        </ol>
      </Container>

      {/* Hero */}
      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <div className="max-w-3xl">
            {article.publishedAt && (
              <time className="text-caption text-mist-400 mb-3 block">
                {t.publishedAt}{" "}
                {new Date(article.publishedAt).toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </time>
            )}
            <h1 className="text-display text-mist-50 font-medium">
              {localized(article.title_en, article.title_th)}
            </h1>
            {article.author?.name && (
              <p className="text-body text-mist-400 mt-3">
                {article.author.name}
                {article.author.role ? ` · ${article.author.role}` : ""}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Hero image */}
      {article.heroImage && (
        <section>
          <Container className="py-8">
            <div className="bg-forest-950 relative aspect-[2/1] overflow-hidden rounded-xl">
              <Image
                src={urlFor(article.heroImage).width(1280).height(640).url()}
                alt={localized(article.title_en, article.title_th)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>
          </Container>
        </section>
      )}

      {/* Body */}
      <section>
        <Container className="py-8">
          <div className="prose-invert prose prose-lg max-w-3xl prose-headings:text-mist-50 prose-p:text-mist-400 prose-a:text-gold-500 prose-strong:text-mist-200">
            {body ? (
              <PortableText value={body} />
            ) : (
              <p className="text-mist-400">
                {localized(article.excerpt_en, article.excerpt_th)}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Back link */}
      <section className="border-mist-800 border-t">
        <Container className="py-8">
          <Link
            href={withLocale(locale, "/resources/articles")}
            className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-2 font-medium"
          >
            <IconArrowLeft size={16} stroke={2} />
            {t.backToArticles}
          </Link>
        </Container>
      </section>
    </>
  );
}
