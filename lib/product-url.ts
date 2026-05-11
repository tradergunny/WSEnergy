import { withLocale } from "@/lib/navigation";

/**
 * Slugs that belong to the Safety section even when the seed data leaves
 * their `parent` reference empty. Keeps URLs canonical across BRIEF §5
 * before content authors finish wiring parent categories in Sanity.
 */
const SAFETY_CATEGORY_SLUGS = new Set([
  "rapid-shutdown",
  "firefighter-safety-switches",
]);

export function isSafetyCategorySlug(
  categorySlug?: string | null,
  parentSlug?: string | null,
): boolean {
  if (parentSlug === "safety") return true;
  if (categorySlug && SAFETY_CATEGORY_SLUGS.has(categorySlug)) return true;
  return false;
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
