/**
 * Products index skeleton — mirrors the split hero (headline left, stats
 * right) and the category bento so the page doesn't blank while Sanity
 * resolves. Pure presentational; shapes match page.tsx section rhythm.
 */
export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-busy>
      <div className="grid animate-pulse grid-cols-1 gap-10 pt-14 pb-16 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-20">
        <div className="lg:col-span-7">
          <div className="bg-forest-800 h-4 w-32 rounded-full" />
          <div className="bg-forest-800 mt-6 h-12 w-3/4 rounded-lg" />
          <div className="bg-forest-800 mt-3 h-12 w-1/2 rounded-lg" />
          <div className="bg-forest-800/70 mt-6 h-4 w-2/3 rounded-full" />
        </div>
        <div className="lg:col-span-4 lg:col-start-9 lg:border-l lg:border-mist-800 lg:pl-10">
          <div className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="bg-forest-800 h-10 w-16 rounded-lg" />
                <div className="bg-forest-800/70 mt-2 h-3 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid animate-pulse grid-cols-1 gap-3 pb-20 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4 lg:pb-24">
        <div className="bg-forest-800 min-h-[200px] rounded-xl sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:min-h-[440px]" />
        <div className="bg-forest-800/70 min-h-[200px] rounded-xl lg:col-span-5" />
        <div className="bg-forest-800/50 min-h-[200px] rounded-xl lg:col-span-5" />
        <div className="bg-forest-800/70 min-h-[200px] rounded-xl lg:col-span-4" />
        <div className="bg-forest-800/50 min-h-[200px] rounded-xl lg:col-span-4" />
        <div className="bg-forest-800/70 min-h-[200px] rounded-xl lg:col-span-4" />
      </div>
    </div>
  );
}
