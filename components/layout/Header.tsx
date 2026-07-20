import {
  NavBar,
  type NavBrand,
  type NavCategoryMeta,
} from "@/components/layout/NavBar";
import { sanityClient } from "@/lib/sanity/client";
import { productNavPanelQuery } from "@/lib/sanity/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** One row per (category, product) from productNavPanelQuery; brands repeat
 *  across a category's products and are deduped below. */
type PanelRow = {
  slug: string;
  title_en: string | null;
  title_th: string | null;
  description_en: string | null;
  description_th: string | null;
  heroImage: NavCategoryMeta["heroImage"];
  brands: NavBrand[];
};

/**
 * Header — server wrapper for the NavBar client component. Fetches the
 * Products mega-panel data from Sanity (heroImage, one-liners, brand chips
 * per category) and maps the dictionary into the label props NavBar needs.
 *
 * Async because of the Sanity fetch; Next.js dedupes it, so the cost is one
 * query per deploy/revalidation rather than per request.
 */
export async function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navLabels = dict.nav as Record<string, string>;

  // Brands come back one row per product, so dedup by slug (query already
  // orders them A→Z by name). heroImage/description stay null until an editor
  // fills them in Studio; NavBar renders graceful fallbacks.
  const rows = await sanityClient.fetch<PanelRow[]>(productNavPanelQuery);
  const productCategories: Record<string, NavCategoryMeta> = {};
  for (const row of rows) {
    const brands: NavBrand[] = [];
    for (const b of row.brands) {
      if (!brands.some((x) => x.slug === b.slug)) brands.push(b);
    }
    productCategories[row.slug] = {
      heroImage: row.heroImage,
      descriptionEn: row.description_en,
      descriptionTh: row.description_th,
      brands,
    };
  }

  return (
    <NavBar
      locale={locale}
      navLabels={navLabels}
      actionLabels={{
        requestQuote: dict.actions.requestQuote,
        callUs: dict.actions.callUs,
        lineOA: dict.actions.lineOA,
      }}
      exclusiveLabel={navLabels.exclusive ?? "Exclusive"}
      productCategories={productCategories}
    />
  );
}
