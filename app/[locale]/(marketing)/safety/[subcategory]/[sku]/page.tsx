import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import {
  productBySkuQuery,
  productSkuTuplesQuery,
  relatedByBrandQuery,
  projectsByProductQuery,
} from "@/lib/sanity/queries";
import { withLocale } from "@/lib/navigation";
import { isSafetyCategorySlug } from "@/lib/product-url";
import {
  ProductDetail,
  type ProductDetailData,
  type RelatedProductRow,
  type ProjectRow,
} from "@/components/marketing/ProductDetail";

export async function generateStaticParams() {
  const rows = await sanityClient.fetch<
    {
      sku: string;
      category: string;
      brand: string;
      parentSlug: string | null;
    }[]
  >(productSkuTuplesQuery);

  return rows
    .filter(
      (r) => r.category && isSafetyCategorySlug(r.category, r.parentSlug),
    )
    .flatMap((r) =>
      locales.map((locale) => ({
        locale,
        subcategory: r.category,
        sku: r.sku,
      })),
    );
}

export default async function SafetyProductDetailPage({
  params,
}: PageProps<"/[locale]/safety/[subcategory]/[sku]">) {
  const { locale, sku } = await params;
  if (!hasLocale(locale)) notFound();

  const product = await sanityClient.fetch<ProductDetailData | null>(
    productBySkuQuery,
    { sku },
  );
  if (!product) notFound();
  if (
    !isSafetyCategorySlug(product.category?.slug, product.category?.parentSlug)
  ) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const t = dict.productDetail;

  const [related, projects] = await Promise.all([
    product.brand?.slug
      ? sanityClient.fetch<RelatedProductRow[]>(relatedByBrandQuery, {
          brand: product.brand.slug,
          sku,
        })
      : Promise.resolve([]),
    sanityClient.fetch<ProjectRow[]>(projectsByProductQuery, {
      productId: product._id,
    }),
  ]);

  const localized = (en?: string, th?: string) =>
    locale === "th" ? (th ?? en ?? "") : (en ?? th ?? "");

  const categoryTitle = localized(
    product.category?.title_en,
    product.category?.title_th,
  );

  return (
    /* Counter-zoom: cancels html's global zoom: 0.8125 so this route renders
       at its original tuning. 1 / 0.8125 ≈ 1.2308. */
    <div style={{ zoom: 1.2308 }}>
      <ProductDetail
        product={product}
        related={related}
        projects={projects}
        breadcrumbs={[
          { label: t.breadcrumbHome, href: withLocale(locale, "/") },
          { label: t.breadcrumbSafety, href: withLocale(locale, "/safety") },
          {
            label: categoryTitle,
            href: withLocale(locale, `/safety/${product.category?.slug ?? ""}`),
          },
          { label: product.title ?? product.sku ?? "" },
        ]}
        locale={locale}
        dict={{
          actions: dict.actions as Record<string, string>,
          common: dict.common as Record<string, string>,
        }}
        t={t}
      />
    </div>
  );
}
