/**
 * Catalog drill-in skeleton — breadcrumb, category/brand hero, and a
 * 3-column product-card grid. Covers /products/[category] and its brand
 * and SKU children while Sanity resolves.
 */
export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-busy>
      <div className="animate-pulse pt-8">
        <div className="bg-forest-800/70 h-3 w-64 rounded-full" />
        <div className="bg-forest-800 mt-8 h-10 w-1/2 rounded-lg" />
        <div className="bg-forest-800/70 mt-4 h-4 w-2/3 rounded-full" />
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-forest-800 h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid animate-pulse grid-cols-1 gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`min-h-[320px] rounded-xl ${i % 2 ? "bg-forest-800/60" : "bg-forest-800"}`}
          />
        ))}
      </div>
    </div>
  );
}
