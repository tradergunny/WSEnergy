import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconBolt,
  IconBattery3,
  IconAdjustments,
  IconCpu,
  IconChargingPile,
  IconPlug,
  IconShieldCheckered,
  IconArrowRight,
} from "@tabler/icons-react";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { allCategoriesQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";
import { categoryHref, isSafetyCategorySlug } from "@/lib/product-url";
import { alternates } from "@/lib/seo";

type CategoryRow = {
  _id: string;
  title_en?: string;
  title_th?: string;
  slug?: string;
  parentSlug?: string;
};

const iconFor: Record<string, typeof IconBolt> = {
  inverters: IconBolt,
  "battery-storage": IconBattery3,
  optimizers: IconAdjustments,
  "micro-inverters": IconCpu,
  "ev-chargers": IconChargingPile,
  accessories: IconPlug,
  "rapid-shutdown": IconShieldCheckered,
};

export async function generateMetadata({ params }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.products.indexTitle, description: dict.products.indexSubhead, alternates: alternates("/products") };
}

export default async function ProductsIndexPage({
  params,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const t = dict.products;

  const categories = await sanityClient.fetch<CategoryRow[]>(
    allCategoriesQuery,
  );
  const productCategories = categories.filter(
    (c) => !isSafetyCategorySlug(c.slug, c.parentSlug),
  );

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  return (
    <Container as="section" className="py-16">
      <p className="text-eyebrow text-mist-400 mb-2">{t.indexEyebrow}</p>
      <h1 className="text-h1 text-mist-50 font-medium">{t.indexTitle}</h1>
      <p className="text-body-lg text-mist-400 mt-3 max-w-2xl">
        {t.indexSubhead}
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {productCategories.map((c) => {
          const Icon = iconFor[c.slug ?? ""] ?? IconBolt;
          return (
            <li key={c._id}>
              <Link
                href={categoryHref(locale, {
                  categorySlug: c.slug,
                  parentSlug: c.parentSlug,
                })}
                className="border-mist-800 hover:border-gold-500 group flex h-full flex-col gap-3 rounded-xl border bg-forest-800 p-6"
              >
                <span className="text-gold-500">
                  <Icon size={28} stroke={1.5} />
                </span>
                <h2 className="text-h3 text-mist-50 font-medium">
                  {localized(c.title_en, c.title_th)}
                </h2>
                <span className="text-gold-500 mt-auto inline-flex items-center gap-1 text-sm font-medium">
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
  );
}
