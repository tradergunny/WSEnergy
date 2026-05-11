import { withLocale } from "@/lib/navigation";

export function isSafetyCategorySlug(
  _categorySlug?: string | null,
  parentSlug?: string | null,
): boolean {
  return parentSlug === "safety";
}

/**
 * Build a locale-prefixed product detail href that matches the BRIEF §5
 * URL pattern.
 *
 * Safety products → /[locale]/safety/[subcategory]/[sku]
 * Standard products → /[locale]/products/[category]/[brand]/[sku]
 */
export function productHref(
  locale: string,
  opts: {
    categorySlug?: string | null;
    parentSlug?: string | null;
    brandSlug?: string | null;
    productSlug?: string | null;
  },
): string {
  const { categorySlug, parentSlug, brandSlug, productSlug } = opts;

  if (!productSlug || !categorySlug) {
    return withLocale(locale, "/products");
  }

  if (isSafetyCategorySlug(categorySlug, parentSlug)) {
    return withLocale(locale, `/safety/${categorySlug}/${productSlug}`);
  }

  if (brandSlug) {
    return withLocale(
      locale,
      `/products/${categorySlug}/${brandSlug}/${productSlug}`,
    );
  }

  return withLocale(locale, `/products/${categorySlug}/${productSlug}`);
}

/**
 * Build a locale-prefixed category landing href.
 * Safety subcategory → /[locale]/safety/[subcategory]
 * Product category   → /[locale]/products/[category]
 */
export function categoryHref(
  locale: string,
  opts: {
    categorySlug?: string | null;
    parentSlug?: string | null;
  },
): string {
  const { categorySlug, parentSlug } = opts;
  if (!categorySlug) return withLocale(locale, "/products");
  if (isSafetyCategorySlug(categorySlug, parentSlug)) {
    return withLocale(locale, `/safety/${categorySlug}`);
  }
  return withLocale(locale, `/products/${categorySlug}`);
}
