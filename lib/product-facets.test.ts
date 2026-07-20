/**
 * Facet parser tests, pinned to real shapes from the production Sanity
 * dataset (2026-07): Huawei inverters with "Nominal AC active power" in W,
 * the SmartLogger whose only wattages are consumption figures, grouped
 * SKUs spanning several ratings, and kWh battery rows that must never be
 * read as kW power.
 *
 *   node --test lib/product-facets.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveFacets,
  matchesKwBucket,
  KW_BUCKETS,
} from "./product-facets.ts";

test("spec rating in watts converts to kW", () => {
  const f = deriveFacets({
    title: "SUN2000-100KTL-M2",
    specs: [
      { label: "Grid type", value: "Three-phase (3Φ)" },
      { label: "Nominal AC active power", value: "100,000 W" },
    ],
  });
  assert.equal(f.kwMin, 100);
  assert.equal(f.kwMax, 100);
  assert.equal(f.phase, "three");
});

test("consumption wattages are ignored; model number is the fallback", () => {
  const f = deriveFacets({
    title: "Smart Logger 3000A",
    sku: "SmartLogger3000A",
    specs: [
      { label: "Power consumption", value: "Typical 8 W · Max 15 W" },
      { label: "AC power supply", value: "100–240 V AC" },
    ],
  });
  // No rating spec, and "3000A" is not a K-pattern → unrated.
  assert.equal(f.kwMin, null);
  assert.equal(f.kwMax, null);
});

test("grouped SKU spans a rating range", () => {
  const f = deriveFacets({ title: "SUN2000-12/15/17/20/25K-MB0" });
  assert.equal(f.kwMin, 12);
  assert.equal(f.kwMax, 25);
});

test("KTL model number parses without specs", () => {
  const f = deriveFacets({ title: "Inverter Accessory (3/5KTL-L1)" });
  assert.equal(f.kwMin, 3);
  assert.equal(f.kwMax, 5);
});

test("kWh energy values are never read as kW power", () => {
  const f = deriveFacets({
    title: "LUNA2000-5-S0",
    specs: [{ label: "Rated capacity", value: "5 kWh" }],
  });
  // The only unit present is kWh; the model "2000-5" has no K suffix.
  assert.equal(f.kwMin, null);
});

test("watt-class model numbers (micro inverters) parse", () => {
  const f = deriveFacets({ title: "MERC-1100/1300W-P" });
  assert.equal(f.kwMin, 1.1);
  assert.equal(f.kwMax, 1.3);
});

test("single-phase detection from description", () => {
  const f = deriveFacets({
    title: "SUN2000-5KTL-L1",
    shortDescription: "Single-phase residential string inverter",
  });
  assert.equal(f.phase, "single");
  assert.equal(f.kwMin, 5);
});

test("conflicting phase mentions resolve to unknown", () => {
  const f = deriveFacets({
    shortDescription: "Available in single-phase and three-phase variants",
  });
  assert.equal(f.phase, null);
});

test("bucket overlap: a 12–25 kW range hits the 10–50 bucket only", () => {
  const range = { kwMin: 12, kwMax: 25 };
  const hits = KW_BUCKETS.filter((b) => matchesKwBucket(range, b)).map(
    (b) => b.id,
  );
  assert.deepEqual(hits, ["10-50"]);
});

test("bucket overlap: a 5 kW unit hits ≤10 only; unrated hits nothing", () => {
  const five = { kwMin: 5, kwMax: 5 };
  assert.deepEqual(
    KW_BUCKETS.filter((b) => matchesKwBucket(five, b)).map((b) => b.id),
    ["lte10"],
  );
  const unrated = { kwMin: null, kwMax: null };
  assert.equal(
    KW_BUCKETS.some((b) => matchesKwBucket(unrated, b)),
    false,
  );
});

test("boundary rating lands in exactly one bucket", () => {
  const ten = { kwMin: 10, kwMax: 10 };
  assert.deepEqual(
    KW_BUCKETS.filter((b) => matchesKwBucket(ten, b)).map((b) => b.id),
    ["lte10"],
  );
});
