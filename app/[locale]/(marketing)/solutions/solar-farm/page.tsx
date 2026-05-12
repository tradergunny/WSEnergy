import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  productsByCategoriesQuery,
  projectsBySectorsQuery,
} from "@/lib/sanity/queries";
import {
  SolutionPage,
  type SolutionProductRow,
  type SolutionProjectRow,
} from "@/components/solution/SolutionPage";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SolarFarmPage({
  params,
}: PageProps<"/[locale]/solutions/solar-farm">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.solarFarm;

  const [products, projects] = await Promise.all([
    sanityClient.fetch<SolutionProductRow[]>(productsByCategoriesQuery, {
      categories: ["inverters", "rapid-shutdown", "accessories"],
    }),
    sanityClient.fetch<SolutionProjectRow[]>(projectsBySectorsQuery, {
      sectors: ["Solar Farm", "Utility"],
    }),
  ]);

  return (
    <SolutionPage
      locale={locale}
      dict={dict}
      copy={{
        eyebrow: t.eyebrow,
        headline: t.headline,
        subhead: t.subhead,
        benefitsHeading: t.benefitsHeading,
        benefits: t.benefits,
        productsHeading: t.productsHeading,
        projectsHeading: t.projectsHeading,
        ctaHeading: t.ctaHeading,
        ctaBody: t.ctaBody,
        breadcrumb: t.breadcrumb,
      }}
      products={products}
      projects={projects}
    />
  );
}
