/**
 * Engine unit tests (ROADMAP feature 3 verification gate).
 *
 * The headline gate: reproduce PEA's public Solar Calculator on the team's four
 * captured benchmark runs — system size, price, savings, payback, bill-offset %,
 * and the environmental figures (CO₂ / fuel oil / trees). The rest pin the
 * verdict logic (all three tiers + every override), the caps (roof, phase), and
 * the no-NaN guards.
 *
 * Runs on Node 24's built-in runner with native TS type-stripping — no deps:
 *   node --test lib/estimator/engine.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import { estimate, billToAnnualKwh, roofAreaToMaxKwp, type EnginePackage } from "./engine.ts";

// ── Fixtures: the seeded PEA ladder (scripts/seed-solar-packages.mjs) ──
const panels = (kw: number) => Math.round((kw * 1000) / 590);
const pkg = (sizeKw: number, price: number, phase: EnginePackage["phase"]): EnginePackage => ({
  sizeKw,
  price,
  phase,
  panelCount: panels(sizeKw),
});

const PACKAGES: EnginePackage[] = [
  pkg(3, 118_500, "single"), // PEA benchmark
  pkg(5, 139_000, "single"), // PEA benchmark
  // 3-phase 5 kW is a ROOF-ONLY tier: bill-sizing floors three-phase at 10 kW
  // (see the ฿9,000 3-phase case → 10 kW), so 5 kW appears only when a small
  // roof caps below 10 kWp (see the ฿40,000 / 60 m² case → 5 kW).
  pkg(5, 163_900, "three"), // PEA benchmark (roof-constrained)
  pkg(10, 214_400, "three"), // PEA benchmark
  pkg(15, 316_500, "three"), // PEA benchmark
  pkg(20, 388_200, "three"), // PEA benchmark
];

/** Assert `actual` is within `tolPct`% of `expected`. */
function approx(actual: number, expected: number, tolPct: number, label: string) {
  const rel = Math.abs(actual - expected) / Math.abs(expected);
  assert.ok(
    rel <= tolPct / 100,
    `${label}: ${actual} not within ${tolPct}% of ${expected} (off by ${(rel * 100).toFixed(2)}%)`,
  );
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ───────────────────────── The PEA parity gate ─────────────────────────
// Four benchmark runs the team captured from peasolar.pea.co.th. Each asserts
// the size + price exactly, the displayed payback/offset/env figures at PEA's
// own rounding, and the money within a hair.

const BENCHMARKS = [
  {
    name: "2,000 m² · ฿15,000 · 3-phase · 60% day → 15 kW",
    input: { monthlyBillThb: 15_000, phase: "three", dayUsageFraction: 0.6, roofAreaSqm: 2000 },
    kw: 15,
    price: 316_500,
    monthlySavings: 7200,
    annualSavings: 86_400,
    lifetime: 2_160_000,
    offsetPct: 48.0,
    payback: 3.7,
    co2: 7482,
    fuelOil: 3299,
    trees: 121,
  },
  {
    name: "150 m² · ฿8,230 · 1-phase · 70% day → 5 kW",
    input: { monthlyBillThb: 8230, phase: "single", dayUsageFraction: 0.7, roofAreaSqm: 150 },
    kw: 5,
    price: 139_000,
    monthlySavings: 2400,
    annualSavings: 28_800,
    lifetime: 720_000,
    offsetPct: 29.2,
    payback: 4.8,
    co2: 2494,
    fuelOil: 1100,
    trees: 40,
  },
  {
    name: "825 m² · ฿26,750 · 1-phase · 75% day → 5 kW (capped)",
    input: { monthlyBillThb: 26_750, phase: "single", dayUsageFraction: 0.75, roofAreaSqm: 825 },
    kw: 5,
    price: 139_000,
    monthlySavings: 2400,
    annualSavings: 28_800,
    lifetime: 720_000,
    offsetPct: 9.0,
    payback: 4.8,
    co2: 2494,
    fuelOil: 1100,
    trees: 40,
  },
  {
    name: "1,200 m² · ฿52,000 · 3-phase · 63% day → 20 kW (capped)",
    input: { monthlyBillThb: 52_000, phase: "three", dayUsageFraction: 0.63, roofAreaSqm: 1200 },
    kw: 20,
    price: 388_200,
    monthlySavings: 9600,
    annualSavings: 115_200,
    lifetime: 2_880_000,
    offsetPct: 18.5,
    payback: 3.4,
    co2: 9976,
    fuelOil: 4399,
    trees: 161,
  },
  {
    // ideal ~12.95 kWp → rounds to the NEAREST tier, 15 (not down to 10). Pins
    // the 10/15 boundary from above (see the sizing-ladder test for the run of
    // 3-phase bills that bracket every boundary).
    name: "2,000 m² · ฿14,500 · 3-phase · 50% day → 15 kW (nearest, production-capped)",
    input: { monthlyBillThb: 14_500, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: 2000 },
    kw: 15,
    price: 316_500,
    monthlySavings: 7200,
    annualSavings: 86_400,
    lifetime: 2_160_000,
    offsetPct: 49.7,
    payback: 3.7,
    co2: 7482,
    fuelOil: 3299,
    trees: 121,
  },
  {
    // ฿9,000 (ideal ~8.0) rounds UP to 10. The 10 kW production (13,714 kWh)
    // exceeds the daytime load (12,857 kWh), so savings track the LOAD, not
    // production: monthly savings = exactly half the ฿9,000 bill.
    name: "2,000 m² · ฿9,000 · 3-phase · 50% day → 10 kW (load-capped)",
    input: { monthlyBillThb: 9000, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: 2000 },
    kw: 10,
    price: 214_400,
    monthlySavings: 4500,
    annualSavings: 54_000,
    lifetime: 1_350_000,
    offsetPct: 50.0,
    payback: 4.0,
    co2: 4676,
    fuelOil: 2062,
    trees: 76,
  },
  {
    name: "2,000 m² · ฿4,000 · 1-phase · 50% day → 3 kW",
    input: { monthlyBillThb: 4000, phase: "single", dayUsageFraction: 0.5, roofAreaSqm: 2000 },
    kw: 3,
    price: 118_500,
    monthlySavings: 1440,
    annualSavings: 17_280,
    lifetime: 432_000,
    offsetPct: 36.0,
    payback: 6.9,
    co2: 1496,
    fuelOil: 660,
    trees: 24,
  },
] as const;

for (const b of BENCHMARKS) {
  test(`PEA parity — ${b.name}`, () => {
    const r = estimate(b.input, PACKAGES);

    // Sizing + price: exact.
    assert.equal(r.recommendedKwp, b.kw, "recommended size");
    assert.equal(r.priceThb, b.price, "starting price");

    // Money: PEA's displayed figures at PEA's rounding.
    assert.equal(Math.round(r.monthlySavingsThb), b.monthlySavings, "monthly bill reduction");
    assert.equal(Math.round(r.annualSavingsThb), b.annualSavings, "annual savings");
    approx(r.lifetimeSavingsThb, b.lifetime, 0.1, "25-yr savings");
    assert.equal(round1(r.billOffsetPercent), b.offsetPct, "bill-offset %");
    assert.equal(round1(r.paybackYears), b.payback, "payback years");

    // Environmental: PEA's displayed integers.
    assert.equal(Math.round(r.annualCo2SavedKg), b.co2, "CO₂ kg/yr");
    assert.equal(Math.round(r.annualFuelOilSavedLitres), b.fuelOil, "fuel oil L/yr");
    assert.equal(Math.round(r.treesEquivalent), b.trees, "trees (10-yr)");

    assert.equal(r.verdict, "recommended");

    // No NaN/undefined leaked anywhere.
    for (const [k, v] of Object.entries(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `${k} is finite`);
    }
  });
}

// Roof sweep against PEA: a ฿40,000 3-phase bill wants ~42 kWp on load alone, so
// the ROOF binds. PEA's roof→kW is tighter than the naive "75% rule" — the sweep
// (60→5, 75→10, 120→15, 180→20) pins ~7.5 m²/kWp (USABLE_ROOF_FRACTION 0.6).
const ROOF_SWEEP = [
  { roof: 60, kw: 5, price: 163_900, roofLimited: true },
  { roof: 75, kw: 10, price: 214_400, roofLimited: true },
  { roof: 120, kw: 15, price: 316_500, roofLimited: true },
  // 180 m² → roof cap 24 kWp > the 20 kWp phase cap, so PHASE binds here, not
  // the roof — size is still 20, but roofLimited is false.
  { roof: 180, kw: 20, price: 388_200, roofLimited: false },
] as const;

for (const s of ROOF_SWEEP) {
  test(`roof cap matches PEA (฿40,000 3-phase, ${s.roof} m² → ${s.kw} kW)`, () => {
    const r = estimate(
      { monthlyBillThb: 40_000, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: s.roof },
      PACKAGES,
    );
    assert.equal(r.recommendedKwp, s.kw, `${s.roof} m² caps at ${s.kw} kW, like PEA`);
    assert.equal(r.priceThb, s.price);
    assert.equal(r.roofLimited, s.roofLimited);
  });
}

// Nearest-tier sizing ladder: a run of three-phase bills (huge roof, so load
// binds) that bracket every tier boundary. ฿6,000/฿8,000 round to 5, ฿9,000/
// ฿12,000 to 10, ฿15,000 to 15 — proving round-to-NEAREST, not snap-down (which
// would put ฿9,000's ideal ~8 kWp on 5) nor round-up (which would put ฿8,000 on
// 10). This is the rule the ฿6,000→5 vs ฿9,000→10 split forced.
const SIZING_LADDER = [
  { bill: 6000, kw: 5, price: 163_900 },
  { bill: 8000, kw: 5, price: 163_900 },
  { bill: 9000, kw: 10, price: 214_400 },
  { bill: 12_000, kw: 10, price: 214_400 },
  { bill: 15_000, kw: 15, price: 316_500 },
] as const;

for (const s of SIZING_LADDER) {
  test(`three-phase nearest-tier sizing (฿${s.bill} · 50% → ${s.kw} kW)`, () => {
    const r = estimate(
      { monthlyBillThb: s.bill, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: 2000 },
      PACKAGES,
    );
    assert.equal(r.recommendedKwp, s.kw, `฿${s.bill} rounds to ${s.kw} kW`);
    assert.equal(r.priceThb, s.price);
    assert.equal(r.roofLimited, false, "huge roof — load binds, not roof");
  });
}

// At a tier boundary, PEA sizes on the optimistic DESIGN yield (1,400) and snaps
// DOWN, so a bill whose "ideal" is a hair over 20 kW still lands on 15 kW.
test("tier-boundary sizing matches PEA (฿19,232 @ 50% 3-phase → 15 kW)", () => {
  const r = estimate(
    { monthlyBillThb: 19_232, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: 325 },
    PACKAGES,
  );
  assert.equal(r.recommendedKwp, 15, "snaps down to 15 kW like PEA, not up to 20");
  assert.equal(r.priceThb, 316_500);
  assert.equal(Math.round(r.monthlySavingsThb), 7200, "reports 15 kW savings");
});

// ───────────────────────── Helper unit checks ──────────────────────────

test("billToAnnualKwh divides by the all-in tariff", () => {
  approx(billToAnnualKwh(5000), 14_285.7, 0.1, "฿5,000 → ~14,286 kWh/yr");
  assert.equal(billToAnnualKwh(0), 0);
  assert.equal(billToAnnualKwh(-100), 0, "negative bill clamps to 0");
});

test("roofAreaToMaxKwp applies usable fraction ÷ area-per-kWp", () => {
  // PEA-calibrated ~7.5 m²/kWp gross: 60 m² × 0.6 / 4.5 = 8 kWp
  approx(roofAreaToMaxKwp(60), 8, 0.01, "60 m² → 8 kWp");
});

// ───────────────────────── Verdict tiers ───────────────────────────────

test("always recommends when a system fits; reason tracks payback (sales tool)", () => {
  // One 5 kW single-phase package, price varied to span every payback band.
  // Fixed chain: ฿5,000 + 50% day → ~6,857 kWh offset → ~฿28,800/yr saved.
  const at = (price: number) =>
    estimate({ monthlyBillThb: 5000, phase: "single", dayUsageFraction: 0.5 }, [
      pkg(5, price, "single"),
    ]);

  const great = at(28_800 * 5); // ~5.0-yr payback
  assert.equal(great.verdict, "recommended");
  assert.equal(great.verdictReason, "great_payback");

  const ok = at(28_800 * 9); // ~9.0-yr payback — still a recommend
  assert.equal(ok.verdict, "recommended");
  assert.equal(ok.verdictReason, "ok_payback");

  const slow = at(28_800 * 15); // ~15-yr payback — still a recommend, reason flags it
  assert.equal(slow.verdict, "recommended");
  assert.equal(slow.verdictReason, "slow_payback");
});

// ───────────────────────── Structural overrides ────────────────────────

test("roof too small for a viable system → not_yet/roof_too_small", () => {
  const r = estimate(
    { monthlyBillThb: 5000, phase: "single", dayUsageFraction: 0.5, roofAreaSqm: 10 },
    PACKAGES,
  );
  assert.equal(r.verdict, "not_yet");
  assert.equal(r.verdictReason, "roof_too_small");
  assert.equal(r.package, null, "never recommends a system the roof can't hold");
  assert.equal(r.recommendedKwp, 0);
});

test("small daytime use still recommends the smallest system (sales tool)", () => {
  const r = estimate(
    { monthlyBillThb: 5000, phase: "single", dayUsageFraction: 0.15 },
    PACKAGES,
  );
  // ideal ≈ 1.6 kWp is below the 3 kW floor, but we still recommend rather than
  // turning the customer away — snapping to the smallest fitting tier.
  assert.ok(r.idealKwp < 3);
  assert.equal(r.recommendedKwp, 3, "smallest fitting tier");
  assert.equal(r.verdict, "recommended");
});

test("no daytime offset (0% day) → not_yet/low_daytime_offset", () => {
  const r = estimate(
    { monthlyBillThb: 5000, phase: "single", dayUsageFraction: 0 },
    PACKAGES,
  );
  // All consumption at night → solar saves nothing → nothing to recommend yet.
  assert.equal(r.annualSavingsThb, 0);
  assert.equal(r.verdict, "not_yet");
  assert.equal(r.verdictReason, "low_daytime_offset");
});

test("roof-limited but still viable → recommended + roofLimited flag", () => {
  const r = estimate(
    { monthlyBillThb: 16_000, phase: "three", dayUsageFraction: 0.5, roofAreaSqm: 90 },
    PACKAGES,
  );
  // load wants 15 kW (ideal ~14.3), but a 90 m² roof caps at 12 kWp (90 × 0.6 /
  // 4.5) → the roof pulls it down to the 10 kW tier that fits.
  assert.equal(r.recommendedKwp, 10, "roof pulls the 15 kW load pick down to 10 kW");
  assert.equal(r.roofLimited, true, "roof is the binding constraint");
  assert.equal(r.verdict, "recommended", "still pays back fast despite being roof-capped");
});

test("three-phase sizing is capped at 20 kWp (PEA program limit)", () => {
  const r = estimate(
    { monthlyBillThb: 30_000, phase: "three", dayUsageFraction: 0.6 },
    PACKAGES,
  );
  // ideal ~37.5 kWp, but PEA caps three-phase at 20.
  assert.equal(r.phaseCapKwp, 20, "three-phase program cap");
  assert.equal(r.recommendedKwp, 20, "snaps to the 20 kW ceiling");
  assert.equal(r.verdict, "recommended");
});

// ───────────────────────── Guards ──────────────────────────────────────

test("zero bill yields a safe, finite, not_yet result (no NaN)", () => {
  const r = estimate(
    { monthlyBillThb: 0, phase: "single", dayUsageFraction: 0.5 },
    PACKAGES,
  );
  assert.equal(r.annualSavingsThb, 0);
  assert.equal(r.billOffsetPercent, 0);
  assert.equal(r.paybackYears, Infinity, "no savings → Infinity, not NaN");
  assert.equal(r.verdict, "not_yet");
});
