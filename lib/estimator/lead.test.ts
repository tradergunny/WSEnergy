/**
 * Handoff-helper tests: payload build, URL round-trip, vocab maps, and the
 * company-required branch. Runs under `node --test` with native TS.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { estimate, type EnginePackage } from "./engine.ts";
import {
  buildEstimatePayload,
  encodeEstimateParam,
  parseEstimateParam,
  projectTypeFromSegment,
  projectSizeFromKwp,
  isCompanyRequired,
  ESTIMATOR_SOURCE,
} from "./lead.ts";

const PACKAGES: EnginePackage[] = [
  { _id: "p-3", sizeKw: 3, price: 117_000, phase: "single", segment: "residential" },
  { _id: "p-5", sizeKw: 5, price: 163_900, phase: "single", segment: "residential" },
];

test("build → encode → parse round-trips a recommended estimate", () => {
  const input = {
    monthlyBillThb: 5000,
    segment: "residential" as const,
    phase: "single" as const,
    dayUsageFraction: 0.5,
    roofAreaSqm: null,
  };
  const result = estimate(input, PACKAGES);
  const payload = buildEstimatePayload(input, result);

  assert.equal(payload.recommendedKwp, 5);
  assert.equal(payload.packageId, "p-5");
  assert.equal(payload.priceThb, 163_900);
  assert.equal(payload.verdict, "recommended");

  const round = parseEstimateParam(encodeEstimateParam(payload));
  assert.deepEqual(round, payload, "survives encode + parse intact");
});

test("Not-yet estimate carries nulls safely (no NaN/Infinity)", () => {
  const input = {
    monthlyBillThb: 5000,
    segment: "residential" as const,
    phase: "single" as const,
    dayUsageFraction: 0.5,
    roofAreaSqm: 10, // too small → not_yet, no package
  };
  const payload = buildEstimatePayload(input, estimate(input, PACKAGES));
  assert.equal(payload.verdict, "not_yet");
  assert.equal(payload.packageId, null);
  assert.equal(payload.priceThb, null);
  assert.equal(payload.paybackYears, null, "Infinity payback stored as null");
  // and it still round-trips
  assert.deepEqual(parseEstimateParam(encodeEstimateParam(payload)), payload);
});

test("parseEstimateParam rejects malformed input", () => {
  assert.equal(parseEstimateParam(undefined), null);
  assert.equal(parseEstimateParam(""), null);
  assert.equal(parseEstimateParam("not json"), null);
  assert.equal(parseEstimateParam(["a", "b"]), null);
  assert.equal(parseEstimateParam(JSON.stringify({ segment: "mars" })), null, "schema-invalid → null");
});

test("vocab maps", () => {
  assert.equal(projectTypeFromSegment("residential"), "residential");
  assert.equal(projectTypeFromSegment("business"), "ci-rooftop");
  assert.equal(projectSizeFromKwp(5), "<10kw");
  assert.equal(projectSizeFromKwp(10), "<10kw");
  assert.equal(projectSizeFromKwp(30), "10-100kw");
});

test("company is required except for residential estimator leads", () => {
  assert.equal(isCompanyRequired(ESTIMATOR_SOURCE, "residential"), false);
  assert.equal(isCompanyRequired(ESTIMATOR_SOURCE, "business"), true);
  assert.equal(isCompanyRequired(undefined, undefined), true, "plain quote form still requires it");
});
