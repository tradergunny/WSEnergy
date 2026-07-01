/**
 * Solar Rooftop Estimator — pure computation engine (ROADMAP feature 3).
 *
 * A faithful re-implementation of PEA's public Solar Calculator
 * (peasolar.pea.co.th), reverse-engineered from four benchmark runs (see
 * constants.ts + engine.test.ts), plus the install/skip verdict PEA lacks:
 *
 *   monthly bill → annual kWh → daytime-offsettable kWh → ideal system size
 *     → cap by roof area + connection phase → round to the NEAREST package tier
 *     → production → self-consumed savings → payback + 25-yr + environmental
 *     → 3-tier verdict (Recommended / Worth considering / Not yet).
 *
 * PEA's model is driven purely by PHASE (no customer-segment input). Single-phase
 * spans 3–5 kWp, three-phase 5–20 kWp; the ideal size (daytime kWh ÷ design yield)
 * is rounded to the NEAREST available tier — ฿6,000 3-phase → 5 kW, ฿9,000 → 10,
 * ฿15,000 → 15. Outputs are linear in system size ONLY while the system is the
 * binding constraint (production ≤ daytime load): ฿480/kWp·mo saved, 498.8
 * kg/kWp·yr CO₂, ~220 L/kWp·yr fuel oil, ~8.05 trees/kWp (10-yr). When the chosen
 * tier out-produces the daytime load (e.g. ฿9,000 3-phase → 10 kW), savings/CO₂/
 * fuel instead track the *daytime load* — the offset is min(production, daytime
 * kWh). This self-consumption cap is the whole model; both sides are benchmarked.
 *
 * Design rules (ADR 0002):
 *  - PURE. The only import is `./constants`. Packages are passed IN as an
 *    argument, so this module never touches Sanity, the network, or env — which
 *    lets the React island run it on every keystroke AND lets the unit test
 *    inject fixtures and run under `node --test` with no mocking.
 *  - CONSERVATIVE. No battery, so solar only offsets *daytime* load; we never
 *    credit grid export. The chosen tier may out-produce that load (nearest-tier
 *    rounding can round up), but savings/env are always capped at the daytime
 *    load — never crediting exported surplus.
 */

import {
  ANNUAL_DEGRADATION_FRACTION,
  AREA_PER_KWP_SQM,
  CO2_KG_PER_TREE_10YR,
  FUEL_OIL_LITRES_PER_KWH,
  GRID_CO2_KG_PER_KWH,
  MIN_VIABLE_KWP,
  PHASE_MAX_KWP,
  PV_SIZING_YIELD_KWH_PER_KWP_YEAR,
  PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR,
  SYSTEM_LIFETIME_YEARS,
  TARIFF_THB_PER_KWH,
  USABLE_ROOF_FRACTION,
  VERDICT_PAYBACK_GREAT_YEARS,
  VERDICT_PAYBACK_OK_YEARS,
  // Explicit .ts extension so this module (and its test) run under Node's
  // native TypeScript loader; bundler resolution still accepts it for the app.
} from "./constants.ts";

// ──────────────────────────────── Types ────────────────────────────────

export type Phase = "single" | "three";

/**
 * The minimal package shape the engine needs. Structurally compatible with
 * `SolarPackageRow` (lib/sanity/packages.ts) — the client island passes those
 * straight in — but declared locally so the engine stays Sanity-free and pure.
 * `phase` may be "both" (a tier valid for either connection). The estimator is
 * phase-driven (PEA-style), so a package's `segment`, if present, is ignored.
 */
export type EnginePackage = {
  _id?: string;
  sizeKw: number;
  price: number;
  phase: Phase | "both";
  panelCount?: number | null;
  /** Display-only passthrough (the engine doesn't compute on it). */
  includedComponents?: string[] | null;
};

export type EstimatorInput = {
  /** Average monthly electricity bill, THB. */
  monthlyBillThb: number;
  /** Electrical connection — the only thing that caps system size (PEA-style). */
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
  | "no_package"; // no package matches the phase (config gap)

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
  /** Largest system the connection phase allows, kWp. */
  phaseCapKwp: number;
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
  /** Share of the monthly bill the savings cover (0–100). */
  billOffsetPercent: number;
  /** Years to recoup price from savings; Infinity when there are no savings. */
  paybackYears: number;
  lifetimeSavingsThb: number;

  // —— environment ——
  annualCo2SavedKg: number;
  /** Fuel-oil-equivalent generation avoided per year, litres (PEA metric). */
  annualFuelOilSavedLitres: number;
  /** Trees-planted equivalent on PEA's 10-year basis. */
  treesEquivalent: number;
  lifetimeCo2SavedKg: number;

  // —— verdict ——
  verdict: Verdict;
  verdictReason: VerdictReason;
};

// ───────────────────────────── Sub-functions ───────────────────────────

const EPS = 1e-6;

/** Bill (THB/mo) → annual consumption (kWh), via the all-in tariff. */
export function billToAnnualKwh(monthlyBillThb: number): number {
  const bill = Math.max(0, monthlyBillThb);
  return (bill * 12) / TARIFF_THB_PER_KWH;
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

/** Packages valid for this connection phase ("both" matches either). */
function compatiblePackages(packages: EnginePackage[], phase: Phase): EnginePackage[] {
  return packages.filter((p) => p.phase === phase || p.phase === "both");
}

/**
 * Pick the package to recommend.
 *  - Reject anything above the hard cap (roof ∧ phase) — never recommend a
 *    system that physically won't fit or connect.
 *  - Among what fits, pick the tier NEAREST to the ideal size. PEA rounds a bill
 *    to the closest package, not down: ฿9,000 3-phase / 50% (ideal ~8 kWp) → 10,
 *    but ฿6,000 (ideal ~5.4) → 5. Ties break DOWN (conservative).
 *  - When the ideal is far above every fitting tier (roof- or phase-limited),
 *    "nearest" naturally lands on the largest fitting tier.
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

  // Ascending order + strict-less comparison ⇒ on a tie the smaller tier wins.
  let best = fitting[0];
  let bestDist = Math.abs(fitting[0].sizeKw - idealKwp);
  for (let i = 1; i < fitting.length; i++) {
    const dist = Math.abs(fitting[i].sizeKw - idealKwp);
    if (dist < bestDist - EPS) {
      best = fitting[i];
      bestDist = dist;
    }
  }
  return best;
}

// ──────────────────────────────── Engine ───────────────────────────────

/**
 * Run the full estimate. Pure: same inputs + packages → same result.
 */
export function estimate(input: EstimatorInput, packages: EnginePackage[]): EstimatorResult {
  const dayFraction = Math.min(1, Math.max(0, input.dayUsageFraction));
  const monthlyBillThb = Math.max(0, input.monthlyBillThb);

  // 1. Demand → the slice solar can offset (daytime only; no battery). Sizing
  //    uses the optimistic DESIGN yield (PEA sizes generously) and rounds to the
  //    nearest tier; production + savings below use the conservative REPORTING
  //    yield.
  const annualKwh = billToAnnualKwh(monthlyBillThb);
  const daytimeKwh = annualKwh * dayFraction;
  const idealKwp = daytimeKwh / PV_SIZING_YIELD_KWH_PER_KWP_YEAR;

  // 2. Caps. Phase always caps (PEA is phase-driven: 1-phase ≤ 5, 3-phase ≤ 20).
  const phaseCapKwp = PHASE_MAX_KWP[input.phase];
  const roofCapKwp =
    input.roofAreaSqm != null && input.roofAreaSqm > 0
      ? roofAreaToMaxKwp(input.roofAreaSqm)
      : null;
  const hardCapKwp = Math.min(roofCapKwp ?? Infinity, phaseCapKwp);

  // 3. Round to the nearest real tier within the hard cap.
  const pool = compatiblePackages(packages, input.phase);
  const chosen = pickPackage(pool, idealKwp, hardCapKwp);

  const recommendedKwp = chosen?.sizeKw ?? 0;
  const priceThb = chosen?.price ?? null;
  const panelCount = chosen?.panelCount ?? null;

  // Roof is the *binding* constraint when it forces a smaller tier than the load
  // (phase-capped only) would otherwise get — compare the two picks directly, so
  // it's correct even when nearest-rounding lifts the load pick above the ideal.
  const loadChoice = pickPackage(pool, idealKwp, phaseCapKwp);
  const roofLimited =
    chosen != null && loadChoice != null && chosen.sizeKw < loadChoice.sizeKw - EPS;

  // 4. Energy + money. Self-consumption is capped by daytime load (no export
  //    credit); a snapped-down system self-consumes everything it makes.
  const annualProductionKwh = recommendedKwp * PV_SPECIFIC_YIELD_KWH_PER_KWP_YEAR;
  const annualOffsetKwh = Math.min(annualProductionKwh, daytimeKwh);

  const annualSavingsThb = annualOffsetKwh * TARIFF_THB_PER_KWH;
  const monthlySavingsThb = annualSavingsThb / 12;
  const billOffsetPercent =
    monthlyBillThb > 0 ? (monthlySavingsThb / monthlyBillThb) * 100 : 0;
  const lifetimeSavingsThb = annualSavingsThb * lifetimeFactor();
  const paybackYears =
    priceThb != null && annualSavingsThb > 0 ? priceThb / annualSavingsThb : Infinity;

  // 5. Environment — based on grid energy actually displaced (PEA metrics).
  const annualCo2SavedKg = annualOffsetKwh * GRID_CO2_KG_PER_KWH;
  const annualFuelOilSavedLitres = annualOffsetKwh * FUEL_OIL_LITRES_PER_KWH;
  const treesEquivalent = (annualCo2SavedKg * 10) / CO2_KG_PER_TREE_10YR;
  const lifetimeCo2SavedKg = annualCo2SavedKg * SYSTEM_LIFETIME_YEARS;

  // 6. Verdict.
  const { verdict, verdictReason } = decideVerdict({
    chosen,
    roofCapKwp,
    annualSavingsThb,
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
    billOffsetPercent,
    paybackYears,
    lifetimeSavingsThb,
    annualCo2SavedKg,
    annualFuelOilSavedLitres,
    treesEquivalent,
    lifetimeCo2SavedKg,
    verdict,
    verdictReason,
  };
}

/**
 * The verdict. Lean-to-recommend, PEA-style: this is a sales tool, so whenever a
 * real system can be offered AND it saves money, we RECOMMEND it — no soft "not
 * yet" for a small home or a longish payback. We only hold back when a system
 * genuinely can't be offered: nothing fits the roof/phase, or there's no daytime
 * load to offset (no/zero bill, or all-night usage → solar saves nothing).
 *
 * The payback bands no longer change the verdict (always "recommended"); they
 * only pick the honest sub-copy (`verdictReason`) shown under the banner.
 */
function decideVerdict(args: {
  chosen: EnginePackage | null;
  roofCapKwp: number | null;
  annualSavingsThb: number;
  paybackYears: number;
}): { verdict: Verdict; verdictReason: VerdictReason } {
  const { chosen, roofCapKwp, annualSavingsThb, paybackYears } = args;

  // Nothing physically fits — a roof that can't hold a viable system, or no
  // package for the phase. Honest "let's talk", not a recommendation.
  if (!chosen) {
    const reason: VerdictReason =
      roofCapKwp != null && roofCapKwp < MIN_VIABLE_KWP ? "roof_too_small" : "no_package";
    return { verdict: "not_yet", verdictReason: reason };
  }

  // No daytime load to offset (no/zero bill, or all consumption at night) →
  // solar saves nothing, so there's nothing to recommend yet.
  if (annualSavingsThb <= 0) {
    return { verdict: "not_yet", verdictReason: "low_daytime_offset" };
  }

  // A system fits and saves money → recommend it. Reason tracks payback only to
  // pick the right sub-copy.
  const verdictReason: VerdictReason =
    paybackYears <= VERDICT_PAYBACK_GREAT_YEARS
      ? "great_payback"
      : paybackYears <= VERDICT_PAYBACK_OK_YEARS
        ? "ok_payback"
        : "slow_payback";
  return { verdict: "recommended", verdictReason };
}
