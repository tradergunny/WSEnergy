/**
 * Solar Rooftop Estimator — pure computation engine (ROADMAP feature 3, Step 2).
 *
 * Mirrors PEA's calculator chain, then adds the install/skip verdict PEA lacks:
 *
 *   monthly bill → annual kWh → daytime-offsettable kWh → ideal system size
 *     → cap by roof area + connection phase → snap to a real package tier
 *     → production → self-consumed savings → payback + 25-yr + environmental
 *     → 3-tier verdict (Recommended / Worth considering / Not yet).
 *
 * Design rules (ADR 0002):
 *  - PURE. The only import is `./constants`. Packages are passed IN as an
 *    argument, so this module never touches Sanity, the network, or env — which
 *    is what lets the React island run it on every slider tick AND lets the unit
 *    test inject fixtures and run under `node --test` with no mocking.
 *  - CONSERVATIVE. No battery, so solar only offsets *daytime* load; we never
 *    credit grid export (PEA-parity). Snapping is to the largest tier at or
 *    below the ideal size, so a recommended system is always fully self-consumed.
 *
 * The reference case the test pins (PEA screenshot): ฿5,000/mo bill, 50% daytime,
 * residential single-phase → 5.0 kW, ~฿28,800/yr, ~5.7-yr payback, ~฿720k/25yr.
 */

import {
  ANNUAL_DEGRADATION_FRACTION,
  AREA_PER_KWP_SQM,
  GRID_CO2_KG_PER_KWH,
  MIN_VIABLE_KWP,
  PHASE_MAX_KWP,
  PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR,
  SYSTEM_LIFETIME_YEARS,
  TARIFF_THB_PER_KWH,
  TREE_CO2_SEQUESTRATION_KG_PER_TREE_YEAR,
  USABLE_ROOF_FRACTION,
  VERDICT_PAYBACK_GREAT_YEARS,
  VERDICT_PAYBACK_OK_YEARS,
  WATER_SAVED_LITRES_PER_KWH,
  // Explicit .ts extension so this module (and its test) run under Node's
  // native TypeScript loader; bundler resolution still accepts it for the app.
} from "./constants.ts";

// ──────────────────────────────── Types ────────────────────────────────

export type Segment = "residential" | "business";
export type Phase = "single" | "three";

/**
 * The minimal package shape the engine needs. Structurally compatible with
 * `SolarPackageRow` (lib/sanity/packages.ts) — the client island passes those
 * straight in — but declared locally so the engine stays Sanity-free and pure.
 * `phase`/`segment` may be "both" (a tier valid for either) in Sanity data.
 */
export type EnginePackage = {
  _id?: string;
  sizeKw: number;
  price: number;
  phase: Phase | "both";
  segment: Segment | "both";
  panelCount?: number | null;
  /** Display-only passthrough (the engine doesn't compute on it). */
  includedComponents?: string[] | null;
};

export type EstimatorInput = {
  /** Average monthly electricity bill, THB. */
  monthlyBillThb: number;
  segment: Segment;
  phase: Phase;
  /** Share of consumption used during daylight (0–1) — the offsettable portion. */
  dayUsageFraction: number;
  /**
   * Gross roof footprint in m² (drawn polygon or typed). `null`/omitted means
   * "roof not a constraint yet" — used by the typed-area-optional path.
   */
  roofAreaSqm?: number | null;
};

export type Verdict = "recommended" | "worth_considering" | "not_yet";

export type VerdictReason =
  | "great_payback" // payback ≤ GREAT → recommended
  | "ok_payback" // GREAT < payback ≤ OK → worth considering
  | "slow_payback" // payback > OK → not yet
  | "roof_too_small" // roof can't hold a viable (≥ MIN_VIABLE) system
  | "low_daytime_offset" // daytime load too small to justify a viable system
  | "no_package"; // no package matches segment/phase (config gap)

export type EstimatorResult = {
  // —— sizing ——
  /** Chosen package size, kWp (0 when nothing fits). */
  recommendedKwp: number;
  package: EnginePackage | null;
  panelCount: number | null;
  /** Continuous size that would exactly offset daytime load, kWp. */
  idealKwp: number;
  /** Largest system the roof allows, kWp (null when no roof given). */
  roofCapKwp: number | null;
  /** Largest system the connection phase allows, kWp (null for business). */
  phaseCapKwp: number | null;
  /** True when the roof (not load or phase) was the binding constraint. */
  roofLimited: boolean;

  // —— energy ——
  annualProductionKwh: number;
  /** Grid energy actually displaced (self-consumed) — drives savings + env. */
  annualOffsetKwh: number;

  // —— money (THB) ——
  priceThb: number | null;
  monthlySavingsThb: number;
  annualSavingsThb: number;
  /** Years to recoup price from savings; Infinity when there are no savings. */
  paybackYears: number;
  lifetimeSavingsThb: number;

  // —— environment ——
  annualCo2SavedKg: number;
  annualWaterSavedLitres: number;
  treesEquivalent: number;
  lifetimeCo2SavedKg: number;

  // —— verdict ——
  verdict: Verdict;
  verdictReason: VerdictReason;
};

// ───────────────────────────── Sub-functions ───────────────────────────

const EPS = 1e-6;

/** Bill (THB/mo) → annual consumption (kWh), via the segment's all-in tariff. */
export function billToAnnualKwh(monthlyBillThb: number, segment: Segment): number {
  const bill = Math.max(0, monthlyBillThb);
  return (bill * 12) / TARIFF_THB_PER_KWH[segment];
}

/** Largest system the roof footprint can hold, kWp. */
export function roofAreaToMaxKwp(roofAreaSqm: number): number {
  return (Math.max(0, roofAreaSqm) * USABLE_ROOF_FRACTION) / AREA_PER_KWP_SQM;
}

/** Lifetime energy multiplier — Σ over years of (1 − degradation)^year. */
function lifetimeFactor(): number {
  if (ANNUAL_DEGRADATION_FRACTION <= 0) return SYSTEM_LIFETIME_YEARS;
  let sum = 0;
  for (let y = 0; y < SYSTEM_LIFETIME_YEARS; y++) {
    sum += (1 - ANNUAL_DEGRADATION_FRACTION) ** y;
  }
  return sum;
}

/** Packages valid for this segment + phase, with a relaxed fallback by segment. */
function compatiblePackages(
  packages: EnginePackage[],
  segment: Segment,
  phase: Phase,
): EnginePackage[] {
  const bySegment = (p: EnginePackage) => p.segment === segment || p.segment === "both";
  const byPhase = (p: EnginePackage) => p.phase === phase || p.phase === "both";
  const exact = packages.filter((p) => bySegment(p) && byPhase(p));
  // Fall back to segment-only if the phase filter empties (e.g. business+single,
  // where the catalogue only carries three-phase tiers).
  return exact.length > 0 ? exact : packages.filter(bySegment);
}

/**
 * Pick the package to recommend.
 *  - Reject anything above the hard cap (roof ∧ phase) — never recommend a
 *    system that physically won't fit or connect.
 *  - Among what fits, prefer the largest tier at or below the ideal size (full
 *    self-consumption, best payback); if every fitting tier is above ideal, take
 *    the smallest (it will be slightly oversized vs daytime load).
 *  - Return null when nothing fits the hard cap.
 */
function pickPackage(
  pool: EnginePackage[],
  idealKwp: number,
  hardCapKwp: number,
): EnginePackage | null {
  const fitting = pool
    .filter((p) => p.sizeKw <= hardCapKwp + EPS)
    .sort((a, b) => a.sizeKw - b.sizeKw);
  if (fitting.length === 0) return null;

  const atOrBelowIdeal = fitting.filter((p) => p.sizeKw <= idealKwp + EPS);
  return atOrBelowIdeal.length > 0
    ? atOrBelowIdeal[atOrBelowIdeal.length - 1] // largest ≤ ideal
    : fitting[0]; // smallest fitting (slightly oversized)
}

// ──────────────────────────────── Engine ───────────────────────────────

/**
 * Run the full estimate. Pure: same inputs + packages → same result.
 */
export function estimate(input: EstimatorInput, packages: EnginePackage[]): EstimatorResult {
  const dayFraction = Math.min(1, Math.max(0, input.dayUsageFraction));
  const tariff = TARIFF_THB_PER_KWH[input.segment];

  // 1. Demand → the slice solar can offset (daytime only; no battery).
  const annualKwh = billToAnnualKwh(input.monthlyBillThb, input.segment);
  const daytimeKwh = annualKwh * dayFraction;
  const idealKwp = daytimeKwh / PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR;

  // 2. Caps. Phase caps only bind residential (business C&I is bounded by roof
  //    + catalogue, not the program phase limits — see constants).
  const phaseCapKwp = input.segment === "residential" ? PHASE_MAX_KWP[input.phase] : null;
  const roofCapKwp =
    input.roofAreaSqm != null && input.roofAreaSqm > 0
      ? roofAreaToMaxKwp(input.roofAreaSqm)
      : null;
  const hardCapKwp = Math.min(roofCapKwp ?? Infinity, phaseCapKwp ?? Infinity);

  // 3. Snap to a real tier.
  const pool = compatiblePackages(packages, input.segment, input.phase);
  const chosen = pickPackage(pool, idealKwp, hardCapKwp);

  const recommendedKwp = chosen?.sizeKw ?? 0;
  const priceThb = chosen?.price ?? null;
  const panelCount = chosen?.panelCount ?? null;

  // Roof is the *binding* constraint when it's both below the ideal size and
  // tighter than the phase cap.
  const roofLimited =
    roofCapKwp != null &&
    roofCapKwp < idealKwp - EPS &&
    roofCapKwp <= (phaseCapKwp ?? Infinity) + EPS;

  // 4. Energy + money. Self-consumption is capped by daytime load (no export
  //    credit); a snapped-down system self-consumes everything it makes.
  const annualProductionKwh = recommendedKwp * PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR;
  const annualOffsetKwh = Math.min(annualProductionKwh, daytimeKwh);

  const annualSavingsThb = annualOffsetKwh * tariff;
  const monthlySavingsThb = annualSavingsThb / 12;
  const lifetimeSavingsThb = annualSavingsThb * lifetimeFactor();
  const paybackYears =
    priceThb != null && annualSavingsThb > 0 ? priceThb / annualSavingsThb : Infinity;

  // 5. Environment — based on grid energy actually displaced.
  const annualCo2SavedKg = annualOffsetKwh * GRID_CO2_KG_PER_KWH;
  const annualWaterSavedLitres = annualOffsetKwh * WATER_SAVED_LITRES_PER_KWH;
  const treesEquivalent = annualCo2SavedKg / TREE_CO2_SEQUESTRATION_KG_PER_TREE_YEAR;
  const lifetimeCo2SavedKg = annualCo2SavedKg * SYSTEM_LIFETIME_YEARS;

  // 6. Verdict.
  const { verdict, verdictReason } = decideVerdict({
    chosen,
    recommendedKwp,
    idealKwp,
    roofCapKwp,
    paybackYears,
  });

  return {
    recommendedKwp,
    package: chosen,
    panelCount,
    idealKwp,
    roofCapKwp,
    phaseCapKwp,
    roofLimited,
    annualProductionKwh,
    annualOffsetKwh,
    priceThb,
    monthlySavingsThb,
    annualSavingsThb,
    paybackYears,
    lifetimeSavingsThb,
    annualCo2SavedKg,
    annualWaterSavedLitres,
    treesEquivalent,
    lifetimeCo2SavedKg,
    verdict,
    verdictReason,
  };
}

/**
 * The 3-tier verdict. Structural blockers first (nothing fits / roof too small /
 * daytime load too small to justify a viable system), then payback bands.
 */
function decideVerdict(args: {
  chosen: EnginePackage | null;
  recommendedKwp: number;
  idealKwp: number;
  roofCapKwp: number | null;
  paybackYears: number;
}): { verdict: Verdict; verdictReason: VerdictReason } {
  const { chosen, recommendedKwp, idealKwp, roofCapKwp, paybackYears } = args;

  // No tier matched the segment/phase — a catalogue gap, not a customer "no".
  if (!chosen) {
    const reason: VerdictReason =
      roofCapKwp != null && roofCapKwp < MIN_VIABLE_KWP ? "roof_too_small" : "no_package";
    return { verdict: "not_yet", verdictReason: reason };
  }

  // Roof can't hold a viable system.
  if (roofCapKwp != null && roofCapKwp < MIN_VIABLE_KWP - EPS) {
    return { verdict: "not_yet", verdictReason: "roof_too_small" };
  }

  // Daytime-offsettable load is too small to justify even a minimum system —
  // solar would be oversized for how little is used in daylight.
  if (idealKwp < MIN_VIABLE_KWP - EPS || recommendedKwp < MIN_VIABLE_KWP - EPS) {
    return { verdict: "not_yet", verdictReason: "low_daytime_offset" };
  }

  // Payback bands.
  if (paybackYears <= VERDICT_PAYBACK_GREAT_YEARS) {
    return { verdict: "recommended", verdictReason: "great_payback" };
  }
  if (paybackYears <= VERDICT_PAYBACK_OK_YEARS) {
    return { verdict: "worth_considering", verdictReason: "ok_payback" };
  }
  return { verdict: "not_yet", verdictReason: "slow_payback" };
}
