import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { sanityClient } from "@/lib/sanity/client";
import { allProductsQuery } from "@/lib/sanity/queries";
import { Container } from "@/components/ui/Container";

/**
 * Week 3 verification page — confirms the Sanity client can fetch from
 * the dataset. Will be removed before launch. BRIEF §14.4.
 */
export const revalidate = 0;

type ProductRow = {
  _id: string;
  title: string;
  sku?: string;
  slug?: string;
  authorized?: boolean;
  exclusive?: boolean;
  safetyCritical?: boolean;
  shortDescription_en?: string;
  shortDescription_th?: string;
  brand?: { name: string; slug?: string };
  category?: { title_en?: string; title_th?: string; slug?: string };
};

export default async function TestPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  let products: ProductRow[] = [];
  let error: string | null = null;
  try {
    products = await sanityClient.fetch<ProductRow[]>(allProductsQuery);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <Container as="section" className="py-12">
      <p className="text-eyebrow text-graphite-600 mb-2">
        Week 3 · Sanity smoke test
      </p>
      <h1 className="text-h1 text-graphite-900 mb-2 font-medium">
        Sanity connection
      </h1>
      <p className="text-body-lg text-graphite-600 mb-8">
        Fetches every <code className="font-mono">product</code> document from
        the dataset.
      </p>

      {error ? (
        <div className="border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] rounded-md border p-4">
          <p className="font-medium">Fetch failed</p>
          <pre className="mt-2 text-xs whitespace-pre-wrap">{error}</pre>
        </div>
      ) : products.length === 0 ? (
        <div className="border-graphite-200 text-graphite-800 rounded-md border bg-white p-4">
          <p className="font-medium">No products yet.</p>
          <p className="text-body-lg mt-1">
            Visit <code className="font-mono">/studio</code> to seed content,
            then refresh.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((p) => (
            <li
              key={p._id}
              className="border-graphite-200 rounded-md border bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-h4 text-graphite-900 font-medium">
                  {p.title}
                </span>
                {p.sku && (
                  <span className="text-caption text-graphite-600 font-mono">
                    {p.sku}
                  </span>
                )}
                {p.brand?.name && (
                  <span className="text-eyebrow border-graphite-200 text-graphite-800 rounded-sm border px-1.5 py-0.5">
                    {p.brand.name}
                  </span>
                )}
                {p.exclusive && (
                  <span className="text-eyebrow bg-brand-50 text-brand-800 rounded-sm px-1.5 py-0.5">
                    ★ Exclusive
                  </span>
                )}
                {p.safetyCritical && (
                  <span className="text-eyebrow bg-safety-50 text-safety-800 rounded-sm px-1.5 py-0.5">
                    Safety critical
                  </span>
                )}
              </div>
              <p className="text-body text-graphite-600 mt-1">
                {locale === "th"
                  ? (p.shortDescription_th ?? p.shortDescription_en)
                  : (p.shortDescription_en ?? p.shortDescription_th)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
