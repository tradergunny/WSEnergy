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

export default async function ResidentialPage({
  params,
}: PageProps<"/[locale]/solutions/residential">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.solutions.residential;

  const [products, projects] = await Promise.all([
    sanityClient.fetch<SolutionProductRow[]>(productsByCategoriesQuery, {
      categories: [
        "inverters",
        "battery-storage",
        "micro-inverters",
        "ev-chargers",
      ],
    }),
    sanityClient.fetch<SolutionProjectRow[]>(projectsBySectorsQuery, {
      sectors: ["Residential"],
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
