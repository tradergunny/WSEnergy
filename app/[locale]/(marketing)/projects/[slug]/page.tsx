import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconChevronRight, IconArrowLeft } from "@tabler/icons-react";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import { projectBySlugQuery, projectSlugsQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { withLocale } from "@/lib/navigation";
import { alternates } from "@/lib/seo";
import { productHref } from "@/lib/product-url";
import { PortableText } from "@portabletext/react";

type SanityImageRef = Parameters<typeof urlFor>[0] | undefined | null;

type Project = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  capacityKw?: number;
  location?: string;
  year?: number;
  heroImage?: SanityImageRef;
  gallery?: SanityImageRef[];
  challenge_en?: Array<{ _type: string; [key: string]: unknown }>;
  challenge_th?: Array<{ _type: string; [key: string]: unknown }>;
  solution_en?: Array<{ _type: string; [key: string]: unknown }>;
  solution_th?: Array<{ _type: string; [key: string]: unknown }>;
  results_en?: Array<{ _type: string; [key: string]: unknown }>;
  results_th?: Array<{ _type: string; [key: string]: unknown }>;
  testimonial_en?: string;
  testimonial_th?: string;
  productsUsed?: Array<{
    _id: string;
    title?: string;
    sku?: string;
    slug?: string;
    shortDescription_en?: string;
    shortDescription_th?: string;
    image?: SanityImageRef;
    brand?: { name?: string; slug?: string; logo?: SanityImageRef };
    category?: { title_en?: string; title_th?: string; slug?: string; parentSlug?: string };
  }>;
};

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await sanityClient.fetch<{ title_en?: string; title_th?: string; customer?: string } | null>(
    projectBySlugQuery,
    { slug },
  );
  if (!project) return {};
  const title = locale === "th" ? (project.title_th ?? project.title_en) : (project.title_en ?? project.title_th);
  return { title: title ?? project.customer, alternates: alternates(`/projects/${slug}`) };
}

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(projectSlugsQuery);
  return locales.flatMap((locale) =>
    slugs.map((s) => ({ locale, slug: s.slug })),
  );
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.projectPages;
  const td = t.detail;

  const project = await sanityClient.fetch<Project | null>(projectBySlugQuery, { slug });
  if (!project) notFound();

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const title = localized(project.title_en, project.title_th);
  const challenge = locale === "th" ? (project.challenge_th ?? project.challenge_en) : (project.challenge_en ?? project.challenge_th);
  const solution = locale === "th" ? (project.solution_th ?? project.solution_en) : (project.solution_en ?? project.solution_th);
  const results = locale === "th" ? (project.results_th ?? project.results_en) : (project.results_en ?? project.results_th);
  const testimonial = localized(project.testimonial_en, project.testimonial_th);

  const quoteHref = withLocale(locale, "/quote");

  const metaItems = [
    project.sector && { label: td.sector, value: project.sector },
    project.capacity && { label: td.capacity, value: project.capacity },
    project.location && { label: td.location, value: project.location },
    project.year && { label: td.year, value: String(project.year) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {/* Breadcrumb */}
      <Container as="nav" aria-label="Breadcrumb" className="pt-6">
        <ol className="text-caption text-mist-400 flex flex-wrap items-center gap-1">
          <li>
            <Link href={withLocale(locale, "/")} className="hover:text-gold-500">
              {t.breadcrumbHome}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li>
            <Link href={withLocale(locale, "/projects")} className="hover:text-gold-500">
              {t.breadcrumbProjects}
            </Link>
          </li>
          <IconChevronRight size={12} stroke={1.5} aria-hidden />
          <li className="text-mist-50">{project.customer ?? title}</li>
        </ol>
      </Container>

      {/* Hero */}
      <section className="border-mist-800 border-b">
        <Container className="py-12">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-mist-400 mb-3">{t.eyebrow}</p>
            <h1 className="text-display text-mist-50 font-medium">{title}</h1>
            {project.customer && project.customer !== title && (
              <p className="text-body-lg text-mist-400 mt-3">{project.customer}</p>
            )}
          </div>
        </Container>
      </section>

      {/* Hero image */}
      {project.heroImage && (
        <section>
          <Container className="py-8">
            <div className="bg-forest-950 relative aspect-[2/1] overflow-hidden rounded-xl">
              <Image
                src={urlFor(project.heroImage).width(1280).height(640).url()}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            </div>
          </Container>
        </section>
      )}

      {/* Meta strip */}
      {metaItems.length > 0 && (
        <section>
          <Container className="py-6">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {metaItems.map((m) => (
                <div key={m.label} className="border-mist-800 rounded-lg border p-4">
                  <dt className="text-eyebrow text-mist-400">{m.label}</dt>
                  <dd className="text-h3 text-mist-50 mt-1 font-medium">{m.value}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* Challenge / Solution / Results */}
      <section>
        <Container className="py-8">
          <div className="prose-invert prose prose-lg max-w-3xl prose-headings:text-mist-50 prose-p:text-mist-400 prose-a:text-gold-500 prose-strong:text-mist-200">
            {challenge && challenge.length > 0 && (
              <>
                <h2>{td.challenge}</h2>
                <PortableText value={challenge} />
              </>
            )}
            {solution && solution.length > 0 && (
              <>
                <h2>{td.solution}</h2>
                <PortableText value={solution} />
              </>
            )}
            {results && results.length > 0 && (
              <>
                <h2>{td.results}</h2>
                <PortableText value={results} />
              </>
            )}
          </div>
        </Container>
      </section>

      {/* Testimonial */}
      {testimonial && (
        <section className="bg-forest-950">
          <Container className="py-12">
            <div className="max-w-3xl">
              <h2 className="text-h2 text-mist-50 mb-4 font-medium">{td.testimonial}</h2>
              <blockquote className="text-body-lg text-mist-400 border-gold-500 border-l-4 pl-6 italic">
                &ldquo;{testimonial}&rdquo;
              </blockquote>
              {project.customer && (
                <p className="text-body text-mist-200 mt-3 font-medium">— {project.customer}</p>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section>
          <Container className="py-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {project.gallery.map((img, i) =>
                img ? (
                  <div key={i} className="bg-forest-950 relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(img).width(600).height(450).fit("crop").url()}
                      alt={`${title} — ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Products used */}
      {project.productsUsed && project.productsUsed.length > 0 && (
        <section className="bg-forest-950">
          <Container className="py-12">
            <h2 className="text-h2 text-mist-50 mb-6 font-medium">{td.productsUsed}</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.productsUsed.map((p) => (
                <li key={p._id}>
                  <ProductCard
                    brand={p.brand}
                    image={p.image}
                    sku={p.sku}
                    title={p.title}
                    description={localized(p.shortDescription_en, p.shortDescription_th)}
                    href={productHref(locale, {
                      categorySlug: p.category?.slug,
                      parentSlug: p.category?.parentSlug,
                      brandSlug: p.brand?.slug,
                      productSlug: p.slug,
                    })}
                    specsLabel={dict.actions.viewSpecs}
                    quoteLabel={dict.actions.requestQuote}
                    quoteHref={quoteHref}
                    authorizedLabel={dict.common.authorizedBadge}
                    exclusiveLabel={dict.common.exclusiveBadge}
                    safetyLabel={dict.common.safetyBadge}
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="bg-forest-900">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 text-mist-50 font-medium">{td.ctaHeading}</h2>
              <p className="text-body-lg text-mist-400 mt-2">{td.ctaBody}</p>
            </div>
            <Button variant="primary" size="md" href={quoteHref}>
              {dict.actions.requestQuote}
            </Button>
          </div>
        </Container>
      </section>

      {/* Back link */}
      <section className="border-mist-800 border-t">
        <Container className="py-8">
          <Link
            href={withLocale(locale, "/projects")}
            className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-2 font-medium"
          >
            <IconArrowLeft size={16} stroke={2} />
            {td.backToProjects}
          </Link>
        </Container>
      </section>
    </>
  );
}
