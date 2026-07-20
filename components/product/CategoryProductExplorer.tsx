"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconFilter, IconX } from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { BrandLogoBadge } from "@/components/ui/BrandLogoBadge";
import {
  ProductCard,
  type ProductCardProps,
} from "@/components/product/ProductCard";
import {
  KW_BUCKETS,
  matchesKwBucket,
  type Phase,
  type ProductFacets,
} from "@/lib/product-facets";

/**
 * CategoryProductExplorer — the wired filter bar + brand-grouped grid for
 * /products/[category]. Replaces the inert chip row from the launch build.
 *
 * Follows the InstallersDirectory interaction grammar: filter state lives
 * in the URL (?brand=a,b&kw=lte10&phase=three) so filtered views are
 * shareable, active pills fill gold, and the no-match state offers a
 * one-click clear. Facet rows self-hide when the category's data can't
 * support them (no rated products → no kW row; single-phase-only category
 * → no phase row), so sparse categories never show dead controls.
 */

type Locale = "en" | "th";

export type ExplorerProduct = {
  _id: string;
  brandSlug: string | null;
  facets: ProductFacets;
  card: ProductCardProps;
};

type SanityImageRef = NonNullable<ProductCardProps["brand"]>["logo"];

export type ExplorerGroup = {
  brand: {
    _id: string;
    name?: string;
    slug?: string;
    authorizedDistributor?: boolean;
    logo?: SanityImageRef;
  };
  products: ExplorerProduct[];
};

export type FilterLabels = {
  heading: string;
  brand: string;
  kwRange: string;
  phase: string;
};

export function CategoryProductExplorer({
  groups,
  locale,
  labels,
  authorizedBadgeLabel,
}: {
  groups: ExplorerGroup[];
  locale: Locale;
  labels: FilterLabels;
  authorizedBadgeLabel: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrands = useMemo(
    () => csvSet(searchParams.get("brand")),
    [searchParams],
  );
  const selectedKw = useMemo(
    () => csvSet(searchParams.get("kw")),
    [searchParams],
  );
  const selectedPhase = searchParams.get("phase") as Phase | null;

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const toggleCsv = (key: "brand" | "kw", value: string) =>
    updateParams((p) => {
      const current = csvSet(p.get(key));
      if (current.has(value)) current.delete(value);
      else current.add(value);
      if (current.size === 0) p.delete(key);
      else p.set(key, Array.from(current).join(","));
    });

  const setPhase = (value: Phase) =>
    updateParams((p) => {
      if (p.get("phase") === value) p.delete("phase");
      else p.set("phase", value);
    });

  const clearFilters = () =>
    updateParams((p) => {
      p.delete("brand");
      p.delete("kw");
      p.delete("phase");
    });

  const allProducts = useMemo(() => groups.flatMap((g) => g.products), [groups]);

  // ── Facet-row visibility: never render controls the data can't answer ──
  const brandRow = groups.length >= 2;
  const ratedCount = allProducts.filter((p) => p.facets.kwMin !== null).length;
  const activeBuckets = KW_BUCKETS.filter((b) =>
    allProducts.some((p) => matchesKwBucket(p.facets, b)),
  );
  const kwRow = ratedCount >= 2 && activeBuckets.length >= 2;
  const phases = new Set(
    allProducts.map((p) => p.facets.phase).filter(Boolean),
  );
  const phaseRow = phases.size === 2;
  const hasAnyRow = brandRow || kwRow || phaseRow;

  // ── Apply filters ──────────────────────────────────────────────────────
  const matches = useCallback(
    (p: ExplorerProduct) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brandSlug ?? ""))
        return false;
      if (selectedKw.size > 0) {
        const hit = KW_BUCKETS.some(
          (b) => selectedKw.has(b.id) && matchesKwBucket(p.facets, b),
        );
        if (!hit) return false;
      }
      if (selectedPhase && p.facets.phase !== selectedPhase) return false;
      return true;
    },
    [selectedBrands, selectedKw, selectedPhase],
  );

  const filteredGroups = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, products: g.products.filter(matches) }))
        .filter((g) => g.products.length > 0),
    [groups, matches],
  );

  const resultCount = filteredGroups.reduce(
    (sum, g) => sum + g.products.length,
    0,
  );
  const hasFilters =
    selectedBrands.size > 0 || selectedKw.size > 0 || selectedPhase !== null;

  const kwLabel = (id: string) =>
    ({
      lte10: "≤ 10 kW",
      "10-50": "10–50 kW",
      "50-150": "50–150 kW",
      gt150: "150+ kW",
    })[id] ?? id;

  const phaseLabel = (p: Phase) =>
    locale === "th"
      ? p === "single"
        ? "1 เฟส"
        : "3 เฟส"
      : p === "single"
        ? "Single-phase"
        : "Three-phase";

  const productCountLabel = (n: number) =>
    locale === "th" ? `${n} สินค้า` : `${n} ${n === 1 ? "product" : "products"}`;

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────────── */}
      {hasAnyRow && (
        <section className="border-mist-800 border-y bg-forest-950">
          <Container className="py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-eyebrow text-mist-400 inline-flex items-center gap-2">
                <IconFilter size={12} stroke={1.75} aria-hidden />
                {labels.heading}
              </span>

              {brandRow && (
                <FilterRow label={labels.brand}>
                  {groups.map((g) => (
                    <FilterPill
                      key={g.brand._id}
                      active={selectedBrands.has(g.brand.slug ?? "")}
                      onClick={() => toggleCsv("brand", g.brand.slug ?? "")}
                    >
                      {g.brand.name}
                    </FilterPill>
                  ))}
                </FilterRow>
              )}

              {kwRow && (
                <FilterRow label={labels.kwRange}>
                  {activeBuckets.map((b) => (
                    <FilterPill
                      key={b.id}
                      active={selectedKw.has(b.id)}
                      onClick={() => toggleCsv("kw", b.id)}
                    >
                      <span className="font-mono">{kwLabel(b.id)}</span>
                    </FilterPill>
                  ))}
                </FilterRow>
              )}

              {phaseRow && (
                <FilterRow label={labels.phase}>
                  {(["single", "three"] as const).map((p) => (
                    <FilterPill
                      key={p}
                      active={selectedPhase === p}
                      onClick={() => setPhase(p)}
                    >
                      {phaseLabel(p)}
                    </FilterPill>
                  ))}
                </FilterRow>
              )}

              <span className="text-caption text-mist-400 ml-auto inline-flex items-center gap-3 font-mono">
                {productCountLabel(resultCount)}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-gold-500 hover:text-gold-400 inline-flex items-center gap-1 uppercase tracking-wider"
                  >
                    <IconX size={11} stroke={2} aria-hidden />
                    {locale === "th" ? "ล้าง" : "Clear"}
                  </button>
                )}
              </span>
            </div>
          </Container>
        </section>
      )}

      {/* ── Brand-grouped grid ─────────────────────────────────── */}
      <section>
        <Container className="py-12">
          {resultCount === 0 ? (
            <div className="border-mist-800/60 bg-forest-800/40 text-mist-400 flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
              <p>
                {locale === "th"
                  ? "ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก"
                  : "No products match these filters."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="border-mist-400/30 text-mist-50 hover:border-mist-400/60 hover:bg-mist-50/5 rounded-full border px-4 py-2 font-medium"
              >
                {locale === "th" ? "ล้างตัวกรอง" : "Clear filters"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {filteredGroups.map(({ brand, products }) => (
                <div key={brand._id}>
                  <div className="border-mist-800/40 mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {brand.logo ? (
                        <BrandLogoBadge
                          logo={brand.logo}
                          name={brand.name}
                          size="md"
                        />
                      ) : (
                        <>
                          <MonoLabel tone="mist">
                            _{(brand.name ?? "").toUpperCase()}
                          </MonoLabel>
                          <span className="text-h3 text-mist-50 font-medium">
                            {brand.name}
                          </span>
                        </>
                      )}
                      {brand.authorizedDistributor && (
                        <Badge variant="authorized">
                          ★ {authorizedBadgeLabel}
                        </Badge>
                      )}
                    </div>
                    <span className="text-caption text-mist-400 font-mono">
                      {productCountLabel(products.length)}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                      <li key={p._id}>
                        <ProductCard {...p.card} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function csvSet(raw: string | null): Set<string> {
  return new Set(raw ? raw.split(",").filter(Boolean) : []);
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-mist-400">{label}</span>
      {children}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-caption inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors duration-150 ${
        active
          ? "bg-gold-500 text-forest-900 font-medium"
          : "border-mist-400/20 text-mist-50 hover:border-mist-400/50 hover:bg-mist-50/5 border"
      }`}
    >
      {children}
    </button>
  );
}
