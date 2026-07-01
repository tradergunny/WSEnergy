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
  projectTypeFromKwp,
  projectSizeFromKwp,
  isCompanyRequired,
  ESTIMATOR_SOURCE,
} from "./lead.ts";

const PACKAGES: EnginePackage[] = [
  { _id: "p-3", sizeKw: 3, price: 118_500, phase: "single" },
  { _id: "p-5", sizeKw: 5, price: 139_000, phase: "single" },
];

test("build → encode → parse round-trips a recommended estimate", () => {
  const input = {
    monthlyBillThb: 5000,
    phase: "single" as const,
    dayUsageFraction: 0.5,
    roofAreaSqm: null,
  };
  const result = estimate(input, PACKAGES);
  const payload = buildEstimatePayload(input, result);

  assert.equal(payload.recommendedKwp, 5);
  assert.equal(payload.packageId, "p-5");
  assert.equal(payload.priceThb, 139_000);
  assert.equal(payload.verdict, "recommended");

  const round = parseEstimateParam(encodeEstimateParam(payload));
  assert.deepEqual(round, payload, "survives encode + parse intact");
});

test("Not-yet estimate carries nulls safely (no NaN/Infinity)", () => {
  const input = {
    monthlyBillThb: 5000,
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
  assert.equal(parseEstimateParam(JSON.stringify({ phase: "mars" })), null, "schema-invalid → null");
});

test("vocab maps", () => {
  assert.equal(projectTypeFromKwp(5), "residential");
  assert.equal(projectTypeFromKwp(10), "residential");
  assert.equal(projectTypeFromKwp(20), "ci-rooftop");
  assert.equal(projectSizeFromKwp(5), "<10kw");
  assert.equal(projectSizeFromKwp(10), "<10kw");
  assert.equal(projectSizeFromKwp(30), "10-100kw");
});

test("company is required except for estimator leads", () => {
  assert.equal(isCompanyRequired(ESTIMATOR_SOURCE), false);
  assert.equal(isCompanyRequired(undefined), true, "plain quote form still requires it");
});
