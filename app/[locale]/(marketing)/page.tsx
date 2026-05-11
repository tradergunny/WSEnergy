import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconShieldCheckered,
  IconBolt,
  IconBattery3,
  IconAdjustments,
  IconCpu,
  IconChargingPile,
  IconPlug,
  IconTools,
  IconCertificate,
  IconMapPin,
  IconSchool,
  IconBuildingFactory2,
  IconHome,
  IconSolarPanel,
  IconActivityHeartbeat,
  IconArrowRight,
  IconBrandLine,
  IconPhone,
} from "@tabler/icons-react";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient, urlFor } from "@/lib/sanity/client";
import {
  featuredProductsQuery,
  allCategoriesQuery,
  featuredProjectsQuery,
  latestArticlesQuery,
  homepageCertificationsQuery,
} from "@/lib/sanity/queries";
import { withLocale } from "@/lib/navigation";
import {
  productHref,
  categoryHref,
  isSafetyCategorySlug,
} from "@/lib/product-url";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/product/ProductCard";
import { CaseStudyCard } from "@/components/product/CaseStudyCard";
import { AudienceTile } from "@/components/product/AudienceTile";

/**
 * Homepage — BRIEF §6.1, all 14 sections.
 * Sections 1, 2, 14 (utility bar, main nav, footer) are rendered by the
 * locale layout. This page covers sections 3 through 13.
 *
 * Conversion rule (BRIEF §7.2): exactly one primary CTA per viewport.
 * The primary lives in section 3 (hero) and section 13 (closing band).
 * Everything in between is secondary / outline-primary / tertiary.
 */

type FeaturedProduct = {
  _id: string;
  title?: string;
  sku?: string;
  slug?: string;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  shortDescription_en?: string;
  shortDescription_th?: string;
  image?: Parameters<typeof urlFor>[0];
  brand?: { name?: string; slug?: string };
  category?: {
    title_en?: string;
    title_th?: string;
    slug?: string;
    parentSlug?: string;
  };
};

type CategoryRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  parentSlug?: string;
};

type ProjectRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  customer?: string;
  sector?: string;
  capacity?: string;
  year?: number;
  heroImage?: Parameters<typeof urlFor>[0];
};

type ArticleRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  excerpt_en?: string;
  excerpt_th?: string;
  heroImage?: Parameters<typeof urlFor>[0];
  publishedAt?: string;
};

type CertificationRow = {
  _id: string;
  name?: string;
  logo?: Parameters<typeof urlFor>[0];
};

const categoryIcon: Record<string, typeof IconBolt> = {
  inverters: IconBolt,
  "battery-storage": IconBattery3,
  optimizers: IconAdjustments,
  "micro-inverters": IconCpu,
  "ev-chargers": IconChargingPile,
  accessories: IconPlug,
  "rapid-shutdown": IconShieldCheckered,
};

const SolutionIconCi = IconBuildingFactory2;
const SolutionIconResidential = IconHome;
const SolutionIconSolarFarm = IconSolarPanel;
const SolutionIconScada = IconActivityHeartbeat;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.home;

  const [featuredProducts, categories, projects, articles, certifications] =
    await Promise.all([
      sanityClient.fetch<FeaturedProduct[]>(featuredProductsQuery),
      sanityClient.fetch<CategoryRow[]>(allCategoriesQuery),
      sanityClient.fetch<ProjectRow[]>(featuredProjectsQuery),
      sanityClient.fetch<ArticleRow[]>(latestArticlesQuery),
      sanityClient.fetch<CertificationRow[]>(homepageCertificationsQuery),
    ]);

  const productCategories = categories.filter(
    (c) => !isSafetyCategorySlug(c.slug, c.parentSlug),
  );

  const safetyFeatured = featuredProducts.filter((p) => p.exclusive).slice(0, 2);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const quoteHref = withLocale(locale, "/quote");

  return (
    <>
      {/* ── Section 3 · Hero ───────────────────────────────────── */}
      <section className="bg-graphite-900 text-graphite-50">
        <Container className="py-16 md:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-brand-200 mb-3">
                {t.hero.eyebrow}
              </p>
              <h1 className="text-h1 md:text-display text-graphite-50 font-medium">
                {t.hero.headline}
              </h1>
              <p className="text-body-lg text-graphite-200 mt-5 max-w-2xl">
                {t.hero.subhead}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" href={quoteHref}>
                  {dict.actions.requestQuote}
                </Button>
                <Link
                  href={withLocale(locale, "/safety/rapid-shutdown")}
                  className="text-brand-200 hover:text-brand-100 inline-flex items-center gap-1 font-medium"
                >
                  {dict.actions.exploreRapidShutdown}
                  <IconArrowRight size={16} stroke={1.5} />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="border-graphite-800 bg-graphite-800/40 flex flex-col gap-4 rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <span className="text-brand-200">
                    <IconShieldCheckered size={28} stroke={1.5} />
                  </span>
                  <p className="text-h4 text-graphite-50 font-medium">
                    {locale === "th"
                      ? "ระบบความปลอดภัยระดับโครงการ"
                      : "Project-grade safety"}
                  </p>
                </div>
                <p className="text-body text-graphite-200">
                  {t.safety.body}
                </p>
                <Link
                  href={withLocale(locale, "/safety/rapid-shutdown")}
                  className="text-brand-200 hover:text-brand-100 inline-flex items-center gap-1 text-sm font-medium"
                >
                  {dict.actions.exploreSafety}
                  <IconArrowRight size={14} stroke={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Section 4 · Trust strip ─────────────────────────────── */}
      <section className="border-graphite-200 border-y bg-white">
        <Container className="py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-eyebrow text-graphite-600">
              {t.trustStrip.label}
            </p>
            <ul className="text-body text-graphite-800 flex flex-wrap items-center gap-x-6 gap-y-2">
              {["Projoy", "Huawei", "SolaX", "KUVO", "T-SUN", "Sine Xcel", "SCU"].map(
                (name) => (
                  <li key={name}>
                    <Badge variant="brand">{name}</Badge>
                  </li>
                ),
              )}
            </ul>
          </div>
        </Container>
      </section>

      {/* ── Section 5 · Audience tiles 3-up ─────────────────────── */}
      <section>
        <Container className="py-16">
          <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
            {t.audience.heading}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AudienceTile
              primary
              icon={<IconTools size={28} stroke={1.5} />}
              title={t.audience.epcTitle}
              description={t.audience.epcDesc}
              ctaText={t.audience.epcCta}
              href={withLocale(locale, "/products")}
            />
            <AudienceTile
              icon={<IconCertificate size={28} stroke={1.5} />}
              title={t.audience.engineerTitle}
              description={t.audience.engineerDesc}
              ctaText={t.audience.engineerCta}
              href={withLocale(locale, "/resources")}
            />
            <AudienceTile
              icon={<IconShieldCheckered size={28} stroke={1.5} />}
              title={t.audience.facilityTitle}
              description={t.audience.facilityDesc}
              ctaText={t.audience.facilityCta}
              href={withLocale(locale, "/safety")}
            />
          </div>
        </Container>
      </section>

      {/* ── Section 6 · Safety (EDITORIAL) ──────────────────────── */}
      <section className="bg-graphite-50">
        <Container className="py-16 md:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Badge variant="exclusive">★ {t.safety.eyebrow}</Badge>
              <h2 className="text-h1 text-graphite-900 mt-4 max-w-md font-medium">
                {t.safety.headline}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-5 max-w-md">
                {t.safety.body}
              </p>
              <div className="mt-6">
                <Button
                  variant="outline-primary"
                  size="md"
                  href={withLocale(locale, "/safety/rapid-shutdown")}
                >
                  {t.safety.cta}
                </Button>
              </div>
            </div>
            <div className="lg:col-span-7">
              {safetyFeatured.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {safetyFeatured.map((p) => (
                    <ProductCard
                      key={p._id}
                      brand={p.brand?.name}
                      authorized={p.authorized}
                      exclusive={p.exclusive}
                      safetyCritical={p.safetyCritical}
                      image={p.image}
                      sku={p.sku}
                      title={p.title}
                      description={localized(
                        p.shortDescription_en,
                        p.shortDescription_th,
                      )}
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
                  ))}
                </div>
              ) : (
                <div className="border-graphite-200 text-graphite-600 rounded-lg border bg-white p-8">
                  <p className="text-body">
                    {locale === "th"
                      ? "ข้อมูลผลิตภัณฑ์ Rapid Shutdown กำลังจะมา"
                      : "Rapid Shutdown SKUs publishing soon."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Section 7 · Product category grid (CATALOG) 6-up ────── */}
      <section>
        <Container className="py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.categories.heading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2 max-w-xl">
                {t.categories.subhead}
              </p>
            </div>
            <Link
              href={withLocale(locale, "/products")}
              className="text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 font-medium"
            >
              {dict.actions.viewAll}
              <IconArrowRight size={16} stroke={1.5} />
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {productCategories.map((c) => {
              const Icon = categoryIcon[c.slug ?? ""] ?? IconBolt;
              return (
                <li key={c._id}>
                  <Link
                    href={categoryHref(locale, {
                      categorySlug: c.slug,
                      parentSlug: c.parentSlug,
                    })}
                    className="border-graphite-200 hover:border-brand-600 group flex h-full flex-col gap-3 rounded-lg border bg-white p-5"
                  >
                    <span className="text-brand-600">
                      <Icon size={28} stroke={1.5} />
                    </span>
                    <h3 className="text-h4 text-graphite-900 font-medium">
                      {localized(c.title_en, c.title_th)}
                    </h3>
                    <span className="text-brand-600 mt-auto inline-flex items-center gap-1 text-sm font-medium">
                      {dict.actions.viewCategory}
                      <IconArrowRight
                        size={14}
                        stroke={1.5}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ── Section 8 · Featured projects 3-up ──────────────────── */}
      {projects.length > 0 && (
        <section className="bg-graphite-50">
          <Container className="py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-h2 text-graphite-900 font-medium">
                  {t.projects.heading}
                </h2>
                <p className="text-body-lg text-graphite-600 mt-2 max-w-xl">
                  {t.projects.subhead}
                </p>
              </div>
              <Link
                href={withLocale(locale, "/projects")}
                className="text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 font-medium"
              >
                {t.projects.cta}
                <IconArrowRight size={16} stroke={1.5} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {projects.map((p) => (
                <CaseStudyCard
                  key={p._id}
                  customer={p.customer}
                  sector={p.sector}
                  capacity={p.capacity}
                  year={p.year}
                  title={localized(p.title_en, p.title_th)}
                  image={p.heroImage}
                  href={withLocale(locale, `/projects/${p.slug}`)}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Section 9 · Solutions strip 4-up ────────────────────── */}
      <section>
        <Container className="py-16">
          <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
            {t.solutions.heading}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SolutionItem
              icon={<SolutionIconCi size={28} stroke={1.5} />}
              title={t.solutions.ci}
              desc={t.solutions.ciDesc}
              href={withLocale(locale, "/solutions/commercial-industrial")}
            />
            <SolutionItem
              icon={<SolutionIconResidential size={28} stroke={1.5} />}
              title={t.solutions.residential}
              desc={t.solutions.residentialDesc}
              href={withLocale(locale, "/solutions/residential")}
            />
            <SolutionItem
              icon={<SolutionIconSolarFarm size={28} stroke={1.5} />}
              title={t.solutions.solarFarm}
              desc={t.solutions.solarFarmDesc}
              href={withLocale(locale, "/solutions/solar-farm")}
            />
            <SolutionItem
              icon={<SolutionIconScada size={28} stroke={1.5} />}
              title={t.solutions.scada}
              desc={t.solutions.scadaDesc}
              href={withLocale(locale, "/solutions/scada-monitoring")}
            />
          </div>
        </Container>
      </section>

      {/* ── Section 10 · Why WS Energy 4-up ─────────────────────── */}
      <section className="bg-graphite-50">
        <Container className="py-16">
          <h2 className="text-h2 text-graphite-900 mb-6 font-medium">
            {t.why.heading}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <WhyItem
              icon={<IconCertificate size={24} stroke={1.5} />}
              title={t.why.authorizedTitle}
              desc={t.why.authorizedDesc}
            />
            <WhyItem
              icon={<IconTools size={24} stroke={1.5} />}
              title={t.why.engineeringTitle}
              desc={t.why.engineeringDesc}
            />
            <WhyItem
              icon={<IconMapPin size={24} stroke={1.5} />}
              title={t.why.localTitle}
              desc={t.why.localDesc}
            />
            <WhyItem
              icon={<IconSchool size={24} stroke={1.5} />}
              title={t.why.trainingTitle}
              desc={t.why.trainingDesc}
            />
          </div>
        </Container>
      </section>

      {/* ── Section 11 · Resource teasers 3-up ──────────────────── */}
      <section>
        <Container className="py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 text-graphite-900 font-medium">
                {t.resources.heading}
              </h2>
              <p className="text-body-lg text-graphite-600 mt-2 max-w-xl">
                {t.resources.subhead}
              </p>
            </div>
            <Link
              href={withLocale(locale, "/resources")}
              className="text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 font-medium"
            >
              {dict.actions.viewAll}
              <IconArrowRight size={16} stroke={1.5} />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {articles.map((a) => (
                <Link
                  key={a._id}
                  href={withLocale(locale, `/resources/articles/${a.slug}`)}
                  className="border-graphite-200 hover:border-brand-600 group block rounded-lg border bg-white p-6"
                >
                  <p className="text-eyebrow text-graphite-600">
                    {t.resources.articlesCta}
                  </p>
                  <h3 className="text-h4 text-graphite-900 group-hover:text-brand-600 mt-2 font-medium">
                    {localized(a.title_en, a.title_th)}
                  </h3>
                  <p className="text-body text-graphite-600 mt-2 line-clamp-3">
                    {localized(a.excerpt_en, a.excerpt_th)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-graphite-200 text-graphite-600 rounded-lg border bg-white p-8">
              <p className="text-body">{t.resources.empty}</p>
            </div>
          )}
        </Container>
      </section>

      {/* ── Section 12 · Trust footer ───────────────────────────── */}
      <section className="border-graphite-200 border-t bg-white">
        <Container className="py-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <h2 className="text-h3 text-graphite-900 font-medium">
                {t.trustFooter.heading}
              </h2>
              <p className="text-body text-graphite-600 mt-2">
                {t.trustFooter.subhead}
              </p>
            </div>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-8">
              {certifications.length > 0 ? (
                certifications.map((c) => (
                  <li
                    key={c._id}
                    className="text-body text-graphite-800 inline-flex items-center gap-2"
                  >
                    <IconCertificate
                      size={20}
                      stroke={1.5}
                      className="text-graphite-600"
                    />
                    <span className="font-medium">{c.name}</span>
                  </li>
                ))
              ) : (
                <li className="text-body text-graphite-600">
                  TIS · IEC 60947-3 · TÜV
                </li>
              )}
            </ul>
          </div>
        </Container>
      </section>

      {/* ── Section 13 · Closing CTA band ───────────────────────── */}
      <section className="bg-brand-600 text-white">
        <Container className="py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-h2 font-medium text-white">
                {t.closing.headline}
              </h2>
              <p className="text-body-lg mt-2 text-white/80">
                {t.closing.body}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={quoteHref}
                className="bg-graphite-50 text-brand-800 hover:bg-white text-body inline-flex items-center justify-center rounded-md px-[22px] py-[12px] font-medium transition-colors"
              >
                {dict.actions.requestQuote}
              </Link>
              <a
                href="tel:+66000000000"
                className="text-body inline-flex items-center gap-2 rounded-md border border-white px-[22px] py-[12px] font-medium text-white hover:bg-white/10"
              >
                <IconPhone size={16} stroke={1.5} />
                {dict.actions.callUs}
              </a>
              <a
                href="https://line.me/"
                className="text-body inline-flex items-center gap-2 rounded-md border border-white px-[22px] py-[12px] font-medium text-white hover:bg-white/10"
              >
                <IconBrandLine size={16} stroke={1.5} />
                {dict.actions.lineOA}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function SolutionItem({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border-graphite-200 hover:border-brand-600 group flex h-full flex-col gap-3 rounded-lg border bg-white p-5"
    >
      <span className="text-brand-600">{icon}</span>
      <h3 className="text-h4 text-graphite-900 font-medium">{title}</h3>
      <p className="text-body text-graphite-600">{desc}</p>
    </Link>
  );
}

function WhyItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-brand-600">{icon}</span>
      <h3 className="text-h4 text-graphite-900 font-medium">{title}</h3>
      <p className="text-body text-graphite-600">{desc}</p>
    </div>
  );
}
