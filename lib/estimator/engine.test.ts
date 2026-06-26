/**
 * Engine unit tests (ROADMAP feature 3, Step 2 verification gate).
 *
 * The headline gate: reproduce PEA's published screenshot numbers within
 * tolerance. The rest pin the verdict logic (all three tiers + every override),
 * the caps (roof, phase, business-uncapped), and the no-NaN guards.
 *
 * Runs on Node 24's built-in runner with native TS type-stripping — no deps:
 *   node --test lib/estimator/engine.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import { estimate, billToAnnualKwh, roofAreaToMaxKwp, type EnginePackage } from "./engine.ts";

// ── Fixtures: the seeded production ladder (scripts/seed-solar-packages.mjs) ──
const panels = (kw: number) => Math.round((kw * 1000) / 590);
const pkg = (
  sizeKw: number,
  price: number,
  phase: EnginePackage["phase"],
  segment: EnginePackage["segment"],
): EnginePackage => ({ sizeKw, price, phase, segment, panelCount: panels(sizeKw) });

const PACKAGES: EnginePackage[] = [
  pkg(3, 117_000, "single", "residential"),
  pkg(5, 163_900, "single", "residential"), // PEA reference anchor
  pkg(5, 169_000, "three", "residential"),
  pkg(10, 305_000, "three", "residential"),
  pkg(10, 295_000, "three", "business"),
  pkg(20, 560_000, "three", "business"),
  pkg(30, 810_000, "three", "business"),
  pkg(50, 1_300_000, "three", "business"),
];

/** Assert `actual` is within `tolPct`% of `expected`. */
function approx(actual: number, expected: number, tolPct: number, label: string) {
  const diff = Math.abs(actual - expected);
  const rel = diff / Math.abs(expected);
  assert.ok(
    rel <= tolPct / 100,
    `${label}: ${actual} not within ${tolPct}% of ${expected} (off by ${(rel * 100).toFixed(2)}%)`,
  );
}

// ───────────────────────── The PEA parity gate ─────────────────────────

test("reproduces PEA's screenshot numbers within tolerance", () => {
  // PEA screenshot inputs: ฿5,000/mo, 50% daytime, residential single-phase.
  const r = estimate(
    { monthlyBillThb: 5000, segment: "residential", phase: "single", dayUsageFraction: 0.5 },
    PACKAGES,
  );

  // PEA published outputs → ours must land within 5% (different sourced tariff
  // 4.2 vs PEA's ~4.0 accounts for the small gap).
  assert.equal(r.recommendedKwp, 5, "recommended size matches PEA's 5.0 kW exactly");
  assert.equal(r.priceThb, 163_900, "uses the PEA-anchored 5 kW package price");
  approx(r.annualSavingsThb, 28_800, 5, "annual savings vs PEA ฿28,800");
  approx(r.paybackYears, 5.7, 5, "payback vs PEA 5.7 yr");
  approx(r.lifetimeSavingsThb, 720_000, 5, "25-yr savings vs PEA ฿720,000");
  assert.equal(r.verdict, "recommended");
  assert.equal(r.verdictReason, "great_payback");

  // Pin our own deterministic chain so behaviour can't silently drift.
  approx(r.annualProductionKwh, 7000, 0.01, "production = 5 kW × 1400");
  approx(r.annualOffsetKwh, 7000, 0.01, "fully self-consumed (offset ≤ daytime)");
  approx(r.monthlySavingsThb, 2450, 0.01, "monthly savings");
  approx(r.lifetimeSavingsThb, 735_000, 0.01, "our flat 25-yr savings");
  approx(r.paybackYears, 163_900 / 29_400, 0.01, "our exact payback");

  // Environmental — our sourced factors (intentionally diverge from PEA).
  approx(r.annualCo2SavedKg, 7000 * 0.475, 0.01, "CO₂ at official 0.475 kg/kWh");
  approx(r.annualWaterSavedLitres, 7000 * 1.3, 0.01, "water at 1.3 L/kWh");
  approx(r.treesEquivalent, (7000 * 0.475) / 21.77, 0.01, "tree equivalent");
  approx(r.lifetimeCo2SavedKg, 7000 * 0.475 * 25, 0.01, "lifetime CO₂");

  // No NaN/undefined leaked anywhere.
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === "number") assert.ok(Number.isFinite(v), `${k} is finite`);
  }
});

// ───────────────────────── Helper unit checks ──────────────────────────

test("billToAnnualKwh divides by the segment tariff", () => {
  approx(billToAnnualKwh(5000, "residential"), 14_285.7, 0.1, "฿5,000 → ~14,286 kWh/yr");
  assert.equal(billToAnnualKwh(0, "residential"), 0);
  assert.equal(billToAnnualKwh(-100, "business"), 0, "negative bill clamps to 0");
});

test("roofAreaToMaxKwp applies usable fraction ÷ area-per-kWp", () => {
  // 60 m² × 0.75 / 4.5 = 10 kWp
  approx(roofAreaToMaxKwp(60), 10, 0.01, "60 m² → 10 kWp");
});

// ───────────────────────── Verdict tiers ───────────────────────────────

test("verdict tiers track payback (great / ok / slow)", () => {
  // One 5 kW single-phase package, price varied to land in each band.
  // Fixed chain: ฿5,000 + 50% day → 7,000 kWh offset → ฿29,400/yr saved.
  const at = (price: number) =>
    estimate(
      { monthlyBillThb: 5000, segment: "residential", phase: "single", dayUsageFraction: 0.5 },
      [pkg(5, price, "single", "residential")],
    );

  const great = at(29_400 * 5); // 5.0-yr payback
  assert.equal(great.verdict, "recommended");
  assert.equal(great.verdictReason, "great_payback");

  const ok = at(29_400 * 9); // 9.0-yr payback (7 < x ≤ 12)
  assert.equal(ok.verdict, "worth_considering");
  assert.equal(ok.verdictReason, "ok_payback");

  const slow = at(29_400 * 15); // 15-yr payback (> 12)
  assert.equal(slow.verdict, "not_yet");
  assert.equal(slow.verdictReason, "slow_payback");
});

// ───────────────────────── Structural overrides ────────────────────────

test("roof too small for a viable system → not_yet/roof_too_small", () => {
  const r = estimate(
    {
      monthlyBillThb: 5000,
      segment: "residential",
      phase: "single",
      dayUsageFraction: 0.5,
      roofAreaSqm: 10, // → ~1.67 kWp cap, below MIN_VIABLE 3
    },
    PACKAGES,
  );
  assert.equal(r.verdict, "not_yet");
  assert.equal(r.verdictReason, "roof_too_small");
  assert.equal(r.package, null, "never recommends a system the roof can't hold");
  assert.equal(r.recommendedKwp, 0);
});

test("daytime load too small → not_yet/low_daytime_offset", () => {
  const r = estimate(
    { monthlyBillThb: 5000, segment: "residential", phase: "single", dayUsageFraction: 0.15 },
    PACKAGES,
  );
  // ideal ≈ 1.5 kWp < MIN_VIABLE 3, even though a 3 kW tier is the closest fit.
  assert.ok(r.idealKwp < 3);
  assert.equal(r.verdict, "not_yet");
  assert.equal(r.verdictReason, "low_daytime_offset");
});

test("roof-limited but still viable → recommended + roofLimited flag", () => {
  const r = estimate(
    {
      monthlyBillThb: 8000,
      segment: "residential",
      phase: "single",
      dayUsageFraction: 0.5,
      roofAreaSqm: 25, // → ~4.17 kWp cap; ideal would be ~8.2 kWp
    },
    PACKAGES,
  );
  assert.equal(r.recommendedKwp, 3, "snapped down to the 3 kW tier the roof fits");
  assert.equal(r.roofLimited, true, "roof is the binding constraint");
  assert.equal(r.verdict, "recommended", "still pays back fast despite being roof-capped");
});

test("business sizing is not phase-capped", () => {
  const r = estimate(
    { monthlyBillThb: 30_000, segment: "business", phase: "three", dayUsageFraction: 0.6 },
    PACKAGES,
  );
  assert.equal(r.phaseCapKwp, null, "no program phase cap applied to business");
  assert.equal(r.recommendedKwp, 30, "free to size well above the 10 kW phase limit");
  assert.equal(r.verdict, "recommended");
});

// ───────────────────────── Guards ──────────────────────────────────────

test("zero bill yields a safe, finite, not_yet result (no NaN)", () => {
  const r = estimate(
    { monthlyBillThb: 0, segment: "residential", phase: "single", dayUsageFraction: 0.5 },
    PACKAGES,
  );
  assert.equal(r.annualSavingsThb, 0);
  assert.equal(r.paybackYears, Infinity, "no savings → Infinity, not NaN");
  assert.equal(r.verdict, "not_yet");
});
