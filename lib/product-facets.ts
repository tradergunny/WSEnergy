/**
 * Product facet derivation for the catalog filter bar.
 *
 * Sanity products carry no structured kW/phase fields — ratings live in
 * free-text spec rows ("Nominal AC active power: 100,000 W") and in model
 * numbers ("SUN2000-100KTL-M2", "3/5KTL-L1"). This module derives a
 * conservative [kwMin, kwMax] rating range and a grid phase per product so
 * the category page can filter without schema changes.
 *
 * Grouped SKUs ("SUN2000-12/15/17/20/25K-MB0") span several ratings, so a
 * product's kW facet is a range; a filter bucket matches when the ranges
 * overlap. Unknown ratings stay null and are excluded only while a kW
 * filter is active.
 */

export type Phase = "single" | "three";

export type ProductFacets = {
  kwMin: number | null;
  kwMax: number | null;
  phase: Phase | null;
};

export type FacetSource = {
  title?: string | null;
  sku?: string | null;
  shortDescription?: string | null;
  specs?: { label?: string | null; value?: string | null }[] | null;
};

/** Spec labels that describe a power RATING (not consumption or energy). */
const RATING_LABEL = /(rated|nominal|max(imum)?|output|ac)\s*(ac\s*)?(active\s*)?power|power\s*rating|rated\s*capacity|charging\s*power/i;
const EXCLUDED_LABEL = /consumption|standby|loss|idle|aux/i;

/** "100,000 W" / "15 kW" — never "5 kWh" (energy, not power). */
const POWER_VALUE = /([\d][\d,.]*)\s*(k?)W\b(?!h)/gi;

/** Model-number capacity: "100KTL", "5KTL-L1", "12/15/17/20/25K-MB0", "1300W". */
const MODEL_K_PATTERN = /((?:\d+(?:\.\d+)?\/)*\d+(?:\.\d+)?)\s*K(?:TL|W)?\b/gi;
const MODEL_W_PATTERN = /((?:\d{3,}(?:\/)?)+)\s*W\b(?!h)/gi;

const THREE_PHASE = /three[\s-]?phase|3[\s-]?phase|3\s*Φ|\b3P\b|สามเฟส/i;
const SINGLE_PHASE = /single[\s-]?phase|1[\s-]?phase|1\s*Φ|\b1P\b|เฟสเดียว/i;

function toKw(raw: string, unit: string): number | null {
  const n = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  const kw = unit.toLowerCase() === "k" ? n : n / 1000;
  // Ratings outside 0.1 kW – 10 MW are parse noise, not products we sell.
  if (kw < 0.1 || kw > 10_000) return null;
  return kw;
}

function specRatingsKw(specs: FacetSource["specs"]): number[] {
  const out: number[] = [];
  for (const row of specs ?? []) {
    const label = row?.label ?? "";
    if (!RATING_LABEL.test(label) || EXCLUDED_LABEL.test(label)) continue;
    for (const m of (row?.value ?? "").matchAll(POWER_VALUE)) {
      const kw = toKw(m[1], m[2]);
      if (kw !== null) out.push(kw);
    }
  }
  return out;
}

function modelRatingsKw(title: string, sku: string): number[] {
  const text = `${title} ${sku}`;
  const out: number[] = [];
  for (const m of text.matchAll(MODEL_K_PATTERN)) {
    for (const part of m[1].split("/")) {
      const kw = toKw(part, "k");
      if (kw !== null) out.push(kw);
    }
  }
  if (out.length === 0) {
    for (const m of text.matchAll(MODEL_W_PATTERN)) {
      for (const part of m[1].split("/")) {
        const kw = toKw(part, "");
        if (kw !== null) out.push(kw);
      }
    }
  }
  return out;
}

export function deriveFacets(source: FacetSource): ProductFacets {
  const title = source.title ?? "";
  const sku = source.sku ?? "";

  // Spec rows are authoritative; model numbers are the fallback.
  let ratings = specRatingsKw(source.specs);
  if (ratings.length === 0) ratings = modelRatingsKw(title, sku);

  const kwMin = ratings.length ? Math.min(...ratings) : null;
  const kwMax = ratings.length ? Math.max(...ratings) : null;

  const blob = [
    source.shortDescription ?? "",
    ...(source.specs ?? []).map((s) => `${s?.label ?? ""} ${s?.value ?? ""}`),
  ].join(" ");
  const three = THREE_PHASE.test(blob);
  const single = SINGLE_PHASE.test(blob);
  const phase: Phase | null =
    three && !single ? "three" : single && !three ? "single" : null;

  return { kwMin, kwMax, phase };
}

/** UI buckets for the kW pill row. Bounds in kW; open-ended where absent. */
export type KwBucket = { id: string; min?: number; max?: number };

export const KW_BUCKETS: KwBucket[] = [
  { id: "lte10", max: 10 },
  { id: "10-50", min: 10, max: 50 },
  { id: "50-150", min: 50, max: 150 },
  { id: "gt150", min: 150 },
];

/** A product matches a bucket when its [kwMin, kwMax] range overlaps it. */
export function matchesKwBucket(
  facets: Pick<ProductFacets, "kwMin" | "kwMax">,
  bucket: KwBucket,
): boolean {
  if (facets.kwMin === null || facets.kwMax === null) return false;
  const lo = bucket.min ?? 0;
  const hi = bucket.max ?? Number.POSITIVE_INFINITY;
  return facets.kwMax > lo && facets.kwMin <= hi;
}
